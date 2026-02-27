# CryptoVision Ultra Holo

## Current State
Full-stack crypto trading simulation app with:
- HomePage (landing screen with Launch App button)
- MainLayout with 8 pages: Dashboard, Trade, Portfolio, Charts, Alerts, Gamification, Academy, Settings
- Glassmorphic dark space theme with neon accents
- CoinIcon component for BTC, ETH, SOL, BNB, ADA, DOGE, XRP, MATIC
- 5 chart types in Charts page
- MarketContext (bull/bear/normal modes), AlertsContext
- The last deployment failed when attempting to add PWA support

## Requested Changes (Diff)

### Add
- PWA manifest (manifest.json) in public/ with name, icons, display: standalone, theme_color
- Service worker (sw.js) for offline caching and installability
- PWA meta tags in index.html (theme-color, apple-touch-icon, manifest link)
- "Install App" button on HomePage that appears only when the browser's beforeinstallprompt event fires
- PWA install logic hook (usePWAInstall) that captures beforeinstallprompt and prompts install
- App icons at multiple sizes for PWA (192x192, 512x512) — can reuse/adapt existing logo

### Modify
- index.html: add manifest link, theme-color meta, apple-mobile-web-app meta tags, PWA icons
- HomePage.tsx: add "Install App" button below the "Launch App" button, only visible when install prompt is available
- vite.config.js: no changes needed (standard Vite handles SW registration via manual script)

### Remove
- Nothing to remove

## Implementation Plan
1. Create /public/manifest.json with full PWA manifest config
2. Create /public/sw.js as a minimal service worker with cache-first strategy
3. Update index.html with PWA meta tags and manifest link
4. Create usePWAInstall hook that listens for beforeinstallprompt and provides install() function + canInstall state
5. Update HomePage.tsx to import usePWAInstall and render "Install App" button conditionally
6. Validate: typecheck and build pass cleanly
