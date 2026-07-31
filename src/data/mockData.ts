import type { Project, Session, StrategyTemplate, GraphNode, GraphEdge, ChatMessage, AISuggestion } from '../types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Enterprise Cloud Migration & Microservices Strategy',
    description: 'Reasoning tree evaluating serverless vs containerized microservices for high-concurrency payment gateways.',
    category: 'Architecture',
    nodeCount: 14,
    updatedAt: '2 hours ago',
    createdAt: '2026-07-20',
    status: 'active'
  },
  {
    id: 'proj-2',
    name: 'Global SaaS Market Expansion & Localization',
    description: 'Decision matrix for entering APAC markets with data residency compliance (GDPR/APPI).',
    category: 'Strategy',
    nodeCount: 9,
    updatedAt: '1 day ago',
    createdAt: '2026-07-18',
    status: 'active'
  },
  {
    id: 'proj-3',
    name: 'AI Model Choice: Fine-Tuning vs RAG Architecture',
    description: 'Cost-benefit and latency analysis for customer support automation using Gemini models.',
    category: 'AI & Data',
    nodeCount: 11,
    updatedAt: '3 days ago',
    createdAt: '2026-07-15',
    status: 'active'
  }
];

export const INITIAL_SESSIONS: Session[] = [
  {
    id: 'sess-1',
    projectId: 'proj-1',
    title: 'B2B SaaS Market Entry Strategy',
    lastMessage: 'Weighing vertical healthcare compliance tooling against fintech reconciliation for initial market focus.',
    updatedAt: '10 mins ago'
  },
  {
    id: 'sess-2',
    projectId: 'proj-1',
    title: 'Investigating E20 Fuel Adoption Impact',
    lastMessage: 'Comparing independent lab mileage data against manufacturer claims for the E20 series.',
    updatedAt: '1 hour ago'
  },
  {
    id: 'sess-3',
    projectId: 'proj-2',
    title: 'Western Ghats Climate Change Research',
    lastMessage: 'Cross-referencing 2018 and 2024 Kerala flood data for rainfall attribution analysis.',
    updatedAt: 'Yesterday'
  }
];

export const STRATEGY_TEMPLATES: StrategyTemplate[] = [
  {
    id: 'tmpl-1',
    title: 'Distributed System Architecture Decision Tree',
    category: 'Engineering',
    description: 'Evaluates monolith decomposition, database partitioning, caching layers, and resilience strategies.',
    nodesCount: 12,
    iconName: 'Server'
  },
  {
    id: 'tmpl-2',
    title: 'AI Technology Stack & Foundation Model Selection',
    category: 'AI Strategy',
    description: 'Structured trade-offs between proprietary LLMs, open-weight models, RAG vs Fine-tuning.',
    nodesCount: 10,
    iconName: 'Cpu'
  },
  {
    id: 'tmpl-3',
    title: 'Product Market Entry & Competitive Moat Planning',
    category: 'Product Strategy',
    description: 'Frames pricing, go-to-market channels, compliance requirements, and defensibility.',
    nodesCount: 8,
    iconName: 'Target'
  },
  {
    id: 'tmpl-4',
    title: 'Security Posture & Compliance Architecture',
    category: 'Cybersecurity',
    description: 'Zero Trust model implementation, identity management, encryption at rest, and audit logging.',
    nodesCount: 14,
    iconName: 'ShieldCheck'
  }
];

// =============================================================
// Topic 1 — Startup founder exploring the B2B SaaS market (sess-1)
// =============================================================

