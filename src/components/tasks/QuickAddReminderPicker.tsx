// src/components/tasks/QuickAddReminderPicker.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const { height } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  selectedTime: Date | null;
  onDateSelect: (date: Date | null) => void;
  onTimeSelect: (time: Date | null) => void;
}

const QuickAddReminderPicker: React.FC<Props> = ({
  visible,
  onClose,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const quickReminderOptions = [
    {
      id: 'task_time',
      label: 'At time of task',
      description: 'Remind me when the task is due',
      icon: 'alarm-outline',
      available: false,
    },
    {
      id: '15_min',
      label: '15 minutes before',
      description: 'Quick reminder before due time',
      icon: 'time-outline',
      available: false,
    },
    {
      id: '1_hour',
      label: '1 hour before',
      description: 'Give me time to prepare',
      icon: 'hourglass-outline',
      available: false,
    },
    {
      id: '1_day',
      label: '1 day before',
      description: 'Plan ahead reminder',
      icon: 'calendar-outline',
      available: false,
    },
    {
      id: 'custom',
      label: 'Custom time',
      description: 'Set your own reminder time',
      icon: 'settings-outline',
      available: true,
    },
  ];

  const handleQuickReminderSelect = (optionId: string) => {
    if (optionId !== 'custom') {
      setShowUpgradeModal(true);
      return;
    }
    
    // For custom, set current time as default
    const now = new Date();
    onDateSelect(now);
    onTimeSelect(now);
  };

  const handleDatePickerChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      onDateSelect(date);
    }
  };

  const handleTimePickerChange = (event: any, time?: Date) => {
    setShowTimePicker(false);
    if (time) {
      onTimeSelect(time);
    }
  };

  const formatDateTime = (date: Date, time: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dateStr = '';
    if (date.toDateString() === today.toDateString()) {
      dateStr = 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateStr = 'Tomorrow';
    } else {
      dateStr = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }

    const timeStr = time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return `${dateStr} at ${timeStr}`;
  };

  const clearReminder = () => {
    onDateSelect(null);
    onTimeSelect(null);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Reminders</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.saveButton}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Current Reminder Display */}
            {selectedDate && selectedTime && (
              <View style={styles.currentReminderContainer}>
                <View style={styles.currentReminderHeader}>
                  <Ionicons name="alarm" size={20} color="#DC4C3E" />
                  <Text style={styles.currentReminderTitle}>Current Reminder</Text>
                </View>
                <Text style={styles.currentReminderText}>
                  {formatDateTime(selectedDate, selectedTime)}
                </Text>
                <TouchableOpacity
                  style={styles.clearReminderButton}
                  onPress={clearReminder}
                >
                  <Text style={styles.clearReminderText}>Clear reminder</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Upgrade Notice */}
            <View style={styles.upgradeNotice}>
              <Ionicons name="information-circle" size={20} color="#FF6B35" />
              <View style={styles.upgradeNoticeContent}>
                <Text style={styles.upgradeNoticeTitle}>Need more reminders?</Text>
                <Text style={styles.upgradeNoticeText}>
                  Upgrade to access a variety of other types of reminders.
                </Text>
              </View>
            </View>

            {/* Suggestions */}
            <View style={styles.suggestionsSection}>
              <Text style={styles.sectionTitle}>Suggestions</Text>
              
              {quickReminderOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.suggestionOption,
                    !option.available && styles.suggestionOptionDisabled,
                  ]}
                  onPress={() => handleQuickReminderSelect(option.id)}
                  disabled={!option.available}
                >
                  <View style={styles.suggestionLeft}>
                    <View style={[
                      styles.suggestionIcon,
                      !option.available && styles.suggestionIconDisabled,
                    ]}>
                      <Ionicons 
                        name={option.icon as any} 
                        size={20} 
                        color={option.available ? "#DC4C3E" : "#666"} 
                      />
                    </View>
                    <View style={styles.suggestionInfo}>
                      <Text style={[
                        styles.suggestionLabel,
                        !option.available && styles.suggestionLabelDisabled,
                      ]}>
                        {option.label}
                      </Text>
                      <Text style={styles.suggestionDescription}>
                        {option.description}
                      </Text>
                    </View>
                  </View>
                  
                  {!option.available && (
                    <View style={styles.lockIcon}>
                      <Ionicons name="lock-closed" size={16} color="#666" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Reminder Setup */}
            {selectedDate && selectedTime && (
              <View style={styles.customReminderSection}>
                <Text style={styles.sectionTitle}>Custom Reminder</Text>
                
                <TouchableOpacity
                  style={styles.customOption}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar" size={20} color="#2979FF" />
                  <Text style={styles.customOptionText}>
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.customOption}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time" size={20} color="#2979FF" />
                  <Text style={styles.customOptionText}>
                    {selectedTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            )}

            {/* First Time Setup */}
            {!selectedDate && !selectedTime && (
              <View style={styles.firstTimeSetup}>
                <Ionicons name="alarm-outline" size={48} color="#666" />
                <Text style={styles.firstTimeTitle}>Set Your First Reminder</Text>
                <Text style={styles.firstTimeDescription}>
                  Add a day and time to the task first.
                </Text>
                <TouchableOpacity
                  style={styles.setupButton}
                  onPress={() => {
                    const now = new Date();
                    onDateSelect(now);
                    onTimeSelect(now);
                  }}
                >
                  <Text style={styles.setupButtonText}>Set reminder time</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Tips */}
            <View style={styles.tipsSection}>
              <Text style={styles.tipsTitle}>💡 Tips</Text>
              <Text style={styles.tipText}>
                • Reminders work best when you have notifications enabled
              </Text>
              <Text style={styles.tipText}>
                • Set reminders 15-30 minutes before your due time for best results
              </Text>
              <Text style={styles.tipText}>
                • You can have multiple reminders with Todoist Pro
              </Text>
            </View>
          </ScrollView>

          {/* Date/Time Pickers */}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDatePickerChange}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={selectedTime || new Date()}
              mode="time"
              display="default"
              onChange={handleTimePickerChange}
            />
          )}

          {/* Upgrade Modal */}
          <Modal
            visible={showUpgradeModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowUpgradeModal(false)}
          >
            <View style={styles.upgradeModalOverlay}>
              <View style={styles.upgradeModalContainer}>
                <View style={styles.upgradeModalHeader}>
                  <Ionicons name="star" size={32} color="#FF6B35" />
                  <Text style={styles.upgradeModalTitle}>Upgrade to Pro</Text>
                </View>
                
                <Text style={styles.upgradeModalText}>
                  Get access to advanced reminder options including:
                </Text>
                
                <View style={styles.upgradeFeatures}>
                  <View style={styles.upgradeFeature}>
                    <Ionicons name="checkmark" size={16} color="#4CAF50" />
                    <Text style={styles.upgradeFeatureText}>Multiple reminders per task</Text>
                  </View>
                  <View style={styles.upgradeFeature}>
                    <Ionicons name="checkmark" size={16} color="#4CAF50" />
                    <Text style={styles.upgradeFeatureText}>Location-based reminders</Text>
                  </View>
                  <View style={styles.upgradeFeature}>
                    <Ionicons name="checkmark" size={16} color="#4CAF50" />
                    <Text style={styles.upgradeFeatureText}>Smart reminder suggestions</Text>
                  </View>
                </View>
                
                <View style={styles.upgradeModalButtons}>
                  <TouchableOpacity
                    style={styles.upgradeModalCancel}
                    onPress={() => setShowUpgradeModal(false)}
                  >
                    <Text style={styles.upgradeModalCancelText}>Maybe Later</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.upgradeModalConfirm}
                    onPress={() => {
                      setShowUpgradeModal(false);
                      Alert.alert('Upgrade', 'This would open the upgrade screen');
                    }}
                  >
                    <Text style={styles.upgradeModalConfirmText}>Upgrade Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    fontSize: 16,
    color: '#DC4C3E',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  currentReminderContainer: {
    backgroundColor: '#DC4C3E20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DC4C3E30',
  },
  currentReminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  currentReminderTitle: {
    fontSize: 14,
    color: '#DC4C3E',
    fontWeight: '600',
  },
  currentReminderText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 12,
  },
  clearReminderButton: {
    alignSelf: 'flex-start',
  },
  clearReminderText: {
    fontSize: 14,
    color: '#DC4C3E',
    fontWeight: '500',
  },
  upgradeNotice: {
    flexDirection: 'row',
    backgroundColor: '#FF6B3520',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FF6B3530',
  },
  upgradeNoticeContent: {
    flex: 1,
  },
  upgradeNoticeTitle: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
    marginBottom: 4,
  },
  upgradeNoticeText: {
    fontSize: 12,
    color: '#FF6B35',
    opacity: 0.8,
  },
  suggestionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    marginBottom: 8,
  },
  suggestionOptionDisabled: {
    opacity: 0.6,
  },
  suggestionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DC4C3E20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionIconDisabled: {
    backgroundColor: '#333',
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 2,
  },
  suggestionLabelDisabled: {
    color: '#666',
  },
  suggestionDescription: {
    fontSize: 12,
    color: '#666',
  },
  lockIcon: {
    marginLeft: 12,
  },
  customReminderSection: {
    marginBottom: 24,
  },
  customOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  customOptionText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    flex: 1,
  },
  firstTimeSetup: {
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 24,
  },
  firstTimeTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  firstTimeDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  setupButton: {
    backgroundColor: '#DC4C3E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  setupButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  tipsSection: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
  },
  tipsTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  upgradeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  upgradeModalContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  upgradeModalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  upgradeModalTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    marginTop: 8,
  },
  upgradeModalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  upgradeFeatures: {
    marginBottom: 24,
  },
  upgradeFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  upgradeFeatureText: {
    fontSize: 14,
    color: '#fff',
  },
  upgradeModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  upgradeModalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
  },
  upgradeModalCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  upgradeModalConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
  },
  upgradeModalConfirmText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default QuickAddReminderPicker;