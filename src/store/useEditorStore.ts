import { create } from 'zustand';
import type { EditorDocument } from '../types';
import { INITIAL_EDITOR_DOCUMENTS } from '../data/editorMockData';

interface EditorState {
  documents: EditorDocument[];
  activeDocumentId: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  selectDocument: (id: string) => void;
  createDocument: () => void;
  deleteDocument: (id: string) => void;
  renameDocument: (id: string, title: string) => void;
  updateContent: (id: string, content: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  documents: INITIAL_EDITOR_DOCUMENTS,
  activeDocumentId: INITIAL_EDITOR_DOCUMENTS[0]?.id ?? '',
  sidebarOpen: true,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  selectDocument: (id) => set({ activeDocumentId: id }),

  createDocument: () => {
    const id = `doc-${Date.now()}`;
    const now = new Date().toISOString();
    const newDoc: EditorDocument = {
      id,
      title: 'Untitled Document',
      content: '<p><br></p>',
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ documents: [newDoc, ...state.documents], activeDocumentId: id }));
  },

  deleteDocument: (id) => {
    const state = get();
    const remaining = state.documents.filter((d) => d.id !== id);
    const activeDocumentId =
      state.activeDocumentId === id ? (remaining[0]?.id ?? '') : state.activeDocumentId;
    set({ documents: remaining, activeDocumentId });
  },

  renameDocument: (id, title) => {
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, title, updatedAt: new Date().toISOString() } : d
      ),
    }));
  },

  updateContent: (id, content) => {
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, content, updatedAt: new Date().toISOString() } : d
      ),
    }));
  },
}));
