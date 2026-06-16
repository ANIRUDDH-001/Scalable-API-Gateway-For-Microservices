const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Verifies JWT from Authorization: Bearer <token> header.
 * On success: sets req.user = decoded payload, calls next().
 * On failure: returns 401 immediately.
 *
 * The x-user-* headers are injected into the proxy request inside
 * injectHeaders.middleware.js — which reads req.user set here.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Authorization header missing or malformed. Expected: Bearer <token>',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret, { issuer: 'auth-service' });
    req.user = decoded;
    return next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError' ? 'Token expired — please log in again' : 'Invalid token';
    return res.status(401).json({ status: 'error', message });
  }
};

module.exports = { authenticate };