export const SAAS_NODES: GraphNode[] = [
  {
    id: 'node-saas-root',
    position: { x: 60, y: 380 },
    data: {
      title: 'B2B SaaS Market Entry Strategy',
      summary: 'Root strategy evaluating go-to-market approach and vertical focus for a new B2B SaaS venture.',
      displayType: 'Root Strategy',
      internalType: 'root',
      status: 'approved',
      depth: 0,
      branchColor: '#6366f1',
      creator: 'user',
      confidence: 90,
      pros: ['Large addressable market ($200B+ B2B SaaS TAM)', 'Recurring revenue model de-risks cash flow'],
      cons: ['Highly saturated category', 'Long enterprise sales cycles'],
      riskFactor: 'Medium',
      notes: 'Kickoff after pre-seed close; runway 18 months.',
      bookmarked: true,
      collapsed: false,
      hasChildren: true,
      experts: [
        {
          id: 'exp-saas-1',
          name: 'Priya Nair',
          title: 'B2B SaaS GTM Advisor',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
          organization: 'SaaS Founders Collective',
          relevance: 'Advised 20+ seed-stage SaaS founders on vertical selection.',
          quote: 'Pick a vertical narrow enough that you can become the obvious default within 12 months.'
        }
      ],
      evidence: [
        {
          id: 'ev-saas-1',
          title: 'OpenView 2025 SaaS Benchmarks Report',
          type: 'benchmark',
          summary: 'Vertical SaaS companies show 15% higher net revenue retention than horizontal platforms at seed stage.',
          source: 'OpenView Partners',
          confidence: 90
        }
      ]
    }
  },
  {
    id: 'node-saas-a',
    position: { x: 540, y: 540 },
    data: {
      title: 'Vertical SaaS vs Horizontal Platform',
      summary: 'Deciding whether to build a narrow vertical-specific product or a broad horizontal tool.',
      displayType: 'Strategic Option',
      internalType: 'strategic',
      status: 'evaluated',
      depth: 1,
      branchColor: '#3b82f6',
      creator: 'ai',
      confidence: 85,
      pros: ['Vertical focus enables deep domain workflows', 'Easier initial word-of-mouth within a tight-knit industry'],
      cons: ['Smaller total addressable market per vertical', 'Requires deep domain expertise to build credibility'],
      riskFactor: 'Medium',
      notes: 'Leaning vertical given founder background in healthcare ops.',
      bookmarked: false,
      collapsed: false,
      hasChildren: true
    }
  },
  {
    id: 'node-saas-b',
    position: { x: 540, y: 60 },
    data: {
      title: 'Bottom-Up PLG vs Enterprise Sales-Led GTM',
      summary: 'Choosing between product-led growth with self-serve signup versus a traditional enterprise sales motion.',
      displayType: 'Alternative Option',
      internalType: 'alternative',
      status: 'in_review',
      depth: 1,
      branchColor: '#10b981',
      creator: 'ai',
      confidence: 80,
      pros: ['PLG lowers customer acquisition cost', 'Faster feedback loop from real usage data'],
      cons: ['Enterprise buyers still expect a sales conversation for compliance-heavy tools', 'Self-serve churn can be high without strong onboarding'],
      riskFactor: 'Medium',
      notes: 'Considering hybrid: PLG trial with sales-assisted close for accounts >$10k ACV.',
      bookmarked: true,
      collapsed: false,
      hasChildren: true
    }
  },
  {
    id: 'node-saas-a1',
    position: { x: 1020, y: 700 },
    data: {
      title: 'Target Vertical: Healthcare Compliance Tooling',
      summary: 'Building workflow automation for HIPAA compliance documentation in mid-size clinics.',
      displayType: 'Strategic Option',
      internalType: 'strategic',
      status: 'evaluated',
      depth: 2,
      branchColor: '#3b82f6',
      creator: 'ai',
      confidence: 88,
      pros: ['High willingness to pay due to regulatory risk', 'Founder has 6 years healthcare ops experience'],
      cons: ['Long sales cycles typical in healthcare (avg 4-6 months)', 'Requires HIPAA-compliant infrastructure from day one'],
      riskFactor: 'Medium',
      notes: '',
      bookmarked: false,
      collapsed: false,
      hasChildren: true
    }
  },
  {
    id: 'node-saas-a2',
    position: { x: 1020, y: 380 },
    data: {
      title: 'Target Vertical: Fintech Reconciliation Tools',
      summary: 'Building automated transaction reconciliation software for small fintech lenders.',
      displayType: 'Alternative Option',
      internalType: 'alternative',
      status: 'proposed',
      depth: 2,
      branchColor: '#3b82f6',
      creator: 'ai',
      confidence: 72,
      pros: ['Clear ROI story (hours saved per week)', 'Fintech buyers move faster than healthcare'],
      cons: ['No existing founder network in fintech', 'Competitive category with well-funded incumbents'],
      riskFactor: 'High',
      notes: 'De-prioritized in favor of healthcare given founder fit.',
      bookmarked: false,
      collapsed: false,
      hasChildren: false
    }
  },
  {
    id: 'node-saas-b1',
    position: { x: 1020, y: 60 },
    data: {
      title: 'Product-Led Growth Funnel Design',
      summary: 'Designing a self-serve trial-to-paid funnel with in-product upgrade prompts.',
      displayType: 'Strategic Option',
      internalType: 'strategic',
      status: 'in_review',
      depth: 2,
      branchColor: '#10b981',
      creator: 'ai',
      confidence: 78,
      pros: ['Reduces dependency on founder-led sales', 'Scales without linear headcount growth'],
      cons: ['Requires significant onboarding UX investment', 'Free trial abuse risk without card-upfront gating'],
      riskFactor: 'Medium',
      notes: '',
      bookmarked: false,
      collapsed: false,
      hasChildren: true
    }
  },
  {
    id: 'node-saas-a1a',
    position: { x: 1500, y: 700 },
    data: {
      title: 'HIPAA Compliance & Data Residency Requirements',
      summary: 'Mapping infrastructure and legal requirements to achieve HIPAA compliance before first customer contract.',
      displayType: 'Prerequisite',
      internalType: 'prerequisite',
      status: 'proposed',
      depth: 3,
      branchColor: '#3b82f6',
      creator: 'ai',
      confidence: 82,
      pros: ['Removes primary sales objection from prospective clinics', 'Signed BAAs unlock enterprise procurement'],
      cons: ['Adds 2-3 months to launch timeline', 'Increases infra cost via compliant hosting (AWS HIPAA-eligible services)'],
      riskFactor: 'High',
      notes: 'Legal counsel engaged to draft Business Associate Agreements.',
      bookmarked: true,
      collapsed: false,
      hasChildren: true
    }
  },
  {
    id: 'node-saas-b1a',
    position: { x: 1500, y: 60 },
    data: {
      title: 'Freemium Pricing Tier Cannibalization Risk',
      summary: 'Assessing whether a generous free tier will suppress conversion to paid plans.',
      displayType: 'Risk Factor',
      internalType: 'risk',
      status: 'proposed',
      depth: 3,
      branchColor: '#10b981',
      creator: 'ai',
      confidence: 68,
      pros: ['Free tier drives top-of-funnel signups and word-of-mouth'],
      cons: ['Historical PLG SaaS data shows 2-4% free-to-paid conversion is common', 'Support costs scale even for non-paying users'],
      riskFactor: 'High',
      notes: 'Considering usage caps rather than full feature gating.',
      bookmarked: false,
      collapsed: false,
      hasChildren: true
    }
  },
  {
    id: 'node-saas-a1a1',
    position: { x: 1980, y: 700 },
    data: {
      title: 'SOC 2 Type II Audit Timeline & Cost',
      summary: 'Scoping the audit process required alongside HIPAA to satisfy enterprise procurement teams.',
      displayType: 'Expected Outcome',
      internalType: 'outcome',
      status: 'proposed',
      depth: 4,
      branchColor: '#3b82f6',
      creator: 'ai',
      confidence: 75,
      pros: ['Unlocks larger clinic groups and hospital networks', 'Signals maturity to investors ahead of Series A'],
      cons: ['$25-40k audit cost typical for Type II', '6-12 month observation period required before certification'],
      riskFactor: 'Medium',
      notes: 'Budgeting for Type II audit in month 9 of runway.',
      bookmarked: false,
      collapsed: false,
      hasChildren: false
    }
  },
  {
    id: 'node-saas-b1a1',
    position: { x: 1980, y: 60 },
    data: {
      title: 'Usage-Based Pricing Model as Mitigation',
      summary: 'Replacing flat freemium tiers with metered usage-based pricing to align cost with value delivered.',
      displayType: 'Expected Outcome',
      internalType: 'outcome',
      status: 'proposed',
      depth: 4,
      branchColor: '#10b981',
      creator: 'ai',
      confidence: 70,
      pros: ['Aligns revenue growth with customer usage growth', 'Reduces free-rider problem seen in flat freemium tiers'],
      cons: ['Harder for prospects to predict monthly cost upfront', 'Requires metering infrastructure to be built early'],
      riskFactor: 'Medium',
      notes: '',
      bookmarked: false,
      collapsed: false,
      hasChildren: false
    }
  }
];

