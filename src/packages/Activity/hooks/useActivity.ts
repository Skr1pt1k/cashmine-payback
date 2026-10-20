import { useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/query';
import { paybackService } from '@/shared/services';
import { ACTIVITY_PAGE_SIZE } from '@/packages/Activity/constants';

export function useActivity() {
  return useInfiniteQuery({
    queryKey: queryKeys.activity,
    queryFn: ({ pageParam }) => paybackService.getActivity(pageParam, ACTIVITY_PAGE_SIZE),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
