import { describe, expect, it } from 'vitest';
import type { BalancesResponse } from '@/shared/types';
import { applyLocalClaims, isReflected, type LocalClaim } from './overlay';

const snapshot = (asOf: string, available = '10', claiming = '0'): BalancesResponse => ({
  asOf,
  items: [
    { asset: 'ETH', decimals: 18, available, pending: '1', claiming, usdPrice: '2000' },
    { asset: 'BTC', decimals: 8, available: '0.5', pending: '0', claiming: '0', usdPrice: '60000' },
  ],
});

const claim: LocalClaim = { id: 'clm_1', asset: 'ETH', amount: '2.5', createdAt: '2026-10-20T19:00:10.000Z' };

describe('applyLocalClaims', () => {
  it('moves the claim from available to claiming while the snapshot is older than the claim', () => {
    const result = applyLocalClaims(snapshot('2026-10-20T19:00:00.000Z'), [claim]);
    expect(result.items[0]).toMatchObject({ available: '7.5', claiming: '2.5' });
    expect(result.items[1]).toMatchObject({ available: '0.5', claiming: '0' });
  });

  it('uses server numbers once a snapshot includes the claim (no double subtraction)', () => {
    const fresh = snapshot('2026-10-20T19:00:15.000Z', '7.5', '2.5');
    expect(applyLocalClaims(fresh, [claim]).items[0]).toMatchObject({ available: '7.5', claiming: '2.5' });
  });

  it('treats a snapshot taken at the same instant as reflected', () => {
    expect(isReflected(claim, claim.createdAt)).toBe(true);
  });

  it('sums several pending claims for the same asset', () => {
    const second = { ...claim, id: 'clm_2', amount: '1' };
    expect(applyLocalClaims(snapshot('2026-10-20T19:00:00.000Z'), [claim, second]).items[0]).toMatchObject({
      available: '6.5',
      claiming: '3.5',
    });
  });

  it('never shows a negative available balance', () => {
    const big = { ...claim, amount: '20' };
    expect(applyLocalClaims(snapshot('2026-10-20T19:00:00.000Z'), [big]).items[0].available).toBe('0');
  });

  it('returns the same snapshot when nothing is pending', () => {
    const s = snapshot('2026-10-20T19:00:00.000Z');
    expect(applyLocalClaims(s, [])).toBe(s);
  });
});
