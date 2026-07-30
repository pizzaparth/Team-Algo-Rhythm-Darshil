// Author: Parth Pancholi

import React from 'react';

interface NavToggleButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  variant?: 'desktop' | 'mobile';
  hideLabelOnMobile?: boolean;
}

export const NavToggleButton: React.FC<NavToggleButtonProps> = ({
  active,
  onClick,
  icon,
  label,
  disabled = false,
  variant = 'desktop',
  hideLabelOnMobile = false,
}) => {
  const isDesktop = variant === 'desktop';

  const activeClasses = isDesktop
    ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-sm font-semibold'
    : 'bg-[#1A1A1A] text-white font-semibold';

  const inactiveClasses = disabled
    ? isDesktop
      ? 'border-transparent text-[#AAAAAA] cursor-not-allowed opacity-50'
      : 'text-[#AAAAAA] cursor-not-allowed opacity-50'
    : isDesktop
      ? 'border-transparent text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F3F1ED]'
      : 'text-[#666666] hover:bg-[#F3F1ED] hover:text-[#1A1A1A]';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${isDesktop ? 'px-3 py-1 rounded-full space-x-1.5 border' : 'px-3 py-2 rounded-lg space-x-2'} text-sm font-medium transition-all flex items-center ${
        active ? activeClasses : inactiveClasses
      }`}
    >
      {icon}
      <span className={hideLabelOnMobile ? 'hidden sm:inline' : ''}>{label}</span>
    </button>
  );
};
