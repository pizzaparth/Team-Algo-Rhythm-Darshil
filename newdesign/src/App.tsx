import React, { useState } from 'react';
import { NavSection } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { HowItWorksTimeline } from './components/HowItWorksTimeline';
import { InteractiveCanvasDemo } from './components/InteractiveCanvasDemo';
import { CoreFeatures } from './components/CoreFeatures';
import { SupportedDomains } from './components/SupportedDomains';
import { WorkflowSection } from './components/WorkflowSection';
import { WorkspaceView } from './components/WorkspaceView';
import { Footer } from './components/Footer';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  const handleStartReasoning = () => {
    setActiveSection('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreDemo = () => {
    setActiveSection('overview');
    const demoElement = document.getElementById('demo');
    if (demoElement) {
      demoElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectDomainTopic = (topic: string) => {
    setSelectedTopic(topic);
    setActiveSection('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#171717] flex flex-col font-sans selection:bg-[#171717] selection:text-white">
      
      {/* Centered Clean Minimal Navbar */}
      <Navbar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        onStartReasoning={handleStartReasoning}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeSection === 'overview' ? (
          <>
            {/* Section 1: Hero */}
            <Hero
              onStartReasoning={handleStartReasoning}
              onExploreDemo={handleExploreDemo}
            />

            {/* Section 2: How StateGraph Works */}
            <HowItWorksTimeline />

            {/* Section 3: Miniature Interactive Canvas Demo */}
            <InteractiveCanvasDemo />

            {/* Section 4: Core Features */}
            <CoreFeatures />

            {/* Section 5: Supported Problem Domains */}
            <SupportedDomains onSelectDomainTopic={handleSelectDomainTopic} />

            {/* Section 6: How to Use StateGraph (8-Step Visual Timeline) */}
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
          </>
        ) : (
          /* Live Reasoning Workspace (Chat / Decision Graph Canvas) */
          <WorkspaceView
            activeSection={activeSection}
            onSelectSection={setActiveSection}
            initialTopic={selectedTopic}
          />
        )}
      </main>

      {/* Minimal Clean Footer */}
      <Footer />

    </div>
  );
}
