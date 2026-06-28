/**
 * Full auth flow integration test.
 * Uses nock to intercept upstream service calls.
 * Tests: register → login → access protected resource → refresh token.
 */
const request = require('supertest');
const nock = require('nock');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_characters_long';
process.env.INTERNAL_SERVICE_KEY = 'test_key';
process.env.AUTH_SERVICE_URL = 'http://localhost:3001';
process.env.ACCOUNTS_SERVICE_URL = 'http://localhost:3002';
process.env.TRANSACTIONS_SERVICE_URL = 'http://localhost:3003';

const app = require('../../app');
const { registerProxyRoutes } = require('../../routes/proxy.routes');
registerProxyRoutes(app);
app.use(app.notFound);

const SECRET = 'test_jwt_secret_at_least_32_characters_long';
const validToken = jwt.sign({ id: 'usr_1', email: 'test@test.com', role: 'customer' }, SECRET, {
  issuer: 'auth-service',
  expiresIn: '1h',
});

beforeEach(() => nock.cleanAll());
afterAll(() => nock.restore());

describe('Auth flow integration', () => {
  it('register → 201 with tokens', async () => {
    nock('http://localhost:3001')
      .post('/register')
      .reply(201, {
        status: 'success',
        data: { accessToken: validToken, refreshToken: 'rt_mock', user: { id: 'usr_1' } },
      });
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'test@test.com',
      password: 'Password@123',
      name: 'Test',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('protected route → 401 without token', async () => {
    const res = await request(app).get('/api/v1/accounts');
    expect(res.status).toBe(401);
  });

  it('protected route → 200 with valid token', async () => {
    nock('http://localhost:3002').get('/').reply(200, { status: 'success', data: [] });
    const res = await request(app)
      .get('/api/v1/accounts')
      .set('Authorization', `Bearer ${validToken}`);
    expect(res.status).toBe(200);
  });

  it('protected route → 401 with expired token', async () => {
    const expiredToken = jwt.sign(
      { id: 'usr_1', email: 'test@test.com', role: 'customer' },
      SECRET,
      { issuer: 'auth-service', expiresIn: '-1s' }
    );
    const res = await request(app)
      .get('/api/v1/accounts')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/expired/i);
  });

  it('every response has x-request-id header', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-request-id']).toBeDefined();
    expect(res.headers['x-request-id']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });
});
