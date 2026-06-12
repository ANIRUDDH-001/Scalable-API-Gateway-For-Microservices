const config = require('../config');

/**
 * Removes any client-supplied internal headers (prevents spoofing)
 * then injects the gateway's own values.
 * Applied inside proxy proxyReq event — runs on every forwarded request.
 */
const injectGatewayHeaders = (proxyReq, _req) => {
  // Strip headers the client must never control
  proxyReq.removeHeader('x-internal-key');
  proxyReq.removeHeader('x-user-id');
  proxyReq.removeHeader('x-user-email');
  proxyReq.removeHeader('x-user-role');

  // Inject gateway-controlled headers
  proxyReq.setHeader('x-internal-key', config.internalServiceKey);

  // x-request-id forwarding added in M2-P1-SP3
  // x-user-* headers added in M2-P1-SP2 (after JWT verification)
};

module.exports = { injectGatewayHeaders };
