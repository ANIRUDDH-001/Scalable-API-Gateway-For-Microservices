const config = require('../config');

const validateInternalKey = (req, res, next) => {
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
