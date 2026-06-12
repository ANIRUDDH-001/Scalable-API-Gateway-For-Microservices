require('dotenv').config();

const required = ['MONGODB_URI', 'INTERNAL_SERVICE_KEY'];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3003,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI,
  internalServiceKey: process.env.INTERNAL_SERVICE_KEY,
};
