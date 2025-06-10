// src/screens/main/TasksScreen.tsx - Complete Todoist Replica Implementation
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  StatusBar,
  ListRenderItem,
  Animated,
  Dimensions,
  RefreshControl,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import NotificationService from '../../services/NotificationService';

// Import Firebase services
import {
  onTasksChange,
  onProjectsChange,
  onLabelsChange,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  createProject,
  createLabel,
  deleteProject as deleteProjectService,
  getTasksCounts,
  deleteTasks,
  updateTasks,
  searchTasks,
  getTasksByProject,
  getTasksByLabel
} from '../../services/tasksService';

// Import components
import TasksSidebar from '../../components/tasks/TasksSidebar';
import TaskItem from '../../components/tasks/TaskItem';
import TaskEditor from '../../components/tasks/TaskEditor';
import QuickAddTask from '../../components/tasks/QuickAddTask';
import EmptyTasksState from '../../components/tasks/EmptyTasksState';
import FilterChips from '../../components/tasks/FilterChips';
import BulkActions from '../../components/tasks/BulkActions';
import SearchBar from '../../components/tasks/SearchBar';
import ViewOptions from '../../components/tasks/ViewOptions';

// Import types
import { Task, Project, Label, TaskTab, PRIORITY_COLORS, SubTask, Priority } from '../../types';

const { width, height } = Dimensions.get('window');

type SortType = 'dueDate' | 'priority' | 'created' | 'alphabetical' | 'manual';
type ViewType = 'list' | 'board' | 'calendar';
type GroupByType = 'none' | 'project' | 'priority' | 'assignee' | 'labels';

// Todoist Theme Colors
const TODOIST_COLORS = {
  background: '#1f1f1f',
  surface: '#282828',
  surfaceElevated: '#2d2d2d',
  primary: '#DC4C3E',
  primaryHover: '#B8392E',
  text: '#FFFFFF',
  textSecondary: '#8B8B8B',
  textTertiary: '#6B6B6B',
  border: '#333333',
  borderLight: '#404040',
  success: '#058527',
  warning: '#FF8C00',
  error: '#DC4C3E',
  purple: '#7C3AED',
  blue: '#2563EB',
  green: '#059669',
  yellow: '#D97706',
  pink: '#EC4899',
};

interface TaskGroup {
  id: string;
  title: string;
  tasks: Task[];
  color?: string;
}

const TasksScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Core States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskCounts, setTaskCounts] = useState({
    today: 0,
    upcoming: 0,
    inbox: 0,
    completed: 0,
    overdue: 0,
    all: 0,
  });

  // UI States
  const [activeCategory, setActiveCategory] = useState<TaskTab>('today');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showTaskEditor, setShowTaskEditor] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [sortBy, setSortBy] = useState<SortType>('dueDate');
  const [viewType, setViewType] = useState<ViewType>('list');
  const [groupBy, setGroupBy] = useState<GroupByType>('none');
  const [refreshing, setRefreshing] = useState(false);

  // Filter States
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyMyTasks, setShowOnlyMyTasks] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  // Advanced States
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const [showViewOptions, setShowViewOptions] = useState(false);

  // Animations
  const fadeAnim = new Animated.Value(1);
  const fabScale = new Animated.Value(1);
  const sidebarAnim = new Animated.Value(0);

  // Initialize notifications
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        const token = await NotificationService.registerForPushNotifications();
        if (token) {
          console.log('✅ Notifications initialized successfully');
        }
      } catch (error) {
        console.error('❌ Error initializing notifications:', error);
      }
    };

    initializeNotifications();

    const listeners = NotificationService.setupNotificationListeners(
      (notification) => {
        console.log('📩 Notification received:', notification.request.content.title);
      },
      (response) => {
        console.log('👆 User tapped notification:', response.notification.request.content.title);
        const taskId = response.notification.request.content.data?.taskId;
        if (taskId) {
          const task = tasks.find(t => t.id === taskId);
          if (task) {
            setEditingTask(task);
            setShowTaskEditor(true);
          }
        }
      }
    );

    return () => {
      listeners.remove();
    };
  }, [tasks]);

  // Setup real-time listeners for Firebase data
  useEffect(() => {
    if (!user?.uid) {
      console.log('No user logged in');
      setLoading(false);
      setError('Please log in to view tasks');
      return;
    }

    console.log('🔄 Setting up Firebase listeners for user:', user.uid);
    setError(null);

    // Setup tasks listener
    const unsubscribeTasks = onTasksChange(user.uid, (updatedTasks) => {
      console.log('📝 Tasks updated:', updatedTasks.length);
      setTasks(updatedTasks);
      setLoading(false);
      setError(null);
      updateTaskCounts(updatedTasks);
    });

    // Setup projects listener
    const unsubscribeProjects = onProjectsChange(user.uid, (updatedProjects) => {
      console.log('📁 Projects updated:', updatedProjects.length);
      setProjects(updatedProjects);
    });

    // Setup labels listener
    const unsubscribeLabels = onLabelsChange(user.uid, (updatedLabels) => {
      console.log('🏷️ Labels updated:', updatedLabels.length);
      setLabels(updatedLabels);
    });

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Cleanup listeners
    return () => {
      console.log('🧹 Cleaning up Firebase listeners');
      try {
        unsubscribeTasks();
        unsubscribeProjects();
        unsubscribeLabels();
      } catch (error) {
        console.error('Error cleaning up listeners:', error);
      }
    };
  }, [user?.uid]);

  // Update task counts
  const updateTaskCounts = useCallback((tasksList: Task[]) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const counts = {
        today: tasksList.filter(t => {
          const taskDate = t.dueDate ? new Date(t.dueDate) : null;
          return !t.completed && taskDate && taskDate >= today && taskDate < tomorrow;
        }).length,
        upcoming: tasksList.filter(t => {
          const taskDate = t.dueDate ? new Date(t.dueDate) : null;
          return !t.completed && taskDate && taskDate >= tomorrow;
        }).length,
        inbox: tasksList.filter(t => !t.completed && !t.projectId).length,
        completed: tasksList.filter(t => t.completed).length,
        overdue: tasksList.filter(t => {
          const taskDate = t.dueDate ? new Date(t.dueDate) : null;
          return !t.completed && taskDate && taskDate < today;
        }).length,
        all: tasksList.length,
      };

      setTaskCounts(counts);
    } catch (error) {
      console.error('Error updating task counts:', error);
    }
  }, []);

  // Advanced task filtering and grouping
  const processedTasks = useMemo(() => {
    try {
      let filtered = tasks.filter(task => {
        // Category filter
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const taskDueDate = task.dueDate ? new Date(task.dueDate) : null;

        // Basic category filtering
        switch (activeCategory) {
          case 'today':
            if (task.completed) return false;
            if (!taskDueDate) return false;
            return taskDueDate >= today && taskDueDate < tomorrow;
          case 'upcoming':
            if (task.completed) return false;
            if (!taskDueDate) return false;
            return taskDueDate >= tomorrow;
          case 'completed':
            return task.completed;
          case 'inbox':
            return !task.completed && !task.projectId;
          case 'all':
          default:
            return !showCompleted ? !task.completed : true;
        }
      });

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(task => {
          const titleMatch = task.title.toLowerCase().includes(query);
          const descriptionMatch = task.description?.toLowerCase().includes(query) || false;
          const labelMatch = task.labels?.some(labelId => {
            const label = labels.find(l => l.id === labelId);
            return label?.name.toLowerCase().includes(query);
          }) || false;
          const projectMatch = (() => {
            if (!task.projectId) return false;
            const project = projects.find(p => p.id === task.projectId);
            return project?.name.toLowerCase().includes(query) || false;
          })();
          return titleMatch || descriptionMatch || labelMatch || projectMatch;
        });
      }

      // Project filter
      if (selectedProjectId) {
        filtered = filtered.filter(task => task.projectId === selectedProjectId);
      }

      // Label filter
      if (selectedLabelIds.length > 0) {
        filtered = filtered.filter(task =>
          task.labels?.some(labelId => selectedLabelIds.includes(labelId))
        );
      }

      // My tasks filter
      if (showOnlyMyTasks && user?.uid) {
        filtered = filtered.filter(task => task.assigneeId === user.uid);
      }

      // Sort tasks
      const sortedTasks = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case 'priority':
            return (a.priority || 4) - (b.priority || 4);
          case 'alphabetical':
            return a.title.localeCompare(b.title);
          case 'created':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'manual':
            return (a.sortOrder || 0) - (b.sortOrder || 0);
          case 'dueDate':
          default:
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
      });

      // Group tasks if needed
      if (groupBy === 'none') {
        return [{
          id: 'main',
          title: '',
          tasks: sortedTasks,
        }];
      }

      const groups: TaskGroup[] = [];
      const groupMap = new Map<string, Task[]>();

      sortedTasks.forEach(task => {
        let groupKey = '';
        let groupTitle = '';
        let groupColor = '';

        switch (groupBy) {
          case 'project':
            groupKey = task.projectId || 'no-project';
            if (task.projectId) {
              const project = projects.find(p => p.id === task.projectId);
              groupTitle = project?.name || 'Unknown Project';
              groupColor = project?.color || TODOIST_COLORS.textSecondary;
            } else {
              groupTitle = 'No Project';
              groupColor = TODOIST_COLORS.textSecondary;
            }
            break;
          case 'priority':
            groupKey = `priority-${task.priority || 4}`;
            const priorityNames = ['', 'Priority 1', 'Priority 2', 'Priority 3', 'Priority 4'];
            groupTitle = priorityNames[task.priority || 4];
            groupColor = PRIORITY_COLORS[task.priority || 4];
            break;
          case 'labels':
            if (task.labels && task.labels.length > 0) {
              task.labels.forEach(labelId => {
                const label = labels.find(l => l.id === labelId);
                if (label) {
                  const labelGroupKey = `label-${labelId}`;
                  if (!groupMap.has(labelGroupKey)) {
                    groupMap.set(labelGroupKey, []);
                  }
                  groupMap.get(labelGroupKey)!.push(task);
                }
              });
              return;
            } else {
              groupKey = 'no-labels';
              groupTitle = 'No Labels';
              groupColor = TODOIST_COLORS.textSecondary;
            }
            break;
          default:
            groupKey = 'all';
            groupTitle = '';
        }

        if (!groupMap.has(groupKey)) {
          groupMap.set(groupKey, []);
        }
        groupMap.get(groupKey)!.push(task);
      });

      groupMap.forEach((tasks, key) => {
        let title = '';
        let color = TODOIST_COLORS.textSecondary;

        if (groupBy === 'project') {
          if (key === 'no-project') {
            title = 'No Project';
          } else {
            const project = projects.find(p => p.id === key);
            title = project?.name || 'Unknown Project';
            color = project?.color || TODOIST_COLORS.textSecondary;
          }
        } else if (groupBy === 'priority') {
          const priorityNum = parseInt(key.split('-')[1]);
          const priorityNames = ['', 'Priority 1', 'Priority 2', 'Priority 3', 'Priority 4'];
          title = priorityNames[priorityNum];
          color = PRIORITY_COLORS[priorityNum];
        } else if (groupBy === 'labels' && key.startsWith('label-')) {
          const labelId = key.replace('label-', '');
          const label = labels.find(l => l.id === labelId);
          title = label ? `#${label.name}` : 'Unknown Label';
          color = label?.color || TODOIST_COLORS.textSecondary;
        } else if (key === 'no-labels') {
          title = 'No Labels';
        }

        groups.push({
          id: key,
          title,
          tasks,
          color,
        });
      });

      return groups;
    } catch (error) {
      console.error('Error processing tasks:', error);
      return [{
        id: 'main',
        title: '',
        tasks: [],
      }];
    }
  }, [tasks, projects, labels, activeCategory, searchQuery, selectedProjectId, selectedLabelIds, sortBy, groupBy, showCompleted, showOnlyMyTasks, user?.uid]);

  useFocusEffect(
    useCallback(() => {
      setSelectedTasks([]);
      setShowBulkActions(false);
    }, [])
  );

  const onRefresh = async () => {
    if (!user?.uid) return;

    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setError(null);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  // Get category title for header
  const getCategoryTitle = () => {
    if (selectedProjectId) {
      const project = projects.find(p => p.id === selectedProjectId);
      return project?.name || 'Project';
    }

    if (selectedLabelIds.length === 1) {
      const label = labels.find(l => l.id === selectedLabelIds[0]);
      return `#${label?.name || 'Label'}`;
    }

    if (selectedLabelIds.length > 1) {
      return `${selectedLabelIds.length} Labels`;
    }

    switch (activeCategory) {
      case 'today':
        return 'Today';
      case 'upcoming':
        return 'Upcoming';
      case 'completed':
        return 'Completed';
      case 'inbox':
        return 'Inbox';
      case 'all':
      default:
        return 'Tasks';
    }
  };

  const getTaskCount = () => {
    if (selectedProjectId || selectedLabelIds.length > 0) {
      return processedTasks.reduce((total, group) => total + group.tasks.length, 0);
    }
    return taskCounts[activeCategory] || 0;
  };

  const handleToggleTask = async (taskId: string) => {
    if (!user?.uid) return;

    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Animate task completion
      Animated.sequence([
        Animated.timing(fabScale, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fabScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      await toggleTaskCompletion(taskId, !task.completed);

      if (!task.completed) {
        // Todoist-style success feedback
        Alert.alert('Task completed! 🎉', `"${task.title}" moved to completed`, [
          { text: 'Great!', style: 'default' }
        ]);
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      Alert.alert('Error', 'Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user?.uid) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(taskId);
              setSelectedTasks(prev => prev.filter(id => id !== taskId));
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleBulkActions = async (action: string, taskIds: string[]) => {
    if (!user?.uid) return;

    try {
      switch (action) {
        case 'complete':
          const updates = taskIds.map(id => ({
            id,
            data: { completed: true, completedAt: new Date().toISOString() }
          }));
          await updateTasks(updates);
          break;
        case 'delete':
          await deleteTasks(taskIds);
          break;
        case 'move':
          // Implementation for moving tasks to different project
          break;
        case 'schedule':
          // Implementation for bulk scheduling
          break;
      }
      setSelectedTasks([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      Alert.alert('Error', 'Failed to perform bulk action. Please try again.');
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (!user?.uid) return;

    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskData);
      } else {
        await createTask(user.uid, taskData as Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>);
      }

      setShowTaskEditor(false);
      setShowQuickAdd(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task. Please try again.');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!user?.uid) return;

    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project? All tasks will be moved to Inbox.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProjectService(projectId);
            } catch (error) {
              console.error('Error deleting project:', error);
              Alert.alert('Error', 'Failed to delete project. Please try again.');
            }
          },
        },
      ]
    );
  };

  const openTaskEditor = (task?: Task) => {
    setEditingTask(task || null);
    setShowTaskEditor(true);
    setShowQuickAdd(false);
  };

  const openQuickAdd = () => {
    // Animate FAB press
    Animated.sequence([
      Animated.timing(fabScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fabScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setShowQuickAdd(true);
    setShowTaskEditor(false);
    setEditingTask(null);
  };

  const clearFilters = () => {
    setSelectedProjectId(null);
    setSelectedLabelIds([]);
    setSearchQuery('');
    setShowOnlyMyTasks(false);
  };

  const toggleFavorite = (id: string, type: 'project' | 'label' | 'filter') => {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  // Sidebar handlers
  const handleCategorySelect = (category: TaskTab) => {
    setActiveCategory(category);
    setSelectedProjectId(null);
    setSelectedLabelIds([]);
    setShowSidebar(false);
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedLabelIds([]);
    setActiveCategory('all');
    setShowSidebar(false);
  };

  const handleLabelSelect = (labelId: string) => {
    setSelectedLabelIds(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
    setSelectedProjectId(null);
    setActiveCategory('all');
    setShowSidebar(false);
  };

  const hasActiveFilters = Boolean(selectedProjectId || selectedLabelIds.length > 0 || searchQuery || showOnlyMyTasks);

  const renderTaskGroup = ({ item: group }: { item: TaskGroup }) => (
    <View style={styles.taskGroup}>
      {group.title && (
        <View style={styles.groupHeader}>
          <View style={[styles.groupIndicator, { backgroundColor: group.color }]} />
          <Text style={styles.groupTitle}>{group.title}</Text>
          <Text style={styles.groupCount}>{group.tasks.length}</Text>
        </View>
      )}
      {group.tasks.map((task, index) => (
        <TaskItem
          key={task.id}
          task={task}
          index={index}
          viewType={viewType}
          isSelected={selectedTasks.includes(task.id)}
          isExpanded={expandedTasks.includes(task.id)}
          showBulkActions={showBulkActions}
          onPress={() => openTaskEditor(task)}
          onToggle={() => handleToggleTask(task.id)}
          onDelete={() => handleDeleteTask(task.id)}
          onToggleSelection={() => {
            setSelectedTasks(prev =>
              prev.includes(task.id)
                ? prev.filter(id => id !== task.id)
                : [...prev, task.id]
            );
          }}
          onToggleExpanded={() => {
            setExpandedTasks(prev =>
              prev.includes(task.id)
                ? prev.filter(id => id !== task.id)
                : [...prev, task.id]
            );
          }}
          projects={projects}
          labels={labels}
          priorityColors={PRIORITY_COLORS}
        />
      ))}
    </View>
  );

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <View style={styles.todoistLoader}>
            <View style={styles.loaderDot} />
          </View>
          <Text style={styles.loadingText}>Loading your tasks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={TODOIST_COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={TODOIST_COLORS.background} />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {!showTaskEditor && !showQuickAdd ? (
          <>
            {/* Todoist Header */}
            <View style={styles.todoistHeader}>
              <TouchableOpacity
                style={styles.hamburgerButton}
                onPress={() => setShowSidebar(true)}
              >
                <Ionicons name="menu" size={24} color={TODOIST_COLORS.text} />
              </TouchableOpacity>

              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>{getCategoryTitle()}</Text>
                {getTaskCount() > 0 && (
                  <View style={styles.taskCountBadge}>
                    <Text style={styles.taskCountText}>{getTaskCount()}</Text>
                  </View>
                )}
              </View>

              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => setShowSearch(!showSearch)}
                >
                  <Ionicons name="search" size={20} color={TODOIST_COLORS.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => setShowViewOptions(!showViewOptions)}
                >
                  <Ionicons name="options" size={20} color={TODOIST_COLORS.textSecondary} />
                </TouchableOpacity>

                {hasActiveFilters && (
                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={clearFilters}
                  >
                    <Ionicons name="close-circle" size={20} color={TODOIST_COLORS.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Search Bar */}
            {showSearch && (
              <SearchBar
                query={searchQuery}
                onQueryChange={setSearchQuery}
                onClose={() => setShowSearch(false)}
                placeholder="Search tasks, projects, labels..."
              />
            )}

            {/* View Options */}
            {showViewOptions && (
              <ViewOptions
                viewType={viewType}
                sortBy={sortBy}
                groupBy={groupBy}
                showCompleted={showCompleted}
                showOnlyMyTasks={showOnlyMyTasks}
                onViewTypeChange={setViewType}
                onSortChange={setSortBy}
                onGroupByChange={setGroupBy}
                onShowCompletedChange={setShowCompleted}
                onShowOnlyMyTasksChange={setShowOnlyMyTasks}
                onClose={() => setShowViewOptions(false)}
              />
            )}

            {/* Quick Add Bar */}
            <TouchableOpacity
              style={styles.quickAddBar}
              onPress={() => openQuickAdd()}
            >
              <Ionicons name="add-circle" size={20} color={TODOIST_COLORS.primary} />
              <Text style={styles.quickAddText}>Add task</Text>
              <View style={styles.quickAddActions}>
                <TouchableOpacity style={styles.quickAddAction}>
                  <Ionicons name="calendar-outline" size={16} color={TODOIST_COLORS.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAddAction}>
                  <Ionicons name="flag-outline" size={16} color={TODOIST_COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {/* Filter Chips */}
            {hasActiveFilters && (
              <FilterChips
                projects={projects}
                labels={labels}
                selectedProjectId={selectedProjectId}
                selectedLabelIds={selectedLabelIds}
                showOnlyMyTasks={showOnlyMyTasks}
                searchQuery={searchQuery}
                onProjectSelect={setSelectedProjectId}
                onLabelToggle={(labelId) => {
                  setSelectedLabelIds(prev =>
                    prev.includes(labelId)
                      ? prev.filter(id => id !== labelId)
                      : [...prev, labelId]
                  );
                }}
                onClearFilters={clearFilters}
                onToggleMyTasks={() => setShowOnlyMyTasks(!showOnlyMyTasks)}
              />
            )}

            {/* Bulk Actions */}
            {showBulkActions && selectedTasks.length > 0 && (
              <BulkActions
                selectedCount={selectedTasks.length}
                onComplete={() => handleBulkActions('complete', selectedTasks)}
                onDelete={() => handleBulkActions('delete', selectedTasks)}
                onMove={() => handleBulkActions('move', selectedTasks)}
                onSchedule={() => handleBulkActions('schedule', selectedTasks)}
                onCancel={() => {
                  setSelectedTasks([]);
                  setShowBulkActions(false);
                }}
              />
            )}

            {/* Task List */}
            <FlatList
              data={processedTasks}
              keyExtractor={(item) => item.id}
              renderItem={renderTaskGroup}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={TODOIST_COLORS.primary}
                  colors={[TODOIST_COLORS.primary]}
                />
              }
              ListEmptyComponent={() => (
                <EmptyTasksState
                  activeTab={activeCategory}
                  searchQuery={searchQuery}
                  hasFilters={hasActiveFilters}
                  onAddTask={() => openQuickAdd()}
                />
              )}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            />

            {/* Sidebar */}
            <TasksSidebar
              visible={showSidebar}
              onClose={() => setShowSidebar(false)}
              activeCategory={activeCategory}
              onCategorySelect={handleCategorySelect}
              projects={projects}
              labels={labels}
              taskCounts={taskCounts}
              favorites={favorites}
              onProjectSelect={handleProjectSelect}
              onLabelSelect={handleLabelSelect}
              onToggleFavorite={toggleFavorite}
              selectedProjectId={selectedProjectId}
              selectedLabelIds={selectedLabelIds}
              onCreateProject={async (projectData) => {
                if (!user?.uid) return '';
                try {
                  const newProject = await createProject(user.uid, projectData);
                  return newProject.id;
                } catch (error) {
                  console.error('Error creating project:', error);
                  return '';
                }
              }}
              onCreateLabel={async (labelData) => {
                if (!user?.uid) return '';
                try {
                  const newLabel = await createLabel(user.uid, labelData);
                  return newLabel.id;
                } catch (error) {
                  console.error('Error creating label:', error);
                  return '';
                }
              }}
            />

            {/* Todoist FAB */}
            <Animated.View
              style={[
                styles.fabContainer,
                { transform: [{ scale: fabScale }] }
              ]}
            >
              <TouchableOpacity
                style={styles.todoistFab}
                onPress={openQuickAdd}
                activeOpacity={0.8}
                onLongPress={() => {
                  setShowBulkActions(!showBulkActions);
                }}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          </>
        ) : showQuickAdd ? (
          <QuickAddTask
            visible={showQuickAdd}
            onClose={() => setShowQuickAdd(false)}
            onSave={handleSaveTask}
            onOpenFullEditor={() => {
              setShowQuickAdd(false);
              setShowTaskEditor(true);
              setEditingTask(null);
            }}
            onProjectCreate={async (projectData) => {
              if (!user?.uid) return '';
              try {
                const newProject = await createProject(user.uid, projectData);
                return newProject.id;
              } catch (error) {
                console.error('Error creating project:', error);
                Alert.alert('Error', 'Failed to create project.');
                return '';
              }
            }}
            onLabelCreate={async (labelData) => {
              if (!user?.uid) return '';
              try {
                const newLabel = await createLabel(user.uid, labelData);
                return newLabel.id;
              } catch (error) {
                console.error('Error creating label:', error);
                Alert.alert('Error', 'Failed to create label.');
                return '';
              }
            }}
            projects={projects}
            labels={labels}
            defaultProject={selectedProjectId || ''}
            defaultLabels={selectedLabelIds}
          />
        ) : (
          <TaskEditor
            task={editingTask}
            projects={projects}
            labels={labels}
            onSave={handleSaveTask}
            onCancel={() => {
              setShowTaskEditor(false);
              setEditingTask(null);
            }}
            onProjectCreate={async (projectData) => {
              if (!user?.uid) return '';
              try {
                const newProject = await createProject(user.uid, projectData);
                return newProject.id;
              } catch (error) {
                console.error('Error creating project:', error);
                Alert.alert('Error', 'Failed to create project.');
                return '';
              }
            }}
            onLabelCreate={async (labelData) => {
              if (!user?.uid) return '';
              try {
                const newLabel = await createLabel(user.uid, labelData);
                return newLabel.id;
              } catch (error) {
                console.error('Error creating label:', error);
                Alert.alert('Error', 'Failed to create label.');
                return '';
              }
            }}
            onProjectDelete={handleDeleteProject}
            onAddSubtask={(parentId, subtaskData) => {
              // Handle subtask creation - convert to proper task data
              const taskData = {
                ...subtaskData,
                parentId,
                completed: false,
                priority: 4 as Priority,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              return handleSaveTask(taskData);
            }}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TODOIST_COLORS.background,
  },
  content: {
    flex: 1,
  },

  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  todoistLoader: {
    flexDirection: 'row',
    gap: 8,
  },
  loaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TODOIST_COLORS.primary,
  },
  loadingText: {
    fontSize: 16,
    color: TODOIST_COLORS.textSecondary,
    fontWeight: '500',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: TODOIST_COLORS.error,
    textAlign: 'center',
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: TODOIST_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Todoist Header
  todoistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: TODOIST_COLORS.border,
    backgroundColor: TODOIST_COLORS.background,
  },
  hamburgerButton: {
    padding: 4,
    marginRight: 16,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: TODOIST_COLORS.text,
  },
  taskCountBadge: {
    backgroundColor: TODOIST_COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  taskCountText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },

  // Quick Add Bar
  quickAddBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TODOIST_COLORS.surface,
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: TODOIST_COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickAddText: {
    flex: 1,
    fontSize: 16,
    color: TODOIST_COLORS.textSecondary,
    marginLeft: 12,
  },
  quickAddActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAddAction: {
    padding: 4,
  },

  // Task Groups
  taskGroup: {
    marginBottom: 8,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  groupIndicator: {
    width: 3,
    height: 16,
    borderRadius: 2,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: TODOIST_COLORS.text,
    flex: 1,
  },
  groupCount: {
    fontSize: 12,
    color: TODOIST_COLORS.textSecondary,
    backgroundColor: TODOIST_COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    textAlign: 'center',
  },

  // Task List
  listContainer: {
    paddingBottom: 100,
  },

  // Todoist FAB
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
  todoistFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: TODOIST_COLORS.primary,
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
});

export default TasksScreen;