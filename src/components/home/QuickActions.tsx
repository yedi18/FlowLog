// src/components/home/QuickActions.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onFilterPress: () => void;
  sortBy: 'time' | 'priority' | 'category';
  onSortChange: (sortBy: 'time' | 'priority' | 'category') => void;
}

const QuickActions: React.FC<Props> = ({
  onFilterPress,
  sortBy,
  onSortChange,
}) => {
  const getSortIcon = () => {
    switch (sortBy) {
      case 'time':
        return 'time-outline';
      case 'priority':
        return 'flag-outline';
      case 'category':
        return 'folder-outline';
      default:
        return 'swap-vertical-outline';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.reminderButton}>
        <Text style={styles.reminderText}>Quick Reminders</Text>
      </TouchableOpacity>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            const sortOptions: ('time' | 'priority' | 'category')[] = ['time', 'priority', 'category'];
            const currentIndex = sortOptions.indexOf(sortBy);
            const nextIndex = (currentIndex + 1) % sortOptions.length;
            onSortChange(sortOptions[nextIndex]);
          }}
        >
          <Ionicons name={getSortIcon()} size={20} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onFilterPress}>
          <Ionicons name="funnel-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  reminderButton: {
    backgroundColor: '#2979FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  reminderText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QuickActions;