// Author: Parth Pancholi

import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Bot, User, Paperclip, Sparkles, ChevronLeft, ChevronRight,
  ArrowUpRight, Plus, MessageSquare, Copy, Check,
  Edit3, Trash2, X
} from 'lucide-react';
import { useChatStore, useAppStore, useProjectStore } from '../../store/';
import { renderMarkdown, getRelativeTime } from '../../lib/markdownRenderer';
import { AvatarBubble } from '../common/AvatarBubble';

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

  const handleAttachment = () => {
    addToast('Attachment added: architecture_requirements_v2.pdf', 'success');
  };

  const suggestedPrompts = [
    'What are the key trade-offs between Option A and Option B?',
    'Evaluate the latency and cost implications of this architecture',
    'Identify top 3 security risks for this approach',
    'Generate a complete migration roadmap'
  ];

  return (
    <div className="relative flex h-[calc(100vh-3.5rem)] bg-[#F9F8F6] text-[#1A1A1A] overflow-hidden select-none">
      {/* Backdrop — closes the sidebar when tapped outside it on mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 top-14 bg-black/40 z-30 md:hidden"
        />
      )}

      {/* Sessions Left Sidebar */}
      <div className="relative flex h-full bg-[#F3F1ED] border-r border-[#E5E2DD] shrink-0">
        {/* Expand/Collapse Handle — sits centered on the sidebar's right edge */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          className="absolute top-1/2 -right-3 -translate-y-1/2 z-30 w-6 h-6 rounded-full bg-[#1A1A1A] hover:bg-[#2c2c2c] flex items-center justify-center shadow-md transition-colors"
        >
          {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5 text-white" /> : <ChevronRight className="w-3.5 h-3.5 text-white" />}
        </button>

        {/* Icon Rail — always visible */}
        <div className="w-12 flex flex-col items-center py-3 space-y-3 border-r border-[#E5E2DD] bg-[#EEEBE6] shrink-0">
          {sidebarOpen && (
            <button
              onClick={() => createSession(`Session ${sessions.length + 1}`)}
              title="New Chat Session"
              className="p-2 rounded-md bg-[#1A1A1A] text-white hover:bg-[#2c2c2c] transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sessions Drawer — slides in as an overlay on mobile, docks inline on desktop */}
        {sidebarOpen && (
          <div className="fixed md:static inset-y-0 top-14 md:top-auto left-12 md:left-auto z-40 md:z-auto w-64 h-[calc(100vh-3.5rem)] md:h-full flex flex-col overflow-y-auto bg-[#F3F1ED]">
            <div className="p-4 border-b border-[#E5E2DD] flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Sessions</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1 rounded-md bg-[#1A1A1A] text-white hover:bg-[#2c2c2c] transition-colors"
                title="Close Sessions"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  onClick={() => selectSession(sess.id)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start space-x-2 group relative cursor-pointer ${
                    activeSessionId === sess.id
                      ? 'bg-white text-[#1A1A1A] border border-[#E5E2DD] font-bold shadow-sm'
                      : 'text-[#666666] hover:bg-white/60 hover:text-[#1A1A1A]'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#1A1A1A]" />
                  <div className="truncate min-w-0 flex-1">
                    <div className="truncate font-medium pr-8">{sess.title}</div>
                    <div className="text-[10px] text-amber-700 mt-0.5">{getRelativeTime(sess.updatedAt)}</div>
                  </div>
                  {/* Rename & Delete — visible on hover */}
                  <div className="absolute top-1.5 right-1.5 flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newName = window.prompt('Rename session:', sess.title);
                        if (newName && newName.trim()) {
                          renameSession(sess.id, newName.trim());
                        }
                      }}
                      className="p-1 rounded hover:bg-[#E5E2DD] transition-colors"
                      title="Rename session"
                    >
                      <Edit3 className="w-3 h-3 text-[#666]" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (sessions.length <= 1) {
                          addToast('Cannot delete the last session', 'warning');
                          return;
                        }
                        if (window.confirm(`Delete session "${sess.title}"?`)) {
                          deleteSession(sess.id);
                        }
                      }}
                      className="p-1 rounded hover:bg-rose-100 transition-colors"
                      title="Delete session"
                    >
                      <Trash2 className="w-3 h-3 text-rose-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Transition Helper Footer */}
            <div className="p-3 border-t border-[#E5E2DD] bg-[#EEEBE6]/50">
              <button
                onClick={() => setViewMode('workspace')}
                className="w-full py-2 px-3 bg-[#1A1A1A] hover:bg-[#2c2c2c] text-white text-xs font-semibold rounded-md flex items-center justify-center space-x-1.5 transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Decision Canvas</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#F9F8F6] relative">
        {/* Banner Alert for Transition to Planning Workspace */}
        {contextSufficient && (
          <div className="bg-[#EEEBE6] border-b border-[#E5E2DD] px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#1A1A1A]">
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="font-medium">AI Reasoning Engine has synthesized initial architectural nodes into your graph canvas.</span>
            </div>
            <button
              onClick={() => setViewMode('workspace')}
              className="shrink-0 px-3 py-1 bg-[#1A1A1A] hover:bg-[#2c2c2c] text-white font-semibold rounded-md flex items-center space-x-1 transition-colors shadow-sm text-xs"
            >
              <span>Start Planning Workspace</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex space-x-3.5 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <AvatarBubble
                icon={msg.sender === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                size="md"
                bg={msg.sender === 'ai' ? 'bg-[#1A1A1A]' : 'bg-white'}
                textColor={msg.sender === 'ai' ? 'text-white' : 'text-[#1A1A1A]'}
                bordered
                className="text-xs"
              />

              {/* Message Content Bubble */}
              <div
                className={`flex-1 rounded-xl p-4 text-xs leading-relaxed border shadow-sm relative group ${
                  msg.sender === 'user'
                    ? 'bg-[#EEEBE6] border-[#E5E2DD] text-[#1A1A1A]'
                    : 'bg-white border-[#E5E2DD] text-[#1A1A1A]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 text-[10px] text-[#666666]">
                  <span className="font-bold text-[#1A1A1A]">{msg.sender === 'ai' ? 'AI Reasoner' : 'You'}</span>
                  <div className="flex items-center space-x-2">
                    <span>{msg.timestamp}</span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[#666666] hover:text-[#1A1A1A]"
                      title="Copy content"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Formatted Text — markdown for AI, plain for user */}
                {msg.sender === 'ai' ? (
                  <div
                    className="prose-xs text-xs leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                  />
                ) : (
                  <div className="whitespace-pre-wrap text-xs leading-relaxed">
                    {msg.content}
                  </div>
                )}

                {/* Interactive Action Pills if present */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#E5E2DD] flex flex-wrap gap-2">
                    {msg.suggestedActions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setViewMode('workspace');
                          addToast(`Executing action: ${act.label}`, 'info');
                        }}
                        className="px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#2c2c2c] text-white rounded-md text-[11px] font-semibold flex items-center space-x-1 transition-colors shadow-sm"
                      >
                        <span>{act.label}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing / Generating Indicator */}
          {isGenerating && (
            <div className="flex space-x-3.5 max-w-3xl">
              <AvatarBubble icon={<Bot className="w-4 h-4 animate-bounce" />} size="md" className="text-xs" />
              <div className="p-4 bg-white border border-[#E5E2DD] rounded-xl flex items-center space-x-2 text-xs text-[#1A1A1A] shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-serif italic font-bold">Evaluating decision pathways and updating graph structure...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Bar */}
        <div className="px-4 py-2 border-t border-[#E5E2DD] bg-[#F3F1ED] flex items-center space-x-2 overflow-x-auto">
          <span className="text-[10px] uppercase font-bold text-[#666666] shrink-0 tracking-wider">Prompts:</span>
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(prompt);
              }}
              className="px-2.5 py-1 bg-white hover:bg-[#EEEBE6] border border-[#E5E2DD] hover:border-[#1A1A1A] rounded-full text-xs text-[#1A1A1A] shrink-0 transition-colors shadow-sm font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Container */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-[#E5E2DD] bg-[#F3F1ED]">
          <div className="relative flex items-center bg-white border border-[#E5E2DD] focus-within:border-[#1A1A1A] rounded-xl p-2 transition-all shadow-sm">
            <button
              type="button"
              onClick={handleAttachment}
              className="p-2 text-[#666666] hover:text-[#1A1A1A] rounded-lg hover:bg-[#F3F1ED] transition-colors"
              title="Attach Architecture Document"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask AI Reasoner to evaluate trade-offs, add decision nodes, or analyze risks..."
              rows={1}
              className="flex-1 bg-transparent px-3 text-xs text-[#1A1A1A] placeholder-[#888888] focus:outline-none resize-none max-h-24"
            />

            <button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className="p-2 bg-[#1A1A1A] hover:bg-[#2c2c2c] disabled:opacity-40 text-white rounded-lg transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
