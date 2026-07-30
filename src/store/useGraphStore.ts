import { create } from 'zustand';
import type { GraphNode, GraphEdge, NodeData, ClipboardPayload, GeneratedNode } from '../types';
import { INITIAL_NODES, INITIAL_EDGES } from '../data/mockData';
import { applyLayout } from '../lib/graphLayout';
import { getMockedExpansion } from '../lib/mockExpansion';
import { useAppStore } from './useAppStore';
import { useAIStore } from './useAIStore';

interface HistoryState {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  selectedNodeIds: string[];
  history: HistoryState[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  contextMenu: { show: boolean; x: number; y: number; nodeId?: string } | null;
  // Phase 2 state
  clipboard: ClipboardPayload | null;
  expandingNodeId: string | null;
  searchHighlightIds: string[];
  focusedBranchRootId: string | null;
  setNodes: (nodes: GraphNode[]) => void;
  setEdges: (edges: GraphEdge[]) => void;
  selectNode: (id: string | null) => void;
  setSelectedNodeIds: (ids: string[]) => void;
  updateNodeData: (id: string, dataPartial: Partial<NodeData>) => void;
  addNode: (node: Partial<GraphNode>, parentId?: string) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  toggleNodeBookmark: (id: string) => void;
  toggleNodeCollapse: (id: string) => void;
  undo: () => void;
  redo: () => void;
  openContextMenu: (x: number, y: number, nodeId?: string) => void;
  closeContextMenu: () => void;
  // Phase 2 actions
  setClipboard: (payload: ClipboardPayload | null) => void;
  setExpandingNodeId: (id: string | null) => void;
  setSearchHighlightIds: (ids: string[]) => void;
  setFocusedBranchRoot: (id: string | null) => void;
  expandNode: (nodeId: string) => Promise<void>;
  applyAutoLayout: () => void;
  copyNode: (nodeId: string) => void;
  pasteNode: (parentId?: string) => void;
  addGeneratedNodes: (generated: GeneratedNode[]) => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: INITIAL_NODES,
  edges: INITIAL_EDGES,
  selectedNodeId: 'node-root',
  selectedNodeIds: ['node-root'],
  history: [{ nodes: INITIAL_NODES, edges: INITIAL_EDGES }],
  historyIndex: 0,
  canUndo: false,
  canRedo: false,
  contextMenu: null,
  clipboard: null,
  expandingNodeId: null,
  searchHighlightIds: [],
  focusedBranchRootId: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  selectNode: (id) => {
    set({
      selectedNodeId: id,
      selectedNodeIds: id ? [id] : [],
    });
    useAppStore.getState().setActiveAssistantTab(id ? 'detail' : 'summary');
  },
  setSelectedNodeIds: (ids) => set({
    selectedNodeIds: ids,
    selectedNodeId: ids.length > 0 ? ids[ids.length - 1] : null
  }),

  updateNodeData: (id, dataPartial) => {
    const { nodes, edges, history, historyIndex } = get();
    const updatedNodes = nodes.map(node =>
      node.id === id ? { ...node, data: { ...node.data, ...dataPartial } } : node
    );
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: updatedNodes, edges });

