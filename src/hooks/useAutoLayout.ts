/**
 * useAutoLayout.ts — Dagre LR Auto-Layout Hook
 *
 * Triggers auto-layout whenever the structural graph changes
 * (nodes added/removed, edges added/removed).
 * Does NOT trigger on: position drags, selection, collapse toggles.
 *
 * Preserves the viewport after layout unless fitAfterLayout is true.
 */

import { useEffect, useRef, MutableRefObject } from 'react';
import { useGraphStore } from '../store';
import { applyLayout } from '../lib/graphLayout';

interface UseAutoLayoutOptions {
  fitAfterLayout?: boolean;
  reactFlowInstance?: MutableRefObject<any>;
}

export function useAutoLayout({
  fitAfterLayout = false,
  reactFlowInstance,
}: UseAutoLayoutOptions = {}) {
  const { nodes, edges, setNodes } = useGraphStore();
  const prevStructuralKey = useRef<string>('');

  useEffect(() => {
    if (nodes.length === 0) return;

    // Structural key: only depends on node/edge count + ids, NOT positions or data
    const structuralKey = [
      nodes.map(n => n.id).join(','),
      edges.map(e => `${e.sourceId}>${e.targetId}`).join(','),
    ].join('|');

    if (structuralKey === prevStructuralKey.current) return;
    prevStructuralKey.current = structuralKey;

    // Apply LR layout
    const laidOutNodes = applyLayout(nodes, edges);
    setNodes(laidOutNodes);

    // Optionally fit view after layout
    if (fitAfterLayout && reactFlowInstance?.current) {
      setTimeout(() => {
        reactFlowInstance.current?.fitView({ padding: 0.12, duration: 500 });
      }, 50);
    }
  }, [nodes.length, edges.length]); // eslint-disable-line react-hooks/exhaustive-deps
}
