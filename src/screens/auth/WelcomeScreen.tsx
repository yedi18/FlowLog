// src/screens/auth/WelcomeScreen.tsx
// מסך ברוך הבא עם עיצוב Dark Mode

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';

const { width, height } = Dimensions.get('window');

interface Props {
  navigation: any;
}

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start entrance animations
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo Section */}
        <Animated.View style={[
          styles.logoSection,
          { transform: [{ scale: logoScale }] }
        ]}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Ionicons name="diamond" size={50} color={theme.colors.primary} />
            </View>
          </View>
          
          <Text style={styles.appName}>FlowLog</Text>
          <Text style={styles.tagline}>{t('welcome.subtitle')}</Text>
        </Animated.View>

        {/* Features Section */}
        <Animated.View style={[
          styles.featuresSection,
          { transform: [{ translateY: slideAnim }] }
        ]}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="checkmark-circle-outline" size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.featureText}>{t('welcome.feature1')}</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.featureText}>{t('welcome.feature2')}</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="trending-up-outline" size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.featureText}>{t('welcome.feature3')}</Text>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View style={[
          styles.actionsSection,
          { transform: [{ translateY: slideAnim }] }
        ]}>
          {/* Sign Up Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={navigateToRegister}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>{t('welcome.getStarted')}</Text>
            <Ionicons name="arrow-forward" size={18} color={theme.colors.text} />
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={navigateToLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>{t('welcome.alreadyHaveAccount')}</Text>
          </TouchableOpacity>

          {/* Social Login */}
          <View style={styles.socialSection}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('welcome.orContinueWith')}</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-google" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-apple" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-facebook" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    justifyContent: 'space-between',
    paddingTop: height * 0.1,
    paddingBottom: theme.spacing.xxxxl,
  },
  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginTop: theme.spacing.xxxxl,
  },
  logoContainer: {
    marginBottom: theme.spacing.xl,
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.lg,
  },
  appName: {
    fontSize: theme.fontSize.hero,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  tagline: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  // Features Section
  featuresSection: {
    alignItems: 'center',
    gap: theme.spacing.xl,
  },
  featureItem: {
    flexDirection: theme.rtl.flexDirection,
    alignItems: 'center',
    gap: theme.spacing.lg,
    width: '100%',
    maxWidth: 280,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  featureText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    flex: 1,
    textAlign: theme.rtl.textAlign,
  },
  // Actions Section
  actionsSection: {
    gap: theme.spacing.lg,
  },
  primaryButton: {
    flexDirection: theme.rtl.flexDirection,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg + 4,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    gap: theme.spacing.md,
    ...theme.shadows.md,
  },
  primaryButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  secondaryButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  // Social Section
  socialSection: {
    marginTop: theme.spacing.xl,
  },
  divider: {
    flexDirection: theme.rtl.flexDirection,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.lg,
  },
  socialButtons: {
    flexDirection: theme.rtl.flexDirection,
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
});

export default WelcomeScreen;
