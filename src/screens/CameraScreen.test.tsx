import React from 'react';
import { Alert, Vibration } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { CameraScreen } from './CameraScreen';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockRequestCameraPermission = jest.fn();
const mockGetLocationPermissionStatus = jest.fn();
const mockRequestLocationPermission = jest.fn();
const mockUseCameraPermission = jest.fn();
const mockUseCameraDevice = jest.fn();
const mockTakePhoto = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: {
      workItemId: 'work-item-1',
      componentId: 'component-1',
      componentName: 'Pumping Mains',
    },
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('react-native-vision-camera', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');

  const MockCamera = ReactModule.forwardRef(
    (_props: unknown, ref: React.Ref<unknown>) => {
      ReactModule.useImperativeHandle(ref, () => ({
        takePhoto: mockTakePhoto,
      }));

      return <View testID="camera-view" />;
    },
  );

  return {
    Camera: Object.assign(MockCamera, {
      getLocationPermissionStatus: () => mockGetLocationPermissionStatus(),
      requestLocationPermission: () => mockRequestLocationPermission(),
    }),
    useCameraPermission: () => mockUseCameraPermission(),
    useCameraDevice: () => mockUseCameraDevice(),
  };
});

describe('CameraScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseCameraPermission.mockReturnValue({
      hasPermission: true,
      requestPermission: mockRequestCameraPermission,
    });

    mockUseCameraDevice.mockReturnValue({ id: 'back-camera', hasFlash: true });
    mockGetLocationPermissionStatus.mockReturnValue('granted');
    mockRequestLocationPermission.mockResolvedValue('granted');
    mockTakePhoto.mockResolvedValue({
      path: '/tmp/photo.jpg',
      metadata: {
        '{GPS}': {
          Latitude: 26.9124,
          Longitude: 75.7873,
        },
      },
    });
  });

  async function renderScreen() {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(<CameraScreen />);
    });

    return renderer!.root;
  }

  it('shows permission prompt and requests permissions when camera permission is missing', async () => {
    mockUseCameraPermission.mockReturnValue({
      hasPermission: false,
      requestPermission: mockRequestCameraPermission,
    });
    mockRequestCameraPermission.mockResolvedValue('granted');

    const root = await renderScreen();

    await act(async () => {
      root
        .findByProps({ testID: 'camera-request-permission-button' })
        .props.onPress();
    });

    expect(mockRequestCameraPermission).toHaveBeenCalledTimes(1);
    expect(mockRequestLocationPermission).toHaveBeenCalledTimes(1);
  });

  it('renders camera preview and capture button when permissions are granted', async () => {
    const root = await renderScreen();

    expect(root.findByProps({ testID: 'camera-view' })).toBeTruthy();
    expect(root.findByProps({ testID: 'camera-capture-button' })).toBeTruthy();
    expect(root.findByProps({ testID: 'camera-flash-button' })).toBeTruthy();
  });

  it('toggles flash and vibrates when flash button is pressed on supported devices', async () => {
    const vibrateSpy = jest
      .spyOn(Vibration, 'vibrate')
      .mockImplementation(jest.fn());

    const root = await renderScreen();

    await act(async () => {
      root.findByProps({ testID: 'camera-flash-button' }).props.onPress();
    });

    expect(vibrateSpy).toHaveBeenCalledWith(100);

    vibrateSpy.mockRestore();
  });

  it('shows alert when flash is not supported', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    mockUseCameraDevice.mockReturnValue({ id: 'back-camera', hasFlash: false });

    const root = await renderScreen();

    await act(async () => {
      root.findByProps({ testID: 'camera-flash-button' }).props.onPress();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Flash Not Supported',
      'This device does not support flash/torch functionality.',
    );

    alertSpy.mockRestore();
  });

  it('captures photo and navigates back to upload screen with gps metadata', async () => {
    const root = await renderScreen();

    await act(async () => {
      root.findByProps({ testID: 'camera-capture-button' }).props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('UploadPhoto', {
      workItemId: 'work-item-1',
      componentId: 'component-1',
      componentName: 'Pumping Mains',
      capturedPhotoPath: 'file:///tmp/photo.jpg',
      capturedAt: expect.any(String),
      latitude: 26.9124,
      longitude: 75.7873,
    });
  });

  it('goes back on back button press', async () => {
    const root = await renderScreen();

    act(() => {
      root.findByProps({ testID: 'camera-back-button' }).props.onPress();
    });

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
