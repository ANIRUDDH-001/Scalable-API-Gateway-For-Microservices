module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/*.test.js'],
  collectCoverageFrom: [
    'gateway/src/**/*.js',
    'services/*/src/**/*.js',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/index.js', // Entry points excluded — covered by integration tests
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  coverageReporters: ['text', 'lcov'],
  modulePathIgnorePatterns: ['<rootDir>/node_modules'],
};
