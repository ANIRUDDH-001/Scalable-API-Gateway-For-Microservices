const Account = require('../models/account.model');

const getAccounts = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(400).json({ status: 'error', message: 'x-user-id header is required' });
    }
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const accounts = await Account.find({ userId }).limit(limit);
    return res.status(200).json({ status: 'success', count: accounts.length, data: accounts });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

const getAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ status: 'error', message: 'Account not found' });
    }
    return res.status(200).json({ status: 'success', data: account });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ status: 'error', message: 'Invalid account ID format' });
    }
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

const createAccount = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(400).json({ status: 'error', message: 'x-user-id header is required' });
    }
    const { type, currency } = req.body;
    const account = await Account.create({ userId, type, currency });
    return res.status(201).json({ status: 'success', data: account });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ status: 'error', message: messages.join('; ') });
    }
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

const updateAccount = async (req, res) => {
  try {
    const updated = await Account.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Account not found' });
    }
    return res.status(200).json({ status: 'success', data: updated });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ status: 'error', message: messages.join('; ') });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ status: 'error', message: 'Invalid account ID format' });
    }
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const deleted = await Account.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'Account not found' });
    }
    return res.status(200).json({ status: 'success', message: 'Account deleted' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = { getAccounts, getAccount, createAccount, updateAccount, deleteAccount };
