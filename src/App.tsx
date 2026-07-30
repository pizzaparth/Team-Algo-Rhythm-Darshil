import React from 'react';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { LandingPage } from './components/landing/LandingPage';
import { ChatInterface } from './components/chat/ChatInterface';
import { PlanningWorkspace } from './components/workspace/PlanningWorkspace';
import { TextEditorPage } from './components/editor/TextEditorPage';
import { useAppStore } from './store/';

export default function App() {
  const { viewMode } = useAppStore();

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1A1A1A] font-sans flex flex-col overflow-hidden">
      {/* Top Application Bar */}
      <Header />

      {/* Main View Mode Area */}
      <main className="flex-1 relative overflow-hidden pt-14">
        {viewMode === 'landing' && <LandingPage />}
        {viewMode === 'chat' && <ChatInterface />}
        {viewMode === 'workspace' && <PlanningWorkspace />}
        {viewMode === 'editor' && <TextEditorPage />}
      </main>

      {/* Floating Toast Notification Container */}
      <ToastContainer />
    </div>
  );
}
