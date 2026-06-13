process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_characters_long';
process.env.INTERNAL_SERVICE_KEY = 'test_secret_key';
process.env.AUTH_SERVICE_URL = 'http://localhost:3001';
process.env.ACCOUNTS_SERVICE_URL = 'http://localhost:3002';
process.env.TRANSACTIONS_SERVICE_URL = 'http://localhost:3003';

const { injectGatewayHeaders } = require('../../middleware/injectHeaders.middleware');

describe('injectGatewayHeaders', () => {
  it('removes client-supplied x-internal-key and sets gateway value', () => {
    const proxyReq = {
      headers: { 'x-internal-key': 'spoofed_key' },
      removeHeader: jest.fn(),
      setHeader: jest.fn(),
      getHeader: jest.fn(),
    };
    const req = {};
    injectGatewayHeaders(proxyReq, req);
    expect(proxyReq.removeHeader).toHaveBeenCalledWith('x-internal-key');
    expect(proxyReq.setHeader).toHaveBeenCalledWith('x-internal-key', 'test_secret_key');
  });

  it('removes x-user-* headers before setting own', () => {
    const proxyReq = {
      headers: {},
      removeHeader: jest.fn(),
      setHeader: jest.fn(),
    };
    const req = {};
    injectGatewayHeaders(proxyReq, req);
    expect(proxyReq.removeHeader).toHaveBeenCalledWith('x-user-id');
    expect(proxyReq.removeHeader).toHaveBeenCalledWith('x-user-email');
    expect(proxyReq.removeHeader).toHaveBeenCalledWith('x-user-role');
  });
});