export const SAAS_EDGES: GraphEdge[] = [
  { id: 'e-saas-root-a', sourceId: 'node-saas-root', targetId: 'node-saas-a', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { id: 'e-saas-root-b', sourceId: 'node-saas-root', targetId: 'node-saas-b', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'e-saas-a-a1', sourceId: 'node-saas-a', targetId: 'node-saas-a1', style: { stroke: '#3b82f6', strokeWidth: 1.5 } },
  { id: 'e-saas-a-a2', sourceId: 'node-saas-a', targetId: 'node-saas-a2', style: { stroke: '#3b82f6', strokeWidth: 1.5 } },
  { id: 'e-saas-b-b1', sourceId: 'node-saas-b', targetId: 'node-saas-b1', style: { stroke: '#10b981', strokeWidth: 1.5 } },
  { id: 'e-saas-a1-a1a', sourceId: 'node-saas-a1', targetId: 'node-saas-a1a', style: { stroke: '#3b82f6', strokeWidth: 1.5 } },
  { id: 'e-saas-b1-b1a', sourceId: 'node-saas-b1', targetId: 'node-saas-b1a', style: { stroke: '#10b981', strokeWidth: 1.5 } },
  { id: 'e-saas-a1a-a1a1', sourceId: 'node-saas-a1a', targetId: 'node-saas-a1a1', style: { stroke: '#3b82f6', strokeWidth: 1.5 } },
  { id: 'e-saas-b1a-b1a1', sourceId: 'node-saas-b1a', targetId: 'node-saas-b1a1', style: { stroke: '#10b981', strokeWidth: 1.5 } }
];

export const SAAS_SUGGESTIONS: AISuggestion[] = [
  {
    id: 'sug-saas-1',
    nodeId: 'node-saas-a1a',
    title: 'Mitigate Compliance Timeline via Parallel SOC 2 Prep',
    description: 'Start SOC 2 evidence collection alongside HIPAA BAA drafting to compress the combined compliance timeline by ~6 weeks.',
    suggestedType: 'strategic',
    impactScore: 88,
    actionType: 'add_branch'
  },
  {
    id: 'sug-saas-2',
    nodeId: 'node-saas-b1a',
    title: 'Introduce Usage Caps Before Full Metering Build',
    description: 'Ship soft usage caps on the free tier as a fast interim fix while the full usage-based billing system is built.',
    suggestedType: 'alternative',
    impactScore: 81,
    actionType: 'add_branch'
  },
  {
    id: 'sug-saas-3',
    nodeId: 'node-saas-a2',
    title: 'Flag Risk: Fintech Vertical Deprioritization',
    description: 'Revisit the fintech vertical only if the healthcare sales cycle exceeds 6 months by month 12 — track as a contingency trigger.',
    suggestedType: 'risk',
    impactScore: 74,
    actionType: 'flag_risk'
  }
];

export const SAAS_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-saas-1',
    sender: 'ai',
    content: `Hello! I am your **AI Reasoning Assistant**.

I have initialized your workspace for **B2B SaaS Market Entry Strategy**.

We are currently exploring:
1. **Vertical SaaS (Healthcare Compliance)** vs horizontal platform positioning.
2. **Product-Led Growth** funnel design vs enterprise sales-led GTM.

What would you like to explore next? I can evaluate pricing risk, map compliance prerequisites, or expand a branch into the decision graph.`,
    timestamp: '11:20 AM',
    suggestedActions: [
      { label: 'Compare Healthcare vs Fintech Vertical', action: 'compare_nodes' },
      { label: 'Analyze SOC 2 Audit Timeline', action: 'analyze_soc2' },
      { label: 'Generate Pricing Risk Branch', action: 'add_pricing_risk' }
    ]
  }
];

