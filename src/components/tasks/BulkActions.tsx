// src/components/tasks/BulkActions.tsx - Complete Todoist Bulk Actions Replica
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

interface BulkActionsProps {
  selectedCount: number;
  onComplete: () => void;
  onDelete: () => void;
  onMove: () => void;
  onSchedule: () => void;
  onCancel: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  onComplete,
  onDelete,
  onMove,
  onSchedule,
  onCancel,
}) => {
  const actions = [
    {
      id: 'complete',
      icon: 'checkmark-circle',
      label: 'Complete',
      color: TODOIST_COLORS.success,
      onPress: onComplete,
    },
    {
      id: 'schedule',
      icon: 'calendar',
      label: 'Schedule',
      color: TODOIST_COLORS.blue,
      onPress: onSchedule,
    },
    {
      id: 'move',
      icon: 'folder',
      label: 'Move',
      color: TODOIST_COLORS.purple,
      onPress: onMove,
    },
    {
      id: 'delete',
      icon: 'trash',
      label: 'Delete',
      color: TODOIST_COLORS.error,
      onPress: onDelete,
    },
  ];

  return (
    <Animated.View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Ionicons name="close" size={20} color={TODOIST_COLORS.textSecondary} />
        </TouchableOpacity>
        
        <Text style={styles.selectedText}>
          {selectedCount} task{selectedCount !== 1 ? 's' : ''} selected
        </Text>
        
        <View style={styles.spacer} />
      </View>
      
      <View style={styles.actionsContainer}>
        {actions.map(action => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionButton}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
              <Ionicons name={action.icon as any} size={20} color={action.color} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: TODOIST_COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: TODOIST_COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cancelButton: {
    padding: 4,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: '600',
    color: TODOIST_COLORS.text,
    marginLeft: 12,
  },
  spacer: {
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 12,
    color: TODOIST_COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default BulkActions;