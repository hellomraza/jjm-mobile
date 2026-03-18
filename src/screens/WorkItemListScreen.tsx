import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useWorkItems } from '../hooks/useWorkItems';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { fontSize, fontWeight, radius, spacing } from '../theme/designSystem';

type WorkItemListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'WorkItemList'
>;

export function WorkItemListScreen() {
  const navigation = useNavigation<WorkItemListNavigationProp>();
  const { data: workItems, isLoading, isError } = useWorkItems();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  const renderItem = ({
    item,
  }: {
    item: NonNullable<typeof workItems>[number];
  }) => (
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
        <View style={styles.headerRow}>
          <Text style={styles.title}>Work Items</Text>
          <Pressable
            style={styles.logoutButton}
            onPress={handleLogout}
            testID="work-items-logout-button"
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </Pressable>
        </View>
        <Text style={styles.subtitle}>Select a work item to view details.</Text>
      </View>

      {isLoading ? (
        <Text testID="work-items-loading-text">Loading work items...</Text>
      ) : null}
      {isError ? (
        <Text testID="work-items-error-text">Failed to load work items.</Text>
      ) : null}

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
    padding: spacing.md,
  },
  headerContainer: {
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: spacing.md,
    marginBottom: spacing.xs,
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
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  itemTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  itemMeta: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  logoutButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  logoutButtonText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
