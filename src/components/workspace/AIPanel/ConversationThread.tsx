// Author: Parth Pancholi

import React, { useRef, useEffect } from 'react';
import { Bot, User, Loader2, RefreshCw, Copy, Check } from 'lucide-react';
import { useChatStore, useAppStore } from '../../../store/';
import { renderMarkdown } from '../../../lib/markdownRenderer';



/**
 * ConversationThread — scrollable message list with streaming indicator.
 */
export const ConversationThread: React.FC = () => {
  const { messages, isGenerating } = useChatStore();
  const { addToast } = useAppStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="px-3 py-2 space-y-3">
      {messages.map(msg => (
        <div
          key={msg.id}
          className={`group flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`max-w-[90%] relative ${msg.sender === 'user' ? 'order-2' : ''}`}>
            {/* Avatar */}
            <div className="flex items-start space-x-2">
              {msg.sender === 'ai' && (
                <div className="w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div className={`rounded-lg p-2.5 text-[11px] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#1A1A1A] text-white rounded-br-sm'
                  : 'bg-white border border-[#E5E2DD] text-[#1A1A1A] rounded-bl-sm shadow-sm'
              }`}>
                {/* Message content with markdown */}
                <div
                  className="prose-xs"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                />

                {/* Streaming indicator */}
                {msg.isStreaming && (
                  <span className="inline-block w-1.5 h-3.5 bg-indigo-500 animate-pulse rounded-sm ml-0.5 align-middle" />
                )}

                {/* Follow-up action buttons */}
                {msg.suggestedActions && !msg.isStreaming && (
                  <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-[#E5E2DD]">
                    {msg.suggestedActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          // Actions will be handled by the AI panel orchestrator
                          addToast(`Action: ${action.label}`, 'info');
                        }}
                        className="px-2 py-1 bg-[#F3F1ED] hover:bg-[#E5E2DD] text-[10px] font-medium text-[#1A1A1A] rounded-md transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {msg.sender === 'user' && (
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>

            {/* Timestamp + copy */}
            <div className={`flex items-center space-x-2 mt-1 text-[9px] text-[#aaa] opacity-0 group-hover:opacity-100 transition-opacity ${
              msg.sender === 'user' ? 'justify-end mr-8' : 'ml-8'
            }`}>
              <span>{msg.timestamp}</span>
              <button
                onClick={() => handleCopy(msg.content, msg.id)}
                className="hover:text-[#1A1A1A] transition-colors"
                title="Copy message"
              >
                {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Typing indicator */}
      {isGenerating && (
        <div className="flex items-start space-x-2">
          <div className="w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center shrink-0">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="bg-white border border-[#E5E2DD] rounded-lg rounded-bl-sm p-2.5 shadow-sm">
            <div className="flex items-center space-x-1.5">
              <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
              <span className="text-[11px] text-[#888]">AI is thinking...</span>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
