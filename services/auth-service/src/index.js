const config = require('./config');
const app = require('./app');

const server = app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`auth-service running on port ${config.port} [${config.nodeEnv}]`);
});

const shutdown = (signal) => {
  // eslint-disable-next-line no-console
  console.log(`${signal} received — shutting down auth-service`);
  server.close(() => {
    // eslint-disable-next-line no-console
    console.log('auth-service closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
