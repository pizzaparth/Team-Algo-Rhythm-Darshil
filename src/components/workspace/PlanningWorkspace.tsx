// Author: Parth Pancholi

import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { CanvasGraph } from './CanvasGraph';
import { AIPanel } from './AIPanel';
import { CompareModal } from './CompareModal';
import { ExportModal } from './ExportModal';
import { SettingsModal } from './SettingsModal';
import { CreateNodeModal } from './CreateNodeModal';
import { RenameNodeModal } from './RenameNodeModal';
import { CreateProjectModal } from './CreateProjectModal';
import { DeleteNodeModal } from './DeleteNodeModal';
import { ExpandNodeModal } from './ExpandNodeModal';

export const PlanningWorkspace: React.FC = () => {
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-[#0b0f17] overflow-hidden relative">
      {/* 1. Left VS Code Style Sidebar */}
      <Sidebar />

      {/* 2. Center Infinite Decision Graph Canvas */}
      <div className="flex-1 h-full relative">
        <CanvasGraph />

        {/* Reopen AI Assistant — shown only while the panel is hidden */}
        {!aiPanelOpen && (
          <button
            onClick={() => setAiPanelOpen(true)}
            title="Open AI Reasoning Assistant"
            className="absolute top-4 right-4 z-20 flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#2c2c2c] text-white shadow-lg transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-white" />
            <span className="text-xs font-semibold text-white">Chat</span>
          </button>
        )}
      </div>

      {/* 3. Right AI Assistant & Context Details Panel */}
      {aiPanelOpen && <AIPanel onClose={() => setAiPanelOpen(false)} />}

      {/* Global Workspace Modals */}
      <CompareModal />
      <ExportModal />
      <SettingsModal />
      <CreateNodeModal />
      <RenameNodeModal />
      <CreateProjectModal />
      <DeleteNodeModal />
      <ExpandNodeModal />
    </div>
  );
};
