import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import type {
  AgreementResponseDto,
  ListAgreementsResponse,
  PaginatedResponse,
} from '../api/responseTypes';

export type Agreement = AgreementResponseDto;

export const agreementsQueryKey = (search?: string) =>
  ['agreements', { search }] as const;

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function fetchAgreements(search?: string) {
  const response = await api.get<PaginatedResponse<Agreement>>('/agreements', {
    params: search ? { search } : undefined,
  });
  return response.data;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useAgreements(search?: string) {
  return useQuery({
    queryKey: agreementsQueryKey(search),
    queryFn: () => fetchAgreements(search),
  });
}
