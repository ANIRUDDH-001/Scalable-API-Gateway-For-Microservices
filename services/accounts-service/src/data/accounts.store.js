/**
 * In-memory account store with seed data.
 * Demonstrates service isolation — no database dependency.
 * State resets on service restart (expected behaviour for this demo).
 */
const accounts = [];

const findAll = (limit = 100) => [...accounts].slice(0, limit);

const findById = (id) => accounts.find((a) => a.id === id) || null;

const findByUserId = (userId, limit = 50) =>
  accounts.filter((a) => a.userId === userId).slice(0, limit);

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

// Seed data reference — used by reset() to restore initial state
const SEED_ACCOUNTS = [
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

/**
 * Resets the in-memory store to the initial seed state.
 * For use in tests only.
 */
const reset = () => {
  accounts.length = 0;
  SEED_ACCOUNTS.forEach((a) => accounts.push({ ...a }));
};

// Populate store on module load
reset();

module.exports = { findAll, findById, findByUserId, create, update, remove, reset };
