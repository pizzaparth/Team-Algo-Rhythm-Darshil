import React from 'react';
import { 
  Plus, Copy, Trash2, Edit3, Columns, Star, 
  ChevronUp, ChevronDown, FileText, Users, Bookmark,
  Sparkles, Crosshair, Loader2
} from 'lucide-react';
import { useGraphStore, useAppStore } from '../../store/';
import { graphCommands } from '../../lib/graphCommands';

interface NodeToolbarProps {
  nodeId: string;
}

export const NodeToolbar: React.FC<NodeToolbarProps> = ({ nodeId }) => {
  const { nodes, deleteNode, duplicateNode, toggleNodeBookmark, toggleNodeCollapse, expandingNodeId } = useGraphStore();
  const { openModal, setActiveAssistantTab, addToast } = useAppStore();

  const node = nodes.find(n => n.id === nodeId);
  if (!node) return null;
  const isExpanding = expandingNodeId === nodeId;

  return (
    <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-md border border-[#E5E2DD] p-2.5 rounded-full shadow-lg z-40 text-xs animate-in fade-in zoom-in-95 duration-150">
      {/* Expand (AI) */}
      <button
        onClick={() => openModal('expand_node', { nodeId })}
        disabled={isExpanding}
        className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center space-x-1 transition-colors shadow-sm disabled:opacity-60"
        title="Expand with AI (E)"
      >
        {isExpanding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
        <span>{isExpanding ? 'Expanding...' : 'Expand'}</span>
      </button>

      {/* Add Child */}
      <button
        onClick={() => openModal('create_node', { parentId: nodeId })}
        className="px-4 py-1.5 rounded-full bg-[#1A1A1A] hover:bg-[#2c2c2c] text-white font-medium flex items-center space-x-1 transition-colors shadow-sm"
        title="Add Child Node"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Child</span>
      </button>

      {/* Compare */}
      <button
        onClick={() => openModal('compare', { firstNodeId: nodeId })}
        className="p-2 text-[#1A1A1A] hover:bg-[#F3F1ED] rounded-full transition-colors"
        title="Compare with another node"
      >
        <Columns className="w-3.5 h-3.5 text-blue-600" />
      </button>

      {/* Focus Branch */}
      <button
        onClick={() => graphCommands.focusBranch(nodeId)}
        className="p-2 text-[#1A1A1A] hover:bg-[#F3F1ED] rounded-full transition-colors"
        title="Focus this branch"
      >
        <Crosshair className="w-3.5 h-3.5 text-indigo-600" />
      </button>

      {/* Rename */}
      <button
        onClick={() => openModal('rename_node', { nodeId })}
        className="p-2 text-[#1A1A1A] hover:bg-[#F3F1ED] rounded-full transition-colors"
        title="Rename Node"
      >
        <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
      </button>

      {/* Notes */}
      <button
        onClick={() => {
          if (node.data.notes) {
            addToast(`📝 Notes: ${node.data.notes.slice(0, 60)}${node.data.notes.length > 60 ? '…' : ''}`, 'info');
          } else {
            openModal('rename_node', { nodeId }); // open rename to add notes
            addToast('Open notes by editing the node', 'info');
          }
        }}
        className="p-2 text-[#1A1A1A] hover:bg-[#F3F1ED] rounded-full transition-colors"
        title="View Notes"
      >
        <FileText className="w-3.5 h-3.5 text-amber-600" />
      </button>

      {/* Experts */}
      <button
        onClick={() => {
          const expertsCount = node.data.experts?.length ?? 0;
          if (expertsCount > 0) {
            addToast(`👥 ${expertsCount} expert reference(s) on this node`, 'info');
          } else {
            addToast('No expert references on this node yet', 'info');
          }
        }}
        className="p-2 text-[#1A1A1A] hover:bg-[#F3F1ED] rounded-full transition-colors"
        title="View Experts"
      >
        <Users className="w-3.5 h-3.5 text-purple-600" />
      </button>

      {/* Bookmark */}
      <button
        onClick={() => toggleNodeBookmark(nodeId)}
        className="p-2 text-[#1A1A1A] hover:bg-[#F3F1ED] rounded-full transition-colors"
        title="Toggle Bookmark"
      >
        <Star className={`w-3.5 h-3.5 ${node.data.bookmarked ? 'text-amber-500 fill-amber-500' : ''}`} />
      </button>

      {/* Duplicate */}
      <button
        onClick={() => duplicateNode(nodeId)}
        className="p-2 text-[#1A1A1A] hover:bg-[#F3F1ED] rounded-full transition-colors"
        title="Duplicate Node"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>

      {/* Collapse/Expand */}
      <button
        onClick={() => toggleNodeCollapse(nodeId)}
        className="p-2 text-[#1A1A1A] hover:bg-[#F3F1ED] rounded-full transition-colors"
        title={node.data.collapsed ? 'Expand Branch' : 'Collapse Branch'}
      >
        {node.data.collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {/* Delete */}
      <button
        onClick={() => openModal('delete_node', { nodeId: nodeId })}
        className="p-2 text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
        title="Delete Node"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
