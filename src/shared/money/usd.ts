import { parseDecimal } from './decimal';

/** USD values are kept in cents (bigint) and rounded half-up only once, per line. */
export function usdCents(units: bigint, decimals: number, usdPrice: string): bigint {
  const price = parseDecimal(usdPrice);
  const numerator = units * price.value * 100n;
  const denominator = 10n ** BigInt(decimals + price.scale);
  const negative = numerator < 0n;
  const abs = negative ? -numerator : numerator;
  const rounded = (abs * 2n + denominator) / (denominator * 2n);
  return negative ? -rounded : rounded;
}

export function formatUsd(cents: bigint): string {
  const negative = cents < 0n;
  const abs = negative ? -cents : cents;
  const dollars = (abs / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const rest = (abs % 100n).toString().padStart(2, '0');
  return `${negative ? '-' : ''}$${dollars}.${rest}`;
}
