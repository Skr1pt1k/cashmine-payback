/**
 * Money is kept as bigint in the asset's smallest unit (10^-decimals).
 * Never use JS numbers for amounts: ETH has 18 decimals, far beyond float precision.
 */

// API rule: digits, optional dot + digits, no leading zeros (except a single "0").
const AMOUNT_RE = /^(0|[1-9]\d*)(\.\d+)?$/;

export type ParseError = 'empty' | 'format' | 'too_many_decimals';

export type ParseResult = { ok: true; units: bigint } | { ok: false; error: ParseError };

/** Strict parse of a decimal string into smallest units. Used for user input and API values. */
export function parseAmount(input: string, decimals: number): ParseResult {
  const value = input.trim();
  if (value === '') return { ok: false, error: 'empty' };
  if (!AMOUNT_RE.test(value)) return { ok: false, error: 'format' };

  const [whole, fraction = ''] = value.split('.');
  if (fraction.length > decimals) return { ok: false, error: 'too_many_decimals' };

  const units = BigInt(whole) * 10n ** BigInt(decimals) + BigInt(fraction.padEnd(decimals, '0') || '0');
  return { ok: true, units };
}

/** Parse a trusted API amount; throws if the server sends something malformed. */
export function toUnits(value: string, decimals: number): bigint {
  const result = parseAmount(value, decimals);
  if (!result.ok) throw new Error(`Invalid amount from API: "${value}" (${result.error})`);
  return result.units;
}

/** Smallest units → canonical API string ("0.5", "12"), no trailing zeros. */
export function formatUnits(units: bigint, decimals: number): string {
  const negative = units < 0n;
  const abs = negative ? -units : units;
  const base = 10n ** BigInt(decimals);
  const whole = abs / base;
  const fraction = (abs % base).toString().padStart(decimals, '0').replace(/0+$/, '');
  const text = fraction ? `${whole}.${fraction}` : whole.toString();
  return negative ? `-${text}` : text;
}

/** Parse an arbitrary-precision decimal (e.g. usdPrice) into { value, scale }. */
export function parseDecimal(value: string): { value: bigint; scale: number } {
  if (!/^-?(0|[1-9]\d*)(\.\d+)?$/.test(value)) throw new Error(`Invalid decimal: "${value}"`);
  const negative = value.startsWith('-');
  const [whole, fraction = ''] = value.replace('-', '').split('.');
  const abs = BigInt(whole + fraction);
  return { value: negative ? -abs : abs, scale: fraction.length };
}