// =============================================================
// Topic 2 — Journalist researching the impact of E20 fuel (sess-2)
// =============================================================

export const E20_NODES: GraphNode[] = [
  {
    id: 'node-e20-root',
    position: { x: 60, y: 380 },
    data: {
      title: 'Investigating the Real-World Impact of E20 Fuel Adoption',
      summary: "Root investigation into how India's shift to 20% ethanol-blended petrol (E20) affects vehicles, farmers, and food supply.",
      displayType: 'Root Strategy',
      internalType: 'root',
      status: 'in_review',
      depth: 0,
      branchColor: '#f59e0b',
      creator: 'user',
      confidence: 80,
      pros: ['Strong public interest story with policy relevance', 'Access to government ethanol procurement data via RTI'],
      cons: ['Politically sensitive — auto industry and biofuel lobby both have stakes', 'Technical claims require independent lab verification'],
      riskFactor: 'Medium',
      notes: 'Editor greenlit as a 3-part investigative series.',
      bookmarked: true,
      collapsed: false,
      hasChildren: true,
      experts: [
        {
          id: 'exp-e20-1',
          name: 'Dr. Ramesh Iyer',
          title: 'Automotive Fuels Researcher',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
          organization: 'Indian Institute of Petroleum',
          relevance: 'Published peer-reviewed studies on ethanol-blend engine wear.',
          quote: 'E20 compatibility is not binary — it exists on a spectrum depending on engine manufacture year and seal material.'
        }
      ],
      evidence: [
        {
          id: 'ev-e20-1',
          title: 'NITI Aayog Ethanol Roadmap 2020',
          type: 'paper',
          summary: 'Government target of 20% ethanol blending by 2025, later achieved ahead of schedule in 2023.',
          source: 'NITI Aayog',
          confidence: 92
        }
      ]
    }
  },
  {
    id: 'node-e20-a',
    position: { x: 540, y: 540 },
    data: {
      title: 'Vehicle Engine Compatibility & Consumer Impact',
      summary: 'Examining claims of reduced mileage and engine wear in non-flex-fuel vehicles running on E20.',
      displayType: 'Strategic Option',
      internalType: 'strategic',
      status: 'in_review',
      depth: 1,
      branchColor: '#3b82f6',
      creator: 'ai',
      confidence: 78,
      pros: ['Directly affects millions of existing vehicle owners', 'Testable via controlled mileage experiments'],
      cons: ['Manufacturer warranty language is often vague on blend limits'],
      riskFactor: 'Medium',
      notes: '',
      bookmarked: false,
      collapsed: false,
      hasChildren: true
    }
  },
  {
    id: 'node-e20-b',
    position: { x: 540, y: 60 },
    data: {
      title: 'Agricultural & Land-Use Trade-offs',
      summary: 'Examining how increased ethanol demand affects sugarcane and maize allocation between fuel and food.',
      displayType: 'Alternative Option',
      internalType: 'alternative',
      status: 'proposed',
      depth: 1,
      branchColor: '#10b981',
      creator: 'ai',
      confidence: 74,
      pros: ['Ethanol demand has raised farmer incomes in sugarcane belts (Maharashtra, UP)'],
      cons: ['Food-vs-fuel land allocation debate remains contested', 'Water-intensive sugarcane strains groundwater in drought-prone districts'],
      riskFactor: 'Medium',
      notes: '',
      bookmarked: true,
      collapsed: false,
      hasChildren: true
    }
  },
  {
    id: 'node-e20-a1',
    position: { x: 1020, y: 700 },
    data: {
      title: 'Fuel Efficiency & Mileage Reduction Claims',
      summary: 'Investigating owner-reported and lab-tested mileage drops of 3-6% on E20 versus E10 petrol.',
      displayType: 'Strategic Option',
      internalType: 'strategic',
      status: 'proposed',
      depth: 2,
      branchColor: '#3b82f6',
      creator: 'ai',
      confidence: 70,
      pros: ['Multiple independent consumer forums report consistent mileage complaints'],
      cons: ['Driving style and vehicle maintenance are confounding variables', 'Manufacturers dispute magnitude of the effect'],
      riskFactor: 'Medium',
      notes: '',
      bookmarked: false,
      collapsed: false,
      hasChildren: true
    }
  },
  {
    id: 'node-e20-a2',
    position: { x: 1020, y: 380 },
    data: {
      title: 'Older Vehicle Fleet Compatibility Risk',
      summary: 'Assessing risk to pre-2008 vehicles with rubber seals not rated for higher ethanol content.',
      displayType: 'Risk Factor',
      internalType: 'risk',
      status: 'proposed',
      depth: 2,
      branchColor: '#3b82f6',
      creator: 'ai',
      confidence: 65,
      pros: [],
      cons: ['Rubber/elastomer seals in older vehicles can degrade faster with higher ethanol content', 'Retrofitting is costly and rarely communicated to consumers'],
      riskFactor: 'High',
      notes: 'Need government data on fleet age distribution.',
      bookmarked: false,
      collapsed: false,
      hasChildren: false
    }
  },
  {
    id: 'node-e20-b1',
    position: { x: 1020, y: 60 },
    data: {
      title: 'Sugarcane & Maize Diversion from Food Supply',
      summary: 'Quantifying how much sugarcane and maize output is now diverted to ethanol distilleries versus food/feed use.',
      displayType: 'Risk Factor',
      internalType: 'risk',
      status: 'in_review',
      depth: 2,
      branchColor: '#10b981',
      creator: 'ai',
      confidence: 76,
      pros: [],
      cons: ['Maize diversion has contributed to poultry feed price increases', 'Sugar export policy is now intertwined with ethanol blending targets'],
      riskFactor: 'Medium',
      notes: '',
      bookmarked: false,
      collapsed: false,
      hasChildren: true
    }
  },
  {
    id: 'node-e20-a1a',
    position: { x: 1500, y: 700 },
    data: {
      title: 'Independent Lab Testing vs Manufacturer Data',
      summary: 'Commissioning third-party dynamometer testing to verify mileage claims independent of automaker data.',
      displayType: 'Prerequisite',
      internalType: 'prerequisite',
      status: 'proposed',
      depth: 3,
      branchColor: '#3b82f6',
      creator: 'user',
      confidence: 72,
      pros: ['Provides defensible, citable data for the article', 'Removes reliance on self-reported anecdotes'],
      cons: ['Independent lab testing costs ~₹3-5 lakh and takes 4-6 weeks'],
      riskFactor: 'Medium',
      notes: 'Requesting ARAI (Automotive Research Association of India) test slot.',
      bookmarked: true,
      collapsed: false,
      hasChildren: true
    }
  },
  {
    id: 'node-e20-b1a',
    position: { x: 1500, y: 60 },
    data: {
      title: 'State-wise Ethanol Procurement Price Policy',
      summary: 'Comparing state government ethanol procurement prices against open-market sugar prices to assess farmer incentives.',
      displayType: 'Expected Outcome',
      internalType: 'outcome',
      status: 'proposed',
      depth: 3,
      branchColor: '#10b981',
      creator: 'ai',
      confidence: 74,
      pros: ['Reveals which states are best positioned to benefit farmers'],
      cons: ['Procurement price data is scattered across state gazette notifications'],
      riskFactor: 'Low',
      notes: '',
      bookmarked: false,
      collapsed: false,
      hasChildren: true
    }
  },
  {
    id: 'node-e20-a1a1',
    position: { x: 1980, y: 700 },
    data: {
      title: 'SIAM Industry Body Response & Rebuttal',
      summary: 'Requesting formal comment from the Society of Indian Automobile Manufacturers on independent test findings.',
      displayType: 'Expected Outcome',
      internalType: 'outcome',
      status: 'proposed',
      depth: 4,
      branchColor: '#3b82f6',
      creator: 'user',
      confidence: 60,
      pros: ['Provides the balanced counter-perspective required for editorial standards'],
      cons: ['Industry bodies often delay responses past publication deadlines'],
      riskFactor: 'Medium',
      notes: 'Sent formal query; awaiting response by end of week.',
      bookmarked: false,
      collapsed: false,
      hasChildren: false
    }
  },
  {
    id: 'node-e20-b1a1',
    position: { x: 1980, y: 60 },
    data: {
      title: 'Farmer Income Impact Interview Findings',
      summary: 'Field interviews with sugarcane farmers in Kolhapur district on income changes since the E20 rollout.',
      displayType: 'Expected Outcome',
      internalType: 'outcome',
      status: 'approved',
      depth: 4,
      branchColor: '#10b981',
      creator: 'user',
      confidence: 84,
      pros: ['First-hand accounts strengthen the human-interest angle of the piece', 'Confirms procurement price data with ground reality'],
      cons: ['Small sample size (12 farmers) limits generalizability'],
      riskFactor: 'Low',
      notes: 'Interviews completed during field visit, Oct 2026.',
      bookmarked: true,
      collapsed: false,
      hasChildren: false
    }
  }
];

