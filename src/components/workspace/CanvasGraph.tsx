// Author: Parth Pancholi

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  SelectionMode,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import type { Node, Edge, NodeChange } from '@xyflow/react';
import { DecisionNode } from './DecisionNode';
import { CustomEdge } from './CustomEdge';
import { NodeToolbar } from './NodeToolbar';
import { ContextMenu } from './ContextMenu';
import { BreadcrumbBar } from './BreadcrumbBar';
import { GraphSearchBar } from './GraphSearchBar';
import { CanvasControls } from './CanvasControls';
import { useGraphStore } from '../../store/';
import { useAutoLayout } from '../../hooks/useAutoLayout';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { graphCommands, setReactFlowInstance } from '../../lib/graphCommands';
import '@xyflow/react/dist/style.css';

// Inner canvas component — must be inside ReactFlowProvider
const CanvasGraphInner: React.FC = () => {
  const {
    nodes, edges, setNodes, selectedNodeId, selectNode,
    openContextMenu, closeContextMenu,
    searchHighlightIds
  } = useGraphStore();

  const reactFlowInstance = useReactFlow();
  const reactFlowRef = useRef<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Register ReactFlow instance for graphCommands (AI hook point)
  useEffect(() => {
    if (reactFlowInstance) {
      reactFlowRef.current = reactFlowInstance;
      setReactFlowInstance(reactFlowInstance);
    }
  }, [reactFlowInstance]);

  // Auto-layout hook — re-runs dagre LR when node/edge count changes
  useAutoLayout({ reactFlowInstance: reactFlowRef, fitAfterLayout: false });

  // Keyboard shortcuts
  useKeyboardShortcuts({ onOpenSearch: () => setSearchOpen(true) });

  const nodeTypes = useMemo(() => ({
    decisionNode: DecisionNode
  }), []);

  const edgeTypes = useMemo(() => ({
    customEdge: CustomEdge
  }), []);

  // Compute visible nodes (hide children of collapsed parents)
  const visibleNodes = useMemo(() => {
    const hiddenNodeIds = new Set<string>();
    const collapsedNodes = nodes.filter(n => n.data?.collapsed);
    
    const findDescendants = (parentId: string) => {
      const children = edges.filter(e => e.sourceId === parentId).map(e => e.targetId);
      children.forEach(childId => {
        hiddenNodeIds.add(childId);
        findDescendants(childId);
      });
    };
    
    collapsedNodes.forEach(n => findDescendants(n.id));
    return nodes.filter(n => !hiddenNodeIds.has(n.id));
  }, [nodes, edges]);

  const visibleEdges = useMemo(() => {
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    return edges.filter(e => visibleNodeIds.has(e.sourceId) && visibleNodeIds.has(e.targetId));
  }, [edges, visibleNodes]);

  // Map store nodes → ReactFlow format, include search highlight info in data
  const rfNodes: Node[] = useMemo(() => {
    return visibleNodes.map(n => ({
      id: n.id,
      type: 'decisionNode',
      position: n.position,
      data: n.data as any,
      selected: n.id === selectedNodeId,
    }));
  }, [visibleNodes, selectedNodeId, searchHighlightIds]);

  const rfEdges: Edge[] = useMemo(() => {
    return visibleEdges.map(e => ({
      id: e.id,
      source: e.sourceId,
      target: e.targetId,
      type: 'customEdge',
      animated: e.animated,
      style: e.style
    }));
  }, [visibleEdges]);

  // Sync position drags back to Zustand (without triggering auto-layout)
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    const updatedNodes = [...nodes];
    let changed = false;
    changes.forEach((change) => {
      if (change.type === 'position' && change.position) {
        const index = updatedNodes.findIndex(n => n.id === change.id);
        if (index !== -1) {
          updatedNodes[index] = { ...updatedNodes[index], position: change.position };
          changed = true;
        }
      }
    });
    if (changed) setNodes(updatedNodes);
  }, [nodes, setNodes]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    selectNode(node.id);
    closeContextMenu();
  }, [selectNode, closeContextMenu]);

  const onPaneClick = useCallback(() => {
    selectNode(null);
    closeContextMenu();
    graphCommands.clearFocusBranch();
  }, [selectNode, closeContextMenu]);

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    selectNode(node.id);
    openContextMenu(event.clientX, event.clientY, node.id);
  }, [selectNode, openContextMenu]);

  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    openContextMenu(event.clientX, event.clientY);
  }, [openContextMenu]);

  // Initial fitView after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      reactFlowInstance?.fitView({ padding: 0.12, duration: 600 });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-full bg-[#F9F8F6] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] overflow-hidden select-none">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        fitView
        panOnScroll
        selectionOnDrag
        multiSelectionKeyCode="Shift"
        selectionMode={SelectionMode.Partial}
        minZoom={0.1}
        maxZoom={2}
        className="touch-none"
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="#D5D1C9" />
        {/* ReactFlow's built-in controls replaced by our CanvasControls */}
      </ReactFlow>

      {/* Floating Breadcrumb Navigation */}
      <BreadcrumbBar />

      {/* Ctrl+K Search Overlay */}
      <GraphSearchBar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Floating Node Toolbar */}
      {selectedNodeId && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 mt-10">
          <NodeToolbar nodeId={selectedNodeId} />
        </div>
      )}

      {/* Right-click Context Menu */}
      <ContextMenu />

      {/* Canvas Controls (keyboard shortcuts, legend) */}
      <CanvasControls />
    </div>
  );
};

// Export wrapped in ReactFlowProvider so useReactFlow() works inside
export const CanvasGraph: React.FC = () => (
  <ReactFlowProvider>
    <CanvasGraphInner />
  </ReactFlowProvider>
);
