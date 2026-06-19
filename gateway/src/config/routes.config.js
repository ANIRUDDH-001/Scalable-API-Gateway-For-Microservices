const config = require('./index');

/**
 * Declarative route table for the API Gateway.
 *
 * Each entry:
 *   prefix    {string}  - Express route prefix (e.g. '/api/v1/auth')
 *   target    {string}  - Upstream service base URL
 *   stripPath {string}  - Prefix to strip via pathRewrite
 *   isPublic  {boolean} - If true, no JWT authentication required
 *   limiter   {string}  - Name of rate limiter to apply ('auth' | 'global' | null)
 *
 * To add a new service: add an entry here. Do not edit proxy.routes.js.
 */
const routes = [
  {
    prefix: '/api/v1/auth',
    target: config.services.auth,
    stripPath: '/api/v1/auth',
    isPublic: true,
    limiter: 'auth',
  },
  {
    prefix: '/api/v1/accounts',
    target: config.services.accounts,
    stripPath: '/api/v1/accounts',
    isPublic: false,
    limiter: null,
  },
  {
    prefix: '/api/v1/transactions',
    target: config.services.transactions,
    stripPath: '/api/v1/transactions',
    isPublic: false,
    limiter: null,
  },
];

module.exports = routes;
