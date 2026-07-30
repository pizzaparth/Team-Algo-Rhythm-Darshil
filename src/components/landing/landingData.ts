import type { LandingDomainItem, LandingWorkflowStep } from './landingTypes';

export const DOMAINS: LandingDomainItem[] = [
  { id: 'business', name: 'Business Strategy', icon: 'Building2', description: 'Monetization pivots, market entry, & growth trees', sampleTopic: 'SaaS Monetization Strategy Pivot: Usage-Based vs Tiered Seats' },
  { id: 'software', name: 'Software Architecture', icon: 'Code2', description: 'Distributed systems, microservices & tech stack choices', sampleTopic: 'Global Event-Driven Microservices vs Serverless Monolith' },
  { id: 'research', name: 'AI & Deep Research', icon: 'Sparkles', description: 'Hypothesis testing, literature synthesis & reasoning', sampleTopic: 'Evaluating Multimodal Reasoning Models for On-Device Edge AI' },
  { id: 'finance', name: 'Finance & Venture', icon: 'TrendingUp', description: 'Portfolio diversification, risk assessment & capital allocation', sampleTopic: 'Series A Capital Allocation: Growth Marketing vs Core R&D' },
  { id: 'politics', name: 'Public Policy', icon: 'Landmark', description: 'Regulatory impacts, stakeholder analysis & policy trees', sampleTopic: 'Global AI Safety Regulatory Framework Implementation' },
  { id: 'career', name: 'Career & Executive', icon: 'Briefcase', description: 'Leadership decisions, strategic career pivots & equity options', sampleTopic: 'Founding Engineer at Seed Startup vs Tech Lead at BigTech' },
  { id: 'education', name: 'Education & Curriculum', icon: 'GraduationCap', description: 'Adaptive learning design & institutional strategy', sampleTopic: 'Integrating Generative AI into STEM University Curriculums' },
  { id: 'legal', name: 'Legal & Compliance', icon: 'Scale', description: 'Risk mitigation, IP strategy & contractual trade-offs', sampleTopic: 'Cross-Border Data Privacy Compliance Framework for EU & US' },
  { id: 'healthcare', name: 'Healthcare Planning', icon: 'HeartPulse', description: 'Clinical AI adoption, data security & patient outcome models', sampleTopic: 'Deploying Predictive Diagnostic AI in Multi-Hospital Systems' }
];

export const WORKFLOW_STEPS: LandingWorkflowStep[] = [
  {
    step: 1,
    title: 'Start a Conversation',
    shortDesc: 'Describe your complex strategic problem naturally.',
    fullDesc: 'Type your objective or challenge in plain language. StateGraph ingests multi-faceted scenarios without requiring strict framing.',
    iconName: 'MessageSquareText'
  },
  {
    step: 2,
    title: 'Essential AI Clarification',
    shortDesc: 'The AI asks only targeted, critical questions.',
    fullDesc: 'Instead of hallucinating assumptions, StateGraph identifies hidden constraints and asks 2–3 precise clarifying questions.',
    iconName: 'HelpCircle'
  },
  {
    step: 3,
    title: 'Click "Start Planning"',
    shortDesc: 'Trigger automated visual graph synthesis.',
    fullDesc: 'Initiate structural decompilation. The AI parses the goal, hypotheses, constraints, and web research into a structured canvas.',
    iconName: 'GitFork'
  },
  {
    step: 4,
    title: 'Visual Decision Graph Synthesis',
    shortDesc: 'Conversations convert into a structured reasoning tree.',
    fullDesc: 'Dense text disappears. A clean hierarchical graph displays hypotheses, source grounds, risks, trade-offs, and action nodes.',
    iconName: 'Network'
  },
  {
    step: 5,
    title: 'Expand & Deep-Dive Branches',
    shortDesc: 'Click nodes to inspect evidence and expand sub-trees.',
    fullDesc: 'Drill down into specific sub-strategies. Expand branches to uncover sub-hypotheses, confidence metrics, and research citations.',
    iconName: 'ZoomIn'
  },
  {
    step: 6,
    title: 'User + AI Co-Creation',
    shortDesc: 'Add custom user nodes & override assumptions.',
    fullDesc: 'Inject your domain expertise directly into the tree. Add custom nodes, edit constraints, or prompt AI to re-evaluate branches.',
    iconName: 'Edit3'
  },
  {
    step: 7,
    title: 'Side-by-Side Strategy Comparison',
    shortDesc: 'Evaluate competing options with confidence matrices.',
    fullDesc: 'Compare Option A vs Option B across metrics like risk, ROI, execution speed, and resource intensity in real time.',
    iconName: 'Columns'
  },
  {
    step: 8,
    title: 'Execution & Action Plan',
    shortDesc: 'Reach an informed decision with clear next steps.',
    fullDesc: 'Export the finalized decision tree as Markdown, interactive JSON, or executive visual summary ready for team alignment.',
    iconName: 'CheckCircle2'
  }
];
