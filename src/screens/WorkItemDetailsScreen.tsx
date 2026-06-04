import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef } from 'react';
import {
  Animated,
  RefreshControl,
  ScrollView,
  StatusBar,
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BackButton } from '../components/BackButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { useComponents } from '../hooks/useComponents';
import { useWorkItem } from '../hooks/useWorkItems';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { fontSize, fontWeight, radius, spacing } from '../theme/designSystem';
import { perfectSize } from '../utils/perfectSize';

type WorkItemDetailsRouteProp = RouteProp<
  RootStackParamList,
  'WorkItemDetails'
>;
type WorkItemDetailsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'WorkItemDetails'
>;

type StatusBadgeVariant = 'approved' | 'pending' | 'rejected' | 'default';

function getProgressFillStyle(
  progressPercentage: number | undefined,
): StyleProp<ViewStyle> {
  const clampedProgress = Math.max(0, Math.min(100, progressPercentage ?? 0));

  return {
    width: `${clampedProgress}%`,
  };
}

function getStickyButtonStyle(insetBottom: number): StyleProp<ViewStyle> {
  const verticalPadding = insetBottom + spacing.md;

  return {
    marginTop: 0,
    paddingBottom: verticalPadding,
    paddingTop: spacing.md,
    borderRadius: 0,
  };
}

function getStatusVariant(status: string): StatusBadgeVariant {
  const normalizedStatus = status.toLowerCase().replaceAll('_', ' ');

  if (
    normalizedStatus.includes('completed') ||
    normalizedStatus.includes('approved')
  ) {
    return 'approved';
  }

  if (
    normalizedStatus.includes('pending') ||
    normalizedStatus.includes('in progress')
  ) {
    return 'pending';
  }

  if (
    normalizedStatus.includes('rejected') ||
    normalizedStatus.includes('failed')
  ) {
    return 'rejected';
  }

  return 'default';
}

function getStatusBadgeStyle(
  variant: StatusBadgeVariant,
): StyleProp<ViewStyle> {
  switch (variant) {
    case 'approved':
      return styles.statusBadgeApproved;
    case 'pending':
      return styles.statusBadgePending;
    case 'rejected':
      return styles.statusBadgeRejected;
    default:
      return styles.statusBadgeDefault;
  }
}

function getStatusTextStyle(variant: StatusBadgeVariant): StyleProp<TextStyle> {
  switch (variant) {
    case 'approved':
      return styles.statusBadgeTextApproved;
    case 'pending':
      return styles.statusBadgeTextPending;
    case 'rejected':
      return styles.statusBadgeTextRejected;
    default:
      return styles.statusBadgeTextDefault;
  }
}

function getStatusLabel(status: string): string {
  return status
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/^./, char => char.toUpperCase());
}

function getStatusColor(status: string) {
  const variant = getStatusVariant(status);
  switch (variant) {
    case 'approved':
      return '#10B981'; // green
    case 'pending':
      return '#3B82F6'; // blue for in progress
    case 'rejected':
      return colors.danger;
    default:
      return '#6B7280';
  }
}

function getStatusIcon(status: string) {
  const variant = getStatusVariant(status);
  switch (variant) {
    case 'approved':
      return 'check-circle-outline';
    case 'pending':
      return 'play-circle-outline';
    case 'rejected':
      return 'alert-circle-outline';
    default:
      return 'clock-outline';
  }
}

