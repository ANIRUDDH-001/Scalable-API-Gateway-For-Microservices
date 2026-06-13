describe('Accounts Service Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('throws error if required env variables are missing', () => {
    delete process.env.INTERNAL_SERVICE_KEY;
    expect(() => require('../../config')).toThrow(/Missing required environment variable/);
  });

  it('loads config when all required env variables are present', () => {
    process.env.INTERNAL_SERVICE_KEY = 'key';
    const config = require('../../config');
    expect(config.internalServiceKey).toBe('key');
  });
});
