import React from 'react';
import { motion } from 'motion/react';
import { WORKFLOW_STEPS } from './landingData';
import {
  MessageSquareText,
  HelpCircle,
  GitFork,
  Network,
  ZoomIn,
  Edit3,
  Columns,
  CheckCircle2
} from 'lucide-react';

const STEP_ICONS: Record<string, React.FC<{ className?: string }>> = {
  MessageSquareText,
  HelpCircle,
  GitFork,
  Network,
  ZoomIn,
  Edit3,
  Columns,
  CheckCircle2
};

export const WorkflowSection: React.FC = () => {
  return (
    <section className="relative py-20 bg-[#fafaf9] border-t border-[#e5e5e5]">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-[11px] font-mono font-semibold tracking-widest text-[#737373] uppercase mb-3 block">
            Step-by-Step User Guide
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#111111] tracking-tight mb-4">
            How to Use StateGraph
          </h2>
          <p className="text-[#525252] text-sm sm:text-base leading-relaxed">
            Follow this 8-step journey to convert fuzzy ideas into structured, evidence-backed decision trees.
          </p>
        </div>

        {/* 8-Step Animated Timeline Vertical Layout */}
        <div className="relative max-w-4xl mx-auto">

          {/* Central Vertical Timeline Connecting Line */}
          <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-0.5 bg-[#e5e5e5] -translate-x-1/2 hidden md:block" />

          <div className="space-y-12">
            {WORKFLOW_STEPS.map((stepItem, idx) => {
              const IconComponent = STEP_ICONS[stepItem.iconName] || MessageSquareText;
              const isEven = idx % 2 === 0;

              return (
                <motion.div
                  key={stepItem.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className={`relative flex flex-col md:flex-row items-center gap-6 ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >

                  {/* Step Card Content */}
                  <div className="w-full md:w-1/2">
                    <div className="group rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#171717]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono font-semibold text-[#171717] px-2.5 py-0.5 rounded bg-[#fafaf9] border border-[#e5e5e5]">
                          STEP 0{stepItem.step}
                        </span>
                        <span className="text-xs text-[#a3a3a3] font-mono">
                          Phase 0{Math.ceil(stepItem.step / 2)}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-[#111111] mb-1.5">
                        {stepItem.title}
                      </h3>
                      <p className="text-xs font-semibold text-[#171717] mb-2">
                        {stepItem.shortDesc}
                      </p>
                      <p className="text-xs text-[#525252] leading-relaxed">
                        {stepItem.fullDesc}
                      </p>
                    </div>
                  </div>

                  {/* Center Circle Node Marker */}
                  <div className="relative shrink-0 z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#171717] bg-white text-[#171717] shadow-sm">
                    <IconComponent className="h-5 w-5 text-[#171717]" />
                  </div>

                  {/* Spacer for 2-column alternating alignment */}
                  <div className="hidden md:block w-1/2" />

                </motion.div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
