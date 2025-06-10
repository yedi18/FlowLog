// src/components/notes/EmptyNotesState.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  searchQuery: string;
  onlyFavorites: boolean;
  onlyPinned: boolean;
}

const EmptyNotesState: React.FC<Props> = ({
  searchQuery,
  onlyFavorites,
  onlyPinned,
}) => {
  const getEmptyStateData = () => {
    if (searchQuery) {
      return {
        icon: 'search-outline',
        title: 'No notes found',
        description: 'Try adjusting your search terms'
      };
    }
    
    if (onlyFavorites) {
      return {
        icon: 'heart-outline',
        title: 'No favorite notes',
        description: 'Mark some notes as favorites to see them here'
      };
    }
    
    if (onlyPinned) {
      return {
        icon: 'pin-outline',
        title: 'No pinned notes',
        description: 'Pin some notes to see them here'
      };
    }
    
    return {
      icon: 'document-text-outline',
      title: 'No notes yet',
      description: 'Tap + to create your first note'
    };
  };

  const { icon, title, description } = getEmptyStateData();

  return (
    <View style={styles.emptyState}>
      <Ionicons
        name={icon as keyof typeof Ionicons.glyphMap}
        size={48}
        color="#666"
      />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default EmptyNotesState;