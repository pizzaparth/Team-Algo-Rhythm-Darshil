import { create } from 'zustand';
import { 
  ViewMode, Project, Session, GraphNode, GraphEdge, 
  ChatMessage, AISuggestion, ActivityLog, NodeData, ClipboardPayload, GeneratedNode
} from '../types';
import { 
  INITIAL_PROJECTS, INITIAL_SESSIONS, INITIAL_NODES, 
  INITIAL_EDGES, MOCK_AI_SUGGESTIONS, INITIAL_CHAT_MESSAGES 
} from '../data/mockData';
import { applyLayout } from '../lib/graphLayout';
import { getMockedExpansion } from '../lib/mockExpansion';
import { useSessionStore } from './useSessionStore';

export type SidebarTab = 'projects' | 'sessions' | 'templates' | 'saved_graphs' | 'search' | 'exports' | 'settings';
export type AssistantTab = 'chat' | 'detail' | 'summary' | 'evidence' | 'experts' | 'notes' | 'suggestions' | 'activity';
export type ModalType = 'compare' | 'export' | 'settings' | 'create_node' | 'rename_node' | 'create_project' | 'delete_node' | 'expand_node' | null;

// ==========================================
// 1. App Store
// ==========================================
interface AppState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeSidebarTab: SidebarTab;
  setActiveSidebarTab: (tab: SidebarTab) => void;
  activeAssistantTab: AssistantTab;
  setActiveAssistantTab: (tab: AssistantTab) => void;
  activeModal: ModalType;
  modalData: any;
  openModal: (modal: ModalType, data?: any) => void;
  closeModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  toasts: { id: string; type: 'success' | 'info' | 'warning' | 'error'; message: string }[];
  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

/**
 * Generates initial graph nodes from the chat conversation when transitioning
 * to workspace view. Uses the LLM to extract the topic and create nodes.
 */
