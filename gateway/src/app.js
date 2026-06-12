const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const healthRouter = require('./routes/health.routes');

const app = express();

// Security and parsing middleware
app.use(helmet());
app.use(cors());
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
