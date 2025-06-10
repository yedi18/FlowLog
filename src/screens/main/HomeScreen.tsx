// src/screens/main/HomeScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

// Import components
import HomeHeader from '../../components/home/HomeHeader';
import CurrentEventBanner from '../../components/home/CurrentEventBanner';
import ProgressCard from '../../components/home/ProgressCard';
import QuickActions from '../../components/home/QuickActions';
import EventsList from '../../components/home/EventsList';
import TasksList from '../../components/home/TasksList';
import FloatingActionButtons from '../../components/home/FloatingActionButtons';
import QuickAddModal from '../../components/home/QuickAddModal';
import FilterModal from '../../components/home/FilterModal';

interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  category: 'work' | 'personal' | 'health' | 'shopping';
  dueTime?: string;
  description?: string;
  createdAt: Date;
}

interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  category: 'work' | 'personal' | 'health' | 'shopping';
  description?: string;
  location?: string;
}

const categoryColors = {
  work: '#2979FF',
  personal: '#4CAF50',
  health: '#FF5722',
  shopping: '#FF9800',
};

const priorityColors = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
};

const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'time' | 'priority' | 'category'>('time');

  // Animation values
  const fadeAnim = new Animated.Value(1);
  const progressAnim = new Animated.Value(0);

  // Mock data - Enhanced with more variety
  const [todayTasks, setTodayTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Review pull requests',
      priority: 'high',
      completed: false,
      category: 'work',
      dueTime: '10:00',
      description: 'Review 3 pending PRs',
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'Buy groceries',
      priority: 'medium',
      completed: false,
      category: 'shopping',
      dueTime: '15:00',
      description: 'Milk, bread, vegetables',
      createdAt: new Date(),
    },
    {
      id: '3',
      title: 'Doctor appointment',
      priority: 'high',
      completed: false,
      category: 'health',
      dueTime: '16:30',
      description: 'Annual checkup',
      createdAt: new Date(),
    },
    {
      id: '4',
      title: 'Call mom',
      priority: 'low',
      completed: true,
      category: 'personal',
      dueTime: '12:00',
      description: 'Weekly check-in',
      createdAt: new Date(),
    },
    {
      id: '5',
      title: 'Prepare presentation',
      priority: 'high',
      completed: false,
      category: 'work',
      dueTime: '09:00',
      description: 'Q4 results presentation',
      createdAt: new Date(),
    },
  ]);

  const [todayEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Team Meeting',
      startTime: '09:00',
      endTime: '10:00',
      category: 'work',
      description: 'Weekly standup',
      location: 'Conference Room A',
    },
    {
      id: '2',
      title: 'Lunch with Sarah',
      startTime: '12:30',
      endTime: '13:30',
      category: 'personal',
      description: 'Catch up lunch',
      location: 'Downtown Cafe',
    },
    {
      id: '3',
      title: 'Doctor Appointment',
      startTime: '14:00',
      endTime: '15:00',
      category: 'health',
      description: 'Regular checkup',
      location: 'Medical Center',
    },
    {
      id: '4',
      title: 'Gym Session',
      startTime: '18:00',
      endTime: '19:30',
      category: 'health',
      description: 'Leg day workout',
      location: 'Fitness Center',
    },
  ]);

  // Animation and lifecycle effects
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

  useFocusEffect(
    useCallback(() => {
      setCurrentTime(new Date());
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
    Alert.alert('Refreshed', 'Data updated successfully', [{ text: 'OK' }]);
  };

  const toggleTask = (taskId: string) => {
    setTodayTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, completed: !task.completed };
        if (!task.completed) {
          Alert.alert('Task Completed!', `"${task.title}" marked as done`, [{ text: 'Great!' }]);
        }
        return updatedTask;
      }
      return task;
    }));
  };

  const deleteTask = (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setTodayTasks(prev => prev.filter(task => task.id !== taskId));
          },
        },
      ]
    );
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

  const getUpcomingEvent = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    return todayEvents.find(event => event.startTime > currentTimeStr);
  };

  const currentEvent = getCurrentEvent();
  const upcomingEvent = getUpcomingEvent();

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const dayName = days[currentTime.getDay()];
    const day = currentTime.getDate();
    const month = months[currentTime.getMonth()];

    return `${dayName}, ${month} ${day}`;
  };

  const completedTasksCount = todayTasks.filter(task => task.completed).length;
  const totalTasks = todayTasks.length;

  const handleQuickAdd = (type: 'task' | 'event', data: any) => {
    if (type === 'task') {
      const newTask: Task = {
        id: Date.now().toString(),
        title: data.title,
        priority: data.priority,
        completed: false,
        category: data.category,
        dueTime: '18:00',
        createdAt: new Date(),
      };
      setTodayTasks(prev => [newTask, ...prev]);
      Alert.alert('Success', 'Task added successfully!');
    } else {
      navigation.navigate('Calendar' as never);
    }
    setShowQuickAdd(false);
  };

  const getFilteredTasks = () => {
    let filtered = todayTasks;

    if (categoryFilter) {
      filtered = filtered.filter(task => task.category === categoryFilter);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'category':
          return a.category.localeCompare(b.category);
        case 'time':
        default:
          if (a.dueTime && b.dueTime) {
            return a.dueTime.localeCompare(b.dueTime);
          }
          return 0;
      }
    });
  };

  const filteredTasks = getFilteredTasks();

  return (
    <GestureHandlerRootView style={styles.container}>
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
              tintColor="#2979FF"
              colors={["#2979FF"]}
              progressBackgroundColor="#2a2a2a"
            />
          }
        >
          <HomeHeader
            greeting={getGreeting()}
            userName="Yedid"
            currentDate={formatDate()}
            userInitial="Y"
            onProfilePress={() => navigation.navigate('Settings' as never)}
          />

          <CurrentEventBanner
            currentEvent={currentEvent}
            upcomingEvent={upcomingEvent}
          />

          <ProgressCard
            completedCount={completedTasksCount}
            totalCount={totalTasks}
            progressAnim={progressAnim}
          />

          <QuickActions
            onFilterPress={() => setShowFilters(true)}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <EventsList
            events={todayEvents}
            categoryColors={categoryColors}
            onNavigateToCalendar={() => navigation.navigate('Calendar' as never)}
          />

          <TasksList
            tasks={filteredTasks}
            categoryFilter={categoryFilter}
            onClearFilter={() => setCategoryFilter(null)}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onNavigateToTasks={() => navigation.navigate('Tasks' as never)}
            categoryColors={categoryColors}
            priorityColors={priorityColors}
          />
        </Animated.ScrollView>

        <FloatingActionButtons
          onAddTask={() => setShowQuickAdd(true)}
          onAddEvent={() => setShowQuickAdd(true)}
        />

        <QuickAddModal
          visible={showQuickAdd}
          onClose={() => setShowQuickAdd(false)}
          onSave={handleQuickAdd}
          categoryColors={categoryColors}
          priorityColors={priorityColors}
        />

        <FilterModal
          visible={showFilters}
          onClose={() => setShowFilters(false)}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          categoryColors={categoryColors}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
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
    paddingBottom: 120,
  },
});

export default HomeScreen;