async function generateInitialNodesFromChat(graphState: any, chatMessages: any[]): Promise<void> {
  try {
    const { isLLMConfigured, chatCompletion, buildEnhancedContext, parseExpansionResponse } = await import('../lib/ai');

    if (!isLLMConfigured()) return;

    // Extract conversation summary for root node naming
    const userMessages = chatMessages
      .filter((m: any) => m.sender === 'user')
      .map((m: any) => m.content)
      .join('\n');
    const aiMessages = chatMessages
      .filter((m: any) => m.sender === 'ai')
      .slice(-2) // last 2 AI responses
      .map((m: any) => m.content.slice(0, 500))
      .join('\n');

    if (!userMessages.trim()) return;

    // Show loading feedback
    useAppStore.getState().addToast('🧠 Generating planning nodes from your conversation...', 'info');

    // Step 1: Ask LLM to extract topic + generate initial planning nodes
    const prompt = [
      {
        role: 'system' as const,
        content: `You are a planning assistant. The user had a conversation and is now opening a decision graph canvas. Your job is to:
1. Identify the main topic/goal from the conversation.
2. Generate 3-5 initial planning nodes that decompose this topic into actionable branches.

Respond with ONLY valid JSON:
{
  "rootTitle": "string — concise title for the root planning node (e.g., 'C++ DSA Learning Roadmap')",
  "rootSummary": "string — 1-2 sentence summary of the overall goal",
  "nodes": [
    {
      "title": "string",
      "summary": "string — 1-2 sentence description",
      "displayType": "string — one of: Strategic Option, Alternative Option, Risk Factor, Prerequisite, Expected Outcome",
      "internalType": "string — one of: strategic, alternative, risk, prerequisite, outcome",
      "confidence": number,
      "pros": ["string"],
      "cons": ["string"],
      "riskFactor": "string — Low, Medium, High, or Critical"
    }
  ],
  "reasoning": "string — why you chose these branches"
}`
      },
      {
        role: 'user' as const,
        content: `CONVERSATION CONTEXT:

USER MESSAGES:
${userMessages.slice(0, 1500)}

AI RESPONSES (summary):
${aiMessages.slice(0, 1500)}

Generate the root node title and 3-5 initial planning branches based on this conversation.`
      }
    ];

    const raw = await chatCompletion(prompt, {
      temperature: 0.5,
      maxTokens: 2000,
      responseFormat: { type: 'json_object' },
    });

    // Parse the response
    let parsed: any;
    try {
      // Try to extract JSON from the response
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch?.[0] ?? raw);
    } catch {
      console.error('[generateInitialNodesFromChat] Failed to parse JSON:', raw);
      return;
    }

    if (!parsed.rootTitle || !parsed.nodes?.length) return;

    // Step 2: Update the root node with the conversation topic
    const rootNode = graphState.nodes[0];
    if (rootNode) {
      useGraphStore.getState().updateNodeData(rootNode.id, {
        title: parsed.rootTitle,
        summary: parsed.rootSummary || rootNode.data.summary,
      });
    }

    // Step 3: Add generated child nodes
    const parentId = rootNode?.id || 'node-root';
    const generatedNodes = (parsed.nodes || []).map((n: any, i: number) => ({
      tempId: `init-${Date.now()}-${i}`,
      parentId,
      title: n.title || `Branch ${i + 1}`,
      summary: n.summary || '',
      displayType: n.displayType || 'Strategic Option',
      internalType: n.internalType || 'strategic',
      status: 'proposed' as const,
      confidence: n.confidence ?? 75,
      pros: n.pros || [],
      cons: n.cons || [],
      riskFactor: n.riskFactor || 'Medium',
    }));

    if (generatedNodes.length > 0) {
      useGraphStore.getState().addGeneratedNodes(generatedNodes);
      useAppStore.getState().addToast(
        `✨ Created "${parsed.rootTitle}" with ${generatedNodes.length} planning branches`,
        'success'
      );
    }
  } catch (err) {
    console.error('[generateInitialNodesFromChat] Error:', err);
    // Silently fail — user can still manually expand the root node
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  viewMode: 'landing',
  setViewMode: (mode) => {
    set({ viewMode: mode });

    // === SMART CANVAS INITIALIZATION ===
    // When switching to workspace, check if the graph has only a bare root
    // and the chat has meaningful conversation. If so, generate initial
    // planning nodes from the conversation context.
    if (mode === 'workspace') {
      const graphState = useGraphStore.getState();
      const chatMessages = (useChatStore as any)?.getState?.()?.messages ?? [];

      // Only auto-init if graph has ≤1 node (the bare root) and chat has AI messages
      const hasOnlyRoot = graphState.nodes.length <= 1;
      const hasConversation = chatMessages.filter((m: any) => m.sender === 'ai').length > 0;

      if (hasOnlyRoot && hasConversation) {
        // Extract topic from conversation and generate initial nodes
        generateInitialNodesFromChat(graphState, chatMessages).catch(err => {
          console.error('[setViewMode] Auto-init failed:', err);
        });
      }
    }
  },
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  activeSidebarTab: 'projects',
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
  activeAssistantTab: 'detail',
  setActiveAssistantTab: (tab) => set({ activeAssistantTab: tab }),
  activeModal: null,
  modalData: null,
  openModal: (modal, data = null) => set({ activeModal: modal, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = `toast-${Date.now()}`;
    set(state => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 3500);
  },
  removeToast: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
}));

// ==========================================
// 2. Project Store — with session isolation
// ==========================================

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

