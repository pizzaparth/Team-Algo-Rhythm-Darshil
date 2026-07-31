# Slide 1 — Title

**SOCF 2.0**

## StateGraph

| Name | Registration Number |
|------|---------------------|
| Student 1 | REG-XXXXXXX |
| Student 2 | REG-XXXXXXX |
| Student 3 | REG-XXXXXXX |
| Student 4 | REG-XXXXXXX |

- GitHub Repository: https://github.com/pizzaparth/Team-Algo-Rhythm-Darshil
- Website: https://team-algo-rhythm-darshil.onrender.com
- Google Drive Video: [placeholder — add demo video link]

---

# Slide 2 — Proposed Solution

- **What it is:** StateGraph turns free-form AI conversations into interactive, visual decision-tree graphs instead of linear chat logs.
- **Problem it addresses:** Long AI chat threads are hard to audit, compare, or revisit — key trade-offs get buried in scrollback instead of being structured and traceable.
- **Key features:**
  - AI-powered node expansion into structured decision branches
  - Live graph canvas (drag, connect, compare, bookmark nodes)
  - Rich-text editor with PDF/Markdown/JSON export
  - Multi-session chat, each with its own persistent decision graph
  - Real LLM (Mimo) + live web search (Tavily) integration
- **Target users:** founders, researchers, journalists, students and PhD scholars, analysts — anyone doing structured multi-step reasoning
- **High-level workflow:** Chat with AI → AI proposes structured branches → expand nodes into a visual decision tree → compare, annotate, and export findings

---

# Slide 3 — Technical Strategy: Technologies/Tools

- **Languages:** TypeScript, JavaScript
- **Frontend Technology:** React 19, Vite 6, Tailwind CSS 4, Zustand, React Router 7, React Flow (@xyflow/react)
- **Backend Technology:** Node.js 25, Express 4
- **AI/ML:** Mimo AI (LLM, chat completions), Tavily (web research)
- **Database:** SQLite (Node's built-in `node:sqlite`, WAL mode, full-text search)
- **Blockchain:** Not applicable to this project
- **Other:** JWT + bcryptjs (auth), Docker + Render (deployment)
- **Brief description:** A single Node/Express process serves both the REST API and the built frontend from one origin; a server-side proxy holds every AI provider key so nothing sensitive ever reaches the client bundle.

---

# Slide 4 — Technical Strategy: Methodology

- Iterative, feature-driven development — each capability (chat, graph canvas, editor) shipped and verified independently
- Componentized frontend architecture with shared, reusable UI primitives across pages
- Domain-separated state management (Zustand): dedicated stores for graph, chat, sessions, and AI state
- Server-side proxy pattern for all AI provider calls — client never holds API keys
- Session-based state snapshotting — each chat session persists its own graph, messages, and AI suggestions independently

---

# Slide 5 — Technical Strategy: Implementation Process

1. User sends a message in chat
2. Intent classification determines the request type (chat, expand node, research, etc.)
3. Context assembler gathers current graph state, chat history, and research cache
4. Domain-specific prompt builder constructs the LLM request
5. Server-side proxy calls the LLM provider (API keys never exposed to the client)
6. Response parser converts the AI reply into structured nodes/edges
7. Graph store updates and the canvas re-renders in real time
8. Deployment: Dockerized single-service build, auto-deployed on every `git push` via a Render Blueprint

---

# Slide 6 — Feasibility and Viability: Feasibility Analysis

- **Can it be realistically built?** Yes — it is already built and functioning as a working, deployed application.
- **Resources required:** Standard web hosting, an LLM API key, a web-search API key — no GPU or model training required.
- **Why it's practical:** Built entirely on mature, proven open-source libraries (React Flow, Zustand, Express); single-process deployment keeps hosting cost near zero on free-tier infrastructure.

---

# Slide 7 — Feasibility and Viability: Strategies to Overcome Challenges

- **Challenge:** Free-tier hosting has no persistent disk.
  **Mitigation:** Documented trade-off with a clear upgrade path to a paid disk or hosted database for production use.
- **Challenge:** LLM API costs and rate limits at scale.
  **Mitigation:** Server-side research caching and configurable model selection.
- **Challenge:** AI reasoning latency.
  **Mitigation:** Streaming responses and optimistic UI updates keep the interface responsive.
- **Backup plan:** The AI provider is abstracted behind a single server-side proxy, so switching LLM or search providers requires only a backend config change, not a frontend rewrite.

---

# Slide 8 — Impact and Benefits Envisaged

- Reduces the cognitive load of parsing long AI chat transcripts by visualizing reasoning as a navigable tree
- Improves decision auditability — every branch carries a confidence score, pros/cons, and risk factor
- Cross-domain applicability: validated across startup strategy, journalism, and academic research use cases
- Scales naturally — the session-based architecture supports unlimited parallel reasoning threads per user
- Long-term value: exportable Markdown/JSON output turns ephemeral AI chats into durable, structured documentation

---

# Slide 9 — Why This Idea May Fail

- Users may prefer familiar linear chat UX over learning a new graph-based interaction model (adoption friction)
- Output quality is bounded by the underlying LLM's reasoning ability
- Confidence scores are AI-generated and could be miscalibrated or overstated
- Real-time multi-user collaboration is not yet implemented — currently single-user per session
- Free-tier hosting constraints (data reset on restart) limit production readiness without further investment

---

# Slide 10 — Thank You

- Thank you for your time and consideration
- Questions welcome
