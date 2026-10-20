import { formatUnits, parseAmount, toUnits } from './decimal';

export type ClaimRules = {
  decimals: number;
  available: string;
  minAmount: string;
  fee: string;
};

export type ClaimValidationError =
  | 'empty'
  | 'format'
  | 'too_many_decimals'
  | 'below_min'
  | 'above_available'
  | 'not_above_fee';

export type ClaimQuote =
  | { ok: true; amount: string; fee: string; receive: string }
  | { ok: false; error: ClaimValidationError };

/** Validates user input against API rules and computes fee / receive amount. */
export function quoteClaim(input: string, rules: ClaimRules): ClaimQuote {
  const parsed = parseAmount(input, rules.decimals);
  if (!parsed.ok) return parsed;

  const amount = parsed.units;
  const min = toUnits(rules.minAmount, rules.decimals);
  const available = toUnits(rules.available, rules.decimals);
  const fee = toUnits(rules.fee, rules.decimals);

  if (amount > available) return { ok: false, error: 'above_available' };
  if (amount < min) return { ok: false, error: 'below_min' };
  // Fee is taken from the amount; receiving zero or less makes no sense even if min allows it.
  if (amount <= fee) return { ok: false, error: 'not_above_fee' };

  return {
    ok: true,
    amount: formatUnits(amount, rules.decimals),
    fee: formatUnits(fee, rules.decimals),
    receive: formatUnits(amount - fee, rules.decimals),
  };
}

/** "Max" = full available balance, in canonical API format. */
export function maxClaimAmount(rules: Pick<ClaimRules, 'available' | 'decimals'>): string {
  return formatUnits(toUnits(rules.available, rules.decimals), rules.decimals);
}

export function canClaim(rules: ClaimRules): boolean {
  const available = toUnits(rules.available, rules.decimals);
  return available >= toUnits(rules.minAmount, rules.decimals) && available > toUnits(rules.fee, rules.decimals);
}

export const CLAIM_ERROR_TEXT: Record<ClaimValidationError, string> = {
  empty: 'Enter an amount',
  format: 'Use digits and an optional dot, e.g. 0.5',
  too_many_decimals: 'Too many decimal places for this asset',
  below_min: 'Amount is below the minimum',
  above_available: 'Amount exceeds your available balance',
  not_above_fee: 'Amount must be larger than the fee',
};
