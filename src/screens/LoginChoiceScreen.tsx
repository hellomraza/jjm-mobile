import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { persistLoginMode } from '../hooks/useAuth';
import { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { fontSize, fontWeight, radius, spacing } from '../theme/designSystem';
import { perfectSize } from '../utils/perfectSize';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LoginChoice'
>;

export function LoginChoiceScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleSelectMode = async (mode: 'svs' | 'tpi') => {
    await persistLoginMode(mode);
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <View style={styles.content}>
        {/* Header Branding */}
        <View style={styles.header}>
          <Image
            source={require('../images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Jal Jeevan Mission</Text>
          <Text style={styles.headerSubtitle}>
            Water Infrastructure Monitoring System
          </Text>
        </View>

        {/* Selection Prompt */}
        <View style={styles.promptContainer}>
          <Text style={styles.promptTitle}>Select Login Portal</Text>
          <Text style={styles.promptSubtitle}>
            Choose your role to proceed to authentication
          </Text>
        </View>

        {/* Options Cards */}
        <View style={styles.cardsContainer}>
          {/* Card 1: SVS Login */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleSelectMode('svs')}
            style={[styles.card, styles.svsCard]}
            testID="login-choice-svs-btn"
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, styles.svsIconBadge]}>
                <Text style={styles.iconText}>👷</Text>
              </View>
              <View style={styles.portalBadge}>
                <Text style={styles.portalBadgeText}>Standard</Text>
              </View>
            </View>

            <Text style={styles.cardTitle}>SVS Login</Text>
            <Text style={styles.cardRole}>Field Employee / Worker</Text>
            <Text style={styles.cardDescription}>
              For field workers capturing component milestone photos under contractor assignments.
            </Text>

            <View style={styles.cardActionRow}>
              <Text style={styles.cardActionText}>Continue as Employee →</Text>
            </View>
          </TouchableOpacity>

          {/* Card 2: TPI Login */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleSelectMode('tpi')}
            style={[styles.card, styles.tpiCard]}
            testID="login-choice-tpi-btn"
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, styles.tpiIconBadge]}>
                <Text style={styles.iconText}>🔍</Text>
              </View>
              <View style={[styles.portalBadge, styles.tpiPortalBadge]}>
                <Text style={[styles.portalBadgeText, styles.tpiPortalBadgeText]}>
                  Inspection
                </Text>
              </View>
            </View>

            <Text style={styles.cardTitle}>TPI Login</Text>
            <Text style={[styles.cardRole, styles.tpiCardRole]}>
              Third Party Inspector (TPI)
            </Text>
            <Text style={styles.cardDescription}>
              For independent district TPI inspectors uploading reference verification photos.
            </Text>

            <View style={styles.cardActionRow}>
              <Text style={[styles.cardActionText, styles.tpiCardActionText]}>
                Continue as Inspector →
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  logo: {
    width: perfectSize(70),
    height: perfectSize(70),
    marginBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  promptContainer: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  promptTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  promptSubtitle: {
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  cardsContainer: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  svsCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#136FB6',
  },
  tpiCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svsIconBadge: {
    backgroundColor: '#EBF4FB',
  },
  tpiIconBadge: {
    backgroundColor: '#F3E8FF',
  },
  iconText: {
    fontSize: 18,
  },
  portalBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  portalBadgeText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: '#475569',
    textTransform: 'uppercase',
  },
  tpiPortalBadge: {
    backgroundColor: '#EDE9FE',
  },
  tpiPortalBadgeText: {
    color: '#7C3AED',
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#1E293B',
    marginTop: spacing.xs,
  },
  cardRole: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: '#136FB6',
    marginBottom: 4,
  },
  tpiCardRole: {
    color: '#7C3AED',
  },
  cardDescription: {
    fontSize: fontSize.xs,
    color: '#64748B',
    lineHeight: 18,
  },
  cardActionRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardActionText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: '#136FB6',
  },
  tpiCardActionText: {
    color: '#7C3AED',
  },
});
