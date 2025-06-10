// src/components/home/FilterModal.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  categoryFilter: string | null;
  onCategoryFilterChange: (category: string | null) => void;
  categoryColors: Record<string, string>;
}

const FilterModal: React.FC<Props> = ({
  visible,
  onClose,
  categoryFilter,
  onCategoryFilterChange,
  categoryColors,
}) => {
  const categories = Object.keys(categoryColors);

  const handleCategorySelect = (category: string) => {
    if (categoryFilter === category) {
      onCategoryFilterChange(null);
    } else {
      onCategoryFilterChange(category);
    }
  };

  const clearAllFilters = () => {
    onCategoryFilterChange(null);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter Tasks</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.categoryGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      { backgroundColor: categoryColors[category] + '40' },
                      categoryFilter === category && {
                        borderColor: categoryColors[category],
                        borderWidth: 2,
                      },
                    ]}
                    onPress={() => handleCategorySelect(category)}
                  >
                    <View style={styles.categoryContent}>
                      <View
                        style={[
                          styles.categoryIndicator,
                          { backgroundColor: categoryColors[category] },
                        ]}
                      />
                      <Text style={styles.categoryText}>{category}</Text>
                      {categoryFilter === category && (
                        <Ionicons name="checkmark-circle" size={16} color={categoryColors[category]} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {categoryFilter && (
              <View style={styles.activeFiltersSection}>
                <Text style={styles.sectionTitle}>Active Filters</Text>
                <View style={styles.activeFilter}>
                  <View
                    style={[
                      styles.activeFilterIndicator,
                      { backgroundColor: categoryColors[categoryFilter] },
                    ]}
                  />
                  <Text style={styles.activeFilterText}>Category: {categoryFilter}</Text>
                  <TouchableOpacity onPress={() => onCategoryFilterChange(null)}>
                    <Ionicons name="close-circle" size={18} color="#CCCCCC" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearAllFilters}
              disabled={!categoryFilter}
            >
              <Text style={[
                styles.clearButtonText,
                !categoryFilter && styles.disabledText
              ]}>
                Clear All Filters
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.applyButton} onPress={onClose}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  categoryGrid: {
    gap: 8,
  },
  categoryOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    textTransform: 'capitalize',
    flex: 1,
  },
  activeFiltersSection: {
    marginBottom: 20,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: 8,
    borderRadius: 8,
  },
  activeFilterIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  activeFilterText: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
    textTransform: 'capitalize',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  disabledText: {
    color: '#666666',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#2979FF',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default FilterModal;