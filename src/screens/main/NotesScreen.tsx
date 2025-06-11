// src/screens/main/NotesScreen.tsx
// מסך הערות מפושט כמו בתמונות

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  StatusBar,
  ListRenderItem,
  ScrollView,
  Animated,
  Share,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
  color?: string;
  favorite?: boolean;
  wordCount?: number;
  readTime?: number;
}

type SortMode = 'recent' | 'created' | 'alphabetical';
type ViewMode = 'grid' | 'list';

const NotesScreen: React.FC = () => {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [sortBy, setSortBy] = useState<SortMode>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  
  // Form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Animation
  const slideAnim = new Animated.Value(300);
  const fadeAnim = new Animated.Value(1);

  // Mock initial data
  useEffect(() => {
    const mockNotes: Note[] = [
      {
        id: '1',
        title: 'Meeting Notes',
        content: 'Some important decisions from the meeting. Key points discussed and action items for the team.',
        tags: ['work', 'meeting'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        favorite: false,
        wordCount: 18,
        readTime: 1,
      },
      {
        id: '2',
        title: 'Project Ideas',
        content: 'Brainstorming session results:\n\n• Mobile app improvements\n• User experience enhancements\n• Performance optimizations\n\n#project #ideas #development',
        tags: ['project', 'ideas', 'development'],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        favorite: true,
        wordCount: 25,
        readTime: 1,
      },
      {
        id: '3',
        title: 'Shopping List',
        content: 'Weekly groceries:\n\n🥬 Vegetables\n🥛 Dairy products\n🍎 Fruits\n🍞 Bread\n\n#shopping #weekly',
        tags: ['shopping', 'weekly'],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        favorite: false,
        wordCount: 15,
        readTime: 1,
      },
    ];
    setNotes(mockNotes);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredNotes = notes.filter(note => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }).sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

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

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setShowAddModal(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const resetForm = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
  };

  const handleSaveNote = () => {
    if (!noteTitle.trim() && !noteContent.trim()) {
      Alert.alert('Error', 'Title or content is required');
      return;
    }

    const title = noteTitle.trim() || noteContent.split('\n')[0].substring(0, 50) + '...';
    const content = noteContent.trim();
    const tags = extractTags(content);
    const wordCount = content.split(/\s+/).length;
    const readTime = calculateReadTime(content);

    const noteData = {
      title,
      content,
      tags,
      wordCount,
      readTime,
      updatedAt: new Date().toISOString(),
    };

    if (editingNote) {
      setNotes(prev => prev.map(note => 
        note.id === editingNote.id 
          ? { ...note, ...noteData }
          : note
      ));
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        ...noteData,
        createdAt: new Date().toISOString(),
        favorite: false,
      };
      setNotes(prev => [newNote, ...prev]);
    }

    closeModal();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowAddModal(false);
      resetForm();
    });
  };

  const handleDeleteNote = (noteId: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setNotes(prev => prev.filter(n => n.id !== noteId)),
        },
      ]
    );
  };

  const toggleFavoriteNote = (noteId: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, favorite: !note.favorite, updatedAt: new Date().toISOString() }
        : note
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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

  const renderNoteItem: ListRenderItem<Note> = ({ item }) => (
    <TouchableOpacity
      style={styles.noteItem}
      onPress={() => openEditModal(item)}
      activeOpacity={0.8}
    >
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.noteActions}>
          <TouchableOpacity
            onPress={() => toggleFavoriteNote(item.id)}
            style={styles.actionButton}
          >
            <Ionicons 
              name={item.favorite ? "heart" : "heart-outline"} 
              size={16} 
              color={item.favorite ? "#ff4757" : "#666"} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteNote(item.id)}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.notePreview} numberOfLines={2}>
        {item.content.replace(/#\w+/g, '').trim()}
      </Text>
      
      <View style={styles.noteFooter}>
        <Text style={styles.noteDate}>{formatDate(item.updatedAt)}</Text>
        <Text style={styles.noteStats}>
          {item.wordCount} words • {item.readTime} min read
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Note</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.toolbarButton}>
              <Ionicons name="text" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton}>
              <Ionicons name="text" size={20} color="#fff" style={{ fontStyle: 'italic' }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton}>
              <Ionicons name="list" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton}>
              <Ionicons name="list-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        {showAddModal ? (
          <View style={styles.editorContainer}>
            <TextInput
              style={styles.titleInput}
              value={noteTitle}
              onChangeText={setNoteTitle}
              placeholder="Meeting Notes"
              placeholderTextColor="#666"
              autoFocus
            />
            
            <TextInput
              style={styles.contentInput}
              value={noteContent}
              onChangeText={setNoteContent}
              placeholder="Some important decisions from the meeting..."
              placeholderTextColor="#666"
              multiline
              textAlignVertical="top"
            />

            <View style={styles.noteActions}>
              <Text style={styles.bulletPoint}>• Sample text</Text>
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
              <TouchableOpacity style={styles.bottomAction}>
                <Ionicons name="lock-closed-outline" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.bottomAction}>
                <Ionicons name="information-circle-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <FlatList
            data={filteredNotes}
            keyExtractor={item => item.id}
            renderItem={renderNoteItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No notes yet</Text>
                <Text style={styles.emptyDescription}>
                  Tap the + button to create your first note
                </Text>
              </View>
            )}
          />
        )}

        {/* FAB */}
        <TouchableOpacity 
          style={styles.fab} 
          onPress={showAddModal ? handleSaveNote : openAddModal}
        >
          <Ionicons 
            name={showAddModal ? "checkmark" : "add"} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  toolbarButton: {
    padding: 8,
  },

  // Editor Container
  editorContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    paddingVertical: 8,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  noteActions: {
    marginVertical: 20,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  bottomAction: {
    padding: 12,
  },

  // List
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  // Note Item
  noteItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  actionButton: {
    padding: 4,
  },
  notePreview: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteDate: {
    fontSize: 12,
    color: '#666',
  },
  noteStats: {
    fontSize: 12,
    color: '#666',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default NotesScreen;
