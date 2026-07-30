import { DomainConfig } from '../../../../types';

export const businessDomain: DomainConfig = {
  id: 'business',
  displayName: 'Business & Startup Planning',
  nodeTypeLabels: {
    root: 'Business Challenge',
    strategic: 'Business Strategy',
    alternative: 'Market Alternative',
    risk: 'Business Risk',
    prerequisite: 'Business Prerequisite',
    outcome: 'Business Outcome',
  },
  systemPromptFragment: `You are a business strategy and startup planning assistant. You analyse market dynamics, competitive landscapes, financial models, go-to-market strategies, organisational design, and growth trajectories. You consider unit economics, market timing, competitive moats, regulatory environments, and capital efficiency. You recommend strategies that are commercially viable, data-informed, and execution-focused.`,
  starterQuestions: [
    'What business challenge or opportunity are you exploring?',
    'What is your target market and customer segment?',
    'What are your current resources and constraints?',
    'What does success look like for this initiative?',
  ],
  expertTypes: ['Management Consultant', 'Financial Analyst', 'Market Researcher', 'Venture Capitalist', 'Industry Analyst', 'Operations Expert'],
  researchPriorities: ['industry_reports', 'news', 'academic', 'financial_data', 'government'],
};
