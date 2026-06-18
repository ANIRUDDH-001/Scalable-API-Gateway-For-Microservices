const express = require('express');
const { validationResult } = require('express-validator');
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactions.controller');
const {
  createTransactionRules,
  updateTransactionRules,
} = require('../middleware/validate.middleware');

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ status: 'error', errors: errors.array() });
  }
  return next();
};

router.get('/', getTransactions);
router.get('/:id', getTransaction);
router.post('/', createTransactionRules, handleValidation, createTransaction);
router.put('/:id', updateTransactionRules, handleValidation, updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
