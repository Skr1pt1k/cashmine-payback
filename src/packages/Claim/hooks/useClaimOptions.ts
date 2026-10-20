import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/query';
import { paybackService } from '@/shared/services';

export function useClaimOptions(asset: string) {
  return useQuery({
    queryKey: queryKeys.claimOptions(asset),
    queryFn: () => paybackService.getClaimOptions(asset),
  });
}
