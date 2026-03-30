import Geolocation from '@react-native-community/geolocation';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
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
import { colors } from '../theme/colors';
import { fontSize, fontWeight, radius, spacing } from '../theme/designSystem';

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

  const handleSubmit = () => {
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

    const formData = new FormData();
    formData.append('file', {
      uri: capturedPhotoPath,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as unknown as Blob);
    formData.append('progress', String(progressValue));
    formData.append('latitude', String(resolvedLatitude ?? 0));
    formData.append('longitude', String(resolvedLongitude ?? 0));
    formData.append('timestamp', capturedAt ?? new Date().toISOString());

    mutation.mutate(formData as unknown as Record<string, unknown>);
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

          {mutation.isError ? (
            <Text style={styles.errorText} testID="upload-error-text">
              Upload failed. Please try again.
            </Text>
          ) : null}

          <PrimaryButton
            label={mutation.isPending ? 'Uploading...' : 'Submit Photo'}
            onPress={handleSubmit}
            disabled={mutation.isPending || !isCurrentComponentAllowed}
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
