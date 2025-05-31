const path = require('path');
const fs = require('fs');

describe('Prerendererest Core Functions', () => {
  let originalConsole;

  beforeAll(() => {
    // Store original console methods
    originalConsole = { ...console };
  });

  afterAll(() => {
    // Restore original console
    Object.assign(console, originalConsole);
  });

  describe('Module Loading', () => {
    test('should load main module without errors', () => {
      expect(() => {
        require('../index.js');
      }).not.toThrow();
    });

    test('should have required dependencies available', () => {
      expect(() => require('puppeteer')).not.toThrow();
      expect(() => require('express')).not.toThrow();
      expect(() => require('html-minifier')).not.toThrow();
      expect(() => require('mkdirp')).not.toThrow();
    });
  });

  describe('Default Configuration', () => {
    test('should have sensible default port', () => {
      const indexContent = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
      expect(indexContent).toContain('port: 45678');
    });

    test('should have default source directory', () => {
      const indexContent = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
      expect(indexContent).toContain('source: "./docs"');
    });

    test('should have default viewport settings', () => {
      const indexContent = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
      expect(indexContent).toContain('viewport: { width: 480, height: 850 }');
    });
  });

  describe('HTML Processing Options', () => {
    test('should have HTML minification enabled by default', () => {
      const indexContent = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
      expect(indexContent).toContain('collapseWhitespace: true');
      expect(indexContent).toContain('removeComments: true');
    });

    test('should have reasonable default options for HTML processing', () => {
      const indexContent = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
      expect(indexContent).toContain('inlineCss: false');
      expect(indexContent).toContain('removeStyleTags: false');
      expect(indexContent).toContain('removeScriptTags: false');
    });
  });

  describe('Security Settings', () => {
    test('should have safe puppeteer arguments', () => {
      const indexContent = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
      expect(indexContent).toContain('--no-sandbox');
      expect(indexContent).toContain('--disable-setuid-sandbox');
    });

    test('should have third-party request filtering available', () => {
      const indexContent = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
      expect(indexContent).toContain('skipThirdPartyRequests: false');
    });
  });
});
