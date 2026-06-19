const { createProxyMiddleware } = require('http-proxy-middleware');
const { injectGatewayHeaders } = require('../middleware/injectHeaders.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');
const routeTable = require('../config/routes.config');

const LIMITERS = {
  auth: authLimiter,
};

const makeProxy = (target, stripPath) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: { [`^${stripPath}`]: '' },
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

const registerProxyRoutes = (app) => {
  routeTable.forEach(({ prefix, target, stripPath, isPublic, limiter }) => {
    const middlewareChain = [];

    if (limiter && LIMITERS[limiter]) {
      middlewareChain.push(LIMITERS[limiter]);
    }

    if (!isPublic) {
      middlewareChain.push(authenticate);
    }

    middlewareChain.push(makeProxy(target, stripPath));

    app.use(prefix, ...middlewareChain);
  });
};

module.exports = { registerProxyRoutes };
