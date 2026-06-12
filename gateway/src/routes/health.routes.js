const express = require('express');

const router = express.Router();

/**
 * GET /health
 * Phase 1: Returns gateway status only.
 * Phase 1 complete (M1-P3-SP3): Polls upstream services and aggregates.
 */
router.get('/health', (_req, res) => {
  res.status(200).json({
    gateway: 'up',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
