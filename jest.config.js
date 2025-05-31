module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/test/**/*.test.js',
    '**/test/**/*.spec.js'
  ],
  collectCoverageFrom: [
    'index.js',
    '!**/node_modules/**',
    '!**/test/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  testTimeout: 45000,
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  verbose: false,
  detectOpenHandles: true,
  forceExit: true,
  maxWorkers: 2
};
