// src/components/home/CurrentEventBanner.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  category: 'work' | 'personal' | 'health' | 'shopping';
  description?: string;
  location?: string;
}

interface Props {
  currentEvent?: Event;
  upcomingEvent?: Event;
}

const CurrentEventBanner: React.FC<Props> = ({
  currentEvent,
  upcomingEvent,
}) => {
  if (!currentEvent && !upcomingEvent) {
    return null;
  }

  const event = currentEvent || upcomingEvent;
  if (!event) return null;
  
  const isCurrentEvent = !!currentEvent;

  return (
    <View style={[
      styles.currentEventContainer,
      isCurrentEvent ? styles.currentEventActive : styles.upcomingEvent
    ]}>
      <Ionicons
        name={isCurrentEvent ? "radio-button-on" : "time-outline"}
        size={16}
        color={isCurrentEvent ? "#4CAF50" : "#FF9800"}
      />
      <Text style={styles.currentEventText}>
        {isCurrentEvent 
          ? `Now: ${event.title}` 
          : `Next: ${event.title} at ${event.startTime}`
        }
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  currentEventContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  currentEventActive: {
    borderLeftColor: '#4CAF50',
    backgroundColor: '#4CAF5010',
  },
  upcomingEvent: {
    borderLeftColor: '#FF9800',
    backgroundColor: '#FF980010',
  },
  currentEventText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default CurrentEventBanner;