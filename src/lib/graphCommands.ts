/**
 * graphCommands.ts — AI-Ready Graph Command Interface
 *
 * This module exposes every graph operation as a clean, callable function.
 * Phase 3 AI orchestrator calls these functions directly — it never touches
 * React components or Zustand internals.
 *
 * All functions are synchronous unless the operation requires async work
 * (e.g., expandNode which calls the AI/mock service).
 *
 * Usage from AI orchestrator (Phase 3):
 *   import { graphCommands } from './graphCommands';
 *   await graphCommands.expandNode('node-1');
 *   graphCommands.focusNode('node-2');
 *   graphCommands.compareBranches('node-1', 'node-2');
 */

import { useGraphStore } from '../store';
import { useAppStore } from '../store';
import type { NodeData } from '../types';

// Expose a ReactFlow instance setter so commands can call fitView
let _reactFlowInstance: any = null;

export function setReactFlowInstance(instance: any) {
  _reactFlowInstance = instance;
}

export const graphCommands = {
  // =========================================
  // Node Expansion
  // =========================================

  /**
   * Triggers mocked (Phase 2) or real (Phase 3) AI expansion for a node.
   * Creates child nodes and applies LR layout automatically.
   */
  expandNode: async (nodeId: string): Promise<void> => {
    const store = useGraphStore.getState();
    await store.expandNode(nodeId);
  },

  // =========================================
  // Collapse / Expand Subtrees
  // =========================================

  collapseNode: (nodeId: string): void => {
    const store = useGraphStore.getState();
    const node = store.nodes.find(n => n.id === nodeId);
    if (node && !node.data.collapsed) {
      store.updateNodeData(nodeId, { collapsed: true });
    }
  },

  expandCollapsedNode: (nodeId: string): void => {
    const store = useGraphStore.getState();
    const node = store.nodes.find(n => n.id === nodeId);
    if (node && node.data.collapsed) {
      store.updateNodeData(nodeId, { collapsed: false });
    }
  },

  collapseAll: (): void => {
    const { nodes, updateNodeData } = useGraphStore.getState();
    nodes.forEach(n => {
      if (n.data.internalType !== 'root') {
        updateNodeData(n.id, { collapsed: false });
      }
    });
    // Collapse all non-root nodes that have children
    const { edges } = useGraphStore.getState();
    const parentIds = new Set(edges.map(e => e.sourceId));
    parentIds.forEach(id => {
      const node = useGraphStore.getState().nodes.find(n => n.id === id);
      if (node && node.data.internalType !== 'root') {
        updateNodeData(id, { collapsed: true });
      }
    });
    useAppStore.getState().addToast('Collapsed all subtrees', 'info');
  },

  expandAll: (): void => {
    const { nodes, updateNodeData } = useGraphStore.getState();
    nodes.forEach(n => {
      if (n.data.collapsed) {
        updateNodeData(n.id, { collapsed: false });
      }
    });
    useAppStore.getState().addToast('Expanded all subtrees', 'info');
  },

  // =========================================
  // Node Focus & Navigation
  // =========================================

  /**
   * Centers the viewport on a specific node.
   * Requires ReactFlow instance to be registered via setReactFlowInstance().
   */
  focusNode: (nodeId: string): void => {
    const { selectNode, nodes } = useGraphStore.getState();
    selectNode(nodeId);

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    if (_reactFlowInstance) {
      _reactFlowInstance.setCenter(
        node.position.x + 150,
        node.position.y + 90,
        { zoom: 1.2, duration: 600 }
      );
    }
  },

  jumpToRoot: (): void => {
    const { nodes, edges } = useGraphStore.getState();
    // Root node has no incoming edges
    const incomingTargets = new Set(edges.map(e => e.targetId));
    const rootNode = nodes.find(n => !incomingTargets.has(n.id));
    if (rootNode) {
      graphCommands.focusNode(rootNode.id);
    }
  },

  jumpToBookmarks: (): void => {
    const { nodes } = useGraphStore.getState();
    const bookmarked = nodes.filter(n => n.data.bookmarked);
    if (bookmarked.length > 0) {
      graphCommands.focusNode(bookmarked[0].id);
      useAppStore.getState().addToast(`Jumped to bookmarked: ${bookmarked[0].data.title}`, 'info');
    } else {
      useAppStore.getState().addToast('No bookmarked nodes found', 'info');
    }
  },

  fitView: (): void => {
    if (_reactFlowInstance) {
      _reactFlowInstance.fitView({ padding: 0.12, duration: 500 });
    }
  },

  // =========================================
  // CRUD Operations
  // =========================================

  deleteNode: (nodeId: string): void => {
    useGraphStore.getState().deleteNode(nodeId);
  },

  deleteBranch: (nodeId: string): void => {
    // Same as deleteNode — cascades to all descendants in store
    useGraphStore.getState().deleteNode(nodeId);
  },

  duplicateNode: (nodeId: string): void => {
    useGraphStore.getState().duplicateNode(nodeId);
  },

  duplicateBranch: (nodeId: string): void => {
    // Phase 2: duplicates single node. Phase 3: deep branch clone.
    useGraphStore.getState().duplicateNode(nodeId);
    useAppStore.getState().addToast('Branch duplication: cloning root node (deep clone in Phase 3)', 'info');
  },

  renameNode: (nodeId: string, title: string): void => {
    useGraphStore.getState().updateNodeData(nodeId, { title });
    useAppStore.getState().addToast(`Renamed node to "${title}"`, 'success');
  },

  createUserNode: (parentId: string, data: Partial<NodeData>): void => {
    const nodePartial = { data: data as any };
    useGraphStore.getState().addNode(nodePartial, parentId);
  },

  // =========================================
  // Compare Branches
  // =========================================

  compareBranches: (nodeIdA: string, nodeIdB: string): void => {
    useAppStore.getState().openModal('compare', { firstNodeId: nodeIdA, secondNodeId: nodeIdB });
  },

  // =========================================
  // Bookmarks
  // =========================================

  bookmarkNode: (nodeId: string): void => {
    useGraphStore.getState().toggleNodeBookmark(nodeId);
  },

  // =========================================
  // Search
  // =========================================

  /**
   * Searches nodes by title, summary, displayType, creator.
   * Returns matching node IDs and highlights them on the canvas.
   */
  searchNodes: (query: string): string[] => {
    const { nodes, setSearchHighlightIds } = useGraphStore.getState();
    if (!query.trim()) {
      setSearchHighlightIds([]);
      return [];
    }

    const q = query.toLowerCase();
    const matched = nodes
      .filter(n =>
        n.data.title.toLowerCase().includes(q) ||
        n.data.summary.toLowerCase().includes(q) ||
        n.data.displayType.toLowerCase().includes(q) ||
        n.data.creator.toLowerCase().includes(q) ||
        (n.data.bookmarked && 'bookmarked'.includes(q))
      )
      .map(n => n.id);

    setSearchHighlightIds(matched);
    return matched;
  },

  clearSearch: (): void => {
    useGraphStore.getState().setSearchHighlightIds([]);
  },

  // =========================================
  // Clipboard
  // =========================================

  copyNode: (nodeId: string): void => {
    useGraphStore.getState().copyNode(nodeId);
  },

  pasteNode: (parentId?: string): void => {
    useGraphStore.getState().pasteNode(parentId);
  },

  // =========================================
  // Undo / Redo
  // =========================================

  undoLastAction: (): void => {
    useGraphStore.getState().undo();
  },

  redoLastAction: (): void => {
    useGraphStore.getState().redo();
  },

  // =========================================
  // Export
  // =========================================

  exportBranch: (nodeId: string, format: 'json' | 'markdown'): string => {
    const { nodes, edges } = useGraphStore.getState();

    // Collect nodeId + all descendants
    const branchNodeIds = new Set<string>([nodeId]);
    let added = true;
    while (added) {
      added = false;
      edges.forEach(e => {
        if (branchNodeIds.has(e.sourceId) && !branchNodeIds.has(e.targetId)) {
          branchNodeIds.add(e.targetId);
          added = true;
        }
      });
    }

    const branchNodes = nodes.filter(n => branchNodeIds.has(n.id));
    const branchEdges = edges.filter(e => branchNodeIds.has(e.sourceId) && branchNodeIds.has(e.targetId));

    if (format === 'json') {
      return JSON.stringify({ nodes: branchNodes, edges: branchEdges }, null, 2);
    }

    // Markdown format
    const renderNode = (id: string, indent = 0): string => {
      const node = branchNodes.find(n => n.id === id);
      if (!node) return '';
      const prefix = '  '.repeat(indent);
      const children = branchEdges.filter(e => e.sourceId === id).map(e => e.targetId);
      const childText = children.map(cid => renderNode(cid, indent + 1)).join('');
      return `${prefix}## [${node.data.displayType.toUpperCase()}] ${node.data.title}\n${prefix}- **Status**: ${node.data.status}\n${prefix}- **Confidence**: ${node.data.confidence}%\n${prefix}- **Summary**: ${node.data.summary}\n${prefix}- **Pros**: ${node.data.pros.join(', ')}\n${prefix}- **Cons**: ${node.data.cons.join(', ')}\n${childText}`;
    };

    return renderNode(nodeId);
  },

  // =========================================
  // Layout
  // =========================================

  applyLayout: (): void => {
    useGraphStore.getState().applyAutoLayout();
    useAppStore.getState().addToast('Graph re-laid out (LR)', 'info');
  },

  focusBranch: (nodeId: string): void => {
    useGraphStore.getState().setFocusedBranchRoot(nodeId);
    // Actually move the viewport to this node
    graphCommands.focusNode(nodeId);
    useAppStore.getState().addToast('Focused on branch. Click canvas to exit.', 'info');
  },

  clearFocusBranch: (): void => {
    useGraphStore.getState().setFocusedBranchRoot(null);
  },
};
