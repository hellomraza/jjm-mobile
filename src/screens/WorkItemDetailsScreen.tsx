import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  } = useWorkItem(workItemId);
  const {
    data: components,
    isLoading: isComponentsLoading,
    isError: isComponentsError,
  } = useComponents(workItemId);

  const districtId = toNumericId(workItem?.district_id);
  const blockId = toNumericId(workItem?.block_id);
  const panchayatId = toNumericId(workItem?.panchayat_id);

  const { data: district } = useLocationByTypeAndId('districts', districtId);
  const { data: block } = useLocationByTypeAndId('blocks', blockId);
  const { data: panchayat } = useLocationByTypeAndId('panchayats', panchayatId);
  const { data: contractor } = useUserById(workItem?.contractor_id);

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
      <SafeAreaView style={styles.container}>
        <Text testID="work-item-details-loading-text">
          Loading work details...
        </Text>
      </SafeAreaView>
    );
  }

  if (isWorkItemError || !workItem) {
    return (
      <SafeAreaView style={styles.container}>
        <Text testID="work-item-details-error-text">
          Failed to load work details.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>{workItem.title || title}</Text>
          <Text style={styles.subtitle}>Code: {workItem.work_code}</Text>
          <Text style={styles.caption}>Work Item ID: {workItemId}</Text>

          <SectionTitle label="Description" />
          <Text style={styles.bodyText}>{workItem.description || 'N/A'}</Text>

          <SectionTitle label="Location" />
          <DetailRow label="District" value={districtDisplay} />
          <DetailRow label="Block" value={blockDisplay} />
          <DetailRow label="Panchayat" value={panchayatDisplay} />

          <SectionTitle label="Contractor" />
          <DetailRow label="Name / ID" value={contractorDisplay} />
          {contractor?.email ? (
            <DetailRow label="Email" value={contractor.email} />
          ) : null}

          <SectionTitle label="Work Status" />
          <DetailRow label="Current Status" value={workItem.status} />
          <DetailRow
            label="Progress"
            value={`${workItem.progress_percentage}%`}
          />

          <SectionTitle label="Component Status" />
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
              <DetailRow
                label="Total Components"
                value={String(componentCount)}
              />
              <DetailRow
                label="Completed"
                value={String(completedCount)}
                testID="component-completed-count"
              />
              <DetailRow
                label="Pending"
                value={String(pendingCount)}
                testID="component-pending-count"
              />

              {Object.entries(componentStatusCounts).map(([status, count]) => (
                <DetailRow key={status} label={status} value={String(count)} />
              ))}
            </>
          ) : null}

          <PrimaryButton
            label="View Components"
            onPress={() =>
              navigation.navigate('ComponentList', {
                workItemId,
                title: workItem.title || title,
              })
            }
            testID="view-components-button"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ label }: { label: string }) {
  return <Text style={styles.sectionTitle}>{label}</Text>;
}

function DetailRow({
  label,
  value,
  testID,
}: {
  label: string;
  value: string;
  testID?: string;
}) {
  return (
    <View style={styles.detailRow} testID={testID}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
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
    backgroundColor: colors.secondaryBackground,
    padding: spacing.md,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: spacing.md,
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
    marginBottom: spacing.xxs,
  },
  caption: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.sm,
    marginBottom: spacing.xxs,
  },
  bodyText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xxs,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
    flex: 1,
    marginRight: spacing.sm,
  },
  detailValue: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    textAlign: 'right',
  },
});
