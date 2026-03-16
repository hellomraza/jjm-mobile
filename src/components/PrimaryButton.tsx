import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

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
    marginTop: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.disabledBackground,
  },
  buttonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
