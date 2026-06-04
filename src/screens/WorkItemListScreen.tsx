import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { WorkItemStatus } from '../api/responseTypes';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { useWorkItems } from '../hooks/useWorkItems';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { fontSize, fontWeight, radius, spacing } from '../theme/designSystem';
import { perfectSize } from '../utils/perfectSize';

type WorkItemListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'WorkItemList'
>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type WorkItem = NonNullable<ReturnType<typeof useWorkItems>['data']>[number];

type WorkItemCardProps = {
  item: WorkItem;
  onPress: () => void;
  getStatusStyles: (status: WorkItemStatus) => {
    label: string;
    textColor: string;
    bgColor: string;
    icon: string;
  };
  getContractorName: (item: WorkItem) => string;
  triggerHaptic: (type: 'light' | 'medium') => void;
};

function WorkItemCard({
  item,
  onPress,
  getStatusStyles,
  getContractorName,
  triggerHaptic,
}: WorkItemCardProps) {
  const animatedScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
  };

  const safeProgress = Math.max(
    0,
    Math.min(100, item.progress_percentage ?? 0),
  );
  const statusStyles = getStatusStyles(item.status);

  return (
    <AnimatedPressable
      style={[styles.card, { transform: [{ scale: animatedScale }] }]}
      testID={`work-item-card-${item.id}`}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => {
        triggerHaptic('light');
        onPress();
      }}
    >
      {/* Top Section: Status Icon (Top-Left) & Status Badge (Top-Right) */}
      <View style={styles.headerRow}>
          <Icon name={statusStyles.icon} size={perfectSize(16)} color={statusStyles.textColor} />
        <View style={[styles.statusBadge, { backgroundColor: statusStyles.bgColor }]}>
          <Text style={[styles.statusBadgeText, { color: statusStyles.textColor }]}>
            {statusStyles.label}
          </Text>
        </View>
      </View>

      {/* Primary Info: Work Code (bold & prominent) */}
      <Text numberOfLines={1} style={styles.workCode}>
        {item.work_code || 'N/A'}
      </Text>

      {/* Contractor row with building icon */}
      <View style={styles.contractorRow}>
        <Icon
          name="office-building-marker-outline"
          size={perfectSize(14)}
          color="#6B7280"
          style={styles.contractorIcon}
        />
        <Text numberOfLines={1} style={styles.contractorText}>
          {getContractorName(item)}
        </Text>
      </View>

      {/* Bottom Section: Progress percent and bar matching status color */}
      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressPercent}>{safeProgress}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${safeProgress}%`,
                backgroundColor: statusStyles.textColor,
              },
            ]}
          />
        </View>
      </View>
    </AnimatedPressable>
  );
}

function SkeletonCard({ item }: { item: number }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.skeletonCard, { opacity }]}
      testID={`work-item-skeleton-${item}`}
    >
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonBadge} />
      <View style={styles.skeletonProgressLine} />
      <View style={styles.skeletonProgressLineShort} />
      <View style={styles.skeletonMeta} />
    </Animated.View>
  );
}

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

  const triggerHaptic = (type: 'light' | 'medium') => {
    try {
      if (Platform.OS === 'android') {
        if (type === 'light') {
          Vibration.vibrate(10);
        } else if (type === 'medium') {
          Vibration.vibrate(20);
        }
      } else {
        if (type === 'medium') {
          Vibration.vibrate();
        }
      }
    } catch (e) {
      // Catch silently
    }
  };

  const handleRefresh = () => {
    triggerHaptic('light');
    Promise.allSettled([refetchWorkItems(), refetchUserProfile()]).then(
      () => undefined,
    );
  };

  const handleLogout = async () => {
    triggerHaptic('medium');
    setIsMenuOpen(false);
    await logout();
    navigation.replace('Login');
  };

  const getStatusStyles = (status: WorkItemStatus) => {
    if (status === 'COMPLETED') {
      return {
        label: 'Completed',
        textColor: '#10B981',
        bgColor: '#D1FAE5',
        icon: 'check-circle-outline',
      };
    }

    if (status === 'IN_PROGRESS') {
      return {
        label: 'In Progress',
        textColor: '#3B82F6',
        bgColor: '#DBEAFE',
        icon: 'play-circle-outline',
      };
    }

    return {
      label: 'Pending',
      textColor: '#F59E0B',
      bgColor: '#FEF3C7',
      icon: 'clock-outline',
    };
  };

  const getContractorName = (item: WorkItem): string => {
    const enrichedContractorName = item.contractor?.name;

    if (enrichedContractorName) {
      return enrichedContractorName;
    }

    return item.contractor_id || 'N/A';
  };

  const renderItem = ({ item }: { item: WorkItem }) => (
    <WorkItemCard
      item={item}
      onPress={() =>
        navigation.navigate('WorkItemDetails', {
          workItemId: item.id,
          title: item.title,
        })
      }
      getStatusStyles={getStatusStyles}
      getContractorName={getContractorName}
      triggerHaptic={triggerHaptic}
    />
  );

  const renderSkeleton = ({ item }: { item: number }) => (
    <SkeletonCard item={item} />
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      {isMenuOpen ? (
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => {
            triggerHaptic('light');
            setIsMenuOpen(false);
          }}
          testID="work-items-menu-backdrop"
        />
      ) : null}

      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <View style={styles.userSection}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.employeeName} testID="work-items-employee-name">
              {employeeName}
            </Text>
          </View>

          <View style={styles.menuWrapper}>
            <Pressable
              style={styles.menuButton}
              onPress={() => {
                triggerHaptic('medium');
                setIsMenuOpen(prev => !prev);
              }}
              testID="work-items-menu-button"
              accessibilityRole="button"
              accessibilityLabel="Open menu"
            >
              <Icon name="account-circle" size={perfectSize(36)} color={colors.primary} />
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
                  <Icon
                    name="logout"
                    size={perfectSize(18)}
                    color={colors.danger}
                    style={styles.menuIcon}
                  />
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
        <Text testID="work-items-error-text" style={styles.errorText}>
          Failed to load work items.
        </Text>
      ) : null}

      {!isLoading && !isError && (workItems?.length ?? 0) === 0 ? (
        <View style={styles.emptyContainer} testID="work-items-empty-container">
          <Icon name="clipboard-text-outline" size={perfectSize(64)} color="#9CA3AF" />
          <Text testID="work-items-empty-text" style={styles.emptyText}>
            No work items found. Please contact your contractor to assign work.
          </Text>
        </View>
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
    backgroundColor: '#F3F4F6', // Sleek soft grey
    paddingHorizontal: spacing.md,
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  headerContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    zIndex: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  userSection: {
    flexDirection: 'column',
  },
  welcomeText: {
    fontSize: fontSize.xs,
    color: '#6B7280',
    fontWeight: fontWeight.medium,
    marginBottom: 2,
  },
  employeeName: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
  },
  menuWrapper: {
    position: 'relative',
  },
  menuButton: {
    padding: spacing.xxs,
    borderRadius: radius.pill,
  },
  menuDropdown: {
    position: 'absolute',
    top: perfectSize(42),
    right: 0,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    minWidth: perfectSize(140),
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  menuIcon: {
    marginRight: spacing.xs,
  },
  menuItemText: {
    color: colors.danger,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  title: {
    fontSize: fontSize.xxl,
    color: colors.primary,
    fontWeight: fontWeight.bold,
    marginTop: spacing.xxs,
  },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: perfectSize(16),
    padding: spacing.sm,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconWrapper: {
    width: perfectSize(20),
    height: perfectSize(20),
    borderRadius: perfectSize(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: perfectSize(8),
    paddingVertical: perfectSize(3),
    borderRadius: radius.pill,
  },
  statusBadgeText: {
    fontSize: perfectSize(10),
    fontWeight: fontWeight.bold,
  },
  workCode: {
    fontSize: perfectSize(15),
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
    letterSpacing: 0.2,
  },
  contractorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  contractorIcon: {
    marginRight: 4,
  },
  contractorText: {
    fontSize: perfectSize(11),
    color: '#6B7280',
    fontWeight: fontWeight.medium,
    flex: 1,
  },
  progressSection: {
    width: '100%',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxs,
  },
  progressLabel: {
    fontSize: perfectSize(10),
    color: '#6B7280',
    fontWeight: fontWeight.medium,
  },
  progressPercent: {
    fontSize: perfectSize(10),
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
  },
  progressTrack: {
    width: '100%',
    height: perfectSize(5),
    backgroundColor: '#F3F4F6',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  gridRow: {
    gap: spacing.sm,
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
    height: perfectSize(16),
    borderRadius: radius.sm,
    backgroundColor: '#E7ECF1',
    marginBottom: spacing.sm,
  },
  skeletonBadge: {
    width: '50%',
    height: perfectSize(18),
    borderRadius: radius.pill,
    backgroundColor: '#E7ECF1',
    marginBottom: spacing.lg,
  },
  skeletonProgressLine: {
    width: '100%',
    height: perfectSize(8),
    borderRadius: radius.pill,
    backgroundColor: '#E7ECF1',
    marginBottom: spacing.xs,
  },
  skeletonProgressLineShort: {
    width: '30%',
    height: perfectSize(8),
    borderRadius: radius.pill,
    backgroundColor: '#E7ECF1',
    marginBottom: spacing.md,
  },
  skeletonMeta: {
    width: '70%',
    height: perfectSize(12),
    borderRadius: radius.sm,
    backgroundColor: '#E7ECF1',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: '#6B7280',
    fontWeight: fontWeight.medium,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: perfectSize(18),
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.danger,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
});
