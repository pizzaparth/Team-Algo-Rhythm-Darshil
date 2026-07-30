/**
 * aiContextAssembler.ts — AI Context Assembler
 *
 * Pure function that reads all Zustand stores and builds a full AIContext
 * object. This context is passed to the AI Service with every request,
 * ensuring the AI always reasons from the complete planning state.
 *
 * Per PRD §12.3: "The Context Assembler builds a structured prompt context
 * from multiple sources."
 */

import { useGraphStore, useProjectStore, useAIStore } from '../store';
import type { AIContext, AIQuestion, GraphNode } from '../types';
import { useChatStore } from '../store';

/**
 * Builds the path from the root node to the given node ID.
 * Walks parent edges backwards until no more incoming edges exist.
 */
function buildPathFromRoot(nodeId: string, nodes: GraphNode[], edges: { sourceId: string; targetId: string }[]): GraphNode[] {
  const path: GraphNode[] = [];
  let currentId: string | null = nodeId;

  while (currentId) {
    const node = nodes.find(n => n.id === currentId);
    if (node) path.unshift(node);
    const parentEdge = edges.find(e => e.targetId === currentId);
    currentId = parentEdge?.sourceId ?? null;
  }

  return path;
}

/**
 * Collects all nodes in a subtree rooted at the given node ID.
 */
function collectBranch(nodeId: string, nodes: GraphNode[], edges: { sourceId: string; targetId: string }[]): GraphNode[] {
  const branchIds = new Set<string>([nodeId]);
  let added = true;
  while (added) {
    added = false;
    edges.forEach(e => {
      if (branchIds.has(e.sourceId) && !branchIds.has(e.targetId)) {
        branchIds.add(e.targetId);
        added = true;
      }
    });
  }
  return nodes.filter(n => branchIds.has(n.id));
}

/**
 * Assembles the full AI context from all stores.
 * Called before every AI Service invocation.
 */
export function assembleAIContext(pendingQuestion: AIQuestion | null = null): AIContext {
  const graphState = useGraphStore.getState();
  const projectState = useProjectStore.getState();
  const aiState = useAIStore.getState();
  const chatState = useChatStore.getState();

  const { nodes, edges, selectedNodeId } = graphState;
  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) ?? null : null;

  // Path from root → selected node
  const pathFromRoot = selectedNodeId
    ? buildPathFromRoot(selectedNodeId, nodes, edges)
    : [];

  // All nodes in the selected node's subtree
  const selectedBranch = selectedNodeId
    ? collectBranch(selectedNodeId, nodes, edges)
    : [];

  // Graph metadata
  const maxDepth = nodes.reduce((max, n) => Math.max(max, n.data.depth), 0);
  const aiNodeCount = nodes.filter(n => n.data.creator === 'ai').length;
  const userNodeCount = nodes.filter(n => n.data.creator === 'user').length;
  const bookmarkedNodes = nodes.filter(n => n.data.bookmarked);

  // Current project
  const currentProject = projectState.projects.find(p => p.id === projectState.activeProjectId)
    ?? projectState.projects[0];

  // Conversation history (last 20 messages to fit context window)
  const conversationHistory = chatState.messages.slice(-20);

  // Recent activities (last 10)
  const recentActivities = aiState.activities.slice(0, 10);

  return {
    conversationHistory,
    selectedNode,
    selectedBranch,
    pathFromRoot,
    graphMetadata: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      maxDepth,
      aiNodeCount,
      userNodeCount,
      bookmarkedNodes,
    },
    pendingQuestion,
    recentActivities,
    currentProject,
  };
}
