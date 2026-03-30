import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Entypo';
import {
  Camera,
  type PhotoFile,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { BackButton } from '../components/BackButton';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { fontSize, fontWeight, radius, spacing } from '../theme/designSystem';

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
  const insets = useSafeAreaInsets();
  const { workItemId, componentId, componentName } = route.params;
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [torch, setTorch] = useState<'on' | 'off'>('off');

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

      navigation.replace('UploadPhoto', {
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

  const toggleTorch = () => {
    // if torch in not supported, do nothing
    if (!device?.hasFlash) {
      Alert.alert(
        'Flash Not Supported',
        'This device does not support flash/torch functionality.',
      );
      return;
    }

    Vibration?.vibrate(100);

    setTorch(prev => (prev === 'on' ? 'off' : 'on'));
  };

  if (!hasPermission) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <BackButton
          onPress={() => navigation.goBack()}
          testID="camera-back-button"
          icon={<Icon name="cross" size={20} color={colors.primary} />}
        />
        <View style={styles.permissionContainer}>
          <View style={styles.permissionCard}>
            <View style={styles.permissionIconWrap}>
              <Icon name="camera" size={28} color={colors.primary} />
            </View>
            <Text style={styles.title}>Camera Permission Required</Text>
            <Text style={styles.caption}>
              Please allow camera access to take component photos.
            </Text>
            {errorMessage ? (
              <Text style={styles.errorText} testID="camera-error-text">
                {errorMessage}
              </Text>
            ) : null}
            <Pressable
              style={styles.permissionButton}
              onPress={requestPermissions}
              testID="camera-request-permission-button"
            >
              <Text style={styles.permissionButtonText}>
                Grant Camera Access
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.permissionContainer}>
          <BackButton
            onPress={() => navigation.goBack()}
            testID="camera-back-button"
            icon={<Icon name="cross" size={20} color={colors.primary} />}
          />
          <View style={styles.permissionCard}>
            <View style={styles.permissionIconWrap}>
              <Icon name="camera" size={28} color={colors.primary} />
            </View>
            <Text style={styles.title}>Camera Unavailable</Text>
            <Text style={styles.caption}>
              No compatible camera device was found.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.fullscreenContainer}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive
        photo
        enableLocation={hasLocationPermission}
        torch={torch}
      />

      <View
        style={[styles.floatingTopControls, { top: spacing.md + insets.top }]}
      >
        <BackButton
          onPress={() => navigation.goBack()}
          testID="camera-back-button"
          icon={<Icon name="cross" size={30} color={colors.primary} />}
        />
        <Pressable
          style={styles.floatingActionButton}
          onPress={toggleTorch}
          testID="camera-flash-button"
        >
          <Icon
            name="flash"
            size={26}
            color={torch === 'off' ? colors.textPrimary : colors.torchOn}
          />
        </Pressable>
      </View>

      <View
        style={[styles.floatingMetaContainer, { top: spacing.md + insets.top }]}
      >
        <Text numberOfLines={1} style={styles.metaPillText}>
          {componentName}
        </Text>
        <View style={styles.dotSeparator} />
        <Text style={styles.metaPillText}>
          GPS {hasLocationPermission ? 'On' : 'Off'}
        </Text>
      </View>

      {/* <View style={styles.floatingInfoContainer}>
        <Text style={styles.infoText}>
          GPS: {hasLocationPermission ? 'enabled' : 'permission not granted'}
        </Text>
        {errorMessage ? (
          <Text style={styles.errorOverlayText} testID="camera-error-text">
            {errorMessage}
          </Text>
        ) : null}
      </View> */}

      <View
        style={[styles.floatingBottomControls, { bottom: 32 + insets.bottom }]}
      >
        <Pressable
          style={[
            styles.captureButton,
            isCapturing && styles.captureButtonDisabled,
          ]}
          onPress={handleCapture}
          disabled={isCapturing}
          testID="camera-capture-button"
        >
          <View style={styles.captureButtonInner} />
        </Pressable>
        {!isCapturing ? (
          <Text style={styles.captureHintText}>Tap to capture</Text>
        ) : null}
        {isCapturing ? (
          <Text style={styles.captureHintText}>Capturing...</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondaryBackground,
    paddingTop: spacing.md,
  },
  permissionContainer: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  permissionIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryBackground,
    marginBottom: spacing.sm,
  },
  permissionButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  permissionButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  floatingTopControls: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    left: 0,
    right: spacing.md,
    zIndex: 2,
  },
  floatingActionButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  floatingMetaContainer: {
    position: 'absolute',
    left: spacing.md * 2 + 40,
    right: spacing.md * 2 + 40,
    height: 40,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
  },
  metaPillText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: spacing.xs,
    backgroundColor: colors.white,
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
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  floatingInfoContainer: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: 116,
    zIndex: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  infoText: {
    color: colors.white,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  floatingBottomControls: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 2,
    alignItems: 'center',
  },
  captureButton: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 6,
    borderColor: colors.white,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 66,
    height: 66,
    borderRadius: 35,
    backgroundColor: colors.primary,
  },
  captureHintText: {
    marginTop: spacing.xs,
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  errorOverlayText: {
    color: '#FEE2E2',
    fontSize: fontSize.sm,
    marginTop: spacing.xxs,
    textAlign: 'center',
  },
});
