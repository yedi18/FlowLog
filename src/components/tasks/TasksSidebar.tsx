// src/components/tasks/TasksSidebar.tsx - Complete Todoist Sidebar Replica
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskTab, Project, Label } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const { width } = Dimensions.get('window');

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

interface TasksSidebarProps {
  visible: boolean;
  onClose: () => void;
  activeCategory: TaskTab;
  onCategorySelect: (category: TaskTab) => void;
  projects: Project[];
  labels: Label[];
  taskCounts: {
    today: number;
    upcoming: number;
    inbox: number;
    completed: number;
    overdue: number;
  };
  favorites: string[];
  onProjectSelect: (projectId: string) => void;
  onLabelSelect: (labelId: string) => void;
  onToggleFavorite: (id: string, type: 'project' | 'label' | 'filter') => void;
  selectedProjectId: string | null;
  selectedLabelIds: string[];
  onCreateProject: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<string>;
  onCreateLabel: (labelData: Omit<Label, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<string>;
}

interface CategoryItem {
  id: TaskTab;
  name: string;
  icon: string;
  count?: number;
  color?: string;
}

const TasksSidebar: React.FC<TasksSidebarProps> = ({
  visible,
  onClose,
  activeCategory,
  onCategorySelect,
  projects,
  labels,
  taskCounts,
  favorites,
  onProjectSelect,
  onLabelSelect,
  onToggleFavorite,
  selectedProjectId,
  selectedLabelIds,
  onCreateProject,
  onCreateLabel,
}) => {
  const { user } = useAuth();
  const [slideAnim] = useState(new Animated.Value(-width * 0.8));
  const [overlayOpacity] = useState(new Animated.Value(0));
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showLabelForm, setShowLabelForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#2563EB');
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#2563EB');
  const [expandedSections, setExpandedSections] = useState({
    favorites: true,
    projects: true,
    labels: true,
  });

  const categories: CategoryItem[] = [
    {
      id: 'inbox',
      name: 'Inbox',
      icon: 'inbox',
      count: taskCounts.inbox,
      color: TODOIST_COLORS.blue,
    },
    {
      id: 'today',
      name: 'Today',
      icon: 'calendar',
      count: taskCounts.today,
      color: TODOIST_COLORS.green,
    },
    {
      id: 'upcoming',
      name: 'Upcoming',
      icon: 'calendar-outline',
      count: taskCounts.upcoming,
      color: TODOIST_COLORS.purple,
    },
    {
      id: 'completed',
      name: 'Completed',
      icon: 'checkmark-circle',
      count: taskCounts.completed,
      color: TODOIST_COLORS.success,
    },
  ];

  const projectColors = [
    '#DC4C3E', '#FF8C00', '#D97706', '#059669', '#2563EB',
    '#7C3AED', '#EC4899', '#8B5A3C', '#6B7280', '#1F2937',
  ];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -width * 0.8,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [visible]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      Alert.alert('Error', 'Project name is required');
      return;
    }