export function WorkItemDetailsScreen() {
  const navigation = useNavigation<WorkItemDetailsNavigationProp>();
  const insets = useSafeAreaInsets();
  const route = useRoute<WorkItemDetailsRouteProp>();
  const { workItemId, title } = route.params;

  const {
    data: workItem,
    isLoading: isWorkItemLoading,
    isError: isWorkItemError,
    refetch: refetchWorkItem,
    isRefetching: isRefetchingWorkItem,
  } = useWorkItem(workItemId);

  const {
    data: components,
    isLoading: isComponentsLoading,
    isError: isComponentsError,
    refetch: refetchComponents,
    isRefetching: isRefetchingComponents,
  } = useComponents(workItemId);

  const handleRefresh = () => {
    Promise.allSettled([
      refetchWorkItem(),
      refetchComponents(),
    ]);
  };

  const isRefreshing =
    isRefetchingWorkItem ||
    isRefetchingComponents

  const componentCount = components?.length ?? 0;
  const componentStatusCounts = (components ?? []).reduce<
    Record<string, number>
  >((acc, component) => {
    acc[component.status] = (acc[component.status] ?? 0) + 1;
    return acc;
  }, {});
  const completedCount = componentStatusCounts.APPROVED ?? 0;
  const pendingCount = componentCount - completedCount;

  const districtDisplay =
    workItem?.district?.districtname ??
    (workItem?.district_id ? String(workItem.district_id) : '---');
  const blockDisplay =
    workItem?.block?.blockname ??
    (workItem?.block_id ? String(workItem.block_id) : '---');
  const panchayatDisplay =
    workItem?.panchayat?.panchayatname ??
    (workItem?.panchayat_id ? String(workItem.panchayat_id) : '---');

  const villageToDisplay =
    workItem?.village?.villagename ??
    (workItem?.village_id ? String(workItem.village_id) : '---');

  const contractorDisplay =
    workItem?.contractor?.name || '---';
  const contractorEmailDisplay =
    workItem?.contractor?.email || '---';
  const progressPercent =
    componentCount > 0
      ? Math.round((completedCount / componentCount) * 100)
      : 0;
  const progressFillStyle = getProgressFillStyle(progressPercent);
  const viewComponentsButtonStyle = getStickyButtonStyle(insets.bottom);

  // Animated pulse opacity for skeleton loader
  const skeletonOpacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    let anim: Animated.CompositeAnimation | undefined;
    if (isWorkItemLoading) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonOpacity, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(skeletonOpacity, {
            toValue: 0.4,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      );
      anim.start();
    }
    return () => anim?.stop();
  }, [isWorkItemLoading, skeletonOpacity]);

  if (isWorkItemLoading) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.navBar}>
          <BackButton
            onPress={() => navigation.goBack()}
            testID="work-item-details-back-button"
          />
          <Text style={styles.navTitle}>Work Details</Text>
          <View style={styles.navPlaceholder} />
        </View>
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={{ opacity: skeletonOpacity }}
          testID="work-item-details-skeleton-list"
        >
          <View
            style={styles.headerCard}
            testID="work-item-details-skeleton-header"
          >
            <View style={styles.skeletonLineLarge} />
            <View style={styles.skeletonPill} />
            <View style={styles.skeletonLineSmall} />
          </View>

          <View style={styles.card}>
            <View style={styles.skeletonLineMedium} />
            <View style={styles.skeletonProgressTrack} />
            <View style={styles.skeletonLineSmall} />
          </View>

          <View style={styles.card}>
            <View style={styles.skeletonLineMedium} />
            <View style={styles.skeletonLineMedium} />
            <View style={styles.skeletonLineSmall} />
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    );
  }

  if (isWorkItemError || !workItem) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.navBar}>
          <BackButton
            onPress={() => navigation.goBack()}
            testID="work-item-details-back-button"
          />
          <Text style={styles.navTitle}>Work Details</Text>
          <View style={styles.navPlaceholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text testID="work-item-details-error-text" style={styles.errorText}>
            Failed to load work details.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const activeStatusColor = getStatusColor(workItem.status);
  const activeStatusIcon = getStatusIcon(workItem.status);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      {/* Centered Navigation Header Bar */}
      <View style={styles.navBar}>
        <BackButton
          onPress={() => navigation.goBack()}
          testID="work-item-details-back-button"
        />
        <Text style={styles.navTitle}>Work Details</Text>
        <View style={styles.navPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Hero Header Card with Title, Status, and Progress */}
        <View style={styles.headerCard}>
          <View style={styles.heroHeaderRow}>
            <View style={[styles.statusIconWrapper, { backgroundColor: activeStatusColor + '1A' }]}>
              <Icon name={activeStatusIcon} size={perfectSize(22)} color={activeStatusColor} />
            </View>
            <StatusBadge status={workItem.status} />
          </View>
          <Text style={styles.title}>{workItem.title || title}</Text>

          <View style={styles.sectionDivider} />

          <View style={styles.progressContainer}>
            <View style={styles.progressHeaderRow}>
              <Text style={styles.progressLabel}>Overall Completion</Text>
              <Text style={[styles.progressPercentText, { color: activeStatusColor }]}>
                {progressPercent}% Complete
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, progressFillStyle, { backgroundColor: activeStatusColor }]} />
            </View>
          </View>
        </View>

        {/* Unified Detail Card (Scheme Specifications, Location, Contractor) */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Scheme Specifications</Text>
          <DetailRow label="Scheme Type" value={workItem.schemetype || '---'} icon="water-outline" />
          <DetailRow label="No FHTC" value={workItem.nofhtc ? String(workItem.nofhtc) : '---'} icon="home-outline" last />

          <View style={styles.sectionDivider} />

          <Text style={styles.sectionTitle}>Location Details</Text>
          <DetailRow label="District" value={districtDisplay} icon="map-marker-outline" />
          <DetailRow label="Block" value={blockDisplay} icon="map-marker-radius-outline" />
          <DetailRow label="Panchayat" value={panchayatDisplay} icon="map-legend" />
          <DetailRow label="Village" value={villageToDisplay} icon="map-legend" last />

          <View style={styles.sectionDivider} />

          <Text style={styles.sectionTitle}>Contractor Profile</Text>
          <DetailRow label="Company Name" value={contractorDisplay} icon="briefcase-outline" />
          {contractorEmailDisplay ? (
            <DetailRow label="Email Address" value={contractorEmailDisplay} icon="email-outline" last />
          ) : null}
        </View>

        {/* Component Status Metrics */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Component Status</Text>
          {isComponentsLoading ? (
            <Text
              style={styles.bodyText}
              testID="component-status-loading-text"
            >
              Loading component status...
            </Text>
          ) : null}
          {isComponentsError ? (
            <Text style={styles.bodyText} testID="component-status-error-text">
              Failed to load component status.
            </Text>
          ) : null}
          {!isComponentsLoading && !isComponentsError ? (
            <>
              <View style={styles.statsContainer}>
                <StatCard
                  label="Total"
                  value={componentCount}
                  icon="file-document-outline"
                  color="#3B82F6"
                  bgColor="#DBEAFE"
                />
                <StatCard
                  label="Completed"
                  value={completedCount}
                  icon="check-circle-outline"
                  color="#10B981"
                  bgColor="#D1FAE5"
                  testID="component-completed-count"
                />
                <StatCard
                  label="Pending"
                  value={pendingCount}
                  icon="clock-outline"
                  color="#F59E0B"
                  bgColor="#FEF3C7"
                  testID="component-pending-count"
                />
              </View>

              {Object.keys(componentStatusCounts).length > 0 && (
                <View style={styles.statusBreakdown}>
                  <Text style={styles.breakdownTitle}>Status Breakdown</Text>
                  {Object.entries(componentStatusCounts).map(
                    ([status, count], index, array) => (
                      <DetailRow
                        key={status}
                        label={getStatusLabel(status)}
                        value={String(count)}
                        icon="chart-pie"
                        last={index === array.length - 1}
                      />
                    ),
                  )}
                </View>
              )}
            </>
          ) : null}
        </View>
      </ScrollView>

      {/* Action Button - Sticky at Bottom */}
      <View style={styles.buttonContainer}>
        <PrimaryButton
          label="View Components"
          onPress={() =>
            navigation.navigate('ComponentList', {
              workItemId,
              title: workItem.title || title,
              work_code: workItem.work_code,
            })
          }
          customStyles={viewComponentsButtonStyle}
          customTextStyles={styles.viewComponentsButtonText}
          testID="view-components-button"
        />
      </View>
    </SafeAreaView>
  );
}

