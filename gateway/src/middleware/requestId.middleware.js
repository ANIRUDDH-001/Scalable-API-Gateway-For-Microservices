const { v4: uuidv4 } = require('uuid');

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Assigns a UUID v4 to every incoming request.
 * Accepts a client-supplied x-request-id ONLY if it is a valid UUID v4.
 * Arbitrary strings are rejected to prevent log injection via this header.
 * Always reflects the final requestId back in the response header.
 */
const assignRequestId = (req, res, next) => {
  const incomingId = req.headers['x-request-id'];
  const isValidUuid = incomingId && UUID_V4_REGEX.test(incomingId);
  const requestId = isValidUuid ? incomingId : uuidv4();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  next();
};

module.exports = { assignRequestId };
