import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
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

          {typeof latitude === 'number' && typeof longitude === 'number' ? (
            <Text style={styles.caption} testID="upload-photo-location-text">
              GPS: {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </Text>
          ) : null}

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

          <PrimaryButton
            label="Submit Photo"
            onPress={() => {}}
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
});