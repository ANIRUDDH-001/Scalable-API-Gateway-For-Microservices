const { validationResult } = require('express-validator');

/**
 * Middleware that intercepts requests after express-validator rules have run.
 * If errors are found, returns 422 Unprocessable Entity with the error array.
 * If no errors, calls next() to pass the request to the proxy or next middleware.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = { validateRequest };
