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
  ...overrides,
});

describe('accounts.controller', () => {
  describe('getAccounts', () => {
    it('returns all accounts when no userId query param', () => {
      const req = mockReq();
      const res = mockRes();
      getAccounts(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'success', count: expect.any(Number) })
      );
    });

    it('filters by userId when provided', () => {
      const req = mockReq({ query: { userId: 'usr_seed_001' } });
      const res = mockRes();
      getAccounts(req, res);
      const call = res.json.mock.calls[0][0];
      expect(call.data.every((a) => a.userId === 'usr_seed_001')).toBe(true);
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
    it('returns 400 when userId is missing', () => {
      const req = mockReq({ body: { type: 'savings' } });
      const res = mockRes();
      createAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 for invalid account type', () => {
      const req = mockReq({ body: { userId: 'usr_1', type: 'invalid' } });
      const res = mockRes();
      createAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('creates account with valid body', () => {
      const req = mockReq({ body: { userId: 'usr_new', type: 'savings' } });
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
