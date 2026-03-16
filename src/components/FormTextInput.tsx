import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { colors } from '../theme/colors';

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
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.white,
    fontSize: 16,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    marginTop: 8,
    color: colors.danger,
    fontSize: 14,
  },
});
