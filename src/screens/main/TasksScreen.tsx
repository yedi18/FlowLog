// src/screens/main/TasksScreen.tsx
// מסך משימות מעודכן עם עיצוב פשוט כמו בתמונות

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Platform,
  ListRenderItem,
  StatusBar,
  Animated,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'work' | 'personal' | 'health' | 'shopping';
  dueDate?: string;
  dueTime?: string;
  createdAt: string;
  updatedAt: string;
}

type TabType = 'all' | 'completed';

const TasksScreen: React.FC = () => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskCategory, setTaskCategory] = useState<'work' | 'personal' | 'health' | 'shopping'>('work');
  const [reminderEnabled, setReminderEnabled] = useState(false);

  // Animation
  const slideAnim = new Animated.Value(300);
  const fadeAnim = new Animated.Value(1);

  // Mock initial data
  useEffect(() => {
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Finish report',
        completed: false,
        priority: 'high',
        category: 'work',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Prepare slides',
        completed: false,
        priority: 'medium',
        category: 'work',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Schedule meeting',
        completed: false,
        priority: 'low',
        category: 'work',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        title: 'Reply to emails',
        completed: false,
        priority: 'medium',
        category: 'work',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '5',
        title: 'Buy gift',
        completed: true,
        priority: 'low',
        category: 'personal',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    setTasks(mockTasks);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());

    switch (activeTab) {
      case 'completed':
        return task.completed && matchesSearch;
      case 'all':
        return !task.completed && matchesSearch;
      default:
        return matchesSearch;
    }
  });

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? {
          ...task,
          completed: !task.completed,
          updatedAt: new Date().toISOString(),
        }
        : task
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setTasks(prev => prev.filter(t => t.id !== taskId)),
        },
      ]
    );
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
    setEditingTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskPriority('medium');
    setTaskCategory('work');
    setReminderEnabled(false);
  };

  const handleSaveTask = () => {
    if (!taskTitle.trim()) {
      Alert.alert('Error', 'Task title is required');
      return;
    }

    const taskData = {
      title: taskTitle.trim(),
      description: taskDescription.trim() || undefined,
      priority: taskPriority,
      category: taskCategory,
      updatedAt: new Date().toISOString(),
    };

    if (editingTask) {
      setTasks(prev => prev.map(task =>
        task.id === editingTask.id
          ? { ...task, ...taskData }
          : task
      ));
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        ...taskData,
        completed: false,
        createdAt: new Date().toISOString(),
      } as Task;
      setTasks(prev => [newTask, ...prev]);
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

  const renderTaskItem: ListRenderItem<Task> = ({ item }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity
        onPress={() => handleToggleTask(item.id)}
        style={[
          styles.taskCheckbox,
          item.completed && styles.taskCheckboxCompleted
        ]}
      >
        {item.completed && (
          <Ionicons name="checkmark" size={14} color="#fff" />
        )}
      </TouchableOpacity>
      
      <View style={styles.taskContent}>
        <Text style={[
          styles.taskTitle,
          item.completed && styles.taskTitleCompleted
        ]}>
          {item.title}
        </Text>
        {item.category === 'work' && (
          <Text style={styles.taskCategory}>Work</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tasks</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Completed Toggle */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Completed</Text>
          <Switch
            value={activeTab === 'completed'}
            onValueChange={(value) => setActiveTab(value ? 'completed' : 'all')}
            trackColor={{ false: '#333', true: '#007AFF' }}
            thumbColor="#fff"
          />
        </View>

        {/* Task List */}
        <FlatList
          data={filteredTasks}
          keyExtractor={item => item.id}
          renderItem={renderTaskItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                No tasks found
              </Text>
              <Text style={styles.emptyDescription}>
                Add a new task to get started
              </Text>
            </View>
          )}
        />

        {/* FAB */}
        <TouchableOpacity style={styles.fab} onPress={openAddModal}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Add Task Modal */}
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
            <Text style={styles.modalTitle}>New Task</Text>
            <TouchableOpacity onPress={handleSaveTask}>
              <Text style={styles.saveButton}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.textInput}
                value={taskTitle}
                onChangeText={setTaskTitle}
                placeholder="Task title"
                placeholderTextColor="#666"
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Label</Text>
              <View style={styles.categoryContainer}>
                {['work', 'personal', 'health', 'shopping'].map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      taskCategory === category && styles.categoryOptionActive
                    ]}
                    onPress={() => setTaskCategory(category as any)}
                  >
                    <Text style={[
                      styles.categoryLabel,
                      taskCategory === category && styles.categoryLabelActive
                    ]}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.reminderContainer}>
                <Text style={styles.inputLabel}>Reminder</Text>
                <Switch
                  value={reminderEnabled}
                  onValueChange={setReminderEnabled}
                  trackColor={{ false: '#333', true: '#007AFF' }}
                  thumbColor="#fff"
                />
              </View>
            </View>
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
  moreButton: {
    padding: 8,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },

  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },

  // List
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  // Task Item
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

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
  reminderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default TasksScreen;