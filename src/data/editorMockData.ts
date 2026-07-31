import type { EditorDocument } from '../types';

export const INITIAL_EDITOR_DOCUMENTS: EditorDocument[] = [
  {
    id: 'doc-1',
    title: 'B2B SaaS Go-to-Market Research Notes',
    content: `
      <p><em>Draft — Vertical selection and go-to-market motion</em></p>
      <p>Working notes on choosing a vertical and go-to-market motion for a new B2B SaaS product, ahead of pre-seed fundraising.</p>
      <h2>1.1 Vertical Shortlist</h2>
      <p>Two verticals are under active consideration, weighed against founder domain expertise and sales cycle length:</p>
      <ul>
        <li><strong>Healthcare compliance tooling</strong> — HIPAA documentation workflow automation for mid-size clinics.</li>
        <li><strong>Fintech reconciliation tools</strong> — automated transaction reconciliation for small lenders.</li>
      </ul>
      <h2>1.2 Go-to-Market Motion</h2>
      <p>Leaning toward a hybrid model: self-serve product-led trial for accounts under $10k ACV, with a sales-assisted close for larger accounts that require a compliance conversation.</p>
      <ol>
        <li>Ship a usage-capped free tier to drive top-of-funnel signups</li>
        <li>Instrument in-product upgrade prompts at natural usage ceilings</li>
        <li>Route accounts above the ACV threshold to a founder-led sales call</li>
      </ol>
      <h2>1.3 Open Questions</h2>
      <p><u>Compliance timeline</u> is the current critical path — HIPAA BAAs and a SOC 2 Type II audit both gate enterprise procurement, and the audit alone has a 6-12 month observation window.</p>
      <p><em>Next step:</em> confirm legal counsel's estimate for BAA turnaround time before finalizing the launch date.</p>
    `,
    createdAt: '2026-07-18T09:00:00.000Z',
    updatedAt: '2026-07-29T14:30:00.000Z',
  },
  {
    id: 'doc-2',
    title: 'E20 Fuel Investigation — Draft Notes',
    content: `
      <p><em>3-part investigative series — working notes</em></p>
      <p>Tracking sources, data requests, and open threads for the E20 ethanol-blended petrol investigation.</p>
      <h2>Angle 1 — Vehicle Compatibility</h2>
      <ul>
        <li><strong>Claim under investigation:</strong> owners report 3-6% mileage drops on E20 vs E10.</li>
        <li><strong>Confounding variables:</strong> driving style, vehicle maintenance, seal age.</li>
        <li>Requested an independent ARAI dynamometer test slot (4-6 week queue) to get citable, defensible numbers.</li>
      </ul>
      <h2>Angle 2 — Agricultural Trade-offs</h2>
      <p>Sugarcane and maize diversion to ethanol distilleries is raising farmer incomes in some belts, but the food-vs-fuel allocation debate remains contested nationally.</p>
      <ol>
        <li>Compare state-wise ethanol procurement prices against open-market sugar prices</li>
        <li>Field interviews with sugarcane farmers (Kolhapur district) — completed, 12 farmers interviewed</li>
        <li>Request formal comment from SIAM (auto industry body) — sent, awaiting response</li>
      </ol>
      <h2>Editorial Notes</h2>
      <p><em>Reminder:</em> this is a politically sensitive topic — both the auto industry and the biofuel lobby have a stake in how the mileage data is framed. Every technical claim needs an independent source before it goes in the piece.</p>
    `,
    createdAt: '2026-07-20T11:15:00.000Z',
    updatedAt: '2026-07-27T16:45:00.000Z',
  },
  {
    id: 'doc-3',
    title: 'Western Ghats Climate Impact — Literature Review',
    content: `
      <p><em>PhD literature review — Western Ghats (Kerala) climate impact study</em></p>
      <p>Summary of key sources informing the thesis proposal, organized by research thread.</p>
      <h2>Key Sources</h2>
      <ul>
        <li><strong>IPCC AR6 Regional Fact Sheet — South Asia</strong> — projects 1.5-2°C warming across the Western Ghats by 2050 under moderate emissions scenarios.</li>
        <li><strong>Kerala Forest Research Institute (Menon et al.)</strong> — 25-year record of shola-grassland ecosystem shifts at high elevation.</li>
        <li><strong>KSDMA post-disaster reports (2018, 2024)</strong> — extensive rainfall and landslide incidence data for the two major flood years.</li>
      </ul>
      <h2>Research Threads</h2>
      <ol>
        <li><strong>Biodiversity vulnerability</strong> — endemic species range shifts, with amphibians (Raorchestes, Nyctibatrachus genera) as a priority bioindicator group.</li>
        <li><strong>Hydrology shifts</strong> — rainfall intensity trends and their correlation with landslide frequency in Idukki and Wayanad districts.</li>
      </ol>
      <h2>Gaps Identified</h2>
      <p>Landslide incident records before 2018 are <u>inconsistently documented</u>, and deforestation/quarrying remain confounding land-use variables that complicate pure climate attribution.</p>
      <p><em>Next step:</em> secure Kerala Forest Department GIS plantation-boundary data to scope the eucalyptus/acacia encroachment analysis.</p>
    `,
    createdAt: '2026-07-30T08:00:00.000Z',
    updatedAt: '2026-07-30T08:00:00.000Z',
  },
];
