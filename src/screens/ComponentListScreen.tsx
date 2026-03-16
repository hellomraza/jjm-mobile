import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useComponents } from '../hooks/useComponents';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';

type ComponentListRouteProp = RouteProp<RootStackParamList, 'ComponentList'>;
type ComponentListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ComponentList'
>;

function formatProgress(progress: number, quantity?: number) {
  if (typeof quantity === 'number') {
    return `${progress} / ${quantity}`;
  }

  return `${progress}`;
}

export function ComponentListScreen() {
  const navigation = useNavigation<ComponentListNavigationProp>();
  const route = useRoute<ComponentListRouteProp>();
  const { workItemId, title } = route.params;
  const { data: components, isLoading, isError } = useComponents(workItemId);

  const renderItem = ({ item }: { item: NonNullable<typeof components>[number] }) => (
    <Pressable
      style={styles.row}
      testID={`component-row-${item.id}`}
      onPress={() =>
        navigation.navigate('UploadPhoto', {
          workItemId,
          componentId: item.id,
          componentName: item.component?.name ?? 'Component',
        })
      }
    >
      <View style={styles.rowHeader}>
        <Text style={styles.componentName}>
          {item.component?.name ?? 'Unnamed Component'}
        </Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
      <Text style={styles.meta}>
        Progress: {formatProgress(item.progress, item.quantity)}
      </Text>
      {typeof item.quantity === 'number' ? (
        <Text style={styles.meta}>Quantity: {item.quantity}</Text>
      ) : null}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Components</Text>
        <Text style={styles.subtitle}>{title}</Text>
        <Text style={styles.caption}>Work Item ID: {workItemId}</Text>
      </View>

      {isLoading ? <Text testID="components-loading-text">Loading components...</Text> : null}
      {isError ? <Text testID="components-error-text">Failed to load components.</Text> : null}
      {!isLoading && !isError && (components?.length ?? 0) === 0 ? (
        <Text testID="components-empty-text">No components found.</Text>
      ) : null}

      {!isLoading && !isError ? (
        <FlatList
          data={components ?? []}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondaryBackground,
    padding: 16,
  },
  headerContainer: {
    marginBottom: 12,
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
  listContent: {
    paddingBottom: 20,
  },
  row: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: 16,
    marginBottom: 10,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  componentName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: 8,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  meta: {
    fontSize: 14,
    color: colors.textPrimary,
  },
});