export const E20_EDGES: GraphEdge[] = [
  { id: 'e-e20-root-a', sourceId: 'node-e20-root', targetId: 'node-e20-a', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { id: 'e-e20-root-b', sourceId: 'node-e20-root', targetId: 'node-e20-b', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'e-e20-a-a1', sourceId: 'node-e20-a', targetId: 'node-e20-a1', style: { stroke: '#3b82f6', strokeWidth: 1.5 } },
  { id: 'e-e20-a-a2', sourceId: 'node-e20-a', targetId: 'node-e20-a2', style: { stroke: '#3b82f6', strokeWidth: 1.5 } },
  { id: 'e-e20-b-b1', sourceId: 'node-e20-b', targetId: 'node-e20-b1', style: { stroke: '#10b981', strokeWidth: 1.5 } },
  { id: 'e-e20-a1-a1a', sourceId: 'node-e20-a1', targetId: 'node-e20-a1a', style: { stroke: '#3b82f6', strokeWidth: 1.5 } },
  { id: 'e-e20-b1-b1a', sourceId: 'node-e20-b1', targetId: 'node-e20-b1a', style: { stroke: '#10b981', strokeWidth: 1.5 } },
  { id: 'e-e20-a1a-a1a1', sourceId: 'node-e20-a1a', targetId: 'node-e20-a1a1', style: { stroke: '#3b82f6', strokeWidth: 1.5 } },
  { id: 'e-e20-b1a-b1a1', sourceId: 'node-e20-b1a', targetId: 'node-e20-b1a1', style: { stroke: '#10b981', strokeWidth: 1.5 } }
];

export const E20_SUGGESTIONS: AISuggestion[] = [
  {
    id: 'sug-e20-1',
    nodeId: 'node-e20-a1a',
    title: 'Request ARAI Independent Test Slot This Month',
    description: 'The ARAI testing queue is 4-6 weeks out — booking now keeps the 3-part series on its planned publication schedule.',
    suggestedType: 'strategic',
    impactScore: 85,
    actionType: 'add_branch'
  },
  {
    id: 'sug-e20-2',
    nodeId: 'node-e20-b1a',
    title: 'Cross-Check State Procurement Data with Sugar Export Policy',
    description: 'Overlay ethanol procurement price changes with recent sugar export quota shifts to strengthen the farmer-income narrative.',
    suggestedType: 'alternative',
    impactScore: 79,
    actionType: 'add_branch'
  },
  {
    id: 'sug-e20-3',
    nodeId: 'node-e20-a2',
    title: 'Flag Risk: Fleet Age Data Gap',
    description: 'Government vehicle registration data by manufacture year is incomplete pre-2015 — flag as a methodology limitation.',
    suggestedType: 'risk',
    impactScore: 70,
    actionType: 'flag_risk'
  }
];

export const E20_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-e20-1',
    sender: 'ai',
    content: `Hello! I am your **AI Reasoning Assistant**.

I have initialized your workspace for **Investigating the Impact of E20 Fuel Adoption**.

We are currently exploring:
1. **Vehicle Engine Compatibility** — mileage and seal-wear claims on non-flex-fuel vehicles.
2. **Agricultural Trade-offs** — sugarcane and maize diversion from food supply.

What would you like to explore next? I can help you cross-check lab data, map farmer income evidence, or expand a branch into the decision graph.`,
    timestamp: '9:05 AM',
    suggestedActions: [
      { label: 'Compare Lab Data vs Manufacturer Claims', action: 'compare_nodes' },
      { label: 'Analyze Farmer Income Impact', action: 'analyze_farmer_income' },
      { label: 'Generate Fleet Compatibility Risk Branch', action: 'add_fleet_risk' }
    ]
  }
];

