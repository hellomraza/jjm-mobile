import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  RefreshControl,
  ScrollView,
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
import { BackButton } from '../components/BackButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { useComponents } from '../hooks/useComponents';
import { useLocationByTypeAndId } from '../hooks/useLocations';
import { useUserById } from '../hooks/useUser';
import { useWorkItem } from '../hooks/useWorkItems';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { fontSize, fontWeight, radius, spacing } from '../theme/designSystem';

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

function getStatIconStyle(label: string): StyleProp<ViewStyle> {
  switch (label) {
    case 'Completed':
      return styles.statIconCompleted;
    case 'Pending':
      return styles.statIconPending;
    default:
      return styles.statIconPrimary;
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

  const districtId = toNumericId(workItem?.district_id);
  const blockId = toNumericId(workItem?.block_id);
  const panchayatId = toNumericId(workItem?.panchayat_id);

  const {
    data: district,
    refetch: refetchDistrict,
    isRefetching: isRefetchingDistrict,
  } = useLocationByTypeAndId('districts', districtId);
  const {
    data: block,
    refetch: refetchBlock,
    isRefetching: isRefetchingBlock,
  } = useLocationByTypeAndId('blocks', blockId);
  const {
    data: panchayat,
    refetch: refetchPanchayat,
    isRefetching: isRefetchingPanchayat,
  } = useLocationByTypeAndId('panchayats', panchayatId);
  const {
    data: contractor,
    refetch: refetchContractor,
    isRefetching: isRefetchingContractor,
  } = useUserById(workItem?.contractor_id);

  const handleRefresh = () => {
    Promise.allSettled([
      refetchWorkItem(),
      refetchComponents(),
      refetchDistrict(),
      refetchBlock(),
      refetchPanchayat(),
      refetchContractor(),
    ]);
  };

  const isRefreshing =
    isRefetchingWorkItem ||
    isRefetchingComponents ||
    isRefetchingDistrict ||
    isRefetchingBlock ||
    isRefetchingPanchayat ||
    isRefetchingContractor;

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
    district?.districtname ??
    (workItem?.district_id ? String(workItem.district_id) : 'N/A');
  const blockDisplay =
    block?.blockname ??
    (workItem?.block_id ? String(workItem.block_id) : 'N/A');
  const panchayatDisplay =
    panchayat?.panchayatname ??
    (workItem?.panchayat_id ? String(workItem.panchayat_id) : 'N/A');
  const contractorDisplay =
    contractor?.name ?? workItem?.contractor_id ?? 'N/A';
  const progressFillStyle = getProgressFillStyle(workItem?.progress_percentage);
  const viewComponentsButtonStyle = getStickyButtonStyle(insets.bottom);

  if (isWorkItemLoading) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <BackButton
          onPress={() => navigation.goBack()}
          testID="work-item-details-back-button"
        />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isWorkItemError || !workItem) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <Text testID="work-item-details-error-text">
          Failed to load work details.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <BackButton
        onPress={() => navigation.goBack()}
        testID="work-item-details-back-button"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header Card with Title and Status */}
        <View style={styles.headerCard}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{workItem.title || title}</Text>
            <StatusBadge status={workItem.status} />
          </View>
          <Text style={styles.workCode}>{workItem.work_code}</Text>
        </View>

        {/* Work Progress Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Work Progress</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, progressFillStyle]} />
            </View>
            <Text style={styles.progressText}>
              {workItem.progress_percentage || 0}% Complete
            </Text>
          </View>
        </View>

        {/* Description Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            {workItem.description || 'No description available'}
          </Text>
        </View>

        {/* Location Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Location</Text>
          <DetailRow label="District" value={districtDisplay} />
          <DetailRow label="Block" value={blockDisplay} />
          <DetailRow label="Panchayat" value={panchayatDisplay} last />
        </View>

        {/* Contractor Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Contractor</Text>
          <DetailRow label="Name / ID" value={contractorDisplay} />
          {contractor?.email ? (
            <DetailRow label="Email" value={contractor.email} last />
          ) : (
            <View style={styles.detailRow} />
          )}
        </View>

        {/* Component Status Card */}
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
                  iconStyle={styles.statIconPrimary}
                />
                <StatCard
                  label="Completed"
                  value={completedCount}
                  iconStyle={styles.statIconCompleted}
                  testID="component-completed-count"
                />
                <StatCard
                  label="Pending"
                  value={pendingCount}
                  iconStyle={styles.statIconPending}
                  testID="component-pending-count"
                />
              </View>

              {Object.keys(componentStatusCounts).length > 0 && (
                <View style={styles.statusBreakdown}>
                  <Text style={styles.breakdownTitle}>Breakdown</Text>
                  {Object.entries(componentStatusCounts).map(
                    ([status, count]) => (
                      <DetailRow
                        key={status}
                        label={status}
                        value={String(count)}
                        last={
                          status ===
                          Object.keys(componentStatusCounts)[
                            Object.keys(componentStatusCounts).length - 1
                          ]
                        }
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
  testID,
  last = false,
}: {
  label: string;
  value: string;
  testID?: string;
  last?: boolean;
}) {
  return (
    <View
      style={[styles.detailRow, last && styles.detailRowLast]}
      testID={testID}
    >
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
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
  iconStyle,
  testID,
}: {
  label: string;
  value: number;
  iconStyle: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const resolvedIconStyle = iconStyle ?? getStatIconStyle(label);

  return (
    <View style={styles.statCard} testID={testID}>
      <View style={[styles.statIcon, resolvedIconStyle]} />
      <Text style={styles.statValue}>{value}</Text>
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
    backgroundColor: colors.secondaryBackground,
    paddingTop: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },

  /* Header Card */
  headerCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: spacing.md,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xl,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    flex: 1,
    marginRight: spacing.sm,
  },
  workCode: {
    fontSize: fontSize.xs,
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.xs,
  },

  /* Standard Card */
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: spacing.md,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },

  /* Section Title */
  sectionTitle: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },

  /* Progress Section */
  progressContainer: {
    gap: spacing.md,
  },
  progressTrack: {
    height: 7,
    backgroundColor: '#E2E7EC',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  progressText: {
    fontSize: fontSize.xs,
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
    textAlign: 'left',
  },

  /* Description */
  descriptionText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    lineHeight: 20,
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
  detailLabel: {
    fontSize: fontSize.sm,
    color: '#6B7280',
    fontWeight: fontWeight.medium,
    flex: 1,
    marginRight: spacing.sm,
  },
  detailValue: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
    textAlign: 'right',
  },

  /* Status Badge */
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  statusBadgeApproved: {
    backgroundColor: '#EAF8EE',
  },
  statusBadgePending: {
    backgroundColor: '#FFF7E6',
  },
  statusBadgeRejected: {
    backgroundColor: '#FDECEC',
  },
  statusBadgeDefault: {
    backgroundColor: '#EEF1F4',
  },
  statusBadgeTextApproved: {
    color: '#1E8E3E',
  },
  statusBadgeTextPending: {
    color: '#B27A00',
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
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    color: colors.primary,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xxs,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: '#6B7280',
    fontWeight: fontWeight.medium,
  },

  /* Status Breakdown */
  statusBreakdown: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: spacing.md,
  },
  breakdownTitle: {
    fontSize: fontSize.sm,
    color: '#6B7280',
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },

  /* Button Container - Sticky at Bottom */
  buttonContainer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },

  /* Utility Styles */
  bodyText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  viewComponentsButtonText: {
    fontSize: fontSize.md,
  },
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
