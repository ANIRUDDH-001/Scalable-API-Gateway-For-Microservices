# Fintech API Gateway

![CI](https://github.com/ANIRUDDH-001/Scalable-API-Gateway-For-Microservices/actions/workflows/ci.yml/badge.svg)

Centralised API Gateway for a fintech microservices system built with Node.js and Express.
Single entry point for routing, authentication, rate limiting, and observability.

## Architecture

![Architecture Diagram](docs/month-1-architecture.png)

## Services

| Service              | Port | Description                                       |
| -------------------- | ---- | ------------------------------------------------- |
| API Gateway          | 8000 | Single entry point — routing, auth, rate limiting |
| auth-service         | 3001 | JWT register / login / refresh (MongoDB)          |
| accounts-service     | 3002 | Account CRUD (MongoDB)                            |
| transactions-service | 3003 | Transaction CRUD (MongoDB)                        |

## Local Setup

### Prerequisites

- Node.js 20 (`nvm use` — requires [nvm](https://github.com/nvm-sh/nvm))
- MongoDB 7.x running locally

**Start MongoDB (first time):**

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux / WSL
sudo systemctl start mongod

# Or start manually (creates a data dir if it doesn't exist)
mkdir -p /tmp/mongodb-data
mongod --dbpath /tmp/mongodb-data --port 27017 --fork --logpath /tmp/mongod.log
```

### Install

```bash
git clone https://github.com/ANIRUDDH-001/Scalable-API-Gateway-For-Microservices.git

# Make sure you are in the project root directory before running further commands.
# If you cloned into a specific folder, cd into it:
# cd api-gateway-fintech (or cd Scalable-API-Gateway-For-Microservices)

npm install
```

### Configure

> **Note for Windows users:** If `cp` does not work, you can use `copy` in Command Prompt, or `Copy-Item` in PowerShell, or simply duplicate and rename the `.env.example` files manually.

```bash
# Copy and fill each service's env file
cp gateway/.env.example gateway/.env
cp services/auth-service/.env.example services/auth-service/.env
cp services/accounts-service/.env.example services/accounts-service/.env
cp services/transactions-service/.env.example services/transactions-service/.env
```

Use the same value for `INTERNAL_SERVICE_KEY` across all four `.env` files.

### Start

**IMPORTANT:** Every time you open a new terminal, make sure your terminal is currently in the project root directory (the folder containing `package.json`) before running the `cd` commands below.

Open 4 terminals:

```bash
# Terminal 1 (Ensure you are in the project root first)
cd api-gateway-fintech ;cd services/auth-service ; npm run dev

# Terminal 2
cd services/accounts-service ; npm run dev

# Terminal 3
cd services/transactions-service ; npm run dev

# Terminal 4
cd gateway ; npm run dev
```

Gateway is available at: `http://localhost:8000`

### Test

```bash
npm test                  # unit + integration tests
npm run test:coverage     # with coverage report
```

### Postman

Import `postman/fintech-gateway-v1.postman_collection.json` and
`postman/fintech-gateway-local.postman_environment.json` into Postman.

### Recording the API Demo Video (Phase 2 Submission)

To demonstrate the protected API endpoints without a frontend UI, use Postman and any screen recorder:

1. **Unauthorized Access:** Send a request to `GET /api/v1/accounts` without a token to show the `401 Unauthorized` response.
2. **Authentication:** Send a request to `POST /api/v1/auth/login` and highlight the returned JWT token.
3. **Authorized Access:** Send a request to `GET /api/v1/accounts` using the JWT as a Bearer Token to show a `200 OK` response.
4. **Rate Limiting:** Spam the login or accounts endpoint until the gateway returns a `429 Too Many Requests` error.
5. **Observability:** Highlight the `X-Request-ID` in the response headers.

## API Reference

See `docs/month-1-routing.md` for full route map.

> **Note on path forwarding:** The gateway strips `/api/v1` (not the full prefix) when routing
> to accounts-service and transactions-service. This means accounts-service receives requests at
> `/accounts/*` and transactions-service at `/transactions/*`. See `docs/month-1-routing.md`.

## Security (Month 2)

- JWT authentication on all `/api/v1/accounts` and `/api/v1/transactions` routes
- `Authorization: Bearer <token>` required header
- Rate limiting: 100 req/15min globally, 10 failed auth attempts/10min on auth routes
- Distributed request tracing via `X-Request-ID` response header
- Security headers: CSP, HSTS, X-Frame-Options (via Helmet)
- Input validation: 422 with errors array on invalid request body

See `docs/month-2-security-architecture.md` for full security pipeline.
See `docs/logging-guide.md` for request tracing instructions.

## Month Roadmap

- [x] Month 1 — Request routing foundation
- [x] Month 2 — JWT auth, rate limiting, logging
- [ ] Month 3 — Redis response cache, Grafana dashboards, Render deployment
  - Partially in place: `Dockerfile` + `docker-compose.yml`, Redis wired as the production rate-limit store, and a Prometheus `/metrics` endpoint via `prom-client`
  - Not yet done: response caching, Grafana dashboards, and cloud deployment
