/**
 * general.ts — Default Domain Configuration
 *
 * Fallback domain for any project that doesn't match a specific domain.
 * Works for personal planning, generic strategy, etc.
 */

import type { DomainConfig } from '../../../../types';

export const generalDomain: DomainConfig = {
  id: 'general',
  displayName: 'General Planning',
  nodeTypeLabels: {
    root: 'Root Decision',
    strategic: 'Strategy',
    alternative: 'Alternative',
    risk: 'Risk Factor',
    prerequisite: 'Prerequisite',
    outcome: 'Expected Outcome',
  },
  systemPromptFragment: `You are a general-purpose strategic planning assistant. You help users break down complex decisions into structured reasoning trees. You consider multiple perspectives, weigh trade-offs, and help identify optimal paths forward.`,
  starterQuestions: [
    'What decision or challenge are you trying to work through?',
    'What are the key constraints or requirements?',
    'What outcomes matter most to you?',
    'What have you already considered?',
  ],
  expertTypes: ['Strategy Consultant', 'Domain Expert', 'Risk Analyst', 'Project Manager'],
  researchPriorities: ['news', 'academic', 'industry_reports', 'government'],
};