// ==========================================
// 3. Graph Store
// ==========================================
interface HistoryState {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  selectedNodeIds: string[];
  history: HistoryState[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  contextMenu: { show: boolean; x: number; y: number; nodeId?: string } | null;
  // Phase 2 state
  clipboard: ClipboardPayload | null;
  expandingNodeId: string | null;
  searchHighlightIds: string[];
  focusedBranchRootId: string | null;
  setNodes: (nodes: GraphNode[]) => void;
  setEdges: (edges: GraphEdge[]) => void;
  selectNode: (id: string | null) => void;
  setSelectedNodeIds: (ids: string[]) => void;
  updateNodeData: (id: string, dataPartial: Partial<NodeData>) => void;
  addNode: (node: Partial<GraphNode>, parentId?: string) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  toggleNodeBookmark: (id: string) => void;
  toggleNodeCollapse: (id: string) => void;
  undo: () => void;
  redo: () => void;
  openContextMenu: (x: number, y: number, nodeId?: string) => void;
  closeContextMenu: () => void;
  // Phase 2 actions
  setClipboard: (payload: ClipboardPayload | null) => void;
  setExpandingNodeId: (id: string | null) => void;
  setSearchHighlightIds: (ids: string[]) => void;
  setFocusedBranchRoot: (id: string | null) => void;
  expandNode: (nodeId: string) => Promise<void>;
  applyAutoLayout: () => void;
  copyNode: (nodeId: string) => void;
  pasteNode: (parentId?: string) => void;
  addGeneratedNodes: (generated: GeneratedNode[]) => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: INITIAL_NODES,
  edges: INITIAL_EDGES,
  selectedNodeId: 'node-root',
  selectedNodeIds: ['node-root'],
  history: [{ nodes: INITIAL_NODES, edges: INITIAL_EDGES }],
  historyIndex: 0,
  canUndo: false,
  canRedo: false,
  contextMenu: null,
  clipboard: null,
  expandingNodeId: null,
  searchHighlightIds: [],
  focusedBranchRootId: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  selectNode: (id) => {
    set({
      selectedNodeId: id,
      selectedNodeIds: id ? [id] : [],
    });
    useAppStore.getState().setActiveAssistantTab(id ? 'detail' : 'summary');
  },
  setSelectedNodeIds: (ids) => set({
    selectedNodeIds: ids,
    selectedNodeId: ids.length > 0 ? ids[ids.length - 1] : null
  }),
  
  updateNodeData: (id, dataPartial) => {
    const { nodes, edges, history, historyIndex } = get();
    const updatedNodes = nodes.map(node => 
      node.id === id ? { ...node, data: { ...node.data, ...dataPartial } } : node
    );
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: updatedNodes, edges });
    
