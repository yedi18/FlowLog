// src/components/home/TasksList.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

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

interface Props {
  tasks: Task[];
  categoryFilter: string | null;
  onClearFilter: () => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onNavigateToTasks: () => void;
  categoryColors: Record<string, string>;
  priorityColors: Record<string, string>;
}

const TasksList: React.FC<Props> = ({
  tasks,
  categoryFilter,
  onClearFilter,
  onToggleTask,
  onDeleteTask,
  onNavigateToTasks,
  categoryColors,
  priorityColors,
}) => {
  const renderRightAction = (taskId: string) => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => onDeleteTask(taskId)}
    >
      <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );

  const renderTask = ({ item }: { item: Task }) => (
    <Swipeable renderRightActions={() => renderRightAction(item.id)}>
      <View style={[styles.taskCard, { borderRightColor: categoryColors[item.category] }]}>
        <TouchableOpacity
          style={styles.taskContent}
          onPress={() => onToggleTask(item.id)}
        >
          <View style={styles.taskLeft}>
            <TouchableOpacity
              style={[
                styles.checkbox,
                item.completed && { backgroundColor: '#2979FF' },
              ]}
              onPress={() => onToggleTask(item.id)}
            >
              {item.completed && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
            <View style={styles.taskInfo}>
              <Text style={[styles.taskTitle, item.completed && styles.completedText]}>
                {item.title}
              </Text>
              <View style={styles.taskMeta}>
                <View style={[styles.categoryTag, { backgroundColor: categoryColors[item.category] + '40' }]}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                {item.priority === 'high' && (
                  <Ionicons name="flag" size={12} color={priorityColors.high} style={styles.priorityIcon} />
                )}
                {item.dueTime && (
                  <Text style={styles.timeText}>{item.dueTime}</Text>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Today's Tasks</Text>
        <TouchableOpacity onPress={onNavigateToTasks}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {categoryFilter && (
        <View style={styles.filterContainer}>
          <Text style={styles.filterText}>Filtered by: {categoryFilter}</Text>
          <TouchableOpacity onPress={onClearFilter}>
            <Ionicons name="close-circle" size={20} color="#2979FF" />
          </TouchableOpacity>
        </View>
      )}

      {tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {categoryFilter ? 'No tasks in this category' : 'No tasks today'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2979FF',
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  filterText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  taskCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 8,
    borderRightWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  taskContent: {
    padding: 16,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#CCCCCC',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  priorityIcon: {
    marginLeft: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  deleteAction: {
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  emptyContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
});

export default TasksList;