import { QueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { componentsQueryKey } from './useComponents';
import type { ComponentPhoto, ComponentPhotoStatus } from './usePhotos';
import {
  componentPhotoStatusesQueryKey,
  componentPhotosQueryKey,
  fetchComponentPhotoStatuses,
  fetchComponentPhotos,
  invalidatePhotoUploadQueries,
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

  it('exports correct component photo statuses query key', () => {
    expect(componentPhotoStatusesQueryKey('component-1')).toEqual([
      'componentPhotoStatuses',
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

  it('fetchComponentPhotoStatuses calls GET /photo-status/component/:componentId and returns data list', async () => {
    const mockPhotoStatuses: ComponentPhotoStatus[] = [
      {
        id: 'photo-status-1',
        photo_id: 'photo-1',
        photo: {
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
        work_item_id: 'work-item-1',
        component_id: 'component-1',
        status: 'SELECTED',
        selected_by: 'co-1',
        selectedByUser: {
          id: 'co-1',
          name: 'Contractor Name',
          email: 'contractor@example.com',
        },
        selected_at: '2026-03-16T01:00:00Z',
      },
    ];

    (api.get as jest.Mock).mockResolvedValue({
      data: {
        data: mockPhotoStatuses,
        total: 1,
        limit: 10,
        page: 1,
        totalPages: 1,
      },
    });

    const result = await fetchComponentPhotoStatuses('component-1');

    expect(api.get).toHaveBeenCalledWith('/photo-status/component/component-1');
    expect(result).toEqual(mockPhotoStatuses);
  });

  it('uploadComponentPhoto calls POST /photo/upload-url and returns data', async () => {
    const payload = {
      photoUrl: 'https://res.cloudinary.com/demo/image/upload/v1/photo.jpg',
      work_item_id: 'work-item-1',
      component_id: 'component-1',
      progress: 50,
      latitude: 25.5941,
      longitude: 85.1376,
      timestamp: '2026-03-16T01:00:00Z',
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

    const result = await uploadComponentPhoto(payload);

    expect(api.post).toHaveBeenCalledWith(
      '/components/component-1/photos-url',
      {
        progress: '50',
        latitude: 25.5941,
        longitude: 85.1376,
        timestamp: '2026-03-16T01:00:00Z',
        photoUrl: 'https://res.cloudinary.com/demo/image/upload/v1/photo.jpg',
      },
    );
    expect(result).toEqual(uploadedPhoto);
  });

  it('invalidatePhotoUploadQueries invalidates components and componentPhotos query keys', () => {
    const queryClient = makeQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    invalidatePhotoUploadQueries(queryClient, 'work-item-1', 'component-1');

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: componentsQueryKey('work-item-1'),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: componentPhotosQueryKey('component-1'),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: componentPhotoStatusesQueryKey('component-1'),
    });
    expect(invalidateSpy).toHaveBeenCalledTimes(3);
  });
});
