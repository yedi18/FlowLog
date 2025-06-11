// src/screens/main/HomeScreen.tsx
// מסך בית מעוצב בהתאם לתמונות עם עיצוב פשוט וחלק

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  category: 'work' | 'personal' | 'health' | 'shopping';
  dueTime?: string;
}

interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  category: 'work' | 'personal' | 'health' | 'shopping';
}

const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const fadeAnim = new Animated.Value(1);

  // Mock data
  const [todayTasks, setTodayTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Review pull requests',
      priority: 'high',
      completed: false,
      category: 'work',
      dueTime: '10:00',
    },
    {
      id: '2',
      title: 'Buy groceries',
      priority: 'medium',
      completed: false,
      category: 'shopping',
      dueTime: '15:00',
    },
    {
      id: '3',
      title: 'Doctor appointment',
      priority: 'low',
      completed: false,
      category: 'health',
      dueTime: '16:30',
    },
  ]);

  const [todayEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Team Meeting',
      startTime: '09:00',
      endTime: '10:00',
      category: 'work',
    },
    {
      id: '2',
      title: 'Lunch with Sarah',
      startTime: '12:30',
      endTime: '13:30',
      category: 'personal',
    },
    {
      id: '3',
      title: 'Doctor Appointment',
      startTime: '14:00',
      endTime: '15:00',
      category: 'health',
    },
  ]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const toggleTask = (taskId: string) => {
    setTodayTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const getCurrentEvent = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    return todayEvents.find(event => {
      return currentTimeStr >= event.startTime && currentTimeStr <= event.endTime;
    });
  };

  const currentEvent = getCurrentEvent();

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'בוקר טוב';
    if (hour < 17) return 'צהריים טובים';
    return 'ערב טוב';
  };

  const formatDate = () => {
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const months = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

    const dayName = days[currentTime.getDay()];
    const day = currentTime.getDate();
    const month = months[currentTime.getMonth()];

    return `יום ${dayName}, ${day} ב${month}`;
  };

  const completedTasksCount = todayTasks.filter(task => task.completed).length;
  const completionPercentage = todayTasks.length > 0 ? Math.round((completedTasksCount / todayTasks.length) * 100) : 0;

  const handleQuickAdd = () => {
    if (quickTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: quickTaskTitle.trim(),
        priority: 'medium',
        completed: false,
        category: 'work',
      };
      setTodayTasks(prev => [newTask, ...prev]);
      setQuickTaskTitle('');
      setShowQuickAdd(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            colors={["#007AFF"]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>
              {getGreeting()}, Yedid
            </Text>
            <Text style={styles.date}>{formatDate()}</Text>
          </View>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Settings' as never)}
          >
            <View style={styles.profileCircle}>
              <Text style={styles.profileInitial}>Y</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Current Event */}
        {currentEvent && (
          <View style={styles.currentEventContainer}>
            <Ionicons name="time-outline" size={16} color="#fff" />
            <Text style={styles.currentEventText}>
              אירוע נוכחי: {currentEvent.title}
            </Text>
          </View>
        )}

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>התקדמות היום</Text>
            <Text style={styles.progressPercentage}>{completionPercentage}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${completionPercentage}%` }]} />
          </View>
          <Text style={styles.progressSubtext}>
            {completedTasksCount} מתוך {todayTasks.length} משימות הושלמו
          </Text>
        </View>

        {/* Today's Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>אירועים להיום</Text>
          {todayEvents.map((event) => (
            <View key={event.id} style={styles.eventItem}>
              <Text style={styles.eventTime}>
                {event.startTime}
              </Text>
              <Text style={styles.eventTitle}>{event.title}</Text>
            </View>
          ))}
        </View>

        {/* Today's Tasks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>משימות להיום</Text>
          {todayTasks.map((task) => (
            <View key={task.id} style={styles.taskItem}>
              <TouchableOpacity
                onPress={() => toggleTask(task.id)}
                style={[
                  styles.taskCheckbox,
                  task.completed && styles.taskCheckboxCompleted
                ]}
              >
                {task.completed && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </TouchableOpacity>

              <View style={styles.taskContent}>
                <Text style={[
                  styles.taskTitle,
                  task.completed && styles.taskTitleCompleted
                ]}>
                  {task.title}
                </Text>
                {task.category === 'work' && (
                  <Text style={styles.taskCategory}>Work</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </Animated.ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setShowQuickAdd(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Quick Add Modal */}
      <Modal
        visible={showQuickAdd}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowQuickAdd(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Quick Add</Text>
            <TouchableOpacity onPress={handleQuickAdd}>
              <Text style={styles.saveButton}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.textInput}
              value={quickTaskTitle}
              onChangeText={setQuickTaskTitle}
              placeholder="Task title"
              placeholderTextColor="#666"
              autoFocus
            />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 24,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  profileButton: {
    marginLeft: 16,
  },
  profileCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Current Event
  currentEventContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  currentEventText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
  },

  // Progress
  progressContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#fff',
  },
  progressPercentage: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 12,
  },

  // Events
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
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

  // Tasks
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskCheckboxCompleted: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  taskCategory: {
    fontSize: 14,
    color: '#666',
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
    padding: 20,
  },
  textInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
  },
});

export default HomeScreen;
