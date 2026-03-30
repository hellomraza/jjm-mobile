import Geolocation from '@react-native-community/geolocation';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../components/BackButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { useComponents } from '../hooks/useComponents';
import { useUploadPhotoMutation } from '../hooks/usePhotos';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { uploadToCloudinary } from '../services/cloudinaryUpload';
import { colors } from '../theme/colors';
import { fontSize, fontWeight, radius, spacing } from '../theme/designSystem';
import { compressImageForUpload } from '../utils/imageCompression';

type UploadPhotoRouteProp = RouteProp<RootStackParamList, 'UploadPhoto'>;
type UploadPhotoNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'UploadPhoto'
>;

export function UploadPhotoScreen() {
  const navigation = useNavigation<UploadPhotoNavigationProp>();
  const route = useRoute<UploadPhotoRouteProp>();
  const {
    workItemId,
    componentName,
    componentId,
    capturedPhotoPath,
    capturedAt,
    latitude,
    longitude,
  } = route.params;

  const [progress, setProgress] = useState('');
  const [deviceLocation, setDeviceLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [uploadStage, setUploadStage] = useState<
    'idle' | 'compressing' | 'uploading' | 'submitting'
  >('idle');
  const [cloudinaryProgress, setCloudinaryProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data: components } = useComponents(workItemId);
  const mutation = useUploadPhotoMutation(workItemId, componentId);

  const orderedComponents = [...(components ?? [])].sort((a, b) => {
    const orderA = a.component?.order_number ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.component?.order_number ?? Number.MAX_SAFE_INTEGER;

    return orderA - orderB;
  });
  const firstIncompleteComponent = orderedComponents.find(
    component => component.status !== 'APPROVED',
  );
  const isCurrentComponentAllowed =
    !firstIncompleteComponent || firstIncompleteComponent.id === componentId;

  useEffect(() => {
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      return;
    }

    if (typeof Geolocation.requestAuthorization === 'function') {
      Geolocation.requestAuthorization(
        () => {
          Geolocation.getCurrentPosition(
            position => {
              setDeviceLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            _error => {
              setLocationError('Unable to get device location.');
            },
            { enableHighAccuracy: true },
          );
        },
        () => {
          setLocationError('Location permission denied.');
        },
      );
    }
  }, [latitude, longitude]);

  const resolvedLatitude =
    typeof latitude === 'number' ? latitude : deviceLocation?.latitude;
  const resolvedLongitude =
    typeof longitude === 'number' ? longitude : deviceLocation?.longitude;
  const isBusy = mutation.isPending || uploadStage !== 'idle';

  const getLoadingLabel = () => {
    if (uploadStage === 'compressing') {
      return 'Compressing...';
    }

    if (uploadStage === 'uploading') {
      return `Uploading... ${cloudinaryProgress}%`;
    }

    if (uploadStage === 'submitting' || mutation.isPending) {
      return 'Submitting...';
    }

    return 'Submit Photo';
  };

  const navigateToCamera = () => {
    if (!isCurrentComponentAllowed) {
      Alert.alert(
        'Component Locked',
        'Please complete the previous component before adding progress here.',
      );
      return;
    }

    navigation.navigate('Camera', {
      workItemId,
      componentId,
      componentName,
    });
  };

  const handleSubmit = async () => {
    const progressValue = parseFloat(progress);

    if (!isCurrentComponentAllowed) {
      Alert.alert(
        'Component Locked',
        'Please complete the previous component before submitting this one.',
      );
      return;
    }

    if (!capturedPhotoPath) {
      Alert.alert('No Photo', 'Please capture a photo before submitting.');
      return;
    }

    if (isNaN(progressValue) || progressValue < 0) {
      Alert.alert('Invalid Progress', 'Please enter a valid progress value.');
      return;
    }

    try {
      setUploadError(null);
      setCloudinaryProgress(0);
      setUploadStage('compressing');

      const compressedImage = await compressImageForUpload(capturedPhotoPath);

      setUploadStage('uploading');
      const photoUrl = await uploadToCloudinary(
        {
          uri: compressedImage.uri,
          type: compressedImage.type,
          name: compressedImage.name,
        },
        {
          onProgress: progressPercent => {
            setCloudinaryProgress(progressPercent);
          },
        },
      );

      setUploadStage('submitting');
      mutation.mutate(
        {
          photoUrl,
          work_item_id: workItemId,
          component_id: componentId,
          progress: progressValue,
          latitude: resolvedLatitude ?? 0,
          longitude: resolvedLongitude ?? 0,
          timestamp: capturedAt ?? new Date().toISOString(),
        },
        {
          onError: () => {
            setUploadError(
              'Failed to submit photo metadata. Please try again.',
            );
            setUploadStage('idle');
          },
          onSuccess: () => {
            setUploadStage('idle');
          },
        },
      );
    } catch (error) {
      setUploadStage('idle');
      setUploadError(
        error instanceof Error
          ? error.message
          : 'Unable to process image upload. Please try again.',
      );
    }
  };

  if (mutation.isSuccess) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={[styles.scrollContent, styles.centeredContainer]}>
          <BackButton
            onPress={() => navigation.goBack()}
            testID="upload-back-button"
          />
          <View style={styles.card}>
            <Text style={styles.title} testID="upload-success-text">
              Photo Uploaded!
            </Text>
            <Text style={styles.caption}>
              Your photo has been submitted successfully.
            </Text>
            <PrimaryButton
              label="Done"
              onPress={() => navigation.goBack()}
              testID="upload-done-button"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={{ marginTop: spacing.sm, marginBottom: spacing.md }}>
          <BackButton
            onPress={() => navigation.goBack()}
            testID="upload-back-button"
          />
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Upload Photo</Text>
          <Text style={styles.subtitle}>{componentName}</Text>

          {capturedPhotoPath ? (
            <>
              <View style={styles.previewContainer}>
                <Image
                  source={{ uri: capturedPhotoPath }}
                  style={styles.previewImage}
                  resizeMode="cover"
                  testID="upload-photo-preview"
                />
              </View>
              <Text style={styles.caption} testID="upload-captured-photo-path">
                Photo ready: {capturedPhotoPath}
              </Text>
            </>
          ) : (
            <Pressable
              style={styles.uploadPlaceholder}
              onPress={navigateToCamera}
              testID="upload-photo-placeholder"
            >
              <Text style={styles.uploadPlaceholderTitle}>Capture Photo</Text>
              <Text style={styles.uploadPlaceholderHint}>
                Tap to open camera
              </Text>
            </Pressable>
          )}

          {typeof resolvedLatitude === 'number' &&
          typeof resolvedLongitude === 'number' ? (
            <Text style={styles.caption} testID="upload-photo-location-text">
              GPS: {resolvedLatitude.toFixed(4)}, {resolvedLongitude.toFixed(4)}
            </Text>
          ) : locationError ? (
            <Text
              style={styles.captionError}
              testID="upload-location-error-text"
            >
              {locationError}
            </Text>
          ) : (
            <Text style={styles.caption} testID="upload-location-loading-text">
              Getting location...
            </Text>
          )}

          {capturedAt ? (
            <Text style={styles.caption} testID="upload-photo-time-text">
              Captured: {new Date(capturedAt).toLocaleString()}
            </Text>
          ) : null}

          {!isCurrentComponentAllowed ? (
            <Text
              style={styles.sequenceWarning}
              testID="upload-sequence-warning"
            >
              This component is locked. Complete the previous component first.
            </Text>
          ) : null}

          <Text style={styles.label}>Progress Value</Text>
          <TextInput
            style={styles.input}
            value={progress}
            onChangeText={setProgress}
            placeholder="Enter completed progress"
            keyboardType="numeric"
            testID="upload-progress-input"
          />

          {isBusy ? (
            <View style={styles.loadingRow} testID="upload-loading-row">
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.caption} testID="upload-loading-text">
                {getLoadingLabel()}
              </Text>
            </View>
          ) : null}

          {uploadError || mutation.isError ? (
            <Text style={styles.errorText} testID="upload-error-text">
              {uploadError ?? 'Upload failed. Please try again.'}
            </Text>
          ) : null}

          <PrimaryButton
            label={getLoadingLabel()}
            onPress={handleSubmit}
            disabled={isBusy || !isCurrentComponentAllowed}
            testID="upload-submit-button"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondaryBackground,
  },
  scrollContent: {
    // padding: spacing.md,
  },
  card: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  caption: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  previewContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: spacing.sm,
    backgroundColor: colors.secondaryBackground,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  uploadPlaceholder: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.md,
    borderWidth: 2,
    borderStyle: 'dotted',
    borderColor: colors.inputBorder,
    backgroundColor: colors.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  uploadPlaceholderTitle: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xxs,
  },
  uploadPlaceholderHint: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  captionError: {
    fontSize: fontSize.sm,
    color: colors.danger,
    marginBottom: spacing.xxs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xxs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  sequenceWarning: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});
