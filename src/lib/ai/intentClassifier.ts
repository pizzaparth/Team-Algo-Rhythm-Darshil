/**
 * intentClassifier.ts — User Intent Classification
 *
 * Lightweight heuristic-first classifier. No LLM call.
 * Falls back to CHAT if uncertain. The main LLM handles nuance.
 *
 * Per PRD §12.2
 */

import type { UserIntent, AIContext } from '../../types';

/** Keyword patterns for each intent */
const INTENT_PATTERNS: { intent: UserIntent; patterns: RegExp[] }[] = [
  {
    intent: 'EXPAND_NODE',
    patterns: [
      /\b(expand|break\s*down|decompose|drill\s*(into|down)|go\s*deeper|elaborate|explore\s*(this|further|more)|branch\s*out|unfold)\b/i,
    ],
  },
  {
    intent: 'RESEARCH_REQUEST',
    patterns: [
      /\b(research|look\s*up|find\s*(out|info|data|research|articles)|search\s*(for|the)|what\s*(does|do)\s*(the\s*)?data|investigate|explore\s*(news|trends|sources)|get\s*(me\s*)?info)\b/i,
    ],
  },
  {
    intent: 'ANALYSE',
    patterns: [
      /\b(analy[sz]e|evaluate|assess|compare|review|examine|critique|what\s*do\s*you\s*think|weigh|pros\s*and\s*cons|trade.?offs?)\b/i,
    ],
  },
  {
    intent: 'SUMMARISE',
    patterns: [
      /\b(summari[sz]e|summary|overview|recap|brief|digest|tldr|tl;dr)\b/i,
    ],
  },
  {
    intent: 'CREATE_NODE',
    patterns: [
      /\b(add\s*(a\s*)?node|create\s*(a\s*)?node|add\s*(a\s*)?(child|branch|option|strategy)|new\s*(node|branch|option))\b/i,
    ],
  },
];

/**
 * Classify user input into an intent.
 * Checks pending question state first, then regex patterns, then defaults to CHAT.
 */
export function classifyIntent(input: string, context: AIContext): UserIntent {
  // Priority 1: If there's a pending question, any input is a clarification response
  if (context.pendingQuestion) {
    return 'CLARIFICATION_RESPONSE';
  }

  // Priority 2: Check keyword patterns
  for (const { intent, patterns } of INTENT_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(input)) {
        return intent;
      }
    }
  }

  // Default: general chat
  return 'CHAT';
}
