import { describe, expect, it } from 'vitest';
import { canClaim, formatUnits, formatUsd, maxClaimAmount, parseAmount, quoteClaim, usdCents } from './index';

describe('parseAmount', () => {
  it('parses valid amounts into smallest units', () => {
    expect(parseAmount('0.5', 6)).toEqual({ ok: true, units: 500000n });
    expect(parseAmount('12', 2)).toEqual({ ok: true, units: 1200n });
    expect(parseAmount('0', 8)).toEqual({ ok: true, units: 0n });
  });

  it('keeps full 18-decimal precision', () => {
    expect(parseAmount('12.345678901234591676', 18)).toEqual({ ok: true, units: 12345678901234591676n });
  });

  it.each(['.5', '1.', '05', '1e-3', '-1', '1,5', ' ', 'abc', '1.2.3'])('rejects %j', (value) => {
    expect(parseAmount(value, 8).ok).toBe(false);
  });

  it('rejects more decimals than the asset allows', () => {
    expect(parseAmount('0.1234567', 6)).toEqual({ ok: false, error: 'too_many_decimals' });
  });
});

describe('formatUnits', () => {
  it('round-trips to canonical strings', () => {
    expect(formatUnits(500000n, 6)).toBe('0.5');
    expect(formatUnits(1200n, 2)).toBe('12');
    expect(formatUnits(12345678901234591676n, 18)).toBe('12.345678901234591676');
    expect(formatUnits(-120n, 4)).toBe('-0.012');
  });
});

describe('quoteClaim', () => {
  const eth = { decimals: 18, available: '12.345678901234591676', minAmount: '0.01', fee: '0.0012' };

  it('computes fee and receive amount', () => {
    expect(quoteClaim('0.5', eth)).toEqual({ ok: true, amount: '0.5', fee: '0.0012', receive: '0.4988' });
  });

  it('accepts min and max boundaries', () => {
    expect(quoteClaim('0.01', eth).ok).toBe(true);
    expect(quoteClaim(maxClaimAmount(eth), eth)).toMatchObject({ ok: true, receive: '12.344478901234591676' });
  });

  it('rejects out-of-range amounts', () => {
    expect(quoteClaim('0.009', eth)).toEqual({ ok: false, error: 'below_min' });
    expect(quoteClaim('12.345678901234591677', eth)).toEqual({ ok: false, error: 'above_available' });
  });

  it('rejects amounts that do not cover the fee', () => {
    expect(quoteClaim('1', { decimals: 2, available: '100', minAmount: '1', fee: '1' })).toEqual({
      ok: false,
      error: 'not_above_fee',
    });
  });

  it('reports format errors from parsing', () => {
    expect(quoteClaim('', eth)).toEqual({ ok: false, error: 'empty' });
    expect(quoteClaim('.5', eth)).toEqual({ ok: false, error: 'format' });
  });

  it('canClaim is false when available is below min', () => {
    expect(canClaim({ ...eth, available: '0.005' })).toBe(false);
  });
});

describe('usd', () => {
  it('converts with half-up rounding to cents', () => {
    expect(usdCents(820413207n, 6, '1.0002')).toBe(82058n); // 820.5772896... → 820.58
    expect(usdCents(1234567n, 8, '67312.45')).toBe(83102n); // 831.0178... → 831.02
  });

  it('formats cents', () => {
    expect(formatUsd(123456789n)).toBe('$1,234,567.89');
    expect(formatUsd(5n)).toBe('$0.05');
  });
});
