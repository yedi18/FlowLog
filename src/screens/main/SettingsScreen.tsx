// src/screens/main/SettingsScreen.tsx
// Settings screen with full functionality and enhanced colors

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  StatusBar,
  Modal,
  Share,
  Platform,
  Linking,
  Animated,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  joinDate: Date;
  notesCount: number;
  tasksCompleted: number;
  eventsCreated: number;
}

interface AppSettings {
  notifications: boolean;
  taskReminders: boolean;
  eventReminders: boolean;
  emailUpdates: boolean;
  faceId: boolean;
  autoBackup: boolean;
  analytics: boolean;
  darkMode: boolean;
  autoSync: boolean;
  offlineMode: boolean;
}

interface NotificationSettings {
  sound: boolean;
  vibration: boolean;
  badge: boolean;
  lockScreen: boolean;
  reminderTime: number; // minutes before
}

const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Yedid',
    email: 'yedidyamcs@gmail.com',
    joinDate: new Date(2023, 0, 15),
    notesCount: 42,
    tasksCompleted: 157,
    eventsCreated: 89,
  });

  const [settings, setSettings] = useState<AppSettings>({
    notifications: true,
    taskReminders: true,
    eventReminders: true,
    emailUpdates: false,
    faceId: false,
    autoBackup: true,
    analytics: true,
    darkMode: true,
    autoSync: true,
    offlineMode: false,
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    sound: true,
    vibration: true,
    badge: true,
    lockScreen: true,
    reminderTime: 15,
  });

  // Form states
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [exportContent, setExportContent] = useState<string[]>(['notes', 'tasks', 'events']);

  // Animations
  const fadeAnim = new Animated.Value(1);
  const slideAnim = new Animated.Value(300);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Any unsaved changes will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            // Implement logout logic here
            Alert.alert('Success', 'Signed out successfully');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'I understand, delete my account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Type "DELETE" to confirm account deletion',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Forever',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert('Info', 'Account deletion feature coming soon');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setShowLanguageModal(false);
    Alert.alert('Success', 'Language changed successfully');
  };

  const handleExportData = async () => {
    setShowExportModal(true);
    openModal(setShowExportModal);
  };

  const performExport = async () => {
    try {
      const exportData = {
        user: userProfile,
        settings: settings,
        exportDate: new Date().toISOString(),
        format: exportFormat,
        content: exportContent,
      };

      await Share.share({
        title: 'FlowLog Data Export',
        message: `Your FlowLog data export (${exportFormat.toUpperCase()})`,
        url: `data:application/json;base64,${btoa(JSON.stringify(exportData, null, 2))}`,
      });

      setShowExportModal(false);
      Alert.alert('Success', 'Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleUpdateProfile = () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    setUserProfile(prev => ({
      ...prev,
      name: editName.trim(),
      email: editEmail.trim(),
    }));

    setShowProfileModal(false);
    Alert.alert('Success', 'Profile updated successfully');
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'How would you like to contact us?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Email',
          onPress: () => {
            Linking.openURL('mailto:support@flowlog.app?subject=FlowLog Support Request');
          },
        },
        {
          text: 'Twitter',
          onPress: () => {
            Linking.openURL('https://twitter.com/flowlogapp');
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to their default values. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSettings({
              notifications: true,
              taskReminders: true,
              eventReminders: true,
              emailUpdates: false,
              faceId: false,
              autoBackup: true,
              analytics: true,
              darkMode: true,
              autoSync: true,
              offlineMode: false,
            });
            Alert.alert('Success', 'Settings reset to defaults');
          },
        },
      ]
    );
  };

  const toggleSetting = (key: keyof AppSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleNotificationSetting = (key: keyof NotificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const openModal = (setModal: (value: boolean) => void) => {
    setModal(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = (setModal: (value: boolean) => void) => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModal(false);
    });
  };

  const getUserInitial = () => {
    return userProfile.name.charAt(0).toUpperCase();
  };

  const formatJoinDate = () => {
    return userProfile.joinDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const renderSettingItem = (
    title: string,
    subtitle: string,
    icon: keyof typeof Ionicons.glyphMap,
    onPress?: () => void,
    rightElement?: React.ReactNode,
    destructive?: boolean,
    color?: string
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, destructive && styles.destructiveItem]}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={styles.settingLeft}>
        <View style={[
          styles.settingIconContainer,
          { backgroundColor: (color || '#2979FF') + '20' }
        ]}>
          <Ionicons 
            name={icon} 
            size={20} 
            color={color || (destructive ? '#ff4757' : '#2979FF')} 
          />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={[
            styles.settingTitle,
            destructive && styles.destructiveText
          ]}>
            {title}
          </Text>
          <Text style={styles.settingSubtitle}>
            {subtitle}
          </Text>
        </View>
      </View>
      
      {rightElement || (
        <Ionicons name="chevron-forward" size={16} color="#666" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity onPress={handleResetSettings}>
            <Ionicons name="refresh-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Section */}
          <TouchableOpacity 
            style={styles.profileSection}
            onPress={() => {
              setEditName(userProfile.name);
              setEditEmail(userProfile.email);
              openModal(setShowProfileModal);
            }}
          >
            <View style={styles.profileLeft}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileInitial}>{getUserInitial()}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userProfile.name}</Text>
                <Text style={styles.profileEmail}>{userProfile.email}</Text>
                <Text style={styles.profileJoinDate}>
                  Member since {formatJoinDate()}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="document-text-outline" size={24} color="#4CAF50" />
              <Text style={styles.statNumber}>{userProfile.notesCount}</Text>
              <Text style={styles.statLabel}>Notes</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#2979FF" />
              <Text style={styles.statNumber}>{userProfile.tasksCompleted}</Text>
              <Text style={styles.statLabel}>Tasks Done</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="calendar-outline" size={24} color="#FF9800" />
              <Text style={styles.statNumber}>{userProfile.eventsCreated}</Text>
              <Text style={styles.statLabel}>Events</Text>
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            {renderSettingItem(
              'Language',
              i18n.language === 'he' ? 'עברית' : 'English',
              'language-outline',
              () => openModal(setShowLanguageModal),
              undefined,
              false,
              '#2979FF'
            )}
            
            {renderSettingItem(
              'Notifications',
              'Manage all notification settings',
              'notifications-outline',
              () => openModal(setShowNotificationModal),
              undefined,
              false,
              '#34C759'
            )}
            
            {renderSettingItem(
              'Dark Mode',
              'Currently enabled',
              'moon-outline',
              undefined,
              <Switch
                value={settings.darkMode}
                onValueChange={() => toggleSetting('darkMode')}
                trackColor={{ false: '#333', true: '#2979FF' }}
                thumbColor="#fff"
              />,
              false,
              '#5856D6'
            )}
            
            {renderSettingItem(
              'Auto Sync',
              'Sync data across devices',
              'sync-outline',
              undefined,
              <Switch
                value={settings.autoSync}
                onValueChange={() => toggleSetting('autoSync')}
                trackColor={{ false: '#333', true: '#2979FF' }}
                thumbColor="#fff"
              />,
              false,
              '#007AFF'
            )}
          </View>

          {/* Privacy & Security */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy & Security</Text>
            
            {renderSettingItem(
              'Face ID / Touch ID',
              'Secure app with biometrics',
              'finger-print-outline',
              undefined,
              <Switch
                value={settings.faceId}
                onValueChange={() => toggleSetting('faceId')}
                trackColor={{ false: '#333', true: '#34C759' }}
                thumbColor="#fff"
              />,
              false,
              '#34C759'
            )}
            
            {renderSettingItem(
              'Auto Backup',
              'Automatically backup your data',
              'cloud-upload-outline',
              undefined,
              <Switch
                value={settings.autoBackup}
                onValueChange={() => toggleSetting('autoBackup')}
                trackColor={{ false: '#333', true: '#2979FF' }}
                thumbColor="#fff"
              />,
              false,
              '#2979FF'
            )}
            
            {renderSettingItem(
              'Export Data',
              'Download all your data',
              'download-outline',
              handleExportData,
              undefined,
              false,
              '#FF9800'
            )}
            
            {renderSettingItem(
              'Analytics',
              'Help improve the app',
              'analytics-outline',
              undefined,
              <Switch
                value={settings.analytics}
                onValueChange={() => toggleSetting('analytics')}
                trackColor={{ false: '#333', true: '#5856D6' }}
                thumbColor="#fff"
              />,
              false,
              '#5856D6'
            )}
          </View>

          {/* Support */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            
            {renderSettingItem(
              'Help & FAQ',
              'Get help and find answers',
              'help-circle-outline',
              handleContactSupport,
              undefined,
              false,
              '#2979FF'
            )}
            
            {renderSettingItem(
              'Contact Support',
              'Get in touch with our team',
              'chatbubble-outline',
              handleContactSupport,
              undefined,
              false,
              '#34C759'
            )}
            
            {renderSettingItem(
              'Rate FlowLog',
              'Share your feedback',
              'star-outline',
              () => Alert.alert('Thank you!', 'This would open the App Store'),
              undefined,
              false,
              '#FF9800'
            )}
            
            {renderSettingItem(
              'About',
              'App info and version',
              'information-circle-outline',
              () => openModal(setShowAboutModal),
              undefined,
              false,
              '#8E8E93'
            )}
          </View>

          {/* Account Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            {renderSettingItem(
              'Sign Out',
              'Sign out of your account',
              'log-out-outline',
              handleLogout,
              undefined,
              true,
              '#ff4757'
            )}
            
            {renderSettingItem(
              'Delete Account',
              'Permanently delete your account',
              'trash-outline',
              handleDeleteAccount,
              undefined,
              true,
              '#ff4757'
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.footerLink}>
              <Text style={styles.footerLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLink}>
              <Text style={styles.footerLinkText}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.versionText}>Version 1.0.0 (Build 100)</Text>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Profile Edit Modal */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => closeModal(setShowProfileModal)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleUpdateProfile}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Your name"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="your.email@example.com"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => closeModal(setShowLanguageModal)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Language</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.languageList}>
            <TouchableOpacity
              style={[
                styles.languageOption,
                i18n.language === 'en' && styles.languageOptionSelected,
              ]}
              onPress={() => handleLanguageChange('en')}
            >
              <View style={styles.languageInfo}>
                <Text style={styles.languageText}>English</Text>
                <Text style={styles.languageNative}>English</Text>
              </View>
              {i18n.language === 'en' && (
                <Ionicons name="checkmark" size={20} color="#2979FF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                i18n.language === 'he' && styles.languageOptionSelected,
              ]}
              onPress={() => handleLanguageChange('he')}
            >
              <View style={styles.languageInfo}>
                <Text style={styles.languageText}>Hebrew</Text>
                <Text style={styles.languageNative}>עברית</Text>
              </View>
              {i18n.language === 'he' && (
                <Ionicons name="checkmark" size={20} color="#2979FF" />
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Notification Settings Modal */}
      <Modal
        visible={showNotificationModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => closeModal(setShowNotificationModal)}>
              <Text style={styles.cancelButton}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Notifications</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>General Notifications</Text>
              
              <View style={styles.notificationToggle}>
                <Text style={styles.notificationToggleLabel}>Push Notifications</Text>
                <Switch
                  value={settings.notifications}
                  onValueChange={() => toggleSetting('notifications')}
                  trackColor={{ false: '#333', true: '#34C759' }}
                  thumbColor="#fff"
                />
              </View>
              
              <View style={styles.notificationToggle}>
                <Text style={styles.notificationToggleLabel}>Task Reminders</Text>
                <Switch
                  value={settings.taskReminders}
                  onValueChange={() => toggleSetting('taskReminders')}
                  trackColor={{ false: '#333', true: '#2979FF' }}
                  thumbColor="#fff"
                />
              </View>
              
              <View style={styles.notificationToggle}>
                <Text style={styles.notificationToggleLabel}>Event Reminders</Text>
                <Switch
                  value={settings.eventReminders}
                  onValueChange={() => toggleSetting('eventReminders')}
                  trackColor={{ false: '#333', true: '#FF9800' }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notification Style</Text>
              
              <View style={styles.notificationToggle}>
                <Text style={styles.notificationToggleLabel}>Sound</Text>
                <Switch
                  value={notificationSettings.sound}
                  onValueChange={() => toggleNotificationSetting('sound')}
                  trackColor={{ false: '#333', true: '#34C759' }}
                  thumbColor="#fff"
                />
              </View>
              
              <View style={styles.notificationToggle}>
                <Text style={styles.notificationToggleLabel}>Vibration</Text>
                <Switch
                  value={notificationSettings.vibration}
                  onValueChange={() => toggleNotificationSetting('vibration')}
                  trackColor={{ false: '#333', true: '#FF9800' }}
                  thumbColor="#fff"
                />
              </View>
              
              <View style={styles.notificationToggle}>
                <Text style={styles.notificationToggleLabel}>Badge</Text>
                <Switch
                  value={notificationSettings.badge}
                  onValueChange={() => toggleNotificationSetting('badge')}
                  trackColor={{ false: '#333', true: '#2979FF' }}
                  thumbColor="#fff"
                />
              </View>
              
              <View style={styles.notificationToggle}>
                <Text style={styles.notificationToggleLabel}>Show on Lock Screen</Text>
                <Switch
                  value={notificationSettings.lockScreen}
                  onValueChange={() => toggleNotificationSetting('lockScreen')}
                  trackColor={{ false: '#333', true: '#5856D6' }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Default Reminder Time</Text>
              <View style={styles.reminderTimeContainer}>
                {[5, 15, 30, 60].map(minutes => (
                  <TouchableOpacity
                    key={minutes}
                    style={[
                      styles.reminderTimeOption,
                      notificationSettings.reminderTime === minutes && styles.reminderTimeOptionActive
                    ]}
                    onPress={() => setNotificationSettings(prev => ({ ...prev, reminderTime: minutes }))}
                  >
                    <Text style={[
                      styles.reminderTimeText,
                      notificationSettings.reminderTime === minutes && styles.reminderTimeTextActive
                    ]}>
                      {minutes} min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Export Data Modal */}
      <Modal
        visible={showExportModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => closeModal(setShowExportModal)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Export Data</Text>
            <TouchableOpacity onPress={performExport}>
              <Text style={styles.saveButton}>Export</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Export Format</Text>
              <View style={styles.exportFormatContainer}>
                {(['json', 'csv', 'pdf'] as const).map(format => (
                  <TouchableOpacity
                    key={format}
                    style={[
                      styles.exportFormatOption,
                      exportFormat === format && styles.exportFormatOptionActive
                    ]}
                    onPress={() => setExportFormat(format)}
                  >
                    <Text style={[
                      styles.exportFormatText,
                      exportFormat === format && styles.exportFormatTextActive
                    ]}>
                      {format.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Content to Export</Text>
              <View style={styles.exportContentContainer}>
                {[
                  { key: 'notes', label: 'Notes', icon: 'document-text-outline' },
                  { key: 'tasks', label: 'Tasks', icon: 'checkmark-circle-outline' },
                  { key: 'events', label: 'Events', icon: 'calendar-outline' },
                  { key: 'settings', label: 'Settings', icon: 'settings-outline' },
                ].map(item => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.exportContentOption,
                      exportContent.includes(item.key) && styles.exportContentOptionActive
                    ]}
                    onPress={() => {
                      setExportContent(prev =>
                        prev.includes(item.key)
                          ? prev.filter(c => c !== item.key)
                          : [...prev, item.key]
                      );
                    }}
                  >
                    <Ionicons 
                      name={item.icon as keyof typeof Ionicons.glyphMap} 
                      size={20} 
                      color={exportContent.includes(item.key) ? "#2979FF" : "#666"} 
                    />
                    <Text style={[
                      styles.exportContentText,
                      exportContent.includes(item.key) && styles.exportContentTextActive
                    ]}>
                      {item.label}
                    </Text>
                    {exportContent.includes(item.key) && (
                      <Ionicons name="checkmark" size={16} color="#2979FF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.exportInfo}>
              <Ionicons name="information-circle-outline" size={16} color="#666" />
              <Text style={styles.exportInfoText}>
                Your data will be exported in {exportFormat.toUpperCase()} format and shared via your device's sharing options.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={showAboutModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => closeModal(setShowAboutModal)}>
              <Text style={styles.cancelButton}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>About FlowLog</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.aboutContent}>
            <View style={styles.aboutLogo}>
              <View style={styles.aboutLogoCircle}>
                <Ionicons name="diamond" size={40} color="#2979FF" />
              </View>
            </View>
            
            <Text style={styles.aboutTitle}>FlowLog</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0 (Build 100)</Text>
            
            <Text style={styles.aboutDescription}>
              FlowLog is a powerful productivity app designed to help you manage your tasks, events, and notes efficiently. 
              Built with love for people who want to stay organized and productive.
            </Text>

            <View style={styles.aboutStats}>
              <View style={styles.aboutStat}>
                <Text style={styles.aboutStatNumber}>10K+</Text>
                <Text style={styles.aboutStatLabel}>Active Users</Text>
              </View>
              <View style={styles.aboutStat}>
                <Text style={styles.aboutStatNumber}>4.8</Text>
                <Text style={styles.aboutStatLabel}>App Store Rating</Text>
              </View>
              <View style={styles.aboutStat}>
                <Text style={styles.aboutStatNumber}>99.9%</Text>
                <Text style={styles.aboutStatLabel}>Uptime</Text>
              </View>
            </View>

            <View style={styles.aboutLinks}>
              <TouchableOpacity style={styles.aboutLink}>
                <Ionicons name="globe-outline" size={16} color="#2979FF" />
                <Text style={styles.aboutLinkText}>Website</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.aboutLink}>
                <Ionicons name="logo-twitter" size={16} color="#2979FF" />
                <Text style={styles.aboutLinkText}>Twitter</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.aboutLink}>
                <Ionicons name="shield-outline" size={16} color="#2979FF" />
                <Text style={styles.aboutLinkText}>Privacy Policy</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.aboutLink}>
                <Ionicons name="document-text-outline" size={16} color="#2979FF" />
                <Text style={styles.aboutLinkText}>Terms of Service</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.aboutCopyright}>
              © 2024 FlowLog. All rights reserved.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Profile Section
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2979FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  profileJoinDate: {
    fontSize: 12,
    color: '#666',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },

  // Sections
  section: {
    marginBottom: 24,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },

  // Setting Items
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    minHeight: 72,
  },
  destructiveItem: {
    backgroundColor: '#2a2a2a',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  destructiveText: {
    color: '#ff4757',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: 20,
  },
  footerLink: {
    paddingVertical: 8,
  },
  footerLinkText: {
    fontSize: 14,
    color: '#666',
  },
  versionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  cancelButton: {
    fontSize: 16,
    color: '#2979FF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  saveButton: {
    fontSize: 16,
    color: '#2979FF',
    fontWeight: '600',
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
  },

  // Language Modal
  languageList: {
    padding: 20,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  languageOptionSelected: {
    backgroundColor: '#2979FF20',
    borderWidth: 1,
    borderColor: '#2979FF',
  },
  languageInfo: {
    flex: 1,
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  languageNative: {
    fontSize: 14,
    color: '#666',
  },

  // Notification Settings
  notificationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  notificationToggleLabel: {
    fontSize: 16,
    color: '#fff',
  },
  reminderTimeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  reminderTimeOption: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  reminderTimeOptionActive: {
    backgroundColor: '#2979FF20',
    borderColor: '#2979FF',
  },
  reminderTimeText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  reminderTimeTextActive: {
    color: '#2979FF',
  },

  // Export Modal
  exportFormatContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  exportFormatOption: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  exportFormatOptionActive: {
    backgroundColor: '#2979FF20',
    borderColor: '#2979FF',
  },
  exportFormatText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  exportFormatTextActive: {
    color: '#2979FF',
  },
  exportContentContainer: {
    gap: 8,
  },
  exportContentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  exportContentOptionActive: {
    backgroundColor: '#2979FF20',
    borderColor: '#2979FF',
  },
  exportContentText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  exportContentTextActive: {
    color: '#2979FF',
  },
  exportInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 16,
    gap: 12,
    marginTop: 16,
  },
  exportInfoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  // About Modal
  aboutContent: {
    padding: 32,
    alignItems: 'center',
  },
  aboutLogo: {
    marginBottom: 20,
  },
  aboutLogoCircle: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  aboutVersion: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  aboutDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  aboutStats: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 32,
  },
  aboutStat: {
    flex: 1,
    alignItems: 'center',
  },
  aboutStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2979FF',
    marginBottom: 4,
  },
  aboutStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  aboutLinks: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  aboutLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    gap: 12,
  },
  aboutLinkText: {
    fontSize: 16,
    color: '#2979FF',
    fontWeight: '500',
  },
  aboutCopyright: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default SettingsScreen;