/**
 * aiService.ts — Real AI Orchestrator (Phase 4)
 *
 * Replaces the Phase 3 mock. Same exported interface, real intelligence.
 *
 * Flow:
 *   User Input → Intent Classification → Route to handler →
 *   Context Builder → Prompt Builder → LLM Call → Response Parser →
 *   Return AIServiceResponse
 *
 * Per PRD §12.1: "The AI system is built around a central Orchestrator
 * that coordinates between the user's intent, the planning engine,
 * the research pipeline, and the graph state."
 */

import type {
  AIContext, AIServiceResponse, AIQuestion,
  GraphNode, EnhancedAIContext,
} from '../types';
import {
  chatCompletion, isLLMConfigured,
  buildEnhancedContext, addResearchToCache,
  classifyIntent,
  planningMemory,
  parseExpansionResponse, parseClarificationResponse,
  research, isTavilyConfigured,
} from './ai';
import { buildExpansionPrompt, buildClarificationPrompt } from './ai/prompts/planning';
import { buildConversationPrompt, buildSummarisationPrompt } from './ai/prompts/conversation';

// =============================================
// Utility
// =============================================

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// =============================================
// AI Service — Real Orchestrator
// =============================================

/**
 * The main AI service. Exported with the same interface as the Phase 3 mock.
 * Both `mockAIService` (legacy name) and `aiService` are exported for
 * backwards compatibility with existing dynamic imports.
 */
export const aiService = {
  /**
   * Process a user chat message with full planning context.
   * Routes through: intent classification → appropriate handler.
   */
  async processMessage(input: string, context: AIContext): Promise<AIServiceResponse> {
    // Build enhanced context
    const enhanced = buildEnhancedContext();

    // Overlay any pending question from the passed context
    if (context.pendingQuestion) {
      enhanced.pendingQuestion = context.pendingQuestion;
    }

    // Check if LLM is configured
    if (!isLLMConfigured()) {
      return {
        chatMessage: '⚠️ **AI not configured.** Please add your API key to the `.env` file and restart the dev server.\n\nRequired: `VITE_MIMO_API_KEY`',
      };
    }

    // Classify intent
    const intent = classifyIntent(input, enhanced);

    try {
      switch (intent) {
        case 'CLARIFICATION_RESPONSE':
          return await handleClarificationResponse(input, enhanced);

        case 'EXPAND_NODE':
          if (enhanced.selectedNode) {
            return await aiService.expandWithClarification(enhanced.selectedNode.id, context);
          }
          return {
            chatMessage: 'Please select a node on the graph first, then ask me to expand it.',
          };

        case 'RESEARCH_REQUEST':
          return await handleResearchRequest(input, enhanced);

        case 'ANALYSE':
        case 'SUMMARISE':
        case 'CHAT':
        default:
          return await handleConversation(input, enhanced);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[AIService] Error:', message);
      return {
        chatMessage: `⚠️ **AI Error:** ${message}\n\nPlease try again. If the problem persists, check your API key and network connection.`,
        followUpActions: [
          { label: 'Retry', action: 'retry' },
        ],
      };
    }
  },

  /**
   * Expansion workflow with optional clarification.
   * Case A: Enough info → expand directly via LLM
   * Case B: High-risk/complex → ask clarification first
   */
  async expandWithClarification(nodeId: string, _context: AIContext): Promise<AIServiceResponse> {
    const enhanced = buildEnhancedContext();

    if (!isLLMConfigured()) {
      return { chatMessage: '⚠️ **AI not configured.** Please add your API key to the `.env` file.' };
    }

    const node = enhanced.selectedNode ??
      enhanced.graphSnapshot.serializedNodes.find(n => n.id === nodeId) as any;

    if (!node) {
      return {
        chatMessage: `I couldn't find node **${nodeId}** in the current graph. Please select a valid node and try again.`,
      };
    }

    const nodeTitle = node.data?.title ?? node.title ?? nodeId;
    const riskFactor = node.data?.riskFactor ?? node.risk ?? 'Medium';

    try {
      // Case B: High-risk nodes → check if clarification is needed
      if (riskFactor === 'High' || riskFactor === 'Critical') {
        const clarMessages = buildClarificationPrompt(nodeId, enhanced);
        const clarRaw = await chatCompletion(clarMessages, {
          temperature: 0.3,
          maxTokens: 800,
          responseFormat: { type: 'json_object' },
        });

        const clarResult = parseClarificationResponse(clarRaw);

        if (clarResult.needsClarification) {
          const question: AIQuestion = {
            id: uid('q'),
            question: clarResult.question || `Before expanding **"${nodeTitle}"**, I need some additional context. ${clarResult.context}`,
            context: clarResult.context || `This node has **${riskFactor}** risk. The expansion strategy depends on your priorities.`,
            pendingOperation: 'EXPAND_NODE',
            pendingNodeId: nodeId,
            options: clarResult.options.length > 0 ? clarResult.options : undefined,
          };

          return {
            chatMessage: `I've identified that **"${nodeTitle}"** has significant complexity. Before expanding, I'd like to understand your priorities better.`,
            clarificationNeeded: question,
          };
        }
      }

      // Case A: Direct expansion
      return await executeExpansion(nodeId, enhanced);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        chatMessage: `⚠️ **Expansion failed:** ${message}\n\nFalling back to analysis mode. You can try expanding again.`,
      };
    }
  },

  /**
   * Generate a real branch summary via LLM.
   */
  async summariseBranch(nodeId: string, _context: AIContext): Promise<string> {
    const enhanced = buildEnhancedContext();

    if (!isLLMConfigured()) {
      return '⚠️ AI not configured. Please add your API key.';
    }

    try {
      const messages = buildSummarisationPrompt(nodeId, enhanced);
      const response = await chatCompletion(messages, {
        temperature: 0.4,
        maxTokens: 1500,
      });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return `⚠️ Summary generation failed: ${message}`;
    }
  },

  /**
   * Acknowledges a user-created node. This is a quick local response
   * (no LLM call needed — just context acknowledgment).
   */
  generateNodeAcknowledgment(node: GraphNode, parentTitle: string): string {
    return (
      `I see you've added **"${node.data.title}"** as a child of **"${parentTitle}"**. ` +
      `I've incorporated this into the planning context.\n\n` +
      `This user-created node sits at **depth ${node.data.depth}** in the graph. ` +
      `I'll treat it exactly like an AI-generated node for future analysis and expansion.\n\n` +
      `Would you like me to expand it, or refine its attributes?`
    );
  },
};

