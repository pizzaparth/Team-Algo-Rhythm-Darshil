// Author: Parth Pancholi

import React from 'react';
import { 
  Sparkles, Columns, FileText, Crosshair, 
  Plus, GitBranch, Loader2
} from 'lucide-react';
import { useGraphStore, useAppStore, useSessionStore } from '../../../store/';
import { graphCommands } from '../../../lib/graphCommands';

/**
 * SuggestedActionBar — quick action buttons above the chat input.
 * Context-sensitive: shows different actions based on selected node state.
 */
export const SuggestedActionBar: React.FC = () => {
  const { selectedNodeId, expandingNodeId, nodes } = useGraphStore();
  const { openModal } = useAppStore();
  const { conversationMode } = useSessionStore();

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;
  const isExpanding = expandingNodeId === selectedNodeId;

  if (conversationMode === 'waiting_for_answer') return null;

  const handleExpand = async () => {
    if (!selectedNodeId || isExpanding) return;

    // === IMMEDIATE feedback: mark node as expanding RIGHT NOW ===
    useGraphStore.getState().setExpandingNodeId(selectedNodeId);

    try {
      // Single expansion path: call graphCommands.expandNode which calls
      // getMockedExpansion → LLM → addGeneratedNodes. This is the ONE place
      // nodes get created. Do NOT also call expandWithClarification — that
      // generates a second LLM call and double nodes.
      await graphCommands.expandNode(selectedNodeId);

      // Add a chat message acknowledging the expansion
      const { useChatStore } = await import('../../../store/');
      const node = useGraphStore.getState().nodes.find(n => n.id === selectedNodeId);
      const nodeTitle = node?.data.title ?? selectedNodeId;
      useChatStore.getState().addAIMessage(
        `✅ Expanded **"${nodeTitle}"** — new branches have been added to the graph.`
      );
    } catch (err) {
      const { useChatStore } = await import('../../../store/');
      useChatStore.getState().addAIMessage(
        `⚠️ Expansion failed. Please try again.`
      );
    }

    // Clear expanding state defensively
    useGraphStore.getState().setExpandingNodeId(null);
  };

  const actions = selectedNode
    ? [
        {
          icon: isExpanding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />,
          label: isExpanding ? 'Expanding...' : 'Expand',
          onClick: handleExpand,
          primary: true,
          disabled: isExpanding,
        },
        {
          icon: <Columns className="w-3.5 h-3.5" />,
          label: 'Compare',
          onClick: () => openModal('compare', { firstNodeId: selectedNodeId }),
        },
        {
          icon: <Plus className="w-3.5 h-3.5" />,
          label: 'Add Child',
          onClick: () => openModal('create_node', { parentId: selectedNodeId }),
        },
        {
          icon: <Crosshair className="w-3.5 h-3.5" />,
          label: 'Focus',
          onClick: () => graphCommands.focusBranch(selectedNodeId!),
        },
      ]
    : [
        {
          icon: <GitBranch className="w-3.5 h-3.5" />,
          label: 'Jump to Root',
          onClick: () => graphCommands.jumpToRoot(),
        },
        {
          icon: <FileText className="w-3.5 h-3.5" />,
          label: 'Fit View',
          onClick: () => graphCommands.fitView(),
        },
      ];

  return (
    <div className="px-3 py-2 border-t border-[#E5E2DD] bg-[#EEEBE6]/50 shrink-0">
      <div className="flex items-center space-x-1.5 overflow-x-auto">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-colors whitespace-nowrap disabled:opacity-40 ${
              action.primary
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                : 'bg-white border border-[#E5E2DD] hover:border-[#ccc] text-[#1A1A1A] shadow-sm'
            }`}
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
