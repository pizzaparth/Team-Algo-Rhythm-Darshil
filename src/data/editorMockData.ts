import type { EditorDocument } from '../types';

export const INITIAL_EDITOR_DOCUMENTS: EditorDocument[] = [
  {
    id: 'doc-1',
    title: 'Decision Trees in AI-Assisted Reasoning',
    content: `
      <p><em>Draft — Section 1: Introduction</em></p>
      <p>Modern reasoning workspaces increasingly rely on <strong>structured decision graphs</strong> rather than dense linear text to help users evaluate complex, multi-variable problems. This paper examines how interactive decision trees improve comprehension and decision quality compared to traditional prose-based recommendations.</p>
      <h2>1.1 Motivation</h2>
      <p>Large language models are highly capable of generating reasoning chains, but users often struggle to audit long paragraphs of AI-generated analysis. We argue that:</p>
      <ul>
        <li>Visual decomposition reduces cognitive load</li>
        <li>Explicit confidence scoring improves calibration</li>
        <li>Branch-level citations increase trust in AI output</li>
      </ul>
      <h2>1.2 Research Questions</h2>
      <ol>
        <li>Does graph-based reasoning reduce decision time?</li>
        <li>Do users trust branch-level confidence scores?</li>
        <li>How does human-in-the-loop editing affect final outcomes?</li>
      </ol>
      <p>The remainder of this paper is organized as follows: Section 2 reviews related work, Section 3 describes our methodology, and Section 4 presents results.</p>
    `,
    createdAt: '2026-07-18T09:00:00.000Z',
    updatedAt: '2026-07-29T14:30:00.000Z',
  },
  {
    id: 'doc-2',
    title: 'Literature Review Notes',
    content: `
      <p>Collected notes on prior work relevant to visual reasoning tools and structured decision support systems.</p>
      <h2>Key Papers</h2>
      <ul>
        <li><strong>Toulmin (1958)</strong> — Argumentation model: claim, grounds, warrant, backing, qualifier, rebuttal.</li>
        <li><strong>Klein (1998)</strong> — Recognition-Primed Decision model for expert decision-making under time pressure.</li>
        <li><strong>Kahneman &amp; Tversky (1979)</strong> — Prospect theory and cognitive biases in risk evaluation.</li>
      </ul>
      <h2>Gaps Identified</h2>
      <p>Most existing tools present AI reasoning as <u>unstructured chat transcripts</u>, making it difficult to:</p>
      <ol>
        <li>Compare alternative strategies side-by-side</li>
        <li>Track how confidence changes as new evidence arrives</li>
        <li>Re-use prior reasoning across related decisions</li>
      </ol>
      <p><em>Next step:</em> draft a taxonomy of node types (hypothesis, risk, action, trade-off) for the proposed system.</p>
    `,
    createdAt: '2026-07-20T11:15:00.000Z',
    updatedAt: '2026-07-27T16:45:00.000Z',
  },
  {
    id: 'doc-3',
    title: 'Untitled Document',
    content: `<p><br></p>`,
    createdAt: '2026-07-30T08:00:00.000Z',
    updatedAt: '2026-07-30T08:00:00.000Z',
  },
];
