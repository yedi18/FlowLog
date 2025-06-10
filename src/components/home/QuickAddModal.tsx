// src/components/home/QuickAddModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (type: 'task' | 'event', data: any) => void;
  categoryColors: Record<string, string>;
  priorityColors: Record<string, string>;
}

const QuickAddModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  categoryColors,
  priorityColors,
}) => {
  const [activeTab, setActiveTab] = useState<'task' | 'event'>('task');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'work' | 'personal' | 'health' | 'shopping'>('work');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSave = () => {
    if (!title.trim()) return;

    const data = {
      title: title.trim(),
      category,
      priority: activeTab === 'task' ? priority : undefined,
    };

    onSave(activeTab, data);
    setTitle('');
    setCategory('work');
    setPriority('medium');
  };

  const handleClose = () => {
    setTitle('');
    setCategory('work');
    setPriority('medium');
    setActiveTab('task');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Quick Add</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'task' && styles.activeTab]}
              onPress={() => setActiveTab('task')}
            >
              <Text style={[styles.tabText, activeTab === 'task' && styles.activeTabText]}>
                Task
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'event' && styles.activeTab]}
              onPress={() => setActiveTab('event')}
            >
              <Text style={[styles.tabText, activeTab === 'event' && styles.activeTabText]}>
                Event
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.field}>
              <Text style={styles.label}>
                {activeTab === 'task' ? 'Task Title' : 'Event Title'}
              </Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder={`Enter ${activeTab} title...`}
                placeholderTextColor="#888888"
                multiline={false}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryContainer}>
                {Object.keys(categoryColors).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryOption,
                      { backgroundColor: categoryColors[cat] + '40' },
                      category === cat && { borderColor: categoryColors[cat], borderWidth: 2 },
                    ]}
                    onPress={() => setCategory(cat as any)}
                  >
                    <Text style={styles.categoryText}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {activeTab === 'task' && (
              <View style={styles.field}>
                <Text style={styles.label}>Priority</Text>
                <View style={styles.priorityContainer}>
                  {Object.keys(priorityColors).map((prio) => (
                    <TouchableOpacity
                      key={prio}
                      style={[
                        styles.priorityOption,
                        { backgroundColor: priorityColors[prio] + '40' },
                        priority === prio && { borderColor: priorityColors[prio], borderWidth: 2 },
                      ]}
                      onPress={() => setPriority(prio as any)}
                    >
                      <Text style={styles.priorityText}>{prio}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            style={[styles.saveButton, !title.trim() && styles.disabledButton]}
            onPress={handleSave}
            disabled={!title.trim()}
          >
            <Text style={styles.saveButtonText}>
              {activeTab === 'task' ? 'Add Task' : 'Add Event'}
            </Text>
          </TouchableOpacity>
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
    maxHeight: '80%',
    paddingBottom: 20,
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
  tabContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#2979FF',
  },
  tabText: {
    fontSize: 16,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  priorityText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  saveButton: {
    backgroundColor: '#2979FF',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#444444',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default QuickAddModal;