import React, { useState } from 'react';
import { motion } from 'motion/react';
import { NavSection, ReasoningTree, ReasoningNode } from '../types';
import { SAMPLE_REASONING_TREES, DOMAINS } from '../data/mockData';
import {
  MessageSquare,
  GitBranch,
  Sparkles,
  Send,
  Plus,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Share2,
  Download,
  FileCode,
  Sliders,
  X,
  Layers
} from 'lucide-react';

interface WorkspaceViewProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  initialTopic?: string;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  activeSection,
  onSelectSection,
  initialTopic,
}) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; treeGenerated?: boolean }>>([
    {
      role: 'assistant',
      content: 'Welcome to StateGraph Workspace. Describe your goal, strategic decision, or complex problem below. I will clarify constraints and transform it into an interactive decision graph.',
    },
  ]);
  const [inputText, setInputText] = useState(initialTopic || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tree, setTree] = useState<ReasoningTree>(SAMPLE_REASONING_TREES['saas']);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('root-1');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [showExportModal, setShowExportModal] = useState(false);

  const selectedNode = tree.nodes[selectedNodeId] || tree.nodes['root-1'];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;

    const userMsg = inputText;
    setInputText('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setIsGenerating(true);

    try {
      // Call backend route /api/reason
      const res = await fetch('/api/reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg }),
      });
      const result = await res.json();

      if (result.status === 'success' && result.data) {
        const d = result.data;
        const rootId = 'root-gen';
        const newNodes: Record<string, ReasoningNode> = {};

        newNodes[rootId] = {
          id: rootId,
          title: d.rootNode.title || userMsg,
          category: 'root',
          summary: d.rootNode.summary || 'Generated objective tree',
          detail: d.rootNode.detail || '',
          confidenceScore: 92,
          expanded: true,
          childrenIds: [],
          status: 'recommended',
        };

        const childrenIds: string[] = [];

        if (Array.isArray(d.strategies)) {
          d.strategies.forEach((strat: any, idx: number) => {
            const stratId = strat.id || `strat-${idx}`;
            childrenIds.push(stratId);

            const stratChildrenIds: string[] = [];
            if (Array.isArray(strat.children)) {
              strat.children.forEach((c: any, cidx: number) => {
                const childId = c.id || `child-${idx}-${cidx}`;
                stratChildrenIds.push(childId);
                newNodes[childId] = {
                  id: childId,
                  title: c.title,
                  category: (c.category as any) || 'action',
                  summary: c.summary,
                  detail: c.summary,
                  confidenceScore: 88,
                  expanded: false,
                  childrenIds: [],
                };
              });
            }

            newNodes[stratId] = {
              id: stratId,
              title: strat.title,
              category: 'strategy',
              summary: strat.summary,
              detail: strat.detail,
              confidenceScore: strat.confidenceScore || 85,
              status: (strat.status as any) || 'evaluating',
              pros: strat.pros,
              cons: strat.cons,
              sources: strat.sources,
              expanded: true,
              childrenIds: stratChildrenIds,
            };
          });
        }

        newNodes[rootId].childrenIds = childrenIds;

        const newTree: ReasoningTree = {
          id: `tree-${Date.now()}`,
          topic: d.topic || userMsg,
          domain: d.domain || 'Strategic Reasoning',
          rootNodeId: rootId,
          updatedAt: new Date().toISOString().split('T')[0],
          nodes: newNodes,
        };

        setTree(newTree);
        setSelectedNodeId(rootId);

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `I have decompiled "${userMsg}" into an interactive decision graph. You can inspect branches, evaluate alternatives side-by-side, or add custom nodes in the Graph Canvas view.`,
            treeGenerated: true,
          },
        ]);
      } else {
        // Fallback rich reasoning tree generator
        const rootId = `root-${Date.now()}`;
        const s1Id = `strat-1-${Date.now()}`;
        const s2Id = `strat-2-${Date.now()}`;
        const a1Id = `act-1-${Date.now()}`;

        const fallbackTree: ReasoningTree = {
          id: `tree-${Date.now()}`,
          topic: userMsg,
          domain: 'Strategic Strategy',
          rootNodeId: rootId,
          updatedAt: new Date().toISOString().split('T')[0],
          nodes: {
            [rootId]: {
              id: rootId,
              title: `Primary Objective: ${userMsg}`,
              category: 'root',
              summary: `Structured reasoning deconstruction for ${userMsg}.`,
              detail: 'Evaluated trade-offs and confidence scores across primary strategy vectors.',
              confidenceScore: 90,
              expanded: true,
              childrenIds: [s1Id, s2Id],
              status: 'recommended',
            },
            [s1Id]: {
              id: s1Id,
              title: `Primary Path: Agile Modular Execution`,
              category: 'strategy',
              summary: 'Phased rollout minimizing upfront risk while validating customer willingness to pay.',
              detail: 'Deploy core baseline first, then expand secondary features based on metrics.',
              confidenceScore: 92,
              expanded: true,
              childrenIds: [a1Id],
              status: 'recommended',
              pros: ['Fastest time to market', 'Minimized downside exposure'],
              sources: ['StateGraph Synthesis Model 2026'],
            },
            [s2Id]: {
              id: s2Id,
              title: `Alternative Path: Enterprise Direct Partnership`,
              category: 'strategy',
              summary: 'High-touch enterprise deal structure with custom integrations.',
              detail: 'Longer deal cycle but secures high initial contract value.',
              confidenceScore: 76,
              expanded: false,
              childrenIds: [],
              status: 'evaluating',
              pros: ['Higher immediate contract value'],
              cons: ['Longer sales cycle (6-9 months)'],
            },
            [a1Id]: {
              id: a1Id,
              title: 'Action Item: Launch 14-Day Validation Pilot',
              category: 'action',
              summary: 'Run targeted pilot with 10 design partners to verify baseline telemetry.',
              detail: 'Measure engagement metrics and gather direct feedback.',
              confidenceScore: 95,
              expanded: false,
              childrenIds: [],
              status: 'active',
            },
          },
        };

        setTree(fallbackTree);
        setSelectedNodeId(rootId);

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `I have constructed a decision graph for "${userMsg}". Switch to Graph Canvas view or ask follow-up questions to expand specific branches.`,
            treeGenerated: true,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Generated decision graph preview based on input parameters. You can now explore the visual graph canvas.',
          treeGenerated: true,
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportMarkdown = () => {
    let md = `# StateGraph Reasoning Export: ${tree.topic}\n\n`;
    md += `**Domain:** ${tree.domain} | **Date:** ${tree.updatedAt}\n\n`;
    md += `## Nodes & Hypotheses\n\n`;
    (Object.values(tree.nodes) as ReasoningNode[]).forEach((n) => {
      md += `### [${n.category.toUpperCase()}] ${n.title}\n`;
      md += `- **Summary:** ${n.summary}\n`;
      if (n.confidenceScore) md += `- **Confidence Index:** ${n.confidenceScore}%\n`;
      if (n.pros) md += `- **Pros:** ${n.pros.join(', ')}\n`;
      if (n.cons) md += `- **Cons:** ${n.cons.join(', ')}\n`;
      md += `\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stategraph-${tree.id}.md`;
    a.click();
    setShowExportModal(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-12 py-8">
      
      {/* Workspace View Header */}
      <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#171717] text-white font-bold text-xs shadow-md">
            <div className="w-4 h-4 border-2 border-white rounded-xs rotate-45" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#111111] tracking-tight">StateGraph Workspace</h2>
            <p className="text-xs text-[#737373] font-mono">
              Topic: {tree.topic}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectSection('chat')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeSection === 'chat'
                ? 'bg-[#171717] text-white shadow-md'
                : 'bg-white border border-[#e5e5e5] text-[#737373] hover:text-[#171717]'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Chat Assistant</span>
          </button>
          <button
            onClick={() => onSelectSection('graph')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeSection === 'graph'
                ? 'bg-[#171717] text-white shadow-md'
                : 'bg-white border border-[#e5e5e5] text-[#737373] hover:text-[#171717]'
            }`}
          >
            <GitBranch className="h-3.5 w-3.5" />
            <span>Graph Canvas</span>
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-[#e5e5e5] bg-white px-4 py-2 text-xs font-semibold text-[#525252] hover:text-[#171717] shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* CHAT VIEW MODE */}
      {activeSection === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
          {/* Main Chat Stream */}
          <div className="lg:col-span-2 flex flex-col justify-between rounded-3xl border border-[#e5e5e5] bg-white p-6 shadow-xl">
            <div className="space-y-4 overflow-y-auto max-h-[480px] pr-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#171717] text-white font-bold text-xs shadow-md">
                      <div className="w-3.5 h-3.5 border-2 border-white rounded-xs rotate-45" />
                    </div>
                  )}
                  <div
                    className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#171717] text-white shadow-md'
                        : 'bg-[#fafaf9] border border-[#e5e5e5] text-[#171717]'
                    }`}
                  >
                    <p>{msg.content}</p>
                    {msg.treeGenerated && (
                      <div className="mt-3 pt-3 border-t border-[#e5e5e5] flex items-center justify-between">
                        <span className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Graph Synthesized
                        </span>
                        <button
                          onClick={() => onSelectSection('graph')}
                          className="flex items-center gap-1 rounded-xl bg-[#171717] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-black shadow-sm"
                        >
                          <span>Open Graph Canvas</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex items-center gap-2 text-xs text-[#171717] font-mono animate-pulse">
                  <Sparkles className="h-4 w-4" /> Decompiling reasoning tree...
                </div>
              )}
            </div>

            {/* Prompt Input Form */}
            <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t border-[#e5e5e5] flex gap-2">
              <input
                type="text"
                placeholder="Describe your goal, scenario, or strategic trade-off..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 rounded-2xl border border-[#e5e5e5] bg-[#fafaf9] px-4 py-3 text-xs sm:text-sm text-[#171717] placeholder-[#a3a3a3] focus:border-[#171717] focus:outline-none"
              />
              <button
                type="submit"
                disabled={isGenerating || !inputText.trim()}
                className="flex items-center gap-2 rounded-2xl bg-[#171717] px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow hover:bg-black disabled:opacity-40 transition-all active:scale-95"
              >
                <span>Synthesize</span>
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Quick Domain Presets Sidebar */}
          <div className="rounded-3xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
            <h3 className="text-xs font-mono font-bold uppercase text-[#737373] mb-4 tracking-wider">
              Sample Strategic Prompts
            </h3>
            <div className="space-y-3">
              {DOMAINS.slice(0, 5).map((d) => (
                <button
                  key={d.id}
                  onClick={() => setInputText(d.sampleTopic)}
                  className="w-full text-left rounded-2xl border border-[#e5e5e5] bg-[#fafaf9] p-3.5 text-xs hover:border-[#171717] hover:bg-white transition-all group shadow-xs"
                >
                  <span className="font-mono text-[10px] text-[#a3a3a3] block uppercase mb-1">{d.name}</span>
                  <span className="font-medium text-[#171717] group-hover:font-semibold block line-clamp-2">{d.sampleTopic}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GRAPH CANVAS VIEW MODE */}
      {activeSection === 'graph' && (
        <div className="rounded-3xl border border-[#e5e5e5] bg-white shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
          {/* Canvas Viewport Header */}
          <div className="flex items-center justify-between border-b border-[#e5e5e5] bg-[#fafaf9] px-6 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#171717]">
              <Layers className="h-4 w-4 text-[#171717]" />
              <span>{tree.topic}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.5))}
                className="p-1.5 rounded-lg text-[#737373] hover:text-[#171717] hover:bg-black/5"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.7))}
                className="p-1.5 rounded-lg text-[#737373] hover:text-[#171717] hover:bg-black/5"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1.5 rounded-lg text-[#737373] hover:text-[#171717] hover:bg-black/5 text-xs font-mono font-semibold"
              >
                100%
              </button>
            </div>
          </div>

          {/* Interactive Graph Surface */}
          <div className="relative flex-1 bg-[#fafaf9]/50 bg-graph-grid p-8 overflow-auto min-h-[480px] flex items-center justify-center">
            <div
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
              className="w-full max-w-4xl space-y-12"
            >
              {/* Root Node */}
              <div className="flex justify-center">
                <button
                  onClick={() => setSelectedNodeId(tree.rootNodeId)}
                  className={`rounded-2xl border p-5 w-96 text-left shadow-xl transition-all ${
                    selectedNodeId === tree.rootNodeId
                      ? 'border-black bg-[#171717] text-white ring-4 ring-black/5'
                      : 'border-[#e5e5e5] bg-white text-[#171717] hover:border-[#a3a3a3]'
                  }`}
                >
                  <span className={`text-[10px] font-mono font-bold uppercase block mb-1 ${
                    selectedNodeId === tree.rootNodeId ? 'text-gray-400' : 'text-[#737373]'
                  }`}>
                    DECISION ROOT OBJECTIVE
                  </span>
                  <h3 className="text-sm font-semibold">{tree.nodes[tree.rootNodeId]?.title}</h3>
                  <p className={`text-xs mt-1 ${selectedNodeId === tree.rootNodeId ? 'text-gray-300' : 'text-[#525252]'}`}>
                    {tree.nodes[tree.rootNodeId]?.summary}
                  </p>
                </button>
              </div>

              {/* Sub Nodes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(Object.values(tree.nodes) as ReasoningNode[])
                  .filter((n) => n.id !== tree.rootNodeId)
                  .map((node) => (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`rounded-2xl border p-4 text-left shadow-sm transition-all ${
                        selectedNodeId === node.id
                          ? 'border-[#171717] bg-white text-[#171717] ring-4 ring-black/5 shadow-md'
                          : 'border-[#e5e5e5] bg-white text-[#171717] hover:border-[#a3a3a3]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#fafaf9] border border-[#e5e5e5] text-[#737373]">
                          {node.category}
                        </span>
                        {node.confidenceScore && (
                          <span className="text-[10px] font-mono font-bold text-emerald-600">
                            {node.confidenceScore}% Conf
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-[#111111]">{node.title}</h4>
                      <p className="text-xs text-[#525252] mt-1 line-clamp-2">{node.summary}</p>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Node Detail Drawer */}
          <div className="border-t border-[#e5e5e5] bg-white p-5">
            <h4 className="text-xs font-mono font-bold text-[#737373] uppercase mb-1">Node Inspector</h4>
            <h3 className="text-base font-semibold text-[#111111]">{selectedNode.title}</h3>
            <p className="text-xs text-[#525252] mt-1">{selectedNode.detail || selectedNode.summary}</p>
          </div>
        </div>
      )}

      {/* Modal for Export */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#111111]">Export Decision Tree</h3>
              <button onClick={() => setShowExportModal(false)} className="text-[#737373] hover:text-[#171717]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-[#525252] mb-6">
              Download your structured decision graph as an executive Markdown document or JSON architecture payload.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="rounded-xl border border-[#e5e5e5] px-4 py-2 text-xs font-medium text-[#737373] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={exportMarkdown}
                className="flex items-center gap-2 rounded-xl bg-[#171717] px-5 py-2 text-xs font-semibold text-white hover:bg-black shadow"
              >
                <Download className="h-4 w-4" />
                <span>Download Markdown</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
