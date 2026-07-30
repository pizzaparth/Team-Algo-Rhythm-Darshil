export type NavSection = 'overview' | 'chat' | 'graph';

export type NodeCategory = 
  | 'root' 
  | 'hypothesis' 
  | 'research' 
  | 'strategy' 
  | 'tradeoff' 
  | 'action' 
  | 'risk';

export interface ReasoningNode {
  id: string;
  title: string;
  category: NodeCategory;
  summary: string;
  detail?: string;
  confidenceScore?: number; // 0 to 100
  pros?: string[];
  cons?: string[];
  sources?: string[];
  expanded?: boolean;
  childrenIds?: string[];
  x?: number;
  y?: number;
  status?: 'active' | 'evaluating' | 'recommended' | 'archived';
  metrics?: { label: string; value: string }[];
}

export interface ReasoningTree {
  id: string;
  topic: string;
  domain: string;
  rootNodeId: string;
  nodes: Record<string, ReasoningNode>;
  updatedAt: string;
}

export interface DomainItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  sampleTopic: string;
}

export interface WorkflowStep {
  step: number;
  title: string;
  shortDesc: string;
  fullDesc: string;
  actionText?: string;
  iconName: string;
}
