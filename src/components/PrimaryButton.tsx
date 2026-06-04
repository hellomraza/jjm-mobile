import { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { fontSize, fontWeight, radius, spacing } from '../theme/designSystem';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  testID: string;
  customStyles?: StyleProp<ViewStyle>;
  customTextStyles?: StyleProp<TextStyle>;
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  testID,
  customStyles,
  customTextStyles,
}: PrimaryButtonProps) {
  const animatedScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 100,
      friction: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 6,
    }).start();
  };

  return (
    <AnimatedPressable
      style={[
        styles.button,
        disabled || loading ? styles.buttonDisabled : undefined,
        customStyles,
        { transform: [{ scale: animatedScale }] },
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
    >
      <Text style={[styles.buttonText, customTextStyles]}>
        {loading ? 'Logging in...' : label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.disabledBackground,
  },
  buttonText: {
    color: colors.textOnPrimary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
