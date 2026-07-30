import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  MessageSquareText,
  Search,
  GitFork,
  Network,
  ZoomIn,
  Maximize2,
  Columns,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

const WORKFLOW_NODES = [
  { id: 'conversation', label: 'Conversation', icon: MessageSquareText, detail: 'Natural language input of your strategic prompt or goal.' },
  { id: 'research', label: 'Research', icon: Search, detail: 'Automated retrieval & grounding from trustworthy web sources.' },
  { id: 'planning', label: 'Planning', icon: GitFork, detail: 'Deconstructing objectives into structured sub-hypotheses.' },
  { id: 'graph', label: 'Interactive Decision Graph', icon: Network, detail: 'Instant synthesis of a multi-branch visual reasoning tree.' },
  { id: 'explore', label: 'Explore', icon: ZoomIn, detail: 'Pan, filter & inspect confidence scores and evidence grounds.' },
  { id: 'expand', label: 'Expand', icon: Maximize2, detail: 'Unfold deeper sub-trees or inject custom human constraints.' },
  { id: 'compare', label: 'Compare', icon: Columns, detail: 'Side-by-side strategy tradeoff evaluation & risk matrix.' },
  { id: 'action', label: 'Take Action', icon: CheckCircle2, detail: 'Export actionable execution roadmap or executive summary.' }
];

export const HowItWorksTimeline: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(3);

  return (
    <section className="relative py-20 bg-[#fafaf9] border-t border-[#e5e5e5]">
      <div className="mx-auto max-w-6xl px-6 lg:px-12">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[11px] font-mono font-semibold tracking-widest text-[#737373] uppercase mb-3 block">
            Architecture Sequence
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#111111] tracking-tight mb-4">
            How StateGraph Works
          </h2>
          <p className="text-[#525252] text-sm sm:text-base leading-relaxed">
            From raw conversation to an actionable decision matrix. StateGraph processes thought chains into an interconnected visual reasoning network.
          </p>
        </div>

        {/* Desktop Animated Pipeline Flow */}
        <div className="hidden lg:block relative mb-16">
          <div className="relative flex items-center justify-between gap-2 p-6 rounded-2xl bg-white border border-[#e5e5e5] shadow-sm">
            {/* Connecting Line */}
            <div className="absolute left-10 right-10 top-1/2 -z-0 h-0.5 bg-[#e5e5e5] -translate-y-1/2" />

            {/* Animated Progress Line */}
            <motion.div
              className="absolute left-10 top-1/2 -z-0 h-0.5 bg-[#171717] -translate-y-1/2"
              initial={{ width: '0%' }}
              animate={{ width: `${(activeStepIndex / (WORKFLOW_NODES.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />

            {WORKFLOW_NODES.map((item, idx) => {
              const Icon = item.icon;
              const isActive = idx === activeStepIndex;
              const isPassed = idx <= activeStepIndex;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveStepIndex(idx)}
                  className="relative z-10 flex flex-col items-center group focus:outline-none"
                >
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300 ${
                      isActive
                        ? 'border-[#171717] bg-[#171717] text-white shadow-md scale-110'
                        : isPassed
                        ? 'border-[#171717]/30 bg-gray-100 text-[#171717]'
                        : 'border-[#e5e5e5] bg-white text-[#737373] hover:border-[#a3a3a3] hover:text-[#171717]'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.div>

                  <span
                    className={`mt-3 text-[11px] font-medium tracking-tight transition-colors duration-200 ${
                      isActive ? 'text-[#171717] font-semibold' : 'text-[#737373] group-hover:text-[#171717]'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Step Inspector Card */}
        <div className="mx-auto max-w-2xl rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 bg-[#171717]" style={{ width: `${((activeStepIndex + 1) / WORKFLOW_NODES.length) * 100}%` }} />

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#e5e5e5] bg-[#fafaf9] text-[#171717]">
              {React.createElement(WORKFLOW_NODES[activeStepIndex].icon, { className: 'h-6 w-6' })}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-[#737373] font-medium">
                  STEP 0{activeStepIndex + 1} OF 08
                </span>
                <span className="text-xs text-[#a3a3a3] font-mono">
                  {activeStepIndex === 7 ? 'Execution Phase' : 'Processing Phase'}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-[#111111] mb-2">
                {WORKFLOW_NODES[activeStepIndex].label}
              </h3>
              <p className="text-sm text-[#525252] leading-relaxed">
                {WORKFLOW_NODES[activeStepIndex].detail}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-[#e5e5e5] pt-4">
            <button
              disabled={activeStepIndex === 0}
              onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
              className="text-xs font-medium text-[#737373] hover:text-[#171717] disabled:opacity-30 disabled:pointer-events-none"
            >
              ← Previous Step
            </button>
            <div className="flex gap-1.5">
              {WORKFLOW_NODES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStepIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeStepIndex ? 'w-6 bg-[#171717]' : 'w-1.5 bg-[#e5e5e5] hover:bg-[#a3a3a3]'
                  }`}
                />
              ))}
            </div>
            <button
              disabled={activeStepIndex === WORKFLOW_NODES.length - 1}
              onClick={() => setActiveStepIndex((prev) => Math.min(WORKFLOW_NODES.length - 1, prev + 1))}
              className="text-xs font-medium text-[#171717] hover:text-black flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none"
            >
              <span>Next Step</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Vertical Stepper Fallback */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:hidden gap-3 mt-12">
          {WORKFLOW_NODES.map((item, idx) => {
            const Icon = item.icon;
            const isActive = idx === activeStepIndex;
            return (
              <button
                key={item.id}
                onClick={() => setActiveStepIndex(idx)}
                className={`flex items-center gap-2.5 p-3 rounded-lg border text-left text-xs transition-all ${
                  isActive
                    ? 'border-[#171717] bg-[#171717] text-white'
                    : 'border-[#e5e5e5] bg-white text-[#525252]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 text-[#171717]" />
                <span className="truncate font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
