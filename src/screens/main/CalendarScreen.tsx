// src/screens/main/CalendarScreen.tsx
// Calendar screen with clean, organized structure

import React, { useState, useEffect, useCallback } from 'react';
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
  Dimensions,
  RefreshControl,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// ========================================================================================
// TYPES & INTERFACES
// ========================================================================================

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  category: 'work' | 'personal' | 'health' | 'shopping';
  allDay?: boolean;
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
  color?: string;
}

type ViewMode = 'month' | 'week' | 'day' | 'agenda';

// ========================================================================================
// CONSTANTS
// ========================================================================================

const categoryColors = {
  work: '#2979FF',
  personal: '#4CAF50',
  health: '#FF5722',
  shopping: '#FF9800',
};

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// ========================================================================================
// MOCK DATA
// ========================================================================================

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    description: 'Weekly team standup',
    location: 'Conference Room A',
    startTime: new Date(2024, 3, 24, 9, 0),
    endTime: new Date(2024, 3, 24, 10, 0),
    category: 'work',
    recurring: 'weekly',
  },
  {
    id: '2',
    title: 'Doctor Appointment',
    description: 'Annual checkup',
    location: 'Medical Center',
    startTime: new Date(2024, 3, 24, 14, 0),
    endTime: new Date(2024, 3, 24, 15, 0),
    category: 'health',
  },
  {
    id: '3',
    title: 'Lunch with Sarah',
    location: 'Downtown Cafe',
    startTime: new Date(2024, 3, 24, 12, 30),
    endTime: new Date(2024, 3, 24, 14, 0),
    category: 'personal',
  },
  {
    id: '4',
    title: 'Project Deadline',
    description: 'Q4 financial report',
    startTime: new Date(2024, 3, 25, 0, 0),
    endTime: new Date(2024, 3, 25, 23, 59),
    category: 'work',
    allDay: true,
  },
  {
    id: '5',
    title: 'Gym Session',
    location: 'Fitness Center',
    startTime: new Date(2024, 3, 26, 18, 0),
    endTime: new Date(2024, 3, 26, 19, 30),
    category: 'health',
    recurring: 'weekly',
  },
];

// ========================================================================================
// MAIN COMPONENT
// ========================================================================================

