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

const jwt = require('jsonwebtoken');
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

const validToken = jwt.sign(
  { id: 'test', email: 'test@test.com', role: 'customer' },
  process.env.JWT_SECRET,
  { issuer: 'auth-service' }
);

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
      expect(res.headers['x-request-id']).toBeDefined();
      expect(res.body.status).toBe('success');
    });
  });

  describe('GET /api/v1/accounts', () => {
    it('forwards to accounts-service and returns its response', async () => {
      nock('http://localhost:3002')
        .get('/accounts')
        .reply(200, { status: 'success', count: 3, data: [] });

      const res = await request(app)
        .get('/api/v1/accounts')
        .set('Authorization', `Bearer ${validToken}`);
      expect(res.status).toBe(200);
      expect(res.headers['ratelimit']).toBeDefined();
      expect(res.headers['ratelimit-policy']).toBeDefined();
    });

    it('returns 502 when accounts-service is unreachable', async () => {
      nock('http://localhost:3002').get('/accounts').replyWithError('ECONNREFUSED');

      const res = await request(app)
        .get('/api/v1/accounts')
        .set('Authorization', `Bearer ${validToken}`);
      expect(res.status).toBe(502);
      expect(res.body.status).toBe('error');
    });
  });

  describe('GET /api/v1/transactions', () => {
    it('forwards to transactions-service', async () => {
      nock('http://localhost:3003')
        .get('/transactions')
        .reply(200, { status: 'success', count: 0, data: [] });

      const res = await request(app)
        .get('/api/v1/transactions')
        .set('Authorization', `Bearer ${validToken}`);
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

  describe('Proxy path stripping', () => {
    it('strips /api/v1 and forwards /accounts path to accounts-service', async () => {
      // Intercept ONLY on the expected path — if pathRewrite is wrong, nock won't match
      // and the test will get a connection error (502), not 200
      nock('http://localhost:3002')
        .get('/accounts')
        .reply(200, { status: 'success', count: 0, data: [] });

      const res = await request(app)
        .get('/api/v1/accounts')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
    });

    it('strips /api/v1 and forwards /accounts/:id path to accounts-service', async () => {
      nock('http://localhost:3002')
        .get('/accounts/acc_001')
        .reply(200, { status: 'success', data: { id: 'acc_001' } });

      const res = await request(app)
        .get('/api/v1/accounts/acc_001')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
    });

    it('strips /api/v1 and forwards /transactions path to transactions-service', async () => {
      nock('http://localhost:3003')
        .get('/transactions')
        .reply(200, { status: 'success', count: 0, data: [] });

      const res = await request(app)
        .get('/api/v1/transactions')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
    });

    it('forwards /api/v1/auth/register as /register to auth-service (auth has own stripPath)', async () => {
      nock('http://localhost:3001')
        .post('/register')
        .reply(201, { status: 'success', data: { accessToken: 'tok' } });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'x@x.com', password: 'Pass1234', name: 'X' });

      expect(res.status).toBe(201);
    });
  });
});
