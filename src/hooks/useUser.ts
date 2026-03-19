import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import type {
  GetUserByIdResponse,
  UserResponseDto,
} from '../api/responseTypes';
import { getPersistedAuthUser } from './useAuth';

export type UserProfile = UserResponseDto;

export const AUTH_USER_QUERY_KEY = ['authUser'] as const;
export const userQueryKey = (id: string) => ['user', id] as const;

export async function fetchUserProfileById(id: string): Promise<UserProfile> {
  const response = await api.get<GetUserByIdResponse>(`/users/${id}`);
  return response.data;
}

export async function fetchAuthUserProfile(): Promise<UserProfile | null> {
  const authUser = await getPersistedAuthUser();
  if (!authUser?.id) {
    return null;
  }

  return fetchUserProfileById(authUser.id);
}

export function useUser() {
  return useQuery({
    queryKey: AUTH_USER_QUERY_KEY,
    queryFn: fetchAuthUserProfile,
  });
}

export function useUserById(id?: string) {
  return useQuery({
    queryKey: userQueryKey(id ?? ''),
    queryFn: () => fetchUserProfileById(id ?? ''),
    enabled: !!id,
  });
}
