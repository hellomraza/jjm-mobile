import { Dimensions, PixelRatio } from 'react-native';

const designResolution = {
  width: 1125,
  height: 2436,
};

const baseWidth = designResolution.width / 3;
const { width: screenWidth } = Dimensions.get('window');

export const perfectSize = (size: number) => {
  const scaled = (screenWidth / baseWidth) * size;
  return PixelRatio.roundToNearestPixel(scaled);
};