    set({
      nodes: updatedNodes, history: newHistory,
      historyIndex: newHistory.length - 1, canUndo: true, canRedo: false
    });
    useAIStore.getState().addActivity('Updated Node', `Modified data for node #${id}`, id);
  },

  addNode: (nodePartial, parentId) => {
    const { nodes, edges, history, historyIndex } = get();
    const parentNode = parentId ? nodes.find(n => n.id === parentId) : null;
    const newId = `node-${Date.now().toString().slice(-4)}`;
    const depth = parentNode ? parentNode.data.depth + 1 : 0;
    const branchColor = parentNode ? parentNode.data.branchColor : '#6366f1';
    
    const xPos = parentNode ? parentNode.position.x + (Math.random() * 200 - 100) : 400;
    const yPos = parentNode ? parentNode.position.y + 180 : 300;

    const newNode: GraphNode = {
      id: newId,
      position: nodePartial.position || { x: xPos, y: yPos },
      data: {
        title: nodePartial.data?.title || 'New Decision Node',
        summary: nodePartial.data?.summary || 'Detailed decision evaluation summary for this branch.',
        displayType: nodePartial.data?.displayType || 'Strategic Option',
        internalType: nodePartial.data?.internalType || 'strategic',
        status: nodePartial.data?.status || 'proposed',
        depth, branchColor,
        creator: nodePartial.data?.creator || 'user',
        confidence: nodePartial.data?.confidence || 85,
        pros: nodePartial.data?.pros || ['High flexibility'],
        cons: nodePartial.data?.cons || ['Needs testing'],
        riskFactor: nodePartial.data?.riskFactor || 'Low',
        notes: nodePartial.data?.notes || '',
        bookmarked: false, collapsed: false, hasChildren: false,
        experts: [], evidence: []
      }
    };

    let updatedEdges = [...edges];
    if (parentId) {
      updatedEdges.push({
        id: `e-${parentId}-${newId}`,
        sourceId: parentId,
        targetId: newId,
        animated: true,
        style: { stroke: branchColor, strokeWidth: 2 }
      });
    }

    const updatedNodes = [...nodes, newNode];
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: updatedNodes, edges: updatedEdges });

    set({
      nodes: updatedNodes, edges: updatedEdges,
      selectedNodeId: newId, selectedNodeIds: [newId],
      history: newHistory, historyIndex: newHistory.length - 1,
      canUndo: true, canRedo: false
    });
    
    useAppStore.getState().addToast(`Added node "${newNode.data.title}"`, 'success');
    useAIStore.getState().addActivity('Created Node', newNode.data.title, newId);
  },

  deleteNode: (id) => {
    const { nodes, edges, history, historyIndex, selectedNodeId } = get();
    
    const nodesToDelete = new Set<string>([id]);
    let added = true;
    while (added) {
      added = false;
      edges.forEach(e => {
        if (nodesToDelete.has(e.sourceId) && !nodesToDelete.has(e.targetId)) {
          nodesToDelete.add(e.targetId);
          added = true;
        }
      });
    }

    const updatedNodes = nodes.filter(n => !nodesToDelete.has(n.id));
    const updatedEdges = edges.filter(e => !nodesToDelete.has(e.sourceId) && !nodesToDelete.has(e.targetId));

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: updatedNodes, edges: updatedEdges });

    set({
      nodes: updatedNodes, edges: updatedEdges,
      selectedNodeId: nodesToDelete.has(selectedNodeId as string) ? null : selectedNodeId,
      history: newHistory, historyIndex: newHistory.length - 1,
      canUndo: true, canRedo: false
    });

    useAppStore.getState().addToast('Deleted node(s)', 'info');
    useAIStore.getState().addActivity('Deleted Node', `Removed node #${id} and its children`);
  },

  duplicateNode: (id) => {
    const { nodes, edges, addNode } = get();
    const sourceNode = nodes.find(n => n.id === id);
    if (!sourceNode) return;
    const parentEdge = edges.find(e => e.targetId === id);
    
    addNode({
      position: { x: sourceNode.position.x + 80, y: sourceNode.position.y + 40 },
      data: { ...sourceNode.data, title: `${sourceNode.data.title} (Copy)`, creator: 'user' }
    }, parentEdge?.sourceId);
    useAppStore.getState().addToast('Duplicated node', 'success');
  },

  toggleNodeBookmark: (id) => {
    const node = get().nodes.find(n => n.id === id);
    if (node) {
      get().updateNodeData(id, { bookmarked: !node.data.bookmarked });
      useAppStore.getState().addToast(node.data.bookmarked ? 'Removed bookmark' : 'Bookmarked node', 'info');
    }
  },

  toggleNodeCollapse: (id) => {
    const node = get().nodes.find(n => n.id === id);
    if (node) {
      get().updateNodeData(id, { collapsed: !node.data.collapsed });
    }
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      set({
        nodes: history[nextIndex].nodes, edges: history[nextIndex].edges,
        historyIndex: nextIndex, canUndo: nextIndex > 0, canRedo: true
      });
      useAppStore.getState().addToast('Undo action', 'info');
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      set({
        nodes: history[nextIndex].nodes, edges: history[nextIndex].edges,
        historyIndex: nextIndex, canUndo: true, canRedo: nextIndex < history.length - 1
      });
      useAppStore.getState().addToast('Redo action', 'info');
    }
  },

  openContextMenu: (x, y, nodeId) => set({ contextMenu: { show: true, x, y, nodeId } }),
  closeContextMenu: () => set({ contextMenu: null }),

  // ===== Phase 2 Actions =====

  setClipboard: (payload) => set({ clipboard: payload }),
  setExpandingNodeId: (id) => set({ expandingNodeId: id }),
  setSearchHighlightIds: (ids) => set({ searchHighlightIds: ids }),
  setFocusedBranchRoot: (id) => set({ focusedBranchRootId: id }),

  applyAutoLayout: () => {
    const { nodes, edges } = get();
    const laidOutNodes = applyLayout(nodes, edges);
    set({ nodes: laidOutNodes });
  },

  copyNode: (nodeId) => {
    const { nodes, edges } = get();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const parentEdge = edges.find(e => e.targetId === nodeId);
    set({ clipboard: { node, sourceParentId: parentEdge?.sourceId ?? null } });
    useAppStore.getState().addToast('Node copied to clipboard', 'info');
  },

  pasteNode: (parentId) => {
    const { clipboard, addNode } = get();
    if (!clipboard) return;
    const targetParentId = parentId ?? clipboard.sourceParentId ?? undefined;
    addNode(
      {
        data: {
          ...clipboard.node.data,
          title: `${clipboard.node.data.title} (Paste)`,
          creator: 'user',
        }
      },
      targetParentId
    );
    useAppStore.getState().addToast('Node pasted from clipboard', 'success');
  },

  addGeneratedNodes: (generated: GeneratedNode[]) => {
    const { nodes, edges, history, historyIndex } = get();

    const branchColors: Record<string, string> = {
      strategic: '#3b82f6',
      alternative: '#10b981',
      risk: '#ef4444',
      prerequisite: '#f59e0b',
      outcome: '#8b5cf6',
      root: '#6366f1',
    };

    const newNodes: GraphNode[] = [];
    const newEdges: GraphEdge[] = [];

    generated.forEach((gen) => {
      const parentNode = nodes.find(n => n.id === gen.parentId)
        || newNodes.find(n => n.id === gen.parentId);
      const depth = parentNode ? parentNode.data.depth + 1 : 1;
      const branchColor = parentNode?.data.branchColor ?? branchColors[gen.internalType] ?? '#6366f1';
      const nodeId = `node-${gen.tempId}-${Date.now().toString().slice(-5)}`;

      const newNode: GraphNode = {
        id: nodeId,
        position: { x: (parentNode?.position.x ?? 0) + 320, y: parentNode?.position.y ?? 0 },
        data: {
          title: gen.title,
          summary: gen.summary,
          displayType: gen.displayType,
          internalType: gen.internalType,
          status: gen.status,
          depth,
          branchColor,
          creator: 'ai',
          confidence: gen.confidence,
          pros: gen.pros,
          cons: gen.cons,
          riskFactor: gen.riskFactor,
          notes: '',
          bookmarked: false,
          collapsed: false,
          hasChildren: false,
          experts: [],
          evidence: gen.evidence ?? [],
        },
      };

      newEdges.push({
        id: `e-${gen.parentId}-${nodeId}`,
        sourceId: gen.parentId,
        targetId: nodeId,
        animated: true,
        style: { stroke: branchColor, strokeWidth: 2 },
      });

      newNodes.push(newNode);
    });

    const updatedNodes = applyLayout([...nodes, ...newNodes], [...edges, ...newEdges]);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: updatedNodes, edges: [...edges, ...newEdges] });

    set({
      nodes: updatedNodes,
      edges: [...edges, ...newEdges],
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: true,
      canRedo: false,
    });

    useAIStore.getState().addActivity('AI Expanded', `Generated ${generated.length} child nodes`);
    useAppStore.getState().addToast(`Added ${generated.length} AI-generated branches`, 'success');
  },

  expandNode: async (nodeId: string) => {
    const { nodes, addGeneratedNodes } = get();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    set({ expandingNodeId: nodeId });
    useAppStore.getState().addToast('AI is generating branches...', 'info');

    try {
      const generated = await getMockedExpansion(nodeId, node.data.internalType);
      addGeneratedNodes(generated);
    } catch (err) {
      useAppStore.getState().addToast('Expansion failed. Please try again.', 'error');
    } finally {
      set({ expandingNodeId: null });
    }
  },
}));

