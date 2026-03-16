import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import type {
  GetWorkItemByIdResponse,
  ListWorkItemsResponse,
  WorkItemResponseDto,
} from '../api/responseTypes';

export type WorkItem = WorkItemResponseDto;

// ---------------------------------------------------------------------------
// Query key constants
// ---------------------------------------------------------------------------

export const WORK_ITEMS_QUERY_KEY = ['workItems'] as const;
export const workItemQueryKey = (id: string | number) =>
  ['workItem', id] as const;

// ---------------------------------------------------------------------------
// API functions (exported for testability)
// ---------------------------------------------------------------------------

export async function fetchWorkItems(): Promise<WorkItem[]> {
  const response = await api.get<ListWorkItemsResponse>('/work-items');
  return response.data.data;
}

export async function fetchWorkItem(id: string | number): Promise<WorkItem> {
  const response = await api.get<GetWorkItemByIdResponse>(`/work-items/${id}`);
  return response.data;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useWorkItems() {
  return useQuery({
    queryKey: WORK_ITEMS_QUERY_KEY,
    queryFn: fetchWorkItems,
  });
}

export function useWorkItem(id: string | number) {
  return useQuery({
    queryKey: workItemQueryKey(id),
    queryFn: () => fetchWorkItem(id),
    enabled: !!id,
  });
}
