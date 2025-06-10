// src/components/notes/NoteEditor.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
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
  note: Note | null;
  onSave: (noteData: Partial<Note>) => void;
  onCancel: () => void;
  noteColors: string[];
  categoryColors: Record<string, string>;
}

const NoteEditor: React.FC<Props> = ({
  note,
  onSave,
  onCancel,
  noteColors,
  categoryColors,
}) => {
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState(noteColors[0]);
  const [noteCategory, setNoteCategory] = useState<'personal' | 'work' | 'ideas' | 'shopping'>('personal');
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  useEffect(() => {
    if (note) {
      setNoteTitle(note.title);
      setNoteContent(note.content);
      setNoteColor(note.color || noteColors[0]);
      setNoteCategory(note.category || 'personal');
      setNoteTags(note.tags || []);
      setIsPinned(note.pinned || false);
      setIsFavorite(note.favorite || false);
    }
  }, [note, noteColors]);

  const extractTags = (content: string): string[] => {
    const tagRegex = /#(\w+)/g;
    const tags: string[] = [];
    let match;

    while ((match = tagRegex.exec(content)) !== null) {
      const tag = match[1].toLowerCase();
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }

    return tags;
  };

  const calculateReadTime = (content: string): number => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  const calculateWordCount = (content: string): number => {
    return content.trim().split(/\s+/).length;
  };

  const handleSave = () => {
    if (!noteTitle.trim() && !noteContent.trim()) {
      Alert.alert('Error', 'Title or content is required');
      return;
    }

    const title = noteTitle.trim() || noteContent.split('\n')[0].substring(0, 50) + '...';
    const content = noteContent.trim();
    const autoTags = extractTags(content);
    const allTags = [...new Set([...noteTags, ...autoTags])];
    const wordCount = calculateWordCount(content);
    const readTime = calculateReadTime(content);

    const noteData: Partial<Note> = {
      title,
      content,
      tags: allTags,
      color: noteColor,
      category: noteCategory,
      pinned: isPinned,
      favorite: isFavorite,
      wordCount,
      readTime,
    };

    onSave(noteData);
  };

  const addTag = () => {
    if (newTag.trim() && !noteTags.includes(newTag.trim().toLowerCase())) {
      setNoteTags(prev => [...prev, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setNoteTags(prev => prev.filter(t => t !== tag));
  };

  const insertFormatting = (format: 'bold' | 'italic' | 'bullet' | 'checkbox') => {
    const currentContent = noteContent;
    const beforeCursor = currentContent.substring(0, cursorPosition);
    const afterCursor = currentContent.substring(cursorPosition);

    let insertion = '';
    let newCursorPosition = cursorPosition;

    switch (format) {
      case 'bold':
        insertion = '**bold text**';
        newCursorPosition = cursorPosition + 2;
        break;
      case 'italic':
        insertion = '*italic text*';
        newCursorPosition = cursorPosition + 1;
        break;
      case 'bullet':
        insertion = '\n• ';
        newCursorPosition = cursorPosition + 3;
        break;
      case 'checkbox':
        insertion = '\n☐ ';
        newCursorPosition = cursorPosition + 3;
        break;
    }

    const newContent = beforeCursor + insertion + afterCursor;
    setNoteContent(newContent);
    setCursorPosition(newCursorPosition);
  };

  return (
    <View style={styles.editorContainer}>
      {/* Editor Header */}
      <View style={styles.editorHeader}>
        <TouchableOpacity onPress={onCancel}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.editorTitle}>
          {note ? 'Edit Note' : 'New Note'}
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Ionicons name="checkmark" size={24} color="#2979FF" />
        </TouchableOpacity>
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.toolbarActions}>
            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={() => insertFormatting('bold')}
            >
              <Text style={[styles.toolbarButtonText, { fontWeight: 'bold' }]}>B</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={() => insertFormatting('italic')}
            >
              <Text style={[styles.toolbarButtonText, { fontStyle: 'italic' }]}>I</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={() => insertFormatting('bullet')}
            >
              <Ionicons name="list" size={18} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={() => insertFormatting('checkbox')}
            >
              <Ionicons name="checkbox-outline" size={18} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={() => setIsPinned(!isPinned)}
            >
              <Ionicons
                name={isPinned ? "pin" : "pin-outline"}
                size={18}
                color={isPinned ? "#FF9800" : "#fff"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={18}
                color={isFavorite ? "#ff4757" : "#fff"}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Title Input */}
      <TextInput
        style={styles.titleInput}
        value={noteTitle}
        onChangeText={setNoteTitle}
        placeholder="Note title"
        placeholderTextColor="#666"
        multiline
      />

      {/* Content Input */}
      <TextInput
        style={styles.contentInput}
        value={noteContent}
        onChangeText={setNoteContent}
        placeholder="Write your note here..."
        placeholderTextColor="#666"
        multiline
        textAlignVertical="top"
        onSelectionChange={({ nativeEvent }) => {
          setCursorPosition(nativeEvent.selection.start);
        }}
      />

      {/* Note Options */}
      <View style={styles.noteOptions}>
        {/* Color Selection */}
        <Text style={styles.optionLabel}>Color</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.colorPicker}>
            {noteColors.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  noteColor === color && styles.selectedColorOption
                ]}
                onPress={() => setNoteColor(color)}
              />
            ))}
          </View>
        </ScrollView>

        {/* Category Selection */}
        <Text style={styles.optionLabel}>Category</Text>
        <View style={styles.categoryOptions}>
          {(['personal', 'work', 'ideas', 'shopping'] as const).map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryOption,
                noteCategory === category && styles.selectedCategoryOption,
                { borderColor: categoryColors[category] }
              ]}
              onPress={() => setNoteCategory(category)}
            >
              <Text style={[
                styles.categoryOptionText,
                noteCategory === category && { color: categoryColors[category] }
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tags */}
        <Text style={styles.optionLabel}>Tags</Text>
        <View style={styles.tagInputContainer}>
          <TextInput
            style={styles.tagInput}
            value={newTag}
            onChangeText={setNewTag}
            placeholder="Add tag"
            placeholderTextColor="#666"
            onSubmitEditing={addTag}
          />
          <TouchableOpacity onPress={addTag} style={styles.addTagButton}>
            <Ionicons name="add" size={16} color="#2979FF" />
          </TouchableOpacity>
        </View>

        {noteTags.length > 0 && (
          <View style={styles.tagsList}>
            {noteTags.map(tag => (
              <View key={tag} style={styles.tagItem}>
                <Text style={styles.tagItemText}>#{tag}</Text>
                <TouchableOpacity onPress={() => removeTag(tag)}>
                  <Ionicons name="close" size={12} color="#666" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  editorContainer: {
    flex: 1,
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  editorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  toolbar: {
    backgroundColor: '#2a2a2a',
    paddingVertical: 8,
    marginBottom: 16,
  },
  toolbarActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  toolbarButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#1a1a1a',
    minWidth: 32,
    alignItems: 'center',
  },
  toolbarButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  noteOptions: {
    backgroundColor: '#2a2a2a',
    padding: 20,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    marginTop: 16,
  },
  colorPicker: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#fff',
    borderWidth: 3,
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#666',
  },
  selectedCategoryOption: {
    backgroundColor: 'rgba(41, 121, 255, 0.1)',
  },
  categoryOptionText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tagInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  addTagButton: {
    padding: 4,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tagItemText: {
    fontSize: 12,
    color: '#2979FF',
  },
});

export default NoteEditor;