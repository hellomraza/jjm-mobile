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
import { fontSize, fontWeight, radius, spacing } from '../theme/designSystem';
import { loginValidationSchema } from '../validation/loginValidationSchema';

type LoginNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

export function LoginScreen() {
  const navigation = useNavigation<LoginNavigationProp>();
  const { loginMutation } = useAuth();

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Login</Text>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle} />
            <Text style={styles.missionText}>Jal Jeevan Mission</Text>
          </View>
        </View>
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
              <View>
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
                <View style={styles.buttonContainer}>
                  <PrimaryButton
                    label="Login"
                    onPress={handleSubmit}
                    loading={isSubmitting || loginMutation.isPending}
                    testID="login-submit-button"
                    customStyles={styles.loginButton}
                  />
                </View>

                {submitError ? (
                  <Text
                    style={styles.errorText}
                    testID="login-submit-error-text"
                  >
                    {submitError}
                  </Text>
                ) : null}
              </View>
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
    backgroundColor: colors.primary,
    padding: spacing.md,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: radius.pill,
    borderWidth: 2,
    marginBottom: spacing.xs,
  },
  missionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  buttonContainer: {
    alignSelf: 'flex-start',
  },
  loginButton: {
    paddingHorizontal: spacing.xxxl,
  },
  errorText: {
    marginTop: spacing.sm,
    color: colors.danger,
    fontSize: fontSize.sm,
  },
});
