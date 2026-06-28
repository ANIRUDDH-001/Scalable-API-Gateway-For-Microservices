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
