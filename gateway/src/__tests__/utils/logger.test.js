const logger = require('../../utils/logger');

describe('logger', () => {
  it('logs info', () => {
    expect(logger.info).toBeDefined();
  });
  it('logs error', () => {
    expect(logger.error).toBeDefined();
  });
});
