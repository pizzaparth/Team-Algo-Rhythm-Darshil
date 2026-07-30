/**
 * mockExpansion.ts — LLM-Powered Node Expansion (Phase 4)
 *
 * Replaces the Phase 2 hardcoded expansion data with real LLM calls.
 * The function signature stays IDENTICAL — store/index.ts doesn't change.
 *
 * Flow: Build context → Build expansion prompt → LLM call → Parse → Return GeneratedNode[]
 */

import type { GeneratedNode } from '../types';
import {
  chatCompletion, isLLMConfigured,
  buildEnhancedContext,
  parseExpansionResponse,
} from './ai';
import { buildExpansionPrompt } from './ai/prompts/planning';
import { planningMemory } from './ai/planningMemory';

/**
 * Generate expansion nodes for a parent via the real LLM.
 *
 * IMPORTANT: This function signature is identical to the Phase 2 version.
 * `store/index.ts` calls this function — it doesn't need to change.
 *
 * @param parentNodeId - The ID of the node to expand
 * @param parentInternalType - The internal type of the parent (unused now — LLM determines children dynamically)
 * @returns GeneratedNode[] matching the existing schema exactly
 */
export async function getMockedExpansion(
  parentNodeId: string,
  _parentInternalType: string
): Promise<GeneratedNode[]> {
  // If LLM is not configured, return a fallback node explaining the issue
  if (!isLLMConfigured()) {
    return [{
      tempId: `gen-nocfg-${Date.now()}`,
      parentId: parentNodeId,
      title: 'AI Not Configured',
      summary: 'Please add VITE_MIMO_API_KEY to your .env file and restart the dev server to enable AI-powered expansion.',
      displayType: 'Prerequisite',
      internalType: 'prerequisite',
      status: 'proposed',
      confidence: 0,
      pros: ['Easy to fix — just add the API key'],
      cons: ['AI features are disabled until configured'],
      riskFactor: 'Low',
    }];
  }

  try {
    // Build enhanced context from all stores
    const context = buildEnhancedContext();

    // Build the expansion prompt
    const messages = buildExpansionPrompt(parentNodeId, context);

    // Call the LLM with structured JSON output
    const raw = await chatCompletion(messages, {
      temperature: 0.6,
      maxTokens: 3000,
      responseFormat: { type: 'json_object' },
    });

    // Parse and validate the response
    const result = parseExpansionResponse(raw, parentNodeId);

    if (result.nodes.length === 0) {
      // LLM returned no nodes — provide a helpful fallback
      return [{
        tempId: `gen-empty-${Date.now()}`,
        parentId: parentNodeId,
        title: 'Analysis Complete — No Further Decomposition Needed',
        summary: 'The AI determined that this node is already at an appropriate level of detail. Consider expanding a different branch or adding your own nodes.',
        displayType: 'Expected Outcome',
        internalType: 'outcome',
        status: 'proposed',
        confidence: 80,
        pros: ['Node is sufficiently detailed'],
        cons: ['No additional sub-strategies identified'],
        riskFactor: 'Low',
      }];
    }

    // Record the expansion in planning memory
    planningMemory.recordExpansion(parentNodeId, result.nodes.length);

    return result.nodes;

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[getMockedExpansion] LLM expansion failed:', message);

    // Return an error node so the graph still updates (graceful degradation)
    return [{
      tempId: `gen-err-${Date.now()}`,
      parentId: parentNodeId,
      title: 'Expansion Error',
      summary: `AI expansion failed: ${message}. Please try again or add nodes manually.`,
      displayType: 'Risk Factor',
      internalType: 'risk',
      status: 'proposed',
      confidence: 0,
      pros: ['Error is recoverable — try again'],
      cons: [`Error: ${message}`],
      riskFactor: 'High',
    }];
  }
}
