import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { configureApiClient } from '@/lib/apiClient';
import { tokenStorage } from '@/lib/tokenStorage';

type TokenContextValue = {
  token: string | null;
  /** Set when the API rejected the stored token (401). */
  rejected: boolean;
  setToken: (token: string) => void;
  clearToken: () => void;
};

export const TokenContext = createContext<TokenContextValue | null>(null);

export function TokenProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState<string | null>(() => tokenStorage.get());
  const [rejected, setRejected] = useState(false);

  // Configure synchronously so the very first request already has the token.
  configureApiClient({
    getToken: () => token,
    onUnauthorized: () => {
      tokenStorage.clear();
      setTokenState(null);
      setRejected(true);
    },
  });

  const setToken = useCallback(
    (next: string) => {
      // Data is private per token: never show one token's data under another.
      queryClient.clear();
      tokenStorage.set(next);
      setRejected(false);
      setTokenState(next);
    },
    [queryClient],
  );

  const clearToken = useCallback(() => {
    queryClient.clear();
    tokenStorage.clear();
    setRejected(false);
    setTokenState(null);
  }, [queryClient]);

  const value = useMemo(() => ({ token, rejected, setToken, clearToken }), [token, rejected, setToken, clearToken]);
  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>;
}
