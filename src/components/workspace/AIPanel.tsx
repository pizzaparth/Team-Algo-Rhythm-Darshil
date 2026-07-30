// Author: Parth Pancholi

import React from 'react';
import {
  Bot, Sparkles,
  ChevronRight, Wifi
} from 'lucide-react';
import { useGraphStore, useAIStore, useSessionStore } from '../../store/';
import { NodeContextCard } from './AIPanel/NodeContextCard';
import { ConversationThread } from './AIPanel/ConversationThread';
import { ChatInput } from './AIPanel/ChatInput';
import { AIQuestionCard } from './AIPanel/AIQuestionCard';
import { BranchSummaryCard } from './AIPanel/BranchSummaryCard';
import { SuggestedActionBar } from './AIPanel/SuggestedActionBar';

/**
 * AIPanel — The complete AI workspace panel (Phase 3).
 *
 * Layout fix: The entire middle area (context card, branch summary,
 * suggestions, and chat) scrolls as one column so that AI suggestions
 * never push the conversation off-screen.
 */
interface AIPanelProps {
  onClose: () => void;
}

export const AIPanel: React.FC<AIPanelProps> = ({ onClose }) => {
  const { selectedNodeId } = useGraphStore();
  const { aiSuggestions, addBranchFromSuggestion, ignoreSuggestion } = useAIStore();
  const { conversationMode, isStreaming } = useSessionStore();

  // Mode indicator
  const modeLabel = {
    chat: 'Ready',
    expanding: 'Expanding...',
    waiting_for_answer: 'Awaiting Answer',
    processing: 'Processing...',
  }[conversationMode];

  const modeColor = {
    chat: 'text-emerald-500',
    expanding: 'text-indigo-500',
    waiting_for_answer: 'text-amber-500',
    processing: 'text-blue-500',
  }[conversationMode];

  return (
    <div className="relative w-80 md:w-96 bg-[#F3F1ED] border-l border-[#E5E2DD] flex flex-col h-full z-20 text-xs text-[#1A1A1A] select-none">
      {/* Collapse Handle — left edge, vertically centered */}
      <button
        onClick={onClose}
        title="Collapse AI Reasoning Assistant"
        className="absolute top-1/2 -left-3 -translate-y-1/2 z-30 w-6 h-6 rounded-full bg-[#1A1A1A] hover:bg-[#2c2c2c] flex items-center justify-center shadow-md transition-colors"
      >
        <ChevronRight className="w-3.5 h-3.5 text-white" />
      </button>

      {/* Panel Header — fixed at top */}
      <div className="flex items-center justify-between bg-[#EEEBE6] border-b border-[#E5E2DD] px-3 py-2 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#1A1A1A]">AI Reasoning Assistant</div>
            <div className={`text-[9px] font-medium flex items-center space-x-1 ${modeColor}`}>
              {isStreaming ? (
                <Wifi className="w-2.5 h-2.5 animate-pulse" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
              )}
              <span>{modeLabel}</span>
            </div>
          </div>
        </div>

        {/* Suggestions badge */}
        {aiSuggestions.length > 0 && (
          <div className="flex items-center space-x-1 px-2 py-0.5 bg-amber-100 border border-amber-200 rounded-full text-[9px] font-bold text-amber-700">
            <Sparkles className="w-3 h-3" />
            <span>{aiSuggestions.length}</span>
          </div>
        )}
      </div>

      {/* === SCROLLABLE MIDDLE AREA === */}
      {/* Everything scrolls together: context card, branch summary, suggestions, and chat */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Node Context Card — always visible when a node is selected */}
        <NodeContextCard />

        {/* Branch Summary — collapsible, only when node selected */}
        {selectedNodeId && <BranchSummaryCard />}

        {/* AI Question Card — appears when AI needs clarification */}
        <AIQuestionCard />

        {/* Proactive AI Suggestions (inline, dismissible) */}
        {aiSuggestions.length > 0 && (
          <div className="px-3 py-2 space-y-2 border-b border-[#E5E2DD]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center">
              <Sparkles className="w-3 h-3 mr-1" /> AI Suggestions
            </div>
            {aiSuggestions.slice(0, 2).map(sug => (
              <div key={sug.id} className="p-2.5 bg-white border border-amber-200 rounded-lg space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between text-[9px]">
                  <span className="font-bold text-amber-700">IMPACT {sug.impactScore}%</span>
                  <span className="text-[#aaa] uppercase">{sug.suggestedType}</span>
                </div>
                <h4 className="text-[11px] font-bold text-[#1A1A1A] font-serif italic">{sug.title}</h4>
                <p className="text-[10px] text-[#666] leading-relaxed">{sug.description}</p>
                <div className="flex items-center space-x-1.5 pt-1 border-t border-[#E5E2DD]">
                  <button
                    onClick={() => addBranchFromSuggestion(sug)}
                    className="flex-1 py-1 px-2 bg-[#1A1A1A] hover:bg-[#2c2c2c] text-white font-semibold rounded text-[10px] transition-colors"
                  >
                    Add Branch
                  </button>
                  <button
                    onClick={() => ignoreSuggestion(sug.id)}
                    className="px-2 py-1 bg-[#EEEBE6] hover:bg-[#E5E2DD] text-[#666] rounded text-[10px] font-medium transition-colors"
                  >
                    Ignore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Conversation Thread — messages appear here, scrolling naturally within the same column */}
        <ConversationThread />
      </div>

      {/* === FIXED AT BOTTOM === */}
      {/* Suggested Action Bar — context-sensitive quick actions */}
      <SuggestedActionBar />

      {/* Chat Input — with command detection */}
      <ChatInput />
    </div>
  );
};