// ==========================================
// 4. Chat Store (Phase 3 — AI Orchestrator Integration)
// ==========================================
interface ChatState {
  messages: ChatMessage[];
  isGenerating: boolean;
  contextSufficient: boolean;
  sendUserMessage: (content: string) => void;
  addSystemMessage: (content: string) => void;
  addAIMessage: (content: string, suggestedActions?: ChatMessage['suggestedActions']) => void;
  setContextSufficient: (sufficient: boolean) => void;
  clearMessages: () => void;
  restoreMessages: (messages: ChatMessage[]) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: INITIAL_CHAT_MESSAGES,
  isGenerating: false,
  contextSufficient: false,
  setContextSufficient: (sufficient) => set({ contextSufficient: sufficient }),
  clearMessages: () => set({ messages: [], isGenerating: false }),
  restoreMessages: (messages) => set({ messages, isGenerating: false }),

  addSystemMessage: (content) => {
    const msg: ChatMessage = {
      id: `msg-sys-${Date.now()}`,
      sender: 'ai',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    set(state => ({ messages: [...state.messages, msg] }));
  },

  addAIMessage: (content, suggestedActions) => {
    const msg: ChatMessage = {
      id: `msg-ai-${Date.now()}`,
      sender: 'ai',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions,
    };
    set(state => ({ messages: [...state.messages, msg], isGenerating: false }));
  },

  sendUserMessage: async (content) => {
    // 1. Add user message to conversation
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    set(state => ({ messages: [...state.messages, userMsg], isGenerating: true }));

    // 2. Try command parser first
    const { parseCommand } = await import('../lib/commandParser');
    const selectedNodeId = useGraphStore.getState().selectedNodeId;
    const cmdResult = parseCommand(content, selectedNodeId);

    if (cmdResult.recognized) {
      const systemContent = cmdResult.executed
        ? `✅ **Command executed:** ${cmdResult.command?.description ?? content}`
        : `⚠️ **Command failed:** ${cmdResult.error ?? 'Unknown error'}`;

      const sysMsg: ChatMessage = {
        id: `msg-cmd-${Date.now()}`,
        sender: 'ai',
        content: systemContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      set(state => ({ messages: [...state.messages, sysMsg], isGenerating: false }));
      return;
    }

    // 3. Route through AI Service
    try {
      const { assembleAIContext } = await import('../lib/aiContextAssembler');
      const { mockAIService } = await import('../lib/aiService');
      const { useSessionStore } = await import('./useSessionStore');

      const sessionState = useSessionStore.getState();
      const context = assembleAIContext(sessionState.pendingQuestion);

      // Set streaming state
      useSessionStore.getState().setStreaming(true);
      useSessionStore.getState().setConversationMode('processing');

      const response = await mockAIService.processMessage(content, context);

      // 4. Simulate streaming: feed response character-by-character
      const fullText = response.chatMessage;
      let streamedText = '';

      // Create a placeholder streaming message
      const streamMsgId = `msg-stream-${Date.now()}`;
      const streamMsg: ChatMessage = {
        id: streamMsgId,
        sender: 'ai',
        content: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isStreaming: true,
        suggestedActions: response.followUpActions?.map(a => ({
          label: a.label,
          action: a.action,
        })),
      };
      set(state => ({ messages: [...state.messages, streamMsg] }));

      // Stream characters
      const chunkSize = 3;
      for (let i = 0; i < fullText.length; i += chunkSize) {
        streamedText += fullText.slice(i, i + chunkSize);
        useSessionStore.getState().appendStreamingText(fullText.slice(i, i + chunkSize));

        // Update the streaming message in-place
        set(state => ({
          messages: state.messages.map(m =>
            m.id === streamMsgId ? { ...m, content: streamedText } : m
          ),
        }));

        await new Promise(r => setTimeout(r, 15));
      }

      // Finalize: mark streaming complete
      set(state => ({
        messages: state.messages.map(m =>
          m.id === streamMsgId ? { ...m, isStreaming: false, content: fullText } : m
        ),
        isGenerating: false,
        contextSufficient: true,
      }));

      // 5. Handle AI response side-effects
      // Add suggestions to AI store
      if (response.suggestions && response.suggestions.length > 0) {
        useAIStore.getState().addSuggestions(response.suggestions);
      }

      // Handle clarification question
      if (response.clarificationNeeded) {
        useSessionStore.getState().setPendingQuestion(response.clarificationNeeded);
        useSessionStore.getState().setConversationMode('waiting_for_answer');
        useSessionStore.getState().setPendingExpansionNodeId(
          response.clarificationNeeded.pendingNodeId ?? null
        );
      } else {
        useSessionStore.getState().setConversationMode('chat');
      }

      useSessionStore.getState().setStreaming(false);
      useAIStore.getState().addActivity('AI Response', `Responded to: "${content.slice(0, 50)}..."`);

    } catch (err) {
      console.error('[ChatStore] AI Service error:', err);
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'ai',
        content: '⚠️ I encountered an error processing your request. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      set(state => ({ messages: [...state.messages, errorMsg], isGenerating: false }));
    }
  },
}));

