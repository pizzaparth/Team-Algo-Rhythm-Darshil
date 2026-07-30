// Author: Parth Pancholi

import React, { useMemo } from 'react';
import { ChevronRight, Home, Crosshair } from 'lucide-react';
import { useGraphStore } from '../../store';
import { graphCommands } from '../../lib/graphCommands';
import type { GraphNode } from '../../types';

/**
 * BreadcrumbBar — shows root → selected node path.
 * Each crumb is clickable and focuses the corresponding node.
 */
export const BreadcrumbBar: React.FC = () => {
  const { nodes, edges, selectedNodeId } = useGraphStore();

  const breadcrumbPath = useMemo((): GraphNode[] => {
    if (!selectedNodeId) return [];

    const path: GraphNode[] = [];
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    // Build parent lookup from edges
    const parentOf = new Map<string, string>();
    edges.forEach(e => { parentOf.set(e.targetId, e.sourceId); });

    let currentId: string | undefined = selectedNodeId;
    while (currentId) {
      const node = nodeMap.get(currentId);
      if (!node) break;
      path.unshift(node);
      currentId = parentOf.get(currentId);
    }

    return path;
  }, [selectedNodeId, nodes, edges]);

  if (!selectedNodeId || breadcrumbPath.length === 0) return null;

  return (
    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-20 flex items-center space-x-1 bg-white/90 backdrop-blur-sm border border-[#E5E2DD] rounded-full px-3 py-1.5 shadow-sm text-[11px] max-w-[600px] overflow-hidden">
      <button
        onClick={() => graphCommands.jumpToRoot()}
        title="Jump to Root"
        className="text-[#666666] hover:text-[#1A1A1A] transition-colors shrink-0"
      >
        <Home className="w-3 h-3" />
      </button>

      {breadcrumbPath.map((node, i) => (
        <React.Fragment key={node.id}>
          {i > 0 && <ChevronRight className="w-3 h-3 text-[#CCCCCC] shrink-0" />}
          <button
            onClick={() => graphCommands.focusNode(node.id)}
            className={`px-1.5 py-0.5 rounded transition-colors truncate max-w-[140px] ${
              node.id === selectedNodeId
                ? 'text-[#1A1A1A] font-semibold bg-[#F3F1ED]'
                : 'text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F3F1ED]'
            }`}
            title={node.data.title}
          >
            {node.data.title.length > 22 ? node.data.title.slice(0, 22) + '…' : node.data.title}
          </button>
        </React.Fragment>
      ))}

      {selectedNodeId && (
        <button
          onClick={() => graphCommands.focusNode(selectedNodeId)}
          title="Center on selected node (Ctrl+.)"
          className="ml-1 p-1 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors shrink-0"
        >
          <Crosshair className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
