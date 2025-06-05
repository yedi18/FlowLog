export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  userId: string;
  isPinned: boolean;
}

export interface CreateNoteDTO {
  title: string;
  content?: string;
  tags?: string[];
  isPinned?: boolean;
}

export interface UpdateNoteDTO {
  title?: string;
  content?: string;
  tags?: string[];
  isPinned?: boolean;
}

export interface AIInsight {
  id: string;
  type: 'summary' | 'suggestion' | 'analysis';
  content: string;
  createdAt: Date;
  parentId: string; // Reference to Task, Event, or Note
  parentType: 'task' | 'event' | 'note';
}