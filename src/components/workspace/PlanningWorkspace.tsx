import React from 'react';
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
  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-[#0b0f17] overflow-hidden relative">
      {/* 1. Left VS Code Style Sidebar */}
      <Sidebar />

      {/* 2. Center Infinite Decision Graph Canvas */}
      <div className="flex-1 h-full relative">
        <CanvasGraph />
      </div>

      {/* 3. Right AI Assistant & Context Details Panel */}
      <AIPanel />

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
