/**
 * Tests for the gateway's internal key injection and header stripping behaviour.
 *
 * The gateway does NOT validate x-internal-key — it injects it on outbound requests.
 * Services validate it on inbound requests.
 *
 * What we test here:
 *   1. injectGatewayHeaders correctly strips client-supplied x-internal-key
 *   2. injectGatewayHeaders correctly injects the configured key
 *   3. injectGatewayHeaders strips all x-user-* headers before injecting trusted values
 *   4. injectGatewayHeaders injects x-user-* only when req.user is set (protected routes)
 */

process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_characters_long';
process.env.INTERNAL_SERVICE_KEY = 'gateway_internal_key_test';
process.env.AUTH_SERVICE_URL = 'http://localhost:3001';
process.env.ACCOUNTS_SERVICE_URL = 'http://localhost:3002';
process.env.TRANSACTIONS_SERVICE_URL = 'http://localhost:3003';

const { injectGatewayHeaders } = require('../../middleware/injectHeaders.middleware');

const makeProxyReq = () => ({
  removedHeaders: [],
  setHeaders: {},
  removeHeader(name) {
    this.removedHeaders.push(name);
  },
  setHeader(name, value) {
    this.setHeaders[name] = value;
  },
  getHeader(name) {
    return this.setHeaders[name] || null;
  },
});

describe('Gateway internal key injection (injectGatewayHeaders)', () => {
  it('strips client-supplied x-internal-key before injecting gateway key', () => {
    const proxyReq = makeProxyReq();
    const req = { requestId: 'test-req-id' };

    injectGatewayHeaders(proxyReq, req);

    expect(proxyReq.removedHeaders).toContain('x-internal-key');
    expect(proxyReq.setHeaders['x-internal-key']).toBe('gateway_internal_key_test');
  });

  it('strips all three x-user-* spoofable headers regardless of req.user', () => {
    const proxyReq = makeProxyReq();
    const req = { requestId: 'test-req-id' };

    injectGatewayHeaders(proxyReq, req);

    expect(proxyReq.removedHeaders).toContain('x-user-id');
    expect(proxyReq.removedHeaders).toContain('x-user-email');
    expect(proxyReq.removedHeaders).toContain('x-user-role');
  });

  it('does NOT inject x-user-* headers when req.user is absent (public route)', () => {
    const proxyReq = makeProxyReq();
    const req = { requestId: 'test-req-id' };

    injectGatewayHeaders(proxyReq, req);

    expect(proxyReq.setHeaders['x-user-id']).toBeUndefined();
    expect(proxyReq.setHeaders['x-user-email']).toBeUndefined();
    expect(proxyReq.setHeaders['x-user-role']).toBeUndefined();
  });

  it('injects x-user-* headers from req.user when present (protected route)', () => {
    const proxyReq = makeProxyReq();
    const req = {
      requestId: 'test-req-id',
      user: { id: 'usr_123', email: 'test@example.com', role: 'customer' },
    };

    injectGatewayHeaders(proxyReq, req);

    expect(proxyReq.setHeaders['x-user-id']).toBe('usr_123');
    expect(proxyReq.setHeaders['x-user-email']).toBe('test@example.com');
    expect(proxyReq.setHeaders['x-user-role']).toBe('customer');
  });

  it('always injects x-request-id from req.requestId', () => {
    const proxyReq = makeProxyReq();
    const req = { requestId: 'a1b2c3d4-e5f6-4789-ab12-cd34ef567890' };

    injectGatewayHeaders(proxyReq, req);

    expect(proxyReq.setHeaders['x-request-id']).toBe('a1b2c3d4-e5f6-4789-ab12-cd34ef567890');
  });

  it('uses "unknown" for x-request-id when requestId is not set', () => {
    const proxyReq = makeProxyReq();
    const req = {};

    injectGatewayHeaders(proxyReq, req);

    expect(proxyReq.setHeaders['x-request-id']).toBe('unknown');
  });
});
