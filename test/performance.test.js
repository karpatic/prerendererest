const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Test data directory for performance tests
const testDataDir = path.join(__dirname, 'test-data-performance');
const testSourceDir = path.join(testDataDir, 'source');
const testDestDir = path.join(testDataDir, 'dest');

describe('Prerendererest Performance Tests', () => {
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

    // Create multiple test pages for performance testing
    const pages = ['index', 'about', 'products', 'contact', 'blog', 'services'];
    
    pages.forEach(page => {
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.charAt(0).toUpperCase() + page.slice(1)} Page</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            line-height: 1.6;
        }
        .container { max-width: 800px; margin: 0 auto; }
        nav { margin-bottom: 20px; padding: 10px; background: #f4f4f4; }
        nav a { margin-right: 15px; color: #333; text-decoration: none; }
        nav a:hover { text-decoration: underline; }
        .content { padding: 20px; background: white; border: 1px solid #ddd; }
        footer { margin-top: 20px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <nav>
            ${pages.map(p => `<a href="/${p === 'index' ? '' : p}">${p.charAt(0).toUpperCase() + p.slice(1)}</a>`).join('')}
        </nav>
        <div class="content">
            <h1>${page.charAt(0).toUpperCase() + page.slice(1)} Page</h1>
            <p>This is the ${page} page content. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</p>
            <ul>
                <li>Feature 1 of ${page}</li>
                <li>Feature 2 of ${page}</li>
                <li>Feature 3 of ${page}</li>
            </ul>
        </div>
        <footer>
            <p>&copy; 2025 Test Company. All rights reserved.</p>
        </footer>
    </div>
    
    <script>
        // Simulate some processing time
        console.log('${page} page loaded');
        
        document.addEventListener('DOMContentLoaded', function() {
            // Simulate dynamic content loading
            setTimeout(() => {
                const timestamp = new Date().toISOString();
                document.body.setAttribute('data-processed', timestamp);
                
                // Add some dynamic content
                const dynamicDiv = document.createElement('div');
                dynamicDiv.innerHTML = '<p>Dynamic content loaded for ${page}</p>';
                document.querySelector('.content').appendChild(dynamicDiv);
            }, 50);
        });
    </script>
</body>
</html>`;
      
      fs.writeFileSync(path.join(testSourceDir, `${page}.html`), htmlContent);
    });
  });

  afterAll(() => {
    // Clean up test directories
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });

  describe('Concurrency Tests', () => {
    test('should process multiple pages with concurrency=1', (done) => {
      // Clean destination first
      if (fs.existsSync(testDestDir)) {
        fs.rmSync(testDestDir, { recursive: true, force: true });
        fs.mkdirSync(testDestDir, { recursive: true });
      }

      const startTime = Date.now();
      
      const child = spawn('node', [
        path.join(__dirname, '..', 'index.js'),
        '--source', testSourceDir,
        '--destination', testDestDir,
        '--headless',
        '--no-crawl',
        '--concurrency', '1',
        '--include', '/index.html,/about.html,/products.html'
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
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        if (code !== 0) {
          console.log('STDOUT:', stdout);
          console.log('STDERR:', stderr);
        }
        
        expect(code).toBe(0);
        expect(fs.existsSync(path.join(testDestDir, 'index.html'))).toBe(true);
        expect(fs.existsSync(path.join(testDestDir, 'about.html'))).toBe(true);
        expect(fs.existsSync(path.join(testDestDir, 'products.html'))).toBe(true);
        
        // Should take a reasonable amount of time
        expect(duration).toBeLessThan(60000); // Less than 60 seconds
        
        done();
      });
    }, 70000);

    test('should process multiple pages with concurrency=2', (done) => {
      // Clean destination first
      if (fs.existsSync(testDestDir)) {
        fs.rmSync(testDestDir, { recursive: true, force: true });
        fs.mkdirSync(testDestDir, { recursive: true });
      }

      const startTime = Date.now();
      
      const child = spawn('node', [
        path.join(__dirname, '..', 'index.js'),
        '--source', testSourceDir,
        '--destination', testDestDir,
        '--headless',
        '--no-crawl',
        '--concurrency', '2',
        '--include', '/index.html,/about.html,/products.html,/contact.html'
      ], {
        stdio: 'pipe'
      });

      child.on('close', (code) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        expect(code).toBe(0);
        expect(fs.existsSync(path.join(testDestDir, 'index.html'))).toBe(true);
        expect(fs.existsSync(path.join(testDestDir, 'about.html'))).toBe(true);
        expect(fs.existsSync(path.join(testDestDir, 'products.html'))).toBe(true);
        expect(fs.existsSync(path.join(testDestDir, 'contact.html'))).toBe(true);
        
        // Should be faster than sequential processing (though this is hard to test reliably)
        expect(duration).toBeLessThan(60000); // Less than 60 seconds
        
        done();
      });
    }, 70000);
  });

  describe('Port Configuration', () => {
    test('should accept custom port configuration', (done) => {
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
        '--port', '3333',
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

  describe('Large Content Processing', () => {
    test('should handle page with large content', (done) => {
      // Create a page with lots of content
      const largeContent = Array(1000).fill().map((_, i) => 
        `<p>This is paragraph ${i + 1} with some content to make the page larger.</p>`
      ).join('');
      
      const largePageHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Large Page</title>
</head>
<body>
    <h1>Large Content Page</h1>
    ${largeContent}
    <script>
        console.log('Large page loaded with ${largeContent.length} characters');
        document.addEventListener('DOMContentLoaded', function() {
            document.body.setAttribute('data-large-page', 'true');
        });
    </script>
</body>
</html>`;
      
      fs.writeFileSync(path.join(testSourceDir, 'large.html'), largePageHtml);
      
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
        '--include', '/large.html'
      ], {
        stdio: 'pipe'
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(fs.existsSync(path.join(testDestDir, 'large.html'))).toBe(true);
        
        // Verify the content was processed correctly
        const processedContent = fs.readFileSync(path.join(testDestDir, 'large.html'), 'utf8');
        expect(processedContent).toContain('Large Content Page');
        expect(processedContent.length).toBeGreaterThan(10000); // Should be substantial content
        
        done();
      });
    }, 60000);
  });
});
