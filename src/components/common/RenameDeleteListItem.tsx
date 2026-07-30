// Author: Parth Pancholi

import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';

interface RenameDeleteListItemProps {
  selected: boolean;
  icon: React.ReactNode;
  title: string;
  updatedAt: string;
  onSelect: () => void;
  onRename: () => void;
  onDelete: () => void;
  /** Matches the three existing row styles: editor/chat's colored-border
   * card, the workspace sidebar's monochrome card, and chat's borderless
   * flat row. */
  variant?: 'bordered' | 'bordered-mono' | 'flat';
}

/**
 * Hover-reveal rename/delete list row shared by the editor's file list,
 * the chat sidebar's session list, and the workspace sidebar's session
 * list. The interaction pattern (click to select, hover-only actions,
 * stopPropagation on rename/delete) is identical across all three —
 * only the color/spacing tokens differ, picked via `variant`.
 */
export const RenameDeleteListItem: React.FC<RenameDeleteListItemProps> = ({
  selected,
  icon,
  title,
  updatedAt,
  onSelect,
  onRename,
  onDelete,
  variant = 'bordered',
}) => {
  const handleRename = (e: React.MouseEvent) => { e.stopPropagation(); onRename(); };
  const handleDelete = (e: React.MouseEvent) => { e.stopPropagation(); onDelete(); };

  if (variant === 'flat') {
    return (
      <div
        onClick={onSelect}
        className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start space-x-2 group relative cursor-pointer ${
          selected
            ? 'bg-white text-[#1A1A1A] border border-[#E5E2DD] font-bold shadow-sm'
            : 'text-[#666666] hover:bg-white/60 hover:text-[#1A1A1A]'
        }`}
      >
        {icon}
        <div className="truncate min-w-0 flex-1">
          <div className="truncate font-medium pr-8">{title}</div>
          <div className="text-[10px] text-amber-700 mt-0.5">{updatedAt}</div>
        </div>
        <div className="absolute top-1.5 right-1.5 flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={handleRename} className="p-1 rounded hover:bg-[#E5E2DD] transition-colors" title="Rename">
            <Edit3 className="w-3 h-3 text-[#666]" />
          </button>
          <button onClick={handleDelete} className="p-1 rounded hover:bg-rose-100 transition-colors" title="Delete">
            <Trash2 className="w-3 h-3 text-rose-500" />
          </button>
        </div>
      </div>
    );
  }

  const mono = variant === 'bordered-mono';

  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all group relative ${
        mono
          ? `bg-white text-black ${selected ? 'border-black shadow-sm font-semibold' : 'border-[#E5E2DD] hover:border-black/40'}`
          : selected
            ? 'bg-white border-[#1A1A1A] shadow-sm text-[#1A1A1A] font-semibold'
            : 'bg-white/60 border-[#E5E2DD] hover:border-[#1A1A1A]/40 text-[#1A1A1A]/80'
      }`}
    >
      <div className="flex items-start space-x-2">
        {icon}
        <div className="min-w-0 flex-1">
          <div className={`font-semibold truncate pr-10 ${mono ? 'text-black' : ''}`}>{title}</div>
          <div className={`text-[10px] mt-0.5 ${mono ? 'text-black' : 'text-amber-700'}`}>{updatedAt}</div>
        </div>
      </div>
      <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={handleRename} className="p-1 rounded hover:bg-[#E5E2DD] transition-colors" title="Rename">
          <Edit3 className={`w-3 h-3 ${mono ? 'text-black' : 'text-[#666]'}`} />
        </button>
        <button
          onClick={handleDelete}
          className={`p-1 rounded transition-colors ${mono ? 'hover:bg-[#E5E2DD]' : 'hover:bg-rose-100'}`}
          title="Delete"
        >
          <Trash2 className={`w-3 h-3 ${mono ? 'text-black' : 'text-rose-500'}`} />
        </button>
      </div>
    </div>
  );
};
