import { QueryClient } from '@tanstack/react-query';
import api from '../api/client';
import type { ComponentPhoto } from './usePhotos';
import {
  componentPhotosQueryKey,
  fetchComponentPhotos,
  uploadComponentPhoto,
} from './usePhotos';

jest.mock('../api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

describe('usePhotos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exports correct component photos query key', () => {
    expect(componentPhotosQueryKey('component-1')).toEqual([
      'componentPhotos',
      'component-1',
    ]);
  });

  it('fetchComponentPhotos calls GET /components/:componentId/photos and returns data list', async () => {
    const mockPhotos: ComponentPhoto[] = [
      {
        id: 'photo-1',
        image_url: 'https://example.com/photo-1.jpg',
        latitude: 25.5941,
        longitude: 85.1376,
        timestamp: '2026-03-16T00:00:00Z',
        employee_id: 'employee-1',
        component_id: 'component-1',
        work_item_id: 'work-item-1',
        is_selected: false,
        is_forwarded_to_do: false,
        created_at: '2026-03-16T00:00:00Z',
      },
    ];

    (api.get as jest.Mock).mockResolvedValue({
      data: {
        data: mockPhotos,
        total: 1,
        limit: 10,
        page: 1,
        totalPages: 1,
      },
    });

    const result = await fetchComponentPhotos('component-1');

    expect(api.get).toHaveBeenCalledWith('/components/component-1/photos');
    expect(result).toEqual(mockPhotos);
  });

  it('component photos query key fetches and caches data', async () => {
    const mockPhotos: ComponentPhoto[] = [
      {
        id: 'photo-1',
        image_url: 'https://example.com/photo-1.jpg',
        latitude: 25.5941,
        longitude: 85.1376,
        timestamp: '2026-03-16T00:00:00Z',
        employee_id: 'employee-1',
        component_id: 'component-1',
        work_item_id: 'work-item-1',
        is_selected: false,
        is_forwarded_to_do: false,
        created_at: '2026-03-16T00:00:00Z',
      },
    ];

    (api.get as jest.Mock).mockResolvedValue({
      data: {
        data: mockPhotos,
        total: 1,
        limit: 10,
        page: 1,
        totalPages: 1,
      },
    });

    const queryClient = makeQueryClient();

    await queryClient.prefetchQuery({
      queryKey: componentPhotosQueryKey('component-1'),
      queryFn: () => fetchComponentPhotos('component-1'),
    });

    expect(api.get).toHaveBeenCalledWith('/components/component-1/photos');
    expect(
      queryClient.getQueryData(componentPhotosQueryKey('component-1')),
    ).toEqual(mockPhotos);
  });

  it('uploadComponentPhoto calls POST /components/:componentId/photos and returns data', async () => {
    const payload = {
      progress: 50,
      latitude: 25.5941,
      longitude: 85.1376,
      image: 'base64-photo',
    };

    const uploadedPhoto = {
      id: 'photo-2',
      image_url: 'https://example.com/photo-2.jpg',
      latitude: 25.5941,
      longitude: 85.1376,
      timestamp: '2026-03-16T01:00:00Z',
      employee_id: 'employee-1',
      component_id: 'component-1',
      work_item_id: 'work-item-1',
      is_selected: false,
      is_forwarded_to_do: false,
      created_at: '2026-03-16T01:00:00Z',
    };

    (api.post as jest.Mock).mockResolvedValue({ data: uploadedPhoto });

    const result = await uploadComponentPhoto('component-1', payload);

    expect(api.post).toHaveBeenCalledWith('/components/component-1/photos', payload);
    expect(result).toEqual(uploadedPhoto);
  });
});
