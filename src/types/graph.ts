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
