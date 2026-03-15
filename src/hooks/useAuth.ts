import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api, { ACCESS_TOKEN_KEY } from '../api/client';

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
};

export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', payload);
  return response.data;
}

export async function persistAccessToken(token: string): Promise<void> {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export async function removeAccessToken(): Promise<void> {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function useAuth() {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: async data => {
      if (data.access_token) {
        await persistAccessToken(data.access_token);
      }

      await queryClient.invalidateQueries({ queryKey: ['authUser'] });
    },
  });

  const logout = async () => {
    await removeAccessToken();
    await queryClient.invalidateQueries({ queryKey: ['authUser'] });
  };

  return {
    loginMutation,
    logout,
  };
}
