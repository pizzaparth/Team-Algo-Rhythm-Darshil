/**
 * suggestion.ts — Proactive Suggestion Prompt
 *
 * Generates prompts for the LLM to propose new branches the user
 * hasn't considered. Used after analysis, not during expansion.
 */

import type { LLMMessage, EnhancedAIContext } from '../../../types';
import { buildSystemPrompt, buildGraphContextBlock } from './system';

/**
 * Build messages for generating proactive suggestions.
 */
export function buildSuggestionPrompt(
  context: EnhancedAIContext,
): LLMMessage[] {
  const system = buildSystemPrompt(context);
  const graphBlock = buildGraphContextBlock(context);

  const userMsg: LLMMessage = {
    role: 'user',
    content: `${graphBlock}

TASK: Analyse the current decision graph and identify 1-3 branches or considerations the user may have missed.

Only suggest genuinely valuable additions. Do NOT suggest anything that overlaps with existing nodes.

Respond with ONLY a valid JSON object:
{
  "suggestions": [
    {
      "title": "string — concise suggestion title",
      "description": "string — why this matters and what it would add",
      "suggestedType": "string — Strategic Option | Alternative | Risk Factor | Prerequisite",
      "impactScore": "number — 0-100, how much this would improve the plan",
      "targetNodeId": "string — which existing node this should be attached to"
    }
  ]
}

If you don't see any genuinely valuable suggestions, return: { "suggestions": [] }`,
  };

  return [system, userMsg];
}
