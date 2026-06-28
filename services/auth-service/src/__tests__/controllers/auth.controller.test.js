process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_characters_long';
process.env.INTERNAL_SERVICE_KEY = 'test_key';

const request = require('supertest');
const app = require('../../app');
const store = require('../../data/users.store');

describe('Auth API (auth-service)', () => {
  let validToken;

  beforeAll(() => {
    store.users = []; // Reset memory store
  });

  it('registers a new user successfully', async () => {
    const res = await request(app)
      .post('/register')
      .set('x-internal-key', 'test_key')
      .send({ email: 'new@test.com', password: 'Password@123', name: 'New User' });
    expect(res.status).toBe(201);
    expect(res.body.data.accessToken).toBeDefined();
    validToken = res.body.data.refreshToken;
  });

  it('fails to register duplicate email', async () => {
    const res = await request(app)
      .post('/register')
      .set('x-internal-key', 'test_key')
      .send({ email: 'new@test.com', password: 'Password@123', name: 'New User' });
    expect(res.status).toBe(409);
  });

  it('logs in successfully', async () => {
    const res = await request(app)
      .post('/login')
      .set('x-internal-key', 'test_key')
      .send({ email: 'new@test.com', password: 'Password@123' });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('fails to login with wrong password', async () => {
    const res = await request(app)
      .post('/login')
      .set('x-internal-key', 'test_key')
      .send({ email: 'new@test.com', password: 'WrongPassword@123' });
    expect(res.status).toBe(401);
  });

  it('refreshes token successfully', async () => {
    const res = await request(app)
      .post('/refresh')
      .set('x-internal-key', 'test_key')
      .send({ refreshToken: validToken });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('fails refresh with invalid token', async () => {
    const res = await request(app)
      .post('/refresh')
      .set('x-internal-key', 'test_key')
      .send({ refreshToken: 'invalid_token' });
    expect(res.status).toBe(401);
  });

  it('fails register with invalid data', async () => {
    const res = await request(app).post('/register').set('x-internal-key', 'test_key').send({});
    expect(res.status).toBe(422);
  });

  it('fails login with invalid data', async () => {
    const res = await request(app).post('/login').set('x-internal-key', 'test_key').send({});
    expect(res.status).toBe(422);
  });

  it('fails refresh with missing token', async () => {
    const res = await request(app).post('/refresh').set('x-internal-key', 'test_key').send({});
    expect(res.status).toBe(422);
  });

  it('fails refresh with wrong token type', async () => {
    const jwt = require('jsonwebtoken');
    const wrongToken = jwt.sign({ id: 'usr_1', type: 'access' }, process.env.JWT_SECRET, {
      issuer: 'auth-service',
      expiresIn: '1h',
    });
    const res = await request(app)
      .post('/refresh')
      .set('x-internal-key', 'test_key')
      .send({ refreshToken: wrongToken });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid token type');
  });

  it('fails refresh if user not found', async () => {
    const jwt = require('jsonwebtoken');
    const ghostToken = jwt.sign({ id: 'ghost_usr', type: 'refresh' }, process.env.JWT_SECRET, {
      issuer: 'auth-service',
      expiresIn: '1h',
    });
    const res = await request(app)
      .post('/refresh')
      .set('x-internal-key', 'test_key')
      .send({ refreshToken: ghostToken });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('User not found');
  });

  it('returns 404 for unknown route', async () => {
    const res = await request(app).get('/unknown').set('x-internal-key', 'test_key');
    expect(res.status).toBe(404);
  });
});
