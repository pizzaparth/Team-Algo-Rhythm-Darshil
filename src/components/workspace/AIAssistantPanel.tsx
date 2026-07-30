import React, { useState } from 'react';
import { 
  Sparkles, FileText, BarChart3, Users, Clock, 
  MessageSquare, ShieldCheck, AlertTriangle, CheckCircle2, 
  Plus, ExternalLink, Bot, User, Edit3, Trash2, ArrowUpRight, HelpCircle
} from 'lucide-react';
import { useAppStore, useGraphStore, useChatStore, useAIStore } from '../../store/';
import { AssistantTab } from '../../types';

export const AIAssistantPanel: React.FC = () => {
  const { activeAssistantTab, setActiveAssistantTab, addToast } = useAppStore();
  const { nodes, selectedNodeId, updateNodeData } = useGraphStore();
  const { messages, sendUserMessage, isGenerating } = useChatStore();
  const { aiSuggestions, addBranchFromSuggestion, ignoreSuggestion, activities } = useAIStore();

  const [chatInput, setChatInput] = useState('');
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const handleNotesChange = (text: string) => {
    if (selectedNodeId) {
      updateNodeData(selectedNodeId, { notes: text });
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendUserMessage(chatInput);
    setChatInput('');
  };

  const tabs: { id: AssistantTab; label: string; icon: React.ReactNode }[] = [
    { id: 'detail', label: 'Detail', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'suggestions', label: 'AI Ideas', icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'experts', label: 'Experts', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'evidence', label: 'Evidence', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'chat', label: 'Assistant', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'activity', label: 'Audit', icon: <Clock className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="w-80 md:w-96 bg-[#F3F1ED] border-l border-[#E5E2DD] flex flex-col h-full z-20 text-xs text-[#1A1A1A] select-none">
      {/* Top Tab Bar */}
      <div className="flex items-center bg-[#EEEBE6] border-b border-[#E5E2DD] p-1.5 overflow-x-auto shrink-0 space-x-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveAssistantTab(tab.id)}
            className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium flex items-center space-x-1 shrink-0 transition-all ${
              activeAssistantTab === tab.id
                ? 'bg-[#1A1A1A] text-white shadow-sm font-semibold'
                : 'text-[#666666] hover:text-[#1A1A1A] hover:bg-white/60'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {selectedNode ? (
          <>
            {/* Tab: Node Detail */}
            {activeAssistantTab === 'detail' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Node Title Header Card */}
                <div className="p-3.5 bg-white border border-[#E5E2DD] rounded-lg shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="uppercase font-bold tracking-widest text-[#1A1A1A] opacity-60">
                      {selectedNode.data.displayType} Node
                    </span>
                    <span className="font-mono text-[#666666]">ID: {selectedNode.id}</span>
                  </div>
                  <h3 className="text-base font-serif italic font-bold text-[#1A1A1A] leading-tight">
                    {selectedNode.data.title}
                  </h3>
                  <p className="text-[#666666] text-xs leading-relaxed">
                    {selectedNode.data.summary}
                  </p>
                </div>

                {/* Status & Metrics */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-white border border-[#E5E2DD] rounded-lg shadow-sm">
                    <div className="text-[10px] text-[#666666] font-medium uppercase tracking-wider">Confidence Score</div>
                    <div className="text-base font-bold text-[#1A1A1A] font-mono mt-0.5">
                      {selectedNode.data.confidence}%
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-[#E5E2DD] rounded-lg shadow-sm">
                    <div className="text-[10px] text-[#666666] font-medium uppercase tracking-wider">Risk Level</div>
                    <div className={`text-base font-bold mt-0.5 ${
                      selectedNode.data.riskFactor === 'High' || selectedNode.data.riskFactor === 'Critical'
                        ? 'text-rose-600'
                        : selectedNode.data.riskFactor === 'Medium'
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}>
                      {selectedNode.data.riskFactor}
                    </div>
                  </div>
                </div>

                {/* Pros & Cons */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-700 flex items-center mb-1.5 uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Key Pros & Advantages
                    </h4>
                    <ul className="space-y-1 pl-1">
                      {selectedNode.data.pros.map((pro, i) => (
                        <li key={i} className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-md text-[11px] leading-snug">
                          • {pro}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-rose-700 flex items-center mb-1.5 uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Key Cons & Risks
                    </h4>
                    <ul className="space-y-1 pl-1">
                      {selectedNode.data.cons.map((con, i) => (
                        <li key={i} className="p-2 bg-rose-50 border border-rose-200 text-rose-900 rounded-md text-[11px] leading-snug">
                          • {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Notes Editor */}
                <div className="space-y-1.5 pt-2 border-t border-[#E5E2DD]">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#1A1A1A]">
                    <span className="flex items-center">
                      <FileText className="w-3.5 h-3.5 text-amber-600 mr-1" /> Node Notes
                    </span>
                    <span className="text-[10px] text-[#888888]">Autosaved</span>
                  </div>
                  <textarea
                    value={selectedNode.data.notes || ''}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Add custom notes, research links, or team takeaways..."
                    rows={4}
                    className="w-full bg-white border border-[#E5E2DD] focus:border-[#1A1A1A] rounded-lg p-2.5 text-xs text-[#1A1A1A] placeholder-[#888888] focus:outline-none resize-none shadow-sm"
                  />
                </div>
              </div>
            )}

            {/* Tab: AI Suggestions */}
            {activeAssistantTab === 'suggestions' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center">
                  <Sparkles className="w-4 h-4 text-amber-600 mr-1.5" /> AI Reasoning Suggestions
                </div>

                {aiSuggestions.length === 0 ? (
                  <div className="p-4 text-center text-[#666666] text-xs bg-white rounded-lg border border-[#E5E2DD]">
                    No active suggestions for this branch.
                  </div>
                ) : (
                  aiSuggestions.map(sug => (
                    <div key={sug.id} className="p-3.5 bg-white border border-amber-300 rounded-lg space-y-2 shadow-sm">
                      <div className="flex items-center justify-between text-[10px] text-amber-700 font-bold tracking-wider">
                        <span>IMPACT SCORE {sug.impactScore}%</span>
                        <span className="uppercase">{sug.suggestedType}</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#1A1A1A] font-serif italic">{sug.title}</h4>
                      <p className="text-[11px] text-[#666666] leading-relaxed">{sug.description}</p>
                      
                      <div className="flex items-center space-x-2 pt-2 border-t border-[#E5E2DD]">
                        <button
                          onClick={() => addBranchFromSuggestion(sug)}
                          className="flex-1 py-1.5 px-3 bg-[#1A1A1A] hover:bg-[#2c2c2c] text-white font-semibold rounded-md text-xs flex items-center justify-center space-x-1 transition-colors shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Branch</span>
                        </button>
                        <button
                          onClick={() => ignoreSuggestion(sug.id)}
                          className="px-3 py-1.5 bg-[#EEEBE6] hover:bg-[#E5E2DD] text-[#1A1A1A] rounded-md text-xs font-medium transition-colors"
                        >
                          Ignore
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Experts */}
            {activeAssistantTab === 'experts' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center">
                  <Users className="w-4 h-4 text-purple-600 mr-1.5" /> Expert Profiles & Quotes
                </div>

                {selectedNode.data.experts && selectedNode.data.experts.length > 0 ? (
                  selectedNode.data.experts.map(exp => (
                    <div key={exp.id} className="p-3 bg-white border border-[#E5E2DD] rounded-lg space-y-2 shadow-sm">
                      <div className="flex items-center space-x-2.5">
                        <img src={exp.avatar} alt={exp.name} className="w-8 h-8 rounded-full object-cover border border-[#E5E2DD]" />
                        <div>
                          <div className="font-bold text-[#1A1A1A] text-xs">{exp.name}</div>
                          <div className="text-[10px] text-[#666666]">{exp.title} • {exp.organization}</div>
                        </div>
                      </div>
                      {exp.quote && (
                        <blockquote className="p-2 bg-[#F3F1ED] border-l-2 border-[#1A1A1A] italic text-[11px] text-[#1A1A1A] font-serif rounded-r">
                          "{exp.quote}"
                        </blockquote>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-[#666666] text-xs bg-white rounded-lg border border-[#E5E2DD]">
                    No expert profiles attached to this node yet.
                  </div>
                )}
              </div>
            )}

            {/* Tab: Evidence */}
            {activeAssistantTab === 'evidence' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center">
                  <BarChart3 className="w-4 h-4 text-blue-600 mr-1.5" /> Supporting Research & Benchmarks
                </div>

                {selectedNode.data.evidence && selectedNode.data.evidence.length > 0 ? (
                  selectedNode.data.evidence.map(ev => (
                    <div key={ev.id} className="p-3 bg-white border border-[#E5E2DD] rounded-lg space-y-1.5 shadow-sm">
                      <div className="flex items-center justify-between text-[10px] text-blue-600 font-bold">
                        <span className="uppercase">{ev.type}</span>
                        <span>{ev.confidence}% Confidence</span>
                      </div>
                      <h4 className="font-bold text-[#1A1A1A] text-xs font-serif">{ev.title}</h4>
                      <p className="text-[11px] text-[#666666] leading-relaxed">{ev.summary}</p>
                      <div className="text-[10px] text-[#888888] pt-1 flex items-center justify-between">
                        <span>Source: {ev.source}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-[#666666] text-xs bg-white rounded-lg border border-[#E5E2DD]">
                    No empirical evidence documents attached.
                  </div>
                )}
              </div>
            )}

            {/* Tab: Assistant Chat */}
            {activeAssistantTab === 'chat' && (
              <div className="space-y-3 flex flex-col h-full animate-in fade-in duration-150">
                <div className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center">
                  <Bot className="w-4 h-4 text-[#1A1A1A] mr-1.5" /> Contextual AI Assistant
                </div>

                <div className="p-3 bg-white border border-[#E5E2DD] rounded-lg text-xs leading-relaxed text-[#1A1A1A] shadow-sm">
                  Discussing: <span className="font-serif italic font-bold">{selectedNode.data.title}</span>
                </div>

                <form onSubmit={handleSendChat} className="space-y-2 pt-2">
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question about this node..."
                    rows={3}
                    className="w-full bg-white border border-[#E5E2DD] focus:border-[#1A1A1A] rounded-lg p-2.5 text-xs text-[#1A1A1A] placeholder-[#888888] focus:outline-none resize-none shadow-sm"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-[#1A1A1A] hover:bg-[#2c2c2c] text-white font-semibold rounded-md text-xs transition-colors shadow-sm"
                  >
                    Send Query
                  </button>
                </form>
              </div>
            )}

            {/* Tab: Activity */}
            {activeAssistantTab === 'activity' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center">
                  <Clock className="w-4 h-4 text-emerald-600 mr-1.5" /> Audit Activity Log
                </div>

                <div className="space-y-2">
                  {activities.map(act => (
                    <div key={act.id} className="p-2.5 bg-white border border-[#E5E2DD] rounded-lg text-xs space-y-1 shadow-sm">
                      <div className="flex items-center justify-between text-[10px] text-[#666666]">
                        <span className="font-bold text-[#1A1A1A]">{act.user}</span>
                        <span>{act.timestamp}</span>
                      </div>
                      <div className="font-bold text-[#1A1A1A] text-[11px]">{act.action}</div>
                      <div className="text-[10px] text-[#666666]">{act.details}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-6 text-center text-[#666666] text-xs space-y-2 my-auto">
            <HelpCircle className="w-8 h-8 text-[#888888] mx-auto" />
            <p className="font-serif italic text-sm font-bold text-[#1A1A1A]">No Node Selected</p>
            <p className="text-[11px] leading-relaxed">Click any node on the infinite canvas to inspect details, expert quotes, notes, and AI suggestions.</p>
          </div>
        )}
      </div>
    </div>
  );
};
