import { GraphNode } from './graph';
import { Project, ActivityLog } from './project';

export interface AISuggestion {
  id: string;
  nodeId: string;
  title: string;
  description: string;
  suggestedType: string;
  impactScore: number;
  actionType: 'add_branch' | 'optimize' | 'flag_risk';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  nodeReferences?: string[];
  suggestedActions?: {
    label: string;
    action: string;
    data?: any;
  }[];
  isStreaming?: boolean;
}

// ==========================================
// Phase 3 — AI Workspace Types
// ==========================================

/** Conversation mode — drives the Session State Manager UI */
export type ConversationMode = 'chat' | 'expanding' | 'waiting_for_answer' | 'processing';

/** AI question — surfaces in the conversation thread when AI needs clarification */
export interface AIQuestion {
  id: string;
  question: string;
  context: string;
  pendingOperation: string;
  pendingNodeId?: string;
  options?: string[];
}

/** Typed event for the Event Bus */
export interface AIEvent {
  type: string;
  payload: Record<string, any>;
  timestamp: number;
}

/** Command parsed from natural language */
export interface GraphCommand {
  commandName: string;
  args: any[];
  description: string;
}

/** Full AI context assembled from all stores — passed to AI Service with every request */
export interface AIContext {
  conversationHistory: ChatMessage[];
  selectedNode: GraphNode | null;
  selectedBranch: GraphNode[];
  pathFromRoot: GraphNode[];
  graphMetadata: {
    totalNodes: number;
    totalEdges: number;
    maxDepth: number;
    aiNodeCount: number;
    userNodeCount: number;
    bookmarkedNodes: GraphNode[];
  };
  pendingQuestion: AIQuestion | null;
  recentActivities: ActivityLog[];
  currentProject: Project;
}

/** Unified response shape from the Mock AI Service (and future real AI) */
export interface AIServiceResponse {
  chatMessage: string;
  graphOperations?: GraphCommand[];
  suggestions?: AISuggestion[];
  clarificationNeeded?: AIQuestion;
  followUpActions?: { label: string; action: string }[];
  branchSummary?: string;
}
