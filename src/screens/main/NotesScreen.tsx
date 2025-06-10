// src/screens/main/NotesScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
  Platform,
  Dimensions,
  RefreshControl,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

// Import components
import NoteGridItem from '../../components/notes/NoteGridItem';
import NoteListItem from '../../components/notes/NoteListItem';
import NoteEditor from '../../components/notes/NoteEditor';
import NotesHeader from '../../components/notes/NotesHeader';
import NotesFilters from '../../components/notes/NotesFilters';
import EmptyNotesState from '../../components/notes/EmptyNotesState';

const { width } = Dimensions.get('window');

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
  attachments?: string[];
  reminder?: Date;
}

interface Folder {
  id: string;
  name: string;
  color: string;
  noteCount: number;
}

type SortMode = 'recent' | 'created' | 'alphabetical' | 'wordCount';
type ViewMode = 'grid' | 'list' | 'detailed';

const noteColors = [
  '#FFE082', '#FFCC80', '#FFAB91', '#F8BBD9',
  '#E1BEE7', '#C5CAE9', '#BBDEFB', '#B2DFDB',
  '#C8E6C9', '#DCEDC8', '#F0F4C3', '#FFF9C4'
];

const categoryColors = {
  personal: '#4CAF50',
  work: '#2979FF',
  ideas: '#FF9800',
  shopping: '#E91E63',
};