// ==========================================
// 5. AI Store (Phase 3 — Extended)
// ==========================================
interface AIState {
  aiSuggestions: AISuggestion[];
  activities: ActivityLog[];
  addBranchFromSuggestion: (suggestion: AISuggestion) => void;
  ignoreSuggestion: (suggestionId: string) => void;
  addSuggestions: (suggestions: AISuggestion[]) => void;
  restoreSuggestions: (suggestions: AISuggestion[]) => void;
  addActivity: (action: string, details: string, nodeId?: string) => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  aiSuggestions: MOCK_AI_SUGGESTIONS,
  activities: [
    { id: 'act-1', timestamp: '11:20 AM', user: 'Alex Vance', action: 'Created Workspace', details: 'Initialized Enterprise Architecture tree.' },
    { id: 'act-2', timestamp: '11:22 AM', user: 'AI Reasoner', action: 'Generated Nodes', details: 'Added Kafka vs Cloud Run options.', nodeId: 'node-1' }
  ],
  addBranchFromSuggestion: (suggestion) => {
    useGraphStore.getState().addNode({
      data: {
        title: suggestion.title,
        summary: suggestion.description,
        displayType: 'Strategic Option',
        internalType: 'strategic',
        status: 'proposed',
        depth: 2,
        branchColor: '#f59e0b',
        creator: 'ai',
        confidence: suggestion.impactScore,
        pros: ['Identified by AI reasoning engine', 'Fills critical architectural gap'],
        cons: ['Requires validation in stage environment'],
        riskFactor: 'Medium'
      }
    }, suggestion.nodeId);

    set(state => ({ aiSuggestions: state.aiSuggestions.filter(s => s.id !== suggestion.id) }));
    useAppStore.getState().addToast('Added AI suggested branch to decision tree', 'success');
  },
  ignoreSuggestion: (id) => {
    set(state => ({ aiSuggestions: state.aiSuggestions.filter(s => s.id !== id) }));
    useAppStore.getState().addToast('Suggestion dismissed', 'info');
  },
  addSuggestions: (suggestions) => {
    set(state => ({ aiSuggestions: [...suggestions, ...state.aiSuggestions] }));
  },
  restoreSuggestions: (suggestions) => {
    set({ aiSuggestions: suggestions });
  },
  addActivity: (action, details, nodeId) => {
    const newAct: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: 'You', action, details, nodeId
    };
    set(state => ({ activities: [newAct, ...state.activities] }));
  }
}));

// Re-export session store for convenience
export { useSessionStore } from './useSessionStore';
