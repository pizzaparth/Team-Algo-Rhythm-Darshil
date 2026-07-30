import { create } from 'zustand';
import { AISuggestion, ActivityLog } from '../types';
import { MOCK_AI_SUGGESTIONS } from '../data/mockData';
import { useGraphStore } from './useGraphStore';
import { useAppStore } from './useAppStore';

interface AIState {
  aiSuggestions: AISuggestion[];
  activities: ActivityLog[];
  addBranchFromSuggestion: (suggestion: AISuggestion) => void;
  ignoreSuggestion: (suggestionId: string) => void;
  addSuggestions: (suggestions: AISuggestion[]) => void;
  restoreSuggestions: (suggestions: AISuggestion[]) => void;
  addActivity: (action: string, details: string, nodeId?: string) => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  aiSuggestions: MOCK_AI_SUGGESTIONS,
  activities: [
    { id: 'act-1', timestamp: '11:20 AM', user: 'Alex Vance', action: 'Created Workspace', details: 'Initialized Enterprise Architecture tree.' },
    { id: 'act-2', timestamp: '11:22 AM', user: 'AI Reasoner', action: 'Generated Nodes', details: 'Added Kafka vs Cloud Run options.', nodeId: 'node-1' }
  ],
  addBranchFromSuggestion: (suggestion) => {
    useGraphStore.getState().addNode({
      data: {
        title: suggestion.title,
        summary: suggestion.description,
        displayType: 'Strategic Option',
        internalType: 'strategic',
        status: 'proposed',
        depth: 2,
        branchColor: '#f59e0b',
        creator: 'ai',
        confidence: suggestion.impactScore,
        pros: ['Identified by AI reasoning engine', 'Fills critical architectural gap'],
        cons: ['Requires validation in stage environment'],
        riskFactor: 'Medium'
      }
    }, suggestion.nodeId);

    set(state => ({ aiSuggestions: state.aiSuggestions.filter(s => s.id !== suggestion.id) }));
    useAppStore.getState().addToast('Added AI suggested branch to decision tree', 'success');
  },
  ignoreSuggestion: (id) => {
    set(state => ({ aiSuggestions: state.aiSuggestions.filter(s => s.id !== id) }));
    useAppStore.getState().addToast('Suggestion dismissed', 'info');
  },
  addSuggestions: (suggestions) => {
    set(state => ({ aiSuggestions: [...suggestions, ...state.aiSuggestions] }));
  },
  restoreSuggestions: (suggestions) => {
    set({ aiSuggestions: suggestions });
  },
  addActivity: (action, details, nodeId) => {
    const newAct: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: 'You', action, details, nodeId
    };
    set(state => ({ activities: [newAct, ...state.activities] }));
  }
}));
