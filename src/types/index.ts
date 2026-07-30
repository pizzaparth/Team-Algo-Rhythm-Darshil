export type ViewMode = 'landing' | 'chat' | 'workspace';

export type SidebarTab = 'projects' | 'sessions' | 'templates' | 'search' | 'exports' | 'settings';

export type AssistantTab = 'detail' | 'suggestions' | 'experts' | 'evidence' | 'chat' | 'activity';

export type NodeType = 'root' | 'strategic' | 'alternative' | 'risk' | 'prerequisite' | 'outcome';

export type NodeStatus = 'proposed' | 'evaluated' | 'in_review' | 'approved' | 'rejected';

export type CreatorType = 'ai' | 'user';

export interface ExpertProfile {
  id: string;
  name: string;
  title: string;
  avatar: string;
  organization: string;
  relevance: string;
  quote?: string;
}

export interface SupportingEvidence {
  id: string;
  title: string;
  type: 'metric' | 'benchmark' | 'paper' | 'case_study';
  summary: string;
  source: string;
  url?: string;
  confidence: number;
}

export interface NodeData {
  title: string;
  summary: string;
  displayType: string;
  internalType: NodeType;
  status: NodeStatus;
  depth: number;
  branchColor: string;
  creator: CreatorType;
  confidence: number;
  pros: string[];
  cons: string[];
  riskFactor: 'Low' | 'Medium' | 'High' | 'Critical';
  notes?: string;
  bookmarked?: boolean;
  collapsed?: boolean;
  hasChildren?: boolean;
  experts?: ExpertProfile[];
  evidence?: SupportingEvidence[];
  historicalReferences?: {
    company: string;
    caseStudy: string;
    outcome: string;
    relevance: string;
  }[];
  attachments?: {
    id: string;
    name: string;
    size: string;
    type: string;
  }[];
}

export interface GraphNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: NodeData;
  parentId?: string;
}

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  animated?: boolean;
  style?: Record<string, any>;
}

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

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  nodeCount: number;
  updatedAt: string;
  createdAt: string;
  status: 'active' | 'archived' | 'draft';
}

export interface Session {
  id: string;
  projectId: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
}

export interface StrategyTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  nodesCount: number;
  iconName: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  nodeId?: string;
}

/**
 * GeneratedNode — schema returned by mockExpansion.ts (and Phase 3 real AI).
 * Matches §13.4 of the implementation plan.
 */
export interface GeneratedNode {
  tempId: string;
  parentId: string;
  title: string;
  summary: string;
  displayType: string;
  internalType: NodeType;
  status: NodeStatus;
  confidence: number;
  pros: string[];
  cons: string[];
  riskFactor: 'Low' | 'Medium' | 'High' | 'Critical';
  evidence?: SupportingEvidence[];
}

/** Internal clipboard payload for copy/paste operations */
export interface ClipboardPayload {
  node: GraphNode;
  sourceParentId: string | null;
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

/** Historical reference extracted by the AI */
export interface HistoricalReference {
  entity: string;
  caseStudy: string;
  outcome: string;
  relevance: string;
  timePeriod?: string;
  sourceUrl?: string;
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

