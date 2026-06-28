process.env.INTERNAL_SERVICE_KEY = 'test_key';
const request = require('supertest');
const app = require('../app');
const store = require('../data/accounts.store');

describe('Accounts API (accounts-service)', () => {
  let createdAccountId;

  beforeAll(() => {
    store.accounts = []; // Reset memory store
  });

  it('creates an account successfully', async () => {
    const res = await request(app)
      .post('/accounts')
      .set('x-internal-key', 'test_key')
      .send({ userId: 'u1', type: 'savings', currency: 'USD' });
    expect(res.status).toBe(201);
    createdAccountId = res.body.data.id;
  });

  it('gets accounts by userId', async () => {
    const res = await request(app)
      .get('/accounts')
      .set('x-internal-key', 'test_key')
      .query({ userId: 'u1' });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it('gets an account by id', async () => {
    const res = await request(app)
      .get(`/accounts/${createdAccountId}`)
      .set('x-internal-key', 'test_key');
    expect(res.status).toBe(200);
  });

  it('updates an account successfully', async () => {
    const res = await request(app)
      .put(`/accounts/${createdAccountId}`)
      .set('x-internal-key', 'test_key')
      .send({ balance: 100 });
    expect(res.status).toBe(200);
    expect(res.body.data.balance).toBe(100);
  });

  it('deletes an account successfully', async () => {
    const res = await request(app)
      .delete(`/accounts/${createdAccountId}`)
      .set('x-internal-key', 'test_key');
    expect(res.status).toBe(200);
  });

  it('returns 404 for unknown route', async () => {
    const res = await request(app).get('/unknown').set('x-internal-key', 'test_key');
    expect(res.status).toBe(404);
  });
});
