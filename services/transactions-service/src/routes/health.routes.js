const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/health', (_req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'up',
    service: 'transactions-service',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
