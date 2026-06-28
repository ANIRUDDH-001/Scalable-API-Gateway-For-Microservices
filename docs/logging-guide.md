# Logging Guide

## Log Locations

| File                           | Content                         |
| ------------------------------ | ------------------------------- |
| `gateway/logs/combined.log`    | All gateway requests and events |
| `gateway/logs/error.log`       | Gateway errors only             |
| `services/*/logs/combined.log` | Service-level events            |

## Tracing a Request

Every request gets a `X-Request-ID` header. This ID appears in:

- The HTTP response header (`x-request-id`)
- Every log line written during that request's processing
- The upstream service's log for the same request

To trace a complete transaction:

```bash
# Find all logs for a specific requestId
REQUEST_ID="your-uuid-here"
grep "$REQUEST_ID" gateway/logs/combined.log
grep "$REQUEST_ID" services/auth-service/logs/combined.log
grep "$REQUEST_ID" services/accounts-service/logs/combined.log
grep "$REQUEST_ID" services/transactions-service/logs/combined.log
```

## Log Entry Format (JSON)

```json
{
  "level": "http",
  "message": "HTTP",
  "service": "api-gateway",
  "timestamp": "2024-06-01T12:00:00.000Z",
  "method": "POST",
  "url": "/api/v1/auth/login",
  "status": 200,
  "responseTime": "42ms",
  "requestId": "a1b2c3d4-..."
}
```

## Log Levels

| Level | When used                                       |
| ----- | ----------------------------------------------- |
| error | Exceptions, upstream failures, startup failures |
| warn  | Auth failures, rate limit triggers              |
| info  | Service startup, DB connection, config loaded   |
| http  | Every HTTP request (Morgan access log)          |
| debug | Only in development, fine-grained debugging     |
