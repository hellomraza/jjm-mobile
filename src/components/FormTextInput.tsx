import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { fontSize, radius, spacing } from '../theme/designSystem';

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
    <View>
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
  label: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  input: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    fontSize: fontSize.md,
    color: colors.textPrimary,
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
