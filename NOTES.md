# Notes

## Decisions

**1. Amounts: `bigint` in the asset's smallest unit** (`src/shared/money`, tested).
Amount strings are parsed strictly (`^(0|[1-9]\d*)(\.\d+)?$`, ≤ `decimals` places) into `bigint` × `10^decimals` and formatted back canonically. *Floats* are out: ETH has 18 decimals (`12.345678901234591676` isn't representable). *decimal.js* would work, but within one asset we only add, subtract and compare, which `bigint` does natively. USD (amount × `usdPrice`) is exact in `bigint`, rounded half-up to cents once per asset, then summed. Total = available + pending + claiming.

**2. Balance right after a claim: snapshot-aware local adjustment** (`src/shared/localClaims`, tested).
The server moves a claim from `available` to `claiming` at once, but `/balances` is a 15s snapshot, so the next response can still be old (verified live). Options (see ai-logs):
1. Server data + "in progress" banner: never jumps, but the number doesn't change, so the user claims again.
2. Naive optimistic update: the next stale snapshot undoes it, and the balance "jumps back up".
3. **Chosen:** remember accepted claims and move them available → claiming **only while `snapshot.asOf < claim.createdAt`**. After that, server numbers are used as-is. The balance changes instantly and never jumps back. Both timestamps are server time, so there's no clock skew, and the total stays constant. Max in the Claim form uses the adjusted balance.

**3. Unknown claim result: one intent = one `Idempotency-Key`, never a second claim.**
- The key is bound to the exact body. On 504/5xx/network/429 it resends up to 3× with the same key (backoff / `retryAfterMs`). Verified live: a `POST` got **504**, and the resend got **200 `Idempotent-Replayed: true`**, so the claim *had* been created.
- If the result is still unknown, the "We couldn't confirm your claim" screen is built from the *sent* request, before any balance check. There is no Back/Edit, only **Check again** (same key) and **Go to activity**.
- The key is dropped only if the *first* answer is a definite 4xx. A 4xx after an uncertain attempt keeps it, because the first attempt may have gone through. Double taps can't start a second loop.

**Other decisions / assumptions**
- Token: checked with one request before saving (spinner, no loading flash) and stored in `localStorage`. "Change token" is in the header. A 401 or a non-ASCII token goes back to the token screen. Switching tokens clears all cached data.
- Validation adds `amount > fee` to `min ≤ amount ≤ available`, and `,` is accepted as `.`.
- Freshness shows "Updated 12s ago" from `asOf`, in a warning colour after 45s. A failed refresh keeps the last data with a banner. Auto-refresh every 15s.
- Web uses SPA output with a rewrite, so deep links survive a reload. The page can't scroll sideways and has a dark background.

## Working with AI

Everything was built in Claude Code. The full session is in `ai-logs/`; search the quoted text to find each moment.

1. **A prompt that didn't work.** Before the task I asked for short, summarised AI logs (`стисло і по факту`). The brief then said *"do not tidy them up"*, so I switched to a raw export with only the token and emails redacted.
2. **AI output that was wrong or risky.**
   - AI wrote a test expecting `82057n` cents for $820.5773. The first run failed: the expectation was wrong, the code was right.
   - AI mapped any `fetch` exception to "Network error". Testing on my phone, a token with non-ASCII characters showed "Network error" instead of "invalid token" (`ось що після того як просто ввів неправильний токен`). Fixed by validating the token format.
   - Copying the Expo template overwrote my `CLAUDE.md` (`rsync перезаписав`).
3. **Disagreeing with the AI.**
   - AI planned EAS Hosting. I asked for Vercel instead (`деплой точно на eas`), which surfaced 404s on reload for dynamic routes and led to the SPA rewrite.
   - I rejected the naive optimistic balance update (approach 2).
4. **AI checking AI.** A separate read-only critic agent reviewed the app against the brief (`створи агента критики`). It found 3 real bugs in the unknown-outcome flow. For example, after Max + 504 the screen said "Nothing to claim yet" instead of "Check again", and a 4xx after a timeout dropped the key, which could allow a second claim. I checked each one in the code before fixing (`99d4d96`, `0130601`).

## Not done / known issues

- Local claim adjustments and the in-flight key live in memory. A reload right after submitting can show the old balance for up to ~15s, and a reload in the "unknown" state loses the key. Next: persist both in `localStorage`.
- Tests cover amounts, totals, the balance adjustment and the token format. There are none for hooks/screens or the resend loop (next: mock `fetch`, test `useSubmitClaim`).
- Minor items from the critic review:
  - A failed claim shows under "claiming" until the next snapshot (≤15s).
  - "View claim" disappears once the snapshot includes the claim.
  - A late 401 from the old token's request could clear a new token.
  - There's no error boundary for malformed API amounts.
  - A 404 claim id keeps polling, and there's no "stalled" state.
- Full 18-decimal amounts aren't shortened. No pull-to-refresh gesture (there's a Refresh button). Dark theme only.