// =============================================================
// Topic 3 — PhD scholar researching climate change impact on the
// Western Ghats of Kerala (sess-3)
// =============================================================

export const GHATS_NODES: GraphNode[] = [
  {
    id: 'node-ghats-root',
    position: { x: 60, y: 380 },
    data: {
      title: 'Climate Change Impacts on the Western Ghats Ecosystem (Kerala)',
      summary: 'Doctoral research root mapping observed and projected climate impacts across the Kerala segment of the Western Ghats biodiversity hotspot.',
      displayType: 'Root Strategy',
      internalType: 'root',
      status: 'approved',
      depth: 0,
      branchColor: '#059669',
      creator: 'user',
      confidence: 88,
      pros: ['UNESCO World Heritage biodiversity hotspot with strong existing baseline data', 'Kerala Forest Research Institute partnership secured for field access'],
      cons: ['Multi-year field study required for statistically robust trend data', 'Remote terrain limits monitoring station density'],
      riskFactor: 'Medium',
      notes: 'Thesis proposal approved by department committee, Aug 2026.',
      bookmarked: true,
      collapsed: false,
      hasChildren: true,
      experts: [
        {
          id: 'exp-ghats-1',
          name: 'Dr. Lakshmi Menon',
          title: 'Tropical Ecology Professor',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
          organization: 'Kerala Forest Research Institute',
          relevance: '25 years studying Western Ghats shola-grassland ecosystems.',
          quote: 'The Western Ghats are warming faster at higher elevations — the shola ecosystems are the frontline of this shift.'
        }
      ],
      evidence: [
        {
          id: 'ev-ghats-1',
          title: 'IPCC AR6 Regional Fact Sheet — South Asia',
          type: 'paper',
          summary: 'Projects 1.5-2°C warming across the Western Ghats by 2050 under moderate emissions scenarios.',
          source: 'IPCC Sixth Assessment Report',
          confidence: 93
        }
      ]
    }
  },
  {
    id: 'node-ghats-a',
    position: { x: 540, y: 540 },
    data: {
      title: 'Biodiversity & Endemic Species Vulnerability',
      summary: 'Assessing climate-driven range shifts and population decline among Western Ghats endemic species.',
      displayType: 'Strategic Option',
      internalType: 'strategic',
      status: 'evaluated',
      depth: 1,
      branchColor: '#3b82f6',
      creator: 'ai',
      confidence: 84,
      pros: ['Western Ghats hosts >7,400 documented flowering plant species, high endemism', 'Strong existing IUCN baseline for comparison'],
      cons: ['Many endemic species are cryptic and under-surveyed'],
      riskFactor: 'Medium',
      notes: '',
      bookmarked: false,
      collapsed: false,
      hasChildren: true
    }
  },
  {
    id: 'node-ghats-b',
    position: { x: 540, y: 60 },
    data: {
      title: 'Hydrology & Monsoon Pattern Shifts',
      summary: 'Studying changes in monsoon onset timing, intensity, and downstream landslide/flood risk.',
      displayType: 'Alternative Option',
      internalType: 'alternative',
      status: 'in_review',
      depth: 1,
      branchColor: '#f59e0b',
      creator: 'ai',
      confidence: 80,
      pros: ['Directly links to public safety, high policy relevance', '40+ years of IMD rainfall station data available for trend analysis'],
      cons: ['Attribution to climate change vs land-use change requires careful statistical separation'],
      riskFactor: 'Medium',
      notes: '',
      bookmarked: true,
      collapsed: false,
      hasChildren: true
    }
  },
  {
    id: 'node-ghats-a1',
    position: { x: 1020, y: 700 },
    data: {
      title: 'Shola Grassland Ecosystem Degradation',
      summary: 'Tracking the retreat of native shola forest-grassland mosaic at high elevations (>1500m).',
      displayType: 'Strategic Option',
      internalType: 'strategic',
      status: 'evaluated',
      depth: 2,
      branchColor: '#3b82f6',
      creator: 'ai',
      confidence: 82,
      pros: ['Satellite time-series (Landsat) available since 1988 for change detection'],
      cons: ['Ground-truthing requires difficult high-altitude fieldwork'],
      riskFactor: 'Medium',
      notes: '',
      bookmarked: false,
      collapsed: false,
      hasChildren: true
    }
  },
  {
    id: 'node-ghats-a2',
    position: { x: 1020, y: 380 },
    data: {
      title: 'Endemic Amphibian Population Decline',
      summary: 'Documenting decline in Western Ghats endemic frog species linked to stream temperature rise.',
      displayType: 'Risk Factor',
      internalType: 'risk',
      status: 'proposed',
      depth: 2,
      branchColor: '#3b82f6',
      creator: 'ai',
      confidence: 71,
      pros: [],
      cons: ['Amphibians are highly sensitive climate bioindicators, rapid decline signals broader ecosystem stress', 'Chytrid fungus confounds pure climate attribution'],
      riskFactor: 'High',
      notes: 'Collaborating with herpetology lab for species survey protocol.',
      bookmarked: false,
      collapsed: false,
      hasChildren: false
    }
  },
  {
    id: 'node-ghats-b1',
    position: { x: 1020, y: 60 },
    data: {
      title: 'Landslide Frequency Correlation with Rainfall Intensity',
      summary: 'Correlating short-duration high-intensity rainfall events with landslide incidence in Idukki and Wayanad districts.',
      displayType: 'Risk Factor',
      internalType: 'risk',
      status: 'in_review',
      depth: 2,
      branchColor: '#f59e0b',
      creator: 'ai',
      confidence: 79,
      pros: [],
      cons: ['Deforestation and quarrying are confounding land-use variables', 'Landslide incident records before 2018 are inconsistently documented'],
      riskFactor: 'High',
      notes: 'Cross-referencing with Kerala State Disaster Management Authority records.',
      bookmarked: true,
      collapsed: false,
      hasChildren: true
    }
  },
  {
    id: 'node-ghats-a1a',
    position: { x: 1500, y: 700 },
    data: {
      title: 'Invasive Species Encroachment (Eucalyptus/Acacia Plantations)',
      summary: 'Assessing how colonial-era eucalyptus and acacia plantations accelerate shola-grassland loss under warming conditions.',
      displayType: 'Prerequisite',
      internalType: 'prerequisite',
      status: 'proposed',
      depth: 3,
      branchColor: '#3b82f6',
      creator: 'ai',
      confidence: 75,
      pros: ['Well-documented plantation boundary GIS data available from Kerala Forest Department'],
      cons: ['Plantation removal is politically contentious due to local livelihood dependence'],
      riskFactor: 'Medium',
      notes: '',
      bookmarked: false,
      collapsed: false,
      hasChildren: true
    }
  },
  {
    id: 'node-ghats-b1a',
    position: { x: 1500, y: 60 },
    data: {
      title: '2018 & 2024 Kerala Flood Case Study Data',
      summary: 'Using the 2018 and 2024 major flood events as case studies for extreme rainfall attribution analysis.',
      displayType: 'Expected Outcome',
      internalType: 'outcome',
      status: 'approved',
      depth: 3,
      branchColor: '#f59e0b',
      creator: 'user',
      confidence: 87,
      pros: ['Well-documented events with extensive government and NGO post-disaster reports', 'Provides before/after comparison for land-use change impact'],
      cons: ['Two events alone are insufficient for robust climate attribution — supplementary modeling required'],
      riskFactor: 'Low',
      notes: 'Data collection from KSDMA and CWRDM completed.',
      bookmarked: true,
      collapsed: false,
      hasChildren: true
    }
  },
  {
    id: 'node-ghats-a1a1',
    position: { x: 1980, y: 700 },
    data: {
      title: 'Restoration Pilot: Native Grassland Reforestation',
      summary: 'Proposing a pilot native-species reforestation plot to compare regeneration rates against adjacent plantation land.',
      displayType: 'Expected Outcome',
      internalType: 'outcome',
      status: 'proposed',
      depth: 4,
      branchColor: '#3b82f6',
      creator: 'user',
      confidence: 68,
      pros: ['Provides applied conservation contribution alongside pure research', 'Potential for Forest Department co-funding'],
      cons: ['Multi-year monitoring commitment extends beyond typical PhD timeline'],
      riskFactor: 'Medium',
      notes: 'Discussing feasibility with thesis advisor.',
      bookmarked: false,
      collapsed: false,
      hasChildren: false
    }
  },
  {
    id: 'node-ghats-b1a1',
    position: { x: 1980, y: 60 },
    data: {
      title: 'Early Warning System Policy Recommendations',
      summary: 'Drafting policy recommendations for rainfall-triggered landslide early warning thresholds for district disaster authorities.',
      displayType: 'Expected Outcome',
      internalType: 'outcome',
      status: 'proposed',
      depth: 4,
      branchColor: '#f59e0b',
      creator: 'user',
      confidence: 73,
      pros: ['Direct policy translation increases research impact', "Aligns with KSDMA's current early-warning modernization initiative"],
      cons: ['Requires calibration against very localized micro-catchment data to avoid false alarms'],
      riskFactor: 'Medium',
      notes: '',
      bookmarked: false,
      collapsed: false,
      hasChildren: false
    }
  }
];

