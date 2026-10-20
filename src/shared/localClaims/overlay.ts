import { formatUnits, toUnits } from '@/shared/money';
import type { BalancesResponse } from '@/shared/types';

/** A claim the server accepted (201) that the balance snapshot may not include yet. */
export type LocalClaim = { id: string; asset: string; amount: string; createdAt: string };

/**
 * A snapshot taken at or after the claim was created already includes it.
 * Both timestamps come from the server, so the device clock does not matter.
 */
export function isReflected(claim: LocalClaim, asOf: string): boolean {
  return new Date(asOf).getTime() >= new Date(claim.createdAt).getTime();
}

/**
 * Applies not-yet-reflected claims to a snapshot: moves the amount from `available` to `claiming`.
 * Totals stay the same, and once a newer snapshot arrives the server numbers are used as-is,
 * so the balance never jumps back.
 */
export function applyLocalClaims(snapshot: BalancesResponse, claims: LocalClaim[]): BalancesResponse {
  const pending = claims.filter((c) => !isReflected(c, snapshot.asOf));
  if (pending.length === 0) return snapshot;

  return {
    ...snapshot,
    items: snapshot.items.map((b) => {
      const own = pending.filter((c) => c.asset === b.asset);
      if (own.length === 0) return b;
      const delta = own.reduce((sum, c) => sum + toUnits(c.amount, b.decimals), 0n);
      const available = toUnits(b.available, b.decimals) - delta;
      return {
        ...b,
        // Cannot go below zero: the server checks `available` live before accepting a claim.
        available: formatUnits(available < 0n ? 0n : available, b.decimals),
        claiming: formatUnits(toUnits(b.claiming, b.decimals) + delta, b.decimals),
      };
    }),
  };
}