    try {
      await onCreateProject({
        name: newProjectName.trim(),
        color: newProjectColor,
        description: '',
        isArchived: false,
        sortOrder: projects.length,
      });
      setNewProjectName('');
      setNewProjectColor('#2563EB');
      setShowProjectForm(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to create project');
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) {
      Alert.alert('Error', 'Label name is required');
      return;
    }

    try {
      await onCreateLabel({
        name: newLabelName.trim(),
        color: newLabelColor,
        description: '',
        isArchived: false,
      });
      setNewLabelName('');
      setNewLabelColor('#2563EB');
      setShowLabelForm(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to create label');
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const favoriteProjects = projects.filter(p => favorites.includes(p.id));
  const favoriteLabels = labels.filter(l => favorites.includes(l.id));
  const hasFavorites = favoriteProjects.length > 0 || favoriteLabels.length > 0;

  const renderCategoryItem = (category: CategoryItem) => {
    const isActive = activeCategory === category.id;

    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryItem,
          isActive && styles.categoryItemActive,
        ]}
        onPress={() => onCategorySelect(category.id)}
      >
        <View style={styles.categoryIcon}>
          <Ionicons
            name={category.icon as any}
            size={18}
            color={isActive ? category.color : TODOIST_COLORS.textSecondary}
          />
        </View>
        <Text style={[
          styles.categoryText,
          isActive && { color: category.color },
        ]}>
          {category.name}
        </Text>
        {category.count !== undefined && category.count > 0 && (
          <View style={[
            styles.countBadge,
            isActive && { backgroundColor: category.color },
          ]}>
            <Text style={[
              styles.countText,
              isActive && { color: '#fff' },
            ]}>
              {category.count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderProjectItem = (project: Project, isFavorite = false) => {
    const isSelected = selectedProjectId === project.id;
    const isFav = favorites.includes(project.id);

    return (
      <TouchableOpacity
        key={project.id}
        style={[
          styles.projectItem,
          isSelected && styles.projectItemActive,
        ]}
        onPress={() => onProjectSelect(project.id)}
      >
        <View style={styles.projectInfo}>
          <View style={[styles.projectColor, { backgroundColor: project.color }]} />
          <Text style={[
            styles.projectText,
            isSelected && { color: TODOIST_COLORS.text, fontWeight: '600' },
          ]} numberOfLines={1}>
            {project.name}
          </Text>
        </View>
        <View style={styles.projectActions}>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => onToggleFavorite(project.id, 'project')}
          >
            <Ionicons
              name={isFav ? "star" : "star-outline"}
              size={14}
              color={isFav ? TODOIST_COLORS.warning : TODOIST_COLORS.textTertiary}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderLabelItem = (label: Label, isFavorite = false) => {
    const isSelected = selectedLabelIds.includes(label.id);
    const isFav = favorites.includes(label.id);

    return (
      <TouchableOpacity
        key={label.id}
        style={[
          styles.labelItem,
          isSelected && styles.labelItemActive,
        ]}
        onPress={() => onLabelSelect(label.id)}
      >
        <View style={styles.labelInfo}>
          <View style={[styles.labelColor, { backgroundColor: label.color }]} />
          <Text style={[
            styles.labelText,
            isSelected && { color: TODOIST_COLORS.text, fontWeight: '600' },
          ]} numberOfLines={1}>
            #{label.name}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => onToggleFavorite(label.id, 'label')}
        >
          <Ionicons
            name={isFav ? "star" : "star-outline"}
            size={14}
            color={isFav ? TODOIST_COLORS.warning : TODOIST_COLORS.textTertiary}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderSection = (
    title: string,
    sectionKey: keyof typeof expandedSections,
    items: any[],
    renderItem: (item: any) => React.ReactNode,
    onAdd?: () => void
  ) => (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection(sectionKey)}
      >
        <View style={styles.sectionHeaderLeft}>
          <Ionicons
            name={expandedSections[sectionKey] ? "chevron-down" : "chevron-forward"}
            size={16}
            color={TODOIST_COLORS.textSecondary}
          />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {onAdd && (
          <TouchableOpacity style={styles.addButton} onPress={onAdd}>
            <Ionicons name="add" size={16} color={TODOIST_COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {expandedSections[sectionKey] && (
        <View style={styles.sectionContent}>
          {items.length > 0 ? (
            items.map(renderItem)
          ) : (
            <Text style={styles.emptyText}>
              {sectionKey === 'projects' ? 'No projects yet' :
                sectionKey === 'labels' ? 'No labels yet' :
                  'No favorites yet'}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.overlayBackground,
            { opacity: overlayOpacity },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sidebar,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>
                  {user?.displayName || 'User'}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {user?.email}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={20} color={TODOIST_COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Favorites Section */}
            {hasFavorites && renderSection(
              'Favorites',
              'favorites',
              [...favoriteProjects, ...favoriteLabels],
              (item) => {
                if ('color' in item && !('name' in item && item.name.startsWith('#'))) {
                  return renderProjectItem(item as Project, true);
                } else {
                  return renderLabelItem(item as Label, true);
                }
              }
            )}

            {/* Views Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Views</Text>
              <View style={styles.sectionContent}>
                {categories.map(renderCategoryItem)}
              </View>
            </View>

            {/* Projects Section */}
            {renderSection(
              'Projects',
              'projects',
              projects,
              renderProjectItem,
              () => setShowProjectForm(true)
            )}

            {/* Labels Section */}
            {renderSection(
              'Labels',
              'labels',
              labels,
              renderLabelItem,
              () => setShowLabelForm(true)
            )}

            {/* Browse Templates */}
            <TouchableOpacity style={styles.templatesButton}>
              <Ionicons name="grid-outline" size={18} color={TODOIST_COLORS.textSecondary} />
              <Text style={styles.templatesText}>Browse templates</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>

        {/* Project Creation Modal */}
        <Modal
          visible={showProjectForm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowProjectForm(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add project</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowProjectForm(false)}
                >
                  <Ionicons name="close" size={24} color={TODOIST_COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newProjectName}
                    onChangeText={setNewProjectName}
                    placeholder="e.g. Marketing, Personal, Work"
                    placeholderTextColor={TODOIST_COLORS.textTertiary}
                    autoFocus
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Color</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.colorPicker}>
                      {projectColors.map((color) => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.colorOption,
                            { backgroundColor: color },
                            newProjectColor === color && styles.colorOptionSelected,
                          ]}
                          onPress={() => setNewProjectColor(color)}
                        >
                          {newProjectColor === color && (
                            <Ionicons name="checkmark" size={16} color="#fff" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowProjectForm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.createButton,
                    !newProjectName.trim() && styles.createButtonDisabled,
                  ]}
                  onPress={handleCreateProject}
                  disabled={!newProjectName.trim()}
                >
                  <Text style={[
                    styles.createButtonText,
                    !newProjectName.trim() && styles.createButtonTextDisabled,
                  ]}>
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Label Creation Modal */}
        <Modal
          visible={showLabelForm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLabelForm(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add label</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowLabelForm(false)}
                >
                  <Ionicons name="close" size={24} color={TODOIST_COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newLabelName}
                    onChangeText={setNewLabelName}
                    placeholder="e.g. urgent, shopping, calls"
                    placeholderTextColor={TODOIST_COLORS.textTertiary}
                    autoFocus
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Color</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.colorPicker}>
                      {projectColors.map((color) => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.colorOption,
                            { backgroundColor: color },
                            newLabelColor === color && styles.colorOptionSelected,
                          ]}
                          onPress={() => setNewLabelColor(color)}
                        >
                          {newLabelColor === color && (
                            <Ionicons name="checkmark" size={16} color="#fff" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowLabelForm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.createButton,
                    !newLabelName.trim() && styles.createButtonDisabled,
                  ]}
                  onPress={handleCreateLabel}
                  disabled={!newLabelName.trim()}
                >
                  <Text style={[
                    styles.createButtonText,
                    !newLabelName.trim() && styles.createButtonTextDisabled,
                  ]}>
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  overlayBackground: {
    flex: 1,
    backgroundColor: '#000',
  },
  sidebar: {
    width: width * 0.8,
    maxWidth: 320,
    backgroundColor: TODOIST_COLORS.background,
    borderRightWidth: 1,
    borderRightColor: TODOIST_COLORS.border,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: TODOIST_COLORS.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: TODOIST_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: TODOIST_COLORS.text,
  },
  userEmail: {
    fontSize: 12,
    color: TODOIST_COLORS.textSecondary,
    marginTop: 2,
  },
  settingsButton: {
    padding: 8,
  },

  // Content
  content: {
    flex: 1,
    paddingTop: 8,
  },

  // Sections
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: TODOIST_COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  addButton: {
    padding: 4,
  },
  sectionContent: {
    paddingLeft: 8,
  },
  emptyText: {
    fontSize: 14,
    color: TODOIST_COLORS.textTertiary,
    fontStyle: 'italic',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },

  // Category Items
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 1,
  },
  categoryItemActive: {
    backgroundColor: TODOIST_COLORS.surface,
  },
  categoryIcon: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  categoryText: {
    fontSize: 14,
    color: TODOIST_COLORS.textSecondary,
    flex: 1,
    fontWeight: '500',
  },
  countBadge: {
    backgroundColor: TODOIST_COLORS.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    fontSize: 11,
    color: TODOIST_COLORS.textSecondary,
    fontWeight: '600',
  },

  // Project Items
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 1,
  },
  projectItemActive: {
    backgroundColor: TODOIST_COLORS.surface,
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  projectColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  projectText: {
    fontSize: 14,
    color: TODOIST_COLORS.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  projectActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButton: {
    padding: 4,
  },

  // Label Items
  labelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 1,
  },
  labelItemActive: {
    backgroundColor: TODOIST_COLORS.surface,
  },
  labelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  labelColor: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  labelText: {
    fontSize: 14,
    color: TODOIST_COLORS.textSecondary,
    fontWeight: '500',
    flex: 1,
  },

  // Templates Button
  templatesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 8,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: TODOIST_COLORS.border,
    borderStyle: 'dashed',
  },
  templatesText: {
    fontSize: 14,
    color: TODOIST_COLORS.textSecondary,
    marginLeft: 12,
    fontWeight: '500',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: TODOIST_COLORS.surface,
    borderRadius: 12,
    width: width * 0.9,
    maxWidth: 400,
    maxHeight: Dimensions.get("window").height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: TODOIST_COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TODOIST_COLORS.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TODOIST_COLORS.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: TODOIST_COLORS.background,
    borderWidth: 1,
    borderColor: TODOIST_COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: TODOIST_COLORS.text,
  },
  colorPicker: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 2,
    borderColor: TODOIST_COLORS.text,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: TODOIST_COLORS.border,
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButtonText: {
    fontSize: 14,
    color: TODOIST_COLORS.textSecondary,
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: TODOIST_COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonDisabled: {
    backgroundColor: TODOIST_COLORS.textTertiary,
  },
  createButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  createButtonTextDisabled: {
    color: TODOIST_COLORS.textSecondary,
  },
});

export default TasksSidebar;