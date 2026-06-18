const express = require('express');
const { validationResult } = require('express-validator');
const {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
} = require('../controllers/accounts.controller');
const { createAccountRules, updateAccountRules } = require('../middleware/validate.middleware');

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ status: 'error', errors: errors.array() });
  }
  return next();
};

router.get('/', getAccounts);
router.get('/:id', getAccount);
router.post('/', createAccountRules, handleValidation, createAccount);
router.put('/:id', updateAccountRules, handleValidation, updateAccount);
router.delete('/:id', deleteAccount);

module.exports = router;
