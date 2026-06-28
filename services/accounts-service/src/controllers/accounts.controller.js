const store = require('../data/accounts.store');

const getAccounts = (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(400).json({ status: 'error', message: 'x-user-id header is required' });
  }
  const accounts = store.findByUserId(userId);
  return res.status(200).json({ status: 'success', count: accounts.length, data: accounts });
};

const getAccount = (req, res) => {
  const account = store.findById(req.params.id);
  if (!account) {
    return res.status(404).json({ status: 'error', message: 'Account not found' });
  }
  return res.status(200).json({ status: 'success', data: account });
};

const createAccount = (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(400).json({ status: 'error', message: 'x-user-id header is required' });
  }
  const { type, currency } = req.body;
  const account = store.create({ userId, type, currency });
  return res.status(201).json({ status: 'success', data: account });
};

const updateAccount = (req, res) => {
  const updated = store.update(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ status: 'error', message: 'Account not found' });
  }
  return res.status(200).json({ status: 'success', data: updated });
};

const deleteAccount = (req, res) => {
  const deleted = store.remove(req.params.id);
  if (!deleted) {
    return res.status(404).json({ status: 'error', message: 'Account not found' });
  }
  return res.status(200).json({ status: 'success', message: 'Account deleted' });
};

module.exports = { getAccounts, getAccount, createAccount, updateAccount, deleteAccount };
