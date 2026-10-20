import { useCallback, useRef, useState } from 'react';
import { ApiError } from '@/lib/apiClient';
import { paybackService } from '@/shared/services';
import type { Claim, CreateClaimInput } from '@/shared/types';
import { MAX_AUTO_RESENDS, RESEND_BASE_DELAY_MS } from '@/packages/Claim/constants';
import { createIdempotencyKey } from '@/packages/Claim/utils';

export type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting'; attempt: number; body: CreateClaimInput }
  /** We don't know if the server created the claim. Resending with the same key is safe. */
  | { status: 'unknown'; error: ApiError; body: CreateClaimInput }
  | { status: 'rejected'; error: ApiError }
  | { status: 'created'; claim: Claim };

type Intent = {
  key: string;
  body: CreateClaimInput;
  /** True once any attempt ended without a definite answer (timeout, 5xx, network, 429). */
  uncertain: boolean;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const sameBody = (a: CreateClaimInput, b: CreateClaimInput) =>
  a.asset === b.asset && a.amount === b.amount && a.destinationId === b.destinationId;

/**
 * One claim intent = one Idempotency-Key, bound to the exact body and reused for every resend,
 * so the server never creates a second claim. Once an attempt was uncertain, the key is never
 * discarded: a later 4xx does not prove the first attempt failed.
 */
export function useSubmitClaim(onCreated: (claim: Claim) => void) {
  const [state, setState] = useState<SubmitState>({ status: 'idle' });
  const intent = useRef<Intent | null>(null);
  const sending = useRef(false);

  const send = useCallback(async () => {
    const current = intent.current;
    // Single flight: a double tap must not start a second resend loop.
    if (!current || sending.current) return;
    sending.current = true;

    let created: Claim | null = null;
    try {
      for (let attempt = 1; attempt <= MAX_AUTO_RESENDS + 1; attempt++) {
        setState({ status: 'submitting', attempt, body: current.body });
        try {
          const claim = await paybackService.createClaim(current.body, current.key);
          // A success without a readable claim tells us nothing: treat as unknown and resend.
          if (!claim?.id) throw new ApiError('SERVER', 'Unexpected response from server', null);
          created = claim;
          break;
        } catch (e) {
          const error = e instanceof ApiError ? e : new ApiError('UNKNOWN', String(e), null);

          if (!error.isRetryable) {
            if (current.uncertain) {
              // An earlier attempt may have created the claim: keep the key, stay in "unknown".
              setState({ status: 'unknown', error, body: current.body });
            } else {
              // First answer was a definite rejection: nothing was created, the user may edit.
              intent.current = null;
              setState({ status: 'rejected', error });
            }
            return;
          }

          current.uncertain = true;
          if (attempt > MAX_AUTO_RESENDS) {
            setState({ status: 'unknown', error, body: current.body });
            return;
          }
          await sleep(error.retryAfterMs ?? RESEND_BASE_DELAY_MS * 2 ** (attempt - 1));
        }
      }
    } finally {
      sending.current = false;
    }

    // Outside the retry loop: a failure here must never be mistaken for a failed request.
    if (created) {
      setState({ status: 'created', claim: created });
      onCreated(created);
    }
  }, [onCreated]);

  /** Start (or resume) submitting this exact claim. */
  const submit = useCallback(
    (body: CreateClaimInput) => {
      if (!intent.current || !sameBody(intent.current.body, body)) {
        if (intent.current?.uncertain) return; // never replace an intent that may exist on the server
        intent.current = { key: createIdempotencyKey(), body, uncertain: false };
      }
      return send();
    },
    [send],
  );

  /** Only allowed when the server definitely has no claim for the current key. */
  const reset = useCallback(() => {
    if (intent.current?.uncertain || sending.current) return;
    intent.current = null;
    setState({ status: 'idle' });
  }, []);

  return { state, submit, retry: send, reset };
}
