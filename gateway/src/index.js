const config = require('./config');
const app = require('./app');

// Proxy routes registered here (M1-P3-SP2 adds this)
// const registerProxyRoutes = require('./routes/proxy.routes');
// registerProxyRoutes(app);

// 404 must be LAST — after all routes and proxies
app.use(app.notFound);

const server = app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API Gateway running on port ${config.port} [${config.nodeEnv}]`);
});

const shutdown = (signal) => {
  // eslint-disable-next-line no-console
  console.log(`${signal} received — shutting down gateway`);
  server.close(() => {
    // eslint-disable-next-line no-console
    console.log('Gateway closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
