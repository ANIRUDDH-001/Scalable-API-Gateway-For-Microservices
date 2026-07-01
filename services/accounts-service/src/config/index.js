require('dotenv').config();

const required = ['INTERNAL_SERVICE_KEY', 'MONGODB_URI'];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3002,
  nodeEnv: process.env.NODE_ENV || 'development',
  internalServiceKey: process.env.INTERNAL_SERVICE_KEY,
  mongoUri: process.env.MONGODB_URI,
};
