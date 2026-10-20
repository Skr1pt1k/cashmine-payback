import { useCallback, useRef, useState } from 'react';
import { ApiError } from '@/lib/apiClient';
import { paybackService } from '@/shared/services';
import type { Claim, CreateClaimInput } from '@/shared/types';
import { MAX_AUTO_RESENDS, RESEND_BASE_DELAY_MS } from '@/packages/Claim/constants';
import { createIdempotencyKey } from '@/packages/Claim/utils';

export type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting'; attempt: number }
  /** We don't know if the server created the claim. Resending with the same key is safe. */
  | { status: 'unknown'; error: ApiError }
  | { status: 'rejected'; error: ApiError }
  | { status: 'created'; claim: Claim };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * One claim intent = one Idempotency-Key. The key is bound to the exact body, and reused for every
 * resend (timeouts, 5xx, 429, network) so the server never creates a second claim.
 */
export function useSubmitClaim(onCreated: (claim: Claim) => void) {
  const [state, setState] = useState<SubmitState>({ status: 'idle' });
  const intent = useRef<{ key: string; body: CreateClaimInput } | null>(null);

  const bodyKey = (b: CreateClaimInput) => `${b.asset}|${b.amount}|${b.destinationId}`;

  const send = useCallback(async () => {
    const current = intent.current;
    if (!current) return;

    for (let attempt = 1; attempt <= MAX_AUTO_RESENDS + 1; attempt++) {
      setState({ status: 'submitting', attempt });
      try {
        const claim = await paybackService.createClaim(current.body, current.key);
        setState({ status: 'created', claim });
        onCreated(claim);
        return;
      } catch (e) {
        const error = e instanceof ApiError ? e : new ApiError('UNKNOWN', String(e), null);
        if (!error.isRetryable) {
          // 400/401/404/409: server definitely did not create a claim for this request.
          intent.current = null;
          setState({ status: 'rejected', error });
          return;
        }
        if (attempt > MAX_AUTO_RESENDS) {
          setState({ status: 'unknown', error });
          return;
        }
        await sleep(error.retryAfterMs ?? RESEND_BASE_DELAY_MS * 2 ** (attempt - 1));
      }
    }
  }, [onCreated]);

  /** Start (or resume) submitting this exact claim. */
  const submit = useCallback(
    (body: CreateClaimInput) => {
      if (!intent.current || bodyKey(intent.current.body) !== bodyKey(body)) {
        intent.current = { key: createIdempotencyKey(), body };
      }
      return send();
    },
    [send],
  );

  /** Only allowed when the server definitely has no claim for the current key. */
  const reset = useCallback(() => {
    if (state.status === 'unknown' || state.status === 'submitting') return;
    intent.current = null;
    setState({ status: 'idle' });
  }, [state.status]);

  return { state, submit, retry: send, reset };
}
