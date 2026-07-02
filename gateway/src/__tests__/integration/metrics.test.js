// Set required env vars before loading app modules
process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_characters_long';
process.env.INTERNAL_SERVICE_KEY = 'test_internal_key';
process.env.AUTH_SERVICE_URL = 'http://localhost:3001';
process.env.ACCOUNTS_SERVICE_URL = 'http://localhost:3002';
process.env.TRANSACTIONS_SERVICE_URL = 'http://localhost:3003';

const request = require('supertest');
const app = require('../../app');

describe('Gateway Metrics endpoint', () => {
  it('GET /metrics should return prometheus metrics', async () => {
    // Make a dummy request to trigger metrics middleware
    await request(app).get('/health');

    // Fetch metrics
    const res = await request(app).get('/metrics');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);

    // Check if the http_request_duration_seconds metric is present
    expect(res.text).toContain('http_request_duration_seconds');
    expect(res.text).toContain('gateway_'); // default metrics prefix
  });
});
