import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import api from '../api/client';
import type {
  GetComponentPhotosResponse,
  PhotoResponseDto,
  UploadComponentPhotoResponse,
} from '../api/responseTypes';
import { componentsQueryKey } from './useComponents';

export type ComponentPhoto = PhotoResponseDto;
export interface UploadPhotoPayload {
  photoUrl: string;
  work_item_id: string;
  component_id: string;
  progress: number;
  latitude: number;
  longitude: number;
  timestamp: string;
}

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

export async function uploadComponentPhoto(
  payload: UploadPhotoPayload,
): Promise<UploadComponentPhotoResponse> {
  const response = await api.post<UploadComponentPhotoResponse>(
    `/components/${payload.component_id}/photos-url`,
    {
      progress: payload.progress.toString(),
      latitude: payload.latitude,
      longitude: payload.longitude,
      timestamp: payload.timestamp,
      photoUrl: payload.photoUrl,
    },
  );

  return response.data;
}

export function useComponentPhotos(componentId: string) {
  return useQuery({
    queryKey: componentPhotosQueryKey(componentId),
    queryFn: () => fetchComponentPhotos(componentId),
    enabled: !!componentId,
  });
}

export function invalidatePhotoUploadQueries(
  queryClient: QueryClient,
  workItemId: string,
  componentId: string,
) {
  queryClient.invalidateQueries({ queryKey: componentsQueryKey(workItemId) });
  queryClient.invalidateQueries({
    queryKey: componentPhotosQueryKey(componentId),
  });
}

export function useUploadPhotoMutation(
  workItemId: string,
  componentId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UploadPhotoPayload) => uploadComponentPhoto(payload),
    onSuccess: () => {
      invalidatePhotoUploadQueries(queryClient, workItemId, componentId);
    },
  });
}
