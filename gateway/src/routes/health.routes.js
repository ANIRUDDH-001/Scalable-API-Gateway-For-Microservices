const express = require('express');
const axios = require('axios');
const config = require('../config');

const router = express.Router();

const SERVICE_HEALTH_TIMEOUT_MS = 3000;

/**
 * GET /health
 * Polls all three upstream services concurrently.
 * Returns 200 if all up, 207 if any down.
 * Never fails itself — a service being down is reported, not thrown.
 */
router.get('/health', async (_req, res) => {
  const serviceMap = {
    'auth-service': `${config.services.auth}/health`,
    'accounts-service': `${config.services.accounts}/health`,
    'transactions-service': `${config.services.transactions}/health`,
  };

  const checks = await Promise.allSettled(
    Object.entries(serviceMap).map(async ([name, url]) => {
      const { data } = await axios.get(url, { timeout: SERVICE_HEALTH_TIMEOUT_MS });
      return { name, status: 'up', detail: data };
    })
  );

  const services = {};
  checks.forEach((result, index) => {
    const name = Object.keys(serviceMap)[index];
    if (result.status === 'fulfilled') {
      services[name] = result.value;
    } else {
      services[name] = {
        name,
        status: 'down',
        error: result.reason?.message || 'Unreachable',
      };
    }
  });

  const allUp = Object.values(services).every((s) => s.status === 'up');
  const httpStatus = allUp ? 200 : 207;

  res.status(httpStatus).json({
    gateway: 'up',
    allServicesUp: allUp,
    timestamp: new Date().toISOString(),
    services,
  });
});

module.exports = router;
