const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');
const { injectGatewayHeaders } = require('../middleware/injectHeaders.middleware');

/**
 * Creates a proxy middleware for a given upstream target.
 * @param {string} target - Upstream service base URL
 * @param {string} pathPrefix - The /api/v1/service-name prefix to strip
 */
const makeProxy = (target, pathPrefix) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: { [`^${pathPrefix}`]: '' },
    on: {
      proxyReq: injectGatewayHeaders,
      error: (err, req, res) => {
        // Log the error — logger added in M2-P3-SP1, using console for now
        // eslint-disable-next-line no-console
        console.error(`Proxy error [${target}]: ${err.message}`);
        // Only send response if headers not already sent
        if (!res.headersSent) {
          res.status(502).json({
            status: 'error',
            message: 'Upstream service unavailable — please try again shortly',
          });
        }
      },
    },
  });

/**
 * Registers all /api/v1/* proxy routes on the Express app.
 * Must be called BEFORE the 404 handler in index.js.
 * Auth middleware (M2-P1-SP2) will be inserted between route and proxy.
 */
const registerProxyRoutes = (app) => {
  // Public routes — no auth middleware yet (added in M2-P1-SP2)
  app.use('/api/v1/auth', makeProxy(config.services.auth, '/api/v1/auth'));

  // Protected routes — auth middleware added in M2-P1-SP2
  app.use('/api/v1/accounts', makeProxy(config.services.accounts, '/api/v1/accounts'));
  app.use('/api/v1/transactions', makeProxy(config.services.transactions, '/api/v1/transactions'));
};

module.exports = { registerProxyRoutes };
