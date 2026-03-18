import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { fontSize, fontWeight, radius, spacing } from '../theme/designSystem';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  testID: string;
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  testID,
}: PrimaryButtonProps) {
  return (
    <Pressable
      style={[
        styles.button,
        disabled || loading ? styles.buttonDisabled : undefined,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
    >
      <Text style={styles.buttonText}>{loading ? 'Logging in...' : label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.disabledBackground,
  },
  buttonText: {
    color: colors.textOnPrimary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
