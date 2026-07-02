const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validate.middleware');

const router = express.Router();

// Validation for auth routes
router.post(
  '/auth/register',
  [
    body('email').trim().isEmail().withMessage('A valid email address is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    validateRequest,
  ],
  (req, res, next) => next() // Pass to the proxy
);

router.post(
  '/auth/login',
  [
    body('email').trim().isEmail().withMessage('A valid email address is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest,
  ],
  (req, res, next) => next() // Pass to the proxy
);

// Basic structural validation for accounts and transactions
router.post(
  '/accounts',
  [
    body('name').trim().notEmpty().withMessage('Account name is required'),
    body('type').trim().notEmpty().withMessage('Account type is required'),
    validateRequest,
  ],
  (req, res, next) => next()
);

router.post(
  '/transactions',
  [
    body('accountId').trim().notEmpty().withMessage('accountId is required'),
    body('amount').isNumeric().withMessage('amount must be a valid number'),
    validateRequest,
  ],
  (req, res, next) => next()
);

module.exports = router;
