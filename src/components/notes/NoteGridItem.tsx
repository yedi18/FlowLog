// src/components/notes/NoteGridItem.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  pinned?: boolean;
  color?: string;
  favorite?: boolean;
  wordCount?: number;
  readTime?: number;
  category?: 'personal' | 'work' | 'ideas' | 'shopping';
}

interface Props {
  note: Note;
  index: number;
  onPress: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onTogglePin: () => void;
  onShare: () => void;
  categoryColors: Record<string, string>;
}

const noteColors = [
  '#FFE082', '#FFCC80', '#FFAB91', '#F8BBD9',
  '#E1BEE7', '#C5CAE9', '#BBDEFB', '#B2DFDB',
  '#C8E6C9', '#DCEDC8', '#F0F4C3', '#FFF9C4'
];

const NoteGridItem: React.FC<Props> = ({
  note,
  index,
  onPress,
  onDelete,
  onToggleFavorite,
  onTogglePin,
  onShare,
  categoryColors,
}) => {
  const slideAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, [index]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US');
    }
  };

  return (
    <Animated.View
      style={[
        styles.gridNoteItem,
        { backgroundColor: note.color || noteColors[0] },
        {
          transform: [
            {
              scale: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
          opacity: slideAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.gridNoteContent}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.gridNoteHeader}>
          <View style={styles.gridNoteActions}>
            {note.pinned && (
              <Ionicons name="pin" size={14} color="#333" />
            )}
            {note.favorite && (
              <Ionicons name="heart" size={14} color="#ff4757" />
            )}
          </View>
          <TouchableOpacity onPress={onDelete}>
            <Ionicons name="close" size={16} color="#666" />
          </TouchableOpacity>
        </View>

        <Text style={styles.gridNoteTitle} numberOfLines={2}>
          {note.title}
        </Text>

        <Text style={styles.gridNotePreview} numberOfLines={4}>
          {note.content.replace(/#\w+/g, '').trim()}
        </Text>

        {note.tags.length > 0 && (
          <View style={styles.gridNoteTags}>
            {note.tags.slice(0, 3).map(tag => (
              <Text key={tag} style={styles.gridNoteTag}>
                #{tag}
              </Text>
            ))}
            {note.tags.length > 3 && (
              <Text style={styles.gridNoteMoreTags}>+{note.tags.length - 3}</Text>
            )}
          </View>
        )}

        <View style={styles.gridNoteFooter}>
          <Text style={styles.gridNoteDate}>
            {formatDate(note.updatedAt)}
          </Text>
          {note.category && (
            <View style={[
              styles.gridNoteCategoryBadge,
              { backgroundColor: categoryColors[note.category] }
            ]}>
              <Text style={styles.gridNoteCategoryText}>
                {note.category.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  gridNoteItem: {
    flex: 1,
    margin: 4,
    borderRadius: 12,
    minHeight: 180,
    maxHeight: 220,
  },
  gridNoteContent: {
    flex: 1,
    padding: 12,
  },
  gridNoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridNoteActions: {
    flexDirection: 'row',
    gap: 4,
  },
  gridNoteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  gridNotePreview: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    flex: 1,
  },
  gridNoteTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
    marginBottom: 8,
  },
  gridNoteTag: {
    fontSize: 10,
    color: '#666',
  },
  gridNoteMoreTags: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
  },
  gridNoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridNoteDate: {
    fontSize: 10,
    color: '#666',
  },
  gridNoteCategoryBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridNoteCategoryText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default NoteGridItem;