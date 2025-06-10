// src/components/tasks/ViewOptions.tsx - Complete Todoist View Options Replica
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Switch,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

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

type ViewType = 'list' | 'board' | 'calendar';
type SortType = 'dueDate' | 'priority' | 'created' | 'alphabetical' | 'manual';
type GroupByType = 'none' | 'project' | 'priority' | 'assignee' | 'labels';

interface ViewOptionsProps {
  viewType: ViewType;
  sortBy: SortType;
  groupBy: GroupByType;
  showCompleted: boolean;
  showOnlyMyTasks: boolean;
  onViewTypeChange: (viewType: ViewType) => void;
  onSortChange: (sortBy: SortType) => void;
  onGroupByChange: (groupBy: GroupByType) => void;
  onShowCompletedChange: (show: boolean) => void;
  onShowOnlyMyTasksChange: (show: boolean) => void;
  onClose: () => void;
}

const ViewOptions: React.FC<ViewOptionsProps> = ({
  viewType,
  sortBy,
  groupBy,
  showCompleted,
  showOnlyMyTasks,
  onViewTypeChange,
  onSortChange,
  onGroupByChange,
  onShowCompletedChange,
  onShowOnlyMyTasksChange,
  onClose,
}) => {
  const viewTypes = [
    { id: 'list', name: 'List', icon: 'list' },
    { id: 'board', name: 'Board', icon: 'grid' },
    { id: 'calendar', name: 'Calendar', icon: 'calendar' },
  ];

  const sortOptions = [
    { id: 'dueDate', name: 'Date', icon: 'calendar' },
    { id: 'priority', name: 'Priority', icon: 'flag' },
    { id: 'alphabetical', name: 'Name', icon: 'text' },
    { id: 'created', name: 'Date added', icon: 'time' },
    { id: 'manual', name: 'Manual', icon: 'reorder-three' },
  ];

  const groupOptions = [
    { id: 'none', name: 'None', icon: 'remove' },
    { id: 'project', name: 'Project', icon: 'folder' },
    { id: 'priority', name: 'Priority', icon: 'flag' },
    { id: 'labels', name: 'Labels', icon: 'pricetag' },
    { id: 'assignee', name: 'Assignee', icon: 'person' },
  ];

  const renderOptionSection = (
    title: string,
    options: Array<{ id: string; name: string; icon: string }>,
    selectedValue: string,
    onSelect: (value: any) => void
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {options.map(option => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.optionItem,
            selectedValue === option.id && styles.optionItemSelected,
          ]}
          onPress={() => onSelect(option.id)}
        >
          <View style={styles.optionLeft}>
            <Ionicons
              name={option.icon as any}
              size={18}
              color={selectedValue === option.id ? TODOIST_COLORS.primary : TODOIST_COLORS.textSecondary}
            />
            <Text style={[
              styles.optionText,
              selectedValue === option.id && styles.optionTextSelected,
            ]}>
              {option.name}
            </Text>
          </View>
          {selectedValue === option.id && (
            <Ionicons name="checkmark" size={18} color={TODOIST_COLORS.primary} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderToggleOption = (
    title: string,
    description: string,
    value: boolean,
    onToggle: (value: boolean) => void,
    icon: string
  ) => (
    <View style={styles.toggleOption}>
      <View style={styles.toggleLeft}>
        <Ionicons name={icon as any} size={18} color={TODOIST_COLORS.textSecondary} />
        <View style={styles.toggleContent}>
          <Text style={styles.toggleTitle}>{title}</Text>
          <Text style={styles.toggleDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{
          false: TODOIST_COLORS.border,
          true: `${TODOIST_COLORS.primary}80`,
        }}
        thumbColor={value ? TODOIST_COLORS.primary : TODOIST_COLORS.textSecondary}
        ios_backgroundColor={TODOIST_COLORS.border}
      />
    </View>
  );

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayBackground}
          onPress={onClose}
          activeOpacity={1}
        />
        
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>View options</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={TODOIST_COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* View Type */}
            {renderOptionSection('Layout', viewTypes, viewType, onViewTypeChange)}

            {/* Sort By */}
            {renderOptionSection('Sort by', sortOptions, sortBy, onSortChange)}

            {/* Group By */}
            {renderOptionSection('Group by', groupOptions, groupBy, onGroupByChange)}

            {/* Display Options */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Display</Text>
              
              {renderToggleOption(
                'Show completed tasks',
                'Include completed tasks in the view',
                showCompleted,
                onShowCompletedChange,
                'checkmark-circle'
              )}

              {renderToggleOption(
                'Show only my tasks',
                'Filter to show only tasks assigned to you',
                showOnlyMyTasks,
                onShowOnlyMyTasksChange,
                'person'
              )}
            </View>

            {/* Pro Features */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pro Features</Text>
              
              <TouchableOpacity style={styles.proFeature}>
                <View style={styles.proFeatureLeft}>
                  <Ionicons name="star" size={18} color={TODOIST_COLORS.warning} />
                  <View style={styles.proFeatureContent}>
                    <Text style={styles.proFeatureTitle}>Custom filters</Text>
                    <Text style={styles.proFeatureDescription}>Create advanced custom filters</Text>
                  </View>
                </View>
                <View style={styles.proBadge}>
                  <Text style={styles.proText}>PRO</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.proFeature}>
                <View style={styles.proFeatureLeft}>
                  <Ionicons name="color-palette" size={18} color={TODOIST_COLORS.purple} />
                  <View style={styles.proFeatureContent}>
                    <Text style={styles.proFeatureTitle}>Custom themes</Text>
                    <Text style={styles.proFeatureDescription}>Personalize your workspace</Text>
                  </View>
                </View>
                <View style={styles.proBadge}>
                  <Text style={styles.proText}>PRO</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.proFeature}>
                <View style={styles.proFeatureLeft}>
                  <Ionicons name="analytics" size={18} color={TODOIST_COLORS.green} />
                  <View style={styles.proFeatureContent}>
                    <Text style={styles.proFeatureTitle}>Productivity tracking</Text>
                    <Text style={styles.proFeatureDescription}>Track your productivity trends</Text>
                  </View>
                </View>
                <View style={styles.proBadge}>
                  <Text style={styles.proText}>PRO</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    flex: 1,
  },
  container: {
    backgroundColor: TODOIST_COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: TODOIST_COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TODOIST_COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: TODOIST_COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  optionItemSelected: {
    backgroundColor: `${TODOIST_COLORS.primary}20`,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    color: TODOIST_COLORS.text,
  },
  optionTextSelected: {
    color: TODOIST_COLORS.primary,
    fontWeight: '600',
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  toggleContent: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    color: TODOIST_COLORS.text,
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 12,
    color: TODOIST_COLORS.textSecondary,
  },
  proFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    opacity: 0.7,
  },
  proFeatureLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  proFeatureContent: {
    flex: 1,
  },
  proFeatureTitle: {
    fontSize: 16,
    color: TODOIST_COLORS.text,
    marginBottom: 2,
  },
  proFeatureDescription: {
    fontSize: 12,
    color: TODOIST_COLORS.textSecondary,
  },
  proBadge: {
    backgroundColor: TODOIST_COLORS.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  proText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
});

export default ViewOptions;