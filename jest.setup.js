import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-vector-icons/Feather', () => 'FeatherIcon');
jest.mock('react-native-vector-icons/Entypo', () => 'EntypoIcon');

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('react-native-vision-camera', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  const MockCamera = ReactModule.forwardRef(
    (_props, ref) => {
      return <View testID="camera-view" />;
    },
  );
  return {
    Camera: MockCamera,
    useCameraPermission: () => ({ hasPermission: true, requestPermission: jest.fn() }),
    useCameraDevice: () => ({ id: 'back-camera', hasFlash: true }),
  };
});

jest.mock('@react-native-community/geolocation', () => ({
  requestAuthorization: jest.fn(success => success()),
  getCurrentPosition: jest.fn(success => success({ coords: { latitude: 28.6139, longitude: 77.209 } })),
}));

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/Documents',
  CachesDirectoryPath: '/Caches',
}));

jest.mock('react-native-image-resizer', () => ({
  createResizedImage: jest.fn(),
}));




