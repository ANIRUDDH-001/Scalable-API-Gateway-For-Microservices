const { body } = require('express-validator');

const createTransactionRules = [
  body('accountId').trim().notEmpty().withMessage('accountId is required'),
  body('type')
    .isIn(['credit', 'debit', 'transfer'])
    .withMessage('type must be credit, debit, or transfer'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('amount must be a positive number greater than 0'),
  body('currency')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('currency must be a 3-letter ISO code'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('description cannot exceed 255 characters'),
];

const updateTransactionRules = [
  body('status')
    .optional()
    .isIn(['pending', 'completed', 'failed'])
    .withMessage('status must be pending, completed, or failed'),
  body('amount').not().exists().withMessage('amount cannot be updated after creation'),
  body('accountId').not().exists().withMessage('accountId cannot be updated after creation'),
];

module.exports = { createTransactionRules, updateTransactionRules };
