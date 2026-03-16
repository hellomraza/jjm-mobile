import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useWorkItems } from '../hooks/useWorkItems';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';

type WorkItemListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'WorkItemList'
>;

export function WorkItemListScreen() {
  const navigation = useNavigation<WorkItemListNavigationProp>();
  const { data: workItems, isLoading, isError } = useWorkItems();

  const renderItem = ({ item }: { item: NonNullable<typeof workItems>[number] }) => (
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

      {isLoading ? <Text testID="work-items-loading-text">Loading work items...</Text> : null}
      {isError ? <Text testID="work-items-error-text">Failed to load work items.</Text> : null}

      {!isLoading && !isError && (workItems?.length ?? 0) === 0 ? (
        <Text testID="work-items-empty-text">No work items found.</Text>
      ) : null}

      {!isLoading && !isError ? (
        <FlatList
          data={workItems ?? []}
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
