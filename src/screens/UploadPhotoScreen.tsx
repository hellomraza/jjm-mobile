import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Geolocation from '@react-native-community/geolocation';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
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
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  }, [latitude, longitude]);

  const resolvedLatitude = typeof latitude === 'number' ? latitude : deviceLocation?.latitude;
  const resolvedLongitude = typeof longitude === 'number' ? longitude : deviceLocation?.longitude;

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
      <SafeAreaView style={styles.container}>
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
    <SafeAreaView style={styles.container}>
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
            <Text style={styles.captionError} testID="upload-location-error-text">
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
    padding: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: 16,
  },
  title: {
    fontSize: 22,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  caption: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  captionError: {
    fontSize: 14,
    color: colors.danger,
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: 8,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});