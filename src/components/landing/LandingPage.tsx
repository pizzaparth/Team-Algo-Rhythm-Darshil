import React from 'react';
import { 
  BrainCircuit, ArrowRight, MessageSquare, Network, 
  Sparkles, ShieldCheck, Cpu, GitBranch, Layers, 
  BarChart3, Users, ChevronRight, Play, Folder
} from 'lucide-react';
import { useAppStore, useProjectStore } from '../../store/';

export const LandingPage: React.FC = () => {
  const { setViewMode, addToast } = useAppStore();
  const { projects, selectProject } = useProjectStore();

  const handleLaunchProject = (projectId: string) => {
    selectProject(projectId);
    setViewMode('chat'); // Always enter through chat first
    addToast('Launched workspace session', 'success');
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#F9F8F6] text-[#1A1A1A] overflow-y-auto">
      {/* Background Subtle Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EEEBE6] border border-[#E5E2DD] text-[#1A1A1A] text-xs font-bold uppercase tracking-widest mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#1A1A1A]" />
          <span>Next-Gen AI Decision Intelligence Engine</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl md:text-6xl font-serif italic font-bold tracking-tight text-[#1A1A1A] max-w-4xl leading-tight">
          Turn Complex Thinking into Interactive{' '}
          <span className="not-italic underline decoration-[#1A1A1A]/30">
            Decision Graphs
          </span>
        </h1>

        {/* Description */}
        <p className="mt-5 text-base md:text-lg text-[#666666] max-w-2xl leading-relaxed">
          Not just another chatbot. The AI Reasoning Workspace combines dynamic conversation, 
          infinite decision trees, multi-expert reasoning, and risk evaluation into a unified SaaS environment.
        </p>

        {/* Call to Actions */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setViewMode('chat')}
            className="px-6 py-3 rounded-full bg-[#1A1A1A] hover:bg-[#2c2c2c] text-white font-semibold text-sm shadow-lg flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Start AI Conversation</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {/* Interactive Workspace Preview Showcase Card */}
        <div className="mt-14 w-full max-w-5xl bg-white border border-[#E5E2DD] rounded-2xl shadow-xl p-4 md:p-6 text-left relative overflow-hidden group">
          {/* Window Mock Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E2DD]">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#1A1A1A]/20" />
              <div className="w-3 h-3 rounded-full bg-[#1A1A1A]/20" />
              <div className="w-3 h-3 rounded-full bg-[#1A1A1A]/20" />
              <span className="ml-2 text-xs text-[#666666] font-mono">ai-reasoning-workspace // Enterprise Modernization</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-[#1A1A1A] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Live Graph State</span>
            </div>
          </div>

          {/* Mock Visual Decision Tree Display */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#F9F8F6] rounded-xl border border-[#E5E2DD]">
              <div className="flex items-center justify-between text-xs text-[#1A1A1A] font-bold mb-1">
                <span>ROOT NODE</span>
                <span className="px-1.5 py-0.5 bg-[#EEEBE6] rounded text-[10px]">Depth 0</span>
              </div>
              <h4 className="text-sm font-serif italic font-bold text-[#1A1A1A]">Cloud Architecture Strategy</h4>
              <p className="text-xs text-[#666666] mt-1">Evaluates monolith vs microservices with Kafka event backbone.</p>
              <div className="mt-3 flex items-center space-x-2 text-[11px] text-emerald-700 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>98% Confidence • Approved</span>
              </div>
            </div>

            <div className="p-4 bg-[#F9F8F6] rounded-xl border border-[#E5E2DD]">
              <div className="flex items-center justify-between text-xs text-[#1A1A1A] font-bold mb-1">
                <span>BRANCH A</span>
                <span className="px-1.5 py-0.5 bg-[#EEEBE6] rounded text-[10px]">Depth 1</span>
              </div>
              <h4 className="text-sm font-serif italic font-bold text-[#1A1A1A]">Option A: Event-Driven Kafka</h4>
              <p className="text-xs text-[#666666] mt-1">High throughput (&gt;100k msg/sec) decoupling for core services.</p>
              <div className="mt-3 flex items-center space-x-2 text-[11px] text-blue-700 font-bold">
                <GitBranch className="w-3.5 h-3.5" />
                <span>92% Confidence • Evaluated</span>
              </div>
            </div>

            <div className="p-4 bg-[#F9F8F6] rounded-xl border border-[#E5E2DD]">
              <div className="flex items-center justify-between text-xs text-[#1A1A1A] font-bold mb-1">
                <span>BRANCH B</span>
                <span className="px-1.5 py-0.5 bg-[#EEEBE6] rounded text-[10px]">Depth 1</span>
              </div>
              <h4 className="text-sm font-serif italic font-bold text-[#1A1A1A]">Option B: Serverless Containers</h4>
              <p className="text-xs text-[#666666] mt-1">Cloud Run auto-scaling with zero-scale cost advantages.</p>
              <div className="mt-3 flex items-center space-x-2 text-[11px] text-emerald-700 font-bold">
                <Cpu className="w-3.5 h-3.5" />
                <span>88% Confidence • In Review</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Projects Section */}
      <section className="py-12 px-6 max-w-7xl mx-auto border-t border-[#E5E2DD]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-serif italic font-bold text-[#1A1A1A] flex items-center space-x-2">
              <Folder className="w-5 h-5 text-[#1A1A1A]" />
              <span>Recent Decision Projects</span>
            </h2>
            <p className="text-xs text-[#666666] mt-1">Pick up where you left off or launch a new reasoning tree.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {projects.map((p) => (
            <div
              key={p.id}
              onClick={() => handleLaunchProject(p.id)}
              className="p-5 bg-white hover:bg-[#EEEBE6]/50 border border-[#E5E2DD] hover:border-[#1A1A1A] rounded-xl transition-all cursor-pointer group flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="px-2 py-0.5 bg-[#EEEBE6] text-[#1A1A1A] rounded font-mono font-bold text-[10px]">
                    {p.category}
                  </span>
                  <span className="text-[#888888]">{p.updatedAt}</span>
                </div>
                <h3 className="text-sm font-serif italic font-bold text-[#1A1A1A] group-hover:underline transition-colors">
                  {p.name}
                </h3>
                <p className="text-xs text-[#666666] mt-2 line-clamp-2 leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#E5E2DD] flex items-center justify-between text-xs text-[#666666]">
                <span className="flex items-center space-x-1">
                  <Network className="w-3.5 h-3.5 text-[#1A1A1A]" />
                  <span>{p.nodeCount} decision nodes</span>
                </span>
                <span className="text-[#1A1A1A] font-bold flex items-center group-hover:translate-x-1 transition-transform">
                  Open Workspace <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Architectural Pillars / Features */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-[#E5E2DD]">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-serif italic font-bold text-[#1A1A1A]">
            Designed for High-Stakes Decision Making
          </h2>
          <p className="text-sm text-[#666666] mt-2 leading-relaxed">
            Blending the conversational speed of LLMs with the visual rigor of decision science.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-[#E5E2DD] rounded-xl space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-[#EEEBE6] flex items-center justify-center text-[#1A1A1A]">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif italic font-bold text-[#1A1A1A]">Infinite Decision Canvas</h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              Explore branching strategies visually with pan, zoom, custom node status, branch colors, and depth indicators.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E5E2DD] rounded-xl space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-[#EEEBE6] flex items-center justify-center text-[#1A1A1A]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif italic font-bold text-[#1A1A1A]">Multi-Expert & Evidence Panel</h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              Every node connects to real-world benchmarks, expert profile quotes, trade-offs, and risk metrics.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E5E2DD] rounded-xl space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-[#EEEBE6] flex items-center justify-center text-[#1A1A1A]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif italic font-bold text-[#1A1A1A]">Interactive AI Suggestions</h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              The AI reasoning engine continuously audits your decision trees to flag hidden risks and suggest sub-branches.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
