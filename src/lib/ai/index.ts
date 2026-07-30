/**
 * src/lib/ai/index.ts — Re-exports for the AI module
 */

export { chatCompletion, chatCompletionStream, isLLMConfigured } from './llmClient';
export { research, isTavilyConfigured } from './researchPipeline';
export { buildEnhancedContext, addResearchToCache, getResearchCache } from './contextBuilder';
export { classifyIntent } from './intentClassifier';
export { planningMemory } from './planningMemory';
export {
  extractJSON,
  parseExpansionResponse,
  parseClarificationResponse,
  parseResearchSummary,
  parseSuggestionResponse,
} from './responseParser';

// Domain configs
export { generalDomain } from './prompts/domains/general';
export { politicsDomain } from './prompts/domains/politics';
export { businessDomain } from './prompts/domains/business';
export { softwareDomain } from './prompts/domains/software';

// Prompt builders
export { buildSystemPrompt, buildGraphContextBlock, buildResearchContextBlock } from './prompts/system';
export { buildExpansionPrompt, buildInitialPlanPrompt, buildClarificationPrompt } from './prompts/planning';
export { buildConversationPrompt, buildSummarisationPrompt } from './prompts/conversation';
export { buildResearchSummaryPrompt } from './prompts/research';
export { buildSuggestionPrompt } from './prompts/suggestion';
export { buildExpertPrompt } from './prompts/expert';
