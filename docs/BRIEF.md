# CashMine practical task — brief (token removed)

Window: 2026-10-20 19:00–21:00 UTC.

## 1. Context
CashMine pays users back part of the trading fees they pay on crypto exchanges ("payback"). Build a slice of the app: seeing payback balances and claiming them. The money is real for users, so correctness matters more than polish. React Native (Expo), ship the web build, opened on a phone from a link.

## 2. Setup
- Expo + TypeScript, any web-compatible libraries. Design for ~390px phone width.
- API docs: https://task-api.cashmine.io/docs (copy in docs/API.md). Token valid 24h. Data is fake and private to the token.
- Treat the API as a real remote server you call but cannot change.
- Do not put the token in code, repo or deployed build. On first open the app asks for the token (text field), keeps it in the browser and offers a way to change it. Reviewers use their own tokens.
- Keep the API base URL in one place.

## 3. What to build (priority order; fewer things correctly > everything halfway)
1. Balances (Home): each asset's balances, total in USD, data freshness. Loading, error/retry, refresh states.
2. Claim: pick asset, enter amount or Max, see fee and receive amount, confirm and submit. Follow the claim until it completes or fails. Validate input against API rules.
3. Tests: unit tests for amount logic: parsing, validation, fee, totals.
4. Activity (if time): paginated history of accruals, reversals, claims.

## 4. Decisions (pick one, explain why)
- How amounts are represented and calculated.
- What the balance shows right after a claim is submitted. Feedback A: "I claimed and my balance didn't change, so I claimed again." Feedback B: "My balance dropped, then jumped back up, and I stopped trusting the app."
- What the user sees / app does when the claim result is unknown (e.g. timeout).

## 5. AI tools
- Keep AI conversations in ai-logs/ — do not tidy them up. Remove private data incl. the token.
- For the balance-after-claim decision, ask AI for at least two approaches before choosing.
- Commit at least every 30 minutes, do not squash.

## 6. Notes
NOTES.md (~1 page): Decisions; Working with AI (3 moments with pointers into ai-logs: prompt that didn't work and how changed; AI output wrong/risky and how found; disagreed/rejected a suggestion and why); Not done / known issues.
README.md: live link, how to run locally, what works.

## 7. Submission (before 21:00 UTC)
Public GitHub repo with full history, live link, rough time spent. Deploy early. No push/redeploy after 21:00 UTC.
