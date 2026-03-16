import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WorkItemStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';

export type WorkItem = {
  id: number;
  title: string;
  description: string;
  status: WorkItemStatus;
  assignedTo: string;
  location: string;
  createdAt: string;
  updatedAt: string;
};

// ---------------------------------------------------------------------------
// Query key constants
// ---------------------------------------------------------------------------

export const WORK_ITEMS_QUERY_KEY = ['workItems'] as const;
export const workItemQueryKey = (id: number) => ['workItem', id] as const;

// ---------------------------------------------------------------------------
// API functions (exported for testability)
// ---------------------------------------------------------------------------

export async function fetchWorkItems(): Promise<WorkItem[]> {
  const response = await api.get<WorkItem[]>('/work-items');
  return response.data;
}

export async function fetchWorkItem(id: number): Promise<WorkItem> {
  const response = await api.get<WorkItem>(`/work-items/${id}`);
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

export function useWorkItem(id: number) {
  return useQuery({
    queryKey: workItemQueryKey(id),
    queryFn: () => fetchWorkItem(id),
    enabled: !!id,
  });
}
