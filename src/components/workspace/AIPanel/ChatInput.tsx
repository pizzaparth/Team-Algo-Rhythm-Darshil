import React, { useState, useRef, useEffect } from 'react';
import { Send, Command, Loader2 } from 'lucide-react';
import { useChatStore } from '../../../store/';

/**
 * ChatInput — rich input with command detection and send button.
 * Detects command-like input (starting with known verbs) and shows
 * a visual hint. Supports Shift+Enter for newline, Enter to send.
 */
export const ChatInput: React.FC = () => {
  const { sendUserMessage, isGenerating } = useChatStore();
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Command detection — highlight when input starts with a known command verb
  const commandVerbs = ['expand', 'delete', 'rename', 'compare', 'focus', 'bookmark', 'collapse', 'duplicate', 'jump', 'undo', 'redo', 'fit', 'layout', 'create', 'add'];
  const firstWord = input.trim().split(/\s+/)[0]?.toLowerCase() ?? '';
  const isCommandLike = commandVerbs.includes(firstWord);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isGenerating) return;
    sendUserMessage(trimmed);
    setInput('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  return (
    <div className="border-t border-[#E5E2DD] p-3 bg-[#F3F1ED] shrink-0">
      {/* Command hint */}
      {isCommandLike && input.trim().length > 0 && (
        <div className="flex items-center space-x-1.5 mb-1.5 text-[10px] text-indigo-600 font-medium animate-in fade-in duration-100">
          <Command className="w-3 h-3" />
          <span>Command detected — will execute as graph operation</span>
        </div>
      )}

      <div className={`flex items-end space-x-2 bg-white rounded-lg border transition-colors shadow-sm ${
        isCommandLike && input.trim().length > 0
          ? 'border-indigo-400 ring-1 ring-indigo-200'
          : 'border-[#E5E2DD] focus-within:border-[#1A1A1A]'
      }`}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isGenerating ? 'AI is responding...' : 'Ask about this node, or type a command...'}
          disabled={isGenerating}
          rows={1}
          className="flex-1 px-3 py-2.5 text-xs text-[#1A1A1A] placeholder-[#888888] bg-transparent resize-none focus:outline-none disabled:opacity-50 max-h-[120px]"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isGenerating}
          className="p-2 m-1 rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#1A1A1A] hover:bg-[#2c2c2c] text-white shadow-sm"
          title="Send (Enter)"
        >
          {isGenerating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      <div className="text-[9px] text-[#aaa] mt-1.5 flex items-center justify-between">
        <span>Enter to send • Shift+Enter for new line</span>
        <span>Commands: expand, delete, rename, compare, focus</span>
      </div>
    </div>
  );
};
