const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { assignRequestId } = require('./middleware/requestId.middleware');
const { globalLimiter } = require('./middleware/rateLimit.middleware');
const healthRouter = require('./routes/health.routes');
const logger = require('./utils/logger');

const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173'
)
  .split(',')
  .map((o) => o.trim());

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  exposedHeaders: ['x-request-id', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  credentials: true,
  maxAge: 86400,
};

const helmetOptions = {
  contentSecurityPolicy: { directives: { defaultSrc: ["'none'"] } },
  referrerPolicy: { policy: 'no-referrer' },
  hsts: { maxAge: 31536000, includeSubDomains: true },
};

// Custom Morgan token to include X-Request-ID in access logs
morgan.token('request-id', (req) => req.requestId || 'unknown');

// JSON-formatted access log for Winston
const morganFormat = (tokens, req, res) =>
  JSON.stringify({
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: parseInt(tokens.status(req, res), 10),
    contentLength: tokens.res(req, res, 'content-length'),
    responseTime: `${tokens['response-time'](req, res)}ms`,
    ip: tokens['remote-addr'](req, res),
    requestId: tokens['request-id'](req, res),
  });

const app = express();

// Order matters: requestId → helmet → cors → rate limit → morgan → json
app.use(assignRequestId);
app.use(helmet(helmetOptions));
app.use(cors(corsOptions));
app.use(globalLimiter);
app.use(
  morgan(morganFormat, {
    stream: { write: (msg) => logger.http('HTTP', JSON.parse(msg.trim())) },
    skip: (req) => req.path === '/health' && req.method === 'GET',
  })
);
app.use(express.json({ limit: '10kb' }));

app.use(healthRouter);

const validatorRouter = require('./routes/validator.routes');
app.use('/api/v1', validatorRouter);

app.notFound = (req, res) => {
  res.status(404).json({ status: 'error', message: `${req.method} ${req.path} — route not found` });
};

module.exports = app;
