import { describe, expect, it } from 'vitest';
import { summarizeBalances } from './summary';

describe('summarizeBalances', () => {
  it('sums total and available USD across assets', () => {
    const result = summarizeBalances([
      { asset: 'USDT', decimals: 6, available: '100', pending: '50', claiming: '10', usdPrice: '1' },
      { asset: 'BTC', decimals: 8, available: '0.001', pending: '0', claiming: '0', usdPrice: '60000' },
    ]);
    expect(result.totalUsdCents).toBe(16000n + 6000n);
    expect(result.availableUsdCents).toBe(10000n + 6000n);
  });

  it('handles an empty list', () => {
    expect(summarizeBalances([])).toEqual({ totalUsdCents: 0n, availableUsdCents: 0n });
  });
});
