// Author: Parth Pancholi

import React from 'react';
import {
  Plus, Copy, Trash2, Edit3, Columns, Star,
  ChevronUp, ChevronDown, FileText, Users,
  Sparkles, Crosshair, Loader2
} from 'lucide-react';
import { useGraphStore, useAppStore } from '../../store/';
import { graphCommands } from '../../lib/graphCommands';
import { primaryButtonClasses } from '../../lib/uiClasses';
import { TooltipIconButton } from '../common/TooltipIconButton';

interface NodeToolbarProps {
  nodeId: string;
}

export const NodeToolbar: React.FC<NodeToolbarProps> = ({ nodeId }) => {
  const { nodes, duplicateNode, toggleNodeBookmark, toggleNodeCollapse, expandingNodeId } = useGraphStore();
  const { openModal, addToast } = useAppStore();

  const node = nodes.find(n => n.id === nodeId);
  if (!node) return null;
  const isExpanding = expandingNodeId === nodeId;

  return (
    <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-md border border-[#E5E2DD] p-2.5 rounded-full shadow-lg z-40 text-xs animate-in fade-in zoom-in-95 duration-150">
      {/* Expand (AI) */}
      <TooltipIconButton
        onClick={() => openModal('expand_node', { nodeId })}
        disabled={isExpanding}
        label="Expand with AI (E)"
        className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center space-x-1 transition-colors shadow-sm disabled:opacity-60"
      >
        {isExpanding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
        <span>{isExpanding ? 'Expanding...' : 'Expand'}</span>
      </TooltipIconButton>

      {/* Add Child */}
      <TooltipIconButton
        onClick={() => openModal('create_node', { parentId: nodeId })}
        label="Add Child Node"
        className={primaryButtonClasses('px-4 py-1.5 rounded-full font-medium flex items-center space-x-1 shadow-sm')}
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Child</span>
      </TooltipIconButton>

      {/* Compare */}
      <TooltipIconButton
        onClick={() => openModal('compare', { firstNodeId: nodeId })}
        label="Compare with another node"
        className="p-2 text-[#1A1A1A] hover:bg-[#F3F1ED] rounded-full transition-colors"
      >
        <Columns className="w-3.5 h-3.5 text-blue-600" />
      </TooltipIconButton>

      {/* Focus Branch */}
      <TooltipIconButton
        onClick={() => graphCommands.focusBranch(nodeId)}
        label="Focus this branch"
        className="p-2 text-[#1A1A1A] hover:bg-[#F3F1ED] rounded-full transition-colors"
      >
        <Crosshair className="w-3.5 h-3.5 text-indigo-600" />
      </TooltipIconButton>

      {/* Rename */}
      <TooltipIconButton
        onClick={() => openModal('rename_node', { nodeId })}
        label="Rename Node"
        className="p-2 text-[#1A1A1A] hover:bg-[#F3F1ED] rounded-full transition-colors"
      >
        <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
      </TooltipIconButton>

      {/* Notes */}
      <TooltipIconButton
        onClick={() => {
          if (node.data.notes) {
            addToast(`📝 Notes: ${node.data.notes.slice(0, 60)}${node.data.notes.length > 60 ? '…' : ''}`, 'info');
          } else {
            openModal('rename_node', { nodeId }); // open rename to add notes
            addToast('Open notes by editing the node', 'info');
          }
        }}
        label="View Notes"
        className="p-2 text-[#1A1A1A] hover:bg-[#F3F1ED] rounded-full transition-colors"
      >
        <FileText className="w-3.5 h-3.5 text-amber-600" />
      </TooltipIconButton>

      {/* Experts */}
      <TooltipIconButton
        onClick={() => {
          const expertsCount = node.data.experts?.length ?? 0;
          if (expertsCount > 0) {
            addToast(`👥 ${expertsCount} expert reference(s) on this node`, 'info');
          } else {
            addToast('No expert references on this node yet', 'info');
          }
        }}
        label="View Experts"
        className="p-2 text-[#1A1A1A] hover:bg-[#F3F1ED] rounded-full transition-colors"
      >
        <Users className="w-3.5 h-3.5 text-purple-600" />
      </TooltipIconButton>

      {/* Bookmark */}
      <TooltipIconButton
        onClick={() => toggleNodeBookmark(nodeId)}
        label="Toggle Bookmark"
        className="p-2 text-[#1A1A1A] hover:bg-[#F3F1ED] rounded-full transition-colors"
      >
        <Star className={`w-3.5 h-3.5 ${node.data.bookmarked ? 'text-amber-500 fill-amber-500' : ''}`} />
      </TooltipIconButton>

      {/* Duplicate */}
      <TooltipIconButton
        onClick={() => duplicateNode(nodeId)}
        label="Duplicate Node"
        className="p-2 text-[#1A1A1A] hover:bg-[#F3F1ED] rounded-full transition-colors"
      >
        <Copy className="w-3.5 h-3.5" />
      </TooltipIconButton>

      {/* Collapse/Expand */}
      <TooltipIconButton
        onClick={() => toggleNodeCollapse(nodeId)}
        label={node.data.collapsed ? 'Expand Branch' : 'Collapse Branch'}
        className="p-2 text-[#1A1A1A] hover:bg-[#F3F1ED] rounded-full transition-colors"
      >
        {node.data.collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </TooltipIconButton>

      {/* Delete */}
      <TooltipIconButton
        onClick={() => openModal('delete_node', { nodeId: nodeId })}
        label="Delete Node"
        className="p-2 text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </TooltipIconButton>
    </div>
  );
};
