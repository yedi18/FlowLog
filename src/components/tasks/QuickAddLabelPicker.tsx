// src/components/tasks/QuickAddLabelPicker.tsx
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
import { Label, DEFAULT_COLORS } from '../../types';

const { height } = Dimensions.get('window');

interface Props {
    visible: boolean;
    onClose: () => void;
    labels: Label[];
    selectedLabelIds: string[];
    onLabelsSelect: (labelIds: string[]) => void;
}

const QuickAddLabelPicker: React.FC<Props> = ({
    visible,
    onClose,
    labels,
    selectedLabelIds,
    onLabelsSelect,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateLabel, setShowCreateLabel] = useState(false);
    const [newLabelName, setNewLabelName] = useState('');
    const [newLabelColor, setNewLabelColor] = useState(DEFAULT_COLORS[0]);

    const filteredLabels = labels.filter(label =>
        label.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleLabelToggle = (labelId: string) => {
        const newSelectedLabels = selectedLabelIds.includes(labelId)
            ? selectedLabelIds.filter(id => id !== labelId)
            : [...selectedLabelIds, labelId];

        onLabelsSelect(newSelectedLabels);
    };

    const handleCreateLabel = () => {
        // This would typically create a new label
        // For now, we'll just close the modal
        setShowCreateLabel(false);
        setNewLabelName('');
        setNewLabelColor(DEFAULT_COLORS[0]);
    };

    const handleDone = () => {
        onClose();
    };

    const clearAllLabels = () => {
        onLabelsSelect([]);
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
                        <Text style={styles.title}>Labels</Text>
                        <TouchableOpacity onPress={handleDone}>
                            <Text style={styles.saveButton}>Done</Text>
                        </TouchableOpacity>
                    </View>

                    {!showCreateLabel ? (
                        <>
                            {/* Selected Labels Summary */}
                            {selectedLabelIds.length > 0 && (
                                <View style={styles.selectedSummary}>
                                    <Text style={styles.selectedSummaryText}>
                                        {selectedLabelIds.length} label{selectedLabelIds.length > 1 ? 's' : ''} selected
                                    </Text>
                                    <TouchableOpacity onPress={clearAllLabels}>
                                        <Text style={styles.clearAllText}>Clear all</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Search */}
                            <View style={styles.searchContainer}>
                                <Ionicons name="search" size={18} color="#666" />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search labels..."
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
                                {/* Selected Labels First */}
                                {selectedLabelIds.length > 0 && (
                                    <View style={styles.selectedLabelsSection}>
                                        <Text style={styles.sectionTitle}>Selected Labels</Text>
                                        {labels
                                            .filter(label => selectedLabelIds.includes(label.id))
                                            .map((label) => (
                                                <TouchableOpacity
                                                    key={`selected-${label.id}`}
                                                    style={[
                                                        styles.labelOption,
                                                        styles.labelOptionSelected,
                                                        { backgroundColor: label.color + '20', borderColor: label.color },
                                                    ]}
                                                    onPress={() => handleLabelToggle(label.id)}
                                                >
                                                    <View style={styles.labelLeft}>
                                                        <View style={[styles.labelDot, { backgroundColor: label.color }]} />
                                                        <Text style={[styles.labelName, { color: label.color }]}>
                                                            #{label.name}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.labelRight}>
                                                        <Ionicons name="checkmark" size={20} color={label.color} />
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                    </View>
                                )}

                                {/* Available Labels */}
                                <View style={styles.availableLabelsSection}>
                                    {selectedLabelIds.length > 0 && (
                                        <Text style={styles.sectionTitle}>Available Labels</Text>
                                    )}

                                    {filteredLabels
                                        .filter(label => !selectedLabelIds.includes(label.id))
                                        .map((label) => (
                                            <TouchableOpacity
                                                key={label.id}
                                                style={styles.labelOption}
                                                onPress={() => handleLabelToggle(label.id)}
                                            >
                                                <View style={styles.labelLeft}>
                                                    <View style={[styles.labelDot, { backgroundColor: label.color }]} />
                                                    <Text style={styles.labelName}>#{label.name}</Text>
                                                    {label.description && (
                                                        <Text style={styles.labelDescription}>
                                                            {label.description}
                                                        </Text>
                                                    )}
                                                </View>
                                                <View style={styles.labelRight}>
                                                    <View style={styles.addButton}>
                                                        <Ionicons name="add" size={16} color="#666" />
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                </View>
                                {/* No Results */}
                                {searchQuery && filteredLabels.length === 0 && (
                                    <View style={styles.noResults}>
                                        <Text style={styles.noResultsText}>No labels found</Text>
                                        <Text style={styles.noResultsSubtext}>
                                            Try a different search term or create a new label
                                        </Text>
                                    </View>
                                )}

                                {/* Create New Label */}
                                <TouchableOpacity
                                    style={styles.createLabelButton}
                                    onPress={() => setShowCreateLabel(true)}
                                >
                                    <Ionicons name="add" size={20} color="#9C27B0" />
                                    <Text style={styles.createLabelText}>Create new label</Text>
                                </TouchableOpacity>

                                {/* Popular Labels */}
                                {!searchQuery && (
                                    <View style={styles.popularLabelsSection}>
                                        <Text style={styles.sectionTitle}>Popular Labels</Text>
                                        <View style={styles.popularLabels}>
                                            {['personal', 'work', 'urgent', 'home', 'shopping'].map((popularLabel) => (
                                                <TouchableOpacity
                                                    key={popularLabel}
                                                    style={styles.popularLabel}
                                                    onPress={() => {
                                                        // This would create and select the popular label
                                                    }}
                                                >
                                                    <Text style={styles.popularLabelText}>#{popularLabel}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {/* Quick Actions */}
                                <View style={styles.quickActions}>
                                    <Text style={styles.quickActionsTitle}>Quick Actions</Text>

                                    <TouchableOpacity style={styles.quickAction}>
                                        <Ionicons name="pricetag-outline" size={20} color="#666" />
                                        <Text style={styles.quickActionText}>Manage labels</Text>
                                        <Ionicons name="chevron-forward" size={16} color="#666" />
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.quickAction}>
                                        <Ionicons name="color-palette-outline" size={20} color="#666" />
                                        <Text style={styles.quickActionText}>Label colors</Text>
                                        <Ionicons name="chevron-forward" size={16} color="#666" />
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </>
                    ) : (
                        /* Create Label Form */
                        <View style={styles.createForm}>
                            <Text style={styles.createFormTitle}>Create New Label</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Label Name</Text>
                                <View style={styles.labelInputContainer}>
                                    <Text style={styles.hashSymbol}>#</Text>
                                    <TextInput
                                        style={styles.labelInput}
                                        placeholder="Enter label name..."
                                        placeholderTextColor="#666"
                                        value={newLabelName}
                                        onChangeText={setNewLabelName}
                                        autoFocus
                                    />
                                </View>
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
                            </View>

                            {/* Label Preview */}
                            {newLabelName && (
                                <View style={styles.labelPreview}>
                                    <Text style={styles.previewTitle}>Preview</Text>
                                    <View style={[
                                        styles.previewLabel,
                                        { backgroundColor: newLabelColor + '20', borderColor: newLabelColor }
                                    ]}>
                                        <View style={[styles.previewDot, { backgroundColor: newLabelColor }]} />
                                        <Text style={[styles.previewText, { color: newLabelColor }]}>
                                            #{newLabelName}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            <View style={styles.createFormButtons}>
                                <TouchableOpacity
                                    style={styles.cancelCreateButton}
                                    onPress={() => setShowCreateLabel(false)}
                                >
                                    <Text style={styles.cancelCreateText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.createConfirmButton,
                                        !newLabelName.trim() && styles.createConfirmButtonDisabled,
                                    ]}
                                    onPress={handleCreateLabel}
                                    disabled={!newLabelName.trim()}
                                >
                                    <Text style={[
                                        styles.createConfirmText,
                                        !newLabelName.trim() && styles.createConfirmTextDisabled,
                                    ]}>
                                        Create Label
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
        color: '#9C27B0',
        fontWeight: '600',
    },
    selectedSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#9C27B010',
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    selectedSummaryText: {
        fontSize: 14,
        color: '#9C27B0',
        fontWeight: '500',
    },
    clearAllText: {
        fontSize: 14,
        color: '#DC4C3E',
        fontWeight: '500',
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
    selectedLabelsSection: {
        marginBottom: 24,
    },
    availableLabelsSection: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        color: '#999',
        fontWeight: '500',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    labelOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#2a2a2a',
        borderRadius: 12,
        marginBottom: 8,
    },
    labelOptionSelected: {
        borderWidth: 1,
    },
    labelLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    labelDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    labelName: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
    labelDescription: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
    },
    labelRight: {
        marginLeft: 12,
    },
    addButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
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
        textAlign: 'center',
    },
    createLabelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#2a2a2a',
        borderRadius: 12,
        marginBottom: 24,
        gap: 12,
        borderWidth: 1,
        borderColor: '#9C27B030',
        borderStyle: 'dashed',
    },
    createLabelText: {
        fontSize: 16,
        color: '#9C27B0',
        fontWeight: '500',
    },
    popularLabelsSection: {
        marginBottom: 24,
    },
    popularLabels: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    popularLabel: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#2a2a2a',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#444',
    },
    popularLabelText: {
        fontSize: 12,
        color: '#999',
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
    labelInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#444',
    },
    hashSymbol: {
        fontSize: 16,
        color: '#9C27B0',
        fontWeight: '600',
        paddingLeft: 16,
    },
    labelInput: {
        flex: 1,
        paddingHorizontal: 8,
        paddingVertical: 12,
        fontSize: 16,
        color: '#fff',
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
    labelPreview: {
        marginBottom: 24,
    },
    previewTitle: {
        fontSize: 14,
        color: '#999',
        fontWeight: '500',
        marginBottom: 8,
    },
    previewLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        alignSelf: 'flex-start',
        gap: 6,
    },
    previewDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    previewText: {
        fontSize: 14,
        fontWeight: '500',
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
        backgroundColor: '#9C27B0',
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

export default QuickAddLabelPicker;