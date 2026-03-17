import {
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Upload Photo</Text>
        <Text style={styles.subtitle}>{componentName}</Text>
        <Text style={styles.caption}>Component ID: {componentId}</Text>
        {capturedPhotoPath ? (
          <Text style={styles.caption} testID="upload-captured-photo-path">
            Photo: {capturedPhotoPath}
          </Text>
        ) : (
          <Text style={styles.caption} testID="upload-no-photo-text">
            No photo captured yet.
          </Text>
        )}
        {typeof latitude === 'number' && typeof longitude === 'number' ? (
          <Text style={styles.caption} testID="upload-photo-location-text">
            GPS: {latitude}, {longitude}
          </Text>
        ) : null}
        {capturedAt ? (
          <Text style={styles.caption} testID="upload-photo-time-text">
            Captured at: {capturedAt}
          </Text>
        ) : null}

        <PrimaryButton
          label="Open Camera"
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondaryBackground,
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
    marginBottom: 4,
  },
  caption: {
    fontSize: 14,
    color: colors.textPrimary,
  },
});