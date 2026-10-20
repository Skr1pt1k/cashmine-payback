import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/apiClient';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: (failureCount, error) => error instanceof ApiError && error.isRetryable && failureCount < 3,
      retryDelay: (attempt, error) =>
        error instanceof ApiError && error.retryAfterMs ? error.retryAfterMs : Math.min(1000 * 2 ** attempt, 8000),
    },
    // Writes are never retried automatically; the claim flow retries explicitly with the same Idempotency-Key.
    mutations: { retry: false },
  },
});
