import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { useAgreements } from '../hooks/useAgreements';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { fontSize, fontWeight, radius, spacing } from '../theme/designSystem';

type AgreementListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AgreementList'
>;

export function AgreementListScreen() {
  const navigation = useNavigation<AgreementListNavigationProp>();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

  const {
    data: agreements,
    isLoading,
    isError,
    refetch: refetchAgreements,
    isRefetching: isRefetchingAgreements,
  } = useAgreements(debouncedSearch);
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
    Promise.allSettled([refetchAgreements(), refetchUserProfile()]).then(
      () => undefined,
    );
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
    navigation.replace('Login');
  };

  const renderItem = ({
    item,
  }: {
    item: NonNullable<typeof agreements>['data'][number];
  }) => {
    return (
      <Pressable
        style={styles.card}
        testID={`agreement-card-${item.id}`}
        onPress={() =>
          navigation.navigate('WorkItemList', {
            agreementId: item.id,
          })
        }
      >
        <Text style={styles.agreementNumber} numberOfLines={1}>
          Agreement No: {item.agreementno}
        </Text>
        <View style={styles.detailsRow}>
          <Text style={styles.detailText}>Year: {item.agreementyear}</Text>
          <Text style={styles.detailText}>Contractor ID: {item.contractor?.name}</Text>
        </View>
      </Pressable>
    );
  };

  const renderSkeleton = ({ item }: { item: number }) => (
    <View style={styles.skeletonCard} testID={`agreement-skeleton-${item}`}>
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonDetails} />
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {isMenuOpen ? (
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setIsMenuOpen(false)}
          testID="agreement-menu-backdrop"
        />
      ) : null}

      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.employeeName} testID="agreement-employee-name">
            {employeeName}
          </Text>

          <View style={styles.menuWrapper}>
            <Pressable
              style={styles.menuButton}
              onPress={() => setIsMenuOpen(prev => !prev)}
              testID="agreement-menu-button"
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
                testID="agreement-menu-dropdown"
              >
                <Pressable
                  style={styles.menuItem}
                  onPress={handleLogout}
                  testID="agreement-logout-button"
                >
                  <Text style={styles.menuItemText}>Logout</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
        <Text style={styles.title}>Agreements {agreements?.total ? `(${agreements?.total})` : ''}</Text>
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search by agreement number..."
          placeholderTextColor="#9CA3AF"
          testID="agreement-search-input"
        />
      </View>

      {isLoading ? (
        <FlatList
          data={skeletonItems}
          keyExtractor={item => String(item)}
          renderItem={renderSkeleton}
          contentContainerStyle={styles.listContent}
          testID="agreement-skeleton-list"
          scrollEnabled={false}
        />
      ) : null}

      {!isLoading ? (
        <FlatList
          data={agreements?.data ?? []}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          onRefresh={handleRefresh}
          refreshing={isRefetchingAgreements || isRefetchingUserProfile}
          contentContainerStyle={
            isError || (agreements?.data.length ?? 0) === 0
              ? [styles.listContent, { flexGrow: 1 }]
              : styles.listContent
          }
          alwaysBounceVertical={true}
          ListEmptyComponent={
            isError ? (
              <View style={styles.emptyContainer} testID="agreement-error-container">
                <Text testID="agreement-error-text" style={styles.errorText}>
                  Failed to load agreements.
                </Text>
              </View>
            ) : (
              <View style={styles.emptyContainer} testID="agreement-empty-container">
                <Text testID="agreement-empty-text" style={styles.emptyText}>
                  {searchText.trim() !== ''
                    ? 'No agreements found matching your search.'
                    : 'No agreements found. Please contact your contractor to assign agreements.'}
                </Text>
              </View>
            )
          }
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
  searchInput: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    marginTop: spacing.sm,
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
  title: {
    fontSize: fontSize.xl,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  agreementNumber: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xxs,
  },
  detailText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  skeletonCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E7ECF1',
  },
  skeletonTitle: {
    height: 20,
    borderRadius: radius.sm,
    backgroundColor: '#E7ECF1',
    marginBottom: spacing.sm,
    width: '60%',
  },
  skeletonDetails: {
    height: 14,
    borderRadius: radius.sm,
    backgroundColor: '#E7ECF1',
    width: '80%',
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
});
