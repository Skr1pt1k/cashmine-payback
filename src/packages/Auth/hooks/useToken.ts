import { useContext } from 'react';
import { TokenContext } from '@/packages/Auth/components';

export function useToken() {
  const ctx = useContext(TokenContext);
  if (!ctx) throw new Error('useToken must be used inside TokenProvider');
  return ctx;
}
