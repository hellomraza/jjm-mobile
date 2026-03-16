import { RouteProp, useRoute } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';

type UploadPhotoRouteProp = RouteProp<RootStackParamList, 'UploadPhoto'>;

export function UploadPhotoScreen() {
  const route = useRoute<UploadPhotoRouteProp>();
  const { componentName, componentId } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Upload Photo</Text>
        <Text style={styles.subtitle}>{componentName}</Text>
        <Text style={styles.caption}>Component ID: {componentId}</Text>
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