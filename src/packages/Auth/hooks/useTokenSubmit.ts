import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/apiClient';
import { queryKeys } from '@/shared/query';
import { paybackService } from '@/shared/services';
import { useToken } from './useToken';

/**
 * Verifies a token with one balances request before saving it. On success the response seeds the
 * balances cache, so Home opens with data instead of a loading flash.
 */
export function useTokenSubmit() {
  const { setToken } = useToken();
  const queryClient = useQueryClient();
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (token: string) => {
    setVerifying(true);
    setError(null);
    try {
      const balances = await paybackService.getBalances(token);
      setToken(token); // clears the previous token's cache
      queryClient.setQueryData(queryKeys.balances, balances);
    } catch (e) {
      const apiError = e instanceof ApiError ? e : null;
      setError(
        apiError?.code === 'UNAUTHORIZED'
          ? 'This token was rejected or has expired.'
          : `Couldn’t check the token: ${apiError?.message ?? 'unknown error'}. Try again.`,
      );
      setVerifying(false);
    }
  };

  return { submit, verifying, error };
}
