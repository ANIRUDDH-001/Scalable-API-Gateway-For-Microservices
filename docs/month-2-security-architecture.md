# Month 2 — Security Architecture

## Overview

Every request passes through a security pipeline at the API Gateway
before reaching any backend service. No service is reachable without
passing all checks.

## Security Pipeline (in execution order)

```
Request
  │
  ▼
1. X-Request-ID assigned (or reused if client-provided)
  │
  ▼
2. Helmet — sets security headers:
   Content-Security-Policy, Strict-Transport-Security,
   X-Frame-Options, X-Content-Type-Options
  │
  ▼
3. CORS — validates Origin header against ALLOWED_ORIGINS allowlist
   Rejects with 403 if origin not permitted
  │
  ▼
4. Global Rate Limiter — 100 req / 15 min per IP
   Returns 429 if exceeded, includes RateLimit-* headers
  │
  ▼
5. (Auth routes only) Auth Rate Limiter — 10 failed attempts / 10 min
   skipSuccessfulRequests: true — only counts 4xx/5xx
  │
  ▼
6. (Protected routes only) JWT Verification
   Reads Authorization: Bearer <token>
   Verifies signature with JWT_SECRET
   Verifies issuer === 'auth-service'
   Returns 401 if missing, expired, or invalid
  │
  ▼
7. Header stripping — removes client-supplied x-user-*, x-internal-key
  │
  ▼
8. Header injection — sets x-internal-key, x-user-id, x-user-email,
   x-user-role, x-request-id on proxied request
  │
  ▼
9. Upstream service validates x-internal-key
   Returns 403 if missing or wrong
  │
  ▼
10. Service processes request using trusted x-user-* headers
```

## JWT Token Lifecycle

```
1. POST /api/v1/auth/register or /login → auth-service returns accessToken + refreshToken
2. Client stores both tokens
3. Every protected request: Authorization: Bearer <accessToken>
4. When accessToken expires (1h): POST /api/v1/auth/refresh with refreshToken → new accessToken
5. refreshToken expires in 7d — user must re-login
```

## Why JWT at Gateway Only?

Services on the private Docker network are unreachable from the internet.
The gateway verifies the JWT once and injects trusted `x-user-*` headers.
Services never see the raw JWT token. This reduces attack surface
(fewer places to misconfigure JWT verification) and keeps services stateless.

## Internal Service Key

Gateway injects `x-internal-key: <INTERNAL_SERVICE_KEY>` on every forwarded
request. Each service validates it before any route handler runs.
`/health` bypasses this check — needed for gateway health polling.

If `INTERNAL_SERVICE_KEY` differs between gateway and a service, the service
returns 403 for all non-health requests. Use the same value across all envs.

## Rate Limiting Strategy

| Limiter       | Window | Limit | Applied To        | skipSuccessful |
| ------------- | ------ | ----- | ----------------- | -------------- |
| globalLimiter | 15 min | 100   | All routes        | No             |
| authLimiter   | 10 min | 10    | /api/v1/auth only | Yes            |

`skipSuccessfulRequests: true` on authLimiter means only failed logins count
toward the limit. A legitimate user who logs in successfully does not consume
their attempts.

## Response Headers Added by Gateway

```
x-request-id:           UUID for distributed tracing
RateLimit-Limit:        Max requests in window
RateLimit-Remaining:    Requests left in current window
RateLimit-Reset:        Seconds until window resets
Content-Security-Policy: default-src 'none'
Strict-Transport-Security: max-age=31536000; includeSubDomains
```
