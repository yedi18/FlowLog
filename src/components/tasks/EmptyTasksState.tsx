// src/components/tasks/EmptyTasksState.tsx - Complete Todoist Empty State Replica
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskTab } from '../../types';

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

interface EmptyTasksStateProps {
  activeTab: TaskTab;
  searchQuery: string;
  hasFilters: boolean;
  onAddTask: () => void;
}

const EmptyTasksState: React.FC<EmptyTasksStateProps> = ({
  activeTab,
  searchQuery,
  hasFilters,
  onAddTask,
}) => {
  const getEmptyStateContent = () => {
    if (searchQuery) {
      return {
        icon: 'search',
        title: 'No tasks found',
        description: `No tasks match "${searchQuery}". Try adjusting your search or add a new task.`,
        actionText: 'Add task',
        actionIcon: 'add',
        showAction: true,
      };
    }

    if (hasFilters) {
      return {
        icon: 'funnel',
        title: 'No tasks match your filters',
        description: 'Try clearing some filters or add a new task that matches your current filters.',
        actionText: 'Clear filters',
        actionIcon: 'close-circle',
        showAction: false,
      };
    }

    switch (activeTab) {
      case 'today':
        return {
          icon: 'calendar',
          title: 'A clean slate',
          description: 'Looks like everything on your list is done. Enjoy your day!',
          actionText: 'Add task for today',
          actionIcon: 'add',
          showAction: true,
          emoji: '🎉',
        };

      case 'upcoming':
        return {
          icon: 'calendar-outline',
          title: 'Get ahead of the game',
          description: 'You don\'t have any upcoming tasks. Plan ahead by adding tasks with due dates.',
          actionText: 'Add upcoming task',
          actionIcon: 'add',
          showAction: true,
          emoji: '📅',
        };

      case 'completed':
        return {
          icon: 'checkmark-circle',
          title: 'No completed tasks yet',
          description: 'When you complete tasks, they\'ll appear here. Start by adding and completing your first task!',
          actionText: 'Add task',
          actionIcon: 'add',
          showAction: true,
          emoji: '✅',
        };

      case 'inbox':
        return {
          icon: 'inbox',
          title: 'Your Inbox is empty',
          description: 'Add tasks that don\'t belong to a specific project here. This is your default collection point.',
          actionText: 'Add task to Inbox',
          actionIcon: 'add',
          showAction: true,
          emoji: '📥',
        };

      default:
        return {
          icon: 'list',
          title: 'No tasks here',
          description: 'Start by adding your first task and get organized!',
          actionText: 'Add task',
          actionIcon: 'add',
          showAction: true,
          emoji: '🚀',
        };
    }
  };

  const content = getEmptyStateContent();

  const suggestions = [
    { text: 'Buy groceries', icon: 'basket' },
    { text: 'Call dentist', icon: 'call' },
    { text: 'Plan weekend trip', icon: 'airplane' },
    { text: 'Review budget', icon: 'calculator' },
    { text: 'Exercise for 30 min', icon: 'fitness' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Main Icon/Emoji */}
        <View style={styles.iconContainer}>
          {content.emoji ? (
            <Text style={styles.emoji}>{content.emoji}</Text>
          ) : (
            <View style={styles.iconBackground}>
              <Ionicons name={content.icon as any} size={48} color={TODOIST_COLORS.textSecondary} />
            </View>
          )}
        </View>

        {/* Title and Description */}
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.description}>{content.description}</Text>

        {/* Action Button */}
        {content.showAction && (
          <TouchableOpacity style={styles.actionButton} onPress={onAddTask}>
            <Ionicons name={content.actionIcon as any} size={20} color="#fff" />
            <Text style={styles.actionButtonText}>{content.actionText}</Text>
          </TouchableOpacity>
        )}

        {/* Quick Suggestions (only for certain empty states) */}
        {(activeTab === 'inbox' || activeTab === 'today') && !searchQuery && !hasFilters && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Quick add suggestions</Text>
            <View style={styles.suggestionsList}>
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => {
                    // This would typically add the task directly
                    onAddTask();
                  }}
                >
                  <Ionicons name={suggestion.icon as any} size={16} color={TODOIST_COLORS.textSecondary} />
                  <Text style={styles.suggestionText}>{suggestion.text}</Text>
                  <Ionicons name="add" size={16} color={TODOIST_COLORS.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Productivity Tips */}
        {activeTab === 'today' && !searchQuery && !hasFilters && (
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Productivity tip</Text>
            <Text style={styles.tipsText}>
              Start your day by adding 2-3 important tasks. This helps you stay focused and accomplish what matters most.
            </Text>
          </View>
        )}

        {/* Feature Highlights for Pro */}
        {(activeTab === 'upcoming' || activeTab === 'completed') && !searchQuery && !hasFilters && (
          <View style={styles.proHighlight}>
            <View style={styles.proIcon}>
              <Ionicons name="star" size={20} color={TODOIST_COLORS.warning} />
            </View>
            <Text style={styles.proTitle}>Unlock Todoist Pro</Text>
            <Text style={styles.proDescription}>
              Get reminders, custom filters, and more advanced features to supercharge your productivity.
            </Text>
            <TouchableOpacity style={styles.proButton}>
              <Text style={styles.proButtonText}>Learn more</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: TODOIST_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: TODOIST_COLORS.border,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: TODOIST_COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: TODOIST_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TODOIST_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 24,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  suggestionsContainer: {
    width: '100%',
    marginTop: 16,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: TODOIST_COLORS.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  suggestionsList: {
    gap: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TODOIST_COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: TODOIST_COLORS.border,
    gap: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: TODOIST_COLORS.text,
  },
  tipsContainer: {
    backgroundColor: `${TODOIST_COLORS.blue}20`,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    borderWidth: 1,
    borderColor: `${TODOIST_COLORS.blue}40`,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: TODOIST_COLORS.text,
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: TODOIST_COLORS.textSecondary,
    lineHeight: 18,
  },
  proHighlight: {
    backgroundColor: TODOIST_COLORS.surface,
    padding: 20,
    borderRadius: 12,
    marginTop: 24,
    borderWidth: 1,
    borderColor: TODOIST_COLORS.border,
    alignItems: 'center',
  },
  proIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${TODOIST_COLORS.warning}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  proTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TODOIST_COLORS.text,
    marginBottom: 8,
  },
  proDescription: {
    fontSize: 14,
    color: TODOIST_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  proButton: {
    backgroundColor: TODOIST_COLORS.warning,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  proButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});

export default EmptyTasksState;