import { create } from 'zustand';
import { ChatMessage } from '../types';
import { INITIAL_CHAT_MESSAGES } from '../data/mockData';
import { useGraphStore } from './useGraphStore';
import { useAppStore } from './useAppStore';
import { useAIStore } from './useAIStore';

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
