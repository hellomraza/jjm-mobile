import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Formik } from 'formik';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Vibration,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormTextInput } from '../components/FormTextInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { fontSize, fontWeight, radius, spacing } from '../theme/designSystem';
import { perfectSize } from '../utils/perfectSize';
import { loginValidationSchema } from '../validation/loginValidationSchema';

type LoginNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

export function LoginScreen() {
  const navigation = useNavigation<LoginNavigationProp>();
  const { loginMutation } = useAuth();

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(30)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(cardTranslateY, {
        toValue: 0,
        tension: 60,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();

    const startLogoFloat = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(logoFloat, {
            toValue: -6,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(logoFloat, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };

    startLogoFloat();
  }, [cardOpacity, cardTranslateY, logoFloat]);

  const triggerHaptic = (type: 'light' | 'medium' | 'error') => {
    try {
      if (Platform.OS === 'android') {
        if (type === 'light') {
          Vibration.vibrate(10);
        } else if (type === 'medium') {
          Vibration.vibrate(20);
        } else if (type === 'error') {
          Vibration.vibrate([0, 40, 40, 40]);
        }
      } else {
        // On iOS, vibrate triggers a standard haptic pulse.
        // We only trigger it for error and medium to avoid haptic fatigue.
        if (type === 'error' || type === 'medium') {
          Vibration.vibrate();
        }
      }
    } catch (e) {
      // Catch silently
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Decorative ambient glowing shapes */}
      <View style={styles.bgBlob1} pointerEvents="none" />
      <View style={styles.bgBlob2} pointerEvents="none" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              style={[
                styles.card,
                {
                  opacity: cardOpacity,
                  transform: [{ translateY: cardTranslateY }],
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.logoContainer,
                  { transform: [{ translateY: logoFloat }] },
                ]}
              >
                <Image
                  source={require('../images/logo.png')}
                  style={styles.logo}
                />
                <Text style={styles.missionText}>Jal Jeevan Mission</Text>
              </Animated.View>

              <Text style={styles.title}>Login</Text>

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
                    triggerHaptic('error');
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
                        errorMessage={passwordError}
                        testID="login-password-input"
                        showPasswordToggle
                      />

                      {submitError ? (
                        <Text
                          style={styles.errorText}
                          testID="login-submit-error-text"
                        >
                          {submitError}
                        </Text>
                      ) : null}

                      <View style={styles.buttonContainer}>
                        <PrimaryButton
                          label="Login"
                          onPress={() => {
                            const hasFormErrors =
                              !values.email ||
                              !values.password ||
                              Object.keys(errors).length > 0;
                            if (hasFormErrors) {
                              triggerHaptic('error');
                            } else {
                              triggerHaptic('medium');
                            }
                            handleSubmit();
                          }}
                          loading={isSubmitting || loginMutation.isPending}
                          testID="login-submit-button"
                          customStyles={styles.loginButton}
                        />
                      </View>
                    </View>
                  );
                }}
              </Formik>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  bgBlob1: {
    position: 'absolute',
    top: -perfectSize(80),
    left: -perfectSize(80),
    width: perfectSize(240),
    height: perfectSize(240),
    borderRadius: perfectSize(120),
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  bgBlob2: {
    position: 'absolute',
    bottom: -perfectSize(100),
    right: -perfectSize(60),
    width: perfectSize(280),
    height: perfectSize(280),
    borderRadius: perfectSize(140),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: perfectSize(24),
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    width: perfectSize(80),
    height: perfectSize(80),
    marginBottom: spacing.xs,
    resizeMode: 'contain',
  },
  missionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: spacing.xxs,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  buttonContainer: {
    marginTop: spacing.lg,
    width: '100%',
  },
  loginButton: {
    width: '100%',
    height: perfectSize(50),
    borderRadius: radius.md,
  },
  errorText: {
    marginTop: spacing.sm,
    color: colors.danger,
    fontSize: fontSize.sm,
    textAlign: 'center',
    fontWeight: fontWeight.medium,
  },
});
