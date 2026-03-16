import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Formik } from 'formik';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormTextInput } from '../components/FormTextInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { loginValidationSchema } from '../validation/loginValidationSchema';

type LoginNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

export function LoginScreen() {
  const navigation = useNavigation<LoginNavigationProp>();
  const { loginMutation } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>JJM Employee Login</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
        <Formik
          initialValues={{
            email: '',
            password: '',
          }}
          validationSchema={loginValidationSchema}
          validateOnBlur
          validateOnChange={false}
          onSubmit={async (values, { setStatus }) => {
            try {
              const normalizedEmail = values.email.trim();
              const normalizedPassword = values.password.trim();

              await loginMutation.mutateAsync({
                email: normalizedEmail,
                password: normalizedPassword,
              });

              navigation.replace('WorkItemList');
            } catch (error: unknown) {
              const fallbackMessage = 'Login failed. Please try again.';
              const responseMessage = (
                error as { response?: { data?: { message?: string } } }
              )?.response?.data?.message;

              setStatus(responseMessage || fallbackMessage);
            }
          }}
        >
          {({
            values,
            errors,
            touched,
            status,
            isSubmitting,
            handleChange,
            handleBlur,
            handleSubmit,
          }) => {
            const emailError = touched.email ? errors.email : undefined;
            const passwordError = touched.password
              ? errors.password
              : undefined;
            const submitError = typeof status === 'string' ? status : '';

            return (
              <>
                <FormTextInput
                  label="Email"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  placeholder="Enter email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  errorMessage={emailError}
                  testID="login-email-input"
                />

                <FormTextInput
                  label="Password"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  placeholder="Enter password"
                  secureTextEntry
                  errorMessage={passwordError}
                  testID="login-password-input"
                />

                <PrimaryButton
                  label="Login"
                  onPress={handleSubmit}
                  loading={isSubmitting || loginMutation.isPending}
                  testID="login-submit-button"
                />

                {submitError ? (
                  <Text
                    style={styles.errorText}
                    testID="login-submit-error-text"
                  >
                    {submitError}
                  </Text>
                ) : null}
              </>
            );
          }}
        </Formik>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondaryBackground,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  errorText: {
    marginTop: 12,
    color: colors.danger,
    fontSize: 14,
  },
});
