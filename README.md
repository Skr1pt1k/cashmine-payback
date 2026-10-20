# CashMine payback — practical task

**Live:** https://cashmine-payback.vercel.app (open on a phone, paste your API token on first open)

Expo (SDK 58) + React Native + TypeScript, shipped as a web build. Decisions and known issues: [NOTES.md](NOTES.md). AI conversations: [ai-logs/](ai-logs/).

## Run locally

```bash
npm install
npx expo start --web     # open the printed URL, use a ~390px viewport
npm test                 # unit tests (vitest)
npm run typecheck
npx expo export -p web   # production build → dist/
```

No env vars: the token is entered in the app and stored only in the browser. The API base URL lives in `src/lib/config.ts`.

## What works

- **Token:** asked on first open, verified before saving, stored in `localStorage`, "Change token" in the header; 401 returns to the token screen.
- **Balances:** per-asset available / pending / claiming, total in USD, "available to claim" in USD, data freshness from `asOf` (with stale warning), loading / error + retry / refresh / empty states, auto-refresh every 15s.
- **Claim:** pick asset → amount or Max → fee and receive amount → choose destination → review → confirm. Validation per API rules. Idempotent submit with automatic resend on timeouts/5xx/429, an explicit "couldn't confirm" state, then live status until completed/failed (with failure reason).
- **Balance after claim:** the claimed amount moves to "claiming" immediately and never jumps back (see NOTES.md).
- **Activity:** paginated history of accruals, reversals and claims; claim rows open the claim status.
- **Tests:** amount parsing, formatting, validation, fee/receive, USD totals, balance adjustment, token format (`npm test`, 36 tests).

## Structure

```
src/app/            routes only
src/lib/            config (base URL), api client, query client, token storage
src/shared/money/   bigint amount logic (+ tests)
src/shared/localClaims/  balance adjustment after a claim (+ tests)
src/packages/       Auth, Balances, Claim, Activity — screens, hooks, components
```
