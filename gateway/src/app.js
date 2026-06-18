const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { assignRequestId } = require('./middleware/requestId.middleware');
const { globalLimiter } = require('./middleware/rateLimit.middleware');
const healthRouter = require('./routes/health.routes');

const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173'
)
  .split(',')
  .map((o) => o.trim());

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
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
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      // API only serves JSON — no scripts, no frames, no media
    },
  },
  referrerPolicy: { policy: 'no-referrer' },
  hsts: { maxAge: 31536000, includeSubDomains: true },
};

const app = express();

// Request ID must be first — every subsequent middleware and log needs it
app.use(assignRequestId);

// Security and parsing middleware
app.use(helmet(helmetOptions));
app.use(cors(corsOptions));
app.use(globalLimiter);
app.use(express.json({ limit: '10kb' }));

// Gateway-level routes (not proxied)
app.use(healthRouter);

// 404 fallback — placed after proxy routes are registered (in index.js)
// This handler is exported separately so it can be added last
app.notFound = (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `${req.method} ${req.path} — route not found on gateway`,
  });
};

module.exports = app;
