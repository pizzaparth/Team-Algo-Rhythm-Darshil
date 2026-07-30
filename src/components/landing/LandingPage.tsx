import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAppStore, useChatStore } from '../../store/';
import { Hero } from './Hero';
import { HowItWorksTimeline } from './HowItWorksTimeline';
import { InteractiveCanvasDemo } from './InteractiveCanvasDemo';
import { CoreFeatures } from './CoreFeatures';
import { SupportedDomains } from './SupportedDomains';
import { WorkflowSection } from './WorkflowSection';
import { LandingFooter } from './LandingFooter';

export const LandingPage: React.FC = () => {
  const { setViewMode, addToast } = useAppStore();
  const { sendUserMessage } = useChatStore();

  const handleStartReasoning = () => {
    setViewMode('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreDemo = () => {
    const demoElement = document.getElementById('demo');
    if (demoElement) {
      demoElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectDomainTopic = (topic: string) => {
    setViewMode('chat');
    sendUserMessage(topic);
    addToast('Launched reasoning session', 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="landing-root min-h-screen bg-[#fafaf9] text-[#171717] overflow-y-auto selection:bg-[#171717] selection:text-white">
      <Hero onStartReasoning={handleStartReasoning} onExploreDemo={handleExploreDemo} />

      <HowItWorksTimeline />

      <InteractiveCanvasDemo />

      <CoreFeatures />

      <SupportedDomains onSelectDomainTopic={handleSelectDomainTopic} />

      <WorkflowSection />

      {/* Final Bottom Call-to-Action Section */}
      <section className="relative py-28 bg-[#fafaf9] border-t border-[#e5e5e5] bg-graph-grid text-center overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/[0.08] blur-[100px]" />

        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-white px-3 py-1 text-[11px] font-semibold tracking-wider text-[#737373] uppercase shadow-sm mb-6">
            <Sparkles className="h-3.5 w-3.5 text-[#171717]" />
            <span>Ready to Reason Visually?</span>
          </span>

          <h2 className="text-4xl sm:text-6xl font-serif text-[#111111] tracking-tight mb-6">
            Transform Conversations into Actionable Decision Trees.
          </h2>

          <p className="text-[#525252] text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Join founders, engineers, and strategists using StateGraph to eliminate decision ambiguity.
          </p>

          <div className="flex justify-center">
            <button
              onClick={handleStartReasoning}
              className="group flex h-13 items-center justify-center gap-3 rounded-xl bg-[#171717] px-8 text-sm font-semibold text-white shadow-xl shadow-black/10 transition-all duration-200 hover:bg-black active:scale-95"
            >
              <Sparkles className="h-4 w-4 text-white transition-transform group-hover:rotate-12" />
              <span>Start Reasoning Now</span>
              <ArrowRight className="h-4 w-4 text-white transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};
