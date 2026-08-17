import React from 'react';
import { Alert } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { UploadPhotoScreen } from './UploadPhotoScreen';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockMutate = jest.fn();
const mockUseUploadPhotoMutation = jest.fn();
const mockUseComponents = jest.fn();
const mockUseComponentPhotos = jest.fn();
const mockUseComponentPhotoStatuses = jest.fn();
const mockUseTpiWorkOrder = jest.fn();
const mockUseTpiComponentPhotos = jest.fn();
const mockGetCurrentPosition = jest.fn();
const mockRequestAuthorization = jest.fn();
const mockCompressImageForUpload = jest.fn();
const mockUploadToCloudinary = jest.fn();

jest.mock('@react-native-community/geolocation', () => ({
  requestAuthorization: (success: () => void, error: () => void) =>
    mockRequestAuthorization(success, error),
  getCurrentPosition: (
    success: (pos: object) => void,
    error: (err: object) => void,
    options: object,
  ) => mockGetCurrentPosition(success, error, options),
}));

let mockRouteParams = {
  workItemId: 'work-item-1',
  componentId: 'component-1',
  componentName: 'Pumping Mains',
  capturedPhotoPath: 'file:///tmp/photo.jpg',
  capturedAt: '2026-03-17T10:00:00.000Z',
  latitude: 26.9124,
  longitude: 75.7873,
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: mockRouteParams,
  }),
}));

jest.mock('../hooks/usePhotos', () => ({
  useUploadPhotoMutation: (...args: unknown[]) =>
    mockUseUploadPhotoMutation(...args),
  useComponentPhotos: (...args: unknown[]) =>
    mockUseComponentPhotos(...args),
  useComponentPhotoStatuses: (...args: unknown[]) =>
    mockUseComponentPhotoStatuses(...args),
}));

jest.mock('../hooks/useComponents', () => ({
  useComponents: (...args: unknown[]) => mockUseComponents(...args),
}));

jest.mock('../hooks/useUser', () => ({
  useUser: () => ({ data: { id: 'user-1', role: 'EM' } }),
}));

jest.mock('../hooks/useWorkOrderTpi', () => ({
  useUploadTpiPhotoMutation: () => ({
    mutate: jest.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
  }),
  useTpiWorkOrder: (...args: unknown[]) => mockUseTpiWorkOrder(...args),
  useTpiComponentPhotos: (...args: unknown[]) => mockUseTpiComponentPhotos(...args),
}));

jest.mock('../utils/imageCompression', () => ({
  compressImageForUpload: (...args: unknown[]) =>
    mockCompressImageForUpload(...args),
}));

jest.mock('../services/cloudinaryUpload', () => ({
  uploadToCloudinary: (...args: unknown[]) => mockUploadToCloudinary(...args),
}));

