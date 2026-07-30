// Author: Parth Pancholi

import React from 'react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#e5e5e5] bg-white/50 backdrop-blur-md py-8 text-[11px] text-[#a3a3a3] font-medium tracking-wide uppercase">
      <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-6 px-6 lg:px-12">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="StateGraph" className="w-6 h-6 rounded-md object-cover" />
          <span className="text-xs font-bold text-[#171717] tracking-tight uppercase">
            StateGraph
          </span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-8">
          <a href="#docs" className="hover:text-[#171717] transition-colors">
            Documentation
          </a>
          <a href="#github" className="hover:text-[#171717] transition-colors">
            GitHub
          </a>
          <a href="#privacy" className="hover:text-[#171717] transition-colors">
            Privacy
          </a>
          <a href="#terms" className="hover:text-[#171717] transition-colors">
            Terms
          </a>
        </div>

        {/* Copyright */}
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} StateGraph Inc.</span>
          <span className="text-[#d4d4d4]">|</span>
          <span>Built for the future of reasoning.</span>
        </div>

      </div>
    </footer>
  );
};
