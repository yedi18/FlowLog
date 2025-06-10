// src/components/tasks/TaskItem.tsx - Complete Todoist Task Item Replica
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task, Project, Label, Priority, SubTask } from '../../types';

const { width } = Dimensions.get('window');

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

interface TaskItemProps {
  task: Task;
  index: number;
  viewType: 'list' | 'board' | 'calendar';
  isSelected: boolean;
  isExpanded: boolean;
  showBulkActions: boolean;
  onPress: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onToggleSelection: () => void;
  onToggleExpanded: () => void;
  projects: Project[];
  labels: Label[];
  priorityColors: Record<Priority, string>;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  index,
  viewType,
  isSelected,
  isExpanded,
  showBulkActions,
  onPress,
  onToggle,
  onDelete,
  onToggleSelection,
  onToggleExpanded,
  projects,
  labels,
  priorityColors,
}) => {
  const [showActions, setShowActions] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
  const taskLabels = task.labels ? labels.filter(l => task.labels!.includes(l.id)) : [];
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  const priorityColor = priorityColors[task.priority || 4];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  const isDueToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const getCheckboxColor = () => {
    if (task.completed) return TODOIST_COLORS.success;
    if (task.priority && task.priority < 4) return priorityColor;
    return TODOIST_COLORS.border;
  };

  const getCheckboxIcon = () => {
    if (task.completed) return 'checkmark-circle';
    if (task.priority && task.priority < 4) return 'radio-button-off';
    return 'ellipse-outline';
  };

  const handlePanGestureEvent = (event: any) => {
    // Simple swipe handling without PanGestureHandler
    // This would need react-native-gesture-handler to work properly
    console.log('Swipe detected:', event);
  };

  const handlePanStateChange = (event: any) => {
    // Simplified swipe handling
    console.log('Swipe state changed:', event);
  };

  const hideActions = () => {
    setShowActions(false);
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
  };

  const handleTaskPress = () => {
    if (showBulkActions) {
      onToggleSelection();
    } else {
      onPress();
    }
  };

  const renderSubtasks = () => {
    if (!hasSubtasks || !isExpanded) return null;

    return (
      <View style={styles.subtasksContainer}>
        {task.subtasks!.map((subtask, index) => (
          <View key={subtask.id || index} style={styles.subtaskItem}>
            <TouchableOpacity
              style={[
                styles.subtaskCheckbox,
                subtask.completed && styles.subtaskCheckboxCompleted,
              ]}
              onPress={() => {
                // Handle subtask toggle
              }}
            >
              <Ionicons
                name={subtask.completed ? "checkmark" : undefined}
                size={12}
                color={subtask.completed ? "#fff" : "transparent"}
              />
            </TouchableOpacity>
            <Text style={[
              styles.subtaskText,
              subtask.completed && styles.subtaskTextCompleted,
            ]}>
              {subtask.title}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderTaskContent = () => (
    <>
      {/* Task Header */}
      <View style={styles.taskHeader}>
        {/* Checkbox/Selection */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={showBulkActions ? onToggleSelection : onToggle}
        >
          {showBulkActions ? (
            <View style={[
              styles.selectionCheckbox,
              isSelected && styles.selectionCheckboxSelected,
            ]}>
              {isSelected && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
          ) : (
            <View style={[
              styles.checkbox,
              { borderColor: getCheckboxColor() },
              task.completed && { backgroundColor: getCheckboxColor() },
            ]}>
              <Ionicons
                name={getCheckboxIcon()}
                size={task.completed ? 20 : (task.priority && task.priority < 4 ? 16 : 20)}
                color={task.completed ? "#fff" : getCheckboxColor()}
              />
            </View>
          )}
        </TouchableOpacity>

        {/* Task Content */}
        <TouchableOpacity
          style={styles.taskContent}
          onPress={handleTaskPress}
          activeOpacity={0.7}
        >
          {/* Priority Indicator */}
          {task.priority && task.priority < 4 && (
            <View style={styles.priorityIndicator}>
              <View style={[
                styles.priorityBar,
                { backgroundColor: priorityColor },
              ]} />
            </View>
          )}

          {/* Task Text */}
          <View style={styles.taskTextContainer}>
            <Text style={[
              styles.taskTitle,
              task.completed && styles.taskTitleCompleted,
            ]} numberOfLines={viewType === 'list' ? 2 : undefined}>
              {task.title}
            </Text>

            {task.description && (
              <Text style={[
                styles.taskDescription,
                task.completed && styles.taskDescriptionCompleted,
              ]} numberOfLines={1}>
                {task.description}
              </Text>
            )}
          </View>

          {/* Task Metadata */}
          <View style={styles.taskMetadata}>
            {/* Project */}
            {project && (
              <View style={styles.projectChip}>
                <View style={[styles.projectDot, { backgroundColor: project.color }]} />
                <Text style={styles.projectText}>{project.name}</Text>
              </View>
            )}

            {/* Labels */}
            {taskLabels.length > 0 && (
              <View style={styles.labelsContainer}>
                {taskLabels.slice(0, 2).map(label => (
                  <View key={label.id} style={[
                    styles.labelChip,
                    { backgroundColor: `${label.color}20` },
                  ]}>
                    <Text style={[styles.labelText, { color: label.color }]}>
                      #{label.name}
                    </Text>
                  </View>
                ))}
                {taskLabels.length > 2 && (
                  <Text style={styles.moreLabels}>+{taskLabels.length - 2}</Text>
                )}
              </View>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <View style={[
                styles.dueDateChip,
                isOverdue && styles.dueDateOverdue,
                isDueToday && styles.dueDateToday,
              ]}>
                <Ionicons
                  name="calendar"
                  size={12}
                  color={isOverdue ? TODOIST_COLORS.error : isDueToday ? TODOIST_COLORS.success : TODOIST_COLORS.textSecondary}
                />
                <Text style={[
                  styles.dueDateText,
                  isOverdue && styles.dueDateTextOverdue,
                  isDueToday && styles.dueDateTextToday,
                ]}>
                  {formatDueDate(task.dueDate)}
                </Text>
              </View>
            )}

            {/* Subtasks Counter */}
            {hasSubtasks && (
              <TouchableOpacity
                style={styles.subtasksButton}
                onPress={onToggleExpanded}
              >
                <Ionicons
                  name="list"
                  size={12}
                  color={TODOIST_COLORS.textSecondary}
                />
                <Text style={styles.subtasksCount}>
                  {completedSubtasks}/{totalSubtasks}
                </Text>
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={12}
                  color={TODOIST_COLORS.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>

        {/* Actions Menu */}
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => {
            // Show context menu
          }}
        >
          <Ionicons name="ellipsis-horizontal" size={16} color={TODOIST_COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Subtasks */}
      {renderSubtasks()}
    </>
  );

  if (viewType === 'board') {
    return (
      <View style={[
        styles.boardCard,
        isSelected && styles.taskSelected,
      ]}>
        {renderTaskContent()}
      </View>
    );
  }

  return (
    <View style={styles.taskItemWrapper}>
      <Animated.View
        style={[
          styles.taskItem,
          isSelected && styles.taskSelected,
          task.completed && styles.taskCompleted,
          {
            transform: [
              { translateX },
              { scale },
            ],
            opacity,
          },
        ]}
      >
        {renderTaskContent()}
      </Animated.View>

      {/* Swipe Actions */}
      {showActions && (
        <View style={styles.swipeActions}>
          <TouchableOpacity
            style={[styles.swipeAction, styles.deleteAction]}
            onPress={() => {
              hideActions();
              onDelete();
            }}
          >
            <Ionicons name="trash" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.swipeAction, styles.editAction]}
            onPress={() => {
              hideActions();
              onPress();
            }}
          >
            <Ionicons name="create" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  taskItemWrapper: {
    position: 'relative',
  },
  taskItem: {
    backgroundColor: TODOIST_COLORS.background,
    marginHorizontal: 20,
    marginVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  taskSelected: {
    backgroundColor: TODOIST_COLORS.surface,
    borderColor: TODOIST_COLORS.primary,
  },
  taskCompleted: {
    opacity: 0.6,
  },

  // Board Card Style
  boardCard: {
    backgroundColor: TODOIST_COLORS.surface,
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: TODOIST_COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Task Header
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 60,
  },

  // Checkbox
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: TODOIST_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  selectionCheckboxSelected: {
    backgroundColor: TODOIST_COLORS.primary,
    borderColor: TODOIST_COLORS.primary,
  },

  // Task Content
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  priorityIndicator: {
    marginRight: 8,
    marginTop: 2,
  },
  priorityBar: {
    width: 3,
    height: 16,
    borderRadius: 2,
  },
  taskTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 14,
    color: TODOIST_COLORS.text,
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 2,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: TODOIST_COLORS.textSecondary,
  },
  taskDescription: {
    fontSize: 12,
    color: TODOIST_COLORS.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  taskDescriptionCompleted: {
    color: TODOIST_COLORS.textTertiary,
  },

  // Task Metadata
  taskMetadata: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
    minWidth: 80,
  },
  projectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TODOIST_COLORS.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  projectDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  projectText: {
    fontSize: 10,
    color: TODOIST_COLORS.textSecondary,
    fontWeight: '500',
  },
  labelsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
    maxWidth: 120,
  },
  labelChip: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  labelText: {
    fontSize: 9,
    fontWeight: '500',
  },
  moreLabels: {
    fontSize: 9,
    color: TODOIST_COLORS.textTertiary,
    fontWeight: '500',
  },
  dueDateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TODOIST_COLORS.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 3,
  },
  dueDateOverdue: {
    backgroundColor: `${TODOIST_COLORS.error}20`,
  },
  dueDateToday: {
    backgroundColor: `${TODOIST_COLORS.success}20`,
  },
  dueDateText: {
    fontSize: 10,
    color: TODOIST_COLORS.textSecondary,
    fontWeight: '500',
  },
  dueDateTextOverdue: {
    color: TODOIST_COLORS.error,
  },
  dueDateTextToday: {
    color: TODOIST_COLORS.success,
  },
  subtasksButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TODOIST_COLORS.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 3,
  },
  subtasksCount: {
    fontSize: 10,
    color: TODOIST_COLORS.textSecondary,
    fontWeight: '500',
  },

  // More Button
  moreButton: {
    padding: 8,
    marginLeft: 4,
  },

  // Subtasks
  subtasksContainer: {
    paddingLeft: 48,
    paddingRight: 16,
    paddingBottom: 12,
    gap: 8,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subtaskCheckbox: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: TODOIST_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtaskCheckboxCompleted: {
    backgroundColor: TODOIST_COLORS.success,
    borderColor: TODOIST_COLORS.success,
  },
  subtaskText: {
    fontSize: 12,
    color: TODOIST_COLORS.textSecondary,
    flex: 1,
  },
  subtaskTextCompleted: {
    textDecorationLine: 'line-through',
    color: TODOIST_COLORS.textTertiary,
  },

  // Swipe Actions
  swipeActions: {
    position: 'absolute',
    right: 20,
    top: 2,
    bottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  swipeAction: {
    width: 40,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteAction: {
    backgroundColor: TODOIST_COLORS.error,
  },
  editAction: {
    backgroundColor: TODOIST_COLORS.blue,
  },
});

export default TaskItem;