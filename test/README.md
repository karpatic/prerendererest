# Testing Guide for Prerendererest

This document outlines the testing setup and available test commands for the Prerendererest project.

## Test Structure

```
test/
├── index.test.js       # Integration tests (CLI functionality)
├── unit.test.js        # Unit tests (module loading, defaults)
├── advanced.test.js    # Advanced feature tests (200.html, processing options)
├── performance.test.js # Performance and concurrency tests
├── setup.js           # Global test setup
├── .gitignore         # Test-specific gitignore
└── README.md          # This documentation
```

## Available Test Commands

### Basic Testing
```bash
# Run all tests
npm test

# Run tests in watch mode (reruns on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with detailed output
npm run test:verbose
```

### Specific Test Types
```bash
# Run only integration tests (CLI functionality)
npm run test:integration

# Run only unit tests (fast, basic validation)
npm run test:unit

# Run only advanced feature tests
npm run test:advanced

# Run only performance tests (slower)
npm run test:performance

# Run fast tests only (unit + advanced)
npm run test:fast

# Run slow tests only (integration + performance)
npm run test:slow

# Run tests for CI environment
npm run test:ci

# Debug tests with Node.js inspector
npm run test:debug
```

## Test Categories

### Integration Tests (`index.test.js`)
- CLI argument parsing and validation
- End-to-end pre-rendering workflows
- File system operations
- Server startup and shutdown
- Error handling scenarios
- HTML processing with real browser

### Unit Tests (`unit.test.js`)
- Module loading validation
- Default configuration verification
- Security settings validation
- Code structure tests (no external dependencies)

### Advanced Feature Tests (`advanced.test.js`)
- 200.html safety check functionality
- Script and style tag processing options
- Third-party request filtering
- Custom user agent configuration
- Complex HTML processing scenarios

### Performance Tests (`performance.test.js`)
- Concurrency testing with multiple workers
- Large content processing
- Custom port configuration
- Processing time validation
- Memory usage patterns

## Test Configuration

The project uses Jest as the testing framework with the following configuration:

- **Test Environment**: Node.js
- **Test Timeout**: 30 seconds (for Puppeteer operations)
- **Coverage**: Collected from `index.js`
- **Setup**: Global setup in `test/setup.js`

## Writing New Tests

### Integration Test Example
```javascript
test('should process HTML files with custom options', (done) => {
  const child = spawn('node', [
    path.join(__dirname, '..', 'index.js'),
    '--source', testSourceDir,
    '--headless',
    '--minifyHtml', '{"collapseWhitespace":true}'
  ], {
    stdio: 'pipe'
  });

  child.on('close', (code) => {
    expect(code).toBe(0);
    done();
  });
}, 30000);
```

### Unit Test Example
```javascript
test('should validate options correctly', () => {
  const validOptions = { source: './test', include: ['/index.html'] };
  expect(() => validateOptions(validOptions)).not.toThrow();
});
```

## Test Data

Tests use temporary directories created in `test/test-data/` which are automatically cleaned up after test completion.

## Debugging Tests

### Run tests with debug output
```bash
# Enable debug logging
DEBUG=* npm test

# Run specific test file
npx jest test/index.test.js

# Run tests with verbose output
npm test -- --verbose
```

### Common Issues

1. **Timeout Errors**: Increase timeout for Puppeteer operations
2. **Port Conflicts**: Tests use random ports to avoid conflicts
3. **File System**: Tests clean up temporary files automatically

## Coverage Reports

Coverage reports are generated in the `coverage/` directory and include:
- HTML report: `coverage/lcov-report/index.html`
- Text summary in terminal
- LCOV format for CI integration

## CI Integration

The `test:ci` command is optimized for continuous integration:
- No watch mode
- Coverage reporting
- Exit after completion
- Appropriate for automated testing environments
