const express = require('express');
const cors = require('cors');
const { validateInternalKey } = require('./middleware/internalKey.middleware');
const healthRouter = require('./routes/health.routes');
const transactionsRouter = require('./routes/transactions.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(validateInternalKey);

app.use(healthRouter);
app.use('/transactions', transactionsRouter);

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: `Route ${req.method} ${req.path} not found` });
});

app.use((err, req, res, _next) => {
  res
    .status(err.status || 500)
    .json({ status: 'error', message: err.message || 'Internal server error' });
});

module.exports = app;
