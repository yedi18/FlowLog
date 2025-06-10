// src/components/notes/NotesHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ViewMode = 'grid' | 'list' | 'detailed';
type SortMode = 'recent' | 'created' | 'alphabetical' | 'wordCount';

interface Props {
  onAdd: () => void;
  onFilter: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortMode;
  onSortChange: (sort: SortMode) => void;
  hasActiveFilters: boolean;
}

const NotesHeader: React.FC<Props> = ({
  onAdd,
  onFilter,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  hasActiveFilters,
}) => {
  const handleViewModeToggle = () => {
    const modes: ViewMode[] = ['list', 'grid', 'detailed'];
    const currentIndex = modes.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    onViewModeChange(modes[nextIndex]);
  };

  const handleSortToggle = () => {
    const sorts: SortMode[] = ['recent', 'created', 'alphabetical', 'wordCount'];
    const currentIndex = sorts.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % sorts.length;
    onSortChange(sorts[nextIndex]);
  };

  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Notes</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={onFilter}
        >
          <Ionicons
            name="funnel-outline"
            size={20}
            color={hasActiveFilters ? "#2979FF" : "#fff"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleViewModeToggle}
        >
          <Ionicons
            name={
              viewMode === 'list' ? "list-outline" :
                viewMode === 'grid' ? "grid-outline" :
                  "reader-outline"
            }
            size={20}
            color="#fff"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleSortToggle}
        >
          <Ionicons name="swap-vertical-outline" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={onAdd}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#2979FF',
  },
});

export default NotesHeader;