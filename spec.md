# CryptoVision Ultra Holo

## Current State

Full-stack crypto trading simulator with:
- Backend (Motoko): user portfolio stored as `Map<Text,Float>`, trade history, buy/sell functions, badges/XP, leaderboard, academy articles, market mode
- Frontend: Dashboard, Trade, Portfolio, Charts, Alerts, Gamification, Academy, Settings pages
- Glassmorphic dark UI with OKLCH neon colors, animated coin icons, multiple chart types (line, area, candlestick, RSI, volume)
- PWA manifest + service worker for install support

**Critical bug**: `UserDataView.portfolio` is typed as a single `{coin: string, quantity: number}` object in the backend, but the frontend expects an array. This causes `holding` to always be 0, making the Sell button permanently disabled.

## Requested Changes (Diff)

### Add
- **Offline progress save**: Use `localStorage` to cache user portfolio, balance, trade history, XP, and badges. On app load, show cached data immediately while fetching from backend. On each trade/mutation success, also write to `localStorage`. This ensures data is visible offline.
- **AI Robot Tutor**: A new "AI Tutor" page and/or floating bot companion. The robot teaches trading concepts interactively. User can ask questions (from a preset list) and the AI bot replies with educational tips. The bot can also proactively suggest lessons based on the user's activity (e.g. "You just made your first trade! Here's what P&L means..."). Backend stores a list of tutor lessons/tips with categories. Frontend shows a chat-style interface with the AI robot avatar.
- **Backend: AI Tutor lessons endpoint** — `getTutorLessons()` returns a list of `TutorLesson` records with id, category, question, answer, and follow-up tips.
- **Backend: portfolio fix** — Change `UserDataView.portfolio` from a single object to `Array<{coin: Text; quantity: Float}>` so all holdings are returned.

### Modify
- **Trade page**: Fix sell button logic — after backend portfolio fix, `holdings` should be correctly read as an array, sell button should be enabled when user holds that coin.
- **Portfolio page**: Fix holdings display to correctly use the array portfolio.
- **Dashboard**: Fix portfolio display to use array portfolio.
- **Offline sync logic**: Wrap all backend queries with a localStorage fallback. If backend call fails (offline), use cached data. On success, update cache.
- **AI Tutor context**: Add a new `TutorContext` that tracks which lessons the user has seen, surfaces contextual tips after trades.

### Remove
- Nothing removed.

## Implementation Plan

1. **Backend**: Fix `UserDataView` — change `portfolio` field from `{coin: Text; quantity: Float}` to `[{coin: Text; quantity: Float}]` (full array). Update `toUserDataView` to return all portfolio entries as an array. Add `TutorLesson` type and `getTutorLessons()` query returning 15+ interactive Q&A lessons across categories: Basics, Trading, Risk, DeFi, Charts.

2. **Frontend - Offline persistence hook**: Create `useOfflineCache.ts` hook that reads/writes `localStorage` key `cvuh_progress`. Wrap `useUserData` query to seed from cache and update cache on success.

3. **Frontend - Trade fix**: Update `Trade.tsx` portfolio holding lookup to use `userData.portfolio` as an array (already structured for it — just the data shape was wrong from backend).

4. **Frontend - Portfolio fix**: Update `Portfolio.tsx` holdings display to use correct array shape.

5. **Frontend - AI Tutor page**: New page `AiTutor.tsx`. Shows a robot avatar (animated), a chat interface with preset question buttons, and lesson responses. Categories: Basics, Charts, Risk, Strategy. The bot also shows a contextual tip after each trade (stored in context). Add to navigation as "AI Tutor" with a bot icon.

6. **Frontend - Tutor context**: `TutorContext.tsx` — tracks seen lessons, surfaces post-trade tips via toast or inline notification.

7. **Frontend - Design polish**: Improve homepage hero with particle effect or gradient animation. Improve card hover states and spacing. Add subtle animated gradient borders on active elements.
