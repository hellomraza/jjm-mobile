import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export function WorkItemDetailsScreen() {
  const navigation = useNavigation<WorkItemDetailsNavigationProp>();
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

  if (isWorkItemLoading) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <Text testID="work-item-details-loading-text">
          Loading work details...
        </Text>
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
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(
                      workItem.progress_percentage || 0,
                      100,
                    )}%`,
                  },
                ]}
              />
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
                  color={colors.primary}
                />
                <StatCard
                  label="Completed"
                  value={completedCount}
                  color="#10B981"
                  testID="component-completed-count"
                />
                <StatCard
                  label="Pending"
                  value={pendingCount}
                  color="#F59E0B"
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

        {/* Action Button */}
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
            testID="view-components-button"
          />
        </View>
      </ScrollView>
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
  let badgeColor = '#6B7280'; // default gray
  let textColor = '#FFFFFF';

  if (
    status.toLowerCase().includes('completed') ||
    status.toLowerCase().includes('approved')
  ) {
    badgeColor = '#10B981'; // green
  } else if (
    status.toLowerCase().includes('pending') ||
    status.toLowerCase().includes('in progress')
  ) {
    badgeColor = '#F59E0B'; // amber
  } else if (
    status.toLowerCase().includes('rejected') ||
    status.toLowerCase().includes('failed')
  ) {
    badgeColor = '#EF4444'; // red
  }

  return (
    <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
      <Text style={[styles.statusBadgeText, { color: textColor }]}>
        {status}
      </Text>
    </View>
  );
}

function StatCard({
  label,
  value,
  color,
  testID,
}: {
  label: string;
  value: number;
  color: string;
  testID?: string;
}) {
  return (
    <View style={styles.statCard} testID={testID}>
      <View style={[styles.statIcon, { backgroundColor: color }]} />
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
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },

  /* Header Card */
  headerCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxxl,
    color: colors.primary,
    fontWeight: fontWeight.bold,
    flex: 1,
    marginRight: spacing.md,
  },
  workCode: {
    fontSize: fontSize.xs,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },

  /* Standard Card */
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  /* Section Title */
  sectionTitle: {
    fontSize: fontSize.lg,
    color: colors.primary,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },

  /* Progress Section */
  progressContainer: {
    gap: spacing.md,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  progressText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
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
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.3,
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

  /* Button Container */
  buttonContainer: {
    marginBottom: spacing.lg,
  },

  /* Utility Styles */
  bodyText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
});
