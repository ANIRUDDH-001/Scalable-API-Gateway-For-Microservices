const request = require('supertest');
const express = require('express');
const { buildLimiter } = require('../../middleware/rateLimit.middleware');

describe('rateLimit middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    // Tight limiter: 3 requests per minute
    const testLimiter = buildLimiter({ windowMs: 60000, max: 3, message: 'Limit hit' });
    app.use(testLimiter);
    app.get('/test', (_req, res) => res.json({ ok: true }));
  });

  it('allows requests up to the limit', async () => {
    for (let i = 0; i < 3; i++) {
      const res = await request(app).get('/test');
      expect(res.status).toBe(200);
    }
  });

  it('returns 429 after limit is exceeded', async () => {
    for (let i = 0; i < 3; i++) {
      await request(app).get('/test');
    }
    const res = await request(app).get('/test');
    expect(res.status).toBe(429);
    expect(res.body.status).toBe('error');
    expect(res.body.retryAfter).toBeDefined();
  });

  it('includes RateLimit headers', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['ratelimit-policy']).toBeDefined();
    expect(res.headers['ratelimit']).toBeDefined();
  });

  it('uses default message if not provided', async () => {
    const appDefault = express();
    appDefault.use(buildLimiter({ windowMs: 60000, max: 1 }));
    appDefault.get('/test', (_req, res) => res.json({ ok: true }));
    await request(appDefault).get('/test');
    const res = await request(appDefault).get('/test');
    expect(res.status).toBe(429);
    expect(res.body.message).toBe('Too many requests');
  });
});

describe('authLimiter — skipSuccessfulRequests behaviour', () => {
  let authApp;

  beforeEach(() => {
    authApp = express();
    // Tight limiter that mirrors authLimiter settings: skip successful requests
    const testAuthLimiter = buildLimiter({
      windowMs: 60000,
      max: 3,
      skipSuccessfulRequests: true,
      message: 'Too many failed attempts',
    });
    authApp.use(testAuthLimiter);
    // Simulate: return 401 for wrong password, 200 for correct
    authApp.post('/login', (req, res) => {
      if (req.headers['x-test-fail'] === 'true') {
        return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
      }
      return res.status(200).json({ status: 'success', data: { token: 'abc' } });
    });
  });

  it('successful requests do not count toward the limit', async () => {
    // Make more successful requests than the limit — should never hit 429
    for (let i = 0; i < 5; i++) {
      const res = await request(authApp).post('/login');
      expect(res.status).toBe(200);
    }
  });

  it('failed requests count toward the limit and trigger 429', async () => {
    // Send 3 failed requests (max = 3)
    for (let i = 0; i < 3; i++) {
      await request(authApp).post('/login').set('x-test-fail', 'true');
    }
    // 4th failed request should be rate limited
    const res = await request(authApp).post('/login').set('x-test-fail', 'true');
    expect(res.status).toBe(429);
    expect(res.body.message).toBe('Too many failed attempts');
  });

  it('a successful login after failed attempts still works (resets nothing, just not counted)', async () => {
    // Send 2 failed attempts (under the limit of 3)
    for (let i = 0; i < 2; i++) {
      await request(authApp).post('/login').set('x-test-fail', 'true');
    }
    // A successful login must still go through
    const res = await request(authApp).post('/login');
    expect(res.status).toBe(200);
  });
});
