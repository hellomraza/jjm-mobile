import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';

type WorkItemListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'WorkItemList'
>;

type WorkItemListItem = {
  id: string;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
};

const demoWorkItems: WorkItemListItem[] = [
  { id: 'work-item-1', title: 'Install Pipeline — Block A', status: 'IN_PROGRESS' },
  { id: 'work-item-2', title: 'Inspect Pump Station — Zone B', status: 'PENDING' },
  { id: 'work-item-3', title: 'Valve Testing — Cluster C', status: 'COMPLETED' },
];

export function WorkItemListScreen() {
  const navigation = useNavigation<WorkItemListNavigationProp>();

  const renderItem = ({ item }: { item: WorkItemListItem }) => (
    <Pressable
      style={styles.card}
      testID={`work-item-card-${item.id}`}
      onPress={() =>
        navigation.navigate('WorkItemDetails', {
          workItemId: item.id,
          title: item.title,
        })
      }
    >
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemMeta}>Status: {item.status}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Work Items</Text>
        <Text style={styles.subtitle}>Select a work item to view details.</Text>
      </View>

      <FlatList
        data={demoWorkItems}
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
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: 16,
    marginBottom: 10,
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
  listContent: {
    paddingBottom: 20,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 14,
    color: colors.textPrimary,
  },
});
