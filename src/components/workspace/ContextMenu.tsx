// Author: Parth Pancholi

import React, { useEffect, useRef } from 'react';
import { 
  Plus, Edit3, Copy, Trash2, Columns, Star, 
  ChevronDown, ChevronUp, Link2, FileText, 
  Sparkles, Crosshair, Download, Clipboard
} from 'lucide-react';
import { useGraphStore, useAppStore } from '../../store/';
import { graphCommands } from '../../lib/graphCommands';

export const ContextMenu: React.FC = () => {
  const { contextMenu, closeContextMenu, nodes, deleteNode, duplicateNode, toggleNodeBookmark, toggleNodeCollapse } = useGraphStore();
  const { openModal, addToast } = useAppStore();

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [closeContextMenu]);

  if (!contextMenu || !contextMenu.show) return null;

  const node = contextMenu.nodeId ? nodes.find(n => n.id === contextMenu.nodeId) : null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Direct node link copied to clipboard', 'info');
    closeContextMenu();
  };

  return (
    <div
      ref={menuRef}
      style={{ top: contextMenu.y, left: contextMenu.x }}
      className="fixed z-50 w-52 bg-white border border-[#E5E2DD] rounded-lg shadow-xl p-1.5 text-xs text-[#1A1A1A] animate-in fade-in zoom-in-95 duration-100 select-none"
    >
      {node ? (
        <>
          <div className="px-3 py-1.5 text-[10px] font-bold text-[#1A1A1A] opacity-50 border-b border-[#E5E2DD] uppercase tracking-wider truncate">
            {node.data.title}
          </div>

          <button
            onClick={() => {
              openModal('expand_node', { nodeId: node.id });
              closeContextMenu();
            }}
            className="w-full text-left px-3 py-1.5 rounded-md hover:bg-indigo-50 text-indigo-700 font-semibold flex items-center space-x-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Expand with AI</span>
          </button>

          <button
            onClick={() => {
              openModal('create_node', { parentId: node.id });
              closeContextMenu();
            }}
            className="w-full text-left px-3 py-1.5 rounded-md hover:bg-[#F3F1ED] font-medium flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#1A1A1A]" />
            <span>Add Child Node</span>
          </button>

          <button
            onClick={() => {
              openModal('rename_node', { nodeId: node.id });
              closeContextMenu();
            }}
            className="w-full text-left px-3 py-1.5 rounded-md hover:bg-[#F3F1ED] flex items-center space-x-2 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Rename Node</span>
          </button>

          <button
            onClick={() => {
              openModal('compare', { firstNodeId: node.id });
              closeContextMenu();
            }}
            className="w-full text-left px-3 py-1.5 rounded-md hover:bg-[#F3F1ED] flex items-center space-x-2 transition-colors"
          >
            <Columns className="w-3.5 h-3.5 text-blue-600" />
            <span>Compare Node</span>
          </button>

          <button
            onClick={() => {
              toggleNodeBookmark(node.id);
              closeContextMenu();
            }}
            className="w-full text-left px-3 py-1.5 rounded-md hover:bg-[#F3F1ED] flex items-center space-x-2 transition-colors"
          >
            <Star className={`w-3.5 h-3.5 ${node.data.bookmarked ? 'text-amber-500 fill-amber-500' : 'text-[#666666]'}`} />
            <span>{node.data.bookmarked ? 'Remove Bookmark' : 'Bookmark Node'}</span>
          </button>

          <button
            onClick={() => {
              toggleNodeCollapse(node.id);
              closeContextMenu();
            }}
            className="w-full text-left px-3 py-1.5 rounded-md hover:bg-[#F3F1ED] flex items-center space-x-2 transition-colors"
          >
            {node.data.collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            <span>{node.data.collapsed ? 'Expand Sub-Tree' : 'Collapse Sub-Tree'}</span>
          </button>

          <button
            onClick={() => {
              duplicateNode(node.id);
              closeContextMenu();
            }}
            className="w-full text-left px-3 py-1.5 rounded-md hover:bg-[#F3F1ED] flex items-center space-x-2 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-[#666666]" />
            <span>Duplicate Branch</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full text-left px-3 py-1.5 rounded-md hover:bg-[#F3F1ED] flex items-center space-x-2 transition-colors"
          >
            <Link2 className="w-3.5 h-3.5 text-[#666666]" />
            <span>Copy Direct Link</span>
          </button>

          <button
            onClick={() => {
              graphCommands.focusBranch(node.id);
              closeContextMenu();
            }}
            className="w-full text-left px-3 py-1.5 rounded-md hover:bg-[#F3F1ED] flex items-center space-x-2 transition-colors"
          >
            <Crosshair className="w-3.5 h-3.5 text-indigo-600" />
            <span>Focus Branch</span>
          </button>

          <button
            onClick={() => {
              graphCommands.copyNode(node.id);
              closeContextMenu();
            }}
            className="w-full text-left px-3 py-1.5 rounded-md hover:bg-[#F3F1ED] flex items-center space-x-2 transition-colors"
          >
            <Clipboard className="w-3.5 h-3.5 text-[#666666]" />
            <span>Copy Node</span>
          </button>

          <button
            onClick={() => {
              const md = graphCommands.exportBranch(node.id, 'markdown');
              navigator.clipboard.writeText(md);
              addToast('Branch exported to clipboard (Markdown)', 'success');
              closeContextMenu();
            }}
            className="w-full text-left px-3 py-1.5 rounded-md hover:bg-[#F3F1ED] flex items-center space-x-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#666666]" />
            <span>Export Branch (MD)</span>
          </button>

          <div className="my-1 border-t border-[#E5E2DD]" />

          <button
            onClick={() => {
              openModal('delete_node', { nodeId: node.id });
              closeContextMenu();
            }}
            className="w-full text-left px-3 py-1.5 rounded-md hover:bg-rose-50 text-rose-600 flex items-center space-x-2 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Node</span>
          </button>
        </>
      ) : (
        <>
          <div className="px-3 py-1.5 text-[10px] font-bold text-[#1A1A1A] opacity-50 border-b border-[#E5E2DD] uppercase tracking-wider">
            Canvas Menu
          </div>

          <button
            onClick={() => {
              openModal('create_node');
              closeContextMenu();
            }}
            className="w-full text-left px-3 py-1.5 rounded-md hover:bg-[#F3F1ED] font-medium flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#1A1A1A]" />
            <span>Create Floating Node</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full text-left px-3 py-1.5 rounded-md hover:bg-[#F3F1ED] flex items-center space-x-2 transition-colors"
          >
            <Link2 className="w-3.5 h-3.5 text-[#666666]" />
            <span>Copy Canvas Link</span>
          </button>
        </>
      )}
    </div>
  );
};
