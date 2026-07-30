import { Project, Session, StrategyTemplate, GraphNode, GraphEdge, ChatMessage, AISuggestion } from '../types';

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
    title: 'Evaluating Event-Driven Architecture Options',
    lastMessage: 'Compared Apache Kafka vs AWS Kinesis vs NATS JetStream for event ordering.',
    updatedAt: '10 mins ago'
  },
  {
    id: 'sess-2',
    projectId: 'proj-1',
    title: 'Database Sharding Strategy for Multi-Tenant Data',
    lastMessage: 'Selected PostgreSQL schema-per-tenant with Spanner for global tables.',
    updatedAt: '1 hour ago'
  },
  {
    id: 'sess-3',
    projectId: 'proj-2',
    title: 'APAC Regulatory & Data Privacy Compliance Plan',
    lastMessage: 'Identified key requirements for Japan (APPI) and Singapore (PDPA).',
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

export const INITIAL_NODES: GraphNode[] = [
  {
    id: 'node-root',
    position: { x: 450, y: 50 },
    data: {
      title: 'Enterprise Architecture Modernization Plan',
      summary: 'Main strategy root node evaluating legacy monolith modernization into scalable cloud-native microservices.',
      displayType: 'Root Strategy',
      internalType: 'root',
      status: 'approved',
      depth: 0,
      branchColor: '#6366f1', // indigo
      creator: 'user',
      confidence: 98,
      pros: ['Increases developer velocity', 'Improves fault isolation', 'Allows independent scaling'],
      cons: ['Increased operational complexity', 'Distributed transaction overhead'],
      riskFactor: 'Low',
      notes: 'Initial kick-off approved by CTO. Key target completion in Q4 2026.',
      bookmarked: true,
      collapsed: false,
      hasChildren: true,
      experts: [
        {
          id: 'exp-1',
          name: 'Dr. Aris Thorne',
          title: 'Principal Systems Architect',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
          organization: 'Cloud Architecture Institute',
          relevance: 'Authored 3 books on distributed systems decomposition.',
          quote: 'Decomposing by domain boundaries yields 40% higher maintainability long term.'
        }
      ],
      evidence: [
        {
          id: 'ev-1',
          title: 'DORA State of DevOps Report 2025',
          type: 'benchmark',
          summary: 'Elite teams utilizing loosely coupled microservices deploy 208x more frequently.',
          source: 'Google Cloud DORA Research',
          confidence: 96
        }
      ],
      historicalReferences: [
        {
          company: 'Shopify',
          caseStudy: 'Modular Monolith to Microservices Transition',
          outcome: 'Achieved 99.999% uptime during peak holiday traffic.',
          relevance: 'Identical high-throughput checkout processing constraints.'
        }
      ]
    }
  },
  {
    id: 'node-1',
    position: { x: 150, y: 240 },
    data: {
      title: 'Option A: Event-Driven Microservices with Kafka',
      summary: 'Asynchronous event stream architecture decoupling core services via Kafka clusters.',
      displayType: 'Strategic Option',
      internalType: 'strategic',
      status: 'evaluated',
      depth: 1,
      branchColor: '#3b82f6', // blue
      creator: 'ai',
      confidence: 92,
      pros: ['High throughput (>100k msg/sec)', 'Replayability of event log', 'Strong ecosystem support'],
      cons: ['Complex cluster management', 'Eventual consistency latency'],
      riskFactor: 'Medium',
      notes: 'Requires dedicated DevOps support or managed Confluent Cloud.',
      bookmarked: false,
      collapsed: false,
      hasChildren: true,
      experts: [
        {
          id: 'exp-2',
          name: 'Elena Rostova',
          title: 'Event Streaming Lead',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
          organization: 'Apache Kafka Technical Advisory',
          relevance: 'Specialists in Kafka queue consumer partition optimizations.',
          quote: 'Partition key design is the single most crucial factor for order guarantee.'
        }
      ],
      evidence: [
        {
          id: 'ev-2',
          title: 'Uber Cadence Event Benchmark',
          type: 'paper',
          summary: 'Event streams reduced latency by 35% compared to REST RPCs.',
          source: 'Uber Engineering Tech Blog',
          confidence: 91
        }
      ],
      historicalReferences: [
        {
          company: 'Netflix',
          caseStudy: 'Choreographed Event Stream Backbone',
          outcome: 'Processed over 8 trillion events per day seamlessly.',
          relevance: 'Scale benchmark for decoupled stream processing.'
        }
      ]
    }
  },
  {
    id: 'node-2',
    position: { x: 750, y: 240 },
    data: {
      title: 'Option B: Serverless Containers (Cloud Run)',
      summary: 'Auto-scaling stateless HTTP microservices with zero-scale cost advantages.',
      displayType: 'Alternative Option',
      internalType: 'alternative',
      status: 'in_review',
      depth: 1,
      branchColor: '#10b981', // emerald
      creator: 'ai',
      confidence: 88,
      pros: ['Zero infrastructure management', 'Pay-per-use economics', 'Fast deployment speed'],
      cons: ['Cold start latency peaks (~250ms)', 'Vendor lock-in considerations'],
      riskFactor: 'Low',
      notes: 'Excellent candidate for low-frequency administrative APIs.',
      bookmarked: true,
      collapsed: false,
      hasChildren: true,
      experts: [
        {
          id: 'exp-3',
          name: 'Marcus Vance',
          title: 'Serverless Thought Leader',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
          organization: 'Cloud Native Computing Foundation',
          relevance: 'Containerized execution expert.',
          quote: 'Min-instances settings virtually eliminate cold starts for production traffic.'
        }
      ],
      evidence: [
        {
          id: 'ev-3',
          title: 'Total Cost of Ownership Analysis',
          type: 'metric',
          summary: '42% lower monthly cloud bill for unpredictable traffic spikes.',
          source: 'Internal Cost Simulator v2',
          confidence: 94
        }
      ]
    }
  },
  {
    id: 'node-1-1',
    position: { x: 20, y: 440 },
    data: {
      title: 'Schema Registry & Protobuf Contracts',
      summary: 'Strict schema evolution rules to prevent breaking consumer API payloads.',
      displayType: 'Prerequisite',
      internalType: 'prerequisite',
      status: 'approved',
      depth: 2,
      branchColor: '#3b82f6',
      creator: 'user',
      confidence: 95,
      pros: ['Prevents runtime serialization crashes', 'Compact binary payload sizes'],
      cons: ['Requires build-time code generation'],
      riskFactor: 'Low',
      notes: 'Schema enforcement rule configured in CI/CD pipeline.',
      bookmarked: false
    }
  },
  {
    id: 'node-1-2',
    position: { x: 300, y: 440 },
    data: {
      title: 'Outbox Pattern for Database Transactions',
      summary: 'Ensuring dual-write atomic consistency between PostgreSQL and Kafka topics.',
      displayType: 'Risk Factor',
      internalType: 'risk',
      status: 'proposed',
      depth: 2,
      branchColor: '#3b82f6',
      creator: 'ai',
      confidence: 84,
      pros: ['Eliminates two-phase commit locks', 'Guarantees at-least-once message delivery'],
      cons: ['Requires polling or Change Data Capture (Debezium)'],
      riskFactor: 'High',
      notes: 'CDC via Debezium plugin requires database replication WAL slots.',
      bookmarked: false
    }
  },
  {
    id: 'node-2-1',
    position: { x: 620, y: 440 },
    data: {
      title: 'Distributed In-Memory Cache (Redis Cluster)',
      summary: 'Sub-millisecond read access for high-frequency user session & authorization lookups.',
      displayType: 'Strategic Option',
      internalType: 'strategic',
      status: 'evaluated',
      depth: 2,
      branchColor: '#10b981',
      creator: 'ai',
      confidence: 90,
      pros: ['Offloads database read pressure by 80%', 'Ultra-low latency (<2ms)'],
      cons: ['Cache invalidation complexity', 'Memory footprint costs'],
      riskFactor: 'Medium',
      notes: 'Redis cluster with multi-AZ failover replication.',
      bookmarked: false
    }
  },
  {
    id: 'node-2-2',
    position: { x: 920, y: 440 },
    data: {
      title: 'Global Database: Cloud Spanner vs Multi-Region Postgres',
      summary: 'Evaluating strongly consistent global database transactions for multi-region active-active deployments.',
      displayType: 'Expected Outcome',
      internalType: 'outcome',
      status: 'in_review',
      depth: 2,
      branchColor: '#10b981',
      creator: 'ai',
      confidence: 86,
      pros: ['External consistency across continents', 'Automatic sharding & rebalancing'],
      cons: ['Higher unit cost per node', 'SQL dialect nuances'],
      riskFactor: 'Medium',
      notes: 'Trade-off analysis complete. Recommending Spanner for multi-region payment table.',
      bookmarked: true
    }
  }
];

export const INITIAL_EDGES: GraphEdge[] = [
  { id: 'e-root-1', sourceId: 'node-root', targetId: 'node-1', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { id: 'e-root-2', sourceId: 'node-root', targetId: 'node-2', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'e-1-11', sourceId: 'node-1', targetId: 'node-1-1', style: { stroke: '#3b82f6', strokeWidth: 1.5 } },
  { id: 'e-1-12', sourceId: 'node-1', targetId: 'node-1-2', style: { stroke: '#3b82f6', strokeWidth: 1.5 } },
  { id: 'e-2-21', sourceId: 'node-2', targetId: 'node-2-1', style: { stroke: '#10b981', strokeWidth: 1.5 } },
  { id: 'e-2-22', sourceId: 'node-2', targetId: 'node-2-2', style: { stroke: '#10b981', strokeWidth: 1.5 } }
];

export const MOCK_AI_SUGGESTIONS: AISuggestion[] = [
  {
    id: 'sug-1',
    nodeId: 'node-1-2',
    title: 'Mitigate CDC Replication Latency via Kafka Connect',
    description: 'Add a dedicated Kafka Connect cluster with Debezium connector to ensure <100ms CDC lag under heavy write bursts.',
    suggestedType: 'strategic',
    impactScore: 94,
    actionType: 'add_branch'
  },
  {
    id: 'sug-2',
    nodeId: 'node-2-2',
    title: 'Introduce Read-Replicas for Regional Latency Optimization',
    description: 'Place local read-only PostgreSQL replicas in EU and APAC regions to optimize local query response times.',
    suggestedType: 'alternative',
    impactScore: 89,
    actionType: 'add_branch'
  },
  {
    id: 'sug-3',
    nodeId: 'node-1',
    title: 'Flag Risk: Event Sourcing Storage Growth Rate',
    description: 'Event retention logs without compaction policies could exceed storage budget within 18 months.',
    suggestedType: 'risk',
    impactScore: 87,
    actionType: 'flag_risk'
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'ai',
    content: `Hello! I am your **AI Reasoning Assistant**. 

I have initialized your architectural workspace for **Enterprise Architecture Modernization**. 

We are currently exploring:
1. **Event-Driven Microservices (Kafka)** for real-time payment streaming.
2. **Serverless Containers (Cloud Run)** for cost-effective stateless APIs.

What specific domain or requirement would you like to explore next? You can ask me to evaluate security risks, suggest database strategies, or expand a node branch into the decision graph.`,
    timestamp: '11:20 AM',
    suggestedActions: [
      { label: 'Compare Kafka vs Cloud Run', action: 'compare_nodes' },
      { label: 'Analyze Multi-Region Spanner Costs', action: 'analyze_spanner' },
      { label: 'Generate Security Risk Branch', action: 'add_security' }
    ]
  }
];
