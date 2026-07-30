/**
 * planningMemory.ts — Session-Scoped Planning Memory
 *
 * Tracks expansion history, rejected/accepted suggestions,
 * clarification Q&A, and user preferences within a session.
 * Feeds into context builder so the LLM learns from past decisions.
 *
 * Persisted to localStorage for session recovery.
 */

import type { PlanningMemorySnapshot } from '../../types';

const STORAGE_KEY = 'ai-reasoning-planning-memory';

const EMPTY_MEMORY: PlanningMemorySnapshot = {
  expansionHistory: [],
  rejectedSuggestions: [],
  acceptedSuggestions: [],
  researchQueries: [],
  clarificationHistory: [],
  userPreferences: {},
};

let memory: PlanningMemorySnapshot = loadFromStorage();

function loadFromStorage(): PlanningMemorySnapshot {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // Ignore parse errors
  }
  return { ...EMPTY_MEMORY };
}

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch {
    // Storage full or unavailable
  }
}

// =============================================
// Public API
// =============================================

export const planningMemory = {
  /** Get the current memory snapshot for context building */
  getSnapshot(): PlanningMemorySnapshot {
    return { ...memory };
  },

  /** Record a node expansion */
  recordExpansion(nodeId: string, childCount: number): void {
    memory.expansionHistory.push({
      nodeId,
      childCount,
      timestamp: Date.now(),
    });
    // Keep last 20 expansions
    if (memory.expansionHistory.length > 20) {
      memory.expansionHistory = memory.expansionHistory.slice(-20);
    }
    persist();
  },

  /** Record a rejected suggestion (so AI doesn't re-propose it) */
  recordRejectedSuggestion(title: string, reason?: string): void {
    memory.rejectedSuggestions.push({ title, reason });
    persist();
  },

  /** Record an accepted suggestion */
  recordAcceptedSuggestion(title: string): void {
    memory.acceptedSuggestions.push(title);
    persist();
  },

  /** Record a research query */
  recordResearchQuery(query: string): void {
    memory.researchQueries.push(query);
    persist();
  },

  /** Record a clarification Q&A pair */
  recordClarification(question: string, answer: string): void {
    memory.clarificationHistory.push({ question, answer });
    persist();
  },

  /** Set a user preference (e.g., risk_tolerance=aggressive) */
  setPreference(key: string, value: string): void {
    memory.userPreferences[key] = value;
    persist();
  },

  /** Reset memory for a new session */
  reset(): void {
    memory = { ...EMPTY_MEMORY };
    persist();
  },
};
