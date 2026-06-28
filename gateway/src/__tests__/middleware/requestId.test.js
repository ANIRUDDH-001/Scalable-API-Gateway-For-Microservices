const { assignRequestId } = require('../../middleware/requestId.middleware');

describe('requestId middleware', () => {
  it('assigns a new uuid if x-request-id is not provided', () => {
    const req = { headers: {} };
    const res = { setHeader: jest.fn() };
    const next = jest.fn();
    assignRequestId(req, res, next);
    expect(req.requestId).toBeDefined();
    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', req.requestId);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('uses existing x-request-id if provided', () => {
    const req = { headers: { 'x-request-id': 'custom-id-123' } };
    const res = { setHeader: jest.fn() };
    const next = jest.fn();
    assignRequestId(req, res, next);
    expect(req.requestId).toBe('custom-id-123');
    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', 'custom-id-123');
    expect(next).toHaveBeenCalledTimes(1);
  });
});
