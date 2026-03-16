import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import api from '../api/client';
import {
  loginRequest,
  persistAccessToken,
  removeAccessToken,
  useAuth,
} from './useAuth';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getItem: jest.fn(),
}));

jest.mock('../api/client', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
  ACCESS_TOKEN_KEY: 'access_token',
}));

type AuthHookValue = ReturnType<typeof useAuth>;

function HookHarness({ onReady }: { onReady: (value: AuthHookValue) => void }) {
  const value = useAuth();

  useEffect(() => {
    onReady(value);
  }, [onReady, value]);

  return null;
}

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockLoginUser = {
    id: 'user-1',
    email: 'employee@jjm.in',
    role: 'EM',
  } as const;

  it('calls login API through loginRequest', async () => {
    (api.post as jest.Mock).mockResolvedValue({
      data: { access_token: 'token-1', user: mockLoginUser },
    });

    const result = await loginRequest({ email: 'a@b.com', password: 'secret' });

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'a@b.com',
      password: 'secret',
    });
    expect(result).toEqual({ access_token: 'token-1', user: mockLoginUser });
  });

  it('persists and removes access token', async () => {
    await persistAccessToken('token-2');
    await removeAccessToken();

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'access_token',
      'token-2',
    );
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('access_token');
  });

  it('stores token and invalidates auth query after login mutation', async () => {
    (api.post as jest.Mock).mockResolvedValue({
      data: { access_token: 'token-3', user: mockLoginUser },
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    let hookValue: AuthHookValue | undefined;

    await act(async () => {
      ReactTestRenderer.create(
        <QueryClientProvider client={queryClient}>
          <HookHarness
            onReady={value => {
              hookValue = value;
            }}
          />
        </QueryClientProvider>,
      );
    });

    await act(async () => {
      await hookValue?.loginMutation.mutateAsync({
        email: 'employee@jjm.in',
        password: 'pass1234',
      });
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'access_token',
      'token-3',
    );
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['authUser'] });
  });

  it('clears token and invalidates auth query on logout', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    let hookValue: AuthHookValue | undefined;

    await act(async () => {
      ReactTestRenderer.create(
        <QueryClientProvider client={queryClient}>
          <HookHarness
            onReady={value => {
              hookValue = value;
            }}
          />
        </QueryClientProvider>,
      );
    });

    await act(async () => {
      await hookValue?.logout();
    });

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('access_token');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['authUser'] });
  });
});
