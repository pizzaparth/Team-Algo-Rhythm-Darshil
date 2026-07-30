import { create } from 'zustand';
import type { ViewMode } from '../types';
import { useGraphStore } from './useGraphStore';
import { useChatStore } from './useChatStore';
import { ROUTE_TO_VIEW_MODE } from '../lib/routes';

function getInitialViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'landing';
  return ROUTE_TO_VIEW_MODE[window.location.pathname] ?? 'landing';
}

export type SidebarTab = 'projects' | 'sessions' | 'templates' | 'saved_graphs' | 'search' | 'exports' | 'settings';
export type AssistantTab = 'chat' | 'detail' | 'summary' | 'evidence' | 'experts' | 'notes' | 'suggestions' | 'activity';
type ModalType = 'compare' | 'export' | 'settings' | 'create_node' | 'rename_node' | 'create_project' | 'delete_node' | 'expand_node' | null;

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
    const { isLLMConfigured, chatCompletion } = await import('../lib/ai');

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
  viewMode: getInitialViewMode(),
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
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  activeSidebarTab: 'sessions',
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
