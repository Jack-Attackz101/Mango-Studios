// Problem cards and Forge panes. Every figure here is fictional demo data.

const money = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function bar(label, crumb, badge) {
  return `<div class="app__bar"><span class="app__badge">${badge}</span>Demo workspace / ${label} / <b>${crumb}</b><span class="app__demo">Demo data</span></div>`;
}

function curve(fn, { w = 400, h = 160, n = 120, pad = 10 } = {}) {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = pad + t * (w - pad * 2);
    const y = h / 2 - fn(t) * (h / 2 - pad);
    d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
  }
  return d;
}

const ESTIMATE = [
  ['Setup and fixtures'],
  ['OP-20', 'CNC programming and setup', 'Labor', 32, 'hr', 68],
  ['OP-30', 'Workholding fixture materials', 'Material', 2, 'ea', 485],
  ['Machining'],
  ['OP-40', 'Aluminum 6061-T6 blanks', 'Material', 180, 'ea', 7.85],
  ['OP-50', '304 stainless steel plate blanks', 'Material', 96, 'ea', 18.4],
  ['OP-60', 'CNC milling operations', 'Labor', 112, 'hr', 72],
  ['OP-70', 'Turning and secondary operations', 'Labor', 64, 'hr', 66],
];

const views = {
  estimating() {
    const total = ESTIMATE.filter((r) => r.length > 1).reduce((s, r) => s + r[3] * r[5], 0);
    const rows = ESTIMATE.map((r) => r.length === 1
      ? `<tr class="grp"><td colspan="6">${r[0]}</td></tr>`
      : `<tr><td>${r[0]}</td><td>${r[1]}</td><td><span class="pill ${r[2] === 'Labor' ? 'pill--o' : ''}">${r[2]}</span></td><td class="r">${r[3]} ${r[4]}</td><td class="r">${r[5].toFixed(2)}</td><td class="r">${money(r[3] * r[5])}</td></tr>`).join('');
    return `<div class="app">${bar('Estimates', 'EST-2418', 'ES')}
      <div class="app__body">
        <div style="display:flex;justify-content:space-between;align-items:end"><div><h4>Test fixture component package</h4><small>Client Demo Manufacturing Co. / Bid due Oct 30 / Drawing set Rev B</small></div><div class="kpi is-o"><small>Quote total</small><b>${money(total)}</b></div></div>
        <table class="tbl"><thead><tr><th>Code</th><th>Description</th><th>Type</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Amount</th></tr></thead><tbody>${rows}</tbody></table>
      </div></div>`;
  },
  inventory() {
    const parts = [
      ['BRG-6204-2RS', 'Ball bearing 6204 sealed', 'A-03-2', 340, 120, 100],
      ['BSH-PB-0812', 'Bronze bushing 8x12', 'A-07-1', 26, 18, 40],
      ['FST-M6-SS', 'M6 socket cap, 316 SS', 'C-01-4', 2400, 600, 500],
      ['PLT-304-0250', '304 plate 0.250 in', 'R-02', 14, 9, 10],
      ['ORG-2-118-V', 'O-ring 2-118 Viton', 'B-11-3', 610, 80, 200],
      ['SHF-4140-1.0', '4140 shaft stock 1.0 in', 'R-05', 22, 4, 8],
      ['GSK-NBR-0300', 'Gasket NBR 3.00 in', 'B-02-1', 7, 6, 25],
    ];
    const rows = parts.map(([p, d, b, oh, al, ro]) => {
      const av = oh - al;
      return `<tr><td>${p}</td><td>${d}</td><td>${b}</td><td class="r">${oh}</td><td class="r">${al}</td><td class="r">${av}</td><td>${av < ro ? '<span class="pill pill--o">Low stock</span>' : '<span class="pill pill--g">OK</span>'}</td></tr>`;
    }).join('');
    return `<div class="app">${bar('Stockroom', 'Parts', 'IN')}
      <div class="app__body">
        <div class="kpis"><div class="kpi"><small>Active parts</small><b>1,284</b></div><div class="kpi"><small>Bins</small><b>212</b></div><div class="kpi is-o"><small>Below reorder</small><b>3</b></div><div class="kpi"><small>Receipts today</small><b>14</b></div></div>
        <table class="tbl"><thead><tr><th>Part</th><th>Description</th><th>Bin</th><th class="r">On hand</th><th class="r">Alloc.</th><th class="r">Avail.</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>
      </div></div>`;
  },
  crm() {
    const cols = [
      ['RFQ in', [['Hull fittings, lot 4', '$18,400'], ['Bracket rework', '$3,250']]],
      ['Quoting', [['Valve body, 40 pcs', '$61,200'], ['Fixture package', '$22,186'], ['Test stand frame', '$9,800']]],
      ['Sent', [['Shaft sleeves', '$14,900'], ['Enclosure set', '$7,420']]],
      ['Won', [['Gearbox housings', '$88,000']]],
    ];
    return `<div class="app">${bar('Pipeline', 'Q4', 'CR')}
      <div class="app__body"><div style="display:flex;justify-content:space-between"><h4>Open opportunities</h4><small>Next step due: 6 this week</small></div>
      <div class="kanban">${cols.map(([h, ds]) => `<div><h5>${h}<span>${ds.length}</span></h5>${ds.map(([n, v]) => `<div class="deal"><b>${n}</b><small>${v} / follow up Thu</small></div>`).join('')}</div>`).join('')}</div></div></div>`;
  },
  timesheets() {
    const ppl = [['R. Alvarez', 'J-1182', [8, 8, 9, 8, 10]], ['K. Osei', 'J-1182', [8, 8, 8, 8, 8]], ['M. Brandt', 'J-1190', [10, 9, 10, 9, 8]], ['S. Iyer', 'J-1175', [6, 8, 8, 7, 8]], ['D. Novak', 'J-1190', [8, 8, 0, 8, 8]]];
    const rows = ppl.map(([n, j, h]) => {
      const t = h.reduce((a, b) => a + b, 0);
      return `<tr><td>${n}</td><td>${j}</td>${h.map((x) => `<td class="r">${x || '-'}</td>`).join('')}<td class="r"><b>${t}</b></td><td>${t > 40 ? `<span class="pill pill--o">OT ${t - 40}h</span>` : '<span class="pill pill--g">OK</span>'}</td></tr>`;
    }).join('');
    return `<div class="app">${bar('Timesheets', 'Week 43', 'TS')}
      <div class="app__body"><div style="display:flex;justify-content:space-between"><h4>Hours by person and job</h4><small>2 entries need review</small></div>
      <table class="tbl"><thead><tr><th>Person</th><th>Job</th><th class="r">Mon</th><th class="r">Tue</th><th class="r">Wed</th><th class="r">Thu</th><th class="r">Fri</th><th class="r">Total</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
  },
  erp() {
    const step = (k, t, s, p) => `<div class="panel"><small>${k}</small><h4 style="margin:4px 0 8px">${t}</h4><small>${s}</small><div class="bar ${p > 99 ? '' : 'is-o'}" style="margin-top:10px"><span style="width:${p}%"></span></div></div>`;
    return `<div class="app">${bar('Orders', 'SO-30417', 'ER')}
      <div class="app__body"><h4>Linked documents</h4>
      <div class="cols" style="grid-template-columns:repeat(3,1fr)">${step('Sales order', 'SO-30417', '120 pcs / ship Nov 14', 100)}${step('Purchase order', 'PO-88120', 'Bar stock / ETA Nov 02', 62)}${step('Invoice', 'INV-5521', 'Draft / on shipment', 15)}</div>
      <table class="tbl"><thead><tr><th>Item</th><th class="r">Required</th><th class="r">On hand</th><th class="r">On order</th><th>Position</th></tr></thead><tbody>
      <tr><td>4140 bar, 1.25 in</td><td class="r">96 ft</td><td class="r">40 ft</td><td class="r">60 ft</td><td><span class="pill pill--g">Covered</span></td></tr>
      <tr><td>Bushing BSH-PB-0812</td><td class="r">240</td><td class="r">26</td><td class="r">0</td><td><span class="pill pill--o">Short 214</span></td></tr>
      <tr><td>Finish: black oxide</td><td class="r">120</td><td class="r">-</td><td class="r">Vendor</td><td><span class="pill">Outside</span></td></tr></tbody></table></div></div>`;
  },
  calculations() {
    const d = curve((t) => { const x = t <= .5 ? t : 1 - t; return -(x * (3 - 4 * x * x)) / 1; }, { w: 400, h: 150 });
    return `<div class="app">${bar('Engineering', 'Beam check', 'CA')}
      <div class="app__body" style="grid-template-columns:150px 1fr">
        <div style="display:grid;gap:8px;align-content:start">
          <div class="field"><label>Center load F</label><span>4.50 <em>kN</em></span></div>
          <div class="field"><label>Span L</label><span>1.20 <em>m</em></span></div>
          <div class="field"><label>Elastic modulus E</label><span>200 <em>GPa</em></span></div>
          <div class="field"><label>Section width b</label><span>40 <em>mm</em></span></div>
          <div class="field"><label>Section depth h</label><span>60 <em>mm</em></span></div>
        </div>
        <div style="display:grid;grid-template-rows:auto 1fr auto;gap:8px">
          <div class="kpis" style="grid-template-columns:repeat(2,1fr)"><div class="kpi is-o"><small>Max deflection</small><b>1.125 mm</b></div><div class="kpi"><small>Max bending stress</small><b>56.3 MPa</b></div></div>
          <div class="panel"><svg class="chart" viewBox="0 0 400 150" preserveAspectRatio="none"><line class="axis" x1="10" y1="75" x2="390" y2="75"/><path class="curve" d="${d}"/></svg></div>
          <small>Simply supported, center load. Reference: Roark, Table 8.1, case 1a.</small>
        </div>
      </div></div>`;
  },
  kinetics() {
    const z = 0.12, w = 2 * Math.PI * 4.2;
    const d = curve((t) => Math.exp(-z * w * t * 1.2) * Math.cos(w * Math.sqrt(1 - z * z) * t * 1.2), { w: 400, h: 170, n: 220 });
    const env = curve((t) => Math.exp(-z * w * t * 1.2), { w: 400, h: 170 });
    return `<div class="app">${bar('Simulation', 'Mass-spring-damper', 'KS')}
      <div class="app__body" style="grid-template-columns:1fr 150px">
        <div style="display:grid;grid-template-rows:1fr auto;gap:8px"><div class="panel"><svg class="chart" viewBox="0 0 400 170" preserveAspectRatio="none"><line class="axis" x1="10" y1="85" x2="390" y2="85"/><path class="curve2" d="${env}"/><path class="curve" d="${d}"/></svg></div><small>Free response, analytic solution. Playback 1.0x.</small></div>
        <div style="display:grid;gap:8px;align-content:start">
          <div class="field"><label>Mass m</label><span>2.0 <em>kg</em></span></div>
          <div class="field"><label>Stiffness k</label><span>1,390 <em>N/m</em></span></div>
          <div class="field"><label>Damping c</label><span>12.7 <em>N s/m</em></span></div>
          <div class="field"><label>Initial position x&#8320;</label><span>10 <em>mm</em></span></div>
          <div class="kpi is-o"><small>Damping ratio</small><b>0.12</b></div>
        </div>
      </div></div>`;
  },
};

export const CASES = [
  ['estimating', 'Estimating', 'Quote inputs are scattered.', 'Bring material rates, setup hours and review into one estimating workflow your team can adapt.'],
  ['inventory', 'Inventory', 'Stock records do not agree.', 'Connect parts, locations, receipts and allocations so the stockroom team can follow each movement.'],
  ['crm', 'CRM', 'RFQs and follow-ups get separated.', 'Keep customer contacts, quotes, decisions and the next action together in a workflow built for your sales process.'],
  ['timesheets', 'Timesheets', 'Labor hours lose their job context.', 'Capture time against jobs, review entries and carry accepted totals into the costing workflow.'],
  ['erp', 'ERP extensions', 'The ERP does not cover every handoff.', 'Build targeted extensions around approved systems instead of assuming the core ERP must be replaced.'],
  ['calculations', 'Specialized calculations', 'Engineering checks are hard to repeat.', 'Turn a defined calculation into a reusable interface with explicit inputs, units, references and domain acceptance.'],
  ['kinetics', 'Kinetic simulations', 'Simulation setup changes between runs.', 'Create a focused interface for model inputs and responses, with domain-specific tests and expert review.'],
];

export function buildCards(track) {
  const html = CASES.map(([id, name, problem, solution], i) => `
    <article class="card" data-card>
      <div class="card__info">
        <div class="card__top mono"><b>${String(i + 1).padStart(2, '0')}</b><span>${name}</span></div>
        <h3 class="card__problem">${problem}</h3>
        <div class="card__sol"><span class="mono">The intended solution</span><p>${solution}</p></div>
      </div>
      <div class="card__view"><div class="card__view-inner" data-parallax-x>${views[id]()}</div><span class="card__caption mono">Interactive example / fictional data</span></div>
    </article>`).join('') + `
    <div class="card card--end"><span class="mono">Or start from nothing</span><p>Describe the work. Forge plans the rest.</p><a class="btn btn--line" href="#forge" data-hover><span class="btn__label"><span>Explore in Forge</span><span aria-hidden="true">Explore in Forge</span></span><svg class="chev" viewBox="0 0 100 100" aria-hidden="true"><path d="M0 100 46 0 92 100H65L46 57 27 100Z" transform="translate(100 0) rotate(90)"/></svg></a></div>`;
  track.innerHTML = html;
}

export const STAGES = ['plan', 'build', 'test', 'validate', 'deploy'];

export function buildPanes(root) {
  const panes = [
    `<div class="pane__head"><div><h3>Plan your app</h3><p>Start with what your team needs. Refine the details as you go.</p></div><span class="mono">Example plan</span></div>
     <div class="pane__grid" style="grid-template-columns:1.6fr 1fr">
       <div class="box" data-i><div class="mono"><span>Your app plan</span><span>Illustrative</span></div>
         <div class="q" data-i><label>What do you want to build?</label><div>An inventory app that helps the stockroom team find items, receive new stock and keep a history of stock movements.<span class="caret"></span></div></div>
         <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
           <div class="q" data-i><label>Who will use it?</label><div>Stockroom staff record deliveries and movements. Team leads review changes and manage access.</div></div>
           <div class="q" data-i><label>What should it do?</label><div>Show stock by item and location. Record received quantities and keep a clear movement history.</div></div>
         </div>
       </div>
       <div class="box" data-i><div class="mono"><span>Notes &amp; decisions</span></div>
         <div class="note" data-i><span class="mono">Decision</span>Start with a stock list and a simple receiving screen. Keep the first version focused.</div>
         <div class="note" data-i><span class="mono">Appearance</span>Use a light layout with clear labels and enough space for gloved hands on a tablet.</div>
         <div class="note" data-i><span class="mono">Access</span>Only team leads can adjust quantities after receipt.</div>
       </div>
     </div>`,
    `<div class="pane__head"><div><h3>Forge with AI</h3><p>Generated against the approved plan. Every file is reviewable.</p></div><span class="mono">Build 0.3.1</span></div>
     <div class="pane__grid" style="grid-template-columns:240px 1fr">
       <div class="box tree" data-i><div class="mono"><span>Workspace</span></div>
         <div class="on">inventory-app/</div><div>&nbsp;&nbsp;plan.md</div><div class="new">&nbsp;&nbsp;schema/parts.sql</div><div class="new">&nbsp;&nbsp;schema/movements.sql</div><div class="on">&nbsp;&nbsp;screens/</div><div class="new">&nbsp;&nbsp;&nbsp;&nbsp;stock-list.tsx</div><div class="new">&nbsp;&nbsp;&nbsp;&nbsp;receiving.tsx</div><div class="new">&nbsp;&nbsp;&nbsp;&nbsp;history.tsx</div><div>&nbsp;&nbsp;roles.yaml</div><div>&nbsp;&nbsp;tests/</div>
       </div>
       <div class="box log" data-i><div class="mono"><span>Generation log</span><span>Wireframe</span></div>
         <div data-i><time>09:41:02</time><span>Read approved plan</span><span class="ok">done</span></div>
         <div data-i><time>09:41:05</time><span>Model parts, bins, movements</span><span class="ok">done</span></div>
         <div data-i><time>09:41:11</time><span>Stock list with location filter</span><span class="ok">done</span></div>
         <div data-i><time>09:41:19</time><span>Receiving screen, quantity check</span><span class="ok">done</span></div>
         <div data-i><time>09:41:26</time><span>Role rule: leads adjust after receipt</span><span class="ok">done</span></div>
         <div data-i><time>09:41:31</time><span>Movement history, append-only</span><span class="acc">writing</span></div>
         <div data-i><time>09:41:31</time><span>Hand off to test suite</span><span>queued</span></div>
       </div>
     </div>`,
    `<div class="pane__head"><div><h3>Quality control</h3><p>Acceptance tests come from the plan, not the code.</p></div><span class="mono">Run #18</span></div>
     <div class="pane__grid" style="grid-template-columns:1fr 1.5fr">
       <div class="box" data-i><div class="mono"><span>Result</span></div><div class="big">42<small>/ 42 passing</small></div><div class="meter"><span data-meter style="width:100%"></span></div><span class="mono" style="color:var(--muted);font-size:10px">Coverage of plan requirements: 100%</span></div>
       <div class="box tests" data-i><div class="mono"><span>Acceptance</span></div>
         <div data-i><i></i><span>Receiving rejects negative quantities</span><span class="mono">12ms</span></div>
         <div data-i><i></i><span>Stock list filters by bin and location</span><span class="mono">31ms</span></div>
         <div data-i><i></i><span>Staff cannot edit after receipt</span><span class="mono">18ms</span></div>
         <div data-i><i></i><span>Every movement keeps user and time</span><span class="mono">22ms</span></div>
         <div data-i><i></i><span>History cannot be deleted</span><span class="mono">9ms</span></div>
       </div>
     </div>`,
    `<div class="pane__head"><div><h3>Trust artifacts</h3><p>Evidence an assessor can read, produced with every release.</p></div><span class="mono">Release candidate</span></div>
     <div class="pane__grid" style="grid-template-columns:1.3fr 1fr">
       <div class="box ctrl" data-i><div class="mono"><span>NIST 800-171 mapping</span><span>Planned</span></div>
         <div data-i><span class="mono">3.1.1</span><span>Limit access to authorised users</span><span class="tag tag--ok">Mapped</span></div>
         <div data-i><span class="mono">3.1.5</span><span>Least privilege for role changes</span><span class="tag tag--ok">Mapped</span></div>
         <div data-i><span class="mono">3.3.1</span><span>Audit records for stock movements</span><span class="tag tag--ok">Mapped</span></div>
         <div data-i><span class="mono">3.13.8</span><span>Encryption in transit</span><span class="tag tag--wait">Review</span></div>
       </div>
       <div class="box files" data-i><div class="mono"><span>Artifacts</span></div>
         <div data-i><span>Software bill of materials</span><span class="tag">SBOM</span></div>
         <div data-i><span>Dependency scan report</span><span class="tag">PDF</span></div>
         <div data-i><span>Access control matrix</span><span class="tag">CSV</span></div>
         <div data-i><span>Test evidence, run #18</span><span class="tag">ZIP</span></div>
       </div>
     </div>`,
    `<div class="pane__head"><div><h3>Deliver to your enclave</h3><p>The release goes to infrastructure you own. You approve it.</p></div><span class="mono">Planned</span></div>
     <div class="pane__grid" style="grid-template-columns:1fr;grid-template-rows:auto auto 1fr">
       <div class="box" data-i><div class="mono"><span>Release path</span><span>v0.3.1</span></div>
         <div class="route"><div class="on" data-i>Build<small>Signed</small></div><div class="on" data-i>Test<small>42 / 42</small></div><div class="on" data-i>Validate<small>4 artifacts</small></div><div data-i>Deploy<small>Customer-owned enclave</small></div></div>
       </div>
       <div class="approve" data-i><p><b>Waiting for your approval</b>Nothing ships without a named approver on your side.</p><span class="fake">Approve release</span></div>
       <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;min-height:0">
         <div class="box ctrl" data-i><div class="mono"><span>Target</span><span>Planned</span></div>
           <div data-i><span class="mono">Env</span><span>Customer-owned AWS GovCloud account</span><span></span></div>
           <div data-i><span class="mono">Access</span><span>Your identity provider, your roles</span><span></span></div>
           <div data-i><span class="mono">Data</span><span>Stays in your enclave. Never leaves it.</span><span></span></div>
         </div>
         <div class="box ctrl" data-i><div class="mono"><span>Release notes</span><span>v0.3.1</span></div>
           <div data-i><span class="mono">+</span><span>Receiving screen with quantity check</span><span></span></div>
           <div data-i><span class="mono">+</span><span>Append-only movement history</span><span></span></div>
           <div data-i><span class="mono">~</span><span>Leads-only adjustments after receipt</span><span></span></div>
         </div>
       </div>
     </div>`,
  ];
  root.innerHTML = panes.map((p, i) => `<section class="pane${i ? '' : ' is-active'}" data-pane="${i}" aria-label="${STAGES[i]}">${p}</section>`).join('');
}
