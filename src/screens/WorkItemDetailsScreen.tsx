import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';

type WorkItemDetailsRouteProp = RouteProp<RootStackParamList, 'WorkItemDetails'>;
type WorkItemDetailsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'WorkItemDetails'
>;

export function WorkItemDetailsScreen() {
  const navigation = useNavigation<WorkItemDetailsNavigationProp>();
  const route = useRoute<WorkItemDetailsRouteProp>();
  const { workItemId, title } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Work Item ID: {workItemId}</Text>
        <PrimaryButton
          label="View Components"
          onPress={() =>
            navigation.navigate('ComponentList', {
              workItemId,
              title,
            })
          }
          testID="view-components-button"
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
  },
});
