const express = require('express');
const cors = require('cors');
const { validateInternalKey } = require('./middleware/internalKey.middleware');
const healthRouter = require('./routes/health.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Internal key validation applied globally — health route bypasses it internally
app.use(validateInternalKey);

// Routes
app.use(healthRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Central error handler
app.use((err, req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({
    status: 'error',
    message: err.message || 'Internal server error',
  });
});

module.exports = app;
