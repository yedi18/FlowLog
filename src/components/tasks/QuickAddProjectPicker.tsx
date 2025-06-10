// src/components/tasks/QuickAddProjectPicker.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Dimensions,
    ScrollView,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Project, DEFAULT_COLORS } from '../../types';

const { height } = Dimensions.get('window');

interface Props {
    visible: boolean;
    onClose: () => void;
    projects: Project[];
    selectedProjectId: string;
    onProjectSelect: (projectId: string) => void;
}

const QuickAddProjectPicker: React.FC<Props> = ({
    visible,
    onClose,
    projects,
    selectedProjectId,
    onProjectSelect,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateProject, setShowCreateProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectColor, setNewProjectColor] = useState(DEFAULT_COLORS[0]);

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleProjectSelect = (projectId: string) => {
        onProjectSelect(projectId);
        onClose();
    };

    const handleCreateProject = () => {
        // This would typically create a new project
        // For now, we'll just close the modal
        setShowCreateProject(false);
        setNewProjectName('');
        setNewProjectColor(DEFAULT_COLORS[0]);
        onClose();
    };

    const inboxProject = {
        id: '',
        name: 'Inbox',
        color: '#666',
        description: 'Default inbox for new tasks',
        userId: '',
        createdAt: '',
        updatedAt: '',
        isArchived: false,
        sortOrder: 0,
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.cancelButton}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>Project</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.saveButton}>Done</Text>
                        </TouchableOpacity>
                    </View>

                    {!showCreateProject ? (
                        <>
                            {/* Search */}
                            <View style={styles.searchContainer}>
                                <Ionicons name="search" size={18} color="#666" />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search projects..."
                                    placeholderTextColor="#666"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                                        <Ionicons name="close" size={18} color="#666" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                                {/* Inbox */}
                                <TouchableOpacity
                                    style={[
                                        styles.projectOption,
                                        selectedProjectId === '' && styles.projectOptionSelected,
                                    ]}
                                    onPress={() => handleProjectSelect('')}
                                >
                                    <View style={styles.projectLeft}>
                                        <Ionicons name="mail-outline" size={20} color="#666" />
                                        <Text style={[
                                            styles.projectName,
                                            selectedProjectId === '' && styles.projectNameSelected
                                        ]}>
                                            Inbox
                                        </Text>
                                    </View>
                                    {selectedProjectId === '' && (
                                        <Ionicons name="checkmark" size={20} color="#DC4C3E" />
                                    )}
                                </TouchableOpacity>

                                {/* Projects */}
                                {filteredProjects.map((project) => (
                                    <TouchableOpacity
                                        key={project.id}
                                        style={[
                                            styles.projectOption,
                                            selectedProjectId === project.id && styles.projectOptionSelected,
                                        ]}
                                        onPress={() => handleProjectSelect(project.id)}
                                    >
                                        <View style={styles.projectLeft}>
                                            <View style={[styles.projectDot, { backgroundColor: project.color }]} />
                                            <Text style={[
                                                styles.projectName,
                                                selectedProjectId === project.id && styles.projectNameSelected
                                            ]}>
                                                {project.name}
                                            </Text>
                                        </View>
                                        {selectedProjectId === project.id && (
                                            <Ionicons name="checkmark" size={20} color="#DC4C3E" />
                                        )}
                                    </TouchableOpacity>
                                ))}

                                {/* No Results */}
                                {searchQuery && filteredProjects.length === 0 && (
                                    <View style={styles.noResults}>
                                        <Text style={styles.noResultsText}>No projects found</Text>
                                        <Text style={styles.noResultsSubtext}>
                                            Try a different search term
                                        </Text>
                                    </View>
                                )}

                                {/* Create New Project */}
                                <TouchableOpacity
                                    style={styles.createProjectButton}
                                    onPress={() => setShowCreateProject(true)}
                                >
                                    <Ionicons name="add" size={20} color="#DC4C3E" />
                                    <Text style={styles.createProjectText}>Create new project</Text>
                                </TouchableOpacity>

                                {/* Quick Actions */}
                                <View style={styles.quickActions}>
                                    <Text style={styles.quickActionsTitle}>Quick Actions</Text>

                                    <TouchableOpacity style={styles.quickAction}>
                                        <Ionicons name="folder-outline" size={20} color="#666" />
                                        <Text style={styles.quickActionText}>Manage projects</Text>
                                        <Ionicons name="chevron-forward" size={16} color="#666" />
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.quickAction}>
                                        <Ionicons name="settings-outline" size={20} color="#666" />
                                        <Text style={styles.quickActionText}>Project settings</Text>
                                        <Ionicons name="chevron-forward" size={16} color="#666" />
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </>
                    ) : (
                        /* Create Project Form */
                        <View style={styles.createForm}>
                            <Text style={styles.createFormTitle}>Create New Project</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Project Name</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Enter project name..."
                                    placeholderTextColor="#666"
                                    value={newProjectName}
                                    onChangeText={setNewProjectName}
                                    autoFocus
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Color</Text>
                                <View style={styles.colorGrid}>
                                    {DEFAULT_COLORS.slice(0, 12).map((color) => (
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
                            </View>

                            <View style={styles.createFormButtons}>
                                <TouchableOpacity
                                    style={styles.cancelCreateButton}
                                    onPress={() => setShowCreateProject(false)}
                                >
                                    <Text style={styles.cancelCreateText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.createConfirmButton,
                                        !newProjectName.trim() && styles.createConfirmButtonDisabled,
                                    ]}
                                    onPress={handleCreateProject}
                                    disabled={!newProjectName.trim()}
                                >
                                    <Text style={[
                                        styles.createConfirmText,
                                        !newProjectName.trim() && styles.createConfirmTextDisabled,
                                    ]}>
                                        Create Project
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
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
        maxHeight: height * 0.8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    cancelButton: {
        fontSize: 16,
        color: '#666',
    },
    saveButton: {
        fontSize: 16,
        color: '#DC4C3E',
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        margin: 20,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#fff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    projectOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#2a2a2a',
        borderRadius: 12,
        marginBottom: 8,
    },
    projectOptionSelected: {
        backgroundColor: '#DC4C3E20',
        borderWidth: 1,
        borderColor: '#DC4C3E',
    },
    projectLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    projectDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    projectName: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
    projectNameSelected: {
        color: '#DC4C3E',
        fontWeight: '600',
    },
    noResults: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    noResultsText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
        marginBottom: 4,
    },
    noResultsSubtext: {
        fontSize: 14,
        color: '#666',
    },
    createProjectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#2a2a2a',
        borderRadius: 12,
        marginTop: 16,
        marginBottom: 24,
        gap: 12,
        borderWidth: 1,
        borderColor: '#DC4C3E30',
        borderStyle: 'dashed',
    },
    createProjectText: {
        fontSize: 16,
        color: '#DC4C3E',
        fontWeight: '500',
    },
    quickActions: {
        marginBottom: 40,
    },
    quickActionsTitle: {
        fontSize: 14,
        color: '#999',
        fontWeight: '500',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    quickAction: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#2a2a2a',
        borderRadius: 8,
        marginBottom: 6,
        gap: 12,
    },
    quickActionText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
        flex: 1,
    },
    createForm: {
        flex: 1,
        padding: 20,
    },
    createFormTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 24,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#2a2a2a',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#fff',
        borderWidth: 1,
        borderColor: '#444',
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorOptionSelected: {
        borderWidth: 3,
        borderColor: '#fff',
    },
    createFormButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 32,
    },
    cancelCreateButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#2a2a2a',
        alignItems: 'center',
    },
    cancelCreateText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    createConfirmButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#DC4C3E',
        alignItems: 'center',
    },
    createConfirmButtonDisabled: {
        backgroundColor: '#666',
    },
    createConfirmText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
    createConfirmTextDisabled: {
        color: '#999',
    },
});

export default QuickAddProjectPicker;