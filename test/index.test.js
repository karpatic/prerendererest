const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Mock test data directory
const testDataDir = path.join(__dirname, 'test-data');
const testSourceDir = path.join(testDataDir, 'source');
const testDestDir = path.join(testDataDir, 'dest');

describe('Prerendererest CLI Integration Tests', () => {
  beforeAll(async () => {
    // Create test directories
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    if (!fs.existsSync(testSourceDir)) {
      fs.mkdirSync(testSourceDir, { recursive: true });
    }
    if (!fs.existsSync(testDestDir)) {
      fs.mkdirSync(testDestDir, { recursive: true });
    }

    // Create a comprehensive test HTML file with navigation
    const testHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Page</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .nav { margin-bottom: 20px; }
        .nav a { margin-right: 10px; text-decoration: none; }
    </style>
</head>
<body>
    <nav class="nav">
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
    </nav>
    <h1>Hello World</h1>
    <p>This is a test page for prerendering.</p>
    <script>
        console.log('Test page loaded');
        // Simulate some dynamic content
        document.addEventListener('DOMContentLoaded', function() {
            const timestamp = new Date().toISOString();
            document.body.setAttribute('data-rendered', timestamp);
        });
    </script>
</body>
</html>`;
    
    fs.writeFileSync(path.join(testSourceDir, 'index.html'), testHtml);
    
    const aboutHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About Page</title>
</head>
<body>
    <nav class="nav">
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
    </nav>
    <h1>About Us</h1>
    <p>Learn more about our company.</p>
</body>
</html>`;
    
    fs.writeFileSync(path.join(testSourceDir, 'about.html'), aboutHtml);

    const contactHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Page</title>
</head>
<body>
    <nav class="nav">
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
    </nav>
    <h1>Contact Us</h1>
    <p>Get in touch with us.</p>
</body>
</html>`;
    
    fs.writeFileSync(path.join(testSourceDir, 'contact.html'), contactHtml);
  });

  afterAll(() => {
    // Clean up test directories
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });

  describe('CLI Help and Error Handling', () => {
    test('should display help information with --help flag', (done) => {
      const child = spawn('node', [path.join(__dirname, '..', 'index.js'), '--help'], {
        stdio: 'pipe'
      });

      let stdout = '';
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(stdout).toContain('Usage:');
        expect(stdout).toContain('Options:');
        done();
      });
    }, 15000);

    test('should handle missing source directory gracefully', (done) => {
      const child = spawn('node', [
        path.join(__dirname, '..', 'index.js'),
        '--source', '/nonexistent/path/that/does/not/exist',
        '--headless'
      ], {
        stdio: 'pipe'
      });

      let stderr = '';
      let stdout = '';
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.on('close', (code) => {
        expect(code).not.toBe(0);
        expect(stderr.length > 0 || stdout.includes('Error') || stdout.includes('not found')).toBe(true);
        done();
      });
    }, 15000);
  });

  describe('Basic Pre-rendering', () => {
    test('should process single HTML file without crawling', (done) => {
      // Clean destination first
      if (fs.existsSync(testDestDir)) {
        fs.rmSync(testDestDir, { recursive: true, force: true });
        fs.mkdirSync(testDestDir, { recursive: true });
      }

      const child = spawn('node', [
        path.join(__dirname, '..', 'index.js'),
        '--source', testSourceDir,
        '--destination', testDestDir,
        '--headless',
        '--no-crawl',
        '--include', '/index.html'
      ], {
        stdio: 'pipe'
      });

      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code !== 0) {
          console.log('STDOUT:', stdout);
          console.log('STDERR:', stderr);
        }
        
        expect(code).toBe(0);
        expect(fs.existsSync(path.join(testDestDir, 'index.html'))).toBe(true);
        
        // Verify the content was processed
        const processedContent = fs.readFileSync(path.join(testDestDir, 'index.html'), 'utf8');
        expect(processedContent).toContain('<h1>Hello World</h1>');
        expect(processedContent).toContain('Test Page');
        
        done();
      });
    }, 45000);

    test('should process multiple specific pages', (done) => {
      // Clean destination first
      if (fs.existsSync(testDestDir)) {
        fs.rmSync(testDestDir, { recursive: true, force: true });
        fs.mkdirSync(testDestDir, { recursive: true });
      }

      const child = spawn('node', [
        path.join(__dirname, '..', 'index.js'),
        '--source', testSourceDir,
        '--destination', testDestDir,
        '--headless',
        '--no-crawl',
        '--include', '/index.html,/about.html'
      ], {
        stdio: 'pipe'
      });

      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code !== 0) {
          console.log('STDOUT:', stdout);
          console.log('STDERR:', stderr);
        }
        
        expect(code).toBe(0);
        expect(fs.existsSync(path.join(testDestDir, 'index.html'))).toBe(true);
        expect(fs.existsSync(path.join(testDestDir, 'about.html'))).toBe(true);
        
        done();
      });
    }, 45000);
  });

  describe('HTML Processing Options', () => {
    test('should apply HTML minification when enabled', (done) => {
      // Clean destination first
      if (fs.existsSync(testDestDir)) {
        fs.rmSync(testDestDir, { recursive: true, force: true });
        fs.mkdirSync(testDestDir, { recursive: true });
      }

      const child = spawn('node', [
        path.join(__dirname, '..', 'index.js'),
        '--source', testSourceDir,
        '--destination', testDestDir,
        '--headless',
        '--no-crawl',
        '--include', '/index.html',
        '--minifyHtml', '{"collapseWhitespace":true,"removeComments":true}'
      ], {
        stdio: 'pipe'
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        
        const processedContent = fs.readFileSync(path.join(testDestDir, 'index.html'), 'utf8');
        
        // Check that whitespace has been collapsed (no multiple spaces)
        expect(processedContent).not.toMatch(/\s{2,}/);
        
        done();
      });
    }, 45000);
  });

  describe('Configuration Options', () => {
    test('should accept custom viewport settings', (done) => {
      // Clean destination first
      if (fs.existsSync(testDestDir)) {
        fs.rmSync(testDestDir, { recursive: true, force: true });
        fs.mkdirSync(testDestDir, { recursive: true });
      }

      const child = spawn('node', [
        path.join(__dirname, '..', 'index.js'),
        '--source', testSourceDir,
        '--destination', testDestDir,
        '--headless',
        '--no-crawl',
        '--include', '/index.html',
        '--viewport', '{"width":1200,"height":800}'
      ], {
        stdio: 'pipe'
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(fs.existsSync(path.join(testDestDir, 'index.html'))).toBe(true);
        done();
      });
    }, 45000);
  });
});
