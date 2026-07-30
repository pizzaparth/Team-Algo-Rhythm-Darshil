import React from 'react';
import { NavSection } from '../types';
import { Sparkles, GitBranch, MessageSquare, Compass, ArrowRight } from 'lucide-react';

interface NavbarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  onStartReasoning: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onSelectSection,
  onStartReasoning,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e5e5e5] bg-[#fafaf9]/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
        
        {/* Brand / Logo - Clean Minimalism Icon */}
        <button
          onClick={() => onSelectSection('overview')}
          className="group flex items-center gap-3 text-left focus:outline-none"
        >
          <div className="w-8 h-8 bg-[#171717] rounded-lg flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
            <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45"></div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg tracking-tight uppercase text-[#171717]">
              StateGraph
            </span>
            <span className="hidden sm:inline text-[10px] font-mono tracking-widest uppercase text-[#a3a3a3]">
              v1.0.42_STABLE
            </span>
          </div>
        </button>

        {/* Clean Stepper Style Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-[#737373]">
          <button
            onClick={() => onSelectSection('overview')}
            className={`flex items-center gap-2 transition-colors ${
              activeSection === 'overview'
                ? 'text-[#171717] font-semibold'
                : 'hover:text-[#171717]'
            }`}
          >
            <span
              className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] transition-all ${
                activeSection === 'overview'
                  ? 'bg-[#171717] text-white'
                  : 'border border-[#d4d4d4] text-[#737373]'
              }`}
            >
              1
            </span>
            <span>Discover</span>
          </button>

          <button
            onClick={() => onSelectSection('chat')}
            className={`flex items-center gap-2 transition-colors ${
              activeSection === 'chat'
                ? 'text-[#171717] font-semibold'
                : 'hover:text-[#171717]'
            }`}
          >
            <span
              className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] transition-all ${
                activeSection === 'chat'
                  ? 'bg-[#171717] text-white'
                  : 'border border-[#d4d4d4] text-[#737373]'
              }`}
            >
              2
            </span>
            <span>Reason</span>
          </button>

          <button
            onClick={() => onSelectSection('graph')}
            className={`flex items-center gap-2 transition-colors ${
              activeSection === 'graph'
                ? 'text-[#171717] font-semibold'
                : 'hover:text-[#171717]'
            }`}
          >
            <span
              className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] transition-all ${
                activeSection === 'graph'
                  ? 'bg-[#171717] text-white'
                  : 'border border-[#d4d4d4] text-[#737373]'
              }`}
            >
              3
            </span>
            <span>Explore</span>
          </button>
        </nav>

        {/* Primary Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onStartReasoning}
            className="px-5 py-2.5 bg-[#171717] text-white text-xs font-medium rounded-xl hover:bg-black transition-colors shadow-lg shadow-black/10 flex items-center gap-2 active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5 text-white" />
            <span>Start Reasoning</span>
          </button>
        </div>

      </div>

      {/* Mobile nav bar */}
      <div className="flex md:hidden border-t border-[#e5e5e5] bg-[#fafaf9] px-4 py-2 justify-around text-xs font-medium text-[#737373]">
        <button
          onClick={() => onSelectSection('overview')}
          className={`px-3 py-1.5 rounded-lg ${activeSection === 'overview' ? 'bg-[#171717] text-white' : 'hover:text-[#171717]'}`}
        >
          Discover
        </button>
        <button
          onClick={() => onSelectSection('chat')}
          className={`px-3 py-1.5 rounded-lg ${activeSection === 'chat' ? 'bg-[#171717] text-white' : 'hover:text-[#171717]'}`}
        >
          Reason
        </button>
        <button
          onClick={() => onSelectSection('graph')}
          className={`px-3 py-1.5 rounded-lg ${activeSection === 'graph' ? 'bg-[#171717] text-white' : 'hover:text-[#171717]'}`}
        >
          Explore
        </button>
      </div>
    </header>
  );
};
