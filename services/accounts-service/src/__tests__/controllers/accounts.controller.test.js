process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

const mockAccounts = [];
jest.mock('../../models/account.model', () => {
  return {
    find: jest.fn(() => ({ limit: jest.fn(async () => mockAccounts) })),
    findById: jest.fn(async (id) => mockAccounts.find((a) => String(a._id) === String(id)) || null),
    create: jest.fn(async (data) => {
      const acc = { _id: 'acc_' + Date.now(), id: 'acc_' + Date.now(), ...data };
      mockAccounts.push(acc);
      return acc;
    }),
    findByIdAndUpdate: jest.fn(async (id, data) => {
      const idx = mockAccounts.findIndex((a) => String(a._id) === String(id));
      if (idx === -1) {
        return null;
      }
      mockAccounts[idx] = { ...mockAccounts[idx], ...data };
      return mockAccounts[idx];
    }),
    findByIdAndDelete: jest.fn(async (id) => {
      const idx = mockAccounts.findIndex((a) => String(a._id) === String(id));
      if (idx === -1) {
        return null;
      }
      return mockAccounts.splice(idx, 1)[0];
    }),
  };
});

const {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
} = require('../../controllers/accounts.controller');

// Mock response and request helpers
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockReq = (overrides = {}) => ({
  params: {},
  query: {},
  body: {},
  headers: { 'x-user-id': 'usr_test_001' },
  ...overrides,
});

describe('accounts.controller', () => {
  beforeAll(() => {
    mockAccounts.push({
      _id: 'acc_001',
      id: 'acc_001',
      userId: 'usr_seed_001',
      type: 'savings',
      balance: 1000,
      currency: 'USD',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  describe('getAccounts', () => {
    it('', async () => {
      const req = mockReq({ headers: { 'x-user-id': 'usr_seed_001' }, query: {} });
      const res = mockRes();
      await getAccounts(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      const call = res.json.mock.calls[0][0];
      expect(call.data.every((a) => a.userId === 'usr_seed_001')).toBe(true);
    });

    it('', async () => {
      const req = mockReq({
        headers: { 'x-user-id': 'usr_seed_001' },
        query: { limit: '999' },
      });
      const res = mockRes();
      await getAccounts(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      const call = res.json.mock.calls[0][0];
      // Count cannot exceed 100 regardless of requested limit
      expect(call.data.length).toBeLessThanOrEqual(100);
    });

    it('', async () => {
      const req = mockReq({ headers: {} });
      const res = mockRes();
      await getAccounts(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getAccount', () => {
    it('', async () => {
      const req = mockReq({ params: { id: 'acc_nonexistent' } });
      const res = mockRes();
      await getAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('', async () => {
      const req = mockReq({ params: { id: 'acc_001' } });
      const res = mockRes();
      await getAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createAccount', () => {
    it('', async () => {
      const req = mockReq({ headers: {}, body: { type: 'savings' } });
      const res = mockRes();
      await createAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('', async () => {
      const req = mockReq({ headers: { 'x-user-id': 'usr_new' }, body: { type: 'savings' } });
      const res = mockRes();
      await createAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      const call = res.json.mock.calls[0][0];
      expect(call.data.userId).toBe('usr_new');
    });
  });

  describe('updateAccount', () => {
    it('', async () => {
      const req = mockReq({ params: { id: 'acc_ghost' }, body: {} });
      const res = mockRes();
      await updateAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('', async () => {
      const req = mockReq({ params: { id: 'acc_001' }, body: { status: 'inactive' } });
      const res = mockRes();
      await updateAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteAccount', () => {
    it('', async () => {
      const req = mockReq({ params: { id: 'acc_ghost' } });
      const res = mockRes();
      await deleteAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    it('', async () => {
      const req = mockReq({ params: { id: 'acc_001' } });
      const res = mockRes();
      await deleteAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
