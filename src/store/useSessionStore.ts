/**
 * useSessionStore.ts — Session State Manager
 *
 * Central coordinator for the AI workspace. Per PRD §14:
 * "Create a central Session State Manager. This becomes the heart of the application."
 *
 * Maintains:
 * - Conversation mode (chat / expanding / waiting_for_answer / processing)
 * - Pending AI questions
 * - Streaming state
 * - Context snapshot cache
 *
 * Does NOT replace existing stores — it coordinates between them.
 */

import { create } from 'zustand';
import { ConversationMode, AIQuestion, AIContext } from '../types';
import { assembleAIContext } from '../lib/aiContextAssembler';
import { eventBus } from '../lib/eventBus';

interface SessionState {
  // Conversation mode — drives UI state
  conversationMode: ConversationMode;

  // Pending AI question (when AI needs clarification before proceeding)
  pendingQuestion: AIQuestion | null;
  pendingExpansionNodeId: string | null;

  // AI streaming state
  isStreaming: boolean;
  streamingText: string;

  // Context cache — refreshed on every significant state change
  lastContextSnapshot: AIContext | null;

  // Actions
  setConversationMode: (mode: ConversationMode) => void;
  setPendingQuestion: (question: AIQuestion | null) => void;
  setPendingExpansionNodeId: (id: string | null) => void;
  setStreaming: (streaming: boolean, text?: string) => void;
  appendStreamingText: (chunk: string) => void;
  updateContextSnapshot: () => void;

  /**
   * Called when the user answers a pending question.
   * Clears the question, switches mode, and fires an event.
   */
  answerQuestion: (answer: string) => void;

  /** Reset session to clean state */
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  conversationMode: 'chat',
  pendingQuestion: null,
  pendingExpansionNodeId: null,
  isStreaming: false,
  streamingText: '',
  lastContextSnapshot: null,

  setConversationMode: (mode) => {
    set({ conversationMode: mode });
    eventBus.emit('SESSION_STATE_CHANGED', { mode });
  },

  setPendingQuestion: (question) => {
    set({ pendingQuestion: question });
    if (question) {
      eventBus.emit('AI_QUESTION_ASKED', { questionId: question.id, question: question.question });
    }
  },

  setPendingExpansionNodeId: (id) => set({ pendingExpansionNodeId: id }),

  setStreaming: (streaming, text = '') => {
    set({ isStreaming: streaming, streamingText: text });
    if (streaming) {
      eventBus.emit('AI_RESPONSE_START', {});
    } else {
      eventBus.emit('AI_RESPONSE_END', { text: get().streamingText });
    }
  },

  appendStreamingText: (chunk) => {
    set(state => ({ streamingText: state.streamingText + chunk }));
    eventBus.emit('AI_RESPONSE_CHUNK', { text: chunk });
  },

  updateContextSnapshot: () => {
    const { pendingQuestion } = get();
    const context = assembleAIContext(pendingQuestion);
    set({ lastContextSnapshot: context });
  },

  answerQuestion: (answer: string) => {
    const { pendingQuestion } = get();
    if (!pendingQuestion) return;

    eventBus.emit('AI_QUESTION_ANSWERED', {
      questionId: pendingQuestion.id,
      answer,
    });

    set({
      pendingQuestion: null,
      conversationMode: 'processing',
    });
  },

  resetSession: () => {
    set({
      conversationMode: 'chat',
      pendingQuestion: null,
      pendingExpansionNodeId: null,
      isStreaming: false,
      streamingText: '',
      lastContextSnapshot: null,
    });
  },
}));
