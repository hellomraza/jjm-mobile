import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import type {
  GetWorkItemByIdResponse,
  ListWorkItemsResponse,
  PaginatedResponse,
  WorkItemResponseDto,
} from '../api/responseTypes';

export type WorkItem = WorkItemResponseDto;

// ---------------------------------------------------------------------------
// Query key constants
// ---------------------------------------------------------------------------

export const WORK_ITEMS_QUERY_KEY = (agreementId: string) =>
  ['workItems', 'agreement', agreementId] as const;
export const workItemQueryKey = (id: string | number) =>
  ['workItem', id] as const;

// ---------------------------------------------------------------------------
// API functions (exported for testability)
// ---------------------------------------------------------------------------

export async function fetchWorkItems(agreementId: string) {
  if (!agreementId) {
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    } as PaginatedResponse<WorkItem>;
  }
  const response = await api.get<PaginatedResponse<WorkItem>>(
    `/agreements/${agreementId}/work-items`,
  );
  return response.data;
}

export async function fetchWorkItem(id: string | number): Promise<WorkItem> {
  const response = await api.get<GetWorkItemByIdResponse>(`/work-items/${id}`);
  return response.data;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useWorkItems(agreementId: string) {
  return useQuery({
    queryKey: WORK_ITEMS_QUERY_KEY(agreementId),
    queryFn: () => fetchWorkItems(agreementId),
    enabled: !!agreementId,
  });
}


export function useWorkItem(id: string | number) {
  return useQuery({
    queryKey: workItemQueryKey(id),
    queryFn: () => fetchWorkItem(id),
    enabled: !!id,
  });
}
