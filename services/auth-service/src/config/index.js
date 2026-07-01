require('dotenv').config();

const required = ['JWT_SECRET', 'INTERNAL_SERVICE_KEY', 'MONGODB_URI'];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  internalServiceKey: process.env.INTERNAL_SERVICE_KEY,
  mongoUri: process.env.MONGODB_URI,
};
