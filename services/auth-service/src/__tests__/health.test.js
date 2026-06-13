const request = require('supertest');

// Set required env vars before requiring app
process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_characters';
process.env.INTERNAL_SERVICE_KEY = 'test_internal_key';

const app = require('../app');

describe('auth-service health', () => {
  it('GET /health returns 200 with service name', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('up');
    expect(res.body.service).toBe('auth-service');
  });
});
