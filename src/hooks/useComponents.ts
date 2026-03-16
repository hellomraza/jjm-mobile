import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import type {
  GetComponentByIdResponse,
  GetComponentsByWorkItemResponse,
  WorkItemComponentResponseDto,
} from '../api/responseTypes';

export type WorkItemComponent = WorkItemComponentResponseDto;

export const componentsQueryKey = (workItemId: string) =>
  ['components', workItemId] as const;
export const componentQueryKey = (componentId: string) =>
  ['component', componentId] as const;

export async function fetchComponents(
  workItemId: string,
): Promise<WorkItemComponent[]> {
  const response = await api.get<GetComponentsByWorkItemResponse>(
    `/components/work-item/${workItemId}`,
  );

  return response.data;
}

export async function fetchComponent(
  componentId: string,
): Promise<WorkItemComponent> {
  const response = await api.get<GetComponentByIdResponse>(
    `/components/${componentId}`,
  );

  return response.data;
}

/**
 * Fetches components for a given work item.
 * @param workItemId The ID of the work item.
 */
export function useComponents(workItemId: string) {
  return useQuery({
    queryKey: componentsQueryKey(workItemId),
    queryFn: () => fetchComponents(workItemId),
    enabled: !!workItemId,
  });
}

export function useComponent(componentId: string) {
  return useQuery({
    queryKey: componentQueryKey(componentId),
    queryFn: () => fetchComponent(componentId),
    enabled: !!componentId,
  });
}
