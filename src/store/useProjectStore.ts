import { create } from 'zustand';
import type { Project, Session, GraphNode, GraphEdge, ChatMessage, AISuggestion } from '../types';
import {
  INITIAL_PROJECTS, INITIAL_SESSIONS, INITIAL_NODES,
  INITIAL_EDGES, MOCK_AI_SUGGESTIONS, INITIAL_CHAT_MESSAGES
} from '../data/mockData';
import { useGraphStore } from './useGraphStore';
import { useChatStore } from './useChatStore';
import { useAIStore } from './useAIStore';
import { useAppStore } from './useAppStore';
import { useSessionStore } from './useSessionStore';

/**
 * Per-session snapshot: stores the graph state and chat messages for a session.
 * When the user switches sessions, the current state is saved here
 * and the target session's state is restored into the graph/chat stores.
 */
interface SessionSnapshot {
  nodes: GraphNode[];
  edges: GraphEdge[];
  messages: ChatMessage[];
  aiSuggestions: AISuggestion[];
}

// In-memory session snapshot storage
const sessionSnapshots = new Map<string, SessionSnapshot>();

// Initialize snapshot for session-1 with mock data
sessionSnapshots.set('sess-1', {
  nodes: INITIAL_NODES,
  edges: INITIAL_EDGES,
  messages: INITIAL_CHAT_MESSAGES,
  aiSuggestions: MOCK_AI_SUGGESTIONS,
});

interface ProjectState {
  projects: Project[];
  activeProjectId: string;
  sessions: Session[];
  activeSessionId: string;
  selectProject: (id: string) => void;
  selectSession: (id: string) => void;
  createProject: (name: string, category: string, description: string) => void;
  createSession: (title: string) => void;
  deleteSession: (id: string) => void;
  renameSession: (id: string, newTitle: string) => void;
}

/**
 * Helper: save the current graph/chat state into a snapshot for the given session.
 * Uses lazy getters since useChatStore/useAIStore are defined later in this file.
 */
function saveCurrentSessionState(sessionId: string): void {
  const graphState = useGraphStore.getState();
  // Access stores lazily — they are defined later but exist by the time this runs
  const chatMessages = (useChatStore as any).getState().messages;
  const aiSuggestions = (useAIStore as any).getState().aiSuggestions;
  sessionSnapshots.set(sessionId, {
    nodes: graphState.nodes,
    edges: graphState.edges,
    messages: chatMessages,
    aiSuggestions: aiSuggestions,
  });
}

/**
 * Helper: restore a session's snapshot into the graph/chat stores.
 * Uses lazy getters since useChatStore/useAIStore are defined later in this file.
 */
