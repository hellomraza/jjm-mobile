import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import type { GetComponentPhotosResponse, PhotoResponseDto } from '../api/responseTypes';

export type ComponentPhoto = PhotoResponseDto;

export const componentPhotosQueryKey = (componentId: string) =>
  ['componentPhotos', componentId] as const;

export async function fetchComponentPhotos(
  componentId: string,
): Promise<ComponentPhoto[]> {
  const response = await api.get<GetComponentPhotosResponse>(
    `/components/${componentId}/photos`,
  );

  return response.data.data;
}

export function useComponentPhotos(componentId: string) {
  return useQuery({
    queryKey: componentPhotosQueryKey(componentId),
    queryFn: () => fetchComponentPhotos(componentId),
    enabled: !!componentId,
  });
}
