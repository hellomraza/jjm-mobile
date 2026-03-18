import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';
import type { UserProfile } from './useUser';
import {
  AUTH_USER_QUERY_KEY,
  fetchAuthUserProfile,
  fetchUserProfileById,
} from './useUser';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getItem: jest.fn(),
}));

jest.mock('../api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const mockProfile: UserProfile = {
  id: 'user-1',
  code: 'EMP001',
  email: 'employee@jjm.in',
  name: 'Raza Employee',
  role: 'EM',
  district_id: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z',
};

describe('useUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exports auth user query key', () => {
    expect(AUTH_USER_QUERY_KEY).toEqual(['authUser']);
  });

  it('fetchUserProfileById calls GET /users/:id', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: mockProfile });

    const result = await fetchUserProfileById('user-1');

    expect(api.get).toHaveBeenCalledWith('/users/user-1');
    expect(result).toEqual(mockProfile);
  });

  it('fetchAuthUserProfile returns null when no auth user is stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const result = await fetchAuthUserProfile();

    expect(result).toBeNull();
    expect(api.get).not.toHaveBeenCalled();
  });

  it('fetchAuthUserProfile fetches profile using stored auth user id', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ id: 'user-1', email: 'employee@jjm.in', role: 'EM' }),
    );
    (api.get as jest.Mock).mockResolvedValue({ data: mockProfile });

    const result = await fetchAuthUserProfile();

    expect(api.get).toHaveBeenCalledWith('/users/user-1');
    expect(result).toEqual(mockProfile);
  });
});
