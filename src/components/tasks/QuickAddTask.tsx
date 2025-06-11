// src/components/tasks/QuickAddTask.tsx - Complete Todoist Quick Add Replica
import React, { useState, useEffect, useRef } from 'react';
import * as chrono from 'chrono-node';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Modal,
    Animated,
    Dimensions,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task, Project, Label, Priority } from '../../types';

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

interface QuickAddTaskProps {
    visible: boolean;
    onClose: () => void;
    onSave: (taskData: Partial<Task>) => Promise<void>;
    onOpenFullEditor: () => void;
    onProjectCreate: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<string>;
    onLabelCreate: (labelData: Omit<Label, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<string>;
    projects: Project[];
    labels: Label[];
    defaultProject?: string;
    defaultLabels?: string[];
}

interface DateSuggestion {
    text: string;
    date: Date;
    display: string;
}

const QuickAddTask: React.FC<QuickAddTaskProps> = ({
    visible,
    onClose,
    onSave,
    onOpenFullEditor,
    onProjectCreate,
    onLabelCreate,
    projects,
    labels,
    defaultProject = '',
    defaultLabels = [],
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedProject, setSelectedProject] = useState(defaultProject);
    const [selectedLabels, setSelectedLabels] = useState<string[]>(defaultLabels);
    const [priority, setPriority] = useState<Priority>(4);
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [dueTime, setDueTime] = useState('');
    const [reminderTime, setReminderTime] = useState('');
    const [showProjectPicker, setShowProjectPicker] = useState(false);
    const [showLabelPicker, setShowLabelPicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showPriorityPicker, setShowPriorityPicker] = useState(false);
    const [saving, setSaving] = useState(false);

    const slideAnim = useRef(new Animated.Value(height)).current;
    const titleInputRef = useRef<TextInput>(null);

    // Natural language date suggestions
    const dateSuggestions: DateSuggestion[] = [
        {
            text: 'today',
            date: new Date(),
            display: 'Today',
        },
        {
            text: 'tomorrow',
            date: (() => {
                const date = new Date();
                date.setDate(date.getDate() + 1);
                return date;
            })(),
            display: 'Tomorrow',
        },
        {
            text: 'this weekend',
            date: (() => {
                const date = new Date();
                const dayOfWeek = date.getDay();
                const daysUntilSaturday = 6 - dayOfWeek;
                date.setDate(date.getDate() + daysUntilSaturday);
                return date;
            })(),
            display: 'This weekend',
        },
        {
            text: 'next week',
            date: (() => {
                const date = new Date();
                date.setDate(date.getDate() + 7);
                return date;
            })(),
            display: 'Next week',
        },
    ];

    const priorityOptions = [
        { value: 1, label: 'Priority 1', color: '#DC4C3E', icon: 'flag' },
        { value: 2, label: 'Priority 2', color: '#FF8C00', icon: 'flag' },
        { value: 3, label: 'Priority 3', color: '#2563EB', icon: 'flag' },
        { value: 4, label: 'Priority 4', color: TODOIST_COLORS.textSecondary, icon: 'flag-outline' },
    ];

    useEffect(() => {
        if (visible) {
            setTitle('');
            setDescription('');
            setSelectedProject(defaultProject);
            setSelectedLabels(defaultLabels);
            setPriority(4);
            setDueDate(null);
            setDueTime('');
            setReminderTime('');

            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start(() => {
                titleInputRef.current?.focus();
            });
        } else {
            Animated.timing(slideAnim, {
                toValue: height,
                duration: 300,
                useNativeDriver: false,
            }).start();
        }
    }, [visible]);

    const parseNaturalLanguage = (text: string) => {
        const lowerText = text.toLowerCase();

        // Use chrono to parse generic date/time expressions
        const parsed = chrono.parse(text)[0];
        if (parsed) {
            setDueDate(parsed.start.date());
            text = text.replace(parsed.text, '').trim();
        }

        // Fallback keywords
        for (const suggestion of dateSuggestions) {
            if (lowerText.includes(suggestion.text)) {
                setDueDate(suggestion.date);
                text = text.replace(new RegExp(suggestion.text, 'gi'), '').trim();
                break;
            }
        }

        // Check for priority markers
        const priorityMatch = text.match(/p([1-4])/i);
        if (priorityMatch) {
            setPriority(parseInt(priorityMatch[1]) as Priority);
            const newTitle = text.replace(/p[1-4]/gi, '').trim();
            text = newTitle;
        }

        // Check for project markers
        const projectMatch = text.match(/#(\w+)/);
        if (projectMatch) {
            const projectName = projectMatch[1];
            const project = projects.find(p => p.name.toLowerCase().includes(projectName.toLowerCase()));
            if (project) {
                setSelectedProject(project.id);
                const newTitle = text.replace(/#\w+/g, '').trim();
                text = newTitle;
            }
        }

        // Check for label markers
        const labelMatches = text.match(/@(\w+)/g);
        if (labelMatches) {
            const foundLabels: string[] = [];
            labelMatches.forEach(match => {
                const labelName = match.substring(1);
                const label = labels.find(l => l.name.toLowerCase().includes(labelName.toLowerCase()));
                if (label) {
                    foundLabels.push(label.id);
                }
            });
            if (foundLabels.length > 0) {
                setSelectedLabels(prev => [...new Set([...prev, ...foundLabels])]);
                const newTitle = text.replace(/@\w+/g, '').trim();
                text = newTitle;
            }
        }

        // Reminder shortcuts like !5m, !1h, !1d
        const reminderMatch = text.match(/!(\d+)([mhd])/i);
        if (reminderMatch) {
            const value = parseInt(reminderMatch[1]);
            const unit = reminderMatch[2];
            setReminderTime(`${value}${unit}`);
            text = text.replace(reminderMatch[0], '').trim();
        }

        setTitle(text.trim());
    };

    const handleTitleChange = (text: string) => {
        setTitle(text);

        // Parse natural language on space or enter
        if (text.endsWith(' ') || text.includes('\n')) {
            parseNaturalLanguage(text.trim());
        }

        if (text.endsWith('#')) {
            setShowProjectPicker(true);
        } else if (text.endsWith('@')) {
            setShowLabelPicker(true);
        }
    };

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
                projectId: selectedProject || undefined,
                labels: selectedLabels.length > 0 ? selectedLabels : undefined,
                priority,
                dueDate: dueDate?.toISOString(),
                dueTime: dueTime || undefined,
                reminderTime: reminderTime || undefined,
                completed: false,
            };

            await onSave(taskData);
            onClose();
        } catch (error) {
            console.error('Error saving task:', error);
            Alert.alert('Error', 'Failed to save task. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (date: Date) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const getSelectedProject = () => {
        return projects.find(p => p.id === selectedProject);
    };

    const getSelectedLabelsData = () => {
        return labels.filter(l => selectedLabels.includes(l.id));
    };

    const renderProjectPicker = () => (
        <Modal
            visible={showProjectPicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowProjectPicker(false)}
        >
            <View style={styles.pickerOverlay}>
                <View style={styles.pickerContent}>
                    <View style={styles.pickerHeader}>
                        <Text style={styles.pickerTitle}>Select Project</Text>
                        <TouchableOpacity onPress={() => setShowProjectPicker(false)}>
                            <Ionicons name="close" size={24} color={TODOIST_COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.pickerList}>
                        <TouchableOpacity
                            style={[
                                styles.pickerItem,
                                !selectedProject && styles.pickerItemSelected,
                            ]}
                            onPress={() => {
                                setSelectedProject('');
                                setShowProjectPicker(false);
                            }}
                        >
                            <Ionicons name="mail-outline" size={20} color={TODOIST_COLORS.blue} />
                            <Text style={styles.pickerItemText}>Inbox</Text>
                            {!selectedProject && (
                                <Ionicons name="checkmark" size={20} color={TODOIST_COLORS.primary} />
                            )}
                        </TouchableOpacity>

                        {projects.map(project => (
                            <TouchableOpacity
                                key={project.id}
                                style={[
                                    styles.pickerItem,
                                    selectedProject === project.id && styles.pickerItemSelected,
                                ]}
                                onPress={() => {
                                    setSelectedProject(project.id);
                                    setShowProjectPicker(false);
                                }}
                            >
                                <View style={[styles.projectDot, { backgroundColor: project.color }]} />
                                <Text style={styles.pickerItemText}>{project.name}</Text>
                                {selectedProject === project.id && (
                                    <Ionicons name="checkmark" size={20} color={TODOIST_COLORS.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    const renderLabelPicker = () => (
        <Modal
            visible={showLabelPicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowLabelPicker(false)}
        >
            <View style={styles.pickerOverlay}>
                <View style={styles.pickerContent}>
                    <View style={styles.pickerHeader}>
                        <Text style={styles.pickerTitle}>Select Labels</Text>
                        <TouchableOpacity onPress={() => setShowLabelPicker(false)}>
                            <Ionicons name="close" size={24} color={TODOIST_COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.pickerList}>
                        {labels.map(label => (
                            <TouchableOpacity
                                key={label.id}
                                style={[
                                    styles.pickerItem,
                                    selectedLabels.includes(label.id) && styles.pickerItemSelected,
                                ]}
                                onPress={() => {
                                    setSelectedLabels(prev =>
                                        prev.includes(label.id)
                                            ? prev.filter(id => id !== label.id)
                                            : [...prev, label.id]
                                    );
                                }}
                            >
                                <View style={[styles.labelDot, { backgroundColor: label.color }]} />
                                <Text style={styles.pickerItemText}>#{label.name}</Text>
                                {selectedLabels.includes(label.id) && (
                                    <Ionicons name="checkmark" size={20} color={TODOIST_COLORS.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    const renderDatePicker = () => (
        <Modal
            visible={showDatePicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowDatePicker(false)}
        >
            <View style={styles.pickerOverlay}>
                <View style={styles.pickerContent}>
                    <View style={styles.pickerHeader}>
                        <Text style={styles.pickerTitle}>Select Date</Text>
                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                            <Ionicons name="close" size={24} color={TODOIST_COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.pickerList}>
                        <TouchableOpacity
                            style={styles.pickerItem}
                            onPress={() => {
                                setDueDate(null);
                                setShowDatePicker(false);
                            }}
                        >
                            <Ionicons name="close-circle" size={20} color={TODOIST_COLORS.textSecondary} />
                            <Text style={styles.pickerItemText}>No date</Text>
                        </TouchableOpacity>

                        {dateSuggestions.map((suggestion, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.pickerItem,
                                    dueDate?.toDateString() === suggestion.date.toDateString() && styles.pickerItemSelected,
                                ]}
                                onPress={() => {
                                    setDueDate(suggestion.date);
                                    setShowDatePicker(false);
                                }}
                            >
                                <Ionicons name="calendar" size={20} color={TODOIST_COLORS.green} />
                                <Text style={styles.pickerItemText}>{suggestion.display}</Text>
                                {dueDate?.toDateString() === suggestion.date.toDateString() && (
                                    <Ionicons name="checkmark" size={20} color={TODOIST_COLORS.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    const renderPriorityPicker = () => (
        <Modal
            visible={showPriorityPicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowPriorityPicker(false)}
        >
            <View style={styles.pickerOverlay}>
                <View style={styles.pickerContent}>
                    <View style={styles.pickerHeader}>
                        <Text style={styles.pickerTitle}>Select Priority</Text>
                        <TouchableOpacity onPress={() => setShowPriorityPicker(false)}>
                            <Ionicons name="close" size={24} color={TODOIST_COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.pickerList}>
                        {priorityOptions.map(option => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.pickerItem,
                                    priority === option.value && styles.pickerItemSelected,
                                ]}
                                onPress={() => {
                                    setPriority(option.value as Priority);
                                    setShowPriorityPicker(false);
                                }}
                            >
                                <Ionicons name={option.icon as any} size={20} color={option.color} />
                                <Text style={styles.pickerItemText}>{option.label}</Text>
                                {priority === option.value && (
                                    <Ionicons name="checkmark" size={20} color={TODOIST_COLORS.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.overlayBackground}
                    onPress={onClose}
                    activeOpacity={1}
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoid}
                >
                    <Animated.View
                        style={[
                            styles.container,
                            { transform: [{ translateY: slideAnim }] },
                        ]}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity style={styles.headerButton} onPress={onClose}>
                                <Ionicons name="close" size={24} color={TODOIST_COLORS.textSecondary} />
                            </TouchableOpacity>

                            <Text style={styles.headerTitle}>Quick add</Text>

                            <TouchableOpacity style={styles.headerButton} onPress={onOpenFullEditor}>
                                <Ionicons name="expand" size={20} color={TODOIST_COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Task Input */}
                        <View style={styles.inputSection}>
                            <TextInput
                                ref={titleInputRef}
                                style={styles.titleInput}
                                value={title}
                                onChangeText={handleTitleChange}
                                placeholder="Task name"
                                placeholderTextColor={TODOIST_COLORS.textTertiary}
                                multiline
                                maxLength={500}
                                returnKeyType="done"
                                blurOnSubmit
                            />

                            <TextInput
                                style={styles.descriptionInput}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Description"
                                placeholderTextColor={TODOIST_COLORS.textTertiary}
                                multiline
                                maxLength={1000}
                            />
                        </View>

                        {/* Task Attributes */}
                        <View style={styles.attributesSection}>
                            {/* Selected Attributes Display */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedAttributes}>
                                {/* Project */}
                                {selectedProject && getSelectedProject() && (
                                    <View style={styles.attributeChip}>
                                        <View style={[styles.projectDot, { backgroundColor: getSelectedProject()?.color }]} />
                                        <Text style={styles.attributeChipText}>{getSelectedProject()?.name}</Text>
                                    </View>
                                )}

                                {/* Labels */}
                                {getSelectedLabelsData().map(label => (
                                    <View key={label.id} style={styles.attributeChip}>
                                        <View style={[styles.labelDot, { backgroundColor: label.color }]} />
                                        <Text style={styles.attributeChipText}>#{label.name}</Text>
                                    </View>
                                ))}

                                {/* Due Date */}
                                {dueDate && (
                                    <View style={styles.attributeChip}>
                                        <Ionicons name="calendar" size={14} color={TODOIST_COLORS.green} />
                                        <Text style={styles.attributeChipText}>{formatDate(dueDate)}</Text>
                                    </View>
                                )}

                                {/* Priority */}
                                {priority < 4 && (
                                    <View style={styles.attributeChip}>
                                        <Ionicons
                                            name="flag"
                                            size={14}
                                            color={priorityOptions.find(p => p.value === priority)?.color}
                                        />
                                        <Text style={styles.attributeChipText}>
                                            P{priority}
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>

                        {/* Toolbar */}
                        <View style={styles.toolbar}>
                            <View style={styles.toolbarLeft}>
                                <TouchableOpacity
                                    style={styles.toolButton}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Ionicons
                                        name="calendar-outline"
                                        size={20}
                                        color={dueDate ? TODOIST_COLORS.green : TODOIST_COLORS.textSecondary}
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.toolButton}
                                    onPress={() => setShowProjectPicker(true)}
                                >
                                    <Ionicons
                                        name="folder-outline"
                                        size={20}
                                        color={selectedProject ? TODOIST_COLORS.blue : TODOIST_COLORS.textSecondary}
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.toolButton}
                                    onPress={() => setShowLabelPicker(true)}
                                >
                                    <Ionicons
                                        name="pricetag-outline"
                                        size={20}
                                        color={selectedLabels.length > 0 ? TODOIST_COLORS.purple : TODOIST_COLORS.textSecondary}
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.toolButton}
                                    onPress={() => setShowPriorityPicker(true)}
                                >
                                    <Ionicons
                                        name={priority < 4 ? "flag" : "flag-outline"}
                                        size={20}
                                        color={priority < 4 ? priorityOptions.find(p => p.value === priority)?.color : TODOIST_COLORS.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.addButton,
                                    !title.trim() && styles.addButtonDisabled,
                                ]}
                                onPress={handleSave}
                                disabled={!title.trim() || saving}
                            >
                                {saving ? (
                                    <Text style={styles.addButtonText}>Adding...</Text>
                                ) : (
                                    <Text style={[
                                        styles.addButtonText,
                                        !title.trim() && styles.addButtonTextDisabled,
                                    ]}>
                                        Add task
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Natural Language Hints */}
                        <View style={styles.hintsSection}>
                            <Text style={styles.hintsText}>
                                Try typing "Call mom tomorrow p1 #personal @urgent"
                            </Text>
                        </View>
                    </Animated.View>
                </KeyboardAvoidingView>

                {/* Pickers */}
                {renderProjectPicker()}
                {renderLabelPicker()}
                {renderDatePicker()}
                {renderPriorityPicker()}
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
    keyboardAvoid: {
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: TODOIST_COLORS.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: height * 0.9,
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
    headerButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: TODOIST_COLORS.text,
    },

    // Input Section
    inputSection: {
        padding: 20,
    },
    titleInput: {
        fontSize: 16,
        color: TODOIST_COLORS.text,
        marginBottom: 12,
        minHeight: 24,
        maxHeight: 100,
    },
    descriptionInput: {
        fontSize: 14,
        color: TODOIST_COLORS.textSecondary,
        minHeight: 20,
        maxHeight: 80,
    },

    // Attributes Section
    attributesSection: {
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    selectedAttributes: {
        flexDirection: 'row',
    },
    attributeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: TODOIST_COLORS.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
        gap: 4,
    },
    attributeChipText: {
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

    // Toolbar
    toolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: TODOIST_COLORS.border,
    },
    toolbarLeft: {
        flexDirection: 'row',
        gap: 16,
    },
    toolButton: {
        padding: 8,
    },
    addButton: {
        backgroundColor: TODOIST_COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    addButtonDisabled: {
        backgroundColor: TODOIST_COLORS.textTertiary,
    },
    addButtonText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    addButtonTextDisabled: {
        color: TODOIST_COLORS.textSecondary,
    },

    // Hints Section
    hintsSection: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    hintsText: {
        fontSize: 12,
        color: TODOIST_COLORS.textTertiary,
        textAlign: 'center',
        fontStyle: 'italic',
    },

    // Picker Styles
    pickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickerContent: {
        backgroundColor: TODOIST_COLORS.surface,
        borderRadius: 12,
        width: width * 0.9,
        maxWidth: 400,
        maxHeight: height * 0.7,
    },
    pickerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: TODOIST_COLORS.border,
    },
    pickerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: TODOIST_COLORS.text,
    },
    pickerList: {
        maxHeight: height * 0.5,
    },
    pickerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 12,
    },
    pickerItemSelected: {
        backgroundColor: TODOIST_COLORS.background,
    },
    pickerItemText: {
        fontSize: 16,
        color: TODOIST_COLORS.text,
        flex: 1,
    },
});

export default QuickAddTask;