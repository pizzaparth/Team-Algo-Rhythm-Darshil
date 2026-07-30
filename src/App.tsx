import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { LandingPage } from './components/landing/LandingPage';
import { ChatInterface } from './components/chat/ChatInterface';
import { PlanningWorkspace } from './components/workspace/PlanningWorkspace';
import { TextEditorPage } from './components/editor/TextEditorPage';
import { useAppStore } from './store/';
import { ROUTE_TO_VIEW_MODE, VIEW_MODE_TO_ROUTE } from './lib/routes';

/**
 * Keeps the URL and the app's `viewMode` store in sync, in both directions:
 *  - URL → store: on load, refresh, direct navigation, or back/forward, the
 *    current route determines viewMode (so route-driven side effects like
 *    smart canvas init still fire correctly).
 *  - store → URL: any existing `setViewMode(...)` call site elsewhere in the
 *    app (buttons, etc.) keeps working unchanged, and now also updates the URL.
 */
const ViewModeUrlSync: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { viewMode, setViewMode } = useAppStore();

  useEffect(() => {
    const modeForRoute = ROUTE_TO_VIEW_MODE[location.pathname];
    if (modeForRoute && modeForRoute !== viewMode) {
      setViewMode(modeForRoute);
    }
  }, [location.pathname]);

  useEffect(() => {
    const routeForMode = VIEW_MODE_TO_ROUTE[viewMode];
    if (routeForMode && routeForMode !== location.pathname) {
      navigate(routeForMode);
    }
  }, [viewMode]);

  return null;
};

function AppShell() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1A1A1A] font-sans flex flex-col overflow-hidden">
      <ViewModeUrlSync />

      {/* Top Application Bar */}
      <Header />

      {/* Main View Mode Area */}
      <main className="flex-1 relative overflow-hidden pt-14">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/graphcanvas" element={<PlanningWorkspace />} />
          <Route path="/editor" element={<TextEditorPage />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>

      {/* Floating Toast Notification Container */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
