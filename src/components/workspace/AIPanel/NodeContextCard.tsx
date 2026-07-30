// Author: Parth Pancholi

import React from 'react';
import { 
  GitBranch, User, Bot, ShieldCheck, AlertTriangle,
  ChevronRight, MapPin
} from 'lucide-react';
import { useGraphStore } from '../../../store/';

/**
 * NodeContextCard — shows selected node info inline at the top of the AI panel.
 * Always visible when a node is selected. Provides quick context.
 */
export const NodeContextCard: React.FC = () => {
  const { nodes, edges, selectedNodeId } = useGraphStore();
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  if (!selectedNode) return null;

  // Build path from root
  const buildPath = (): string[] => {
    const path: string[] = [];
    let currentId: string | null = selectedNode.id;
    while (currentId) {
      const node = nodes.find(n => n.id === currentId);
      if (node) path.unshift(node.data.title);
      const parentEdge = edges.find(e => e.targetId === currentId);
      currentId = parentEdge?.sourceId ?? null;
    }
    return path;
  };

  const path = buildPath();
  const isAI = selectedNode.data.creator === 'ai';

  return (
    <div className="mx-3 mt-3 p-3 bg-white border border-[#E5E2DD] rounded-lg shadow-sm space-y-2 shrink-0">
      {/* Breadcrumb path */}
      <div className="flex items-center text-[10px] text-[#888888] space-x-1 overflow-x-auto whitespace-nowrap">
        <MapPin className="w-3 h-3 shrink-0" />
        {path.map((segment, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight className="w-2.5 h-2.5 shrink-0 text-[#ccc]" />}
            <span className={i === path.length - 1 ? 'text-[#1A1A1A] font-semibold' : ''}>
              {segment.length > 20 ? segment.slice(0, 20) + '…' : segment}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Title + type */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1.5 text-[10px]">
            <span className="uppercase font-bold tracking-widest text-[#1A1A1A] opacity-60">
              {selectedNode.data.displayType}
            </span>
            <span className="text-[#ccc]">•</span>
            <span className={`font-semibold ${isAI ? 'text-indigo-600' : 'text-emerald-600'}`}>
              {isAI ? <Bot className="w-3 h-3 inline mr-0.5" /> : <User className="w-3 h-3 inline mr-0.5" />}
              {isAI ? 'AI' : 'User'}
            </span>
          </div>
          <h3 className="text-sm font-serif italic font-bold text-[#1A1A1A] leading-tight mt-0.5 truncate">
            {selectedNode.data.title}
          </h3>
        </div>
        <div className="flex items-center space-x-1.5 shrink-0 ml-2">
          <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
            selectedNode.data.riskFactor === 'High' || selectedNode.data.riskFactor === 'Critical'
              ? 'bg-rose-100 text-rose-700'
              : selectedNode.data.riskFactor === 'Medium'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-emerald-100 text-emerald-700'
          }`}>
            {selectedNode.data.riskFactor}
          </div>
          <div className="w-7 h-7 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-mono text-[10px] font-bold">
            {selectedNode.data.confidence}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="flex items-center space-x-3 text-[10px] text-[#666666] pt-1 border-t border-[#E5E2DD]">
        <span className="flex items-center">
          <GitBranch className="w-3 h-3 mr-0.5" />
          Depth {selectedNode.data.depth}
        </span>
        <span className="flex items-center">
          {selectedNode.data.status === 'approved' ? (
            <ShieldCheck className="w-3 h-3 mr-0.5 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-3 h-3 mr-0.5 text-amber-500" />
          )}
          {selectedNode.data.status}
        </span>
        {selectedNode.data.bookmarked && (
          <span className="text-amber-500 font-semibold">★ Bookmarked</span>
        )}
      </div>
    </div>
  );
};
