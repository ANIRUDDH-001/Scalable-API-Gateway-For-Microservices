const { v4: uuidv4 } = require('uuid');

/**
 * Assigns a UUID to every incoming request.
 * Priority: uses existing x-request-id from client if present (for tracing across systems),
 * otherwise generates a new UUID.
 * Always sets the response header so clients can correlate their request.
 */
const assignRequestId = (req, res, next) => {
  const incomingId = req.headers['x-request-id'];
  const requestId = incomingId && incomingId.length <= 64 ? incomingId : uuidv4();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  next();
};

module.exports = { assignRequestId };
