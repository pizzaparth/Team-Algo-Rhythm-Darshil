// Author: Parth Pancholi

import React from 'react';

export const GraphSkeleton: React.FC = () => (
  <div className="w-full h-full bg-[#0b0f17] flex items-center justify-center p-8 animate-pulse">
    <div className="relative w-full max-w-4xl h-[500px] border border-[#1f293d]/50 rounded-xl p-6 flex flex-col justify-between bg-[#111827]/40">
      <div className="flex justify-center">
        <div className="w-64 h-24 bg-[#1f293d] rounded-xl border border-[#2b384e]" />
      </div>
      <div className="flex justify-around space-x-8">
        <div className="w-56 h-24 bg-[#1f293d] rounded-xl border border-[#2b384e]" />
        <div className="w-56 h-24 bg-[#1f293d] rounded-xl border border-[#2b384e]" />
      </div>
      <div className="flex justify-between space-x-4">
        <div className="w-48 h-20 bg-[#1f293d] rounded-xl border border-[#2b384e]" />
        <div className="w-48 h-20 bg-[#1f293d] rounded-xl border border-[#2b384e]" />
        <div className="w-48 h-20 bg-[#1f293d] rounded-xl border border-[#2b384e]" />
      </div>
    </div>
  </div>
);

export const ListSkeleton: React.FC = () => (
  <div className="space-y-3 p-4 animate-pulse">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="p-3 bg-[#161e2e] rounded-lg border border-[#1f293d] space-y-2">
        <div className="h-4 bg-[#2b384e] rounded w-3/4" />
        <div className="h-3 bg-[#1f293d] rounded w-1/2" />
      </div>
    ))}
  </div>
);

export const ChatSkeleton: React.FC = () => (
  <div className="p-6 space-y-6 animate-pulse">
    <div className="flex space-x-3">
      <div className="w-8 h-8 rounded-full bg-[#2b384e]" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[#2b384e] rounded w-1/4" />
        <div className="h-16 bg-[#161e2e] rounded-lg w-3/4" />
      </div>
    </div>
  </div>
);
