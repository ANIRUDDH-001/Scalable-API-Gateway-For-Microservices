const Transaction = require('../models/transaction.model');

const getTransactions = async (req, res) => {
  try {
    const { accountId, type, status, limit = 20 } = req.query;
    const filter = {};
    if (accountId) {
      filter.accountId = accountId;
    }
    if (type) {
      filter.type = type;
    }
    if (status) {
      filter.status = status;
    }

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(parseInt(limit, 10), 100));

    res.status(200).json({ status: 'success', count: transactions.length, data: transactions });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ status: 'error', message: 'Transaction not found' });
    }
    return res.status(200).json({ status: 'success', data: transaction });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ status: 'error', message: 'Invalid transaction ID format' });
    }
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

const createTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(201).json({ status: 'success', data: transaction });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ status: 'error', message: messages.join('; ') });
    }
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!transaction) {
      return res.status(404).json({ status: 'error', message: 'Transaction not found' });
    }
    return res.status(200).json({ status: 'success', data: transaction });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ status: 'error', message: messages.join('; ') });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ status: 'error', message: 'Invalid transaction ID format' });
    }
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({ status: 'error', message: 'Transaction not found' });
    }
    return res.status(200).json({ status: 'success', message: 'Transaction deleted' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
