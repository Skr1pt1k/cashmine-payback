import { apiClient, type ApiClient } from '@/lib/apiClient';
import type { ActivityPage, BalancesResponse, Claim, ClaimOptions, CreateClaimInput } from '@/shared/types';

export function createPaybackService(api: ApiClient) {
  return {
    getBalances: () => api.get<BalancesResponse>('/v1/balances'),
    getClaimOptions: (asset: string) => api.get<ClaimOptions>(`/v1/claim-options?asset=${encodeURIComponent(asset)}`),
    createClaim: (input: CreateClaimInput, idempotencyKey: string) =>
      api.post<Claim>('/v1/claims', input, { 'Idempotency-Key': idempotencyKey }),
    getClaim: (id: string) => api.get<Claim>(`/v1/claims/${encodeURIComponent(id)}`),
    getActivity: (cursor?: string | null, limit = 20) =>
      api.get<ActivityPage>(`/v1/activity?limit=${limit}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`),
  };
}

export const paybackService = createPaybackService(apiClient);