describe('UploadPhotoScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestAuthorization.mockImplementation((success: () => void) =>
      success(),
    );
    // By default, geolocation resolves immediately with a position
    mockGetCurrentPosition.mockImplementation(
      (success: (pos: object) => void) =>
        success({ coords: { latitude: 28.6139, longitude: 77.209 } }),
    );
    mockRouteParams = {
      workItemId: 'work-item-1',
      componentId: 'component-1',
      componentName: 'Pumping Mains',
      capturedPhotoPath: 'file:///tmp/photo.jpg',
      capturedAt: '2026-03-17T10:00:00.000Z',
      latitude: 26.9124,
      longitude: 75.7873,
    };
    mockUseTpiWorkOrder.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockUseTpiComponentPhotos.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockUseUploadPhotoMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      isSuccess: false,
    });
    mockUseComponentPhotoStatuses.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    mockUseComponentPhotos.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    mockCompressImageForUpload.mockResolvedValue({
      uri: 'file:///tmp/photo-compressed.jpg',
      type: 'image/jpeg',
      name: 'photo-compressed.jpg',
      sizeInBytes: 180000,
    });
    mockUploadToCloudinary.mockResolvedValue(
      'https://res.cloudinary.com/demo/image/upload/photo.jpg',
    );
    mockUseComponents.mockReturnValue({
      data: [
        {
          id: 'component-1',
          work_item_id: 'work-item-1',
          component_id: 'master-component-1',
          quantity: 300,
          progress: 120,
          status: 'IN_PROGRESS',
          created_at: '2026-03-16T00:00:00Z',
          updated_at: '2026-03-16T00:00:00Z',
          component: {
            id: 'master-component-1',
            name: 'Pumping Mains',
            unit: 'meters',
            order_number: 1,
            created_at: '2026-03-16T00:00:00Z',
            updated_at: '2026-03-16T00:00:00Z',
          },
        },
      ],
    });
  });

  async function renderScreen() {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(<UploadPhotoScreen />);
    });

    return renderer!.root;
  }

  it('fetches device location when route params have no gps coordinates', async () => {
    mockRouteParams = {
      ...mockRouteParams,
      latitude: undefined as unknown as number,
      longitude: undefined as unknown as number,
    };

    const root = await renderScreen();

    expect(
      root.findByProps({ testID: 'upload-photo-location-text' }).props.children,
    ).toContain('28.6139');
  });

  it('shows location error when device geolocation fails', async () => {
    mockRouteParams = {
      ...mockRouteParams,
      latitude: undefined as unknown as number,
      longitude: undefined as unknown as number,
    };
    mockGetCurrentPosition.mockImplementation(
      (_success: unknown, error: (err: object) => void) =>
        error({ code: 1, message: 'Permission denied' }),
    );

    const root = await renderScreen();

    expect(
      root.findByProps({ testID: 'upload-location-error-text' }),
    ).toBeTruthy();
  });

  it('shows captured photo path, gps and captured time when photo is present', async () => {
    const root = await renderScreen();

    expect(root.findByProps({ testID: 'upload-photo-preview' })).toBeTruthy();

    expect(
      root.findByProps({ testID: 'upload-captured-photo-path' }).props.children,
    ).toContain('file:///tmp/photo.jpg');

    expect(
      root.findByProps({ testID: 'upload-photo-location-text' }).props.children,
    ).toContain('26.9124');

    expect(root.findByProps({ testID: 'upload-photo-time-text' })).toBeTruthy();
  });

  it('shows the approved photo when the component is approved', async () => {
    mockRouteParams = {
      ...mockRouteParams,
      capturedPhotoPath: 'file:///tmp/local-photo.jpg',
    };
    mockUseComponents.mockReturnValue({
      data: [
        {
          id: 'component-1',
          work_item_id: 'work-item-1',
          component_id: 'master-component-1',
          quantity: 300,
          progress: 300,
          status: 'APPROVED',
          created_at: '2026-03-16T00:00:00Z',
          updated_at: '2026-03-16T00:00:00Z',
          component: {
            id: 'master-component-1',
            name: 'Pumping Mains',
            unit: 'meters',
            order_number: 1,
            created_at: '2026-03-16T00:00:00Z',
            updated_at: '2026-03-16T00:00:00Z',
          },
        },
      ],
      isLoading: false,
      isError: false,
    });
    mockUseComponentPhotoStatuses.mockReturnValue({
      data: [
        {
          id: 'photo-approved-1',
          photo_id: 'photo-approved-1',
          photo: {
            id: 'photo-approved-1',
            image_url: 'https://example.com/approved-photo.jpg',
            latitude: 26.9124,
            longitude: 75.7873,
            timestamp: '2026-03-17T10:00:00.000Z',
            employee_id: 'employee-1',
            component_id: 'component-1',
            work_item_id: 'work-item-1',
            is_selected: true,
            is_forwarded_to_do: true,
            created_at: '2026-03-17T10:00:00.000Z',
          },
          component_id: 'component-1',
          work_item_id: 'work-item-1',
          status: 'APPROVED',
          approved_by: 'do-1',
          approvedByUser: {
            id: 'do-1',
            name: 'District Officer',
            email: 'do@example.com',
          },
          approved_at: '2026-03-17T11:00:00.000Z',
          created_at: '2026-03-17T10:00:00.000Z',
        },
        {
          id: 'photo-approved-2',
          photo_id: 'photo-approved-2',
          photo: {
            id: 'photo-approved-2',
            image_url: 'https://example.com/approved-photo-2.jpg',
            latitude: 26.9124,
            longitude: 75.7873,
            timestamp: '2026-03-17T10:30:00.000Z',
            employee_id: 'employee-1',
            component_id: 'component-1',
            work_item_id: 'work-item-1',
            is_selected: true,
            is_forwarded_to_do: true,
            created_at: '2026-03-17T10:30:00.000Z',
          },
          component_id: 'component-1',
          work_item_id: 'work-item-1',
          status: 'APPROVED',
          approved_by: 'do-1',
          approvedByUser: {
            id: 'do-1',
            name: 'District Officer',
            email: 'do@example.com',
          },
          approved_at: '2026-03-17T11:30:00.000Z',
          created_at: '2026-03-17T10:30:00.000Z',
        },
      ],
      isLoading: false,
      isError: false,
    });
    mockUseComponentPhotos.mockReturnValue({
      data: [
        {
          id: 'photo-1',
          image_url: 'https://example.com/photo-1.jpg',
          latitude: 26.9124,
          longitude: 75.7873,
          timestamp: '2026-03-17T10:00:00.000Z',
          employee_id: 'employee-1',
          component_id: 'component-1',
          work_item_id: 'work-item-1',
          is_selected: false,
          is_forwarded_to_do: false,
          created_at: '2026-03-17T10:00:00.000Z',
        },
        {
          id: 'photo-2',
          image_url: 'https://example.com/photo-2.jpg',
          latitude: 26.9124,
          longitude: 75.7873,
          timestamp: '2026-03-17T11:00:00.000Z',
          employee_id: 'employee-1',
          component_id: 'component-1',
          work_item_id: 'work-item-1',
          is_selected: true,
          is_forwarded_to_do: true,
          created_at: '2026-03-17T11:00:00.000Z',
        },
      ],
      isLoading: false,
      isError: false,
    });

    const root = await renderScreen();

    expect(
      root.findByProps({ testID: 'upload-approved-photo-text' }).props.children,
    ).toBe('Approved photo(s) available');
    expect(
      root.findByProps({ testID: 'upload-photo-preview' }).props.source,
    ).toEqual({ uri: 'https://example.com/approved-photo-2.jpg' });

    expect(
      root.findByProps({ testID: 'upload-photo-preview-container' }).props
        .style,
    ).toEqual(
      expect.arrayContaining([expect.objectContaining({ aspectRatio: 3 / 4 })]),
    );

    expect(() =>
      root.findByProps({ testID: 'upload-sequence-warning' }),
    ).toThrow();

    expect(
      root.findByProps({ testID: 'upload-approved-photos-section' }),
    ).toBeTruthy();
    expect(
      root.findByProps({ testID: 'upload-photo-gallery-section' }),
    ).toBeTruthy();
    expect(
      root.findByProps({ testID: 'upload-photo-gallery-0' }).props.source,
    ).toEqual({ uri: 'https://example.com/photo-2.jpg' });
    expect(
      root.findByProps({ testID: 'upload-photo-gallery-1' }).props.source,
    ).toEqual({ uri: 'https://example.com/photo-1.jpg' });
    expect(() =>
      root.findByProps({ testID: 'upload-captured-photo-path' }),
    ).toThrow();
  });

  it('shows a photo status summary when the component has multiple reviewed photos', async () => {
    mockUseComponentPhotoStatuses.mockReturnValue({
      data: [
        {
          id: 'photo-status-1',
          photo_id: 'photo-1',
          photo: {
            id: 'photo-1',
            image_url: 'https://example.com/photo-1.jpg',
            latitude: 26.9124,
            longitude: 75.7873,
            timestamp: '2026-03-17T10:00:00.000Z',
            employee_id: 'employee-1',
            component_id: 'component-1',
            work_item_id: 'work-item-1',
            is_selected: false,
            is_forwarded_to_do: false,
            created_at: '2026-03-17T10:00:00.000Z',
          },
          component_id: 'component-1',
          work_item_id: 'work-item-1',
          status: 'SELECTED',
          selected_by: 'co-1',
          selectedByUser: {
            id: 'co-1',
            name: 'Contractor Name',
            email: 'contractor@example.com',
          },
          selected_at: '2026-03-17T10:30:00.000Z',
          created_at: '2026-03-17T10:00:00.000Z',
        },
        {
          id: 'photo-status-2',
          photo_id: 'photo-2',
          photo: {
            id: 'photo-2',
            image_url: 'https://example.com/photo-2.jpg',
            latitude: 26.9124,
            longitude: 75.7873,
            timestamp: '2026-03-17T11:00:00.000Z',
            employee_id: 'employee-1',
            component_id: 'component-1',
            work_item_id: 'work-item-1',
            is_selected: true,
            is_forwarded_to_do: true,
            created_at: '2026-03-17T11:00:00.000Z',
          },
          component_id: 'component-1',
          work_item_id: 'work-item-1',
          status: 'APPROVED',
          approved_by: 'do-1',
          approvedByUser: {
            id: 'do-1',
            name: 'District Officer',
            email: 'do@example.com',
          },
          approved_at: '2026-03-17T11:30:00.000Z',
          created_at: '2026-03-17T11:00:00.000Z',
        },
      ],
      isLoading: false,
      isError: false,
    });

    const root = await renderScreen();

    expect(
      root.findByProps({ testID: 'upload-photo-status-summary' }).props
        .children,
    ).toContain('2 photos');
    expect(
      root.findByProps({ testID: 'upload-photo-preview' }).props.source,
    ).toEqual({ uri: 'https://example.com/photo-2.jpg' });
  });

  it('hides the progress input when the component is locked', async () => {
    mockRouteParams = {
      ...mockRouteParams,
      componentId: 'component-2',
    };
    mockUseComponents.mockReturnValue({
      data: [
        {
          id: 'component-1',
          work_item_id: 'work-item-1',
          component_id: 'master-component-1',
          quantity: 300,
          progress: 120,
          status: 'IN_PROGRESS',
          created_at: '2026-03-16T00:00:00Z',
          updated_at: '2026-03-16T00:00:00Z',
          component: {
            id: 'master-component-1',
            name: 'Pumping Mains',
            unit: 'meters',
            order_number: 1,
            created_at: '2026-03-16T00:00:00Z',
            updated_at: '2026-03-16T00:00:00Z',
          },
        },
        {
          id: 'component-2',
          work_item_id: 'work-item-1',
          component_id: 'master-component-2',
          quantity: 100,
          progress: 0,
          status: 'PENDING',
          created_at: '2026-03-16T00:00:00Z',
          updated_at: '2026-03-16T00:00:00Z',
          component: {
            id: 'master-component-2',
            name: 'Valve',
            unit: 'nos',
            order_number: 2,
            created_at: '2026-03-16T00:00:00Z',
            updated_at: '2026-03-16T00:00:00Z',
          },
        },
      ],
    });

    const root = await renderScreen();

    expect(() =>
      root.findByProps({ testID: 'upload-progress-input' }),
    ).toThrow();
  });

  it('shows dotted photo placeholder when capturedPhotoPath is not provided', async () => {
    mockRouteParams = {
      ...mockRouteParams,
      capturedPhotoPath: undefined as unknown as string,
    };

    const root = await renderScreen();

    expect(
      root.findByProps({ testID: 'upload-photo-placeholder' }),
    ).toBeTruthy();
  });

  it('renders progress input and submit button', async () => {
    const root = await renderScreen();

    expect(root.findByProps({ testID: 'upload-progress-input' })).toBeTruthy();

    expect(root.findByProps({ testID: 'upload-submit-button' })).toBeTruthy();
  });

  it('calls mutation with correct workItemId and componentId on submit', async () => {
    const root = await renderScreen();

    await act(async () => {
      root
        .findByProps({ testID: 'upload-progress-input' })
        .props.onChangeText('75');
    });

    await act(async () => {
      root.findByProps({ testID: 'upload-submit-button' }).props.onPress();
    });

    expect(mockCompressImageForUpload).toHaveBeenCalledWith(
      'file:///tmp/photo.jpg',
    );
    expect(mockUploadToCloudinary).toHaveBeenCalledTimes(1);
    expect(mockUseUploadPhotoMutation).toHaveBeenCalledWith(
      'work-item-1',
      'component-1',
    );
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        photoUrl: 'https://res.cloudinary.com/demo/image/upload/photo.jpg',
        work_item_id: 'work-item-1',
        component_id: 'component-1',
        progress: 75,
      }),
      expect.any(Object),
    );
  });

  it('shows error text when mutation is in error state', async () => {
    mockUseUploadPhotoMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: true,
      isSuccess: false,
    });

    const root = await renderScreen();

    expect(root.findByProps({ testID: 'upload-error-text' })).toBeTruthy();
  });

  it('shows success text and done button when mutation succeeds', async () => {
    mockUseUploadPhotoMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      isSuccess: true,
    });

    const root = await renderScreen();

    expect(root.findByProps({ testID: 'upload-success-text' })).toBeTruthy();

    await act(async () => {
      root.findByProps({ testID: 'upload-done-button' }).props.onPress();
    });

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('navigates to camera screen when photo placeholder is pressed', async () => {
    mockRouteParams = {
      ...mockRouteParams,
      capturedPhotoPath: undefined as unknown as string,
    };

    const root = await renderScreen();

    await act(async () => {
      root.findByProps({ testID: 'upload-photo-placeholder' }).props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('Camera', {
      workItemId: 'work-item-1',
      componentId: 'component-1',
      componentName: 'Pumping Mains',
    });
  });

  it('goes back when back button is pressed', async () => {
    const root = await renderScreen();

    await act(async () => {
      root.findByProps({ testID: 'upload-back-button' }).props.onPress();
    });

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('blocks submit when selected component is out of sequence', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    mockRouteParams = {
      ...mockRouteParams,
      componentId: 'component-2',
    };
    mockUseComponents.mockReturnValue({
      data: [
        {
          id: 'component-1',
          work_item_id: 'work-item-1',
          component_id: 'master-component-1',
          quantity: 300,
          progress: 120,
          status: 'IN_PROGRESS',
          created_at: '2026-03-16T00:00:00Z',
          updated_at: '2026-03-16T00:00:00Z',
          component: {
            id: 'master-component-1',
            name: 'Pumping Mains',
            unit: 'meters',
            order_number: 1,
            created_at: '2026-03-16T00:00:00Z',
            updated_at: '2026-03-16T00:00:00Z',
          },
        },
        {
          id: 'component-2',
          work_item_id: 'work-item-1',
          component_id: 'master-component-2',
          quantity: 100,
          progress: 0,
          status: 'PENDING',
          created_at: '2026-03-16T00:00:00Z',
          updated_at: '2026-03-16T00:00:00Z',
          component: {
            id: 'master-component-2',
            name: 'Valve',
            unit: 'nos',
            order_number: 2,
            created_at: '2026-03-16T00:00:00Z',
            updated_at: '2026-03-16T00:00:00Z',
          },
        },
      ],
    });

    const root = await renderScreen();

    expect(
      root.findByProps({ testID: 'upload-sequence-warning' }),
    ).toBeTruthy();

    expect(() =>
      root.findByProps({ testID: 'upload-submit-button' }),
    ).toThrow();
    expect(mockMutate).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it('renders uploaded photo details and hides submit button for TPI when photo is already uploaded', async () => {
    mockUseTpiWorkOrder.mockReturnValue({
      data: {
        id: 'tpi-work-order-1',
        title: 'TPI Order',
        components: [
          {
            id: 'component-1',
            name: 'Inspection Milestone 1',
            progress: 85,
            status: 'IN_PROGRESS',
            photos: [
              {
                id: 'photo-1',
                image_url: 'https://res.cloudinary.com/demo/tpi-photo.jpg',
                latitude: 26.9124,
                longitude: 75.7873,
                timestamp: '2026-03-17T12:00:00.000Z',
              },
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
    });

    mockRouteParams = {
      workItemId: 'tpi-work-order-1',
      componentId: 'component-1',
      componentName: 'Inspection Milestone 1',
      capturedPhotoPath: '',
      capturedAt: '',
      latitude: undefined as any,
      longitude: undefined as any,
      isTpi: true as any,
    };

    const root = await renderScreen();

    expect(
      root.findByProps({ testID: 'upload-tpi-completed-banner' }),
    ).toBeTruthy();
    expect(
      root.findByProps({ testID: 'upload-tpi-uploaded-text' }),
    ).toBeTruthy();
    expect(() =>
      root.findByProps({ testID: 'upload-submit-button' }),
    ).toThrow();
    expect(() =>
      root.findByProps({ testID: 'upload-photo-placeholder' }),
    ).toThrow();
  });
});
