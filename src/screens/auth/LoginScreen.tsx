// src/screens/auth/LoginScreen.tsx
// מסך התחברות עם עיצוב Dark Mode

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
  Switch,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, selectAuthLoading, selectAuthError } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';
import { theme } from '../../utils/theme';

interface Props {
  navigation: any;
}

interface SavedCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  
  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(true);

  // Redux State
  const isLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);

  // Animations
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const logoScale = React.useRef(new Animated.Value(0.8)).current;

  // טעינת נתונים שמורים בעת הטעינה
  useEffect(() => {
    loadSavedCredentials();
  }, []);

  useEffect(() => {
    // התחלת אנימציות רק אחרי טעינת הנתונים
    if (!isLoadingCredentials) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoadingCredentials]);

  // טעינת נתונים שמורים
  const loadSavedCredentials = async () => {
    try {
      const savedData = await AsyncStorage.getItem('loginCredentials');
      if (savedData) {
        const credentials: SavedCredentials = JSON.parse(savedData);
        if (credentials.rememberMe) {
          setEmail(credentials.email);
          setPassword(credentials.password);
          setRememberMe(true);
        }
      }
    } catch (error) {
      console.log('Error loading saved credentials:', error);
    } finally {
      setIsLoadingCredentials(false);
    }
  };

  // שמירת נתונים
  const saveCredentials = async (email: string, password: string, remember: boolean) => {
    try {
      if (remember) {
        const credentials: SavedCredentials = {
          email,
          password,
          rememberMe: true,
        };
        await AsyncStorage.setItem('loginCredentials', JSON.stringify(credentials));
      } else {
        // מחק נתונים שמורים אם המשתמש לא רוצה לזכור
        await AsyncStorage.removeItem('loginCredentials');
      }
    } catch (error) {
      console.log('Error saving credentials:', error);
    }
  };

  // Validation functions
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

  // פונקציית כניסה
  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      // שמור נתונים אם המשתמש בחר לזכור
      await saveCredentials(email, password, rememberMe);
      
      // התחבר
      await dispatch(loginUser({ email, password })).unwrap();
    } catch (error: any) {
      Alert.alert(t('error.auth'), error.message || t('error.generic'));
    }
  };

  // מילוי נתוני דוגמה
  const fillTestData = () => {
    setEmail('test@example.com');
    setPassword('123456');
    setRememberMe(true);
  };

  // אם עדיין טוען נתונים
  if (isLoadingCredentials) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        <View style={styles.loadingContainer}>
          <Animated.View style={[styles.logoContainer, { opacity: 0.5 }]}>
            <View style={styles.logoBackground}>
              <Ionicons name="diamond" size={40} color={theme.colors.primary} />
            </View>
            <Text style={styles.logoText}>FlowLog</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

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
            {/* Logo Section */}
            <Animated.View 
              style={[
                styles.logoContainer,
                { transform: [{ scale: logoScale }] }
              ]}
            >
              <View style={styles.logoBackground}>
                <Ionicons name="diamond" size={40} color={theme.colors.primary} />
              </View>
              <Text style={styles.logoText}>FlowLog</Text>
              <Text style={styles.logoSubtext}>{t('welcome.subtitle')}</Text>
            </Animated.View>

            {/* Login Form */}
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>{t('auth.welcomeBack')}</Text>
              
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
                    placeholder={t('auth.enterPassword')}
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
                {passwordError ? (
                  <Animated.Text style={styles.errorText}>{passwordError}</Animated.Text>
                ) : null}
              </View>

              {/* Remember Me */}
              <View style={styles.rememberContainer}>
                <TouchableOpacity
                  style={styles.rememberRow}
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxChecked
                  ]}>
                    {rememberMe && (
                      <Ionicons name="checkmark" size={14} color={theme.colors.text} />
                    )}
                  </View>
                  <Text style={styles.rememberText}>{t('auth.rememberMe')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>{t('auth.forgotPassword')}</Text>
                </TouchableOpacity>
              </View>

              {/* Auth Error */}
              {authError ? (
                <View style={styles.authErrorContainer}>
                  <Ionicons name="warning-outline" size={16} color={theme.colors.error} />
                  <Text style={styles.authErrorText}>{authError}</Text>
                </View>
              ) : null}

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <View style={styles.loginButtonContent}>
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <Animated.View style={styles.loadingSpinner}>
                        <Ionicons name="reload-outline" size={20} color={theme.colors.text} />
                      </Animated.View>
                      <Text style={styles.loginButtonText}>{t('auth.signingIn')}</Text>
                    </View>
                  ) : (
                    <>
                      <Ionicons name="log-in-outline" size={20} color={theme.colors.text} />
                      <Text style={styles.loginButtonText}>{t('auth.login')}</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>

              {/* Test Data Button */}
              {__DEV__ && (
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={fillTestData}
                >
                  <Text style={styles.testButtonText}>{t('auth.fillTestData')}</Text>
                </TouchableOpacity>
              )}

              {/* Social Login */}
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

            {/* Sign Up Link */}
            <TouchableOpacity
              style={styles.signUpContainer}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.signUpText}>
                {t('auth.dontHaveAccount')} 
                <Text style={styles.signUpLink}> {t('auth.signUpLink')}</Text>
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
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
  },
  content: {
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxxxl,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  logoText: {
    fontSize: theme.fontSize.hero,
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
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.lg,
  },
  formTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
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
  errorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    textAlign: theme.rtl.textAlign,
  },
  rememberContainer: {
    flexDirection: theme.rtl.flexDirection,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  rememberRow: {
    flexDirection: theme.rtl.flexDirection,
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
  rememberText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    textAlign: theme.rtl.textAlign,
  },
  forgotPassword: {
    alignSelf: theme.rtl.alignSelf,
  },
  forgotPasswordText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
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
  loginButton: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonContent: {
    flexDirection: theme.rtl.flexDirection,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  loginButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  loadingSpinner: {
    // Add rotation animation here if needed
  },
  testButton: {
    width: '100%',
    backgroundColor: theme.colors.warning,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
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
  signUpContainer: {
    marginTop: theme.spacing.lg,
  },
  signUpText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  signUpLink: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
});

export default LoginScreen;