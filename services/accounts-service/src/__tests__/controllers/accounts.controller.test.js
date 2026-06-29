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
  describe('getAccounts', () => {
    it('returns accounts for the authenticated user', () => {
      const req = mockReq({ headers: { 'x-user-id': 'usr_seed_001' }, query: {} });
      const res = mockRes();
      getAccounts(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      const call = res.json.mock.calls[0][0];
      expect(call.data.every((a) => a.userId === 'usr_seed_001')).toBe(true);
    });

    it('respects the limit query parameter (max 100)', () => {
      const req = mockReq({
        headers: { 'x-user-id': 'usr_seed_001' },
        query: { limit: '999' },
      });
      const res = mockRes();
      getAccounts(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      const call = res.json.mock.calls[0][0];
      // Count cannot exceed 100 regardless of requested limit
      expect(call.data.length).toBeLessThanOrEqual(100);
    });

    it('returns 400 when x-user-id header is missing', () => {
      const req = mockReq({ headers: {} });
      const res = mockRes();
      getAccounts(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getAccount', () => {
    it('returns 404 for non-existent account', () => {
      const req = mockReq({ params: { id: 'acc_nonexistent' } });
      const res = mockRes();
      getAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns account for valid id', () => {
      const req = mockReq({ params: { id: 'acc_001' } });
      const res = mockRes();
      getAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createAccount', () => {
    it('returns 400 when x-user-id header is missing', () => {
      const req = mockReq({ headers: {}, body: { type: 'savings' } });
      const res = mockRes();
      createAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('creates account using userId from header', () => {
      const req = mockReq({ headers: { 'x-user-id': 'usr_new' }, body: { type: 'savings' } });
      const res = mockRes();
      createAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      const call = res.json.mock.calls[0][0];
      expect(call.data.userId).toBe('usr_new');
    });
  });

  describe('updateAccount', () => {
    it('returns 404 for non-existent account', () => {
      const req = mockReq({ params: { id: 'acc_ghost' }, body: {} });
      const res = mockRes();
      updateAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 200 on successful update', () => {
      const req = mockReq({ params: { id: 'acc_001' }, body: { status: 'inactive' } });
      const res = mockRes();
      updateAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteAccount', () => {
    it('returns 404 for non-existent account', () => {
      const req = mockReq({ params: { id: 'acc_ghost' } });
      const res = mockRes();
      deleteAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    it('returns 200 on successful delete', () => {
      const req = mockReq({ params: { id: 'acc_001' } });
      const res = mockRes();
      deleteAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