// Legacy export name for backwards compatibility
export const mockAIService = aiService;

// =============================================
// Internal Handlers
// =============================================

/**
 * Execute actual LLM-powered expansion for a node.
 */
async function executeExpansion(nodeId: string, context: EnhancedAIContext): Promise<AIServiceResponse> {
  const messages = buildExpansionPrompt(nodeId, context);
  const raw = await chatCompletion(messages, {
    temperature: 0.6,
    maxTokens: 3000,
    responseFormat: { type: 'json_object' },
  });

  const result = parseExpansionResponse(raw, nodeId);

  if (result.nodes.length === 0) {
    return {
      chatMessage: `I analysed **"${nodeId}"** but couldn't generate meaningful sub-branches. This node may already be at an appropriate level of detail.\n\nWould you like me to try with a different approach?`,
      followUpActions: [
        { label: 'Try again', action: 'expand_node' },
        { label: 'Analyse instead', action: 'analyse_node' },
      ],
    };
  }

  // Record expansion in memory
  planningMemory.recordExpansion(nodeId, result.nodes.length);

  const nodeTitle = context.selectedNode?.data.title ?? nodeId;

  let chatMessage = `I've expanded **"${nodeTitle}"** and generated **${result.nodes.length}** sub-branches.\n\n`;

  if (result.reasoning) {
    chatMessage += `**Reasoning:** ${result.reasoning}\n\n`;
  }

  chatMessage += `**Generated branches:**\n`;
  result.nodes.forEach((n, i) => {
    chatMessage += `${i + 1}. **${n.title}** — ${n.displayType} (${n.confidence}% confidence, ${n.riskFactor} risk)\n`;
  });

  if (result.historicalReferences.length > 0) {
    chatMessage += `\n**Historical context:**\n`;
    result.historicalReferences.forEach(ref => {
      chatMessage += `- *${ref.entity}:* ${ref.caseStudy} → ${ref.outcome}\n`;
    });
  }

  return {
    chatMessage,
    suggestions: result.suggestions.length > 0 ? result.suggestions : undefined,
    followUpActions: [
      { label: 'Summarise branch', action: 'summarise_branch' },
      { label: 'Compare with siblings', action: 'compare_siblings' },
    ],
  };
}

/**
 * Handle a clarification response — resume the pending expansion.
 */
