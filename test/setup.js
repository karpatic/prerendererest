// Global test setup
const path = require('path');

// Set test timeout globally
jest.setTimeout(30000);

// Mock console methods to reduce noise during testing
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
global.testUtils = {
  getTestDataPath: (filename) => path.join(__dirname, 'test-data', filename),
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};
