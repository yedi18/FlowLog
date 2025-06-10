// src/components/home/EventsList.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
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
  events: Event[];
  categoryColors: Record<string, string>;
  onNavigateToCalendar: () => void;
}

const EventsList: React.FC<Props> = ({
  events,
  categoryColors,
  onNavigateToCalendar,
}) => {
  const renderEvent = ({ item }: { item: Event }) => (
    <View style={[styles.eventCard, { borderLeftColor: categoryColors[item.category] }]}>
      <View style={styles.eventHeader}>
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={16} color="#CCCCCC" />
          <Text style={styles.timeText}>
            {item.startTime} – {item.endTime}
          </Text>
        </View>
      </View>
      <Text style={styles.eventTitle}>{item.title}</Text>
      <View style={styles.categoryContainer}>
        <View style={[styles.categoryTag, { backgroundColor: categoryColors[item.category] + '40' }]}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
    </View>
  );

  if (events.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.sectionTitle}>Today's Events</Text>
          <TouchableOpacity onPress={onNavigateToCalendar}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No events today</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Today's Events</Text>
        <TouchableOpacity onPress={onNavigateToCalendar}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
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
  eventCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventHeader: {
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginLeft: 6,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    textTransform: 'capitalize',
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

export default EventsList;