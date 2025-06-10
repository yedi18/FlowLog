// src/components/tasks/QuickAddPriorityPicker.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRIORITY_COLORS } from '../../types';

const { height } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedPriority: 1 | 2 | 3 | 4;
  onPrioritySelect: (priority: 1 | 2 | 3 | 4) => void;
}

const QuickAddPriorityPicker: React.FC<Props> = ({
  visible,
  onClose,
  selectedPriority,
  onPrioritySelect,
}) => {
  const priorities = [
    {
      level: 1 as const,
      label: 'Priority 1',
      description: 'Urgent and important',
      color: PRIORITY_COLORS[1],
      icon: 'flag',
    },
    {
      level: 2 as const,
      label: 'Priority 2', 
      description: 'Important but not urgent',
      color: PRIORITY_COLORS[2],
      icon: 'flag',
    },
    {
      level: 3 as const,
      label: 'Priority 3',
      description: 'Neither urgent nor important',
      color: PRIORITY_COLORS[3],
      icon: 'flag',
    },
    {
      level: 4 as const,
      label: 'Priority 4',
      description: 'No priority',
      color: '#666',
      icon: 'flag-outline',
    },
  ];

  const handlePrioritySelect = (priority: 1 | 2 | 3 | 4) => {
    onPrioritySelect(priority);
    onClose();
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
            <Text style={styles.title}>Priority</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.saveButton}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Priority Options */}
          <View style={styles.content}>
            {priorities.map((priority) => (
              <TouchableOpacity
                key={priority.level}
                style={[
                  styles.priorityOption,
                  selectedPriority === priority.level && styles.priorityOptionSelected,
                ]}
                onPress={() => handlePrioritySelect(priority.level)}
              >
                <View style={styles.priorityLeft}>
                  <View style={[styles.flagContainer, { backgroundColor: priority.color }]}>
                    <Ionicons 
                      name={priority.icon as any} 
                      size={16} 
                      color="#fff" 
                    />
                  </View>
                  <View style={styles.priorityInfo}>
                    <Text style={[
                      styles.priorityLabel,
                      selectedPriority === priority.level && styles.priorityLabelSelected
                    ]}>
                      {priority.label}
                    </Text>
                    {priority.level < 4 && (
                      <Text style={styles.priorityDescription}>
                        {priority.description}
                      </Text>
                    )}
                  </View>
                </View>
                
                {selectedPriority === priority.level && (
                  <Ionicons name="checkmark" size={20} color="#DC4C3E" />
                )}
              </TouchableOpacity>
            ))}

            {/* Priority Guide */}
            <View style={styles.guideContainer}>
              <Text style={styles.guideTitle}>Priority Guide</Text>
              <Text style={styles.guideText}>
                • Priority 1: Urgent and important tasks that need immediate attention
              </Text>
              <Text style={styles.guideText}>
                • Priority 2: Important tasks that can be scheduled
              </Text>
              <Text style={styles.guideText}>
                • Priority 3: Tasks that are nice to do but not critical
              </Text>
              <Text style={styles.guideText}>
                • Priority 4: Default priority for regular tasks
              </Text>
            </View>
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
    maxHeight: height * 0.6,
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
  content: {
    padding: 20,
  },
  priorityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    marginBottom: 8,
  },
  priorityOptionSelected: {
    backgroundColor: '#DC4C3E20',
    borderWidth: 1,
    borderColor: '#DC4C3E',
  },
  priorityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  flagContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityInfo: {
    flex: 1,
  },
  priorityLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 2,
  },
  priorityLabelSelected: {
    color: '#DC4C3E',
    fontWeight: '600',
  },
  priorityDescription: {
    fontSize: 12,
    color: '#666',
  },
  guideContainer: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  guideTitle: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 12,
  },
  guideText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 6,
  },
});

export default QuickAddPriorityPicker;