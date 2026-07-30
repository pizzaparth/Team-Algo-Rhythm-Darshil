export type ViewMode = 'landing' | 'chat' | 'workspace' | 'editor';

export type SidebarTab = 'projects' | 'sessions' | 'templates' | 'search' | 'exports' | 'settings';

export type AssistantTab = 'detail' | 'suggestions' | 'experts' | 'evidence' | 'chat' | 'activity';

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
