// src/components/tasks/FilterChips.tsx - Complete Todoist Filter Chips Replica
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Project, Label } from '../../types';

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

interface FilterChipsProps {
  projects: Project[];
  labels: Label[];
  selectedProjectId: string | null;
  selectedLabelIds: string[];
  showOnlyMyTasks: boolean;
  searchQuery: string;
  onProjectSelect: (projectId: string | null) => void;
  onLabelToggle: (labelId: string) => void;
  onClearFilters: () => void;
  onToggleMyTasks: () => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  projects,
  labels,
  selectedProjectId,
  selectedLabelIds,
  showOnlyMyTasks,
  searchQuery,
  onProjectSelect,
  onLabelToggle,
  onClearFilters,
  onToggleMyTasks,
}) => {
  const selectedProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;
  const selectedLabelsData = labels.filter(l => selectedLabelIds.includes(l.id));
  
  const hasActiveFilters = selectedProjectId || selectedLabelIds.length > 0 || showOnlyMyTasks || searchQuery;

  if (!hasActiveFilters) {
    return null;
  }

  const renderChip = (
    content: string,
    onRemove: () => void,
    color?: string,
    icon?: string
  ) => (
    <View style={[styles.chip, color && { backgroundColor: `${color}20` }]}>
      {icon && (
        <Ionicons 
          name={icon as any} 
          size={12} 
          color={color || TODOIST_COLORS.textSecondary} 
        />
      )}
      <Text style={[
        styles.chipText,
        color && { color },
      ]}>
        {content}
      </Text>
      <TouchableOpacity style={styles.chipRemove} onPress={onRemove}>
        <Ionicons name="close" size={12} color={color || TODOIST_COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Query Chip */}
        {searchQuery && renderChip(
          `Search: "${searchQuery}"`,
          () => onClearFilters(),
          TODOIST_COLORS.blue,
          'search'
        )}

        {/* Project Chip */}
        {selectedProject && renderChip(
          selectedProject.name,
          () => onProjectSelect(null),
          selectedProject.color,
          'folder'
        )}

        {/* Label Chips */}
        {selectedLabelsData.map(label => renderChip(
          `#${label.name}`,
          () => onLabelToggle(label.id),
          label.color,
          'pricetag'
        ))}

        {/* My Tasks Chip */}
        {showOnlyMyTasks && renderChip(
          'My tasks',
          onToggleMyTasks,
          TODOIST_COLORS.purple,
          'person'
        )}

        {/* Clear All Button */}
        {hasActiveFilters && (
          <TouchableOpacity style={styles.clearButton} onPress={onClearFilters}>
            <Ionicons name="close-circle" size={16} color={TODOIST_COLORS.primary} />
            <Text style={styles.clearButtonText}>Clear all</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  scrollView: {
    paddingHorizontal: 20,
  },
  scrollContent: {
    gap: 8,
    paddingRight: 20,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TODOIST_COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: TODOIST_COLORS.border,
    gap: 4,
  },
  chipText: {
    fontSize: 12,
    color: TODOIST_COLORS.text,
    fontWeight: '500',
  },
  chipRemove: {
    padding: 2,
    marginLeft: 2,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: `${TODOIST_COLORS.primary}20`,
    gap: 4,
  },
  clearButtonText: {
    fontSize: 12,
    color: TODOIST_COLORS.primary,
    fontWeight: '600',
  },
});

export default FilterChips;