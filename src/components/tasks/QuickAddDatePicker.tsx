// src/components/tasks/QuickAddDatePicker.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  selectedTime: Date | null;
  onDateSelect: (date: Date | null) => void;
  onTimeSelect: (time: Date | null) => void;
}

const QuickAddDatePicker: React.FC<Props> = ({
  visible,
  onClose,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const thisWeekend = new Date(today);
  thisWeekend.setDate(today.getDate() + (6 - today.getDay())); // Saturday
  
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const quickOptions = [
    {
      id: 'today',
      label: 'Today',
      date: today,
      icon: 'today-outline',
      color: '#4CAF50',
    },
    {
      id: 'tomorrow',
      label: 'Tomorrow',
      date: tomorrow,
      icon: 'sunny-outline',
      color: '#FF9800',
    },
    {
      id: 'weekend',
      label: 'This weekend',
      date: thisWeekend,
      icon: 'calendar-outline',
      color: '#9C27B0',
    },
    {
      id: 'nextweek',
      label: 'Next week',
      date: nextWeek,
      icon: 'arrow-forward-outline',
      color: '#2196F3',
    },
    {
      id: 'nodate',
      label: 'No date',
      date: null,
      icon: 'close-outline',
      color: '#666',
    },
  ];

  const handleQuickSelect = (option: typeof quickOptions[0]) => {
    onDateSelect(option.date);
    if (option.date) {
      // Set default time if no time is selected
      if (!selectedTime) {
        const defaultTime = new Date();
        defaultTime.setHours(9, 0, 0, 0); // 9:00 AM default
        onTimeSelect(defaultTime);
      }
    } else {
      onTimeSelect(null);
    }
    onClose();
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

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const currentDate = selectedDate || new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    const today = new Date();
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            isToday && styles.calendarDayToday,
            isSelected && styles.calendarDaySelected,
          ]}
          onPress={() => {
            onDateSelect(date);
            if (!selectedTime) {
              const defaultTime = new Date();
              defaultTime.setHours(9, 0, 0, 0);
              onTimeSelect(defaultTime);
            }
          }}
        >
          <Text style={[
            styles.calendarDayText,
            isToday && styles.calendarDayTextToday,
            isSelected && styles.calendarDayTextSelected,
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return days;
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
            <Text style={styles.title}>Date</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Selected Date Display */}
            {selectedDate && (
              <View style={styles.selectedDateContainer}>
                <Text style={styles.selectedDateText}>
                  {formatDate(selectedDate)}
                </Text>
                {selectedTime && (
                  <Text style={styles.selectedTimeText}>
                    {formatTime(selectedTime)}
                  </Text>
                )}
              </View>
            )}

            {/* Quick Options */}
            <View style={styles.quickOptions}>
              {quickOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.quickOption,
                    selectedDate?.toDateString() === option.date?.toDateString() && styles.quickOptionSelected
                  ]}
                  onPress={() => handleQuickSelect(option)}
                >
                  <View style={styles.quickOptionLeft}>
                    <Ionicons 
                      name={option.icon as any} 
                      size={20} 
                      color={option.color} 
                    />
                    <Text style={styles.quickOptionText}>{option.label}</Text>
                  </View>
                  <Text style={styles.quickOptionDate}>
                    {option.date ? formatDate(option.date) : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Date Picker */}
            <View style={styles.customDateSection}>
              <TouchableOpacity
                style={styles.customDateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color="#2979FF" />
                <Text style={styles.customDateText}>
                  {selectedDate ? formatDate(selectedDate) : 'Pick a date'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Calendar View */}
            {selectedDate && (
              <View style={styles.calendarContainer}>
                <View style={styles.calendarHeader}>
                  <Text style={styles.calendarMonth}>
                    {selectedDate.toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </Text>
                </View>
                
                <View style={styles.calendarWeekdays}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <View key={index} style={styles.calendarWeekday}>
                      <Text style={styles.calendarWeekdayText}>{day}</Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.calendarDays}>
                  {renderCalendar()}
                </View>
              </View>
            )}

            {/* Time Picker */}
            {selectedDate && (
              <View style={styles.timeSection}>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time" size={20} color="#2979FF" />
                  <Text style={styles.timeText}>Add time</Text>
                </TouchableOpacity>
                
                {selectedTime && (
                  <View style={styles.selectedTimeContainer}>
                    <Text style={styles.selectedTimeDisplay}>
                      {formatTime(selectedTime)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => onTimeSelect(null)}
                      style={styles.removeTimeButton}
                    >
                      <Ionicons name="close" size={16} color="#666" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Date Picker Modal */}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDatePickerChange}
            />
          )}

          {/* Time Picker Modal */}
          {showTimePicker && (
            <DateTimePicker
              value={selectedTime || new Date()}
              mode="time"
              display="default"
              onChange={handleTimePickerChange}
            />
          )}
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
  selectedDateContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  selectedDateText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  selectedTimeText: {
    fontSize: 16,
    color: '#DC4C3E',
    fontWeight: '500',
  },
  quickOptions: {
    marginBottom: 24,
  },
  quickOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    marginBottom: 8,
  },
  quickOptionSelected: {
    backgroundColor: '#DC4C3E20',
    borderWidth: 1,
    borderColor: '#DC4C3E',
  },
  quickOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickOptionText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  quickOptionDate: {
    fontSize: 14,
    color: '#666',
  },
  customDateSection: {
    marginBottom: 24,
  },
  customDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    gap: 12,
  },
  customDateText: {
    fontSize: 16,
    color: '#2979FF',
    fontWeight: '500',
  },
  calendarContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  calendarHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarMonth: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  calendarWeekdays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarWeekday: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  calendarWeekdayText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  calendarDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: `${100/7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  calendarDayToday: {
    backgroundColor: '#333',
  },
  calendarDaySelected: {
    backgroundColor: '#DC4C3E',
  },
  calendarDayText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  calendarDayTextToday: {
    color: '#2979FF',
    fontWeight: '600',
  },
  calendarDayTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  timeSection: {
    marginBottom: 24,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    gap: 12,
  },
  timeText: {
    fontSize: 16,
    color: '#2979FF',
    fontWeight: '500',
  },
  selectedTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#DC4C3E20',
    borderRadius: 8,
    marginTop: 8,
  },
  selectedTimeDisplay: {
    fontSize: 16,
    color: '#DC4C3E',
    fontWeight: '600',
  },
  removeTimeButton: {
    padding: 4,
  },
});

export default QuickAddDatePicker;