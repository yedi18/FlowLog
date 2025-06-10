// src/components/tasks/TaskEditor.tsx - Complete Todoist Task Editor Replica
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task, Project, Label, Priority, SubTask } from '../../types';

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

interface TaskEditorProps {
  task?: Task | null;
  projects: Project[];
  labels: Label[];
  onSave: (taskData: Partial<Task>) => Promise<void>;
  onCancel: () => void;
  onProjectCreate: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<string>;
  onLabelCreate: (labelData: Omit<Label, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<string>;
  onProjectDelete: (projectId: string) => Promise<void>;
  onAddSubtask?: (parentId: string, subtaskData: any) => Promise<void>;
}

const TaskEditor: React.FC<TaskEditorProps> = ({
  task,
  projects,
  labels,
  onSave,
  onCancel,
  onProjectCreate,
  onLabelCreate,
  onProjectDelete,
  onAddSubtask,
}) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<Priority>(task?.priority || 4);
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [dueTime, setDueTime] = useState(task?.dueTime || '');
  const [projectId, setProjectId] = useState(task?.projectId || '');
  const [selectedLabels, setSelectedLabels] = useState<string[]>(task?.labels || []);
  const [subtasks, setSubtasks] = useState<SubTask[]>(task?.subtasks || []);
  const [reminderTime, setReminderTime] = useState(task?.reminderTime || '');
  const [estimatedTime, setEstimatedTime] = useState(task?.estimatedTime?.toString() || '');
  const [saving, setSaving] = useState(false);