async function handleClarificationResponse(
  answer: string,
  context: EnhancedAIContext,
): Promise<AIServiceResponse> {
  const pending = context.pendingQuestion;
  if (!pending) {
    return { chatMessage: 'No pending question found. Please try your request again.' };
  }

  // Record the clarification
  planningMemory.recordClarification(pending.question, answer);

  // Extract user preference if it looks like a risk tolerance answer
  const lowerAnswer = answer.toLowerCase();
  if (lowerAnswer.includes('conservative') || lowerAnswer.includes('aggressive') || lowerAnswer.includes('balanced')) {
    planningMemory.setPreference('risk_tolerance', lowerAnswer.includes('aggressive') ? 'aggressive' : lowerAnswer.includes('conservative') ? 'conservative' : 'balanced');
  }

  const nodeId = pending.pendingNodeId;
  if (!nodeId) {
    return { chatMessage: 'Thank you for the clarification. However, no node expansion was pending.' };
  }

  // Re-run expansion with the user's answer incorporated into context
  const expansionMessages = buildExpansionPrompt(
    nodeId,
    context,
    `The user was asked: "${pending.question}" and responded: "${answer}". Incorporate this into the expansion strategy.`,
  );

  const raw = await chatCompletion(expansionMessages, {
    temperature: 0.6,
    maxTokens: 3000,
    responseFormat: { type: 'json_object' },
  });

  const result = parseExpansionResponse(raw, nodeId);
  planningMemory.recordExpansion(nodeId, result.nodes.length);

  let chatMessage = `Thank you for the clarification. I've incorporated your preference into the expansion.\n\n`;
  chatMessage += `**Generated ${result.nodes.length} branches:**\n`;
  result.nodes.forEach((n, i) => {
    chatMessage += `${i + 1}. **${n.title}** — ${n.displayType} (${n.confidence}% confidence)\n`;
  });

  return {
    chatMessage,
    suggestions: result.suggestions.length > 0 ? result.suggestions : undefined,
    followUpActions: [
      { label: 'View expansion', action: 'focus_expanded_node' },
      { label: 'Summarise result', action: 'summarise_branch' },
    ],
  };
}

/**
 * Handle a research request — run Tavily → summarise → respond.
 */
async function handleResearchRequest(
  input: string,
  context: EnhancedAIContext,
): Promise<AIServiceResponse> {
  if (!isTavilyConfigured()) {
    return {
      chatMessage: '⚠️ **Research not available.** The Tavily API key is not configured.\n\nAdd `VITE_TAVILY_API_KEY` to your `.env` file to enable web research.',
    };
  }

  // Extract the research query from user input
  const query = input
    .replace(/^(research|look\s*up|find\s*(out|info|data|research)?|search\s*(for|the)?|investigate|get\s*(me\s*)?info)\s*/i, '')
    .trim() || input;

  const nodeContext = context.selectedNode?.data.title
    ? ` related to "${context.selectedNode.data.title}"`
    : '';

  let chatMessage = `🔍 Researching: **"${query}"**${nodeContext}...\n\n`;

  try {
    const result = await research(query, context);
    addResearchToCache(result);

    chatMessage += `**Research Summary:**\n${result.summary}\n\n`;

    if (result.sources.length > 0) {
      chatMessage += `**Sources:**\n`;
      result.sources.forEach((s, i) => {
        chatMessage += `${i + 1}. [${s.title}](${s.url}) — *${s.reliability} reliability*\n`;
      });
    }

    chatMessage += `\n*This research has been added to the planning context and will inform future expansions.*`;

    return {
      chatMessage,
      followUpActions: [
        { label: 'Research more', action: 'research_more' },
        { label: 'Expand with research', action: 'expand_node' },
      ],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      chatMessage: `⚠️ Research failed: ${message}\n\nPlease try again with a different query.`,
    };
  }
}

/**
 * Handle general conversation and analysis.
 */
async function handleConversation(
  input: string,
  context: EnhancedAIContext,
): Promise<AIServiceResponse> {
  const messages = buildConversationPrompt(input, context);

  const response = await chatCompletion(messages, {
    temperature: 0.7,
    maxTokens: 2000,
  });

  // Build follow-up actions based on context
  const followUpActions: { label: string; action: string }[] = [];
  if (context.selectedNode) {
    followUpActions.push(
      { label: 'Expand this node', action: 'expand_node' },
      { label: 'Compare with siblings', action: 'compare_siblings' },
    );
  } else {
    followUpActions.push(
      { label: 'Jump to root', action: 'jump_to_root' },
      { label: 'Fit view', action: 'apply_layout' },
    );
  }

  return {
    chatMessage: response,
    followUpActions,
  };
}
