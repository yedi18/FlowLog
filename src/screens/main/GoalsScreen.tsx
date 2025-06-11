import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Goal {
  id: string;
  title: string;
  completed: boolean;
}

const GoalsScreen: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalTitle, setGoalTitle] = useState('');

  const addGoal = () => {
    if (!goalTitle.trim()) return;
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: goalTitle.trim(),
      completed: false,
    };
    setGoals(prev => [newGoal, ...prev]);
    setGoalTitle('');
  };

  const toggleGoal = (id: string) => {
    setGoals(prev => prev.map(goal =>
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const renderItem = ({ item }: { item: Goal }) => (
    <View style={styles.goalItem}>
      <TouchableOpacity onPress={() => toggleGoal(item.id)}>
        <Ionicons
          name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={item.completed ? '#34C759' : '#8E8E93'}
        />
      </TouchableOpacity>
      <Text style={[styles.goalTitle, item.completed && styles.goalTitleCompleted]}>
        {item.title}
      </Text>
      <TouchableOpacity onPress={() => deleteGoal(item.id)}>
        <Ionicons name="trash-outline" size={20} color="#ff3b30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Goals</Text>
      </View>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add a goal"
          placeholderTextColor="#999"
          value={goalTitle}
          onChangeText={setGoalTitle}
          onSubmitEditing={addGoal}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addButton} onPress={addGoal}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={goals}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 8,
  },
  list: {
    paddingHorizontal: 20,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  goalTitle: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 16,
    color: '#fff',
  },
  goalTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
});

export default GoalsScreen;
