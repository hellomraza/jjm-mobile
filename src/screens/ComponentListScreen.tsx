import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useComponents } from '../hooks/useComponents';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { fontSize, fontWeight, radius, spacing } from '../theme/designSystem';

type ComponentListRouteProp = RouteProp<RootStackParamList, 'ComponentList'>;
type ComponentListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ComponentList'
>;

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

export function ComponentListScreen() {
  const navigation = useNavigation<ComponentListNavigationProp>();
  const route = useRoute<ComponentListRouteProp>();
  const { workItemId, title, work_code } = route.params;
  const { data: components, isLoading, isError } = useComponents(workItemId);

  const renderItem = ({
    item,
  }: {
    item: NonNullable<typeof components>[number];
  }) => {
    const progressPercent = getProgressPercent(item.progress, item.quantity);

    return (
      <Pressable
        style={styles.row}
        testID={`component-row-${item.id}`}
        onPress={() =>
          navigation.navigate('UploadPhoto', {
            workItemId,
            componentId: item.id,
            componentName: item.component?.name ?? 'Component',
          })
        }
      >
        <View style={styles.rowHeader}>
          <Text style={styles.componentName}>
            {item.component?.name ?? 'Unnamed Component'}
          </Text>
          <Text style={styles.status}>{item.status}</Text>
        </View>

        <View style={styles.progressHeader}>
          <Text style={styles.meta}>
            Progress: {formatProgress(item.progress, item.quantity)}
          </Text>
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

        {typeof item.quantity === 'number' ? (
          <Text style={styles.meta}>Quantity: {item.quantity}</Text>
        ) : null}
      </Pressable>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Components</Text>
        <Text style={styles.subtitle}>{title}</Text>
        <Text style={styles.caption}>Work Code: {work_code}</Text>
      </View>

      {isLoading ? (
        <Text testID="components-loading-text">Loading components...</Text>
      ) : null}
      {isError ? (
        <Text testID="components-error-text">Failed to load components.</Text>
      ) : null}
      {!isLoading && !isError && (components?.length ?? 0) === 0 ? (
        <Text testID="components-empty-text">No components found.</Text>
      ) : null}

      {!isLoading && !isError ? (
        <FlatList
          data={components ?? []}
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
  },
  row: {
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
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  componentName: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginRight: spacing.xs,
  },
  status: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
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
    height: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.divider,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
});
