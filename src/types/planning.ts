import type { AIContext } from './ai';

// ==========================================
// Phase 4 — AI Planning Engine Types
// ==========================================

/** LLM message for OpenAI-compatible API calls */
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Raw Tavily search result */
export interface ResearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  publishedDate?: string;
}

/** Processed research with LLM-generated summary */
export interface ProcessedResearch {
  query: string;
  results: ResearchResult[];
  summary: string;
  sources: { title: string; url: string; reliability: 'high' | 'medium' | 'low' }[];
  timestamp: number;
}

/** Domain-specific configuration for the Planning Engine */
export interface DomainConfig {
  id: string;
  displayName: string;
  nodeTypeLabels: Record<string, string>;
  systemPromptFragment: string;
  starterQuestions: string[];
  expertTypes: string[];
  researchPriorities: string[];
}

/** User intent classification */
export type UserIntent = 'CHAT' | 'EXPAND_NODE' | 'GRAPH_COMMAND' | 'CLARIFICATION_RESPONSE'
  | 'RESEARCH_REQUEST' | 'CREATE_NODE' | 'ANALYSE' | 'SUMMARISE';

/** Session-scoped planning memory snapshot */
export interface PlanningMemorySnapshot {
  expansionHistory: { nodeId: string; childCount: number; timestamp: number }[];
  rejectedSuggestions: { title: string; reason?: string }[];
  acceptedSuggestions: string[];
  researchQueries: string[];
  clarificationHistory: { question: string; answer: string }[];
  userPreferences: Record<string, string>;
}

/** Enhanced AI context with research, memory, and domain config */
export interface EnhancedAIContext extends AIContext {
  domainConfig: DomainConfig;
  researchContext: ProcessedResearch[];
  planningMemory: PlanningMemorySnapshot;
  graphSnapshot: {
    serializedNodes: { id: string; title: string; type: string; confidence: number; risk: string; depth: number }[];
    serializedEdges: { source: string; target: string }[];
    rootTitle: string;
  };
}
