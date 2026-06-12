const config = require('./config');
const { connectDB } = require('./config/db');
const app = require('./app');

const start = async () => {
  await connectDB();

  const server = app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`transactions-service running on port ${config.port} [${config.nodeEnv}]`);
  });

  const shutdown = (signal) => {
    // eslint-disable-next-line no-console
    console.log(`${signal} received — shutting down transactions-service`);
    server.close(async () => {
      await require('mongoose').connection.close();
      // eslint-disable-next-line no-console
      console.log('transactions-service closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

start();