export const GHATS_EDGES: GraphEdge[] = [
  { id: 'e-ghats-root-a', sourceId: 'node-ghats-root', targetId: 'node-ghats-a', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { id: 'e-ghats-root-b', sourceId: 'node-ghats-root', targetId: 'node-ghats-b', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 } },
  { id: 'e-ghats-a-a1', sourceId: 'node-ghats-a', targetId: 'node-ghats-a1', style: { stroke: '#3b82f6', strokeWidth: 1.5 } },
  { id: 'e-ghats-a-a2', sourceId: 'node-ghats-a', targetId: 'node-ghats-a2', style: { stroke: '#3b82f6', strokeWidth: 1.5 } },
  { id: 'e-ghats-b-b1', sourceId: 'node-ghats-b', targetId: 'node-ghats-b1', style: { stroke: '#f59e0b', strokeWidth: 1.5 } },
  { id: 'e-ghats-a1-a1a', sourceId: 'node-ghats-a1', targetId: 'node-ghats-a1a', style: { stroke: '#3b82f6', strokeWidth: 1.5 } },
  { id: 'e-ghats-b1-b1a', sourceId: 'node-ghats-b1', targetId: 'node-ghats-b1a', style: { stroke: '#f59e0b', strokeWidth: 1.5 } },
  { id: 'e-ghats-a1a-a1a1', sourceId: 'node-ghats-a1a', targetId: 'node-ghats-a1a1', style: { stroke: '#3b82f6', strokeWidth: 1.5 } },
  { id: 'e-ghats-b1a-b1a1', sourceId: 'node-ghats-b1a', targetId: 'node-ghats-b1a1', style: { stroke: '#f59e0b', strokeWidth: 1.5 } }
];

