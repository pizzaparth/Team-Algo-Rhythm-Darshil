/**
 * contextBuilder.ts — Enhanced Context Builder
 *
 * Builds EnhancedAIContext from the 5 Zustand stores + planning memory
 * + research context + domain config. This is the single entry point
 * for assembling everything the LLM needs.
 *
 * Per PRD §12.3: "The Planning Engine should never interact directly
 * with raw conversation. It should consume structured context."
 */

import type {
  AIContext, EnhancedAIContext, DomainConfig,
  ProcessedResearch, GraphNode,
} from '../../types';
import { useGraphStore, useProjectStore, useChatStore } from '../../store';
import { planningMemory } from './planningMemory';
import { generalDomain } from './prompts/domains/general';
import { politicsDomain } from './prompts/domains/politics';
import { businessDomain } from './prompts/domains/business';
import { softwareDomain } from './prompts/domains/software';

// =============================================
// Domain registry
// =============================================

const DOMAIN_REGISTRY: Record<string, DomainConfig> = {
  general: generalDomain,
  politics: politicsDomain,
  business: businessDomain,
  software: softwareDomain,
};

/**
 * Resolve domain config from project category.
 */
function resolveDomain(projectCategory: string): DomainConfig {
  const normalized = projectCategory.toLowerCase();
  if (normalized.includes('politi') || normalized.includes('policy') || normalized.includes('government')) {
    return DOMAIN_REGISTRY.politics;
  }
  if (normalized.includes('business') || normalized.includes('startup') || normalized.includes('enterprise') || normalized.includes('market')) {
    return DOMAIN_REGISTRY.business;
  }
  if (normalized.includes('software') || normalized.includes('tech') || normalized.includes('engineer') || normalized.includes('architecture')) {
    return DOMAIN_REGISTRY.software;
  }
  return DOMAIN_REGISTRY.general;
}

// =============================================
// Research context cache (session-scoped)
// =============================================

let researchCache: ProcessedResearch[] = [];

export function addResearchToCache(result: ProcessedResearch): void {
  researchCache.push(result);
  // Keep last 10 research results
  if (researchCache.length > 10) {
    researchCache = researchCache.slice(-10);
  }
}

export function getResearchCache(): ProcessedResearch[] {
  return [...researchCache];
}

// =============================================
// Context Assembly
// =============================================

/**
 * Build the full EnhancedAIContext from all stores.
 * This replaces the Phase 3 assembleAIContext with a richer version.
 */
export function buildEnhancedContext(): EnhancedAIContext {
  const graphState = useGraphStore.getState();
  const projectState = useProjectStore.getState();
  const chatState = useChatStore.getState();

  const { nodes, edges, selectedNodeId } = graphState;

  // Find selected node
  const selectedNode = selectedNodeId
    ? nodes.find(n => n.id === selectedNodeId) ?? null
    : null;

  // Build path from root to selected node
  const pathFromRoot: GraphNode[] = [];
  if (selectedNode) {
    let current: GraphNode | undefined = selectedNode;
    while (current) {
      pathFromRoot.unshift(current);
      const parentEdge = edges.find(e => e.targetId === current!.id);
      current = parentEdge ? nodes.find(n => n.id === parentEdge.sourceId) : undefined;
    }
  }

  // Build selected branch (all descendants)
  const selectedBranch: GraphNode[] = [];
  if (selectedNode) {
    const collectDescendants = (nodeId: string) => {
      const childEdges = edges.filter(e => e.sourceId === nodeId);
      for (const edge of childEdges) {
        const child = nodes.find(n => n.id === edge.targetId);
        if (child) {
          selectedBranch.push(child);
          collectDescendants(child.id);
        }
      }
    };
    selectedBranch.push(selectedNode);
    collectDescendants(selectedNode.id);
  }

  // Graph metadata
  const maxDepth = Math.max(...nodes.map(n => n.data.depth), 0);
  const aiNodes = nodes.filter(n => n.data.creator === 'ai');
  const userNodes = nodes.filter(n => n.data.creator === 'user');
  const bookmarkedNodes = nodes.filter(n => n.data.bookmarked);

  // Current project
  const currentProject = projectState.projects.find(p => p.id === projectState.activeProjectId)
    ?? { id: 'default', name: 'Untitled Project', description: '', category: 'General', nodeCount: nodes.length, updatedAt: '', createdAt: '', status: 'active' as const };

  // Domain config
  const domainConfig = resolveDomain(currentProject.category);

  // Serialize graph for prompt (compact format)
  const serializedNodes = nodes.map(n => ({
    id: n.id,
    title: n.data.title,
    type: n.data.internalType,
    confidence: n.data.confidence,
    risk: n.data.riskFactor,
    depth: n.data.depth,
  }));
  const serializedEdges = edges.map(e => ({
    source: e.sourceId,
    target: e.targetId,
  }));
  const rootNode = nodes.find(n => n.data.internalType === 'root');

  // Base AIContext (backwards compatible)
  const baseContext: AIContext = {
    conversationHistory: chatState.messages,
    selectedNode,
    selectedBranch,
    pathFromRoot,
    graphMetadata: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      maxDepth,
      aiNodeCount: aiNodes.length,
      userNodeCount: userNodes.length,
      bookmarkedNodes,
    },
    pendingQuestion: null, // Populated by session store if needed
    recentActivities: [],
    currentProject,
  };

  // Enhanced context
  return {
    ...baseContext,
    domainConfig,
    researchContext: getResearchCache(),
    planningMemory: planningMemory.getSnapshot(),
    graphSnapshot: {
      serializedNodes,
      serializedEdges,
      rootTitle: rootNode?.data.title ?? currentProject.name,
    },
  };
}
