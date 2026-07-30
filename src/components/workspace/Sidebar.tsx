import React from 'react';
import { 
  FolderKanban, MessageSquare, Layers, Network, Search, 
  Download, Settings, ChevronLeft, ChevronRight, Plus, 
  Check, FileText, Image, Code, Sparkles, Filter,
  Edit3, Trash2
} from 'lucide-react';
import { useAppStore, useGraphStore, useProjectStore } from '../../store/';
import { SidebarTab } from '../../types';
import { STRATEGY_TEMPLATES } from '../../data/mockData';
import { getRelativeTime } from '../../lib/markdownRenderer';

export const Sidebar: React.FC = () => {
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    activeSidebarTab, 
    setActiveSidebarTab,
    searchQuery,
    setSearchQuery,
    openModal,
    addToast,
  } = useAppStore();

  const {
    projects,
    activeProjectId,
    selectProject,
    sessions,
    activeSessionId,
    selectSession,
    createProject,
    createSession,
    deleteSession,
    renameSession,
  } = useProjectStore();

  const {
    nodes,
    selectNode
  } = useGraphStore();

  const activeProject = projects.find(p => p.id === activeProjectId);

  // Filter nodes for search tab
  const filteredNodes = searchQuery.trim()
    ? nodes.filter(n => 
        n.data.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.data.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.data.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : nodes;

  const renderTabContent = () => {
    switch (activeSidebarTab) {
      case 'sessions':
        return (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-50 text-[#1A1A1A]">Sessions</span>
              <button
                onClick={() => createSession(`Session ${sessions.length + 1}`)}
                className="p-1 rounded bg-[#1A1A1A] text-white hover:bg-[#2c2c2c] transition-colors"
                title="New Session"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {sessions.map(s => (
                <div
                  key={s.id}
                  onClick={() => selectSession(s.id)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all group relative ${
                    activeSessionId === s.id 
                      ? 'bg-white border-[#1A1A1A] shadow-sm text-[#1A1A1A] font-semibold' 
                      : 'bg-white/60 border-[#E5E2DD] hover:border-[#1A1A1A]/40 text-[#1A1A1A]/80'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-60" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold truncate pr-10">{s.title}</div>
                      <div className="text-[10px] mt-0.5 text-amber-700">{getRelativeTime(s.updatedAt)}</div>
                    </div>
                  </div>
                  {/* Rename & Delete — visible on hover */}
                  <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newName = window.prompt('Rename session:', s.title);
                        if (newName && newName.trim()) {
                          renameSession(s.id, newName.trim());
                        }
                      }}
                      className="p-1 rounded hover:bg-[#E5E2DD] transition-colors"
                      title="Rename session"
                    >
                      <Edit3 className="w-3 h-3 text-[#666]" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (sessions.length <= 1) {
                          addToast('Cannot delete the last session', 'warning');
                          return;
                        }
                        if (window.confirm(`Delete session "${s.title}"?`)) {
                          deleteSession(s.id);
                        }
                      }}
                      className="p-1 rounded hover:bg-rose-100 transition-colors"
                      title="Delete session"
                    >
                      <Trash2 className="w-3 h-3 text-rose-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'templates':
        return (
          <div className="p-4 space-y-4">
            <div className="text-[10px] uppercase tracking-widest font-bold opacity-50 text-[#1A1A1A]">Strategy Templates</div>
            <div className="space-y-2">
              {STRATEGY_TEMPLATES.map(t => (
                <div
                  key={t.id}
                  onClick={() => {
                    addToast(`Loaded template: ${t.title}`, 'success');
                  }}
                  className="p-3 bg-white hover:bg-white border border-[#E5E2DD] hover:border-[#1A1A1A] rounded-lg text-xs cursor-pointer transition-all group shadow-sm"
                >
                  <div className="font-semibold text-[#1A1A1A] group-hover:underline">{t.title}</div>
                  <div className="text-[10px] text-[#666666] mt-1 leading-relaxed">{t.description}</div>
                  <div className="mt-2 text-[10px] text-[#1A1A1A] font-bold flex items-center justify-between border-t border-[#E5E2DD] pt-1.5">
                    <span>{t.category}</span>
                    <span>{t.nodesCount} nodes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="p-4 space-y-4">
            <div className="text-[10px] uppercase tracking-widest font-bold opacity-50 text-[#1A1A1A]">Search Workspace</div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#666666]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search nodes, notes, risks..."
                className="w-full bg-white border border-[#E5E2DD] focus:border-[#1A1A1A] rounded-lg pl-8 pr-3 py-2 text-xs text-[#1A1A1A] placeholder-[#888888] focus:outline-none shadow-sm"
              />
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {filteredNodes.map(n => (
                <div
                  key={n.id}
                  onClick={() => selectNode(n.id)}
                  className="p-2.5 bg-white hover:border-[#1A1A1A] border border-[#E5E2DD] rounded-lg text-xs cursor-pointer transition-all shadow-sm"
                >
                  <div className="font-semibold text-[#1A1A1A] truncate">{n.data.title}</div>
                  <div className="text-[10px] text-[#666666] truncate mt-0.5">{n.data.summary}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'exports':
        return (
          <div className="p-4 space-y-4">
            <div className="text-[10px] uppercase tracking-widest font-bold opacity-50 text-[#1A1A1A]">Export Decision Tree</div>
            <div className="space-y-2">
              <button
                onClick={() => openModal('export')}
                className="w-full p-3 bg-white hover:bg-[#EEEBE6] border border-[#E5E2DD] rounded-lg text-left text-xs text-[#1A1A1A] flex items-center space-x-3 transition-all shadow-sm"
              >
                <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <div className="font-semibold">Obsidian Markdown (.md)</div>
                  <div className="text-[10px] text-[#666666]">Structured markdown with wiki-links.</div>
                </div>
              </button>

              <button
                onClick={() => openModal('export')}
                className="w-full p-3 bg-white hover:bg-[#EEEBE6] border border-[#E5E2DD] rounded-lg text-left text-xs text-[#1A1A1A] flex items-center space-x-3 transition-all shadow-sm"
              >
                <Image className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="font-semibold">PNG Canvas Image</div>
                  <div className="text-[10px] text-[#666666]">High-resolution visual snapshot.</div>
                </div>
              </button>

              <button
                onClick={() => openModal('export')}
                className="w-full p-3 bg-white hover:bg-[#EEEBE6] border border-[#E5E2DD] rounded-lg text-left text-xs text-[#1A1A1A] flex items-center space-x-3 transition-all shadow-sm"
              >
                <Code className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-semibold">JSON Blueprint Schema</div>
                  <div className="text-[10px] text-[#666666]">Raw graph specification structure.</div>
                </div>
              </button>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="p-4 space-y-4">
            <div className="text-[10px] uppercase tracking-widest font-bold opacity-50 text-[#1A1A1A]">Canvas & Preferences</div>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[#666666] text-[11px] font-medium">AI Model Alias</label>
                <select className="w-full bg-white border border-[#E5E2DD] rounded-lg p-2 text-[#1A1A1A] text-xs">
                  <option>gemini-2.5-flash (Default)</option>
                  <option>gemini-2.5-pro (High Reasoning)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[#666666] text-[11px] font-medium">Background Canvas Pattern</label>
                <select className="w-full bg-white border border-[#E5E2DD] rounded-lg p-2 text-[#1A1A1A] text-xs">
                  <option>Radial Dots (Editorial)</option>
                  <option>Grid Lines</option>
                  <option>Clean Canvas</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[#1A1A1A] font-medium">Smooth Flow Animations</span>
                <input type="checkbox" defaultChecked className="rounded border-[#E5E2DD] text-[#1A1A1A] focus:ring-0" />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const navItems: { id: SidebarTab; label: string; icon: React.ReactNode }[] = [
    { id: 'sessions', label: 'Sessions', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'templates', label: 'Templates', icon: <Layers className="w-4 h-4" /> },
    { id: 'search', label: 'Search', icon: <Search className="w-4 h-4" /> },
    { id: 'exports', label: 'Exports', icon: <Download className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div className="flex h-full bg-[#F3F1ED] border-r border-[#E5E2DD] relative z-20">
      {/* Icon Strip */}
      <div className="w-12 bg-[#EEEBE6] border-r border-[#E5E2DD] flex flex-col items-center py-3 space-y-4 shrink-0">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              if (activeSidebarTab === item.id && sidebarOpen) {
                setSidebarOpen(false);
              } else {
                setActiveSidebarTab(item.id);
                setSidebarOpen(true);
              }
            }}
            className={`p-2 rounded-md transition-all relative ${
              activeSidebarTab === item.id && sidebarOpen
                ? 'bg-white text-[#1A1A1A] shadow-sm border border-[#E5E2DD]'
                : 'text-[#666666] hover:text-[#1A1A1A] hover:bg-white/60'
            }`}
            title={item.label}
          >
            {item.icon}
          </button>
        ))}

        <div className="flex-1" />

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-[#666666] hover:text-[#1A1A1A] hover:bg-white/60 rounded-md transition-colors"
          title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Drawer Panel */}
      {sidebarOpen && (
        <div className="w-60 bg-[#F3F1ED] flex flex-col h-full overflow-y-auto border-r border-[#E5E2DD]">
          <div className="flex-1">
            {renderTabContent()}
          </div>

          {/* Editorial Storage Footer */}
          <div className="p-4 border-t border-[#E5E2DD] bg-[#EEEBE6]">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider opacity-60 text-[#1A1A1A]">
              <span>Graph Storage</span>
              <span>42%</span>
            </div>
            <div className="w-full h-1 bg-[#E5E2DD] mt-2 rounded-full overflow-hidden">
              <div className="bg-[#1A1A1A] h-full w-[42%]"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
