/**
 * In-memory account store with seed data.
 * Demonstrates service isolation — no database dependency.
 * State resets on service restart (expected behaviour for this demo).
 */
const accounts = [
  {
    id: 'acc_001',
    userId: 'usr_seed_001',
    type: 'savings',
    balance: 50000,
    currency: 'INR',
    status: 'active',
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'acc_002',
    userId: 'usr_seed_001',
    type: 'current',
    balance: 150000,
    currency: 'INR',
    status: 'active',
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'acc_003',
    userId: 'usr_seed_002',
    type: 'savings',
    balance: 25000,
    currency: 'INR',
    status: 'active',
    createdAt: new Date('2024-03-15').toISOString(),
  },
];

const findAll = () => [...accounts];

const findById = (id) => accounts.find((a) => a.id === id) || null;

const findByUserId = (userId) => accounts.filter((a) => a.userId === userId);

const create = ({ userId, type, currency = 'INR' }) => {
  const account = {
    id: `acc_${Date.now()}`,
    userId,
    type,
    balance: 0,
    currency,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  accounts.push(account);
  return account;
};

const update = (id, updates) => {
  const index = accounts.findIndex((a) => a.id === id);
  if (index === -1) {
    return null;
  }
  // Prevent overwriting immutable fields
  const { id: _id, createdAt: _created, ...safeUpdates } = updates;
  accounts[index] = { ...accounts[index], ...safeUpdates };
  return accounts[index];
};

const remove = (id) => {
  const index = accounts.findIndex((a) => a.id === id);
  if (index === -1) {
    return false;
  }
  accounts.splice(index, 1);
  return true;
};

module.exports = { findAll, findById, findByUserId, create, update, remove };
