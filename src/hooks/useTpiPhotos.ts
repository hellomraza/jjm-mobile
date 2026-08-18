import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import type {
  TpiPhotoStatusResponseDto,
  TpiReferencePhotoDto,
} from '../api/responseTypes';

export type UploadTpiReferencePhotoPayload = {
  component_id: string;
  photoUrl: string;
  latitude: number;
  longitude: number;
  timestamp: string;
};

// ---------------------------------------------------------------------------
// Query key constants
// ---------------------------------------------------------------------------

export const TPI_REFERENCE_PHOTOS_QUERY_KEY = (componentId: string) =>
  ['tpiReferencePhotos', componentId] as const;

export const TPI_REFERENCE_PHOTO_STATUS_QUERY_KEY = (componentId: string) =>
  ['tpiReferencePhotoStatus', componentId] as const;

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function fetchTpiReferencePhotos(
  componentId: string,
): Promise<TpiReferencePhotoDto[]> {
  if (!componentId) return [];
  const response = await api.get<TpiReferencePhotoDto[]>(
    `/components/${componentId}/tpi-reference-photos`,
  );
  return response.data ?? [];
}

export async function fetchTpiReferencePhotoStatus(
  componentId: string,
): Promise<TpiPhotoStatusResponseDto | null> {
  if (!componentId) return null;
  try {
    const response = await api.get<TpiPhotoStatusResponseDto>(
      `/tpi-photo-status/component/${componentId}`,
    );
    return response.data;
  } catch {
    return null;
  }
}

export async function uploadTpiReferencePhoto(
  payload: UploadTpiReferencePhotoPayload,
): Promise<TpiReferencePhotoDto> {
  const { component_id, photoUrl, latitude, longitude, timestamp } = payload;
  const response = await api.post<TpiReferencePhotoDto>(
    `/components/${component_id}/tpi-reference-photos-url`,
    {
      photoUrl,
      latitude,
      longitude,
      timestamp,
    },
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useTpiReferencePhotos(componentId: string) {
  return useQuery({
    queryKey: TPI_REFERENCE_PHOTOS_QUERY_KEY(componentId),
    queryFn: () => fetchTpiReferencePhotos(componentId),
    enabled: !!componentId,
  });
}

export function useTpiReferencePhotoStatus(componentId: string) {
  return useQuery({
    queryKey: TPI_REFERENCE_PHOTO_STATUS_QUERY_KEY(componentId),
    queryFn: () => fetchTpiReferencePhotoStatus(componentId),
    enabled: !!componentId,
  });
}

export function useUploadTpiReferencePhotoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadTpiReferencePhoto,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: TPI_REFERENCE_PHOTOS_QUERY_KEY(variables.component_id),
      });
      queryClient.invalidateQueries({
        queryKey: TPI_REFERENCE_PHOTO_STATUS_QUERY_KEY(variables.component_id),
      });
    },
  });
}
