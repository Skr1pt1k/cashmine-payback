@AGENTS.md

# CashMine Test Task — Claude Instructions

## Context

2-hour practical task for CashMine (React Native Engineer). Window: **2026-10-20 19:00–21:00 UTC**. No push/redeploy after 21:00.
- Brief: `docs/BRIEF.md` (source of truth). API: `docs/API.md` (base URL `https://task-api.cashmine.io`).
- Slice of the app: **payback balances + claiming**. Money is real for users → **correctness > polish**.
- Expo (SDK 58) + TypeScript, shipped as **web build**, designed for **~390px phone width**.
- Next interview walks through the code + a live change with AI — every line must be explainable.

## Hard Requirements (from brief)

- **Token is never in code, repo, or build.** On first open the app asks for a token (text field), stores it in browser (`localStorage`), offers a way to change it. Reviewers use their own tokens.
- **API base URL in one place** (`src/lib/config.ts`).
- Treat API as real remote server: slow, any request can fail (429 w/ retryAfterMs, 500/503, 504 = outcome unknown).
- Commit **at least every 30 min**, never squash.
- `ai-logs/`: **raw, untidied** AI conversations (brief says "do not tidy them up"). Only scrub the token. Must include the conversation where AI gives ≥2 approaches for balance-after-claim.
- `NOTES.md` (~1 page): Decisions / Working with AI (3 moments with pointers into ai-logs) / Not done.
- `README.md`: live link, run locally, what works.

## Priority (do in order, fewer things correctly > everything halfway)

1. **Balances (Home):** per-asset available/pending/claiming, total USD, freshness (`asOf`), loading / error+retry / refresh.
2. **Claim:** pick asset → amount or Max → show fee + receive amount → confirm → submit with Idempotency-Key → poll `GET /v1/claims/{id}` until completed/failed. Validate per API rules.
3. **Tests:** unit tests for amount logic (parse, validate, fee, totals).
4. **Activity** (if time): paginated history via cursor.

## Money Rules

- Amounts are decimal strings. **Never use JS floats for money.** Represent as `bigint` in minor units (scaled by asset `decimals`) in a pure `src/shared/money/` module; format back to string for API/display.
- Valid input format: `^(0|[1-9]\d*)(\.\d+)?$`, at most `decimals` fraction digits. Reject `.5`, `1.`, `05`, `1e-3`.
- Rules: `minAmount <= amount <= available`; `receive = amount - fee` (must be > 0).
- USD total = Σ amount × usdPrice — compute with scaled bigint, round only at display.
- Idempotency-Key generated once per confirmed claim intent, reused on retries (timeout/5xx/network) so a retry never creates a second claim.

## Decisions to document in NOTES.md

1. Amount representation (bigint minor units vs decimal lib vs floats).
2. Balance right after submit (optimistic local adjustment vs wait for snapshot vs "claim in progress" banner). Ask AI for ≥2 approaches first.
3. Unknown claim result (504/timeout/network): what user sees + retry with same Idempotency-Key.

## Architecture (pricelix-mobile style, adapted)

1. **`src/app/` = routing only.** Route files render a screen from a package.
2. **Logic in `src/packages/<Domain>/`**, import from package root only (`@/packages/Claim`).
3. **`@/` alias**, no `../`. Relative only inside the same component folder.
4. Styles in `.styles.ts`, constants in `.constants.ts`. One hook = one responsibility.
5. Pure logic (money, validation) has no React imports → easy to unit test.

```
src/
├── app/                 # Expo Router routes only
├── lib/                 # config.ts (BASE_URL), apiClient.ts, queryClient.ts, tokenStorage.ts
├── shared/
│   ├── money/           # bigint parse/format/validate/fee — unit tested
│   ├── types/           # API DTOs mirroring docs/API.md
│   ├── services/        # createXService(apiClient)
│   └── query/queryKeys.ts
├── components/          # shared UI (Screen, Button, ErrorState, ...)
└── packages/
    ├── Auth/            # token gate + change token
    ├── Balances/
    ├── Claim/
    └── Activity/
```

- TanStack Query for server state. Every screen: loading / error with retry / empty / success.
- Web-safe libs only (no glass, haptics, secure-store, native bottom sheets).
- Install deps with `npx expo install`.

## Git

- `main`: initial scaffold. Work on **`feat/cashmine-task`**, one PR to `main` at the end (merge commit, no squash).
- Commit after each verified step; short factual messages: `feat: add balances screen`, `fix: reuse idempotency key on retry`, `test: cover amount parsing`.
- Before commit: `npx tsc --noEmit`. Before push: `git grep -n "ct1\."` must be empty.

## Commands

```bash
npx expo start --web
npx tsc --noEmit
npx expo lint
npm test
npx expo export -p web     # → dist/
```
