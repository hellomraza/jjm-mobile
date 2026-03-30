import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';
import { fontSize, fontWeight, radius, spacing } from '../theme/designSystem';

type FormTextInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  errorMessage?: string;
  testID: string;
  showPasswordToggle?: boolean;
} & Omit<TextInputProps, 'value' | 'onChangeText' | 'placeholder'>;

export function FormTextInput({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  errorMessage,
  testID,
  showPasswordToggle = false,
  ...textInputProps
}: FormTextInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
          style={[
            styles.input,
            errorMessage ? styles.inputError : undefined,
            showPasswordToggle ? styles.inputWithToggle : undefined,
          ]}
          testID={testID}
          secureTextEntry={showPasswordToggle && !isPasswordVisible}
          {...textInputProps}
        />
        {showPasswordToggle ? (
          <Pressable
            style={styles.passwordToggle}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            testID={`${testID}-toggle`}
            hitSlop={10}
          >
            <Icon
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={colors.textPrimary}
            />
          </Pressable>
        ) : null}
      </View>
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
  inputWrapper: {
    position: 'relative',
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
  inputWithToggle: {
    paddingRight: spacing.xl,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    marginTop: spacing.xs,
    color: colors.danger,
    fontSize: fontSize.sm,
  },
  passwordToggle: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
});
