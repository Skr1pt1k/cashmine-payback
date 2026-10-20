import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/query';
import { paybackService } from '@/shared/services';
import { CLAIM_POLL_MS } from '@/packages/Claim/constants';

/** Polls a claim until it settles, then refreshes balances and activity. */
export function useClaim(id: string) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.claim(id),
    queryFn: () => paybackService.getClaim(id),
    refetchInterval: (q) => (q.state.data?.status === 'pending' || !q.state.data ? CLAIM_POLL_MS : false),
  });

  const settled = query.data && query.data.status !== 'pending';
  useEffect(() => {
    if (settled) {
      queryClient.invalidateQueries({ queryKey: queryKeys.balances });
      queryClient.invalidateQueries({ queryKey: queryKeys.activity });
    }
  }, [settled, queryClient]);

  return query;
}
