import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/query';
import { paybackService } from '@/shared/services';
import { BALANCES_REFETCH_MS } from '@/packages/Balances/constants';

export function useBalances() {
  return useQuery({
    queryKey: queryKeys.balances,
    queryFn: paybackService.getBalances,
    // Server recomputes snapshots every 15s.
    refetchInterval: BALANCES_REFETCH_MS,
  });
}
