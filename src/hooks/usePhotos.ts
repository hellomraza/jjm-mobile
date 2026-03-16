import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../api/client';
import type {
  GetComponentPhotosResponse,
  PhotoResponseDto,
  UploadComponentPhotoResponse,
} from '../api/responseTypes';

export type ComponentPhoto = PhotoResponseDto;
export type UploadPhotoPayload = Record<string, unknown>;

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
  componentId: string,
  payload: UploadPhotoPayload,
): Promise<UploadComponentPhotoResponse> {
  const response = await api.post<UploadComponentPhotoResponse>(
    `/components/${componentId}/photos`,
    payload,
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

export function useUploadPhotoMutation(componentId: string) {
  return useMutation({
    mutationFn: (payload: UploadPhotoPayload) =>
      uploadComponentPhoto(componentId, payload),
  });
}
