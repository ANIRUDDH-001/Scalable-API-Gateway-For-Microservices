// Mock mongoose model before requiring controller
jest.mock('../../models/transaction.model');
const Transaction = require('../../models/transaction.model');
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../../controllers/transactions.controller');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('transactions.controller', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getTransactions', () => {
    it('returns 200 with transactions array', async () => {
      Transaction.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockResolvedValue([{ accountId: 'acc_001', type: 'credit', amount: 100 }]),
        }),
      });
      const req = { query: {} };
      const res = mockRes();
      await getTransactions(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('applies filters and limits correctly', async () => {
      Transaction.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      });
      const req = {
        query: { accountId: 'acc1', type: 'credit', status: 'completed', limit: '50' },
      };
      const res = mockRes();
      await getTransactions(req, res);
      expect(Transaction.find).toHaveBeenCalledWith({
        accountId: 'acc1',
        type: 'credit',
        status: 'completed',
      });
    });

    it('returns 500 on database error', async () => {
      Transaction.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockRejectedValue(new Error('DB error')),
        }),
      });
      const req = { query: {} };
      const res = mockRes();
      await getTransactions(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getTransaction', () => {
    it('returns 200 with transaction', async () => {
      const mockTx = { _id: 'tx_1', accountId: 'acc_001' };
      Transaction.findById.mockResolvedValue(mockTx);
      const req = { params: { id: 'tx_1' } };
      const res = mockRes();
      await getTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: mockTx });
    });

    it('returns 404 for non-existent transaction', async () => {
      Transaction.findById.mockResolvedValue(null);
      const req = { params: { id: 'tx_ghost' } };
      const res = mockRes();
      await getTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 400 for invalid ID format', async () => {
      const castError = new Error('Invalid ID');
      castError.name = 'CastError';
      Transaction.findById.mockRejectedValue(castError);
      const req = { params: { id: 'invalid' } };
      const res = mockRes();
      await getTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('createTransaction', () => {
    it('returns 201 on successful creation', async () => {
      const mockTx = { _id: 'tx_1', accountId: 'acc_001', type: 'credit', amount: 500 };
      Transaction.create.mockResolvedValue(mockTx);
      const req = { body: { accountId: 'acc_001', type: 'credit', amount: 500 } };
      const res = mockRes();
      await createTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('returns 400 on Mongoose ValidationError', async () => {
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      validationError.errors = { amount: { message: 'amount must be greater than 0' } };
      Transaction.create.mockRejectedValue(validationError);
      const req = { body: { accountId: 'acc_001', type: 'credit', amount: -1 } };
      const res = mockRes();
      await createTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
    it('returns 500 on other errors', async () => {
      Transaction.create.mockRejectedValue(new Error('Other error'));
      const req = { body: {} };
      const res = mockRes();
      await createTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateTransaction', () => {
    it('returns 200 on successful update', async () => {
      const mockTx = { _id: 'tx_1', status: 'completed' };
      Transaction.findByIdAndUpdate.mockResolvedValue(mockTx);
      const req = { params: { id: 'tx_1' }, body: { status: 'completed' } };
      const res = mockRes();
      await updateTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 404 for non-existent transaction', async () => {
      Transaction.findByIdAndUpdate.mockResolvedValue(null);
      const req = { params: { id: 'tx_ghost' }, body: {} };
      const res = mockRes();
      await updateTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    it('returns 400 on Mongoose ValidationError', async () => {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = { status: { message: 'invalid status' } };
      Transaction.findByIdAndUpdate.mockRejectedValue(err);
      const req = { params: { id: 'tx_1' }, body: {} };
      const res = mockRes();
      await updateTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 on CastError', async () => {
      const err = new Error('CastError');
      err.name = 'CastError';
      Transaction.findByIdAndUpdate.mockRejectedValue(err);
      const req = { params: { id: 'invalid' }, body: {} };
      const res = mockRes();
      await updateTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 500 on other errors', async () => {
      Transaction.findByIdAndUpdate.mockRejectedValue(new Error('Other error'));
      const req = { params: { id: 'tx_1' }, body: {} };
      const res = mockRes();
      await updateTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteTransaction', () => {
    it('returns 200 on successful deletion', async () => {
      const mockTx = { _id: 'tx_1' };
      Transaction.findByIdAndDelete.mockResolvedValue(mockTx);
      const req = { params: { id: 'tx_1' } };
      const res = mockRes();
      await deleteTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 404 for non-existent transaction', async () => {
      Transaction.findByIdAndDelete.mockResolvedValue(null);
      const req = { params: { id: 'tx_ghost' } };
      const res = mockRes();
      await deleteTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    it('returns 500 on database error', async () => {
      Transaction.findByIdAndDelete.mockRejectedValue(new Error('DB error'));
      const req = { params: { id: 'tx_1' } };
      const res = mockRes();
      await deleteTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
