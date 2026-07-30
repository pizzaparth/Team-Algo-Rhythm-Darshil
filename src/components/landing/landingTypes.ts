export type LandingNodeCategory =
  | 'root'
  | 'hypothesis'
  | 'research'
  | 'strategy'
  | 'tradeoff'
  | 'action'
  | 'risk';

export interface LandingReasoningNode {
  id: string;
  title: string;
  category: LandingNodeCategory;
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

export interface LandingReasoningTree {
  id: string;
  topic: string;
  domain: string;
  rootNodeId: string;
  nodes: Record<string, LandingReasoningNode>;
  updatedAt: string;
}

export interface LandingDomainItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  sampleTopic: string;
}

export interface LandingWorkflowStep {
  step: number;
  title: string;
  shortDesc: string;
  fullDesc: string;
  actionText?: string;
  iconName: string;
}
