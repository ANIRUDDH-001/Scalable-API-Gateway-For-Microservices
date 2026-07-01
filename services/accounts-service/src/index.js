const config = require('./config');
const app = require('./app');
const mongoose = require('mongoose');

const startServer = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB');

    const server = app.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`accounts-service running on port ${config.port} [${config.nodeEnv}]`);
    });

    const shutdown = (signal) => {
      // eslint-disable-next-line no-console
      console.log(`${signal} received — shutting down accounts-service`);
      server.close(async () => {
        await mongoose.connection.close();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
};

startServer();
