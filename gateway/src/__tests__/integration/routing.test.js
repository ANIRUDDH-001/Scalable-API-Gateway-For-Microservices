/**
 * Integration tests for gateway proxy routing.
 * Uses nock to intercept HTTP calls to upstream services.
 * No real services need to be running.
 */
const request = require('supertest');
const nock = require('nock');

// Set required env vars before loading app modules
process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_characters_long';
process.env.INTERNAL_SERVICE_KEY = 'test_internal_key';
process.env.AUTH_SERVICE_URL = 'http://localhost:3001';
process.env.ACCOUNTS_SERVICE_URL = 'http://localhost:3002';
process.env.TRANSACTIONS_SERVICE_URL = 'http://localhost:3003';

const app = require('../../app');
const { registerProxyRoutes } = require('../../routes/proxy.routes');
registerProxyRoutes(app);
app.use(app.notFound);

beforeEach(() => {
  nock.cleanAll();
});

afterAll(() => {
  nock.restore();
});

describe('Gateway Proxy Routing', () => {
  describe('POST /api/v1/auth/*', () => {
    it('forwards to auth-service and returns its response', async () => {
      nock('http://localhost:3001')
        .post('/register')
        .reply(201, { status: 'success', data: { token: 'jwt_token' } });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@test.com', password: 'pass', name: 'Test' });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
    });
  });

  describe('GET /api/v1/accounts', () => {
    it('forwards to accounts-service and returns its response', async () => {
      nock('http://localhost:3002').get('/').reply(200, { status: 'success', count: 3, data: [] });

      const res = await request(app).get('/api/v1/accounts');
      expect(res.status).toBe(200);
    });

    it('returns 502 when accounts-service is unreachable', async () => {
      nock('http://localhost:3002').get('/').replyWithError('ECONNREFUSED');

      const res = await request(app).get('/api/v1/accounts');
      expect(res.status).toBe(502);
      expect(res.body.status).toBe('error');
    });
  });

  describe('GET /api/v1/transactions', () => {
    it('forwards to transactions-service', async () => {
      nock('http://localhost:3003').get('/').reply(200, { status: 'success', count: 0, data: [] });

      const res = await request(app).get('/api/v1/transactions');
      expect(res.status).toBe(200);
    });
  });

  describe('Unmapped routes', () => {
    it('returns 404 for /api/v1/unknown', async () => {
      const res = await request(app).get('/api/v1/unknown');
      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
    });

    it('returns 404 for /completelywrong', async () => {
      const res = await request(app).get('/completelywrong');
      expect(res.status).toBe(404);
    });
  });
});
