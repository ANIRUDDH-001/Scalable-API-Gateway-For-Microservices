const promClient = require('prom-client');

// Initialize the default registry
const register = new promClient.Registry();

// Enable default system metrics (CPU, memory, etc.)
// Provide a prefix for gateway metrics
promClient.collectDefaultMetrics({
  app: 'api-gateway',
  prefix: 'gateway_',
  register,
});

// Custom metric: HTTP Request Duration
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

/**
 * Express middleware to track request durations
 */
const metricsMiddleware = (req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();

  res.on('finish', () => {
    // Determine route name (fall back to path if route is not defined)
    const route = req.route ? req.route.path : req.path;
    end({
      method: req.method,
      route,
      status_code: res.statusCode,
    });
  });

  next();
};

/**
 * Express route handler to expose metrics
 */
const metricsHandler = async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
};

module.exports = {
  metricsMiddleware,
  metricsHandler,
  register,
};
