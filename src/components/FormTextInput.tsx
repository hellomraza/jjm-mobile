import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { fontSize, fontWeight, radius, spacing } from '../theme/designSystem';

type FormTextInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  errorMessage?: string;
  testID: string;
} & Omit<TextInputProps, 'value' | 'onChangeText' | 'placeholder'>;

export function FormTextInput({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  errorMessage,
  testID,
  ...textInputProps
}: FormTextInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        style={[styles.input, errorMessage ? styles.inputError : undefined]}
        testID={testID}
        {...textInputProps}
      />
      {errorMessage ? (
        <Text style={styles.errorText} testID={`${testID}-error`}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
    marginLeft: spacing.xxs,
  },
  input: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.secondaryBackground,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    overflow: 'hidden',
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    marginTop: spacing.xs,
    color: colors.danger,
    fontSize: fontSize.sm,
  },
});
