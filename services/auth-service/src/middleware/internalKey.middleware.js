const config = require('../config');

/**
 * Validates the x-internal-key header on every request.
 * The gateway injects this header on all forwarded requests.
 * Direct access to this service without the key is rejected.
 */
const validateInternalKey = (req, res, next) => {
  // Health endpoint bypasses this check — used by gateway for health aggregation
  if (req.path === '/health') {
    return next();
  }

  const key = req.headers['x-internal-key'];

  if (!key || key !== config.internalServiceKey) {
    return res.status(403).json({
      status: 'error',
      message: 'Forbidden — direct access not permitted',
    });
  }

  return next();
};

module.exports = { validateInternalKey };
