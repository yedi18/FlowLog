// src/screens/auth/RegisterScreen.tsx
// מסך הרשמה מתוקן עם עיצוב פשוט

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { registerUser, selectAuthLoading, selectAuthError } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store';
import { theme } from '../../utils/theme';

interface Props {
  navigation: any;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  // State
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Focus states
  const [displayNameFocused, setDisplayNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  // Redux State
  const isLoading = useSelector((state: RootState) => selectAuthLoading(state));
  const authError = useSelector((state: RootState) => selectAuthError(state));

  // Animations
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const logoScale = React.useRef(new Animated.Value(0.8)).current;

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    // Start animations on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Calculate password strength
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    setPasswordStrength(strength);
  }, [password]);

  // Validation functions
  const validateDisplayName = (name: string): boolean => {
    if (name.trim().length < 2) {
      setDisplayNameError(t('error.nameRequired'));
      return false;
    }
    setDisplayNameError('');
    return true;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError(t('error.emailRequired'));
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError(t('error.emailInvalid'));
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError(t('error.passwordRequired'));
      return false;
    }
    if (password.length < 6) {
      setPasswordError(t('error.passwordTooShort'));
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (confirmPass: string): boolean => {
    if (!confirmPass) {
      setConfirmPasswordError(t('error.passwordRequired'));
      return false;
    }
    if (confirmPass !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  // Register function
  const handleRegister = async () => {
    const isDisplayNameValid = validateDisplayName(displayName);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isDisplayNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    if (!acceptTerms) {
      Alert.alert('Terms & Conditions', t('auth.acceptTerms'));
      return;
    }

    try {
      await dispatch(registerUser({
        email,
        password,
        displayName: displayName.trim()
      })).unwrap();
    } catch (error: any) {
      Alert.alert(t('error.auth'), error.message || 'Failed to create account');
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return 'Weak';
      case 2:
      case 3: return 'Medium';
      case 4:
      case 5: return 'Strong';
      default: return 'Weak';
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return theme.colors.error;
      case 2:
      case 3: return theme.colors.warning;
      case 4:
      case 5: return theme.colors.success;
      default: return theme.colors.error;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            {/* Logo Section */}
            <Animated.View
              style={[
                styles.logoContainer,
                { transform: [{ scale: logoScale }] }
              ]}
            >
              <View style={styles.logoBackground}>
                <Ionicons name="person-add" size={32} color={theme.colors.primary} />
              </View>
              <Text style={styles.logoText}>{t('auth.createAccount')}</Text>
              <Text style={styles.logoSubtext}>{t('auth.joinFlowlog')}</Text>
            </Animated.View>

            {/* Registration Form */}
            <View style={styles.formContainer}>
              {/* Display Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('auth.displayName')}</Text>
                <View style={[
                  styles.inputWrapper,
                  displayNameFocused && styles.inputWrapperFocused,
                  displayNameError && styles.inputWrapperError
                ]}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={displayNameFocused ? theme.colors.primary : theme.colors.textSecondary}
                  />
                  <TextInput
                    style={[styles.textInput, { textAlign: theme.rtl.textAlign }]}
                    value={displayName}
                    onChangeText={(text) => {
                      setDisplayName(text);
                      if (displayNameError) validateDisplayName(text);
                    }}
                    placeholder={t('auth.enterName')}
                    placeholderTextColor={theme.colors.textSecondary}
                    autoCapitalize="words"
                    autoCorrect={false}
                    onFocus={() => setDisplayNameFocused(true)}
                    onBlur={() => setDisplayNameFocused(false)}
                  />
                </View>
                {displayNameError ? (
                  <Animated.Text style={styles.errorText}>{displayNameError}</Animated.Text>
                ) : null}
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('auth.email')}</Text>
                <View style={[
                  styles.inputWrapper,
                  emailFocused && styles.inputWrapperFocused,
                  emailError && styles.inputWrapperError
                ]}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={emailFocused ? theme.colors.primary : theme.colors.textSecondary}
                  />
                  <TextInput
                    style={[styles.textInput, { textAlign: theme.rtl.textAlign }]}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) validateEmail(text);
                    }}
                    placeholder={t('auth.enterEmail')}
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>
                {emailError ? (
                  <Animated.Text style={styles.errorText}>{emailError}</Animated.Text>
                ) : null}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('auth.password')}</Text>
                <View style={[
                  styles.inputWrapper,
                  passwordFocused && styles.inputWrapperFocused,
                  passwordError && styles.inputWrapperError
                ]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={passwordFocused ? theme.colors.primary : theme.colors.textSecondary}
                  />
                  <TextInput
                    style={[styles.textInput, { textAlign: theme.rtl.textAlign }]}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) validatePassword(text);
                    }}
                    placeholder={t('auth.createPassword')}
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <View style={styles.passwordStrengthContainer}>
                    <View style={styles.passwordStrengthBar}>
                      <View
                        style={[
                          styles.passwordStrengthFill,
                          {
                            width: `${(passwordStrength / 5) * 100}%`,
                            backgroundColor: getPasswordStrengthColor(),
                          }
                        ]}
                      />
                    </View>
                    <Text style={[
                      styles.passwordStrengthText,
                      { color: getPasswordStrengthColor() }
                    ]}>
                      {getPasswordStrengthText()}
                    </Text>
                  </View>
                )}

                {passwordError ? (
                  <Animated.Text style={styles.errorText}>{passwordError}</Animated.Text>
                ) : null}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('auth.confirmPassword')}</Text>
                <View style={[
                  styles.inputWrapper,
                  confirmPasswordFocused && styles.inputWrapperFocused,
                  confirmPasswordError && styles.inputWrapperError
                ]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={confirmPasswordFocused ? theme.colors.primary : theme.colors.textSecondary}
                  />
                  <TextInput
                    style={[styles.textInput, { textAlign: theme.rtl.textAlign }]}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (confirmPasswordError) validateConfirmPassword(text);
                    }}
                    placeholder={t('auth.confirmYourPassword')}
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => setConfirmPasswordFocused(false)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.passwordToggle}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                {confirmPasswordError ? (
                  <Animated.Text style={styles.errorText}>{confirmPasswordError}</Animated.Text>
                ) : null}
              </View>

              {/* Terms & Conditions */}
              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => setAcceptTerms(!acceptTerms)}
              >
                <View style={[
                  styles.checkbox,
                  acceptTerms && styles.checkboxChecked
                ]}>
                  {acceptTerms && (
                    <Ionicons name="checkmark" size={14} color={theme.colors.text} />
                  )}
                </View>
                <Text style={styles.termsText}>
                  {t('auth.acceptTerms')}
                </Text>
              </TouchableOpacity>

              {/* Auth Error */}
              {authError ? (
                <View style={styles.authErrorContainer}>
                  <Ionicons name="warning-outline" size={16} color={theme.colors.error} />
                  <Text style={styles.authErrorText}>{authError}</Text>
                </View>
              ) : null}

              {/* Register Button */}
              <TouchableOpacity
                style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <View style={styles.registerButtonContent}>
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <Animated.View style={styles.loadingSpinner}>
                        <Ionicons name="reload-outline" size={20} color={theme.colors.text} />
                      </Animated.View>
                      <Text style={styles.registerButtonText}>{t('auth.creatingAccount')}</Text>
                    </View>
                  ) : (
                    <>
                      <Ionicons name="person-add-outline" size={20} color={theme.colors.text} />
                      <Text style={styles.registerButtonText}>{t('auth.register')}</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>

              {/* Social Registration */}
              <View style={styles.socialContainer}>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{t('welcome.orContinueWith')}</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialButtons}>
                  <TouchableOpacity style={styles.socialButton}>
                    <Ionicons name="logo-google" size={24} color={theme.colors.textSecondary} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.socialButton}>
                    <Ionicons name="logo-apple" size={24} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Sign In Link */}
            <TouchableOpacity
              style={styles.signInContainer}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.signInText}>
                {t('auth.alreadyHaveAccount')}
                <Text style={styles.signInLink}> {t('auth.signInLink')}</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
  },
  content: {
    flex: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    alignSelf: 'flex-start',
    ...theme.shadows.sm,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxxxl,
  },
  logoBackground: {
    width: 70,
    height: 70,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  logoText: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  logoSubtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: theme.rtl.textAlign,
  },
  inputWrapper: {
    flexDirection: theme.rtl.flexDirection,
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  inputWrapperFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  inputWrapperError: {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.surface,
  },
  textInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  passwordToggle: {
    padding: theme.spacing.xs,
  },
  passwordStrengthContainer: {
    flexDirection: theme.rtl.flexDirection,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  passwordStrengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    textAlign: theme.rtl.textAlign,
  },
  termsContainer: {
    flexDirection: theme.rtl.flexDirection,
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    textAlign: theme.rtl.textAlign,
  },
  authErrorContainer: {
    flexDirection: theme.rtl.flexDirection,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.error,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  authErrorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
    flex: 1,
    textAlign: theme.rtl.textAlign,
  },
  registerButton: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonContent: {
    flexDirection: theme.rtl.flexDirection,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  registerButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  loadingContainer: {
    flexDirection: theme.rtl.flexDirection,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  loadingSpinner: {
    // Add rotation animation here if needed
  },
  socialContainer: {
    width: '100%',
  },
  divider: {
    flexDirection: theme.rtl.flexDirection,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.md,
  },
  socialButtons: {
    flexDirection: theme.rtl.flexDirection,
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  signInContainer: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  signInText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  signInLink: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
});

export default RegisterScreen;
   