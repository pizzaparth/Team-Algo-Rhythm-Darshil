// Author: Parth Pancholi

import React, { useState, useRef, useEffect } from 'react';
import {
  Send, ChevronLeft, ChevronRight,
  ArrowUpRight, Plus, MessageSquare, Copy, Check,
} from 'lucide-react';
import { useChatStore, useAppStore, useProjectStore } from '../../store/';
import { renderMarkdown, getRelativeTime } from '../../lib/markdownRenderer';
import { primaryButtonClasses } from '../../lib/uiClasses';
import { RenameDeleteListItem } from '../common/RenameDeleteListItem';

export const ChatInterface: React.FC = () => {
  const { messages, sendUserMessage, isGenerating, contextSufficient } = useChatStore();
  const { setViewMode, addToast } = useAppStore();
  const { sessions, activeSessionId, selectSession, createSession, deleteSession, renameSession } = useProjectStore();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  // Sidebar starts open on desktop, closed on mobile — matches the device's
  // actual width at load rather than forcing one default for every screen.
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    sendUserMessage(input);
    setInput('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('Copied to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="relative flex h-[calc(100vh-3.5rem)] bg-white text-[#1A1A1A] overflow-hidden select-none">
      {/* Backdrop — closes the sidebar when tapped outside it on mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 top-14 bg-black/20 z-30 md:hidden"
        />
      )}

      {/* Sessions Sidebar */}
      <div className="relative flex h-full bg-[#F9F8F6] border-r border-[#E5E2DD] shrink-0">
        {/* Rail — only the expand/collapse toggle, at the top */}
        <div className="w-12 flex flex-col items-center py-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
            className="p-2 rounded-md text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F3F1ED] transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {sidebarOpen && (
          <div className="fixed md:static inset-y-0 top-14 md:top-auto left-12 md:left-auto z-40 md:z-auto w-64 h-[calc(100vh-3.5rem)] md:h-full flex flex-col overflow-y-auto bg-[#F9F8F6]">
            <div className="p-2">
              <button
                onClick={() => createSession(`Session ${sessions.length + 1}`)}
                className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm text-[#1A1A1A] hover:bg-[#F3F1ED] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New chat</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
              {sessions.map((sess) => (
                <RenameDeleteListItem
                  key={sess.id}
                  variant="flat"
                  selected={activeSessionId === sess.id}
                  icon={<MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#1A1A1A]" />}
                  title={sess.title}
                  updatedAt={getRelativeTime(sess.updatedAt)}
                  onSelect={() => selectSession(sess.id)}
                  onRename={() => {
                    const newName = window.prompt('Rename session:', sess.title);
                    if (newName && newName.trim()) {
                      renameSession(sess.id, newName.trim());
                    }
                  }}
                  onDelete={() => {
                    if (sessions.length <= 1) {
                      addToast('Cannot delete the last session', 'warning');
                      return;
                    }
                    if (window.confirm(`Delete session "${sess.title}"?`)) {
                      deleteSession(sess.id);
                    }
                  }}
                />
              ))}
            </div>

            {/* Transition Helper Footer */}
            <div className="p-2 border-t border-[#E5E2DD]">
              <button
                onClick={() => setViewMode('workspace')}
                className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm text-[#1A1A1A] hover:bg-[#F3F1ED] transition-colors"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Open Decision Canvas</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white relative">
        {/* Banner Alert for Transition to Planning Workspace */}
        {contextSufficient && (
          <div className="border-b border-[#E5E2DD] px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#1A1A1A]">
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>AI Reasoning Engine has synthesized initial architectural nodes into your graph canvas.</span>
            </div>
            <button
              onClick={() => setViewMode('workspace')}
              className={primaryButtonClasses('shrink-0 px-3 py-1 font-semibold rounded-md flex items-center space-x-1 shadow-sm text-xs')}
            >
              <span>Start Planning Workspace</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
          <div className="max-w-3xl mx-auto w-full space-y-8">
            {messages.map((msg) => (
              msg.sender === 'user' ? (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[80%] bg-[#F3F1ED] text-[#1A1A1A] rounded-3xl px-4 py-2.5 text-sm whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="group">
                  <div
                    className="prose-xs text-sm leading-relaxed text-[#1A1A1A]"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                  />

                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.suggestedActions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setViewMode('workspace');
                            addToast(`Executing action: ${act.label}`, 'info');
                          }}
                          className={primaryButtonClasses('px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center space-x-1 shadow-sm')}
                        >
                          <span>{act.label}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}

                  {!msg.isStreaming && (
                    <div className="mt-2 flex items-center space-x-1 text-[#888888]">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1.5 rounded-md hover:bg-[#F3F1ED] hover:text-[#1A1A1A] transition-colors"
                        title="Copy"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>
              )
            ))}

            {/* Typing / Generating Indicator */}
            {isGenerating && (
              <div className="flex items-center space-x-2 text-sm text-[#666666]">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Evaluating decision pathways and updating graph structure...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat Input Container */}
        <div className="px-4 pb-6 pt-2">
          <div className="max-w-3xl mx-auto w-full">
            <form onSubmit={handleSubmit} className="relative flex items-center bg-[#F3F1ED] border border-[#E5E2DD] focus-within:border-[#1A1A1A] rounded-full px-2 py-1.5 transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask anything"
                rows={1}
                className="flex-1 bg-transparent px-3 text-sm text-[#1A1A1A] placeholder-[#888888] focus:outline-none resize-none max-h-24"
              />

              <button
                type="submit"
                disabled={!input.trim() || isGenerating}
                className={primaryButtonClasses('p-2 disabled:opacity-30 rounded-full')}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <p className="text-center text-[11px] text-[#888888] mt-2">
              AI can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
