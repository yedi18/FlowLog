// src/components/home/FloatingActionButtons.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onAddTask: () => void;
  onAddEvent: () => void;
}

const FloatingActionButtons: React.FC<Props> = ({ onAddTask, onAddEvent }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.fab, styles.taskFab]} onPress={onAddTask}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.fabText}>Task</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.fab, styles.eventFab]} onPress={onAddEvent}>
        <Ionicons name="calendar" size={20} color="#FFFFFF" />
        <Text style={styles.fabText}>Event</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    alignItems: 'center',
    gap: 12,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    flexDirection: 'column',
    paddingVertical: 8,
  },
  taskFab: {
    backgroundColor: '#2979FF',
  },
  eventFab: {
    backgroundColor: '#81C784',
  },
  fabText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
    marginTop: 2,
  },
});

export default FloatingActionButtons;