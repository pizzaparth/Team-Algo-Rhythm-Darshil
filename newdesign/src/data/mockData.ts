import { DomainItem, ReasoningTree, WorkflowStep } from '../types';

export const DOMAINS: DomainItem[] = [
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

export const WORKFLOW_STEPS: WorkflowStep[] = [
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

export const SAMPLE_REASONING_TREES: Record<string, ReasoningTree> = {
  saas: {
    id: 'saas',
    topic: 'SaaS Monetization Strategy Pivot: Hybrid Usage-Based Pricing',
    domain: 'Business Strategy',
    rootNodeId: 'root-1',
    updatedAt: '2026-07-30',
    nodes: {
      'root-1': {
        id: 'root-1',
        title: 'Core Goal: Transition to Hybrid Usage-Based Pricing Model',
        category: 'root',
        summary: 'Align revenue growth with customer value delivery while maintaining ARR predictability.',
        detail: 'Current per-seat billing cap creates friction for high-volume enterprise teams. We evaluate pivoting from $49/seat/mo to $20/seat base + tiered consumption billing.',
        confidenceScore: 92,
        expanded: true,
        childrenIds: ['hypo-1', 'hypo-2', 'hypo-3'],
        x: 0,
        y: 0,
        status: 'recommended',
        metrics: [
          { label: 'Projected ARR Delta', value: '+34%' },
          { label: 'Customer Friction', value: 'Low-Medium' }
        ]
      },
      'hypo-1': {
        id: 'hypo-1',
        title: 'Strategy A: Pure Usage Billing ($0 Base + $0.05/API call)',
        category: 'strategy',
        summary: 'Maximum growth potential for dev-heavy workloads, but higher revenue volatility.',
        detail: 'Eliminates entry barrier completely. However, CFOs dislike unpredictable monthly bills, which may delay enterprise deal sign-offs.',
        confidenceScore: 78,
        expanded: true,
        childrenIds: ['risk-1', 'action-1'],
        x: -280,
        y: 160,
        status: 'evaluating',
        pros: ['Zero onboarding friction', 'Direct correlation to customer scale'],
        cons: ['Revenue volatility in Q4', 'CFO approval resistance'],
        sources: ['Stripe 2025 SaaS Monetization Benchmark Report']
      },
      'hypo-2': {
        id: 'hypo-2',
        title: 'Strategy B: Hybrid Platform Fee + Included Monthly Credits (Recommended)',
        category: 'strategy',
        summary: 'Combines predictable recurring baseline ARR with usage expansion upside.',
        detail: '$2,500/yr platform fee includes 100,000 computation credits/mo. Additional credits billed at tiered bulk rates. Guarantees base ARR floor.',
        confidenceScore: 94,
        expanded: true,
        childrenIds: ['tradeoff-1', 'action-2'],
        x: 0,
        y: 160,
        status: 'recommended',
        pros: ['Guaranteed base revenue floor', 'Smoother transition for existing users', 'Predictable budgets for CFOs'],
        cons: ['Requires real-time billing telemetry dashboard'],
        sources: ['Bessemer Cloud Index 2025', 'OpenView Usage-Based Pricing Study']
      },
      'hypo-3': {
        id: 'hypo-3',
        title: 'Strategy C: Stay Tiered Per-Seat with Usage Add-ons',
        category: 'strategy',
        summary: 'Safest short-term option, but risks churn to usage-native competitors.',
        detail: 'Keep existing tier pricing intact and introduce paid add-on modules for advanced AI power tools.',
        confidenceScore: 65,
        expanded: false,
        childrenIds: [],
        x: 280,
        y: 160,
        status: 'archived',
        pros: ['Zero immediate engineering lift'],
        cons: ['Leaves 40%+ expansion revenue on the table']
      },
      'risk-1': {
        id: 'risk-1',
        title: 'Risk: Revenue Volatility & Customer Bill Shock',
        category: 'risk',
        summary: 'Uncapped usage spikes could cause customer complaints and churn.',
        detail: 'Automated spending alerts and hard ceiling toggles must be built prior to launch.',
        confidenceScore: 85,
        expanded: false,
        childrenIds: [],
        x: -360,
        y: 320,
        status: 'evaluating'
      },
      'action-1': {
        id: 'action-1',
        title: 'Action: Run 30-Day Closed Beta with Top 20 Developer Accounts',
        category: 'action',
        summary: 'Validate usage metrics and willingness to pay before public launch.',
        detail: 'Shadow-bill existing accounts for 30 days to quantify expected bill changes.',
        confidenceScore: 90,
        expanded: false,
        childrenIds: [],
        x: -200,
        y: 320,
        status: 'active'
      },
      'tradeoff-1': {
        id: 'tradeoff-1',
        title: 'Trade-off: Billing Infrastructure Complexity vs Speed to Market',
        category: 'tradeoff',
        summary: 'Building custom meter aggregator takes 4 weeks vs 1 week for Stripe Usage API.',
        detail: 'Integrate with dedicated metering middleware (e.g. Lago / Orb) to compress dev timeline to 10 days.',
        confidenceScore: 91,
        expanded: false,
        childrenIds: [],
        x: -80,
        y: 320,
        status: 'recommended'
      },
      'action-2': {
        id: 'action-2',
        title: 'Action: Implement Credit Telemetry Dashboard in Product',
        category: 'action',
        summary: 'Give workspace admins real-time visibility into monthly credit burn.',
        detail: 'Real-time progress bars in settings page reduce support tickets by an estimated 65%.',
        confidenceScore: 96,
        expanded: false,
        childrenIds: [],
        x: 120,
        y: 320,
        status: 'active'
      }
    }
  }
};
