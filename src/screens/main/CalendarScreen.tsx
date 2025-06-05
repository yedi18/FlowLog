// src/screens/main/CalendarScreen.tsx
// מסך לוח שנה מפושט כמו בתמונות

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  Platform,
  Animated,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  category: 'work' | 'personal' | 'health' | 'shopping';
  allDay?: boolean;
}

type ViewMode = 'month' | 'week' | 'day';

const CalendarScreen: React.FC = () => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isAllDay, setIsAllDay] = useState(false);
  const [eventCategory, setEventCategory] = useState<'work' | 'personal' | 'health' | 'shopping'>('work');

  // Animation values
  const slideAnim = new Animated.Value(300);
  const fadeAnim = new Animated.Value(1);

  // Week days
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  useEffect(() => {
    // Mock events
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Project meeting',
        startTime: new Date(2024, 3, 24, 8, 0),
        endTime: new Date(2024, 3, 24, 9, 0),
        category: 'work',
      },
      {
        id: '2',
        title: 'Doctor\'s appointment',
        startTime: new Date(2024, 3, 24, 11, 0),
        endTime: new Date(2024, 3, 24, 12, 0),
        category: 'health',
      },
      {
        id: '3',
        title: 'Lunch with Sarah',
        startTime: new Date(2024, 3, 24, 13, 0),
        endTime: new Date(2024, 3, 24, 14, 0),
        category: 'personal',
      },
      {
        id: '4',
        title: 'Conference call',
        startTime: new Date(2024, 3, 24, 15, 0),
        endTime: new Date(2024, 3, 24, 16, 0),
        category: 'work',
      },
    ];
    setEvents(mockEvents);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Generate calendar days for month view
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const formatMonth = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const resetForm = () => {
    setEditingEvent(null);
    setEventTitle('');
    setEventDescription('');
    setEventLocation('');
    setStartDate(new Date());
    setEndDate(new Date());
    setIsAllDay(false);
    setEventCategory('work');
  };

  const handleSaveEvent = () => {
    if (!eventTitle.trim()) {
      Alert.alert('Error', 'Event title is required');
      return;
    }

    const eventData = {
      title: eventTitle.trim(),
      description: eventDescription.trim() || undefined,
      location: eventLocation.trim() || undefined,
      startTime: startDate,
      endTime: endDate,
      category: eventCategory,
      allDay: isAllDay,
    };

    if (editingEvent) {
      setEvents(prev =>
        prev.map(ev => (ev.id === editingEvent.id ? { ...ev, ...eventData } : ev))
      );
    } else {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        ...eventData,
      };
      setEvents(prev => [...prev, newEvent]);
    }

    closeModal();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowAddModal(false);
      resetForm();
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setEvents(prev => prev.filter(e => e.id !== eventId)),
        },
      ]
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get events for selected date
  const selectedDateEvents = events.filter(event => {
    const eventDate = new Date(event.startTime);
    eventDate.setHours(0, 0, 0, 0);
    const selectedDateOnly = new Date(selectedDate);
    selectedDateOnly.setHours(0, 0, 0, 0);
    return eventDate.getTime() === selectedDateOnly.getTime();
  });

  const renderMonthView = () => (
    <View style={styles.monthContainer}>
      {/* Week header */}
      <View style={styles.weekHeader}>
        {weekDays.map(day => (
          <Text key={day} style={styles.weekDayText}>{day}</Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = day.getTime() === today.getTime();
          const isSelected = day.getTime() === selectedDate.getTime();

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                isSelected && styles.selectedDay,
                isToday && styles.todayCell,
              ]}
              onPress={() => setSelectedDate(new Date(day))}
            >
              <Text style={[
                styles.dayText,
                !isCurrentMonth && styles.otherMonthText,
                isToday && styles.todayText,
                isSelected && styles.selectedDayText,
              ]}>
                {day.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected date events */}
      {selectedDateEvents.length > 0 && (
        <View style={styles.eventsSection}>
          <Text style={styles.eventsTitle}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          {selectedDateEvents.map(event => (
            <View key={event.id} style={styles.eventItem}>
              <Text style={styles.eventTime}>
                {formatTime(event.startTime)}
              </Text>
              <Text style={styles.eventTitle}>{event.title}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderWeekView = () => (
    <View style={styles.weekContainer}>
      {/* Week header with dates */}
      <View style={styles.weekHeaderWithDates}>
        {Array.from({ length: 7 }, (_, i) => {
          const date = new Date(selectedDate);
          date.setDate(date.getDate() - date.getDay() + i);
          const isToday = date.getTime() === today.getTime();
          
          return (
            <View key={i} style={styles.weekDayColumn}>
              <Text style={styles.weekDayName}>{weekDays[i]}</Text>
              <Text style={[styles.weekDayNumber, isToday && styles.todayNumber]}>
                {date.getDate()}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Time slots */}
      <ScrollView style={styles.timeSlots}>
        {Array.from({ length: 24 }, (_, hour) => (
          <View key={hour} style={styles.timeSlot}>
            <Text style={styles.timeLabel}>
              {hour.toString().padStart(2, '0')}:00
            </Text>
            <View style={styles.timeSlotContent}>
              {/* Events would be positioned here */}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigateMonth('prev')}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.monthTitle}>{formatMonth()}</Text>
          
          <TouchableOpacity onPress={() => navigateMonth('next')}>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* View Mode Selector */}
        <View style={styles.viewSelector}>
          {(['month', 'week'] as ViewMode[]).map(mode => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.viewTab,
                viewMode === mode && styles.activeViewTab
              ]}
              onPress={() => setViewMode(mode)}
            >
              <Text style={[
                styles.viewTabText,
                viewMode === mode && styles.activeViewTabText
              ]}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Calendar Content */}
        <ScrollView style={styles.calendarContent} showsVerticalScrollIndicator={false}>
          {viewMode === 'month' ? renderMonthView() : renderWeekView()}
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity style={styles.fab} onPress={openAddModal}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Add Event Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Event</Text>
            <TouchableOpacity onPress={handleSaveEvent}>
              <Text style={styles.saveButton}>Add</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.textInput}
                value={eventTitle}
                onChangeText={setEventTitle}
                placeholder="Event title"
                placeholderTextColor="#666"
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date</Text>
              <Text style={styles.dateText}>
                {startDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Time</Text>
              <TouchableOpacity style={styles.timeButton}>
                <Text style={styles.timeButtonText}>
                  {formatTime(startDate)}
                </Text>
                <View style={styles.timePickerIcon}>
                  <Ionicons name="time-outline" size={20} color="#007AFF" />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Label</Text>
              <View style={styles.categoryContainer}>
                {['work', 'personal', 'health'].map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      eventCategory === category && styles.categoryOptionActive
                    ]}
                    onPress={() => setEventCategory(category as any)}
                  >
                    <Text style={[
                      styles.categoryLabel,
                      eventCategory === category && styles.categoryLabelActive
                    ]}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
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
    paddingVertical: 16,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },

  // View Selector
  viewSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 4,
  },
  viewTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeViewTab: {
    backgroundColor: '#007AFF',
  },
  viewTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeViewTabText: {
    color: '#fff',
  },

  // Calendar Content
  calendarContent: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Month View
  monthContainer: {
    flex: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedDay: {
    backgroundColor: '#007AFF',
  },
  todayCell: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  dayText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  otherMonthText: {
    color: '#333',
  },
  todayText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Events Section
  eventsSection: {
    marginTop: 20,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  eventTime: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    minWidth: 60,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },

  // Week View
  weekContainer: {
    flex: 1,
  },
  weekHeaderWithDates: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  weekDayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  weekDayNumber: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  todayNumber: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  timeSlots: {
    flex: 1,
  },
  timeSlot: {
    flexDirection: 'row',
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  timeLabel: {
    width: 60,
    fontSize: 12,
    color: '#666',
    paddingTop: 4,
  },
  timeSlotContent: {
    flex: 1,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
  saveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
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
  dateText: {
    fontSize: 16,
    color: '#fff',
    paddingVertical: 12,
  },
  timeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  timeButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  timePickerIcon: {
    padding: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#333',
  },
  categoryOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryLabel: {
    fontSize: 14,
    color: '#fff',
  },
  categoryLabelActive: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default CalendarScreen;