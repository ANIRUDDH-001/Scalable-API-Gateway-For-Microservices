process.env.INTERNAL_SERVICE_KEY = 'test_key';
const request = require('supertest');
const app = require('../app');
const store = require('../data/accounts.store');

const TEST_USER_ID = 'usr_test_001';

describe('Accounts API (accounts-service)', () => {
  let createdAccountId;

  beforeAll(() => {
    store.reset(); // Restore store to clean seed state
  });

  it('creates an account successfully', async () => {
    const res = await request(app)
      .post('/accounts')
      .set('x-internal-key', 'test_key')
      .set('x-user-id', TEST_USER_ID)
      .send({ type: 'savings', currency: 'USD' });
    expect(res.status).toBe(201);
    expect(res.body.data.userId).toBe(TEST_USER_ID);
    createdAccountId = res.body.data.id;
  });

  it('returns 400 when x-user-id header is missing', async () => {
    const res = await request(app)
      .post('/accounts')
      .set('x-internal-key', 'test_key')
      .send({ type: 'savings' });
    expect(res.status).toBe(400);
  });

  it('gets accounts for authenticated user only', async () => {
    const res = await request(app)
      .get('/accounts')
      .set('x-internal-key', 'test_key')
      .set('x-user-id', TEST_USER_ID);
    expect(res.status).toBe(200);
    expect(res.body.data.every((a) => a.userId === TEST_USER_ID)).toBe(true);
  });

  it('gets an account by id', async () => {
    const res = await request(app)
      .get(`/accounts/${createdAccountId}`)
      .set('x-internal-key', 'test_key')
      .set('x-user-id', TEST_USER_ID);
    expect(res.status).toBe(200);
  });

  it('updates an account successfully', async () => {
    const res = await request(app)
      .put(`/accounts/${createdAccountId}`)
      .set('x-internal-key', 'test_key')
      .set('x-user-id', TEST_USER_ID)
      .send({ balance: 100 });
    expect(res.status).toBe(200);
    expect(res.body.data.balance).toBe(100);
  });

  it('deletes an account successfully', async () => {
    const res = await request(app)
      .delete(`/accounts/${createdAccountId}`)
      .set('x-internal-key', 'test_key')
      .set('x-user-id', TEST_USER_ID);
    expect(res.status).toBe(200);
  });

  it('returns 404 for unknown route', async () => {
    const res = await request(app).get('/unknown').set('x-internal-key', 'test_key');
    expect(res.status).toBe(404);
  });
});
