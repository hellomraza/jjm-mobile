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
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';

type ComponentListRouteProp = RouteProp<RootStackParamList, 'ComponentList'>;
type ComponentListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ComponentList'
>;

type ComponentListItem = {
  id: string;
  name: string;
  progress: number;
  quantity?: number;
  status: string;
};

const previewComponents: ComponentListItem[] = [
  {
    id: 'component-preview-1',
    name: 'Pumping Mains',
    progress: 120,
    quantity: 300,
    status: 'PENDING',
  },
  {
    id: 'component-preview-2',
    name: 'Overhead Tank',
    progress: 1,
    quantity: 1,
    status: 'APPROVED',
  },
  {
    id: 'component-preview-3',
    name: 'Distribution Pipeline',
    progress: 45,
    quantity: 150,
    status: 'IN_PROGRESS',
  },
];

function formatProgress(item: ComponentListItem) {
  if (typeof item.quantity === 'number') {
    return `${item.progress} / ${item.quantity}`;
  }

  return `${item.progress}`;
}

export function ComponentListScreen() {
  const navigation = useNavigation<ComponentListNavigationProp>();
  const route = useRoute<ComponentListRouteProp>();
  const { workItemId, title } = route.params;

  const renderItem = ({ item }: { item: ComponentListItem }) => (
    <Pressable
      style={styles.row}
      testID={`component-row-${item.id}`}
      onPress={() =>
        navigation.navigate('UploadPhoto', {
          workItemId,
          componentId: item.id,
          componentName: item.name,
        })
      }
    >
      <View style={styles.rowHeader}>
        <Text style={styles.componentName}>{item.name}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
      <Text style={styles.meta}>Progress: {formatProgress(item)}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Components</Text>
        <Text style={styles.subtitle}>{title}</Text>
        <Text style={styles.caption}>Work Item ID: {workItemId}</Text>
      </View>

      <FlatList
        data={previewComponents}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
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