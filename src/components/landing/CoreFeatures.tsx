import React from 'react';
import { motion } from 'motion/react';
import {
  BrainCircuit,
  Globe2,
  GitGraph,
  Scale,
  UserCheck,
  History,
  ArrowUpRight
} from 'lucide-react';

const FEATURES = [
  {
    icon: BrainCircuit,
    title: '🧠 AI Planning',
    shortTitle: 'AI Planning',
    tagline: 'Generate reasoning trees instead of dense paragraphs.',
    description: 'StateGraph parses multi-step problems directly into structured hypothesis hierarchies with explicit logical causality.',
  },
  {
    icon: Globe2,
    title: '🌐 Web Research',
    shortTitle: 'Web Research',
    tagline: 'Ground reasoning using trusted, live sources.',
    description: 'Every statement and claim links back to verifiable Web citations, market benchmarks, and empirical evidence.',
  },
  {
    icon: GitGraph,
    title: '🌳 Interactive Graph',
    shortTitle: 'Interactive Graph',
    tagline: 'Explore every branch visually with zero friction.',
    description: 'Pan, zoom, expand, and collapse logical paths. View confidence scores and risk metrics at a single glance.',
  },
  {
    icon: Scale,
    title: '⚖ Compare Strategies',
    shortTitle: 'Compare Strategies',
    tagline: 'Evaluate competing alternatives side by side.',
    description: 'Pitting Option A vs Option B across velocity, ROI, execution risk, and capital requirements in real-time matrixes.',
  },
  {
    icon: UserCheck,
    title: '✍ User + AI Collaboration',
    shortTitle: 'Human-in-the-Loop',
    tagline: 'Co-create and shape the decision graph.',
    description: 'Override AI assumptions, introduce domain-specific rules, inject custom nodes, and prompt sub-tree recalculations.',
  },
  {
    icon: History,
    title: '📚 Historical Analysis',
    shortTitle: 'Historical Precedents',
    tagline: 'Learn from similar past events and market patterns.',
    description: 'Correlate present strategic pivots with historical corporate, geopolitical, or scientific decision case studies.',
  }
];

export const CoreFeatures: React.FC = () => {
  return (
    <section className="relative py-20 bg-[#fafaf9] border-t border-[#e5e5e5]">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[11px] font-mono font-semibold tracking-widest text-[#737373] uppercase mb-3 block">
            Core Capabilities
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#111111] tracking-tight mb-4">
            Engineered for High-Stakes Decision Making
          </h2>
          <p className="text-[#525252] text-sm sm:text-base leading-relaxed">
            Eliminate cognitive overload and hallucinations with structural visual reasoning tools designed for founders, architects, and strategists.
          </p>
        </div>

        {/* Minimal Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.shortTitle}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -4 }}
                className="group relative rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#171717] hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Icon & Action Arrow */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e5e5e5] bg-[#fafaf9] text-[#171717] transition-colors duration-300 group-hover:bg-[#171717] group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-[#a3a3a3] transition-all duration-300 group-hover:text-[#171717] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>

                  {/* Feature Title & Tagline */}
                  <h3 className="text-lg font-semibold text-[#111111] tracking-tight mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#171717] mb-3">
                    {feature.tagline}
                  </p>
                  <p className="text-xs text-[#525252] leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Subtle Card Footer Indicator */}
                <div className="mt-6 pt-4 border-t border-[#e5e5e5] flex items-center justify-between text-[11px] text-[#737373] font-mono">
                  <span>StateGraph Module</span>
                  <span className="group-hover:text-[#171717] transition-colors font-semibold">ACTIVE</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
