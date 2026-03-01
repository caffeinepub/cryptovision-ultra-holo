# CryptoVision Ultra Holo

## Current State

Full-stack crypto trading simulator with:
- Motoko backend: buy/sell, portfolio, trade history, badges/XP, leaderboard, academy content, AI tutor lessons, market mode, reset account
- Frontend pages: HomePage, Dashboard, Trade, Portfolio, Charts (5 types), Alerts, Gamification, Academy, AiTutor, Settings
- Liquid glass / glassmorphic dark theme with neon accents
- Offline progress saving (localStorage)
- PWA install support
- Restart account when broke
- NOVA AI robot tutor (online only, fetches lessons from backend)

## Requested Changes (Diff)

### Add
- **Wallet page**: Full money breakdown — current balance, total invested, profit/loss per coin, total net worth, allocation pie chart, and full transaction history list
- **Portfolio performance chart**: Net worth over time (tracked in localStorage on every trade/price update)
- **Stop-loss / take-profit**: Per-coin auto-sell orders stored in localStorage; price ticker checks and triggers them automatically
- **Coin comparison tool**: Select 2+ coins and compare price change %, 24h range, simulated volume side by side
- **Simulated crypto news feed**: Pre-written news cards with coin tags, timestamps, sentiment (bullish/bearish/neutral)
- **Risk score**: Portfolio risk rating (1–10) based on allocation concentration and volatility profile of held coins
- **NOVA AI tutor offline**: Cache all lessons to localStorage on first load; NOVA works fully without internet
- **Generated NOVA robot image**: Custom AI robot image displayed on the AI Tutor page
- **Liquid glass design upgrade**: Apply true liquid glass effect across all panels — layered blur, inner highlight border, subtle refraction shimmer, fluid hover animations

### Modify
- **MainLayout**: Add Wallet page to nav (replace or extend Portfolio slot), add Coin Compare and News pages
- **AiTutor page**: Use generated NOVA robot image; load lessons from localStorage cache if backend unavailable; show offline badge when cached
- **Dashboard**: Show risk score widget and net worth trend sparkline
- **Portfolio page**: Show allocation breakdown and risk score
- **Trade page**: Add stop-loss / take-profit input fields per trade
- **index.css**: Extend with liquid glass utility classes — `glass-liquid`, `glass-refract`, shimmer keyframes, fluid hover transitions

### Remove
- Nothing removed

## Implementation Plan

1. Extend `index.css` with liquid glass utility classes: `glass-liquid` (layered blur + inner highlight), `glass-refract` (shimmer pseudo-element), fluid hover scale transitions
2. Add Wallet page (`WalletPage.tsx`) with balance card, net worth card, per-coin P&L table, allocation chart, and transaction history
3. Add News page (`NewsPage.tsx`) with simulated crypto news feed, sentiment badges, coin tags
4. Add CoinCompare page (`CoinComparePage.tsx`) with multi-coin selector and comparison table/chart
5. Update `AiTutor.tsx` to show NOVA robot image, cache lessons to localStorage, load from cache if backend fails, show offline indicator
6. Update `Trade.tsx` to add stop-loss and take-profit fields per trade, stored and checked via a new `useStopLoss` hook
7. Update `Dashboard.tsx` to show risk score widget and net worth sparkline
8. Update `Portfolio.tsx` to show allocation pie and risk score
9. Update `MainLayout.tsx` to include Wallet, News, and CoinCompare in nav
10. Update `types/navigation.ts` to include new page types
11. Apply `glass-liquid` classes throughout all page components for the liquid glass upgrade
12. Wire net-worth history tracking into `MarketContext` or a new `useNetWorthHistory` hook (localStorage-backed)
