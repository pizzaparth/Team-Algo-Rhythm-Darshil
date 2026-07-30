// Author: Parth Pancholi

import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Play, Cpu } from 'lucide-react';

interface HeroProps {
  onStartReasoning: () => void;
  onExploreDemo: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartReasoning, onExploreDemo }) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24 bg-graph-grid">
      {/* Subtle Background Radial Glows */}
      <div className="pointer-events-none absolute -top-12 -right-12 w-80 h-80 bg-orange-400/10 blur-[120px] rounded-full" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 w-80 h-80 bg-blue-400/10 blur-[120px] rounded-full" />

      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left Column: Hero Content */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center gap-8">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3.5 py-1 bg-white border border-[#e5e5e5] rounded-full text-[11px] font-semibold tracking-wider text-[#737373] uppercase shadow-sm"
              >
                <Cpu className="h-3.5 w-3.5 text-[#171717]" />
                <span>AI Native Reasoning Workspace</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-[44px] sm:text-[56px] lg:text-[64px] font-serif leading-[1.05] tracking-tight text-[#111111]"
              >
                Think Visually.<br />
                Reason Together.<br />
                <span className="italic text-[#737373]">Plan Intelligently.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg text-[#525252] leading-relaxed max-w-[460px]"
              >
                StateGraph transforms complex conversations into interactive decision trees. Explore alternatives, expand strategies, and map your logic in real-time.
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4"
            >
              <button
                onClick={onStartReasoning}
                className="px-8 py-4 bg-[#171717] text-white text-sm font-medium rounded-xl hover:bg-black transition-all shadow-lg shadow-black/10 active:scale-95 flex items-center gap-2"
              >
                <span>Start Reasoning</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={onExploreDemo}
                className="px-8 py-4 bg-white border border-[#e5e5e5] text-[#404040] text-sm font-medium rounded-xl hover:bg-gray-50 transition-all shadow-sm active:scale-95 flex items-center gap-2"
              >
                <Play className="h-3.5 w-3.5 fill-current text-[#171717]" />
                <span>Explore Demo</span>
              </button>
            </motion.div>

            {/* Social Proof Row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-6 border-t border-[#e5e5e5]/60 space-y-3"
            >
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a3a3a3]">
                Trusted for high-stakes decisions
              </div>
              <div className="flex gap-6 opacity-40 grayscale font-sans">
                <div className="font-black text-base sm:text-lg tracking-tighter text-[#171717]">POLITICS</div>
                <div className="font-black text-base sm:text-lg tracking-tighter text-[#171717]">BIOTECH</div>
                <div className="font-black text-base sm:text-lg tracking-tighter text-[#171717]">CAPITAL</div>
                <div className="font-black text-base sm:text-lg tracking-tighter text-[#171717]">LEGAL</div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Clean Minimalism Interactive Visual Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="relative bg-white/60 border border-black/5 rounded-[32px] shadow-2xl backdrop-blur-md overflow-hidden flex flex-col min-h-[460px]">

              {/* Window Header */}
              <div className="h-12 border-b border-black/5 px-6 flex items-center justify-between bg-white/80">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="text-[11px] font-mono font-medium text-[#a3a3a3]">
                  decision_canvas_v1.graph
                </div>
                <div className="w-4 h-4 rounded border border-black/10 flex items-center justify-center text-[10px] text-[#737373]">
                  SG
                </div>
              </div>

              {/* Window Body: Clean Minimal Graph Nodes */}
              <div className="flex-1 relative p-6 bg-[#fafaf9]/50 bg-graph-grid min-h-[340px]">
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path
                    d="M 60 160 L 190 90 M 60 160 L 190 230 M 190 90 L 330 60 M 190 90 L 330 125"
                    stroke="#d4d4d4"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>

                {/* Root Query Node */}
                <div className="absolute top-[120px] left-[16px] sm:left-[24px] w-40 p-3.5 bg-[#171717] text-white rounded-xl shadow-xl z-10 transition-transform hover:scale-105">
                  <div className="text-[9px] font-mono text-slate-400 mb-1 tracking-wider uppercase">
                    ROOT QUERY
                  </div>
                  <div className="text-xs leading-snug font-medium">
                    Market Entry Strategy: EU Phase 1
                  </div>
                </div>

                {/* Proposal A Node */}
                <div className="absolute top-[50px] left-[180px] sm:left-[200px] w-40 p-3.5 bg-white border border-[#e5e5e5] rounded-xl shadow-md z-10 transition-transform hover:scale-105">
                  <div className="text-[9px] font-bold text-[#22c55e] mb-1 font-mono uppercase">
                    PROPOSAL A
                  </div>
                  <div className="text-xs text-[#525252] font-medium leading-tight">
                    Direct digital distribution focus
                  </div>
                </div>

                {/* Proposal B Node */}
                <div className="absolute top-[190px] left-[180px] sm:left-[200px] w-40 p-3.5 bg-white border border-[#e5e5e5] rounded-xl shadow-md opacity-70 z-10">
                  <div className="text-[9px] font-bold text-[#737373] mb-1 font-mono uppercase">
                    PROPOSAL B
                  </div>
                  <div className="text-xs text-[#525252] font-medium leading-tight">
                    Local partnership model
                  </div>
                </div>

                {/* Reasoning Node */}
                <div className="absolute top-[20px] left-[320px] sm:left-[350px] w-36 p-3 bg-blue-50/90 border border-blue-100 rounded-lg shadow-sm ring-2 ring-blue-500/20 z-10 hidden sm:block">
                  <div className="text-[9px] font-bold text-blue-600 font-mono mb-1">
                    REASONING
                  </div>
                  <div className="text-[11px] text-[#525252] leading-tight">
                    High scalability, lower initial OPEX cost
                  </div>
                </div>
              </div>

              {/* Bottom Prompt Bar Mockup */}
              <div className="p-4 bg-white border-t border-black/5 flex items-center justify-between gap-3">
                <div className="flex-1 h-10 bg-[#fafaf9] rounded-full border border-black/5 px-4 flex items-center gap-3">
                  <div className="w-2.5 h-2.5 border-2 border-[#a3a3a3] rounded-full" />
                  <span className="text-xs text-[#a3a3a3]">Ask follow-up query to expand reasoning tree...</span>
                </div>
                <button
                  onClick={onStartReasoning}
                  className="px-3.5 py-2 bg-[#171717] text-white text-[11px] font-semibold rounded-full hover:bg-black transition-colors shrink-0 shadow-sm"
                >
                  Expand Graph
                </button>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
