import React, { useRef } from 'react';
import {
  Crosshair, Keyboard, Info,
  ChevronRight, Bot, User
} from 'lucide-react';

const shortcutGroups = [
  {
    label: 'Navigation',
    items: [
      { key: 'F', desc: 'Fit to view' },
      { key: 'Ctrl+.', desc: 'Center on selected' },
      { key: 'Escape', desc: 'Deselect / close' },
      { key: 'Ctrl+K', desc: 'Search nodes' },
    ],
  },
  {
    label: 'Node Actions',
    items: [
      { key: 'E', desc: 'Expand selected node' },
      { key: 'X', desc: 'Collapse / expand subtree' },
      { key: 'B', desc: 'Bookmark node' },
      { key: 'Delete', desc: 'Delete (with confirm)' },
    ],
  },
  {
    label: 'Edit',
    items: [
      { key: 'Ctrl+D', desc: 'Duplicate node' },
      { key: 'Ctrl+C', desc: 'Copy node' },
      { key: 'Ctrl+V', desc: 'Paste node' },
      { key: 'Ctrl+Z', desc: 'Undo' },
      { key: 'Ctrl+⇧+Z', desc: 'Redo' },
    ],
  },
];

export const CanvasControls: React.FC = () => {
  const [showShortcuts, setShowShortcuts] = React.useState(false);

  return (
    <>
      {/* Main Controls — bottom-left above ReactFlow controls */}
      <div className="absolute bottom-16 left-4 z-20 flex flex-col space-y-1.5">
        {/* Keyboard Shortcuts Legend */}
        <button
          onClick={() => setShowShortcuts(v => !v)}
          title="Keyboard Shortcuts"
          className="p-1.5 bg-white/90 backdrop-blur-sm border border-[#E5E2DD] rounded-lg shadow-sm text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F3F1ED] transition-colors"
        >
          <Keyboard className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Node Legend — bottom-right */}
      <div className="absolute bottom-16 right-4 z-20 bg-white/90 backdrop-blur-sm border border-[#E5E2DD] rounded-lg p-2 shadow-sm space-y-1">
        <p className="text-[9px] uppercase font-bold tracking-widest text-[#888888]">Legend</p>
        <div className="flex items-center space-x-1.5 text-[10px] text-[#666666]">
          <Bot className="w-3 h-3 text-indigo-500" />
          <span>AI Created</span>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] text-[#666666]">
          <User className="w-3 h-3 text-emerald-600" />
          <span>User Created</span>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] text-[#666666]">
          <span className="w-3 h-1 rounded" style={{ background: '#6366f1' }} />
          <span>Root</span>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] text-[#666666]">
          <span className="w-3 h-1 rounded" style={{ background: '#3b82f6' }} />
          <span>Strategy</span>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] text-[#666666]">
          <span className="w-3 h-1 rounded" style={{ background: '#10b981' }} />
          <span>Alternative</span>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] text-[#666666]">
          <span className="w-3 h-1 rounded" style={{ background: '#ef4444' }} />
          <span>Risk</span>
        </div>
      </div>

      {/* Shortcuts Panel (toggleable) */}
      {showShortcuts && (
        <div className="absolute bottom-48 left-4 z-30 w-64 bg-white border border-[#E5E2DD] rounded-xl shadow-xl p-3 text-[11px] animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#E5E2DD]">
            <span className="font-bold text-[#1A1A1A] text-xs flex items-center">
              <Keyboard className="w-3.5 h-3.5 mr-1.5" /> Keyboard Shortcuts
            </span>
            <button onClick={() => setShowShortcuts(false)} className="text-[#888888] hover:text-[#1A1A1A] font-bold">✕</button>
          </div>

          {shortcutGroups.map(group => (
            <div key={group.label} className="mb-2.5">
              <p className="text-[9px] uppercase font-bold tracking-widest text-[#888888] mb-1">{group.label}</p>
              {group.items.map(item => (
                <div key={item.key} className="flex items-center justify-between py-0.5">
                  <span className="text-[#666666]">{item.desc}</span>
                  <kbd className="px-1.5 py-0.5 bg-[#F3F1ED] border border-[#E5E2DD] rounded text-[9px] font-mono text-[#1A1A1A] font-semibold">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
};
