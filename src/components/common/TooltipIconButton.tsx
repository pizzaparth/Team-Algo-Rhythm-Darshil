// Author: Parth Pancholi

import React from 'react';

interface TooltipIconButtonProps {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  className: string;
  children: React.ReactNode;
}

/**
 * Wraps a button with an instant (no-delay) hover tooltip showing what the
 * button does — replaces the native `title` attribute, whose
 * browser-default hover delay is too slow for a dense icon toolbar.
 */
export const TooltipIconButton: React.FC<TooltipIconButtonProps> = ({ onClick, label, disabled, className, children }) => (
  <div className="relative group/tooltip">
    <button onClick={onClick} disabled={disabled} aria-label={label} className={className}>
      {children}
    </button>
    <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#1A1A1A] px-2 py-1 text-[10px] font-medium text-white opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-75 z-50">
      {label}
    </span>
  </div>
);
