import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { UploadPhotoScreen } from './UploadPhotoScreen';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockMutate = jest.fn();
const mockUseUploadPhotoMutation = jest.fn();

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
}));

describe('UploadPhotoScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = {
      workItemId: 'work-item-1',
      componentId: 'component-1',
      componentName: 'Pumping Mains',
      capturedPhotoPath: 'file:///tmp/photo.jpg',
      capturedAt: '2026-03-17T10:00:00.000Z',
      latitude: 26.9124,
      longitude: 75.7873,
    };
    mockUseUploadPhotoMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      isSuccess: false,
    });
  });

  async function renderScreen() {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(<UploadPhotoScreen />);
    });

    return renderer!.root;
  }

  it('shows captured photo path, gps and captured time when photo is present', async () => {
    const root = await renderScreen();

    expect(
      root.findByProps({ testID: 'upload-captured-photo-path' }).props.children,
    ).toContain('file:///tmp/photo.jpg');

    expect(
      root.findByProps({ testID: 'upload-photo-location-text' }).props.children,
    ).toContain('26.9124');

    expect(
      root.findByProps({ testID: 'upload-photo-time-text' }),
    ).toBeTruthy();
  });

  it('shows no-photo text when capturedPhotoPath is not provided', async () => {
    mockRouteParams = {
      ...mockRouteParams,
      capturedPhotoPath: undefined as unknown as string,
    };

    const root = await renderScreen();

    expect(
      root.findByProps({ testID: 'upload-no-photo-text' }),
    ).toBeTruthy();
  });

  it('renders progress input and submit button', async () => {
    const root = await renderScreen();

    expect(
      root.findByProps({ testID: 'upload-progress-input' }),
    ).toBeTruthy();

    expect(
      root.findByProps({ testID: 'upload-submit-button' }),
    ).toBeTruthy();
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

    expect(mockUseUploadPhotoMutation).toHaveBeenCalledWith(
      'work-item-1',
      'component-1',
    );
    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  it('shows error text when mutation is in error state', async () => {
    mockUseUploadPhotoMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: true,
      isSuccess: false,
    });

    const root = await renderScreen();

    expect(
      root.findByProps({ testID: 'upload-error-text' }),
    ).toBeTruthy();
  });

  it('shows success text and done button when mutation succeeds', async () => {
    mockUseUploadPhotoMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      isSuccess: true,
    });

    const root = await renderScreen();

    expect(
      root.findByProps({ testID: 'upload-success-text' }),
    ).toBeTruthy();

    await act(async () => {
      root.findByProps({ testID: 'upload-done-button' }).props.onPress();
    });

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('navigates to camera screen when capture photo button is pressed', async () => {
    const root = await renderScreen();

    await act(async () => {
      root
        .findByProps({ testID: 'upload-open-camera-button' })
        .props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('Camera', {
      workItemId: 'work-item-1',
      componentId: 'component-1',
      componentName: 'Pumping Mains',
    });
  });
});
