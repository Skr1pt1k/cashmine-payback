/** Automatic resends of the same claim (same Idempotency-Key) before asking the user. */
export const MAX_AUTO_RESENDS = 3;
export const RESEND_BASE_DELAY_MS = 1_000;
/** Claims settle within ~20s; poll often enough to feel live. */
export const CLAIM_POLL_MS = 2_000;