export const GHATS_SUGGESTIONS: AISuggestion[] = [
  {
    id: 'sug-ghats-1',
    nodeId: 'node-ghats-a1a',
    title: 'Prioritize Eucalyptus Removal Feasibility Study',
    description: 'Partner with the Kerala Forest Department on a small removal pilot to generate preliminary regeneration data before the full restoration proposal.',
    suggestedType: 'strategic',
    impactScore: 83,
    actionType: 'add_branch'
  },
  {
    id: 'sug-ghats-2',
    nodeId: 'node-ghats-b1a',
    title: 'Extend Flood Case Studies with 2019 & 2021 Events',
    description: 'Adding two additional moderate flood years strengthens statistical power for the rainfall-intensity attribution model.',
    suggestedType: 'alternative',
    impactScore: 80,
    actionType: 'add_branch'
  },
  {
    id: 'sug-ghats-3',
    nodeId: 'node-ghats-a2',
    title: 'Flag Risk: Chytrid Fungus Confound',
    description: 'Chytrid fungus prevalence must be statistically controlled for before attributing amphibian decline solely to temperature rise.',
    suggestedType: 'risk',
    impactScore: 76,
    actionType: 'flag_risk'
  }
];

export const GHATS_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-ghats-1',
    sender: 'ai',
    content: `Hello! I am your **AI Reasoning Assistant**.

I have initialized your research workspace for **Climate Change Impacts on the Western Ghats Ecosystem (Kerala)**.

We are currently exploring:
1. **Biodiversity Vulnerability** — endemic species range shifts and shola grassland degradation.
2. **Hydrology Shifts** — monsoon intensity changes and landslide risk correlation.

What would you like to explore next? I can help you cross-reference flood case study data, evaluate restoration pilot feasibility, or expand a branch into the decision graph.`,
    timestamp: 'Yesterday',
    suggestedActions: [
      { label: 'Compare 2018 vs 2024 Flood Data', action: 'compare_nodes' },
      { label: 'Analyze Restoration Pilot Feasibility', action: 'analyze_restoration' },
      { label: 'Generate Amphibian Decline Risk Branch', action: 'add_amphibian_risk' }
    ]
  }
];

// =============================================================
// Defaults — sess-1 (B2B SaaS) is the workspace shown on first load
// =============================================================

export const INITIAL_NODES: GraphNode[] = SAAS_NODES;
export const INITIAL_EDGES: GraphEdge[] = SAAS_EDGES;
export const MOCK_AI_SUGGESTIONS: AISuggestion[] = SAAS_SUGGESTIONS;
export const INITIAL_CHAT_MESSAGES: ChatMessage[] = SAAS_MESSAGES;
