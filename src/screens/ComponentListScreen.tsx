import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../components/BackButton';
import { useComponents } from '../hooks/useComponents';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { fontSize, fontWeight, radius, spacing } from '../theme/designSystem';

type ComponentListRouteProp = RouteProp<RootStackParamList, 'ComponentList'>;
type ComponentListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ComponentList'
>;

type StatusVariant = 'approved' | 'pending' | 'rejected' | 'default';

function formatProgress(progress: string, quantity?: string) {
  const progressNum = parseFloat(progress);
  const quantityNum = quantity ? parseFloat(quantity) : undefined;

  if (typeof quantityNum === 'number' && quantityNum > 0) {
    return `${progressNum} / ${quantityNum}`;
  }

  return progress;
}

function getProgressPercent(progress: string, quantity?: string) {
  const progressNum = parseFloat(progress);
  const quantityNum = quantity ? parseFloat(quantity) : undefined;

  if (typeof quantityNum === 'number' && quantityNum > 0) {
    return Math.max(0, Math.min(100, (progressNum / quantityNum) * 100));
  }

  return Math.max(0, Math.min(100, progressNum));
}

function getStatusVariant(status: string): StatusVariant {
  const normalizedStatus = status.toLowerCase().replaceAll('_', ' ');

  if (
    normalizedStatus.includes('completed') ||
    normalizedStatus.includes('approved')
  ) {
    return 'approved';
  }

  if (
    normalizedStatus.includes('pending') ||
    normalizedStatus.includes('in progress') ||
    normalizedStatus.includes('submitted')
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

function getStatusLabel(status: string): string {
  return status
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/^./, char => char.toUpperCase());
}

export function ComponentListScreen() {
  const navigation = useNavigation<ComponentListNavigationProp>();
  const route = useRoute<ComponentListRouteProp>();
  const { workItemId, title, work_code } = route.params;
  const {
    data: components,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useComponents(workItemId);

  const skeletonItems = Array.from({ length: 6 }, (_, index) => index);

  const orderedComponents = [...(components ?? [])].sort((a, b) => {
    const orderA = a.component?.order_number ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.component?.order_number ?? Number.MAX_SAFE_INTEGER;

    return orderA - orderB;
  });

  const firstIncompleteComponent = orderedComponents.find(
    component => component.status !== 'APPROVED',
  );

  const activeComponentId = firstIncompleteComponent?.id;

  const renderItem = ({
    item,
  }: {
    item: NonNullable<typeof components>[number];
  }) => {
    const progressPercent = getProgressPercent(item.progress, item.quantity);
    const statusVariant = getStatusVariant(item.status);
    const isOutOfOrderLocked =
      !!activeComponentId &&
      item.id !== activeComponentId &&
      item.status !== 'APPROVED';

    return (
      <Pressable
        style={[styles.row, isOutOfOrderLocked && styles.rowLocked]}
        testID={`component-row-${item.id}`}
        onPress={() => {
          if (isOutOfOrderLocked) {
            Alert.alert(
              'Complete Previous Component',
              'Please complete the previous component before updating this one.',
            );
            return;
          }

          navigation.navigate('UploadPhoto', {
            workItemId,
            componentId: item.id,
            componentName: item.component?.name ?? 'Component',
          });
        }}
      >
        <View style={styles.rowHeader}>
          <Text numberOfLines={2} style={styles.componentName}>
            {item.component?.name ?? 'Unnamed Component'}
          </Text>
          <View
            style={[
              styles.statusChip,
              statusVariant === 'approved'
                ? styles.statusChipApproved
                : statusVariant === 'pending'
                ? styles.statusChipPending
                : statusVariant === 'rejected'
                ? styles.statusChipRejected
                : styles.statusChipDefault,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                statusVariant === 'approved'
                  ? styles.statusTextApproved
                  : statusVariant === 'pending'
                  ? styles.statusTextPending
                  : statusVariant === 'rejected'
                  ? styles.statusTextRejected
                  : styles.statusTextDefault,
              ]}
            >
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        {isOutOfOrderLocked ? (
          <Text
            style={styles.lockedHint}
            testID={`component-locked-${item.id}`}
          >
            Locked until previous component is approved.
          </Text>
        ) : null}

        <View style={styles.progressHeader}>
          <Text style={styles.metaLabel}>Overall Progress</Text>
          <Text style={styles.progressPercentText}>
            {Math.round(progressPercent)}%
          </Text>
        </View>

        <View
          style={styles.progressTrack}
          testID={`component-progress-track-${item.id}`}
        >
          <View
            style={[styles.progressFill, { width: `${progressPercent}%` }]}
            testID={`component-progress-fill-${item.id}`}
          />
        </View>

        <Text style={styles.meta}>
          Progress: {formatProgress(item.progress, item.quantity)}
        </Text>

        {typeof item.quantity === 'number' ? (
          <Text style={styles.meta}>Quantity: {item.quantity}</Text>
        ) : null}
      </Pressable>
    );
  };

  const renderSkeleton = ({ item }: { item: number }) => (
    <View style={styles.skeletonRow} testID={`components-skeleton-${item}`}>
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonChip} />
      <View style={styles.skeletonProgressTrack} />
      <View style={styles.skeletonMeta} />
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <BackButton
        onPress={() => navigation.goBack()}
        testID="component-list-back-button"
      />
      <View style={styles.headerCard}>
        <Text style={styles.title}>Components</Text>
        <Text style={styles.subtitle}>{title}</Text>
        <Text style={styles.caption}>Work Code: {work_code}</Text>
      </View>

      {isLoading ? (
        <FlatList
          data={skeletonItems}
          keyExtractor={item => String(item)}
          renderItem={renderSkeleton}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
          testID="components-skeleton-list"
        />
      ) : null}
      {isError ? (
        <Text testID="components-error-text">Failed to load components.</Text>
      ) : null}
      {!isLoading && !isError && (components?.length ?? 0) === 0 ? (
        <Text testID="components-empty-text">No components found.</Text>
      ) : null}

      {!isLoading && !isError ? (
        <FlatList
          data={orderedComponents}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          onRefresh={() => refetch()}
          refreshing={isRefetching}
          showsVerticalScrollIndicator={false}
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
    paddingVertical: spacing.md,
  },
  headerCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
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
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  caption: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  listContent: {
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  row: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  rowLocked: {
    opacity: 0.65,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  componentName: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginRight: spacing.xs,
    minHeight: 38,
  },
  statusChip: {
    borderRadius: radius.sm,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.xs,
  },
  statusChipApproved: {
    backgroundColor: '#EAF8EE',
  },
  statusChipPending: {
    backgroundColor: '#FFF7E6',
  },
  statusChipRejected: {
    backgroundColor: '#FDECEC',
  },
  statusChipDefault: {
    backgroundColor: '#EEF1F4',
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  statusTextApproved: {
    color: '#1E8E3E',
  },
  statusTextPending: {
    color: '#B27A00',
  },
  statusTextRejected: {
    color: colors.danger,
  },
  statusTextDefault: {
    color: colors.textPrimary,
  },
  lockedHint: {
    fontSize: fontSize.xs,
    color: colors.danger,
    marginBottom: spacing.xs,
  },
  metaLabel: {
    fontSize: fontSize.xs,
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    marginTop: spacing.xxs,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xxs,
    marginBottom: spacing.xxs,
  },
  progressPercentText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  progressTrack: {
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: '#E2E7EC',
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  skeletonRow: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E7ECF1',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  skeletonTitle: {
    height: 16,
    width: '70%',
    borderRadius: radius.sm,
    backgroundColor: '#E7ECF1',
    marginBottom: spacing.sm,
  },
  skeletonChip: {
    height: 18,
    width: '35%',
    borderRadius: radius.sm,
    backgroundColor: '#E7ECF1',
    marginBottom: spacing.sm,
  },
  skeletonProgressTrack: {
    height: 7,
    width: '100%',
    borderRadius: radius.pill,
    backgroundColor: '#E7ECF1',
    marginBottom: spacing.sm,
  },
  skeletonMeta: {
    height: 12,
    width: '50%',
    borderRadius: radius.sm,
    backgroundColor: '#E7ECF1',
  },
});
