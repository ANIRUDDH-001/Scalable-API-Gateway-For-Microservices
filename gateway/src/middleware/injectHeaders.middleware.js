const config = require('../config');
const { fixRequestBody } = require('http-proxy-middleware');

/**
 * Removes any client-supplied spoofable headers.
 * Then injects gateway-controlled values.
 * req.user is populated by auth.middleware.js for protected routes.
 */
const injectGatewayHeaders = (proxyReq, req) => {
  // Strip headers the client must never control
  proxyReq.removeHeader('x-internal-key');
  proxyReq.removeHeader('x-user-id');
  proxyReq.removeHeader('x-user-email');
  proxyReq.removeHeader('x-user-role');
  proxyReq.removeHeader('x-request-id');

  // Always inject internal service key
  proxyReq.setHeader('x-internal-key', config.internalServiceKey);
  proxyReq.setHeader('x-request-id', req.requestId || 'unknown');

  // Fix body parser hanging issue for POST requests
  if (req.body && Object.keys(req.body).length > 0) {
    proxyReq.removeHeader('transfer-encoding');
    fixRequestBody(proxyReq, req);
  }

  // Inject verified user identity if auth middleware ran (protected routes)
  if (req.user) {
    proxyReq.setHeader('x-user-id', req.user.id);
    proxyReq.setHeader('x-user-email', req.user.email);
    proxyReq.setHeader('x-user-role', req.user.role);
  }
};

module.exports = { injectGatewayHeaders };
