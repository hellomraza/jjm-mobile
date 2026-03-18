import Geolocation from '@react-native-community/geolocation';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { useUploadPhotoMutation } from '../hooks/usePhotos';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { fontSize, fontWeight, radius, spacing } from '../theme/designSystem';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  const mutation = useUploadPhotoMutation(workItemId, componentId);

  useEffect(() => {
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      return;
    }

    if (typeof Geolocation.requestAuthorization === 'function') {
      Geolocation.requestAuthorization(() => undefined);
    }

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
  }, [latitude, longitude]);

  const resolvedLatitude =
    typeof latitude === 'number' ? latitude : deviceLocation?.latitude;
  const resolvedLongitude =
    typeof longitude === 'number' ? longitude : deviceLocation?.longitude;

  const handleSubmit = () => {
    const progressValue = parseFloat(progress);

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Upload Photo</Text>
          <Text style={styles.subtitle}>{componentName}</Text>

          {capturedPhotoPath ? (
            <Text style={styles.caption} testID="upload-captured-photo-path">
              Photo ready: {capturedPhotoPath}
            </Text>
          ) : (
            <Text style={styles.caption} testID="upload-no-photo-text">
              No photo captured yet.
            </Text>
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
            disabled={mutation.isPending}
            testID="upload-submit-button"
          />

          <PrimaryButton
            label="Capture Photo"
            onPress={() =>
              navigation.navigate('Camera', {
                workItemId,
                componentId,
                componentName,
              })
            }
            testID="upload-open-camera-button"
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
    padding: spacing.md,
  },
  card: {
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
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});
