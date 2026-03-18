import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import type {
  GetLocationByIdResponse,
  LocationResponseDto,
  LocationType,
} from '../api/responseTypes';

export type Location = LocationResponseDto;

export const locationQueryKey = (type: LocationType, id: number) =>
  ['location', type, id] as const;

export async function fetchLocationByTypeAndId(
  type: LocationType,
  id: number,
): Promise<Location> {
  const response = await api.get<GetLocationByIdResponse>(
    `/locations/${type}/${id}`,
  );
  return response.data;
}

export function useLocationByTypeAndId(type: LocationType, id?: number) {
  return useQuery({
    queryKey: locationQueryKey(type, id ?? 0),
    queryFn: () => fetchLocationByTypeAndId(type, id ?? 0),
    enabled: typeof id === 'number' && id > 0,
  });
}
