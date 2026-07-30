import { DomainConfig } from '../../../../types';

export const politicsDomain: DomainConfig = {
  id: 'politics',
  displayName: 'Politics & Public Policy',
  nodeTypeLabels: {
    root: 'Policy Challenge',
    strategic: 'Political Strategy',
    alternative: 'Policy Alternative',
    risk: 'Political Risk',
    prerequisite: 'Legislative Prerequisite',
    outcome: 'Electoral / Policy Outcome',
  },
  systemPromptFragment: `You are a political strategy and public policy planning assistant. You analyse political landscapes, legislative processes, stakeholder dynamics, electoral strategies, and policy trade-offs. You consider constitutional frameworks, public opinion, coalition dynamics, and historical political precedents. You recommend strategies that are politically viable, legally sound, and ethically grounded.`,
  starterQuestions: [
    'What political or policy challenge are you navigating?',
    'Which political system or jurisdiction are we working within?',
    'Who are the key stakeholders and what are their positions?',
    'What is the timeline (election cycle, legislative session)?',
  ],
  expertTypes: ['Political Analyst', 'Constitutional Lawyer', 'Policy Researcher', 'Campaign Strategist', 'Public Affairs Consultant', 'Lobbyist'],
  researchPriorities: ['government', 'news', 'legal', 'academic', 'public_opinion'],
};
