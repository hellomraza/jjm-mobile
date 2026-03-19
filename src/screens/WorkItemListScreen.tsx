import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
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
  const {
    data: workItems,
    isLoading,
    isError,
    refetch: refetchWorkItems,
    isRefetching: isRefetchingWorkItems,
  } = useWorkItems();
  const {
    data: userProfile,
    refetch: refetchUserProfile,
    isRefetching: isRefetchingUserProfile,
  } = useUser();
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const employeeName = userProfile?.name || 'Employee Name';

  const handleRefresh = () => {
    void Promise.allSettled([refetchWorkItems(), refetchUserProfile()]);
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
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
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.employeeName} testID="work-items-employee-name">
            {employeeName}
          </Text>

          <View style={styles.menuWrapper}>
            <Pressable
              style={styles.menuButton}
              onPress={() => setIsMenuOpen(prev => !prev)}
              testID="work-items-menu-button"
              accessibilityRole="button"
              accessibilityLabel="Open menu"
            >
              <Text style={styles.menuButtonText}>•</Text>
              <Text style={styles.menuButtonText}>•</Text>
              <Text style={styles.menuButtonText}>•</Text>
            </Pressable>

            {isMenuOpen ? (
              <View
                style={styles.menuDropdown}
                testID="work-items-menu-dropdown"
              >
                <Pressable
                  style={styles.menuItem}
                  onPress={handleLogout}
                  testID="work-items-logout-button"
                >
                  <Text style={styles.menuItemText}>Logout</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
        <Text style={styles.title}>Work Items</Text>
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
          onRefresh={handleRefresh}
          refreshing={isRefetchingWorkItems || isRefetchingUserProfile}
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
  employeeName: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
  },
  menuWrapper: {
    position: 'relative',
  },
  menuButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  menuButtonText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    lineHeight: spacing.xs,
  },
  menuDropdown: {
    position: 'absolute',
    top: spacing.xl,
    right: 0,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radius.sm,
    minWidth: 120,
    zIndex: 10,
  },
  menuItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  menuItemText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: fontSize.xl,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
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
});
