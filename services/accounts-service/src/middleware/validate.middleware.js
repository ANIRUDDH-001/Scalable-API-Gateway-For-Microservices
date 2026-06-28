const { body } = require('express-validator');

const createAccountRules = [
  body('type')
    .trim()
    .isIn(['savings', 'current', 'fd', 'rd'])
    .withMessage('type must be savings, current, fd, or rd'),
  body('currency')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('currency must be a 3-letter ISO code')
    .isUppercase()
    .withMessage('currency must be a 3-letter ISO code'),
];

const updateAccountRules = [
  body('balance').optional().isFloat({ min: 0 }).withMessage('balance must be a positive number'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'frozen'])
    .withMessage('status must be active, inactive, or frozen'),
  body('id').not().exists().withMessage('id cannot be updated'),
  body('createdAt').not().exists().withMessage('createdAt cannot be updated'),
];

module.exports = { createAccountRules, updateAccountRules };
