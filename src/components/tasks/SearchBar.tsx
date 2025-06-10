// src/components/tasks/SearchBar.tsx - Complete Todoist Search Bar Replica
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onClose: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  onClose,
  placeholder = "Search tasks, projects, labels...",
}) => {
  const inputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      // Focus input after animation
      inputRef.current?.focus();
    });

    return () => {
      // Cleanup animation
      slideAnim.setValue(-50);
      opacityAnim.setValue(0);
    };
  }, []);

  const handleClose = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const searchSuggestions = [
    { text: 'overdue', icon: 'warning', description: 'Tasks past due date' },
    { text: 'today', icon: 'calendar', description: 'Tasks due today' },
    { text: 'assigned to: me', icon: 'person', description: 'Tasks assigned to you' },
    { text: 'no project', icon: 'folder-open', description: 'Tasks without project' },
    { text: 'p1', icon: 'flag', description: 'Priority 1 tasks' },
  ];

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.searchInput}>
        <Ionicons name="search" size={18} color={TODOIST_COLORS.textSecondary} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={query}
          onChangeText={onQueryChange}
          placeholder={placeholder}
          placeholderTextColor={TODOIST_COLORS.textTertiary}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={18} color={TODOIST_COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Search Suggestions */}
      {query.length === 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Search suggestions</Text>
          {searchSuggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => onQueryChange(suggestion.text)}
            >
              <View style={styles.suggestionIcon}>
                <Ionicons name={suggestion.icon as any} size={16} color={TODOIST_COLORS.textSecondary} />
              </View>
              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionText}>{suggestion.text}</Text>
                <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Search Tips */}
      {query.length > 0 && query.length < 3 && (
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsText}>
            💡 Try searching for task names, project names, or labels
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: TODOIST_COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: TODOIST_COLORS.border,
    paddingBottom: 8,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TODOIST_COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginTop: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: TODOIST_COLORS.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: TODOIST_COLORS.text,
    paddingVertical: 0, // Remove default padding on Android
  },
  closeButton: {
    padding: 4,
  },
  suggestionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  suggestionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: TODOIST_COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    gap: 12,
  },
  suggestionIcon: {
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionText: {
    fontSize: 14,
    color: TODOIST_COLORS.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  suggestionDescription: {
    fontSize: 12,
    color: TODOIST_COLORS.textSecondary,
  },
  tipsContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  tipsText: {
    fontSize: 12,
    color: TODOIST_COLORS.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default SearchBar;