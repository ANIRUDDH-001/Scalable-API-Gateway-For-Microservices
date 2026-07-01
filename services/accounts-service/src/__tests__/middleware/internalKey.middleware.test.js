process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
// Temporarily set env for tests BEFORE require
const MOCK_KEY = 'test_internal_key';
process.env.INTERNAL_SERVICE_KEY = MOCK_KEY;

const { validateInternalKey } = require('../../middleware/internalKey.middleware');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('validateInternalKey middleware', () => {
  it('calls next() for health endpoint without key', () => {
    const req = { path: '/health', headers: {} };
    const res = mockRes();
    const next = jest.fn();
    validateInternalKey(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 403 when x-internal-key header is missing', () => {
    const req = { path: '/accounts', headers: {} };
    const res = mockRes();
    const next = jest.fn();
    validateInternalKey(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when x-internal-key is wrong', () => {
    const req = { path: '/accounts', headers: { 'x-internal-key': 'wrong' } };
    const res = mockRes();
    const next = jest.fn();
    validateInternalKey(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('calls next() when x-internal-key matches', () => {
    const req = { path: '/accounts', headers: { 'x-internal-key': MOCK_KEY } };
    const res = mockRes();
    const next = jest.fn();
    validateInternalKey(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
