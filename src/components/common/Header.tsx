import React, { useState } from 'react';
import {
  BrainCircuit, LayoutGrid, MessageSquare, Sparkles,
  Undo2, Redo2, Download, Settings, ChevronRight, Menu, X, FileEdit
} from 'lucide-react';
import { useAppStore, useGraphStore, useChatStore } from '../../store/';
import { ViewMode } from '../../types';

export const Header: React.FC = () => {
  const { viewMode, setViewMode, openModal, addToast } = useAppStore();
  const { canUndo, canRedo, undo, redo } = useGraphStore();
  const { contextSufficient } = useChatStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#E5E2DD] px-4 md:px-6 flex items-center justify-between z-30 select-none">
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
        <div className="hidden md:flex items-center space-x-1.5">
          <button
            onClick={() => setViewMode('landing')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all flex items-center space-x-1.5 border ${
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
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all flex items-center space-x-1.5 border ${
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
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all flex items-center space-x-1.5 border ${
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

          <button
            onClick={() => setViewMode('editor')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all flex items-center space-x-1.5 border ${
              viewMode === 'editor'
                ? 'bg-white border-[#E5E2DD] text-[#1A1A1A] shadow-sm font-semibold'
                : 'border-transparent text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F3F1ED]'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Editor</span>
          </button>
        </div>
      </div>

      {/* Right Action Tools */}
      <div className="hidden md:flex items-center space-x-2">
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
            className="ml-2 px-4 py-1.5 rounded-full bg-[#1A1A1A] hover:bg-[#2c2c2c] text-white text-sm font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <span>Start Planning</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Mobile Hamburger Toggle */}
      <button
        onClick={() => setMobileMenuOpen((open) => !open)}
        className="md:hidden p-2 rounded-md text-[#1A1A1A] hover:bg-[#F3F1ED] transition-colors"
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Collapsible Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 bg-white border-b border-[#E5E2DD] shadow-lg z-30 px-4 py-3 space-y-3">
          <div className="flex flex-col space-y-1.5">
            <button
              onClick={() => { setViewMode('landing'); setMobileMenuOpen(false); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                viewMode === 'landing'
                  ? 'bg-[#F3F1ED] text-[#1A1A1A] font-semibold'
                  : 'text-[#666666] hover:bg-[#F3F1ED] hover:text-[#1A1A1A]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => { setViewMode('chat'); setMobileMenuOpen(false); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                viewMode === 'chat'
                  ? 'bg-[#F3F1ED] text-[#1A1A1A] font-semibold'
                  : 'text-[#666666] hover:bg-[#F3F1ED] hover:text-[#1A1A1A]'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Chat</span>
            </button>

            <button
              onClick={() => { if (contextSufficient) { setViewMode('workspace'); setMobileMenuOpen(false); } }}
              disabled={!contextSufficient}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                viewMode === 'workspace'
                  ? 'bg-[#1A1A1A] text-white font-semibold'
                  : contextSufficient
                    ? 'text-[#666666] hover:bg-[#F3F1ED] hover:text-[#1A1A1A]'
                    : 'text-[#AAAAAA] cursor-not-allowed opacity-50'
              }`}
            >
              <LayoutGrid className={`w-4 h-4 ${viewMode === 'workspace' ? 'text-white opacity-80' : ''}`} />
              <span>Graph Canvas</span>
            </button>

            <button
              onClick={() => { setViewMode('editor'); setMobileMenuOpen(false); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                viewMode === 'editor'
                  ? 'bg-[#F3F1ED] text-[#1A1A1A] font-semibold'
                  : 'text-[#666666] hover:bg-[#F3F1ED] hover:text-[#1A1A1A]'
              }`}
            >
              <FileEdit className="w-4 h-4 text-emerald-600" />
              <span>Editor</span>
            </button>
          </div>

          {viewMode === 'workspace' && (
            <div className="flex items-center space-x-1.5 border-t border-[#E5E2DD] pt-3">
              <button
                onClick={undo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                className="p-2 rounded-lg text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F3F1ED] disabled:opacity-30 transition-colors"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
                className="p-2 rounded-lg text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F3F1ED] disabled:opacity-30 transition-colors"
              >
                <Redo2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => { openModal('export'); setMobileMenuOpen(false); }}
                title="Export Decision Graph"
                className="p-2 rounded-lg text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F3F1ED] transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => { openModal('settings'); setMobileMenuOpen(false); }}
                title="Workspace Settings"
                className="p-2 rounded-lg text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F3F1ED] transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          )}

          {viewMode !== 'workspace' && contextSufficient && (
            <button
              onClick={() => {
                setViewMode('workspace');
                addToast('Transitioned into Planning Workspace', 'success');
                setMobileMenuOpen(false);
              }}
              className="w-full px-4 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#2c2c2c] text-white text-sm font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-sm"
            >
              <span>Start Planning</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </header>
  );
};