  const priorityOptions = [
    { value: 1, label: 'Priority 1', color: TODOIST_COLORS.error, icon: 'flag' },
    { value: 2, label: 'Priority 2', color: TODOIST_COLORS.warning, icon: 'flag' },
    { value: 3, label: 'Priority 3', color: TODOIST_COLORS.blue, icon: 'flag' },
    { value: 4, label: 'Priority 4', color: TODOIST_COLORS.textSecondary, icon: 'flag-outline' },
  ];

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Task title is required');
      return;
    }

    setSaving(true);
    try {
      const taskData: Partial<Task> = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        projectId: projectId || undefined,
        labels: selectedLabels.length > 0 ? selectedLabels : undefined,
        subtasks: subtasks.length > 0 ? subtasks : undefined,
        reminderTime: reminderTime || undefined,
        estimatedTime: estimatedTime ? parseInt(estimatedTime) : undefined,
      };

      await onSave(taskData);
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addSubtask = () => {
    const newSubtask: SubTask = {
      id: Date.now().toString(),
      title: '',
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setSubtasks([...subtasks, newSubtask]);
  };

  const updateSubtask = (index: number, updates: Partial<SubTask>) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index] = { ...updatedSubtasks[index], ...updates };
    setSubtasks(updatedSubtasks);
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabels(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  return (
    <Modal visible={true} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={onCancel}>
            <Ionicons name="close" size={24} color={TODOIST_COLORS.textSecondary} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            {task ? 'Edit Task' : 'New Task'}
          </Text>
          
          <TouchableOpacity
            style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!title.trim() || saving}
          >
            <Text style={[
              styles.saveButtonText,
              !title.trim() && styles.saveButtonTextDisabled,
            ]}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Title Input */}
            <View style={styles.section}>
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Task name"
                placeholderTextColor={TODOIST_COLORS.textTertiary}
                multiline
                autoFocus={!task}
              />
            </View>

            {/* Description Input */}
            <View style={styles.section}>
              <TextInput
                style={styles.descriptionInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Description"
                placeholderTextColor={TODOIST_COLORS.textTertiary}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Priority */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Priority</Text>
              <View style={styles.priorityGrid}>
                {priorityOptions.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.priorityOption,
                      priority === option.value && styles.priorityOptionSelected,
                    ]}
                    onPress={() => setPriority(option.value as Priority)}
                  >
                    <Ionicons name={option.icon as any} size={18} color={option.color} />
                    <Text style={styles.priorityOptionText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Due Date & Time */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Due Date</Text>
              <View style={styles.dateTimeRow}>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={TODOIST_COLORS.textTertiary}
                />
                <TextInput
                  style={[styles.input, styles.timeInput]}
                  value={dueTime}
                  onChangeText={setDueTime}
                  placeholder="HH:MM"
                  placeholderTextColor={TODOIST_COLORS.textTertiary}
                />
              </View>
            </View>

            {/* Project */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Project</Text>
              <View style={styles.optionsGrid}>
                <TouchableOpacity
                  style={[
                    styles.optionChip,
                    !projectId && styles.optionChipSelected,
                  ]}
                  onPress={() => setProjectId('')}
                >
                  <Ionicons name="mail-outline" size={16} color={TODOIST_COLORS.blue} />
                  <Text style={styles.optionChipText}>Inbox</Text>
                </TouchableOpacity>
                {projects.map(project => (
                  <TouchableOpacity
                    key={project.id}
                    style={[
                      styles.optionChip,
                      projectId === project.id && styles.optionChipSelected,
                    ]}
                    onPress={() => setProjectId(project.id)}
                  >
                    <View style={[styles.projectDot, { backgroundColor: project.color }]} />
                    <Text style={styles.optionChipText}>{project.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Labels */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Labels</Text>
              <View style={styles.optionsGrid}>
                {labels.map(label => (
                  <TouchableOpacity
                    key={label.id}
                    style={[
                      styles.optionChip,
                      selectedLabels.includes(label.id) && styles.optionChipSelected,
                    ]}
                    onPress={() => toggleLabel(label.id)}
                  >
                    <View style={[styles.labelDot, { backgroundColor: label.color }]} />
                    <Text style={styles.optionChipText}>#{label.name}</Text>
                    {selectedLabels.includes(label.id) && (
                      <Ionicons name="checkmark" size={14} color={TODOIST_COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Subtasks */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Sub-tasks</Text>
                <TouchableOpacity style={styles.addButton} onPress={addSubtask}>
                  <Ionicons name="add" size={16} color={TODOIST_COLORS.primary} />
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
              
              {subtasks.map((subtask, index) => (
                <View key={subtask.id || index} style={styles.subtaskRow}>
                  <TouchableOpacity
                    style={[
                      styles.subtaskCheckbox,
                      subtask.completed && styles.subtaskCheckboxCompleted,
                    ]}
                    onPress={() => updateSubtask(index, { completed: !subtask.completed })}
                  >
                    {subtask.completed && (
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    )}
                  </TouchableOpacity>
                  
                  <TextInput
                    style={[
                      styles.subtaskInput,
                      subtask.completed && styles.subtaskInputCompleted,
                    ]}
                    value={subtask.title}
                    onChangeText={(text) => updateSubtask(index, { title: text })}
                    placeholder="Sub-task name"
                    placeholderTextColor={TODOIST_COLORS.textTertiary}
                  />
                  
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeSubtask(index)}
                  >
                    <Ionicons name="close" size={16} color={TODOIST_COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Advanced Options */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Advanced</Text>
              
              <View style={styles.advancedRow}>
                <Text style={styles.advancedLabel}>Reminder</Text>
                <TextInput
                  style={styles.advancedInput}
                  value={reminderTime}
                  onChangeText={setReminderTime}
                  placeholder="HH:MM"
                  placeholderTextColor={TODOIST_COLORS.textTertiary}
                />
              </View>
              
              <View style={styles.advancedRow}>
                <Text style={styles.advancedLabel}>Estimated time (min)</Text>
                <TextInput
                  style={styles.advancedInput}
                  value={estimatedTime}
                  onChangeText={setEstimatedTime}
                  placeholder="60"
                  placeholderTextColor={TODOIST_COLORS.textTertiary}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TODOIST_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: TODOIST_COLORS.border,
    paddingTop: 50, // Account for status bar
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TODOIST_COLORS.text,
  },
  saveButton: {
    backgroundColor: TODOIST_COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonDisabled: {
    backgroundColor: TODOIST_COLORS.textTertiary,
  },
  saveButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: TODOIST_COLORS.textSecondary,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: TODOIST_COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TODOIST_COLORS.text,
    marginBottom: 12,
  },
  titleInput: {
    fontSize: 18,
    color: TODOIST_COLORS.text,
    fontWeight: '500',
    minHeight: 24,
  },
  descriptionInput: {
    fontSize: 14,
    color: TODOIST_COLORS.textSecondary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  priorityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: TODOIST_COLORS.border,
    gap: 6,
    minWidth: 120,
  },
  priorityOptionSelected: {
    backgroundColor: TODOIST_COLORS.surface,
    borderColor: TODOIST_COLORS.primary,
  },
  priorityOptionText: {
    fontSize: 12,
    color: TODOIST_COLORS.text,
    fontWeight: '500',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    backgroundColor: TODOIST_COLORS.surface,
    borderWidth: 1,
    borderColor: TODOIST_COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: TODOIST_COLORS.text,
  },
  dateInput: {
    flex: 2,
  },
  timeInput: {
    flex: 1,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TODOIST_COLORS.border,
    gap: 4,
  },
  optionChipSelected: {
    backgroundColor: TODOIST_COLORS.surface,
    borderColor: TODOIST_COLORS.primary,
  },
  optionChipText: {
    fontSize: 12,
    color: TODOIST_COLORS.text,
    fontWeight: '500',
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    color: TODOIST_COLORS.primary,
    fontWeight: '600',
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  subtaskCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: TODOIST_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtaskCheckboxCompleted: {
    backgroundColor: TODOIST_COLORS.success,
    borderColor: TODOIST_COLORS.success,
  },
  subtaskInput: {
    flex: 1,
    fontSize: 14,
    color: TODOIST_COLORS.text,
    paddingVertical: 4,
  },
  subtaskInputCompleted: {
    textDecorationLine: 'line-through',
    color: TODOIST_COLORS.textSecondary,
  },
  removeButton: {
    padding: 4,
  },
  advancedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  advancedLabel: {
    fontSize: 14,
    color: TODOIST_COLORS.text,
  },
  advancedInput: {
    backgroundColor: TODOIST_COLORS.surface,
    borderWidth: 1,
    borderColor: TODOIST_COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    color: TODOIST_COLORS.text,
    minWidth: 80,
    textAlign: 'center',
  },
});

export default TaskEditor;