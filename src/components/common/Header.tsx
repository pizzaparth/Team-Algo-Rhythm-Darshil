import React from 'react';
import { 
  BrainCircuit, LayoutGrid, MessageSquare, Sparkles, 
  Undo2, Redo2, Download, Settings, ChevronRight
} from 'lucide-react';
import { useAppStore, useGraphStore, useChatStore } from '../../store/';
import { ViewMode } from '../../types';

export const Header: React.FC = () => {
  const { viewMode, setViewMode, openModal, addToast } = useAppStore();
  const { canUndo, canRedo, undo, redo } = useGraphStore();
  const { contextSufficient } = useChatStore();

  return (
    <header className="h-14 bg-white/90 backdrop-blur-md border-b border-[#E5E2DD] px-4 md:px-6 flex items-center justify-between z-30 select-none">
      {/* Brand & Active Project Selector */}
      <div className="flex items-center space-x-3 md:space-x-4">
        <button 
          onClick={() => setViewMode('landing')}
          className="flex items-center space-x-2.5 text-[#1A1A1A] hover:opacity-80 transition-opacity focus:outline-none"
        >
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded object-cover shadow-sm" />
          <span className="font-semibold text-[#1A1A1A] tracking-tight uppercase text-xs md:text-sm hidden md:inline-block">
            StateGraph
          </span>
        </button>

        <div className="h-4 w-px bg-[#E5E2DD]"></div>

        {/* View Mode Nav Toggles */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setViewMode('landing')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 border ${
              viewMode === 'landing'
                ? 'bg-white border-[#E5E2DD] text-[#1A1A1A] shadow-sm font-semibold'
                : 'border-transparent text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F3F1ED]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Overview</span>
          </button>

          <button
            onClick={() => setViewMode('chat')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 border ${
              viewMode === 'chat'
                ? 'bg-white border-[#E5E2DD] text-[#1A1A1A] shadow-sm font-semibold'
                : 'border-transparent text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F3F1ED]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Chat</span>
          </button>

          <button
            onClick={() => contextSufficient && setViewMode('workspace')}
            disabled={!contextSufficient}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 border ${
              viewMode === 'workspace'
                ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-sm font-semibold'
                : contextSufficient
                  ? 'border-transparent text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F3F1ED]'
                  : 'border-transparent text-[#AAAAAA] cursor-not-allowed opacity-50'
            }`}
          >
            <LayoutGrid className={`w-3.5 h-3.5 ${viewMode === 'workspace' ? 'text-white opacity-80' : ''}`} />
            <span>Graph Canvas</span>
          </button>
        </div>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center space-x-2">
        {viewMode === 'workspace' && (
          <>
            {/* Undo / Redo buttons */}
            <div className="hidden md:flex items-center space-x-1 border-r border-[#E5E2DD] pr-2 mr-1">
              <button
                onClick={undo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                className="p-1.5 rounded-full text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F3F1ED] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
                className="p-1.5 rounded-full text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F3F1ED] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Export */}
            <button
              onClick={() => openModal('export')}
              className="p-1.5 rounded-full text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F3F1ED] transition-colors"
              title="Export Decision Graph"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Quick Settings */}
            <button
              onClick={() => openModal('settings')}
              className="p-1.5 rounded-full text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F3F1ED] transition-colors"
              title="Workspace Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Transition / Start Planning CTA */}
        {viewMode !== 'workspace' && contextSufficient && (
          <button
            onClick={() => {
              setViewMode('workspace');
              addToast('Transitioned into Planning Workspace', 'success');
            }}
            className="ml-2 px-4 py-1.5 rounded-full bg-[#1A1A1A] hover:bg-[#2c2c2c] text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <span>Start Planning</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
