import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { WorkItemStatus } from '../api/responseTypes';
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

  const skeletonItems = Array.from({ length: 6 }, (_, index) => index);

  const handleRefresh = () => {
    Promise.allSettled([refetchWorkItems(), refetchUserProfile()]).then(
      () => undefined,
    );
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
    navigation.replace('Login');
  };

  const getStatusStyles = (status: WorkItemStatus) => {
    if (status === 'COMPLETED') {
      return {
        label: 'Completed',
        textColor: '#1E8E3E',
        bgColor: '#EAF8EE',
      };
    }

    if (status === 'IN_PROGRESS') {
      return {
        label: 'In Progress',
        textColor: '#B27A00',
        bgColor: '#FFF7E6',
      };
    }

    return {
      label: 'Pending',
      textColor: colors.textPrimary,
      bgColor: '#EEF1F4',
    };
  };

  const getContractorName = (
    item: NonNullable<typeof workItems>[number],
  ): string => {
    const enrichedContractorName = item.contractor?.name;

    if (enrichedContractorName) {
      return enrichedContractorName;
    }

    return item.contractor_id || 'N/A';
  };

  const renderItem = ({
    item,
  }: {
    item: NonNullable<typeof workItems>[number];
  }) => {
    const safeProgress = Math.max(
      0,
      Math.min(100, item.progress_percentage ?? 0),
    );
    const statusStyles = getStatusStyles(item.status);

    return (
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
        <Text numberOfLines={2} style={styles.itemTitle}>
          {item.title}
        </Text>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusStyles.bgColor },
          ]}
        >
          <Text
            style={[styles.statusBadgeText, { color: statusStyles.textColor }]}
          >
            {statusStyles.label}
          </Text>
        </View>

        <Text style={styles.itemLabel}>Overall Progress</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${safeProgress}%` }]} />
        </View>
        <Text style={styles.progressText}>{safeProgress}%</Text>

        <Text style={styles.itemMeta}>
          Contractor: {getContractorName(item)}
        </Text>
      </Pressable>
    );
  };

  const renderSkeleton = ({ item }: { item: number }) => (
    <View style={styles.skeletonCard} testID={`work-item-skeleton-${item}`}>
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonBadge} />
      <View style={styles.skeletonProgressLine} />
      <View style={styles.skeletonProgressLineShort} />
      <View style={styles.skeletonMeta} />
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {isMenuOpen ? (
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setIsMenuOpen(false)}
          testID="work-items-menu-backdrop"
        />
      ) : null}

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
        <FlatList
          data={skeletonItems}
          keyExtractor={item => String(item)}
          renderItem={renderSkeleton}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.listContent}
          testID="work-items-skeleton-list"
        />
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
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          onRefresh={handleRefresh}
          refreshing={isRefetchingWorkItems || isRefetchingUserProfile}
          contentContainerStyle={styles.listContent}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
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
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  headerContainer: {
    marginBottom: spacing.sm,
    zIndex: 12,
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
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
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
  gridRow: {
    gap: spacing.sm,
  },
  itemTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    minHeight: 38,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  statusBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  itemLabel: {
    fontSize: fontSize.xs,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  progressTrack: {
    width: '100%',
    height: 7,
    backgroundColor: '#E2E7EC',
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    marginTop: spacing.xxs,
    marginBottom: spacing.xs,
    fontSize: fontSize.xs,
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
  },
  itemMeta: {
    fontSize: fontSize.xs,
    color: colors.textPrimary,
  },
  skeletonCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E7ECF1',
  },
  skeletonTitle: {
    height: 16,
    borderRadius: radius.sm,
    backgroundColor: '#E7ECF1',
    marginBottom: spacing.sm,
  },
  skeletonBadge: {
    width: '45%',
    height: 18,
    borderRadius: radius.sm,
    backgroundColor: '#E7ECF1',
    marginBottom: spacing.sm,
  },
  skeletonProgressLine: {
    width: '100%',
    height: 8,
    borderRadius: radius.sm,
    backgroundColor: '#E7ECF1',
    marginBottom: spacing.xs,
  },
  skeletonProgressLineShort: {
    width: '40%',
    height: 8,
    borderRadius: radius.sm,
    backgroundColor: '#E7ECF1',
    marginBottom: spacing.sm,
  },
  skeletonMeta: {
    width: '70%',
    height: 12,
    borderRadius: radius.sm,
    backgroundColor: '#E7ECF1',
  },
});
