# GEMINI Project Memory — Fintech API Gateway

Read this file at the start of every task. It is the authoritative source of
architecture decisions, conventions, and patterns for this project.

## Project

Fintech API Gateway built with Node.js + Express. npm workspaces monorepo.
4 packages: gateway (port 8000), auth-service (3001), accounts-service (3002),
transactions-service (3003).

## Route prefix

ALL API routes use /api/v1/ prefix. Example: /api/v1/auth/register

## Coding conventions

- ES2022, CommonJS (require/module.exports)
- const/let only — never var
- Named exports from controllers. Default exports from routers.
- All async functions wrapped in try/catch
- Error response shape: { status: 'error', message: '...' }
- Success response shape: { status: 'success', data: ... }
- No console.log — use logger (from Month 2 onwards)
- No dead code, no unused imports, no TODO stubs

## Security model

- JWT verified ONLY at gateway — never in services
- Gateway injects x-user-id, x-user-email, x-user-role after verification
- Gateway DELETES any client-supplied x-user-\* headers before injecting own
- Gateway injects x-internal-key on every forwarded request
- Services MUST validate x-internal-key — return 403 if missing or wrong
- x-request-id (UUID) generated at gateway, forwarded to all services

## Internal Service Key Pattern

Every service validates `x-internal-key` on all routes except `/health`.
The key is set in each service's `.env` as `INTERNAL_SERVICE_KEY` and must
match across all services and the gateway.

Gateway injects the key via `injectHeaders.middleware.js` → `proxyReq.setHeader('x-internal-key', ...)`.
Services validate via `validateInternalKey` middleware registered before all route handlers.
Returns 403 `{ status: 'error', message: 'Forbidden — direct access not permitted' }`.

Verify at any time: `bash scripts/verify-internal-key.sh`

## File naming

- Middleware: name.middleware.js
- Controllers: name.controller.js
- Routes: name.routes.js
- Config: name.config.js or index.js inside config/
- Tests: name.test.js co-located with source or in **tests**/

## Test framework

Jest + Supertest. Run: npm test from root.
Integration tests in **tests**/integration/

## Commit convention

type(scope): what was actually done (human, specific, no AI tone)
Types: feat | fix | test | docs | chore | refactor
Scopes: gateway | auth | accounts | transactions | ci | docker | monitoring | deps

## Phase tracking

Month 1: Routing foundation (no auth)
Month 2: Security + logging layer
Month 3: Docker + cache + metrics + deployment
