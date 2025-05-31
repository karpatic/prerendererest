# Prerendererest

A fast and flexible pre-rendering tool for static site generation using Puppeteer. Pre-render your React, Vue, or any SPA into static HTML files for better SEO and faster initial page loads. Basically a stripped down version of React-Snap but with added support for the things I wanted to see. Easy to edit with AI since it's 500 lines of rather straightforward code. Feel free to grab a copy for your own use.

## Features

- 🚀 Fast pre-rendering using Puppeteer
- 🕷️ Automatic crawling of internal links
- 📱 Configurable viewport for responsive pre-rendering
- 🗜️ Built-in HTML minification
- 🔧 Extensive configuration options
- 📝 Detailed logging and error handling
- 🛡️ Third-party request filtering
- ⚡ Concurrent processing support
- 🔄 Automatic 200.html fallback generation for SPAs

## Installation

```bash
npm install prerendererest
```

Or use it directly with npx:

```bash
npx prerendererest --source ./build --headless
```

## Usage

### Command Line

```bash
# Basic usage
node index.js --source ./build --headless

# Pre-render specific pages
node index.js --include "/index.html,/about.html,/contact.html" --source ./build --headless

# Custom destination
node index.js --source ./build --destination ./dist --headless

# Enable crawling with custom settings
node index.js --source ./build --crawl --concurrency 4 --headless
```

### Programmatic Usage

```javascript
const { run } = require('prerendererest');

const options = {
  source: './build',
  destination: './dist',
  include: ['/index.html', '/about.html'],
  headless: true,
  crawl: true
};

run(options).then(() => {
  console.log('Pre-rendering complete!');
}).catch(error => {
  console.error('Pre-rendering failed:', error);
});
```

## Configuration Options

### Core Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `source` | string | `"./docs"` | Source directory containing your built app |
| `destination` | string | `source` | Destination directory for pre-rendered files |
| `include` | array | `["/index.html"]` | List of pages to pre-render |
| `port` | number | `45678` | Port for the local development server |
| `headless` | boolean | `false` | Run browser in headless mode |
| `crawl` | boolean | `true` | Automatically discover and crawl internal links |

### Advanced Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `userAgent` | string | `"Prerendererest"` | User agent string for requests |
| `viewport` | object | `{width: 480, height: 850}` | Viewport size for rendering |
| `concurrency` | number | `1` | Number of concurrent pages to process |
| `skipThirdPartyRequests` | boolean | `false` | Block external requests during rendering |
| `puppeteerArgs` | array | `["--no-sandbox", "--disable-setuid-sandbox"]` | Additional Puppeteer arguments |
| `skipExistingCheck` | boolean | `false` | Skip the 200.html existence check |

### HTML Processing Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `minifyHtml` | object | `{collapseWhitespace: true, removeComments: true}` | HTML minification options |
| `inlineCss` | boolean | `false` | Inline CSS styles |
| `removeStyleTags` | boolean | `false` | Remove style tags from HTML |
| `removeScriptTags` | boolean | `false` | Remove script tags from HTML |
| `asyncScriptTags` | boolean | `false` | Add async attribute to script tags |
| `preloadImages` | boolean | `false` | Add preload hints for images |

## Command Line Arguments

```bash
# Source and destination
--source <path>              # Source directory (default: ./docs)
--destination <path>         # Destination directory
--include <pages>            # Comma-separated list of pages to include

# Browser options
--headless                   # Run in headless mode
--viewport <json>            # Viewport size as JSON object
--userAgent <string>         # Custom user agent
--puppeteerArgs <args>       # Comma-separated Puppeteer arguments

# Crawling options
--crawl                      # Enable automatic crawling
--no-crawl                   # Disable automatic crawling
--concurrency <number>       # Number of concurrent processes

# Network options
--skipThirdPartyRequests     # Block external requests
--port <number>              # Local server port

# Safety options
--skipExistingCheck          # Skip 200.html existence check

# HTML processing
--minifyHtml <json>          # HTML minification options as JSON
--inlineCss                  # Inline CSS styles
--removeStyleTags            # Remove style tags
--removeScriptTags           # Remove script tags
--asyncScriptTags            # Add async to script tags
--preloadImages              # Add image preload hints
```

## Examples

### Basic React App Pre-rendering

```bash
# After building your React app
npm run build
npx prerendererest --source ./build --headless --crawl
```

### Multi-page Application

```bash
node index.js \
  --source ./dist \
  --include "/index.html,/about.html,/products.html,/contact.html" \
  --headless \
  --minifyHtml '{"collapseWhitespace":true,"removeComments":true}' \
  --viewport '{"width":1200,"height":800}'
```

### Performance Optimized

```bash
node index.js \
  --source ./build \
  --destination ./prerendered \
  --headless \
  --crawl \
  --concurrency 4 \
  --skipThirdPartyRequests \
  --removeScriptTags \
  --inlineCss
```

### Development Mode

```bash
node index.js \
  --source ./build \
  --port 3000 \
  --userAgent "Development Bot" \
  --viewport '{"width":1024,"height":768}'
```

### Skip Safety Check for Specific Pages

```bash
# Pre-render specific page without crawling and skip 200.html check
node index.js --skipExistingCheck --no-crawl --include "/labs/01_nb_2_html_tests.html" --source "./docs"
```

## How It Works

1. **Server Setup**: Creates a local Express server to serve your static files
2. **200.html Generation**: Creates a 200.html fallback file from index.html for SPA routing
3. **Page Discovery**: Starts with specified pages in `include` option
4. **Crawling**: If enabled, automatically discovers internal links
5. **Rendering**: Uses Puppeteer to load each page and wait for content
6. **Processing**: Applies HTML minification and other optimizations
7. **Output**: Saves pre-rendered HTML files to the destination directory

## SPA Routing & 200.html

Prerendererest automatically handles Single Page Application (SPA) routing by creating a `200.html` file from your `index.html`. This file serves as a fallback for unknown routes, ensuring your SPA routing works correctly on static hosting platforms like Netlify, Vercel, or GitHub Pages.

### 200.html Safety Check

By default, Prerendererest will abort if it detects an existing `200.html` file in your source directory to prevent overwriting important configurations. You can bypass this check using the `--skipExistingCheck` flag.

```bash
# Skip the 200.html existence check
node index.js --source ./build --headless --skipExistingCheck
```

## Requirements

- Node.js 14+ 
- Modern browsers support (Chrome/Chromium for Puppeteer)

## Troubleshooting

### Common Issues

**Port already in use**: Change the port using `--port <number>`

**Memory issues**: Reduce concurrency with `--concurrency 1`

**External resources failing**: Use `--skipThirdPartyRequests` to block external requests

**Pages not found**: Ensure your app uses client-side routing and has a proper fallback

**200.html already exists**: Use `--skipExistingCheck` to bypass the safety check if you're sure it's safe to overwrite

### Debug Mode

Run without `--headless` to see the browser in action:

```bash
node index.js --source ./build --viewport '{"width":1200,"height":800}'
```

## License

MIT

## Contributing

Pull requests are welcome! Please ensure tests pass and follow the existing code style. I was using this thing for years and it works fine. Prior to publishing on NPM I had an AI add the entire 'test' directory and functionality in one fell swoop with the request "Please create a test folder for me and hook it up to package json run commands". I only lightly checked the code quality, which seamed fine. Prerendererest passes all 9 tests.
