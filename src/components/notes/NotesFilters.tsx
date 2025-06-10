// src/components/notes/NotesFilters.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  pinned?: boolean;
  color?: string;
  favorite?: boolean;
  wordCount?: number;
  readTime?: number;
  category?: 'personal' | 'work' | 'ideas' | 'shopping';
}

type SortMode = 'recent' | 'created' | 'alphabetical' | 'wordCount';

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  onlyFavorites: boolean;
  onFavoritesChange: (value: boolean) => void;
  onlyPinned: boolean;
  onPinnedChange: (value: boolean) => void;
  sortBy: SortMode;
  onSortChange: (sort: SortMode) => void;
  notes: Note[];
  categoryColors: Record<string, string>;
}

const NotesFilters: React.FC<Props> = ({
  visible,
  onClose,
  selectedTags,
  onTagsChange,
  selectedCategories,
  onCategoriesChange,
  onlyFavorites,
  onFavoritesChange,
  onlyPinned,
  onPinnedChange,
  sortBy,
  onSortChange,
  notes,
  categoryColors,
}) => {
  const getAllTags = () => {
    const allTags = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  };

  const handleTagToggle = (tag: string) => {
    onTagsChange(
      selectedTags.includes(tag)
        ? selectedTags.filter(t => t !== tag)
        : [...selectedTags, tag]
    );
  };

  const handleCategoryToggle = (category: string) => {
    onCategoriesChange(
      selectedCategories.includes(category)
        ? selectedCategories.filter(c => c !== category)
        : [...selectedCategories, category]
    );
  };

  const handleReset = () => {
    onTagsChange([]);
    onCategoriesChange([]);
    onFavoritesChange(false);
    onPinnedChange(false);
    onSortChange('recent');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Filters & Sort</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.saveButton}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.filterFormContainer}>
          {/* Quick Filters */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupTitle}>Quick Filters</Text>

            <View style={styles.filterToggleContainer}>
              <View style={styles.filterToggle}>
                <Text style={styles.filterToggleLabel}>Show only favorites</Text>
                <Switch
                  value={onlyFavorites}
                  onValueChange={onFavoritesChange}
                  trackColor={{ false: '#333', true: '#ff4757' }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.filterToggle}>
                <Text style={styles.filterToggleLabel}>Show only pinned</Text>
                <Switch
                  value={onlyPinned}
                  onValueChange={onPinnedChange}
                  trackColor={{ false: '#333', true: '#FF9800' }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          </View>

          {/* Sort Options */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupTitle}>Sort by</Text>
            <View style={styles.sortOptions}>
              {([
                { key: 'recent', label: 'Last modified' },
                { key: 'created', label: 'Date created' },
                { key: 'alphabetical', label: 'Title A-Z' },
                { key: 'wordCount', label: 'Word count' },
              ] as const).map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.sortOption,
                    sortBy === option.key && styles.selectedSortOption
                  ]}
                  onPress={() => onSortChange(option.key)}
                >
                  <Text style={[
                    styles.sortOptionText,
                    sortBy === option.key && styles.selectedSortOptionText
                  ]}>
                    {option.label}
                  </Text>
                  {sortBy === option.key && (
                    <Ionicons name="checkmark" size={16} color="#2979FF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Categories */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupTitle}>Categories</Text>
            <View style={styles.filterCategoryContainer}>
              {(['personal', 'work', 'ideas', 'shopping'] as const).map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterCategoryOption,
                    selectedCategories.includes(category) && styles.filterCategoryOptionActive,
                    { borderColor: categoryColors[category] }
                  ]}
                  onPress={() => handleCategoryToggle(category)}
                >
                  <Text style={[
                    styles.filterCategoryLabel,
                    selectedCategories.includes(category) && { color: categoryColors[category] }
                  ]}>
                    {category}
                  </Text>
                  {selectedCategories.includes(category) && (
                    <Ionicons name="checkmark" size={14} color={categoryColors[category]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tags */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupTitle}>Tags</Text>
            <View style={styles.filterTagContainer}>
              {getAllTags().map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.filterTagOption,
                    selectedTags.includes(tag) && styles.filterTagOptionActive
                  ]}
                  onPress={() => handleTagToggle(tag)}
                >
                  <Text style={[
                    styles.filterTagLabel,
                    selectedTags.includes(tag) && styles.filterTagLabelActive
                  ]}>
                    #{tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  cancelButton: {
    fontSize: 16,
    color: '#2979FF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  saveButton: {
    fontSize: 16,
    color: '#2979FF',
    fontWeight: '600',
  },
  filterFormContainer: {
    padding: 20,
  },
  filterGroup: {
    marginBottom: 24,
  },
  filterGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  filterToggleContainer: {
    gap: 12,
  },
  filterToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  filterToggleLabel: {
    fontSize: 14,
    color: '#fff',
  },
  sortOptions: {
    gap: 8,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  selectedSortOption: {
    backgroundColor: '#2979FF20',
    borderWidth: 1,
    borderColor: '#2979FF',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#fff',
  },
  selectedSortOptionText: {
    color: '#2979FF',
    fontWeight: '500',
  },
  filterCategoryContainer: {
    gap: 8,
  },
  filterCategoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#666',
  },
  filterCategoryOptionActive: {
    backgroundColor: 'rgba(41, 121, 255, 0.1)',
  },
  filterCategoryLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  filterTagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterTagOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#666',
  },
  filterTagOptionActive: {
    backgroundColor: '#2979FF20',
    borderColor: '#2979FF',
  },
  filterTagLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  filterTagLabelActive: {
    color: '#2979FF',
  },
});

export default NotesFilters;