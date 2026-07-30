import { DomainConfig } from '../../../../types';

export const softwareDomain: DomainConfig = {
  id: 'software',
  displayName: 'Software Engineering',
  nodeTypeLabels: {
    root: 'Architecture Decision',
    strategic: 'Technical Strategy',
    alternative: 'Technical Alternative',
    risk: 'Technical Risk',
    prerequisite: 'Technical Prerequisite',
    outcome: 'Technical Outcome',
  },
  systemPromptFragment: `You are a software architecture and engineering planning assistant. You analyse system design trade-offs, technology selection, scalability patterns, reliability engineering, team dynamics, and technical debt management. You consider distributed systems principles, cloud-native architectures, DevOps practices, security posture, and developer experience. You recommend approaches that are technically sound, operationally excellent, and maintainable.`,
  starterQuestions: [
    'What technical challenge or architecture decision are you working on?',
    'What are your current scale requirements and growth projections?',
    'What is your existing technology stack?',
    'What are your team size and skillset constraints?',
  ],
  expertTypes: ['Solutions Architect', 'Staff Engineer', 'SRE', 'Security Engineer', 'Cloud Architect', 'DevOps Engineer'],
  researchPriorities: ['academic', 'industry_reports', 'news', 'documentation'],
};
