// Author: Parth Pancholi

import React, { useState } from 'react';
import {
  LayoutGrid, MessageSquare, Sparkles,
  Undo2, Redo2, ChevronRight, Menu, X, FileEdit
} from 'lucide-react';
import { useAppStore, useGraphStore, useChatStore } from '../../store/';
import { NavToggleButton } from './NavToggleButton';
import { primaryButtonClasses } from '../../lib/uiClasses';

export const Header: React.FC = () => {
  const { viewMode, setViewMode, addToast } = useAppStore();
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
          <NavToggleButton
            active={viewMode === 'landing'}
            onClick={() => setViewMode('landing')}
            icon={<Sparkles className={`w-3.5 h-3.5 ${viewMode === 'landing' ? 'text-white opacity-80' : 'text-amber-600'}`} />}
            label="Overview"
            hideLabelOnMobile
          />

          <NavToggleButton
            active={viewMode === 'chat'}
            onClick={() => setViewMode('chat')}
            icon={<MessageSquare className={`w-3.5 h-3.5 ${viewMode === 'chat' ? 'text-white opacity-80' : 'text-blue-600'}`} />}
            label="Chat"
            hideLabelOnMobile
          />

          <NavToggleButton
            active={viewMode === 'workspace'}
            onClick={() => contextSufficient && setViewMode('workspace')}
            disabled={!contextSufficient}
            icon={<LayoutGrid className={`w-3.5 h-3.5 ${viewMode === 'workspace' ? 'text-white opacity-80' : ''}`} />}
            label="Graph Canvas"
          />

          <NavToggleButton
            active={viewMode === 'editor'}
            onClick={() => setViewMode('editor')}
            icon={<FileEdit className={`w-3.5 h-3.5 ${viewMode === 'editor' ? 'text-white opacity-80' : 'text-emerald-600'}`} />}
            label="Editor"
            hideLabelOnMobile
          />
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
          </>
        )}

        {/* Transition / Start Planning CTA */}
        {viewMode !== 'workspace' && contextSufficient && (
          <button
            onClick={() => {
              setViewMode('workspace');
              addToast('Transitioned into Planning Workspace', 'success');
            }}
            className={primaryButtonClasses('ml-2 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center space-x-1.5 transition-all shadow-sm')}
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
            <NavToggleButton
              variant="mobile"
              active={viewMode === 'landing'}
              onClick={() => { setViewMode('landing'); setMobileMenuOpen(false); }}
              icon={<Sparkles className={`w-4 h-4 ${viewMode === 'landing' ? 'text-white opacity-80' : 'text-amber-600'}`} />}
              label="Overview"
            />

            <NavToggleButton
              variant="mobile"
              active={viewMode === 'chat'}
              onClick={() => { setViewMode('chat'); setMobileMenuOpen(false); }}
              icon={<MessageSquare className={`w-4 h-4 ${viewMode === 'chat' ? 'text-white opacity-80' : 'text-blue-600'}`} />}
              label="Chat"
            />

            <NavToggleButton
              variant="mobile"
              active={viewMode === 'workspace'}
              onClick={() => { if (contextSufficient) { setViewMode('workspace'); setMobileMenuOpen(false); } }}
              disabled={!contextSufficient}
              icon={<LayoutGrid className={`w-4 h-4 ${viewMode === 'workspace' ? 'text-white opacity-80' : ''}`} />}
              label="Graph Canvas"
            />

            <NavToggleButton
              variant="mobile"
              active={viewMode === 'editor'}
              onClick={() => { setViewMode('editor'); setMobileMenuOpen(false); }}
              icon={<FileEdit className={`w-4 h-4 ${viewMode === 'editor' ? 'text-white opacity-80' : 'text-emerald-600'}`} />}
              label="Editor"
            />
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
            </div>
          )}

          {viewMode !== 'workspace' && contextSufficient && (
            <button
              onClick={() => {
                setViewMode('workspace');
                addToast('Transitioned into Planning Workspace', 'success');
                setMobileMenuOpen(false);
              }}
              className={primaryButtonClasses('w-full px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-sm')}
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
