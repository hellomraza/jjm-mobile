import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';

// NOTE: react-native-vision-camera requires manual native configuration.
// Follow the official docs at https://react-native-vision-camera.com/ before
// running this screen on a device or simulator.

export function CameraScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Camera preview will be added after native configuration is confirmed */}
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Camera Preview</Text>
        <Text style={styles.caption}>
          Camera requires native setup. See official docs.
        </Text>
      </View>
      <View style={styles.controls}>
        <PrimaryButton
          label="Close"
          onPress={() => navigation.goBack()}
          testID="camera-close-button"
        />
      </View>
    </View>
  );
}

// Re-export Camera so callers can request required permissions:
//   const devices = useCameraDevices();
//   const device = devices.back;
//   <Camera device={device} isActive photo />
export { Camera };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 8,
  },
  caption: {
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  controls: {
    padding: 24,
  },
});
