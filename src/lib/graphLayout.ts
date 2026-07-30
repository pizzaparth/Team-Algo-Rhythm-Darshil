/**
 * graphLayout.ts — Pure LR Dagre Layout Engine
 *
 * Mandatory per Phase 2 PRD: Left-to-Right tree layout.
 * Root node on far left. Children positioned to the right of parent.
 *
 * Pure function — no React, no Zustand side effects.
 * AI phases can call this function directly without touching UI.
 */

import dagre from '@dagrejs/dagre';
import type { GraphNode, GraphEdge } from '../types';

// Dimensions matching DecisionNode's w-72 (288px) card
// NODE_HEIGHT must match the actual rendered card height to prevent overlap
const NODE_WIDTH = 300;
const NODE_HEIGHT = 260;

// Horizontal gap between tree levels (parent → child)
const RANK_SEP = 180;

// Vertical gap between siblings at the same level
const NODE_SEP = 60;

export interface LayoutedPosition {
  id: string;
  x: number;
  y: number;
}

/**
 * Computes LR layout positions for all nodes.
 *
 * @param nodes - Current graph nodes from Zustand store
 * @param edges - Current graph edges from Zustand store
 * @returns Map of nodeId → {x, y} top-left position for ReactFlow
 */
export function computeLayout(
  nodes: GraphNode[],
  edges: GraphEdge[]
): LayoutedPosition[] {
  if (nodes.length === 0) return [];

  const graph = new dagre.graphlib.Graph();

  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: 'LR',       // Left-to-Right — mandatory per Phase 2 requirements
    nodesep: NODE_SEP,   // Vertical gap between siblings
    ranksep: RANK_SEP,   // Horizontal gap between levels
    marginx: 60,
    marginy: 60,
  });

  // Register all visible nodes with their dimensions
  nodes.forEach((node) => {
    graph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  // Register edges using sourceId/targetId from our store schema
  edges.forEach((edge) => {
    // Only add edge if both endpoints are in the graph
    if (graph.hasNode(edge.sourceId) && graph.hasNode(edge.targetId)) {
      graph.setEdge(edge.sourceId, edge.targetId);
    }
  });

  // Run dagre layout algorithm
  dagre.layout(graph);

  // Extract positions — dagre returns center positions, ReactFlow needs top-left
  return nodes.map((node) => {
    const dagreNode = graph.node(node.id);

    if (!dagreNode) {
      // Fallback: keep existing position if dagre didn't include this node
      return { id: node.id, x: node.position.x, y: node.position.y };
    }

    return {
      id: node.id,
      x: dagreNode.x - NODE_WIDTH / 2,
      y: dagreNode.y - NODE_HEIGHT / 2,
    };
  });
}

/**
 * Applies layout to a node array without mutating originals.
 * Returns new node array with updated positions.
 */
export function applyLayout(
  nodes: GraphNode[],
  edges: GraphEdge[]
): GraphNode[] {
  const positions = computeLayout(nodes, edges);
  const posMap = new Map(positions.map((p) => [p.id, p]));

  return nodes.map((node) => {
    const pos = posMap.get(node.id);
    if (!pos) return node;
    return { ...node, position: { x: pos.x, y: pos.y } };
  });
}
