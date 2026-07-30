// Author: Parth Pancholi

import React from 'react';

interface SidebarEdgeToggleProps {
  side: 'left' | 'right';
  onClick: () => void;
  icon: React.ReactNode;
  title?: string;
}

export const SidebarEdgeToggle: React.FC<SidebarEdgeToggleProps> = ({ side, onClick, icon, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`absolute top-1/2 ${side === 'right' ? '-right-3' : '-left-3'} -translate-y-1/2 z-30 w-6 h-6 rounded-full bg-[#1A1A1A] hover:bg-[#2c2c2c] flex items-center justify-center shadow-md transition-colors`}
  >
    {icon}
  </button>
);
