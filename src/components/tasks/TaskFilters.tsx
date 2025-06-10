// src/components/tasks/TaskFilters.tsx
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Project {
  id: string;
  name: string;
  color: string;
}

interface Label {
  id: string;
  name: string;
  color: string;
}

interface Props {
  projects: Project[];
  labels: Label[];
  selectedProjectId?: string;
  selectedLabelIds: string[];
  onProjectSelect: (projectId?: string) => void;
  onLabelToggle: (labelId: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const TaskFilters: React.FC<Props> = ({
  projects,
  labels,
  selectedProjectId,
  selectedLabelIds,
  onProjectSelect,
  onLabelToggle,
  onClearFilters,
  hasActiveFilters,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Clear Filters */}
        {hasActiveFilters && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={onClearFilters}
          >
            <Ionicons name="close" size={14} color="#ff4757" />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}

        {/* All Projects Chip */}
        <TouchableOpacity
          style={[
            styles.chip,
            !selectedProjectId && styles.chipActive
          ]}
          onPress={() => onProjectSelect(undefined)}
        >
          <Text style={[
            styles.chipText,
            !selectedProjectId && styles.chipTextActive
          ]}>
            All Projects
          </Text>
        </TouchableOpacity>

        {/* Project Chips */}
        {projects.map(project => (
          <TouchableOpacity
            key={project.id}
            style={[
              styles.chip,
              selectedProjectId === project.id && styles.chipActive,
              { borderColor: project.color }
            ]}
            onPress={() => onProjectSelect(
              selectedProjectId === project.id ? undefined : project.id
            )}
          >
            <View style={[styles.projectDot, { backgroundColor: project.color }]} />
            <Text style={[
              styles.chipText,
              selectedProjectId === project.id && { color: project.color }
            ]}>
              {project.name}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Label Chips */}
        {labels.map(label => (
          <TouchableOpacity
            key={label.id}
            style={[
              styles.chip,
              selectedLabelIds.includes(label.id) && [
                styles.chipActive,
                { backgroundColor: label.color + '20', borderColor: label.color }
              ]
            ]}
            onPress={() => onLabelToggle(label.id)}
          >
            <View style={[styles.labelDot, { backgroundColor: label.color }]} />
            <Text style={[
              styles.chipText,
              selectedLabelIds.includes(label.id) && { color: label.color }
            ]}>
              #{label.name}
            </Text>
            {selectedLabelIds.includes(label.id) && (
              <Ionicons name="checkmark" size={14} color={label.color} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ff4757',
    gap: 4,
  },
  clearButtonText: {
    fontSize: 12,
    color: '#ff4757',
    fontWeight: '500',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#333',
    gap: 6,
    minHeight: 32,
  },
  chipActive: {
    backgroundColor: '#2979FF20',
    borderColor: '#2979FF',
  },
  chipText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#2979FF',
  },
  projectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  labelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default TaskFilters;