function restoreSessionState(sessionId: string): void {
  const snapshot = sessionSnapshots.get(sessionId);
  if (snapshot) {
    // Restore graph
    useGraphStore.getState().setNodes(snapshot.nodes);
    useGraphStore.getState().setEdges(snapshot.edges);
    useGraphStore.getState().selectNode(null);
    // Restore chat
    (useChatStore as any).getState().restoreMessages(snapshot.messages);
    // Restore AI suggestions
    (useAIStore as any).getState().restoreSuggestions(snapshot.aiSuggestions);
  } else {
    // New session with no snapshot — clean slate
    const rootNode: GraphNode = {
      id: `node-root-${sessionId}`,
      position: { x: 0, y: 0 },
      data: {
        title: 'New Reasoning Root',
        summary: 'Start your reasoning tree from here.',
        displayType: 'Strategy',
        internalType: 'root',
        status: 'proposed',
        depth: 0,
        branchColor: '#6366f1',
        creator: 'user',
        confidence: 50,
        pros: [],
        cons: [],
        riskFactor: 'Low',
        notes: '',
        bookmarked: false,
        collapsed: false,
        hasChildren: false,
        experts: [],
        evidence: [],
      },
    };
    useGraphStore.getState().setNodes([rootNode]);
    useGraphStore.getState().setEdges([]);
    useGraphStore.getState().selectNode(rootNode.id);
    (useChatStore as any).getState().clearMessages();
    (useAIStore as any).getState().restoreSuggestions([]);
  }
  // Reset session-level state
  useSessionStore.getState().resetSession();
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: INITIAL_PROJECTS,
  activeProjectId: 'proj-1',
  sessions: INITIAL_SESSIONS,
  activeSessionId: 'sess-1',
  selectProject: (id) => {
    const proj = get().projects.find(p => p.id === id);
    if (proj) {
      set({ activeProjectId: id });
      useAppStore.getState().addToast(`Switched to project: ${proj.name}`, 'info');
      useAIStore.getState().addActivity('Switched Project', proj.name);
    }
  },
  selectSession: (id) => {
    const { activeSessionId } = get();
    if (id === activeSessionId) return; // Already active

    const sess = get().sessions.find(s => s.id === id);
    if (!sess) return;

    // 1. Save the current session's state
    saveCurrentSessionState(activeSessionId);

    // 2. Update the "last message" for the outgoing session
    const currentMessages = useChatStore.getState().messages;
    const lastUserMsg = [...currentMessages].reverse().find(m => m.sender === 'user');
    if (lastUserMsg) {
      set(state => ({
        sessions: state.sessions.map(s =>
          s.id === activeSessionId
            ? { ...s, lastMessage: lastUserMsg.content.slice(0, 80), updatedAt: new Date().toISOString() }
            : s
        ),
      }));
    }

    // 3. Switch to the new session
    set({ activeSessionId: id });

    // 4. Restore the target session's state
    restoreSessionState(id);

    useAppStore.getState().addToast(`Loaded session: ${sess.title}`, 'info');
  },
  createProject: (name, category, description) => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name, category, description,
      nodeCount: 1,
      updatedAt: 'Just now',
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    set(state => ({ projects: [newProj, ...state.projects], activeProjectId: newProj.id }));
    useAppStore.getState().addToast(`Created project "${name}"`, 'success');
    useAIStore.getState().addActivity('Created Project', name);
  },
  createSession: (title) => {
    const { activeSessionId } = get();

    // Save the current session before switching away
    saveCurrentSessionState(activeSessionId);

    const newSess: Session = {
      id: `sess-${Date.now()}`,
      projectId: get().activeProjectId,
      title,
      lastMessage: 'Session started.',
      updatedAt: new Date().toISOString()
    };
    set(state => ({ sessions: [newSess, ...state.sessions], activeSessionId: newSess.id }));

    // Restore new session (will create a clean slate since no snapshot exists)
    restoreSessionState(newSess.id);

    useAppStore.getState().addToast(`Started new session: ${title}`, 'success');
  },
  deleteSession: (id) => {
    const { sessions, activeSessionId } = get();
    // Prevent deleting the last session
    if (sessions.length <= 1) {
      useAppStore.getState().addToast('Cannot delete the last session', 'warning');
      return;
    }

    // If deleting the active session, switch to another first
    if (id === activeSessionId) {
      const otherSession = sessions.find(s => s.id !== id);
      if (otherSession) {
        // Save current state, switch to other session
        saveCurrentSessionState(activeSessionId);
        set({ activeSessionId: otherSession.id });
        restoreSessionState(otherSession.id);
      }
    }

    // Remove snapshot and session entry
    sessionSnapshots.delete(id);
    set(state => ({
      sessions: state.sessions.filter(s => s.id !== id),
    }));

    useAppStore.getState().addToast('Session deleted', 'info');
  },
  renameSession: (id, newTitle) => {
    set(state => ({
      sessions: state.sessions.map(s =>
        s.id === id ? { ...s, title: newTitle, updatedAt: new Date().toISOString() } : s
      ),
    }));
    useAppStore.getState().addToast(`Renamed to "${newTitle}"`, 'success');
  },
}));