    set({
      nodes: updatedNodes, history: newHistory,
      historyIndex: newHistory.length - 1, canUndo: true, canRedo: false
    });
    useAIStore.getState().addActivity('Updated Node', `Modified data for node #${id}`, id);
  },

  addNode: (nodePartial, parentId) => {
    const { nodes, edges, history, historyIndex } = get();
    const parentNode = parentId ? nodes.find(n => n.id === parentId) : null;
    const newId = `node-${Date.now().toString().slice(-4)}`;
    const depth = parentNode ? parentNode.data.depth + 1 : 0;
    const branchColor = parentNode ? parentNode.data.branchColor : '#6366f1';

    const xPos = parentNode ? parentNode.position.x + (Math.random() * 200 - 100) : 400;
    const yPos = parentNode ? parentNode.position.y + 180 : 300;

    const newNode: GraphNode = {
      id: newId,
      position: nodePartial.position || { x: xPos, y: yPos },
      data: {
        title: nodePartial.data?.title || 'New Decision Node',
        summary: nodePartial.data?.summary || 'Detailed decision evaluation summary for this branch.',
        displayType: nodePartial.data?.displayType || 'Strategic Option',
        internalType: nodePartial.data?.internalType || 'strategic',
        status: nodePartial.data?.status || 'proposed',
        depth, branchColor,
        creator: nodePartial.data?.creator || 'user',
        confidence: nodePartial.data?.confidence || 85,
        pros: nodePartial.data?.pros || ['High flexibility'],
        cons: nodePartial.data?.cons || ['Needs testing'],
        riskFactor: nodePartial.data?.riskFactor || 'Low',
        notes: nodePartial.data?.notes || '',
        bookmarked: false, collapsed: false, hasChildren: false,
        experts: [], evidence: []
      }
    };

    let updatedEdges = [...edges];
    if (parentId) {
      updatedEdges.push({
        id: `e-${parentId}-${newId}`,
        sourceId: parentId,
        targetId: newId,
        animated: true,
        style: { stroke: branchColor, strokeWidth: 2 }
      });
    }

    const updatedNodes = [...nodes, newNode];
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: updatedNodes, edges: updatedEdges });

    set({
      nodes: updatedNodes, edges: updatedEdges,
      selectedNodeId: newId, selectedNodeIds: [newId],
      history: newHistory, historyIndex: newHistory.length - 1,
      canUndo: true, canRedo: false
    });

    useAppStore.getState().addToast(`Added node "${newNode.data.title}"`, 'success');
    useAIStore.getState().addActivity('Created Node', newNode.data.title, newId);
  },

  deleteNode: (id) => {
    const { nodes, edges, history, historyIndex, selectedNodeId } = get();

    const nodesToDelete = new Set<string>([id]);
    let added = true;
    while (added) {
      added = false;
      edges.forEach(e => {
        if (nodesToDelete.has(e.sourceId) && !nodesToDelete.has(e.targetId)) {
          nodesToDelete.add(e.targetId);
          added = true;
        }
      });
    }

    const updatedNodes = nodes.filter(n => !nodesToDelete.has(n.id));
    const updatedEdges = edges.filter(e => !nodesToDelete.has(e.sourceId) && !nodesToDelete.has(e.targetId));

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: updatedNodes, edges: updatedEdges });

    set({
      nodes: updatedNodes, edges: updatedEdges,
      selectedNodeId: nodesToDelete.has(selectedNodeId as string) ? null : selectedNodeId,
      history: newHistory, historyIndex: newHistory.length - 1,
      canUndo: true, canRedo: false
    });

    useAppStore.getState().addToast('Deleted node(s)', 'info');
    useAIStore.getState().addActivity('Deleted Node', `Removed node #${id} and its children`);
  },

  duplicateNode: (id) => {
    const { nodes, edges, addNode } = get();
    const sourceNode = nodes.find(n => n.id === id);
    if (!sourceNode) return;
    const parentEdge = edges.find(e => e.targetId === id);

    addNode({
      position: { x: sourceNode.position.x + 80, y: sourceNode.position.y + 40 },
      data: { ...sourceNode.data, title: `${sourceNode.data.title} (Copy)`, creator: 'user' }
    }, parentEdge?.sourceId);
    useAppStore.getState().addToast('Duplicated node', 'success');
  },

  toggleNodeBookmark: (id) => {
    const node = get().nodes.find(n => n.id === id);
    if (node) {
      get().updateNodeData(id, { bookmarked: !node.data.bookmarked });
      useAppStore.getState().addToast(node.data.bookmarked ? 'Removed bookmark' : 'Bookmarked node', 'info');
    }
  },

  toggleNodeCollapse: (id) => {
    const node = get().nodes.find(n => n.id === id);
    if (node) {
      get().updateNodeData(id, { collapsed: !node.data.collapsed });
    }
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      set({
        nodes: history[nextIndex].nodes, edges: history[nextIndex].edges,
        historyIndex: nextIndex, canUndo: nextIndex > 0, canRedo: true
      });
      useAppStore.getState().addToast('Undo action', 'info');
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      set({
        nodes: history[nextIndex].nodes, edges: history[nextIndex].edges,
        historyIndex: nextIndex, canUndo: true, canRedo: nextIndex < history.length - 1
      });
      useAppStore.getState().addToast('Redo action', 'info');
    }
  },

  openContextMenu: (x, y, nodeId) => set({ contextMenu: { show: true, x, y, nodeId } }),
  closeContextMenu: () => set({ contextMenu: null }),

  // ===== Phase 2 Actions =====

  setClipboard: (payload) => set({ clipboard: payload }),
  setExpandingNodeId: (id) => set({ expandingNodeId: id }),
  setSearchHighlightIds: (ids) => set({ searchHighlightIds: ids }),
  setFocusedBranchRoot: (id) => set({ focusedBranchRootId: id }),

  applyAutoLayout: () => {
    const { nodes, edges } = get();
    const laidOutNodes = applyLayout(nodes, edges);
    set({ nodes: laidOutNodes });
  },

  copyNode: (nodeId) => {
    const { nodes, edges } = get();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const parentEdge = edges.find(e => e.targetId === nodeId);
    set({ clipboard: { node, sourceParentId: parentEdge?.sourceId ?? null } });
    useAppStore.getState().addToast('Node copied to clipboard', 'info');
  },

  pasteNode: (parentId) => {
    const { clipboard, addNode } = get();
    if (!clipboard) return;
    const targetParentId = parentId ?? clipboard.sourceParentId ?? undefined;
    addNode(
      {
        data: {
          ...clipboard.node.data,
          title: `${clipboard.node.data.title} (Paste)`,
          creator: 'user',
        }
      },
      targetParentId
    );
    useAppStore.getState().addToast('Node pasted from clipboard', 'success');
  },

  addGeneratedNodes: (generated: GeneratedNode[]) => {
    const { nodes, edges, history, historyIndex } = get();

    const branchColors: Record<string, string> = {
      strategic: '#3b82f6',
      alternative: '#10b981',
      risk: '#ef4444',
      prerequisite: '#f59e0b',
      outcome: '#8b5cf6',
      root: '#6366f1',
    };

    const newNodes: GraphNode[] = [];
    const newEdges: GraphEdge[] = [];

    generated.forEach((gen) => {
      const parentNode = nodes.find(n => n.id === gen.parentId)
        || newNodes.find(n => n.id === gen.parentId);
      const depth = parentNode ? parentNode.data.depth + 1 : 1;
      const branchColor = parentNode?.data.branchColor ?? branchColors[gen.internalType] ?? '#6366f1';
      const nodeId = `node-${gen.tempId}-${Date.now().toString().slice(-5)}`;

      const newNode: GraphNode = {
        id: nodeId,
        position: { x: (parentNode?.position.x ?? 0) + 320, y: parentNode?.position.y ?? 0 },
        data: {
          title: gen.title,
          summary: gen.summary,
          displayType: gen.displayType,
          internalType: gen.internalType,
          status: gen.status,
          depth,
          branchColor,
          creator: 'ai',
          confidence: gen.confidence,
          pros: gen.pros,
          cons: gen.cons,
          riskFactor: gen.riskFactor,
          notes: '',
          bookmarked: false,
          collapsed: false,
          hasChildren: false,
          experts: [],
          evidence: gen.evidence ?? [],
        },
      };

      newEdges.push({
        id: `e-${gen.parentId}-${nodeId}`,
        sourceId: gen.parentId,
        targetId: nodeId,
        animated: true,
        style: { stroke: branchColor, strokeWidth: 2 },
      });

      newNodes.push(newNode);
    });

    const updatedNodes = applyLayout([...nodes, ...newNodes], [...edges, ...newEdges]);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: updatedNodes, edges: [...edges, ...newEdges] });

    set({
      nodes: updatedNodes,
      edges: [...edges, ...newEdges],
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: true,
      canRedo: false,
    });

    useAIStore.getState().addActivity('AI Expanded', `Generated ${generated.length} child nodes`);
    useAppStore.getState().addToast(`Added ${generated.length} AI-generated branches`, 'success');
  },

  expandNode: async (nodeId: string) => {
    const { nodes, addGeneratedNodes } = get();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    set({ expandingNodeId: nodeId });
    useAppStore.getState().addToast('AI is generating branches...', 'info');

    try {
      const generated = await getMockedExpansion(nodeId, node.data.internalType);
      addGeneratedNodes(generated);
    } catch (err) {
      useAppStore.getState().addToast('Expansion failed. Please try again.', 'error');
    } finally {
      set({ expandingNodeId: null });
    }
  },
}));
