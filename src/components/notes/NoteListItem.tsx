// src/components/notes/NoteListItem.tsx
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
  viewType: 'list' | 'detailed';
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

const NoteListItem: React.FC<Props> = ({
  note,
  index,
  viewType,
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
        styles.listNoteItem,
        {
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
          opacity: slideAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.listNoteContent}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={[
          styles.listNoteColorStripe,
          { backgroundColor: note.color || noteColors[0] }
        ]} />

        <View style={styles.listNoteBody}>
          <View style={styles.listNoteHeader}>
            <View style={styles.listNoteTitleContainer}>
              <Text style={styles.listNoteTitle} numberOfLines={1}>
                {note.title}
              </Text>
              <View style={styles.listNoteIcons}>
                {note.pinned && (
                  <Ionicons name="pin" size={14} color="#FF9800" />
                )}
                {note.favorite && (
                  <Ionicons name="heart" size={14} color="#ff4757" />
                )}
              </View>
            </View>

            <View style={styles.listNoteActions}>
              <TouchableOpacity
                onPress={onToggleFavorite}
                style={styles.listActionButton}
              >
                <Ionicons
                  name={note.favorite ? "heart" : "heart-outline"}
                  size={16}
                  color={note.favorite ? "#ff4757" : "#666"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onShare}
                style={styles.listActionButton}
              >
                <Ionicons name="share-outline" size={16} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onDelete}
                style={styles.listActionButton}
              >
                <Ionicons name="trash-outline" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.listNotePreview} numberOfLines={viewType === 'detailed' ? 3 : 2}>
            {note.content.replace(/#\w+/g, '').trim()}
          </Text>

          <View style={styles.listNoteFooter}>
            <View style={styles.listNoteMetaLeft}>
              <Text style={styles.listNoteDate}>
                {formatDate(note.updatedAt)}
              </Text>
              <Text style={styles.listNoteStats}>
                {note.wordCount} words • {note.readTime} min read
              </Text>
            </View>

            <View style={styles.listNoteMetaRight}>
              {note.category && (
                <View style={[
                  styles.listNoteCategoryBadge,
                  { backgroundColor: categoryColors[note.category] + '20' }
                ]}>
                  <Text style={[
                    styles.listNoteCategoryText,
                    { color: categoryColors[note.category] }
                  ]}>
                    {note.category}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {note.tags.length > 0 && viewType === 'detailed' && (
            <View style={styles.listNoteTags}>
              {note.tags.slice(0, 4).map(tag => (
                <View key={tag} style={styles.listNoteTag}>
                  <Text style={styles.listNoteTagText}>#{tag}</Text>
                </View>
              ))}
              {note.tags.length > 4 && (
                <Text style={styles.listNoteMoreTags}>+{note.tags.length - 4}</Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  listNoteItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    overflow: 'hidden',
  },
  listNoteContent: {
    flexDirection: 'row',
  },
  listNoteColorStripe: {
    width: 4,
  },
  listNoteBody: {
    flex: 1,
    padding: 16,
  },
  listNoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listNoteTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listNoteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  listNoteIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  listNoteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  listActionButton: {
    padding: 4,
  },
  listNotePreview: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 12,
  },
  listNoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listNoteMetaLeft: {
    flex: 1,
  },
  listNoteDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  listNoteStats: {
    fontSize: 11,
    color: '#666',
  },
  listNoteMetaRight: {
    alignItems: 'flex-end',
  },
  listNoteCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  listNoteCategoryText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  listNoteTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  listNoteTag: {
    backgroundColor: '#333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  listNoteTagText: {
    fontSize: 10,
    color: '#2979FF',
  },
  listNoteMoreTags: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
    alignSelf: 'center',
  },
});

export default NoteListItem;