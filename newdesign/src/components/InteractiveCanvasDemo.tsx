import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SAMPLE_REASONING_TREES } from '../data/mockData';
import { ReasoningNode } from '../types';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Plus,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  X,
  Share2,
  SlidersHorizontal,
  ChevronDown,
  Layers
} from 'lucide-react';

export const InteractiveCanvasDemo: React.FC = () => {
  const [tree, setTree] = useState(SAMPLE_REASONING_TREES['saas']);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('root-1');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'root-1': true,
    'hypo-1': true,
    'hypo-2': true,
    'hypo-3': false,
  });
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNodeTitle, setNewNodeTitle] = useState('');
  const [newNodeCategory, setNewNodeCategory] = useState<ReasoningNode['category']>('strategy');

  const selectedNode = tree.nodes[selectedNodeId] || tree.nodes['root-1'];

  const toggleExpand = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.interactive-node')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeTitle.trim()) return;

    const newId = `user-node-${Date.now()}`;
    const parentId = selectedNodeId;

    const parentNode = tree.nodes[parentId];
    const updatedChildren = [...(parentNode.childrenIds || []), newId];

    const newNode: ReasoningNode = {
      id: newId,
      title: newNodeTitle,
      category: newNodeCategory,
      summary: 'User-created hypothesis branch for live evaluation.',
      detail: 'Added directly by user during interactive reasoning canvas exploration.',
      confidenceScore: 88,
      expanded: true,
      childrenIds: [],
      x: (parentNode.x || 0) + 120,
      y: (parentNode.y || 0) + 140,
      status: 'active'
    };

    setTree((prev) => ({
      ...prev,
      nodes: {
        ...prev.nodes,
        [parentId]: { ...parentNode, childrenIds: updatedChildren },
        [newId]: newNode,
      },
    }));

    setExpandedNodes((prev) => ({ ...prev, [parentId]: true }));
    setSelectedNodeId(newId);
    setNewNodeTitle('');
    setShowAddModal(false);
  };

  const getCategoryBadgeClass = (category: ReasoningNode['category']) => {
    switch (category) {
      case 'root':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'strategy':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'risk':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'action':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'tradeoff':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <section id="demo" className="relative py-20 bg-[#fafaf9] border-t border-[#e5e5e5]">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="text-[11px] font-mono font-semibold tracking-widest text-[#737373] uppercase mb-2 block">
              Miniature Canvas Environment
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif text-[#111111] tracking-tight">
              Interactive Reasoning Graph Preview
            </h2>
            <p className="text-[#525252] text-sm sm:text-base mt-2 max-w-xl">
              Experience StateGraph live. Pan, zoom, click nodes to expand sub-branches, and add your own custom reasoning nodes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-500/20 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Interactive Workspace
            </span>
          </div>
        </div>

        {/* Canvas Frame Container */}
        <div className="relative rounded-3xl border border-[#e5e5e5] bg-white shadow-2xl overflow-hidden min-h-[560px]">
          
          {/* Top Canvas Toolbar */}
          <div className="flex items-center justify-between border-b border-[#e5e5e5] bg-[#fafaf9]/90 px-6 py-3 backdrop-blur-md z-20 relative">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-[#171717] font-semibold">
                <Layers className="h-4 w-4 text-[#171717]" />
                <span className="truncate max-w-[200px] sm:max-w-none">{tree.topic}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
                title="Zoom In"
                className="p-1.5 rounded-lg text-[#737373] hover:text-[#171717] hover:bg-black/5"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.6))}
                title="Zoom Out"
                className="p-1.5 rounded-lg text-[#737373] hover:text-[#171717] hover:bg-black/5"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                onClick={resetView}
                title="Reset View"
                className="p-1.5 rounded-lg text-[#737373] hover:text-[#171717] hover:bg-black/5 text-xs font-mono flex items-center gap-1"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
              <div className="h-4 w-px bg-[#e5e5e5] mx-1" />
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-[#171717] px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-black transition-all active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Node</span>
              </button>
            </div>
          </div>

          {/* Graph View Area */}
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`relative h-[500px] w-full overflow-hidden bg-[#fafaf9]/50 bg-graph-grid cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
          >
            {/* Smooth Zoom & Pan Layer */}
            <div
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              }}
              className="absolute inset-0 flex items-center justify-center p-8 min-w-[900px]"
            >
              {/* SVG Connecting Edges */}
              <svg className="absolute inset-0 h-full w-full pointer-events-none stroke-[#d4d4d4]" strokeWidth="2">
                {/* Connections from root-1 to children */}
                {expandedNodes['root-1'] && (
                  <>
                    <path d="M 450 140 L 220 250" fill="none" strokeDasharray="3 3" />
                    <path d="M 450 140 L 450 250" fill="none" stroke="rgba(16,185,129,0.5)" strokeWidth="2.5" />
                    <path d="M 450 140 L 680 250" fill="none" strokeDasharray="3 3" />
                  </>
                )}

                {/* Connections from hypo-1 */}
                {expandedNodes['hypo-1'] && (
                  <>
                    <path d="M 220 310 L 140 400" fill="none" stroke="rgba(245,158,11,0.4)" />
                    <path d="M 220 310 L 260 400" fill="none" stroke="rgba(59,130,246,0.4)" />
                  </>
                )}

                {/* Connections from hypo-2 */}
                {expandedNodes['hypo-2'] && (
                  <>
                    <path d="M 450 310 L 390 400" fill="none" stroke="rgba(168,85,247,0.4)" />
                    <path d="M 450 310 L 510 400" fill="none" stroke="rgba(59,130,246,0.4)" />
                  </>
                )}

                {/* Connections to custom user added nodes */}
                {(Object.values(tree.nodes) as ReasoningNode[])
                  .filter((n) => n.id.startsWith('user-node-'))
                  .map((unode) => (
                    <path
                      key={`edge-${unode.id}`}
                      d={`M 450 310 L ${450 + (unode.x || 0)} ${310 + (unode.y || 0)}`}
                      fill="none"
                      stroke="rgba(99,102,241,0.6)"
                      strokeDasharray="4 4"
                    />
                  ))}
              </svg>

              {/* Node Rendering Layout */}
              <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center gap-12">
                
                {/* ROOT NODE */}
                <div className="interactive-node relative">
                  <button
                    onClick={() => setSelectedNodeId('root-1')}
                    className={`group flex items-center gap-3 rounded-xl border p-4 shadow-xl transition-all duration-200 text-left w-80 bg-[#12121c] ${
                      selectedNodeId === 'root-1'
                        ? 'border-indigo-400 ring-2 ring-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.25)]'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 font-bold">
                      G
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold block">
                        OBJECTIVE
                      </span>
                      <h4 className="text-xs font-semibold text-white truncate">
                        {tree.nodes['root-1'].title}
                      </h4>
                    </div>
                    <button
                      onClick={(e) => toggleExpand('root-1', e)}
                      className="p-1 rounded bg-white/5 text-slate-400 hover:text-white text-[10px] font-mono"
                    >
                      {expandedNodes['root-1'] ? '−' : '+'}
                    </button>
                  </button>
                </div>

                {/* LEVEL 1: HYPOTHESES / STRATEGIES */}
                {expandedNodes['root-1'] && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    
                    {/* Strategy A */}
                    <div className="interactive-node flex flex-col items-center">
                      <button
                        onClick={() => setSelectedNodeId('hypo-1')}
                        className={`group rounded-xl border p-3.5 shadow-lg transition-all duration-200 text-left w-full bg-[#12121c] ${
                          selectedNodeId === 'hypo-1'
                            ? 'border-indigo-400 ring-2 ring-indigo-500/30'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-slate-800 text-slate-300">
                            STRATEGY A
                          </span>
                          <span className="text-[10px] font-mono text-amber-400 font-semibold">
                            78% Conf
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-100 line-clamp-2">
                          {tree.nodes['hypo-1'].title}
                        </h4>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                          <span>2 Sub-branches</span>
                          <button
                            onClick={(e) => toggleExpand('hypo-1', e)}
                            className="text-indigo-400 hover:underline"
                          >
                            {expandedNodes['hypo-1'] ? 'Collapse' : 'Expand'}
                          </button>
                        </div>
                      </button>

                      {/* Sub-branches for Hypo 1 */}
                      {expandedNodes['hypo-1'] && (
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => setSelectedNodeId('risk-1')}
                            className={`p-2 rounded-lg border text-[10px] text-left w-28 bg-[#161214] ${
                              selectedNodeId === 'risk-1' ? 'border-amber-400' : 'border-amber-500/20 text-amber-200'
                            }`}
                          >
                            <span className="text-[8px] font-mono text-amber-400 block uppercase">RISK</span>
                            <span className="truncate block">Bill Shock</span>
                          </button>
                          <button
                            onClick={() => setSelectedNodeId('action-1')}
                            className={`p-2 rounded-lg border text-[10px] text-left w-28 bg-[#121618] ${
                              selectedNodeId === 'action-1' ? 'border-blue-400' : 'border-blue-500/20 text-blue-200'
                            }`}
                          >
                            <span className="text-[8px] font-mono text-blue-400 block uppercase">ACTION</span>
                            <span className="truncate block">Closed Beta</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Strategy B (RECOMMENDED) */}
                    <div className="interactive-node flex flex-col items-center">
                      <button
                        onClick={() => setSelectedNodeId('hypo-2')}
                        className={`group rounded-xl border p-3.5 shadow-xl transition-all duration-200 text-left w-full bg-[#121818] ${
                          selectedNodeId === 'hypo-2'
                            ? 'border-emerald-400 ring-2 ring-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                            : 'border-emerald-500/30 hover:border-emerald-400/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            RECOMMENDED
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                            94% Conf
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-emerald-100 line-clamp-2">
                          {tree.nodes['hypo-2'].title}
                        </h4>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="text-emerald-400 font-medium">+34% ARR Delta</span>
                          <button
                            onClick={(e) => toggleExpand('hypo-2', e)}
                            className="text-emerald-400 hover:underline"
                          >
                            {expandedNodes['hypo-2'] ? 'Collapse' : 'Expand'}
                          </button>
                        </div>
                      </button>

                      {/* Sub-branches for Hypo 2 */}
                      {expandedNodes['hypo-2'] && (
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => setSelectedNodeId('tradeoff-1')}
                            className={`p-2 rounded-lg border text-[10px] text-left w-28 bg-[#16121a] ${
                              selectedNodeId === 'tradeoff-1' ? 'border-purple-400' : 'border-purple-500/20 text-purple-200'
                            }`}
                          >
                            <span className="text-[8px] font-mono text-purple-400 block uppercase">TRADEOFF</span>
                            <span className="truncate block">Metering Lift</span>
                          </button>
                          <button
                            onClick={() => setSelectedNodeId('action-2')}
                            className={`p-2 rounded-lg border text-[10px] text-left w-28 bg-[#121618] ${
                              selectedNodeId === 'action-2' ? 'border-blue-400' : 'border-blue-500/20 text-blue-200'
                            }`}
                          >
                            <span className="text-[8px] font-mono text-blue-400 block uppercase">ACTION</span>
                            <span className="truncate block">Telemetry Dash</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Strategy C */}
                    <div className="interactive-node flex flex-col items-center">
                      <button
                        onClick={() => setSelectedNodeId('hypo-3')}
                        className={`group rounded-xl border p-3.5 shadow-lg transition-all duration-200 text-left w-full bg-[#12121c] opacity-75 hover:opacity-100 ${
                          selectedNodeId === 'hypo-3'
                            ? 'border-indigo-400 ring-2 ring-indigo-500/30'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-slate-800 text-slate-400">
                            STRATEGY C
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            65% Conf
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-300 line-clamp-2">
                          {tree.nodes['hypo-3'].title}
                        </h4>
                        <div className="mt-2 text-[10px] text-slate-500 font-mono">
                          Archived option
                        </div>
                      </button>
                    </div>

                  </div>
                )}

                {/* User Created Custom Nodes */}
                {(Object.values(tree.nodes) as ReasoningNode[])
                  .filter((n) => n.id.startsWith('user-node-'))
                  .map((unode) => (
                    <div key={unode.id} className="interactive-node animate-fade-in">
                      <button
                        onClick={() => setSelectedNodeId(unode.id)}
                        className={`p-3 rounded-xl border text-xs text-left w-64 bg-indigo-950/40 ${
                          selectedNodeId === unode.id ? 'border-indigo-400 ring-2 ring-indigo-500' : 'border-indigo-500/30 text-indigo-200'
                        }`}
                      >
                        <span className="text-[9px] font-mono text-indigo-300 uppercase block mb-1">
                          USER CUSTOM NODE
                        </span>
                        <h5 className="font-semibold text-white truncate">{unode.title}</h5>
                        <p className="text-[11px] text-indigo-200/80 mt-1">{unode.summary}</p>
                      </button>
                    </div>
                  ))}

              </div>
            </div>
          </div>

          {/* Bottom Inspector Drawer for Selected Node */}
          <div className="border-t border-white/[0.08] bg-[#11111a] p-4 sm:p-5 z-20 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded text-xs font-mono uppercase border ${getCategoryBadgeClass(selectedNode.category)}`}>
                  {selectedNode.category}
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-white">
                    {selectedNode.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedNode.summary}
                  </p>
                </div>
              </div>

              {selectedNode.confidenceScore !== undefined && (
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Confidence Index</span>
                    <span className="text-sm font-semibold text-indigo-300 font-mono">
                      {selectedNode.confidenceScore}%
                    </span>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10"
                  >
                    <Plus className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Branch Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Pros / Cons / Sources if available */}
            {(selectedNode.pros || selectedNode.sources) && (
              <div className="mt-4 pt-3 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {selectedNode.pros && (
                  <div className="flex items-start gap-2 text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                    <span><strong>Key Advantage:</strong> {selectedNode.pros.join(', ')}</span>
                  </div>
                )}
                {selectedNode.sources && (
                  <div className="flex items-start gap-2 text-slate-400">
                    <FileText className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
                    <span><strong>Research Grounding:</strong> {selectedNode.sources.join(', ')}</span>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Modal for Adding Node */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#12121a] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Add Custom Reasoning Node</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddNode} className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Node Title / Hypothesis</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Introduce Enterprise SLA Add-on"
                    value={newNodeTitle}
                    onChange={(e) => setNewNodeTitle(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Category Type</label>
                  <select
                    value={newNodeCategory}
                    onChange={(e) => setNewNodeCategory(e.target.value as any)}
                    className="w-full rounded-lg border border-white/10 bg-[#181824] px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="strategy">Strategy</option>
                    <option value="hypothesis">Hypothesis</option>
                    <option value="action">Action Plan</option>
                    <option value="risk">Risk Factor</option>
                    <option value="tradeoff">Trade-off</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-slate-400 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow"
                  >
                    Create Node
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
