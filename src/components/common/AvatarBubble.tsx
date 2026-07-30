// Author: Parth Pancholi

import React from 'react';

interface AvatarBubbleProps {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  bg?: string;
  textColor?: string;
  bordered?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-7 h-7',
};

export const AvatarBubble: React.FC<AvatarBubbleProps> = ({
  icon,
  size = 'sm',
  bg = 'bg-[#1A1A1A]',
  textColor = 'text-white',
  bordered = false,
  className = '',
}) => (
  <div
    className={`${SIZE_CLASSES[size]} rounded-full ${bg} ${textColor} flex items-center justify-center shrink-0 ${
      bordered ? 'border border-[#E5E2DD] shadow-sm' : ''
    } ${className}`}
  >
    {icon}
  </div>
);
