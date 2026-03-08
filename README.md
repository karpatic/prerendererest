# Prerendererest

[![npm version](https://img.shields.io/npm/v/prerendererest.svg)](https://www.npmjs.com/package/prerendererest)
[![npm downloads](https://img.shields.io/npm/dm/prerendererest.svg)](https://www.npmjs.com/package/prerendererest)
[![CI](https://github.com/karpatic/prerendererest/actions/workflows/ci.yml/badge.svg)](https://github.com/karpatic/prerendererest/actions/workflows/ci.yml)
[![GitHub Pages](https://img.shields.io/badge/demo-live-2ea44f)](https://karpatic.github.io/prerendererest/)

**Turn your SPA into crawlable, shareable HTML in one command.**

Prerendererest pre-renders React/Vue/SPA routes using Puppeteer so your site is easier to index, faster to paint, and cleaner to share on social platforms.

---

## Why teams use it

- **Better SEO:** Search bots get real HTML, not just a JS shell.
- **Faster first impression:** Users see meaningful content sooner.
- **Cleaner link previews:** Social crawlers can read title/description/content.
- **Simple workflow:** Drop it into your existing build pipeline.

## Perfect for

- Marketing sites built as SPAs
- Product landing pages with multiple routes
- Agency client projects that need "SEO + speed" fast
- Teams that want prerendering without full SSR complexity

---

## Quick start (60 seconds)

```bash
npm install prerendererest
npx prerendererest --source ./build --crawl --headless
```

### Add it to your scripts

```json
{
  "scripts": {
    "build": "react-scripts build",
    "prerender": "prerendererest --source ./build --crawl --headless",
    "build:seo": "npm run build && npm run prerender"
  }
}
```

---

## Before vs after

**Before (typical SPA shell)**

```html
<body>
  <div id="root"></div>
  <script src="/static/js/main.js"></script>
</body>
```

**After (pre-rendered output)**

```html
<body>
  <div id="root">
    <h1>Pricing</h1>
    <p>Static HTML ready for SEO and fast first paint.</p>
  </div>
  <script src="/static/js/main.js" defer></script>
</body>
```

---

## Distribution

- **npm:** https://www.npmjs.com/package/prerendererest
- **GitHub Packages:** https://github.com/karpatic/prerendererest/pkgs/npm/prerendererest
- **GitHub Pages demo:** https://karpatic.github.io/prerendererest/
- **unpkg CDN:** https://unpkg.com/prerendererest/
- **jsDelivr CDN:** https://cdn.jsdelivr.net/npm/prerendererest/

---

## Automation (already wired)

- **CI:** runs on push/PR (`.github/workflows/ci.yml`)
- **Dual publish on GitHub Release:** (`.github/workflows/npm-publish.yml`)
  - Publishes `prerendererest` to npm
  - Publishes mirror package to GitHub Packages
- **GitHub Pages deploy:** (`.github/workflows/pages.yml`)

---

## License

MIT
