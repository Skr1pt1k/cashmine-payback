import { useSyncExternalStore } from 'react';
import type { LocalClaim } from './overlay';

/** In-memory list of submitted claims (per token session). */
let claims: LocalClaim[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const localClaimsStore = {
  add(claim: LocalClaim) {
    // Idempotent replays return the same claim id: never count it twice.
    if (claims.some((c) => c.id === claim.id)) return;
    claims = [...claims, claim];
    emit();
  },
  removeWhere(predicate: (c: LocalClaim) => boolean) {
    const next = claims.filter((c) => !predicate(c));
    if (next.length !== claims.length) {
      claims = next;
      emit();
    }
  },
  clear() {
    claims = [];
    emit();
  },
  getSnapshot: () => claims,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useLocalClaims(): LocalClaim[] {
  return useSyncExternalStore(localClaimsStore.subscribe, localClaimsStore.getSnapshot, localClaimsStore.getSnapshot);
}
