// src/components/tasks/TasksHeader.tsx - Simple Todoist Header
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Todoist Theme Colors
const TODOIST_COLORS = {
  background: '#1f1f1f',
  surface: '#282828',
  surfaceElevated: '#2d2d2d',
  primary: '#DC4C3E',
  text: '#FFFFFF',
  textSecondary: '#8B8B8B',
  border: '#333333',
};

interface TasksHeaderProps {
  title: string;
  count?: number;
  onMenuPress: () => void;
  onSearchPress?: () => void;
  onOptionsPress?: () => void;
}

const TasksHeader: React.FC<TasksHeaderProps> = ({
  title,
  count,
  onMenuPress,
  onSearchPress,
  onOptionsPress,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
        <Ionicons name="menu" size={24} color={TODOIST_COLORS.text} />
      </TouchableOpacity>
      
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {count !== undefined && count > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.actions}>
        {onSearchPress && (
          <TouchableOpacity style={styles.actionButton} onPress={onSearchPress}>
            <Ionicons name="search" size={20} color={TODOIST_COLORS.textSecondary} />
          </TouchableOpacity>
        )}
        
        {onOptionsPress && (
          <TouchableOpacity style={styles.actionButton} onPress={onOptionsPress}>
            <Ionicons name="options" size={20} color={TODOIST_COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: TODOIST_COLORS.border,
    backgroundColor: TODOIST_COLORS.background,
  },
  menuButton: {
    padding: 4,
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: TODOIST_COLORS.text,
  },
  countBadge: {
    backgroundColor: TODOIST_COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
});

export default TasksHeader;