import { useQuery } from 'react-query';
import { api } from '../api/client';
import { GetComponentsByWorkItemResponse } from '../api/responseTypes';

/**
 * Fetches components for a given work item.
 * @param workItemId The ID of the work item.
 */
export function useComponents(workItemId: string) {
  return useQuery<GetComponentsByWorkItemResponse>(
    ['components', workItemId],
    async () => {
      const { data } = await api.get<GetComponentsByWorkItemResponse>(`/components/work-item/${workItemId}`);
      return data;
    },
    {
      enabled: !!workItemId,
    }
  );
}
