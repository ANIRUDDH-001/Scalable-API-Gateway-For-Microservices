# Phase 1 — API Gateway Routing Workflow

## Overview

All client requests enter the system through the API Gateway on port 8000.
The gateway is the single point of entry — no client ever directly addresses
a backend service.

## Request Flow

1. Client sends HTTP request to gateway at `http://localhost:8000/api/v1/{service}/{path}`
2. Gateway matches the route prefix to a service:
   - `/api/v1/auth/*` → auth-service:3001
   - `/api/v1/accounts/*` → accounts-service:3002
   - `/api/v1/transactions/*` → transactions-service:3003
3. Gateway strips the route prefix via `pathRewrite` so services receive clean paths.
   Example: `/api/v1/accounts/acc_001` becomes `/acc_001` at accounts-service.
4. Gateway injects `x-internal-key` header on every forwarded request.
5. Service validates `x-internal-key` — returns 403 if missing or wrong.
6. Service processes the request and returns a response.
7. Gateway streams the response back to the client.
8. If the upstream service is unreachable, gateway returns 502.

## Why http-proxy-middleware?

`http-proxy-middleware` streams the response directly — the gateway never
buffers the body in memory. This is critical for a financial API that may
serve large account statements. Axios would require loading the full response
body into RAM before forwarding.

## Route Map

| Client Path                     | Service                   | Service Path   |
| ------------------------------- | ------------------------- | -------------- |
| POST /api/v1/auth/register      | auth-service:3001         | POST /register |
| POST /api/v1/auth/login         | auth-service:3001         | POST /login    |
| GET /api/v1/accounts            | accounts-service:3002     | GET /          |
| GET /api/v1/accounts/:id        | accounts-service:3002     | GET /:id       |
| POST /api/v1/accounts           | accounts-service:3002     | POST /         |
| PUT /api/v1/accounts/:id        | accounts-service:3002     | PUT /:id       |
| DELETE /api/v1/accounts/:id     | accounts-service:3002     | DELETE /:id    |
| GET /api/v1/transactions        | transactions-service:3003 | GET /          |
| POST /api/v1/transactions       | transactions-service:3003 | POST /         |
| GET /api/v1/transactions/:id    | transactions-service:3003 | GET /:id       |
| DELETE /api/v1/transactions/:id | transactions-service:3003 | DELETE /:id    |

## Health Endpoint

`GET /health` polls all three services concurrently (Promise.allSettled, 3s timeout).
Returns 200 if all up, 207 (Multi-Status) if any are down.
