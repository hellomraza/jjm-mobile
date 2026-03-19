import { ReactElement } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../theme/colors';
import { fontSize, fontWeight, radius, spacing } from '../theme/designSystem';

type BackButtonProps = {
  onPress: () => void;
  testID: string;
  label?: string;
  icon?: ReactElement;
};

export function BackButton({
  onPress,
  testID,
  icon: IconComponent,
}: BackButtonProps) {
  return (
    <Pressable style={styles.backButton} onPress={onPress} testID={testID}>
      {IconComponent ? (
        IconComponent
      ) : (
        <Icon name="arrow-left" size={24} color={colors.primary} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
    width: 40,
    height: 40,
    marginLeft: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.white,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
