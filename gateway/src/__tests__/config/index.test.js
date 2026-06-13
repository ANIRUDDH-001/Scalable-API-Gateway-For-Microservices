describe('Gateway Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('throws error if required env variables are missing', () => {
    delete process.env.JWT_SECRET;
    expect(() => require('../../config')).toThrow(/missing required env var/);
  });

  it('loads config when all required env variables are present', () => {
    process.env.PORT = '8000';
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'secret';
    process.env.AUTH_SERVICE_URL = 'http://localhost:3001';
    process.env.ACCOUNTS_SERVICE_URL = 'http://localhost:3002';
    process.env.TRANSACTIONS_SERVICE_URL = 'http://localhost:3003';
    process.env.INTERNAL_SERVICE_KEY = 'key';
    process.env.REDIS_URL = 'redis://localhost:6379';

    const config = require('../../config');
    expect(config.jwtSecret).toBe('secret');
  });
});
