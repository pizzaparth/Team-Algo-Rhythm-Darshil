// Author: Parth Pancholi

import React, { useRef, useEffect } from 'react';
import { Search, X, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';
import { useGraphSearch } from '../../hooks/useGraphSearch';
import { graphCommands } from '../../lib/graphCommands';

interface GraphSearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * GraphSearchBar — Ctrl+K floating search overlay.
 * Fuzzy-searches node title, summary, displayType, creator.
 * Highlights matches on the canvas and allows jump-to-result.
 */
export const GraphSearchBar: React.FC<GraphSearchBarProps> = ({ isOpen, onClose }) => {
  const { query, search, clear, resultNodes, resultCount } = useGraphSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      clear();
    }
  }, [isOpen]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [resultCount]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      clear();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, resultNodes.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && resultNodes[selectedIndex]) {
      graphCommands.focusNode(resultNodes[selectedIndex].id);
      onClose();
    }
  };

  const handleClose = () => {
    clear();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-[500px] max-w-[90vw]">
      {/* Backdrop */}
      <div className="fixed inset-0 -z-10" onClick={handleClose} />

      <div className="bg-white border border-[#E5E2DD] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center px-3 py-2.5 border-b border-[#E5E2DD]">
          <Search className="w-4 h-4 text-[#888888] shrink-0 mr-2" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => search(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search nodes by title, type, or creator..."
            className="flex-1 bg-transparent text-sm text-[#1A1A1A] placeholder-[#888888] focus:outline-none"
          />
          {query && (
            <span className="text-[11px] text-[#888888] mr-2 shrink-0">
              {resultCount} result{resultCount !== 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={handleClose}
            className="p-1 text-[#888888] hover:text-[#1A1A1A] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Results */}
        {query && (
          <div className="max-h-72 overflow-y-auto">
            {resultNodes.length === 0 ? (
              <div className="p-4 text-center text-[#888888] text-xs">
                No nodes match "{query}"
              </div>
            ) : (
              resultNodes.map((node, i) => (
                <button
                  key={node.id}
                  onClick={() => {
                    graphCommands.focusNode(node.id);
                    handleClose();
                  }}
                  className={`w-full text-left px-4 py-2.5 flex items-center space-x-3 transition-colors ${
                    i === selectedIndex
                      ? 'bg-[#F3F1ED]'
                      : 'hover:bg-[#F9F8F6]'
                  }`}
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: node.data.branchColor }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-[#1A1A1A] truncate">{node.data.title}</div>
                    <div className="text-[10px] text-[#888888] flex items-center space-x-1.5 mt-0.5">
                      <span className="uppercase font-bold tracking-wider">{node.data.displayType}</span>
                      <span>•</span>
                      <span>L{node.data.depth}</span>
                      <span>•</span>
                      <span className="capitalize">{node.data.creator}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-[#CCCCCC] shrink-0" />
                </button>
              ))
            )}
          </div>
        )}

        {/* Footer hints */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#F9F8F6] border-t border-[#E5E2DD]">
          <div className="flex items-center space-x-3 text-[10px] text-[#888888]">
            <span className="flex items-center space-x-1">
              <ArrowUp className="w-3 h-3" /> <ArrowDown className="w-3 h-3" />
              <span>Navigate</span>
            </span>
            <span>↵ Jump to node</span>
            <span>Esc Close</span>
          </div>
          <span className="text-[10px] text-[#CCCCCC]">Ctrl+K</span>
        </div>
      </div>
    </div>
  );
};
