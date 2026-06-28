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

  it('uses existing x-request-id if it is a valid UUID v4', () => {
    const req = { headers: { 'x-request-id': 'a1b2c3d4-e5f6-4789-ab12-cd34ef567890' } };
    const res = { setHeader: jest.fn() };
    const next = jest.fn();
    assignRequestId(req, res, next);
    expect(req.requestId).toBe('a1b2c3d4-e5f6-4789-ab12-cd34ef567890');
    expect(res.setHeader).toHaveBeenCalledWith(
      'x-request-id',
      'a1b2c3d4-e5f6-4789-ab12-cd34ef567890'
    );
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('generates a new uuid when x-request-id is not a valid uuid', () => {
    const req = { headers: { 'x-request-id': 'not-a-uuid' } };
    const res = { setHeader: jest.fn() };
    const next = jest.fn();
    assignRequestId(req, res, next);
    // Must not pass through the invalid string
    expect(req.requestId).not.toBe('not-a-uuid');
    // Must still be a valid uuid v4
    expect(req.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it('generates a new uuid for log-injection attempt', () => {
    const malicious = '{"$ne":null}';
    const req = { headers: { 'x-request-id': malicious } };
    const res = { setHeader: jest.fn() };
    const next = jest.fn();
    assignRequestId(req, res, next);
    expect(req.requestId).not.toBe(malicious);
  });
});
