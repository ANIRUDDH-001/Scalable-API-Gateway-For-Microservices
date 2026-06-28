const mongoose = require('mongoose');
const config = require('./index');

const logger = require('../utils/logger');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectDB = async (attempt = 1) => {
  try {
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection failed', { error: err.message, attempt });
    if (attempt >= MAX_RETRIES) {
      logger.error('Max retries reached — exiting');
      process.exit(1);
    }
    logger.info(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    await connectDB(attempt + 1);
  }
};

module.exports = { connectDB };
