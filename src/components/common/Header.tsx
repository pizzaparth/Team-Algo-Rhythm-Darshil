import React from 'react';
import { 
  BrainCircuit, LayoutGrid, MessageSquare, Sparkles, 
  Undo2, Redo2, Download, Settings, ChevronRight, FolderKanban, Plus
} from 'lucide-react';
import { useAppStore, useGraphStore, useProjectStore, useChatStore } from '../../store/';
import { ViewMode } from '../../types';

export const Header: React.FC = () => {
  const { viewMode, setViewMode, openModal, addToast } = useAppStore();
  const { canUndo, canRedo, undo, redo } = useGraphStore();
  const { projects, activeProjectId, selectProject } = useProjectStore();
  const { contextSufficient } = useChatStore();

  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <header className="h-14 bg-white/90 backdrop-blur-md border-b border-[#E5E2DD] px-4 md:px-6 flex items-center justify-between z-30 select-none">
      {/* Brand & Active Project Selector */}
      <div className="flex items-center space-x-3 md:space-x-4">
        <button 
          onClick={() => setViewMode('landing')}
          className="flex items-center space-x-2.5 text-[#1A1A1A] hover:opacity-80 transition-opacity focus:outline-none"
        >
          <div className="w-8 h-8 bg-[#1A1A1A] rounded flex items-center justify-center text-white font-bold text-xs italic shadow-sm">
            AR
          </div>
          <span className="font-semibold text-[#1A1A1A] tracking-tight uppercase text-xs md:text-sm hidden md:inline-block">
            Reasoning Workspace
          </span>
        </button>

        <div className="h-4 w-px bg-[#E5E2DD]"></div>

        {/* Project Selector Dropdown */}
        <div className="relative flex items-center space-x-1.5 bg-[#F3F1ED] px-3 py-1.5 rounded-md border border-[#E5E2DD] text-xs">
          <FolderKanban className="w-3.5 h-3.5 text-[#1A1A1A] opacity-60" />
          <select 
            value={activeProjectId} 
            onChange={(e) => selectProject(e.target.value)}
            className="bg-transparent text-[#1A1A1A] focus:outline-none cursor-pointer text-xs font-semibold max-w-[140px] sm:max-w-[200px] truncate"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id} className="bg-white text-[#1A1A1A]">
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* View Mode Nav Toggles */}
      <div className="flex items-center bg-[#F3F1ED] p-1 rounded-full border border-[#E5E2DD]">
        <button
          onClick={() => setViewMode('landing')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 ${
            viewMode === 'landing' 
              ? 'bg-white text-[#1A1A1A] shadow-sm font-semibold' 
              : 'text-[#666666] hover:text-[#1A1A1A]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden sm:inline">Overview</span>
        </button>

        <button
          onClick={() => setViewMode('chat')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 ${
            viewMode === 'chat' 
              ? 'bg-white text-[#1A1A1A] shadow-sm font-semibold' 
              : 'text-[#666666] hover:text-[#1A1A1A]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Chat</span>
        </button>

        <button
          onClick={() => contextSufficient && setViewMode('workspace')}
          disabled={!contextSufficient}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 ${
            viewMode === 'workspace' 
              ? 'bg-[#1A1A1A] text-white shadow-sm font-semibold' 
              : contextSufficient 
                ? 'text-[#666666] hover:text-[#1A1A1A]' 
                : 'text-[#AAAAAA] cursor-not-allowed opacity-50'
          }`}
        >
          <LayoutGrid className={`w-3.5 h-3.5 ${viewMode === 'workspace' ? 'text-white opacity-80' : ''}`} />
          <span>Graph Canvas</span>
        </button>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center space-x-2">
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
