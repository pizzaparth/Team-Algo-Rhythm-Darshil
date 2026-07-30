// Author: Parth Pancholi

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DOMAINS } from './landingData';
import type { LandingDomainItem } from './landingTypes';
import { landingPrimaryButtonClasses } from '../../lib/uiClasses';
import {
  Building2,
  Code2,
  Sparkles,
  TrendingUp,
  Landmark,
  Briefcase,
  GraduationCap,
  Scale,
  HeartPulse,
  ArrowRight,
  Lightbulb
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Building2,
  Code2,
  Sparkles,
  TrendingUp,
  Landmark,
  Briefcase,
  GraduationCap,
  Scale,
  HeartPulse,
};

interface SupportedDomainsProps {
  onSelectDomainTopic: (topic: string) => void;
}

export const SupportedDomains: React.FC<SupportedDomainsProps> = ({ onSelectDomainTopic }) => {
  const [activeDomain, setActiveDomain] = useState<LandingDomainItem>(DOMAINS[0]);

  return (
    <section className="relative py-20 bg-[#fafaf9] border-t border-[#e5e5e5]">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-[11px] font-mono font-semibold tracking-widest text-[#737373] uppercase mb-3 block">
            Versatile Application Spectrum
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#111111] tracking-tight mb-4">
            Supported Problem Domains
          </h2>
          <p className="text-[#525252] text-sm sm:text-base leading-relaxed">
            From technical distributed systems to enterprise monetization pivots and public policy design.
          </p>
        </div>

        {/* Elegant Chips Flow Grid */}
        <div className="flex flex-wrap items-center justify-center gap-3 max-w-5xl mx-auto mb-12">
          {DOMAINS.map((domain) => {
            const IconComponent = ICON_MAP[domain.icon] || Lightbulb;
            const isSelected = activeDomain.id === domain.id;

            return (
              <motion.button
                key={domain.id}
                onClick={() => setActiveDomain(domain)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`group relative flex items-center gap-2.5 rounded-full px-5 py-2.5 text-xs sm:text-sm font-medium transition-all duration-300 border ${
                  isSelected
                    ? 'border-[#171717] bg-[#171717] text-white shadow-md'
                    : 'border-[#e5e5e5] bg-white text-[#525252] hover:border-[#171717] hover:text-[#171717]'
                }`}
              >
                <IconComponent className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-[#737373] group-hover:text-[#171717]'}`} />
                <span>{domain.name}</span>
                {isSelected && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Selected Domain Showcase Banner */}
        <div className="mx-auto max-w-3xl rounded-2xl border border-[#e5e5e5] bg-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#737373]">
                <Sparkles className="h-3.5 w-3.5 text-[#171717]" />
                <span>SAMPLE REASONING PROBLEM</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#111111]">
                {activeDomain.sampleTopic}
              </h3>
              <p className="text-xs text-[#525252]">
                {activeDomain.description}
              </p>
            </div>

            <button
              onClick={() => onSelectDomainTopic(activeDomain.sampleTopic)}
              className={landingPrimaryButtonClasses('shrink-0 flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold transition-all shadow')}
            >
              <span>Launch Canvas</span>
              <ArrowRight className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
