import { toUnits, usdCents } from '@/shared/money';
import type { Balance } from '@/shared/types';

export type BalanceSummary = {
  totalUsdCents: bigint;
  availableUsdCents: bigint;
};

/** Total = available + pending + claiming; each line rounded to cents once, then summed. */
export function summarizeBalances(items: Balance[]): BalanceSummary {
  let totalUsdCents = 0n;
  let availableUsdCents = 0n;
  for (const b of items) {
    const available = toUnits(b.available, b.decimals);
    const total = available + toUnits(b.pending, b.decimals) + toUnits(b.claiming, b.decimals);
    totalUsdCents += usdCents(total, b.decimals, b.usdPrice);
    availableUsdCents += usdCents(available, b.decimals, b.usdPrice);
  }
  return { totalUsdCents, availableUsdCents };
}
