// src/screens/main/SettingsScreen.tsx
// מסך הגדרות מעוצב בהתאם לתמונות עם עיצוב פשוט וחלק

import React, { useState } from 'react';
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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  
  const [settings, setSettings] = useState({
    notifications: true,
    taskReminders: true,
    eventReminders: true,
    emailUpdates: false,
    faceId: false,
    autoBackup: true,
  });

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            console.log('Logout pressed');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Info', 'Feature coming soon');
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
    try {
      await Share.share({
        title: 'Export Data',
        message: 'Your FlowLog data export',
      });
    } catch (error) {
      console.error('Error sharing data:', error);
    }
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderSettingItem = (
    title: string,
    icon: keyof typeof Ionicons.glyphMap,
    onPress?: () => void,
    rightElement?: React.ReactNode,
    destructive?: boolean
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, destructive && styles.destructiveItem]}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={styles.settingLeft}>
        <Ionicons 
          name={icon} 
          size={20} 
          color={destructive ? "#ff4757" : "#fff"} 
          style={styles.settingIcon}
        />
        <Text style={[
          styles.settingTitle,
          destructive && styles.destructiveText
        ]}>
          {title}
        </Text>
      </View>
      
      {rightElement || (
        <Ionicons name="chevron-forward" size={16} color="#666" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>Y</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Yedid</Text>
            <Text style={styles.profileEmail}>yedidyamcs@gmail.com</Text>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          {renderSettingItem(
            'Edit Profile',
            'person-outline',
            () => Alert.alert('Info', 'Feature coming soon')
          )}
          
          {renderSettingItem(
            'Language',
            'language-outline',
            () => setShowLanguageModal(true)
          )}
          
          {renderSettingItem(
            'Notifications',
            'notifications-outline',
            undefined,
            <Switch
              value={settings.notifications}
              onValueChange={() => toggleSetting('notifications')}
              trackColor={{ false: '#333', true: '#007AFF' }}
              thumbColor="#fff"
            />
          )}
          
          {renderSettingItem(
            'Task Reminders',
            'alarm-outline',
            undefined,
            <Switch
              value={settings.taskReminders}
              onValueChange={() => toggleSetting('taskReminders')}
              trackColor={{ false: '#333', true: '#007AFF' }}
              thumbColor="#fff"
            />
          )}
          
          {renderSettingItem(
            'Event Reminders',
            'calendar-outline',
            undefined,
            <Switch
              value={settings.eventReminders}
              onValueChange={() => toggleSetting('eventReminders')}
              trackColor={{ false: '#333', true: '#007AFF' }}
              thumbColor="#fff"
            />
          )}
          
          {renderSettingItem(
            'Auto Backup',
            'cloud-upload-outline',
            undefined,
            <Switch
              value={settings.autoBackup}
              onValueChange={() => toggleSetting('autoBackup')}
              trackColor={{ false: '#333', true: '#007AFF' }}
              thumbColor="#fff"
            />
          )}
        </View>

        {/* Support */}
        <View style={styles.section}>
          {renderSettingItem(
            'Export Data',
            'download-outline',
            handleExportData
          )}
          
          {renderSettingItem(
            'Help & FAQ',
            'help-circle-outline',
            () => Alert.alert('Help', 'Feature coming soon')
          )}
          
          {renderSettingItem(
            'About FlowLog',
            'information-circle-outline',
            () => setShowAboutModal(true)
          )}
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          {renderSettingItem(
            'Sign Out',
            'log-out-outline',
            handleLogout,
            undefined,
            true
          )}
          
          {renderSettingItem(
            'Delete Account',
            'trash-outline',
            handleDeleteAccount,
            undefined,
            true
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
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
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
              <Text style={styles.languageText}>English</Text>
              {i18n.language === 'en' && (
                <Ionicons name="checkmark" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                i18n.language === 'he' && styles.languageOptionSelected,
              ]}
              onPress={() => handleLanguageChange('he')}
            >
              <Text style={styles.languageText}>עברית</Text>
              {i18n.language === 'he' && (
                <Ionicons name="checkmark" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
          </View>
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
            <TouchableOpacity onPress={() => setShowAboutModal(false)}>
              <Text style={styles.cancelButton}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>About FlowLog</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.aboutContent}>
            <View style={styles.aboutLogo}>
              <Ionicons name="diamond" size={40} color="#007AFF" />
            </View>
            <Text style={styles.aboutTitle}>FlowLog</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          </View>
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

  // Profile
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Sections
  section: {
    marginBottom: 20,
    marginHorizontal: 20,
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
  },
  destructiveItem: {
    backgroundColor: '#2a2a2a',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  destructiveText: {
    color: '#ff4757',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
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
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
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
    backgroundColor: '#007AFF20',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  languageText: {
    fontSize: 16,
    color: '#fff',
  },

  // About Modal
  aboutContent: {
    alignItems: 'center',
    padding: 40,
  },
  aboutLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  aboutVersion: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
});

export default SettingsScreen;
