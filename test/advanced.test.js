const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Test data directory for advanced feature tests
const testDataDir = path.join(__dirname, 'test-data-advanced');
const testSourceDir = path.join(testDataDir, 'source');
const testDestDir = path.join(testDataDir, 'dest');

describe('Prerendererest Advanced Features', () => {
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

    // Create a SPA-style index.html
    const spaHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SPA Test App</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        nav a { margin-right: 15px; color: #007bff; text-decoration: none; }
        nav a:hover { text-decoration: underline; }
        .content { margin-top: 20px; padding: 20px; border: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="container">
        <nav>
            <a href="/">Home</a>
            <a href="/products">Products</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
        </nav>
        <div id="app">
            <div class="content">
                <h1>Welcome to SPA Test</h1>
                <p>This is a single page application for testing prerendering.</p>
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23007bff'/%3E%3Ctext x='50' y='55' fill='white' text-anchor='middle'%3ETest%3C/text%3E%3C/svg%3E" alt="Test Image" />
            </div>
        </div>
    </div>
    
    <script>
        // Simulate SPA routing
        window.addEventListener('DOMContentLoaded', function() {
            console.log('SPA initialized');
            
            // Add some dynamic content
            const timestamp = new Date().toISOString();
            document.body.setAttribute('data-spa-loaded', timestamp);
            
            // Simulate async content loading
            setTimeout(() => {
                const dynamicContent = document.createElement('div');
                dynamicContent.className = 'dynamic-content';
                dynamicContent.innerHTML = '<p>This content was loaded dynamically.</p>';
                document.getElementById('app').appendChild(dynamicContent);
            }, 100);
        });
        
        // Simulate some external API calls (for testing skipThirdPartyRequests)
        if (typeof fetch !== 'undefined') {
            fetch('https://jsonplaceholder.typicode.com/posts/1')
                .then(response => response.json())
                .then(data => console.log('External API data:', data))
                .catch(err => console.log('External API failed:', err));
        }
    </script>
</body>
</html>`;
    
    fs.writeFileSync(path.join(testSourceDir, 'index.html'), spaHtml);

    // Create a CSS file to test inline CSS functionality
    const cssContent = `
/* Test CSS file */
.test-class {
    color: red;
    font-weight: bold;
}

.another-class {
    background-color: #f0f0f0;
    padding: 10px;
}
`;
    
    fs.writeFileSync(path.join(testSourceDir, 'styles.css'), cssContent);

    // Create a 200.html file to test skipExistingCheck
    fs.writeFileSync(path.join(testSourceDir, '200.html'), '<html><body>Existing 200.html</body></html>');
  });

  afterAll(() => {
    // Clean up test directories
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });

  describe('200.html Safety Check', () => {
    test('should fail when 200.html exists without skipExistingCheck', (done) => {
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
        expect(code).not.toBe(0);
        const output = stdout + stderr;
        expect(output).toContain('200.html');
        done();
      });
    }, 30000);

    test('should succeed when 200.html exists with skipExistingCheck', (done) => {
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
        '--skipExistingCheck',
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
        done();
      });
    }, 45000);
  });

  describe('Script and Style Processing', () => {
    test('should process HTML with script removal option', (done) => {
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
        '--skipExistingCheck',
        '--removeScriptTags',
        '--include', '/index.html'
      ], {
        stdio: 'pipe'
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        
        const processedContent = fs.readFileSync(path.join(testDestDir, 'index.html'), 'utf8');
        
        // Should not contain script tags
        expect(processedContent).not.toContain('<script>');
        expect(processedContent).not.toContain('</script>');
        
        // But should still contain other content
        expect(processedContent).toContain('Welcome to SPA Test');
        
        done();
      });
    }, 45000);

    test('should handle async script tags option', (done) => {
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
        '--skipExistingCheck',
        '--asyncScriptTags',
        '--include', '/index.html'
      ], {
        stdio: 'pipe'
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        
        const processedContent = fs.readFileSync(path.join(testDestDir, 'index.html'), 'utf8');
        
        // Should contain async attribute on script tags
        if (processedContent.includes('<script')) {
          expect(processedContent).toContain('async');
        }
        
        done();
      });
    }, 45000);
  });

  describe('Third-party Request Filtering', () => {
    test('should process with third-party request blocking', (done) => {
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
        '--skipExistingCheck',
        '--skipThirdPartyRequests',
        '--include', '/index.html'
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

  describe('Custom User Agent', () => {
    test('should accept custom user agent', (done) => {
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
        '--skipExistingCheck',
        '--userAgent', 'TestBot/1.0',
        '--include', '/index.html'
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
