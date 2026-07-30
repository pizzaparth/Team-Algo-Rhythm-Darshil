// Author: Parth Pancholi

import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, X, Loader2, Bot, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAppStore, useGraphStore } from '../../store';
import type { GeneratedNode } from '../../types';
import { getMockedExpansion } from '../../lib/mockExpansion';
import { primaryButtonClasses } from '../../lib/uiClasses';

/**
 * ExpandNodeModal — Expansion preview workflow.
 *
 * Phase 2: Shows mocked AI-generated branches for user approval.
 * Phase 3: Same UX, but getMockedExpansion() is replaced with real Gemini call.
 *
 * Architecture:
 * 1. Opens → shows loading spinner (simulates AI thinking)
 * 2. Displays GeneratedNode[] preview cards
 * 3. User clicks "Add to Graph" → calls addGeneratedNodes() → auto-layout runs
 * 4. Cancel → nothing added
 */
export const ExpandNodeModal: React.FC = () => {
  const { activeModal, modalData, closeModal } = useAppStore();
  const { nodes, addGeneratedNodes } = useGraphStore();

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<GeneratedNode[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isOpen = activeModal === 'expand_node';
  const nodeId = modalData?.nodeId as string | undefined;
  const parentNode = nodes.find(n => n.id === nodeId);

  // Fetch preview data when modal opens
  useEffect(() => {
    if (!isOpen || !nodeId || !parentNode) return;

    setLoading(true);
    setPreview([]);
    setError(null);

    getMockedExpansion(nodeId, parentNode.data.internalType)
      .then(data => setPreview(data))
      .catch(() => setError('Failed to generate branches. Please try again.'))
      .finally(() => setLoading(false));
  }, [isOpen, nodeId]);

  const handleConfirm = () => {
    if (preview.length === 0) return;
    addGeneratedNodes(preview);
    closeModal();
  };

  if (!isOpen || !parentNode) return null;

  const riskColors = {
    Low: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    Medium: 'text-amber-600 bg-amber-50 border-amber-200',
    High: 'text-rose-600 bg-rose-50 border-rose-200',
    Critical: 'text-rose-800 bg-rose-100 border-rose-300',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E5E2DD] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-[#E5E2DD] bg-[#F9F8F6]">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#888888]">AI Expansion Preview</span>
            </div>
            <h2 className="text-sm font-serif italic font-bold text-[#1A1A1A] leading-tight max-w-md">
              Expanding: {parentNode.data.title}
            </h2>
            <p className="text-[11px] text-[#666666] mt-0.5">
              {loading ? 'AI is reasoning about this branch...' : `${preview.length} branches ready to add`}
            </p>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 text-[#888888] hover:text-[#1A1A1A] hover:bg-[#EEEBE6] rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <div className="text-xs text-[#666666] font-medium">Generating branches with AI reasoning...</div>
              <div className="text-[11px] text-[#888888] max-w-xs text-center">
                Analysing context, researching best practices, and preparing structured options.
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && preview.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-[11px] text-[#666666] mb-1">
                <Bot className="w-3.5 h-3.5 text-indigo-500" />
                <span>Review the proposed branches below and click "Add to Graph" to confirm.</span>
              </div>

              {preview.map((node, i) => (
                <div
                  key={node.tempId}
                  className="p-4 bg-white border border-[#E5E2DD] rounded-xl shadow-sm space-y-2 hover:border-[#1A1A1A] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-[#F3F1ED] border border-[#E5E2DD] rounded text-[#1A1A1A]">
                        {node.displayType}
                      </span>
                      <span className="text-[10px] text-[#888888]">Branch {i + 1}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${riskColors[node.riskFactor]}`}>
                        {node.riskFactor} Risk
                      </span>
                      <span className="text-[10px] font-mono text-[#888888]">{node.confidence}%</span>
                    </div>
                  </div>

                  <h4 className="text-xs font-serif italic font-bold text-[#1A1A1A] leading-snug">
                    {node.title}
                  </h4>

                  <p className="text-[11px] text-[#666666] leading-relaxed line-clamp-2">
                    {node.summary}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 mb-0.5">Pros</div>
                      {node.pros.slice(0, 2).map((p, j) => (
                        <div key={j} className="text-[10px] text-[#444444] flex items-start space-x-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{p}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-rose-600 mb-0.5">Cons</div>
                      {node.cons.slice(0, 2).map((c, j) => (
                        <div key={j} className="text-[10px] text-[#444444] flex items-start space-x-1">
                          <AlertTriangle className="w-2.5 h-2.5 text-rose-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E2DD] bg-[#F9F8F6] flex items-center justify-between">
          <div className="text-[11px] text-[#888888]">
            {!loading && preview.length > 0 && (
              <span>
                <span className="font-semibold text-[#1A1A1A]">{preview.length} branches</span> will be added to the right of this node
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 text-xs font-medium text-[#666666] bg-white border border-[#E5E2DD] hover:bg-[#F3F1ED] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || preview.length === 0}
              className={primaryButtonClasses('px-4 py-2 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center space-x-1.5 shadow-sm')}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Graph</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
