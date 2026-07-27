const { createClient } = require('redis');
const logger = require('../utils/logger');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

if (process.env.NODE_ENV === 'production') {
  redisClient.on('error', (err) => logger.error('Redis Client Error', err));
  redisClient.on('connect', () => logger.info('Redis Client Connected'));
  redisClient.on('reconnecting', () => logger.warn('Redis Client Reconnecting'));

  // Connect to Redis immediately when this file is required
  (async () => {
    try {
      await redisClient.connect();
    } catch (err) {
      logger.error('Failed to connect to Redis', err);
    }
  })();
}

module.exports = redisClient;
