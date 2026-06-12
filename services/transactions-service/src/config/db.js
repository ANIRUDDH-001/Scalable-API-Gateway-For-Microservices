const mongoose = require('mongoose');
const config = require('./index');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectDB = async (attempt = 1) => {
  try {
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`MongoDB connection attempt ${attempt} failed: ${err.message}`);
    if (attempt >= MAX_RETRIES) {
      // eslint-disable-next-line no-console
      console.error('Max retries reached — exiting');
      process.exit(1);
    }
    // eslint-disable-next-line no-console
    console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    await connectDB(attempt + 1);
  }
};

module.exports = { connectDB };