const CalendarScreen: React.FC = () => {
  const { t } = useTranslation();

  // ========================================================================================
  // STATE
  // ========================================================================================

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
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
  const [recurring, setRecurring] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');

  // Date picker state
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Animation
  const fadeAnim = new Animated.Value(1);

  // ========================================================================================
  // EFFECTS
  // ========================================================================================

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setCurrentDate(new Date());
    }, [])
  );

  // ========================================================================================
  // HELPER FUNCTIONS
  // ========================================================================================

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatMonth = () => {
    return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  const getEventsForDate = (date: Date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === targetDate.getTime();
    });
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
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

  // ========================================================================================
  // EVENT HANDLERS
  // ========================================================================================

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'agenda':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    setCurrentDate(newDate);
  };

  const openAddModal = (date?: Date) => {
    resetForm();
    if (date) {
      setStartDate(date);
      setEndDate(new Date(date.getTime() + 60 * 60 * 1000));
      setSelectedDate(date);
    }
    setShowAddModal(true);
  };

  const openEditModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventTitle(event.title);
    setEventDescription(event.description || '');
    setEventLocation(event.location || '');
    setStartDate(event.startTime);
    setEndDate(event.endTime);
    setIsAllDay(event.allDay || false);
    setEventCategory(event.category);
    setRecurring(event.recurring || 'none');
    setShowAddModal(true);
  };

  const resetForm = () => {
    setEditingEvent(null);
    setEventTitle('');
    setEventDescription('');
    setEventLocation('');
    setStartDate(selectedDate || new Date());
    setEndDate(new Date((selectedDate || new Date()).getTime() + 60 * 60 * 1000));
    setIsAllDay(false);
    setEventCategory('work');
    setRecurring('none');
  };

  const handleSaveEvent = () => {
    if (!eventTitle.trim()) {
      Alert.alert('Error', 'Event title is required');
      return;
    }

    if (endDate <= startDate) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    const eventData: Partial<CalendarEvent> = {
      title: eventTitle.trim(),
      description: eventDescription.trim() || undefined,
      location: eventLocation.trim() || undefined,
      startTime: startDate,
      endTime: endDate,
      category: eventCategory,
      allDay: isAllDay,
      recurring: recurring,
    };

    if (editingEvent) {
      setEvents(prev => prev.map(event =>
        event.id === editingEvent.id ? { ...event, ...eventData } : event
      ));
      Alert.alert('Success', 'Event updated successfully');
    } else {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        ...eventData,
      } as CalendarEvent;
      setEvents(prev => [...prev, newEvent]);
      Alert.alert('Success', 'Event created successfully');
    }

    setShowAddModal(false);
    resetForm();
  };

  const handleDeleteEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event?.title}"?`,
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

  const getViewTitle = () => {
    switch (viewMode) {
      case 'month':
        return formatMonth();
      case 'week':
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${months[startOfWeek.getMonth()]}`;
      case 'day':
        return formatDate(currentDate);
      case 'agenda':
        return 'Upcoming Events';
      default:
        return formatMonth();
    }
  };

  // ========================================================================================
  // RENDER FUNCTIONS
  // ========================================================================================

  const renderMonthView = () => {
    const calendarDays = generateCalendarDays();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
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
            const dayEvents = getEventsForDate(day);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  isSelected && styles.selectedDay,
                  isToday && styles.todayCell,
                ]}
                onPress={() => setSelectedDate(new Date(day))}
                onLongPress={() => openAddModal(day)}
              >
                <Text style={[
                  styles.dayText,
                  !isCurrentMonth && styles.otherMonthText,
                  isToday && styles.todayText,
                  isSelected && styles.selectedDayText,
                ]}>
                  {day.getDate()}
                </Text>
                
                {/* Event indicators */}
                {dayEvents.length > 0 && (
                  <View style={styles.eventIndicators}>
                    {dayEvents.slice(0, 3).map((event, i) => (
                      <View
                        key={event.id}
                        style={[
                          styles.eventDot,
                          { backgroundColor: categoryColors[event.category] }
                        ]}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <Text style={styles.moreEventsText}>+{dayEvents.length - 3}</Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected date events */}
        {getEventsForDate(selectedDate).length > 0 && (
          <View style={styles.eventsSection}>
            <Text style={styles.eventsSectionTitle}>
              {formatDate(selectedDate)}
            </Text>
            <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
              {getEventsForDate(selectedDate).map(event => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventItem}
                  onPress={() => openEditModal(event)}
                >
                  <View style={[
                    styles.eventColorBar,
                    { backgroundColor: categoryColors[event.category] }
                  ]} />
                  <View style={styles.eventContent}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventTime}>
                      {event.allDay ? 'All Day' : `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`}
                    </Text>
                    {event.location && (
                      <View style={styles.eventLocationContainer}>
                        <Ionicons name="location-outline" size={12} color="#666" />
                        <Text style={styles.eventLocation}>{event.location}</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteEvent(event.id)}
                    style={styles.deleteEventButton}
                  >
                    <Ionicons name="trash-outline" size={16} color="#ff4757" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      return date;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <View style={styles.weekContainer}>
        {/* Week header with dates */}
        <View style={styles.weekHeaderWithDates}>
          {weekDates.map((date, i) => {
            const isToday = date.getTime() === today.getTime();
            const dayEvents = getEventsForDate(date);
            
            return (
              <TouchableOpacity
                key={i}
                style={[styles.weekDayColumn, isToday && styles.todayColumn]}
                onPress={() => setSelectedDate(date)}
                onLongPress={() => openAddModal(date)}
              >
                <Text style={styles.weekDayName}>{weekDays[i]}</Text>
                <Text style={[
                  styles.weekDayNumber,
                  isToday && styles.todayNumber
                ]}>
                  {date.getDate()}
                </Text>
                
                {/* Event indicators */}
                {dayEvents.length > 0 && (
                  <View style={styles.weekEventIndicators}>
                    {dayEvents.slice(0, 2).map(event => (
                      <View
                        key={event.id}
                        style={[
                          styles.weekEventDot,
                          { backgroundColor: categoryColors[event.category] }
                        ]}
                      />
                    ))}
                    {dayEvents.length > 2 && (
                      <Text style={styles.weekMoreEvents}>+{dayEvents.length - 2}</Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Time slots */}
        <ScrollView style={styles.timeSlots} showsVerticalScrollIndicator={false}>
          {Array.from({ length: 24 }, (_, hour) => (
            <View key={hour} style={styles.timeSlot}>
              <Text style={styles.timeLabel}>
                {hour.toString().padStart(2, '0')}:00
              </Text>
              <View style={styles.timeSlotContent}>
                {weekDates.map((date, dayIndex) => {
                  const dayEvents = getEventsForDate(date).filter(event => {
                    const eventHour = event.startTime.getHours();
                    return eventHour === hour;
                  });
                  
                  return (
                    <View key={dayIndex} style={styles.weekDaySlot}>
                      {dayEvents.map(event => (
                        <TouchableOpacity
                          key={event.id}
                          style={[
                            styles.weekEventBlock,
                            { backgroundColor: categoryColors[event.category] + '80' }
                          ]}
                          onPress={() => openEditModal(event)}
                        >
                          <Text style={styles.weekEventTitle} numberOfLines={1}>
                            {event.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate).sort((a, b) => 
      a.startTime.getTime() - b.startTime.getTime()
    );

    return (
      <View style={styles.dayContainer}>
        <Text style={styles.dayViewTitle}>
          {formatDate(currentDate)}
        </Text>
        
        <ScrollView style={styles.dayEventsList} showsVerticalScrollIndicator={false}>
          {dayEvents.length > 0 ? (
            dayEvents.map(event => (
              <TouchableOpacity
                key={event.id}
                style={styles.dayEventItem}
                onPress={() => openEditModal(event)}
              >
                <View style={[
                  styles.dayEventColorBar,
                  { backgroundColor: categoryColors[event.category] }
                ]} />
                <View style={styles.dayEventContent}>
                  <View style={styles.dayEventHeader}>
                    <Text style={styles.dayEventTitle}>{event.title}</Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteEvent(event.id)}
                      style={styles.dayEventDelete}
                    >
                      <Ionicons name="trash-outline" size={16} color="#ff4757" />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.dayEventTime}>
                    {event.allDay ? 'All Day' : `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`}
                  </Text>
                  
                  {event.description && (
                    <Text style={styles.dayEventDescription} numberOfLines={2}>
                      {event.description}
                    </Text>
                  )}
                  
                  {event.location && (
                    <View style={styles.dayEventLocationContainer}>
                      <Ionicons name="location-outline" size={14} color="#666" />
                      <Text style={styles.dayEventLocation}>{event.location}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyDayState}>
              <Ionicons name="calendar-outline" size={48} color="#666" />
              <Text style={styles.emptyDayTitle}>No events today</Text>
              <Text style={styles.emptyDayDescription}>
                Tap + to add an event for this day
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderAgendaView = () => {
    const upcomingEvents = events
      .filter(event => event.startTime >= new Date())
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, 20);

    return (
      <View style={styles.agendaContainer}>
        <Text style={styles.agendaTitle}>Upcoming Events</Text>
        
        <ScrollView 
          style={styles.agendaList} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2979FF"
            />
          }
        >
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event, index) => {
              const eventDate = new Date(event.startTime);
              const isToday = eventDate.toDateString() === new Date().toDateString();
              const isTomorrow = eventDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
              
              let dateLabel = eventDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              });
              
              if (isToday) dateLabel = 'Today';
              else if (isTomorrow) dateLabel = 'Tomorrow';

              return (
                <View key={event.id}>
                  {(index === 0 || 
                    new Date(upcomingEvents[index - 1].startTime).toDateString() !== eventDate.toDateString()) && (
                    <Text style={styles.agendaDateHeader}>{dateLabel}</Text>
                  )}
                  
                  <TouchableOpacity
                    style={styles.agendaEventItem}
                    onPress={() => openEditModal(event)}
                  >
                    <View style={[
                      styles.agendaEventColorBar,
                      { backgroundColor: categoryColors[event.category] }
                    ]} />
                    <View style={styles.agendaEventContent}>
                      <View style={styles.agendaEventHeader}>
                        <Text style={styles.agendaEventTitle}>{event.title}</Text>
                        <Text style={styles.agendaEventTime}>
                          {event.allDay ? 'All Day' : formatTime(event.startTime)}
                        </Text>
                      </View>
                      
                      {event.description && (
                        <Text style={styles.agendaEventDescription} numberOfLines={1}>
                          {event.description}
                        </Text>
                      )}
                      
                      {event.location && (
                        <View style={styles.agendaEventLocationContainer}>
                          <Ionicons name="location-outline" size={12} color="#666" />
                          <Text style={styles.agendaEventLocation}>{event.location}</Text>
                        </View>
                      )}
                    </View>
                    
                    <TouchableOpacity
                      onPress={() => handleDeleteEvent(event.id)}
                      style={styles.agendaEventDelete}
                    >
                      <Ionicons name="trash-outline" size={16} color="#ff4757" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyAgendaState}>
              <Ionicons name="calendar-clear-outline" size={48} color="#666" />
              <Text style={styles.emptyAgendaTitle}>No upcoming events</Text>
              <Text style={styles.emptyAgendaDescription}>
                Your schedule is clear. Add some events to get started!
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  // ========================================================================================
  // MAIN RENDER
  // ========================================================================================

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => handleNavigation('prev')}
            style={styles.navButton}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.titleContainer}
            onPress={() => setCurrentDate(new Date())}
          >
            <Text style={styles.monthTitle}>{getViewTitle()}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => handleNavigation('next')}
            style={styles.navButton}
          >
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* View Mode Selector */}
        <View style={styles.viewSelector}>
          {(['month', 'week', 'day', 'agenda'] as ViewMode[]).map(mode => (
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
        <ScrollView 
          style={styles.calendarContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            viewMode !== 'agenda' ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#2979FF"
              />
            ) : undefined
          }
        >
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'agenda' && renderAgendaView()}
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => openAddModal(selectedDate)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Add/Edit Event Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingEvent ? 'Edit Event' : 'New Event'}
            </Text>
            <TouchableOpacity onPress={handleSaveEvent}>
              <Text style={styles.saveButton}>
                {editingEvent ? 'Update' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.textInput}
                value={eventTitle}
                onChangeText={setEventTitle}
                placeholder="Event title"
                placeholderTextColor="#666"
                autoFocus
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={eventDescription}
                onChangeText={setEventDescription}
                placeholder="Event description (optional)"
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.textInput}
                value={eventLocation}
                onChangeText={setEventLocation}
                placeholder="Event location (optional)"
                placeholderTextColor="#666"
              />
            </View>

            {/* All Day Toggle */}
            <View style={styles.inputGroup}>
              <View style={styles.allDayContainer}>
                <Text style={styles.inputLabel}>All Day</Text>
                <Switch
                  value={isAllDay}
                  onValueChange={setIsAllDay}
                  trackColor={{ false: '#333', true: '#2979FF' }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            {/* Start Date & Time */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Start</Text>
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity
                  style={[styles.dateTimeButton, { flex: 1, marginRight: 8 }]}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={16} color="#2979FF" />
                  <Text style={styles.dateTimeText}>
                    {startDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                
                {!isAllDay && (
                  <TouchableOpacity
                    style={[styles.dateTimeButton, { flex: 1, marginLeft: 8 }]}
                    onPress={() => setShowStartTimePicker(true)}
                  >
                    <Ionicons name="time-outline" size={16} color="#2979FF" />
                    <Text style={styles.dateTimeText}>
                      {formatTime(startDate)}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* End Date & Time */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>End</Text>
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity
                  style={[styles.dateTimeButton, { flex: 1, marginRight: 8 }]}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={16} color="#2979FF" />
                  <Text style={styles.dateTimeText}>
                    {endDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                
                {!isAllDay && (
                  <TouchableOpacity
                    style={[styles.dateTimeButton, { flex: 1, marginLeft: 8 }]}
                    onPress={() => setShowEndTimePicker(true)}
                  >
                    <Ionicons name="time-outline" size={16} color="#2979FF" />
                    <Text style={styles.dateTimeText}>
                      {formatTime(endDate)}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryContainer}>
                {(['work', 'personal', 'health', 'shopping'] as const).map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      eventCategory === category && styles.categoryOptionActive,
                      { borderColor: categoryColors[category] }
                    ]}
                    onPress={() => setEventCategory(category)}
                  >
                    <Text style={[
                      styles.categoryLabel,
                      eventCategory === category && { color: categoryColors[category] }
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recurring */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Repeat</Text>
              <View style={styles.recurringContainer}>
                {(['none', 'daily', 'weekly', 'monthly'] as const).map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.recurringOption,
                      recurring === option && styles.recurringOptionActive
                    ]}
                    onPress={() => setRecurring(option)}
                  >
                    <Text style={[
                      styles.recurringLabel,
                      recurring === option && styles.recurringLabelActive
                    ]}>
                      {option === 'none' ? 'Never' : option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Date/Time Pickers */}
      {showStartDatePicker && Platform.OS === 'ios' && (
        <Modal visible={showStartDatePicker} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={() => setShowStartDatePicker(false)}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.datePickerTitle}>Start Date</Text>
              <TouchableOpacity onPress={() => setShowStartDatePicker(false)}>
                <Text style={styles.saveButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={startDate}
              mode="date"
              display="spinner"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setStartDate(selectedDate);
                  if (selectedDate > endDate) {
                    const newEndDate = new Date(selectedDate);
                    newEndDate.setTime(newEndDate.getTime() + 60 * 60 * 1000);
                    setEndDate(newEndDate);
                  }
                }
              }}
              style={styles.datePicker}
            />
          </SafeAreaView>
        </Modal>
      )}

      {showStartDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(false);
            if (selectedDate) {
              setStartDate(selectedDate);
              if (selectedDate > endDate) {
                const newEndDate = new Date(selectedDate);
                newEndDate.setTime(newEndDate.getTime() + 60 * 60 * 1000);
                setEndDate(newEndDate);
              }
            }
          }}
        />
      )}

      {showEndDatePicker && Platform.OS === 'ios' && (
        <Modal visible={showEndDatePicker} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.datePickerTitle}>End Date</Text>
              <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
                <Text style={styles.saveButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={endDate}
              mode="date"
              display="spinner"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setEndDate(selectedDate);
                }
              }}
              style={styles.datePicker}
            />
          </SafeAreaView>
        </Modal>
      )}

      {showEndDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false);
            if (selectedDate) {
              setEndDate(selectedDate);
            }
          }}
        />
      )}

      {showStartTimePicker && Platform.OS === 'ios' && (
        <Modal visible={showStartTimePicker} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={() => setShowStartTimePicker(false)}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.datePickerTitle}>Start Time</Text>
              <TouchableOpacity onPress={() => setShowStartTimePicker(false)}>
                <Text style={styles.saveButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={startDate}
              mode="time"
              display="spinner"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setStartDate(selectedDate);
                  const newEndDate = new Date(selectedDate);
                  newEndDate.setTime(newEndDate.getTime() + 60 * 60 * 1000);
                  setEndDate(newEndDate);
                }
              }}
              style={styles.datePicker}
            />
          </SafeAreaView>
        </Modal>
      )}

      {showStartTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={startDate}
          mode="time"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartTimePicker(false);
            if (selectedDate) {
              setStartDate(selectedDate);
              const newEndDate = new Date(selectedDate);
              newEndDate.setTime(newEndDate.getTime() + 60 * 60 * 1000);
              setEndDate(newEndDate);
            }
          }}
        />
      )}

      {showEndTimePicker && Platform.OS === 'ios' && (
        <Modal visible={showEndTimePicker} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={() => setShowEndTimePicker(false)}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.datePickerTitle}>End Time</Text>
              <TouchableOpacity onPress={() => setShowEndTimePicker(false)}>
                <Text style={styles.saveButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={endDate}
              mode="time"
              display="spinner"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setEndDate(selectedDate);
                }
              }}
              style={styles.datePicker}
            />
          </SafeAreaView>
        </Modal>
      )}

      {showEndTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={endDate}
          mode="time"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndTimePicker(false);
            if (selectedDate) {
              setEndDate(selectedDate);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

// ========================================================================================
// STYLES
// ========================================================================================

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
    paddingBottom: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
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
    backgroundColor: '#2979FF',
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
    position: 'relative',
  },
  selectedDay: {
    backgroundColor: '#2979FF',
  },
  todayCell: {
    borderWidth: 2,
    borderColor: '#2979FF',
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
    color: '#2979FF',
    fontWeight: 'bold',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  eventIndicators: {
    position: 'absolute',
    bottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  moreEventsText: {
    fontSize: 8,
    color: '#666',
  },

  // Events Section
  eventsSection: {
    marginTop: 20,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    maxHeight: 300,
  },
  eventsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  eventsList: {
    maxHeight: 200,
  },
  eventItem: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    minHeight: 60,
  },
  eventColorBar: {
    width: 4,
  },
  eventContent: {
    flex: 1,
    padding: 12,
  },
  eventTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  eventLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventLocation: {
    fontSize: 12,
    color: '#666',
  },
  deleteEventButton: {
    padding: 12,
    justifyContent: 'center',
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
    marginBottom: 16,
  },
  weekDayColumn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  todayColumn: {
    backgroundColor: '#2979FF20',
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
    color: '#2979FF',
    fontWeight: 'bold',
  },
  weekEventIndicators: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 2,
  },
  weekEventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  weekMoreEvents: {
    fontSize: 8,
    color: '#666',
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
    flexDirection: 'row',
  },
  weekDaySlot: {
    flex: 1,
    paddingHorizontal: 2,
  },
  weekEventBlock: {
    borderRadius: 4,
    padding: 4,
    marginVertical: 2,
  },
  weekEventTitle: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },

  // Day View
  dayContainer: {
    flex: 1,
  },
  dayViewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  dayEventsList: {
    flex: 1,
  },
  dayEventItem: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    minHeight: 80,
  },
  dayEventColorBar: {
    width: 4,
  },
  dayEventContent: {
    flex: 1,
    padding: 16,
  },
  dayEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  dayEventTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  dayEventDelete: {
    padding: 4,
  },
  dayEventTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  dayEventDescription: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    lineHeight: 20,
  },
  dayEventLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayEventLocation: {
    fontSize: 14,
    color: '#666',
  },
  emptyDayState: {
    alignItems: 'center',
    paddingVertical: 60,
    marginTop: 40,
  },
  emptyDayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    marginTop: 16,
  },
  emptyDayDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  // Agenda View
  agendaContainer: {
    flex: 1,
  },
  agendaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  agendaList: {
    flex: 1,
  },
  agendaDateHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2979FF',
    marginTop: 16,
    marginBottom: 8,
  },
  agendaEventItem: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    minHeight: 60,
  },
  agendaEventColorBar: {
    width: 4,
  },
  agendaEventContent: {
    flex: 1,
    padding: 12,
  },
  agendaEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  agendaEventTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  agendaEventTime: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  agendaEventDescription: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  agendaEventLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  agendaEventLocation: {
    fontSize: 12,
    color: '#666',
  },
  agendaEventDelete: {
    padding: 12,
    justifyContent: 'center',
  },
  emptyAgendaState: {
    alignItems: 'center',
    paddingVertical: 60,
    marginTop: 40,
  },
  emptyAgendaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    marginTop: 16,
  },
  emptyAgendaDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2979FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Modal
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
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  allDayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTimeContainer: {
    flexDirection: 'row',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#fff',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#666',
  },
  categoryOptionActive: {
    backgroundColor: 'rgba(41, 121, 255, 0.1)',
  },
  categoryLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  recurringContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recurringOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#666',
  },
  recurringOptionActive: {
    backgroundColor: '#2979FF20',
    borderColor: '#2979FF',
  },
  recurringLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  recurringLabelActive: {
    color: '#2979FF',
  },

  // Date/Time Picker
  datePickerContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  datePicker: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
});

export default CalendarScreen;