function DetailRow({
  label,
  value,
  icon,
  testID,
  last = false,
}: {
  label: string;
  value: string;
  icon?: string;
  testID?: string;
  last?: boolean;
}) {
  return (
    <View
      style={[styles.detailRow, last && styles.detailRowLast]}
      testID={testID}
    >
      <View style={styles.detailLabelRow}>
        {icon ? (
          <Icon name={icon} size={perfectSize(16)} color="#9CA3AF" style={styles.detailIcon} />
        ) : null}
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text numberOfLines={2} style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusVariant = getStatusVariant(status);
  const statusBadgeStyle = getStatusBadgeStyle(statusVariant);
  const statusTextStyle = getStatusTextStyle(statusVariant);

  return (
    <View style={[styles.statusBadge, statusBadgeStyle]}>
      <Text style={[styles.statusBadgeText, statusTextStyle]}>
        {getStatusLabel(status)}
      </Text>
    </View>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  bgColor,
  testID,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
  bgColor: string;
  testID?: string;
}) {
  return (
    <View style={styles.statCard} testID={testID}>
      <View style={[styles.statIconWrapper, { backgroundColor: bgColor }]}>
        <Icon name={icon} size={perfectSize(18)} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function toNumericId(value: string | number | undefined) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === 'string') {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : undefined;
  }

  return undefined;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F3F4F6', // light grey matching dashboard background
  },
  navBar: {
    height: perfectSize(48),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: '#F3F4F6',
  },
  navBackButton: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  navTitle: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  navPlaceholder: {
    width: perfectSize(40), // matches back button hit space to center title
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },

  /* Hero Header Card */
  headerCard: {
    backgroundColor: colors.white,
    borderRadius: perfectSize(16),
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusIconWrapper: {
    width: perfectSize(36),
    height: perfectSize(36),
    borderRadius: perfectSize(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
    lineHeight: perfectSize(24),
    marginTop: spacing.xxs,
  },
  workCodeWrapper: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  workCodeLabel: {
    fontSize: perfectSize(9),
    color: '#9CA3AF',
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  workCode: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.bold,
    marginTop: 2,
  },

  /* Standard Card */
  card: {
    backgroundColor: colors.white,
    borderRadius: perfectSize(16),
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },

  /* Section Title */
  sectionTitle: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },
  subSectionTitle: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: spacing.md,
  },

  /* Progress Section */
  progressContainer: {
    gap: spacing.xs,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxs,
  },
  progressLabel: {
    fontSize: fontSize.xs,
    color: '#6B7280',
    fontWeight: fontWeight.medium,
  },
  progressPercentText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  progressTrack: {
    height: perfectSize(6),
    backgroundColor: '#E5E7EB',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
  },

  /* Description */
  descriptionText: {
    fontSize: fontSize.sm,
    color: '#4B5563',
    lineHeight: perfectSize(20),
  },

  /* Detail Row */
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    marginRight: spacing.xs,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    color: '#6B7280',
    fontWeight: fontWeight.medium,
  },
  detailValue: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
    textAlign: 'right',
    maxWidth: '65%',
  },

  /* Status Badge */
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: perfectSize(3),
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadgeText: {
    fontSize: perfectSize(11),
    fontWeight: fontWeight.bold,
  },
  statusBadgeApproved: {
    backgroundColor: '#D1FAE5',
  },
  statusBadgePending: {
    backgroundColor: '#DBEAFE', // unified blue for pending / in progress
  },
  statusBadgeRejected: {
    backgroundColor: '#FDECEC',
  },
  statusBadgeDefault: {
    backgroundColor: '#EEF1F4',
  },
  statusBadgeTextApproved: {
    color: '#10B981',
  },
  statusBadgeTextPending: {
    color: '#3B82F6',
  },
  statusBadgeTextRejected: {
    color: colors.danger,
  },
  statusBadgeTextDefault: {
    color: colors.textPrimary,
  },

  /* Stats Container */
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconWrapper: {
    width: perfectSize(32),
    height: perfectSize(32),
    borderRadius: perfectSize(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: spacing.sm,
  },
  statIconPrimary: {
    backgroundColor: colors.primary,
  },
  statIconCompleted: {
    backgroundColor: '#10B981',
  },
  statIconPending: {
    backgroundColor: '#F59E0B',
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: perfectSize(11),
    color: '#6B7280',
    fontWeight: fontWeight.medium,
  },

  /* Status Breakdown */
  statusBreakdown: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: spacing.md,
    marginTop: spacing.md,
  },
  breakdownTitle: {
    fontSize: fontSize.sm,
    color: '#6B7280',
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },

  /* Button Container - Sticky at Bottom */
  buttonContainer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  /* Utility Styles */
  bodyText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  viewComponentsButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.danger,
    fontWeight: fontWeight.semibold,
  },

  /* Skeleton Loading lines */
  skeletonLineLarge: {
    width: '75%',
    height: 18,
    borderRadius: radius.sm,
    backgroundColor: '#E7ECF1',
    marginBottom: spacing.sm,
  },
  skeletonLineMedium: {
    width: '55%',
    height: 14,
    borderRadius: radius.sm,
    backgroundColor: '#E7ECF1',
    marginBottom: spacing.sm,
  },
  skeletonLineSmall: {
    width: '40%',
    height: 12,
    borderRadius: radius.sm,
    backgroundColor: '#E7ECF1',
    marginBottom: spacing.xs,
  },
  skeletonPill: {
    width: '35%',
    height: 22,
    borderRadius: radius.sm,
    backgroundColor: '#E7ECF1',
    marginBottom: spacing.sm,
  },
  skeletonProgressTrack: {
    width: '100%',
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: '#E7ECF1',
    marginBottom: spacing.xs,
  },
});

export { getProgressFillStyle, getStatusVariant, getStickyButtonStyle };