const NotesScreen: React.FC = () => {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [sortBy, setSortBy] = useState<SortMode>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyPinned, setOnlyPinned] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Animation
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    // Mock data with enhanced variety
    const mockNotes: Note[] = [
      {
        id: '1',
        title: 'Meeting Notes - Q4 Planning',
        content: 'Key discussion points from today\'s quarterly planning meeting:\n\n• Revenue targets for Q4\n• New product launches\n• Team expansion plans\n• Budget allocations\n\nAction items:\n- Follow up with marketing team\n- Prepare budget proposal\n- Schedule follow-up meeting\n\n#meeting #planning #q4',
        tags: ['meeting', 'planning', 'q4', 'work'],
        createdAt: new Date(2024, 3, 24),
        updatedAt: new Date(2024, 3, 24),
        category: 'work',
        color: '#BBDEFB',
        favorite: false,
        pinned: true,
        wordCount: 45,
        readTime: 1,
      },
      {
        id: '2',
        title: 'App Ideas',
        content: 'Brainstorming session results for new mobile app concepts:\n\n🚀 **Productivity Apps:**\n• Time tracking with AI insights\n• Smart habit tracker\n• Voice-activated task manager\n\n💡 **Creative Apps:**\n• Collaborative mood board\n• AI-powered writing assistant\n• Digital art portfolio\n\n🎯 **Lifestyle Apps:**\n• Sustainable living tracker\n• Local community connector\n• Wellness journey planner\n\nNext steps: Market research and feasibility analysis\n\n#ideas #mobile #apps #innovation',
        tags: ['ideas', 'mobile', 'apps', 'innovation', 'brainstorming'],
        createdAt: new Date(2024, 3, 23),
        updatedAt: new Date(2024, 3, 24),
        category: 'ideas',
        color: '#FFF9C4',
        favorite: true,
        pinned: false,
        wordCount: 85,
        readTime: 2,
      },
      // Add more mock notes...
    ];

    const mockFolders: Folder[] = [
      { id: '1', name: 'Work Projects', color: '#2979FF', noteCount: 8 },
      { id: '2', name: 'Personal', color: '#4CAF50', noteCount: 12 },
      { id: '3', name: 'Ideas & Inspiration', color: '#FF9800', noteCount: 5 },
      { id: '4', name: 'Shopping Lists', color: '#E91E63', noteCount: 3 },
    ];

    setNotes(mockNotes);
    setFolders(mockFolders);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Filter and sort notes
  useEffect(() => {
    let filtered = notes;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(note =>
        selectedTags.every(tag => note.tags.includes(tag))
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(note =>
        note.category && selectedCategories.includes(note.category)
      );
    }

    // Favorites filter
    if (onlyFavorites) {
      filtered = filtered.filter(note => note.favorite);
    }

    // Pinned filter
    if (onlyPinned) {
      filtered = filtered.filter(note => note.pinned);
    }

    // Sort
    filtered.sort((a, b) => {
      // Always keep pinned notes at top
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      switch (sortBy) {
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'wordCount':
          return (b.wordCount || 0) - (a.wordCount || 0);
        case 'recent':
        default:
          return b.updatedAt.getTime() - a.updatedAt.getTime();
      }
    });

    setFilteredNotes(filtered);
  }, [notes, searchQuery, selectedTags, selectedCategories, onlyFavorites, onlyPinned, sortBy]);

  useFocusEffect(
    useCallback(() => {
      // Refresh when screen comes into focus
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleNotePress = (note: Note) => {
    setEditingNote(note);
    setShowAddModal(true);
  };

  const handleAddNote = () => {
    setEditingNote(null);
    setShowAddModal(true);
  };

  const handleDeleteNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    Alert.alert(
      'Delete Note',
      `Are you sure you want to delete "${note?.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setNotes(prev => prev.filter(n => n.id !== noteId));
          },
        },
      ]
    );
  };

  const handleToggleFavorite = (noteId: string) => {
    setNotes(prev => prev.map(note =>
      note.id === noteId
        ? { ...note, favorite: !note.favorite, updatedAt: new Date() }
        : note
    ));
  };

  const handleTogglePin = (noteId: string) => {
    setNotes(prev => prev.map(note =>
      note.id === noteId
        ? { ...note, pinned: !note.pinned, updatedAt: new Date() }
        : note
    ));
  };

  const handleShareNote = async (note: Note) => {
    try {
      await Share.share({
        title: note.title,
        message: `${note.title}\n\n${note.content}`,
      });
    } catch (error) {
      console.error('Error sharing note:', error);
    }
  };

  const handleSaveNote = (noteData: Partial<Note>) => {
    if (editingNote) {
      setNotes(prev => prev.map(note =>
        note.id === editingNote.id
          ? { ...note, ...noteData, updatedAt: new Date() }
          : note
      ));
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        ...noteData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Note;
      setNotes(prev => [newNote, ...prev]);
    }
    setShowAddModal(false);
    setEditingNote(null);
  };

  const renderNoteItem: ListRenderItem<Note> = ({ item, index }) => {
    if (viewMode === 'grid') {
      return (
        <NoteGridItem
          note={item}
          index={index}
          onPress={() => handleNotePress(item)}
          onDelete={() => handleDeleteNote(item.id)}
          onToggleFavorite={() => handleToggleFavorite(item.id)}
          onTogglePin={() => handleTogglePin(item.id)}
          onShare={() => handleShareNote(item)}
          categoryColors={categoryColors}
        />
      );
    }

    return (
      <NoteListItem
        note={item}
        index={index}
        viewType={viewMode}
        onPress={() => handleNotePress(item)}
        onDelete={() => handleDeleteNote(item.id)}
        onToggleFavorite={() => handleToggleFavorite(item.id)}
        onTogglePin={() => handleTogglePin(item.id)}
        onShare={() => handleShareNote(item)}
        categoryColors={categoryColors}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {!showAddModal ? (
          <>
            <NotesHeader
              onAdd={handleAddNote}
              onFilter={() => setShowFilters(true)}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={sortBy}
              onSortChange={setSortBy}
              hasActiveFilters={selectedTags.length > 0 || selectedCategories.length > 0 || onlyFavorites || onlyPinned}
            />

            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search notes..."
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

            <NotesFilters
              visible={showFilters}
              onClose={() => setShowFilters(false)}
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              selectedCategories={selectedCategories}
              onCategoriesChange={setSelectedCategories}
              onlyFavorites={onlyFavorites}
              onFavoritesChange={setOnlyFavorites}
              onlyPinned={onlyPinned}
              onPinnedChange={setOnlyPinned}
              sortBy={sortBy}
              onSortChange={setSortBy}
              notes={notes}
              categoryColors={categoryColors}
            />

            {/* Filter indicators */}
            {(selectedTags.length > 0 || selectedCategories.length > 0 || onlyFavorites || onlyPinned) && (
              <View style={styles.filterIndicators}>
                {onlyFavorites && (
                  <View style={styles.filterChip}>
                    <Ionicons name="heart" size={12} color="#ff4757" />
                    <Text style={[styles.filterChipText, { color: '#ff4757' }]}>
                      Favorites
                    </Text>
                    <TouchableOpacity onPress={() => setOnlyFavorites(false)}>
                      <Ionicons name="close" size={12} color="#ff4757" />
                    </TouchableOpacity>
                  </View>
                )}

                {onlyPinned && (
                  <View style={styles.filterChip}>
                    <Ionicons name="pin" size={12} color="#FF9800" />
                    <Text style={[styles.filterChipText, { color: '#FF9800' }]}>
                      Pinned
                    </Text>
                    <TouchableOpacity onPress={() => setOnlyPinned(false)}>
                      <Ionicons name="close" size={12} color="#FF9800" />
                    </TouchableOpacity>
                  </View>
                )}

                {selectedCategories.map(category => (
                  <View key={category} style={[
                    styles.filterChip,
                    { backgroundColor: categoryColors[category as keyof typeof categoryColors] + '20' }
                  ]}>
                    <Text style={[
                      styles.filterChipText,
                      { color: categoryColors[category as keyof typeof categoryColors] }
                    ]}>
                      {category}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setSelectedCategories(prev => prev.filter(c => c !== category))}
                    >
                      <Ionicons
                        name="close"
                        size={12}
                        color={categoryColors[category as keyof typeof categoryColors]}
                      />
                    </TouchableOpacity>
                  </View>
                ))}

                {selectedTags.map(tag => (
                  <View key={tag} style={styles.filterChip}>
                    <Text style={styles.filterChipText}>#{tag}</Text>
                    <TouchableOpacity
                      onPress={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                    >
                      <Ionicons name="close" size={12} color="#666" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Sort indicator */}
            <View style={styles.sortIndicator}>
              <Text style={styles.sortText}>
                Sorted by: {
                  sortBy === 'recent' ? 'Last modified' :
                    sortBy === 'created' ? 'Date created' :
                      sortBy === 'alphabetical' ? 'Title A-Z' :
                        'Word count'
                }
              </Text>
              <Text style={styles.countText}>
                {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
              </Text>
            </View>

            {/* Notes List */}
            <FlatList
              data={filteredNotes}
              keyExtractor={item => item.id}
              renderItem={renderNoteItem}
              contentContainerStyle={[
                styles.listContainer,
                viewMode === 'grid' && styles.gridContainer
              ]}
              numColumns={viewMode === 'grid' ? 2 : 1}
              key={viewMode} // Force re-render when view mode changes
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#2979FF"
                  colors={["#2979FF"]}
                />
              }
              ListEmptyComponent={() => (
                <EmptyNotesState
                  searchQuery={searchQuery}
                  onlyFavorites={onlyFavorites}
                  onlyPinned={onlyPinned}
                />
              )}
              ItemSeparatorComponent={() => (
                viewMode !== 'grid' ? <View style={{ height: 12 }} /> : null
              )}
            />

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={handleAddNote}>
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <NoteEditor
            note={editingNote}
            onSave={handleSaveNote}
            onCancel={() => {
              setShowAddModal(false);
              setEditingNote(null);
            }}
            noteColors={noteColors}
            categoryColors={categoryColors}
          />
        )}
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

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },

  // Filter Indicators
  filterIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  filterChipText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },

  // Sort Indicator
  sortIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sortText: {
    fontSize: 12,
    color: '#666',
  },
  countText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  // List Container
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  gridContainer: {
    paddingHorizontal: 16,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2979FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default NotesScreen;