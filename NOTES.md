# Notes

## Decisions

**1. Amounts: `bigint` in the asset's smallest unit.**
Every amount string from the API (or the user) is parsed strictly (`^(0|[1-9]\d*)(\.\d+)?$`, at most `decimals` places) into a `bigint` scaled by `10^decimals`, and formatted back to a canonical string for the API and UI (`src/shared/money`).
- *Floats* — rejected: ETH has 18 decimals; `12.345678901234591676` is not representable as a JS number, and fee/receive math would drift.
- *decimal.js / big.js* — would work, but we only add, subtract and compare within one asset, which fixed-scale `bigint` does natively with no dependency.
- USD is the only multiplication (amount × `usdPrice`): computed exactly in `bigint`, rounded half-up to cents **once per asset line**, then summed. "Total payback" = available + pending + claiming.

**2. Balance right after a claim: snapshot-aware local adjustment.**
After a `201` the server moves the amount from `available` to `claiming` immediately, but `GET /balances` returns a snapshot recomputed every 15s, so the next response can still be the old one (verified live). Options considered (see ai-logs):
1. Server data only + "claim in progress" banner — never jumps, but the number doesn't change (*"didn't change, so I claimed again"*).
2. Naive optimistic update — the next stale snapshot undoes it (*"dropped, then jumped back up"*).
3. **Chosen:** remember accepted claims `{asset, amount, createdAt}` and move them from available → claiming **only while `snapshot.asOf < claim.createdAt`**. Once a snapshot taken after the claim arrives, server numbers are used as-is. The balance changes instantly and never jumps back; both timestamps come from the server, so device clock skew doesn't matter; the total stays constant. Pure function `applyLocalClaims` with tests. The Claim form uses the adjusted balance too, so Max is never stale.

**3. Unknown claim result (timeout / 5xx / network).**
One claim intent = one `Idempotency-Key` (UUID), bound to the exact body and reused for every resend.
- 504/500/503/network/429: resend automatically up to 3× with the same key (backoff, or `retryAfterMs` for 429). Verified live: a `POST` returned **504**, the resend with the same key returned **200 `Idempotent-Replayed: true`** — the claim *had* been created.
- Still unknown after that: a "We couldn't confirm your claim" screen, rendered from the request that was *sent* (not the form), before any balance check — after a claim goes through, the new balance no longer allows the same amount, and that must not hide this state. No Back/Edit; the only actions are **Check again** (same key — can never create a second claim) and **Go to activity**.
- The key is discarded **only if the very first answer is a definite 4xx** (nothing was created, user may edit). Once any attempt was uncertain, a later 4xx (e.g. `above_available` because the first attempt *did* go through) keeps the key and the "unknown" state.
- Single flight: a double tap on Confirm / Check again cannot start a second resend loop. A success with an unreadable body is treated as unknown and resent, never as failed.

**Other decisions / assumptions**
- Token: entered on first open, kept in `localStorage`, "Change token" in the header; any 401 clears it and returns to the token screen. Changing the token clears all cached data (data is private per token).
- Validation adds `amount > fee` on top of the documented `min ≤ amount ≤ available` (receiving ≤ 0 makes no sense). Input accepts `,` as `.` (phone keyboards).
- Freshness: "Updated 12s ago" from `asOf`; warning colour after 45s; if a refresh fails, last known balances stay visible with a banner. Auto-refresh every 15s (server snapshot rate).
- Activity: cursor pagination with "Load more" (explicit, works reliably on web), dedupe by id.
- Web: single-page output + rewrite to `index.html` so deep links (`/claim/BTC`) survive a reload on Vercel.

## Working with AI

All work was done in Claude Code; the full session is in `ai-logs/` (search the quoted text to find each moment).

1. **A prompt that didn't get what I wanted.** Before the task I asked for short, summarised AI logs (search: `стисло і по факту`). Once the brief arrived it said *"do not tidy them up"*, so the prompt was wrong for the goal. I switched to a raw export of the session with only the token and emails redacted.
2. **AI output that was wrong / risky.** (a) The AI wrote a USD unit test expecting `82057n` cents for 820.5773 → the test failed on the first run; the expectation was wrong, the code was right (search: `82057n`). (b) Copying the Expo template into the project overwrote my prepared `CLAUDE.md` — caught from the file-changed notice and rewritten (search: `rsync перезаписав`).
3. **Disagreeing with the AI.** The AI planned deployment on EAS Hosting; I pushed back and asked for Vercel, where I already had an account (search: `деплой точно на eas`). That surfaced a real issue: static export + dynamic routes would 404 on reload, so we switched to SPA output with a rewrite. I also rejected the naive optimistic balance update (approach 2) in favour of the snapshot-aware one.

4. **Using AI to check AI.** I had a separate critic agent review the whole app against the brief and API docs, read-only (search: `створи агента критики`). It found 3 real bugs in the unknown-outcome flow that our own tests didn't catch — e.g. after Max + 504 the screen showed "Nothing to claim yet" instead of "Check again", and a 4xx after a timeout discarded the key (possible second claim). I verified each against the code before fixing (commits `99d4d96`, `0130601`); I deliberately did not act on its "ai-logs missing" item, since logs are exported at the end.

## Not done / known issues

- Local claim adjustments and the in-flight Idempotency-Key live in memory: a page reload right after submitting can show the old balance for up to ~15s, and a reload during the "unknown" state loses the key. Next: persist both in `localStorage`.
- Tests cover amount logic, totals and the balance adjustment only; no tests for hooks/screens or the resend loop (next: mock `fetch` and test `useSubmitClaim`).
- Long amounts (18-decimal ETH) are shown in full; no shortening or grouping of crypto amounts.
- No pull-to-refresh gesture on web (Refresh button instead); dark theme only; no i18n.
- Claim status polling relies on React Query retries for errors; no visible "stalled" state if a claim stays pending far beyond 20s, and an unknown claim id (404) keeps polling.
- Remaining minor findings from the critic review: a failed claim still shows under "claiming" on Home until the next snapshot (up to 15s); "View claim" disappears once the snapshot includes the claim, even if it's still pending; a late 401 from the previous token's request could clear a newly entered token; a malformed amount from the API would crash the screen (no error boundary); the resend loop isn't cancelled when leaving the screen.
