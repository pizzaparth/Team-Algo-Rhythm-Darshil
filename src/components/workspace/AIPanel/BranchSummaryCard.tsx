import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useGraphStore } from '../../../store/';

/**
 * BranchSummaryCard — shows a collapsible AI-generated summary
 * of the currently selected node's branch.
 */
export const BranchSummaryCard: React.FC = () => {
  const { nodes, edges, selectedNodeId } = useGraphStore();
  const [expanded, setExpanded] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  if (!selectedNode) return null;

  // Count branch nodes
  const countBranch = (): number => {
    const branchIds = new Set<string>([selectedNode.id]);
    let added = true;
    while (added) {
      added = false;
      edges.forEach(e => {
        if (branchIds.has(e.sourceId) && !branchIds.has(e.targetId)) {
          branchIds.add(e.targetId);
          added = true;
        }
      });
    }
    return branchIds.size;
  };

  const handleGenerateSummary = async () => {
    if (summary) {
      setExpanded(!expanded);
      return;
    }

    setLoading(true);
    setExpanded(true);

    try {
      const { assembleAIContext } = await import('../../../lib/aiContextAssembler');
      const { mockAIService } = await import('../../../lib/aiService');
      const context = assembleAIContext(null);
      const result = await mockAIService.summariseBranch(selectedNode.id, context);
      setSummary(result);
    } catch {
      setSummary('Unable to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const branchCount = countBranch();

  return (
    <div className="mx-3 my-2">
      <button
        onClick={handleGenerateSummary}
        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-[#E5E2DD] hover:border-[#ccc] rounded-lg text-[11px] font-medium text-[#1A1A1A] transition-colors shadow-sm"
      >
        <span className="flex items-center space-x-1.5">
          <FileText className="w-3.5 h-3.5 text-indigo-600" />
          <span>Branch Summary ({branchCount} nodes)</span>
        </span>
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
        ) : expanded ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>

      {expanded && summary && (
        <div className="mt-1.5 p-3 bg-white border border-[#E5E2DD] rounded-lg text-[11px] text-[#1A1A1A] leading-relaxed shadow-sm animate-in slide-in-from-top-1 duration-150 max-h-64 overflow-y-auto">
          <div
            dangerouslySetInnerHTML={{
              __html: summary
                .replace(/^## (.+)$/gm, '<h3 class="text-xs font-bold mt-2 mb-1">$1</h3>')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/^- (.+)$/gm, '<li class="ml-3 list-disc">$1</li>')
                .replace(/\n\n/g, '<br/><br/>')
                .replace(/\n/g, '<br/>')
            }}
          />
        </div>
      )}
    </div>
  );
};
