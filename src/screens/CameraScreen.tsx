import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Camera,
  type PhotoFile,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { PrimaryButton } from '../components/PrimaryButton';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { fontSize, fontWeight, radius, spacing } from '../theme/designSystem';
import { SafeAreaView } from 'react-native-safe-area-context';

type CameraRouteProp = RouteProp<RootStackParamList, 'Camera'>;
type CameraNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Camera'
>;

type GpsMetadata = {
  latitude?: number;
  longitude?: number;
};

function toFileUri(path: string) {
  if (path.startsWith('file://')) {
    return path;
  }

  return `file://${path}`;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return value;
  }

  return undefined;
}

export function extractGpsMetadata(photo: PhotoFile): GpsMetadata {
  const metadata = photo.metadata as Record<string, unknown> | undefined;
  const gps = metadata?.['{GPS}'] as Record<string, unknown> | undefined;

  return {
    latitude: toNumber(gps?.Latitude),
    longitude: toNumber(gps?.Longitude),
  };
}

export function CameraScreen() {
  const navigation = useNavigation<CameraNavigationProp>();
  const route = useRoute<CameraRouteProp>();
  const { workItemId, componentId, componentName } = route.params;
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const status = Camera.getLocationPermissionStatus();
      setHasLocationPermission(status === 'granted');
    } catch {
      setHasLocationPermission(false);
    }
  }, []);

  const requestPermissions = async () => {
    setErrorMessage(null);

    const cameraGranted = await requestPermission();
    if (!cameraGranted) {
      setErrorMessage('Camera permission is required to capture photos.');
      return;
    }

    try {
      const locationResult = await Camera.requestLocationPermission();
      setHasLocationPermission(locationResult === 'granted');
    } catch {
      setHasLocationPermission(false);
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) {
      return;
    }

    setIsCapturing(true);
    setErrorMessage(null);

    try {
      const photo = await cameraRef.current.takePhoto();
      const gps = extractGpsMetadata(photo);

      navigation.navigate('UploadPhoto', {
        workItemId,
        componentId,
        componentName,
        capturedPhotoPath: toFileUri(photo.path),
        capturedAt: new Date().toISOString(),
        latitude: gps.latitude,
        longitude: gps.longitude,
      });
    } catch {
      setErrorMessage('Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  if (!hasPermission) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.title}>Camera Permission Required</Text>
          <Text style={styles.caption}>
            Please allow camera access to take component photos.
          </Text>
          {errorMessage ? (
            <Text style={styles.errorText} testID="camera-error-text">
              {errorMessage}
            </Text>
          ) : null}
          <PrimaryButton
            label="Grant Camera Access"
            onPress={requestPermissions}
            testID="camera-request-permission-button"
          />
          <PrimaryButton
            label="Close"
            onPress={() => navigation.goBack()}
            testID="camera-close-button"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.title}>Camera Unavailable</Text>
          <Text style={styles.caption}>
            No compatible camera device was found.
          </Text>
          <PrimaryButton
            label="Close"
            onPress={() => navigation.goBack()}
            testID="camera-close-button"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.previewContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          device={device}
          isActive
          photo
          enableLocation={hasLocationPermission}
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          GPS metadata:{' '}
          {hasLocationPermission
            ? 'enabled'
            : 'location permission not granted'}
        </Text>
        {errorMessage ? (
          <Text style={styles.errorText} testID="camera-error-text">
            {errorMessage}
          </Text>
        ) : null}
      </View>
      <View style={styles.controls}>
        <PrimaryButton
          label={isCapturing ? 'Capturing...' : 'Capture Photo'}
          onPress={handleCapture}
          disabled={isCapturing}
          testID="camera-capture-button"
        />
        <PrimaryButton
          label="Close"
          onPress={() => navigation.goBack()}
          testID="camera-close-button"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondaryBackground,
  },
  permissionContainer: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  caption: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  previewContainer: {
    flex: 1,
    margin: spacing.md,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  infoContainer: {
    paddingHorizontal: spacing.md,
  },
  infoText: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
  },
  controls: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
