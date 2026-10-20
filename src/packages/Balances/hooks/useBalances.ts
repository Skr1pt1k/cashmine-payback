import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { applyLocalClaims, isReflected, localClaimsStore, useLocalClaims } from '@/shared/localClaims';
import { queryKeys } from '@/shared/query';
import { paybackService } from '@/shared/services';
import { BALANCES_REFETCH_MS } from '@/packages/Balances/constants';

/**
 * Balances as the user should see them: the server snapshot plus claims submitted
 * after that snapshot was taken (see NOTES.md, "Balance right after a claim").
 */
export function useBalances() {
  const query = useQuery({
    queryKey: queryKeys.balances,
    queryFn: paybackService.getBalances,
    // Server recomputes snapshots every 15s.
    refetchInterval: BALANCES_REFETCH_MS,
  });
  const localClaims = useLocalClaims();
  const snapshot = query.data;

  // Forget claims the server snapshot already includes.
  useEffect(() => {
    if (snapshot) localClaimsStore.removeWhere((c) => isReflected(c, snapshot.asOf));
  }, [snapshot]);

  const data = useMemo(() => (snapshot ? applyLocalClaims(snapshot, localClaims) : undefined), [snapshot, localClaims]);
  const inFlightByAsset = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of localClaims) map[c.asset] = c.id;
    return map;
  }, [localClaims]);

  return { ...query, data, inFlightByAsset };
}
