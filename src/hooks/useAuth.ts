import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api, { ACCESS_TOKEN_KEY } from '../api/client';
import type { LoginResponse, LoginUserResponseDto } from '../api/responseTypes';

export const AUTH_USER_KEY = 'auth_user';

export type LoginPayload = {
  email: string;
  password: string;
};

export async function loginRequest(
  payload: LoginPayload,
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', payload);
  return response.data;
}

export async function persistAccessToken(token: string): Promise<void> {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export async function persistAuthUser(
  user: LoginUserResponseDto,
): Promise<void> {
  await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export async function getPersistedAuthUser(): Promise<LoginUserResponseDto | null> {
  const rawValue = await AsyncStorage.getItem(AUTH_USER_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as LoginUserResponseDto;
  } catch {
    return null;
  }
}

export async function removeAccessToken(): Promise<void> {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
}

export async function removePersistedAuthUser(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_USER_KEY);
}

export function useAuth() {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: async data => {
      if (data.access_token) {
        await persistAccessToken(data.access_token);
      }

      if (data.user) {
        await persistAuthUser(data.user);
      }

      await queryClient.invalidateQueries({ queryKey: ['authUser'] });
    },
  });

  const logout = async () => {
    await removeAccessToken();
    await removePersistedAuthUser();
    await queryClient.invalidateQueries({ queryKey: ['authUser'] });
  };

  return {
    loginMutation,
    logout,
  };
}
