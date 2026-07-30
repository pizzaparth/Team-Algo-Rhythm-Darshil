import React, { useState } from 'react';
import { HelpCircle, Send, SkipForward, ChevronDown, ChevronUp } from 'lucide-react';
import { useSessionStore, useChatStore } from '../../../store/';

/**
 * AIQuestionCard — appears in the conversation thread when the AI
 * needs clarification before proceeding with an operation.
 *
 * Per PRD FR-7.6: "AI asks clarifying questions in the panel, graph waits"
 */
export const AIQuestionCard: React.FC = () => {
  const { pendingQuestion, answerQuestion, setConversationMode, setPendingQuestion, pendingExpansionNodeId } = useSessionStore();
  const { sendUserMessage, addAIMessage } = useChatStore();
  const [answer, setAnswer] = useState('');
  const [showContext, setShowContext] = useState(false);

  if (!pendingQuestion) return null;

  const handleSubmitAnswer = () => {
    const trimmed = answer.trim();
    if (!trimmed) return;

    // Record the answer in conversation
    answerQuestion(trimmed);

    // Send the answer through the chat pipeline to resume AI
    sendUserMessage(trimmed);

    setAnswer('');
  };

  const handleSelectOption = (option: string) => {
    answerQuestion(option);
    sendUserMessage(option);
    setAnswer('');
  };

  const handleSkip = () => {
    setPendingQuestion(null);
    setConversationMode('chat');
    addAIMessage('Question skipped. You can expand the node again when ready, or I can proceed with default assumptions.');
  };

  return (
    <div className="mx-3 my-2 p-3 bg-amber-50 border border-amber-200 rounded-lg shadow-sm space-y-2 animate-in slide-in-from-bottom-2 duration-200">
      {/* Question header */}
      <div className="flex items-start space-x-2">
        <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
            Clarification Needed
          </div>
          <div
            className="text-[11px] text-[#1A1A1A] leading-relaxed mt-1 font-medium"
            dangerouslySetInnerHTML={{
              __html: pendingQuestion.question
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br/>')
            }}
          />
        </div>
      </div>

      {/* Context toggle */}
      {pendingQuestion.context && (
        <div>
          <button
            onClick={() => setShowContext(!showContext)}
            className="flex items-center space-x-1 text-[10px] text-amber-600 hover:text-amber-800 transition-colors"
          >
            {showContext ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <span>{showContext ? 'Hide context' : 'Show context'}</span>
          </button>
          {showContext && (
            <div
              className="mt-1 p-2 bg-white/60 rounded text-[10px] text-[#666] leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: pendingQuestion.context
                  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n/g, '<br/>')
              }}
            />
          )}
        </div>
      )}

      {/* Option buttons (if multiple choice) */}
      {pendingQuestion.options && pendingQuestion.options.length > 0 && (
        <div className="space-y-1.5">
          {pendingQuestion.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelectOption(opt)}
              className="w-full text-left px-3 py-2 bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-50 rounded-md text-[11px] text-[#1A1A1A] font-medium transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* Free-text answer input */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer()}
          placeholder="Or type your answer..."
          className="flex-1 px-2.5 py-1.5 bg-white border border-amber-200 focus:border-amber-400 rounded-md text-xs text-[#1A1A1A] placeholder-[#aaa] focus:outline-none"
        />
        <button
          onClick={handleSubmitAnswer}
          disabled={!answer.trim()}
          className="p-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-md transition-colors disabled:opacity-30"
          title="Submit answer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleSkip}
          className="p-1.5 bg-[#EEEBE6] hover:bg-[#E5E2DD] text-[#666] rounded-md transition-colors"
          title="Skip question"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
