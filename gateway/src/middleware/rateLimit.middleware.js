const rateLimit = require('express-rate-limit');

/**
 * Builds a rate limiter with consistent JSON error response.
 * @param {object} opts - express-rate-limit options
 */
const buildLimiter = (opts) =>
  rateLimit({
    standardHeaders: 'draft-7', // Sends RateLimit-* headers (RFC standard)
    legacyHeaders: false,
    handler: (req, res, _next, options) => {
      const retryAfter = Math.ceil(options.windowMs / 1000);
      res.status(429).json({
        status: 'error',
        message: opts.message || 'Too many requests',
        retryAfter,
      });
    },
    ...opts,
  });

/**
 * globalLimiter: applied to ALL routes at app level.
 * 100 requests / 15 minutes per IP.
 */
const globalLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Rate limit exceeded. Maximum 100 requests per 15 minutes.',
});

/**
 * authLimiter: applied to /api/v1/auth only.
 * 10 failed attempts / 10 minutes per IP.
 * skipSuccessfulRequests: only counts 4xx/5xx responses — protects against brute-force.
 */
const authLimiter = buildLimiter({
  windowMs: 10 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: 'Too many failed authentication attempts. Try again in 10 minutes.',
});

module.exports = { globalLimiter, authLimiter };
