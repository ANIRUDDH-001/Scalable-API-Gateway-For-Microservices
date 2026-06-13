const request = require('supertest');
const nock = require('nock');

process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_characters_long';
process.env.INTERNAL_SERVICE_KEY = 'test_internal_key';
process.env.AUTH_SERVICE_URL = 'http://localhost:3001';
process.env.ACCOUNTS_SERVICE_URL = 'http://localhost:3002';
process.env.TRANSACTIONS_SERVICE_URL = 'http://localhost:3003';

const app = require('../../app');
app.use(app.notFound);

beforeEach(() => nock.cleanAll());
afterAll(() => nock.restore());

describe('GET /health', () => {
  it('returns 200 when all services are up', async () => {
    nock('http://localhost:3001').get('/health').reply(200, { status: 'up' });
    nock('http://localhost:3002').get('/health').reply(200, { status: 'up' });
    nock('http://localhost:3003').get('/health').reply(200, { status: 'up' });

    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.gateway).toBe('up');
    expect(res.body.allServicesUp).toBe(true);
  });

  it('returns 207 when one service is down', async () => {
    nock('http://localhost:3001').get('/health').reply(200, { status: 'up' });
    nock('http://localhost:3002').get('/health').replyWithError('ECONNREFUSED');
    nock('http://localhost:3003').get('/health').reply(200, { status: 'up' });

    const res = await request(app).get('/health');
    expect(res.status).toBe(207);
    expect(res.body.allServicesUp).toBe(false);
    expect(res.body.services['accounts-service'].status).toBe('down');
  });

  it('gateway itself remains up even when all services down', async () => {
    nock('http://localhost:3001').get('/health').replyWithError('ECONNREFUSED');
    nock('http://localhost:3002').get('/health').replyWithError('ECONNREFUSED');
    nock('http://localhost:3003').get('/health').replyWithError('ECONNREFUSED');

    const res = await request(app).get('/health');
    expect(res.status).toBe(207);
    expect(res.body.gateway).toBe('up');
  });
});
