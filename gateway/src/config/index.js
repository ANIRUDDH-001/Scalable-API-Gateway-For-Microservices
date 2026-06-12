require('dotenv').config();

const required = [
  'JWT_SECRET',
  'AUTH_SERVICE_URL',
  'ACCOUNTS_SERVICE_URL',
  'TRANSACTIONS_SERVICE_URL',
  'INTERNAL_SERVICE_KEY',
];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Gateway config error: missing required env var ${key}`);
  }
});

module.exports = {
  port: parseInt(process.env.PORT, 10) || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  internalServiceKey: process.env.INTERNAL_SERVICE_KEY,
  services: {
    auth: process.env.AUTH_SERVICE_URL,
    accounts: process.env.ACCOUNTS_SERVICE_URL,
    transactions: process.env.TRANSACTIONS_SERVICE_URL,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
};
