/* Act 2 — What buyers need to know (steps 6-8). Section 7 of the spec. */

registerScreen('A2.0', {
  type: 'fullbleed',
  render(root) {
    root.innerHTML = actCoverMarkup({
      actNum: 2,
      iconName: 'newspaper',
      title: ACT_NAMES[2],
      line: ACT_PROMISES[2],
      chips: ['Disclosures', 'Service contracts', 'Financial details']
    });
    root.querySelector('#cover-continue').addEventListener('click', () => navigateTo('A2.1'));
  }
});

/* ---------------- A2.1 — Service contracts ---------------- */
/* All 8 services from production (Figma capture 6647:108579/108582),
   including Alarm monitoring and Water purification, which the first
   build left out. A Yes opens the company name and phone behind it
   (catalog keys serviceTermiteProvider / serviceTermitePhone, …). */

const SERVICE_CONTRACTS = [
  { id: 'termite', label: 'Termite', key: 'Termite', company: 'Termite Contract Company Name' },
  { id: 'pest', label: 'Pest control', key: 'Pest', company: 'Pest Control Company Name' },
  { id: 'hvac', label: 'HVAC service', key: 'Hvac', company: 'HVAC Service Company Name' },
  { id: 'pool', label: 'Pool', key: 'Pool', company: 'Pool Company Name' },
  { id: 'landscaping', label: 'Landscaping / lawn', key: 'Landscaping', company: 'Landscaping / Lawn Company Name' },
  { id: 'handyman', label: 'Handyman', key: 'Handyman', company: 'Handyman Company Name' },
  { id: 'alarm', label: 'Alarm monitoring', key: 'Alarm', company: 'Alarm Monitoring Company Name' },
  { id: 'water', label: 'Water purification', key: 'Water', company: 'Water Purification Company Name' }
];

/* Deliberately NOT using the QuestionCard-per-question pattern here (unlike
   A2.2/A2.4/A2.5) — there's no real "service contracts" screen in the Figma
   file to match against, and the spec explicitly wants this compact rather
   than one-row-per-question, contrasting it with production's "twelve
   full-width rows" for the same six questions. */
function renderA21(root) {
  const c = listing.contracts;
  const body = `
    <div class="card">
      ${SERVICE_CONTRACTS.map(q => `
        <div class="yn-row">
          <span class="p-sm font-semibold">${q.label} <span class="field-optional">(Optional)</span></span>
          <div class="segmented" data-contract="${q.id}">
            <button data-val="yes" class="${c[q.id] === 'yes' ? 'active' : ''}">Yes</button>
            <button data-val="no" class="${c[q.id] === 'no' ? 'active' : ''}">No</button>
            <button data-val="na" class="${c[q.id] === 'na' ? 'active' : ''}">N/A</button>
          </div>
        </div>
        ${c[q.id] === 'yes' ? hdBlockMarkup(`contract-${q.id}`, [{ row: [
          { key: `service${q.key}Provider`, type: 'text', label: q.company },
          { key: `service${q.key}Phone`, type: 'text', inputType: 'tel', label: 'Phone number' }
        ] }], c) : ''}`).join('')}
    </div>
  `;

  root.innerHTML = workingScreenMarkup({
    eyebrow: 'Step 6 of 11 - Service contracts',
    title: 'Any existing service contracts?',
    whyLine: "It's fine to leave these blank — answer what you know.",
    bodyHtml: body
  }) + footerBarMarkup('Back', 'Continue', false);

  root.querySelectorAll('[data-contract]').forEach(row => {
    row.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = row.dataset.contract;
        c[key] = c[key] === btn.dataset.val ? undefined : btn.dataset.val;
        if (c[key] === undefined) delete c[key];
        saveListing();
        renderApp();
      });
    });
  });

  SERVICE_CONTRACTS.forEach(q => wireHdScope(root, `contract-${q.id}`, c));

  wireFooter(root, { onBack: () => navigateTo('A2.0'), onContinue: () => navigateTo('A2.2') });
}

registerScreen('A2.1', { type: 'working', render: renderA21 });

/* ---------------- A2.2 — Disclosures, batch 1 ---------------- */

const INCLUDED_ITEMS = ['Trash compactor', 'Window screens', 'Intercom', 'Central vacuum system', 'Sauna', 'Sump pump', 'Water softener', 'Gas fireplace logs', 'Rain gutters', 'Spa / whirlpool tub'];

function renderA22(root) {
  const d = listing.disclosures;
  const includedSet = new Set(d.includedItems || []);

  const body = `
    ${formSectionMarkup('Property details &amp; included items (RF 201 Section A)', `
      <div class="field-grid dense">
        <div class="field">
          <label>Date you acquired the property</label>
          <input type="text" placeholder="MM/DD/YYYY" id="f-acquired" value="${d.dateAcquired || ''}" />
        </div>
        <div class="field">
          <label>Is the home site-built, manufactured, or modular?</label>
          <div class="segmented" id="built-segmented">
            ${['Site-built', 'Manufactured', 'Modular'].map(v => `<button data-val="${v}" class="${d.builtType === v ? 'active' : ''}">${v}</button>`).join('')}
          </div>
        </div>
      </div>
      <div class="field">
        ${questionCardMarkup('Is this property new construction (offered for sale for the first time)?', 'newConstruction', ['Yes', 'No'], d.newConstruction, 'data-new-construction')}
        <div class="field-reaction helper">${icon('circle-help')} New-construction sales use a different Tennessee disclosure (RF 203).</div>
      </div>
      <div class="field">
        <label>Which of these items are present and included in the sale? <span class="field-optional">(Optional)</span></label>
        ${checkboxGridMarkup('includedItems', INCLUDED_ITEMS, includedSet)}
      </div>
      ${hdBlockMarkup('a22', [
        /* #563: garage type is gone; openers follow the parking answer and are required (#730) */
        { key: 'garageOpenerCount', type: 'stepper', label: 'Number of garage-door openers included', min: 0,
          showIf: () => (listing.features.parking || []).some(v => v === 'Garage' || v === 'Carport') },
        { key: 'itemsNotOperating', type: 'toggle', label: 'Are any of the included items NOT in working order?', options: ['Yes', 'No', 'Unknown'],
          reveal: { when: 'Yes', key: 'itemsNotOperatingExplain', label: 'Which items, and what is wrong with them?' } },
      ], d)}
    `)}
  `;

  root.innerHTML = workingScreenMarkup({
    eyebrow: 'Step 7 of 11 - Disclosures (1 of 2)',
    title: 'Property details & included items',
    whyLine: 'Tennessee law requires this. Answer honestly — Unknown is fine.',
    bodyHtml: body
  }) + footerBarMarkup('Back', 'Continue', false);

  root.querySelector('#f-acquired').addEventListener('input', e => { d.dateAcquired = e.target.value; saveListing(); });
  root.querySelectorAll('#built-segmented button').forEach(btn => btn.addEventListener('click', () => { d.builtType = btn.dataset.val; saveListing(); renderApp(); }));
  root.querySelectorAll('[data-new-construction] button').forEach(btn => btn.addEventListener('click', () => { d.newConstruction = btn.dataset.val; saveListing(); renderApp(); }));
  root.querySelectorAll('[data-checkbox-group="includedItems"] input').forEach(cb => {
    cb.addEventListener('change', () => {
      const list = new Set(d.includedItems || []);
      if (cb.checked) list.add(cb.value); else list.delete(cb.value);
      d.includedItems = Array.from(list);
      saveListing();
    });
  });

  wireHdScope(root, 'a22', d);

  wireFooter(root, { onBack: () => navigateTo('A2.1'), onContinue: () => showCheckpoint(() => navigateTo('A2.4')) });
}

registerScreen('A2.2', { type: 'working', render: renderA22 });

/* ---------------- A2.3 — Checkpoint ---------------- */
/* PO feedback: the halfway message plays as a short animation on the way
   from A2.2 to A2.4 instead of a screen that needs its own click. It
   dismisses itself (or on any click / key); A2.3 stays as a redirect for
   old links. */

function showCheckpoint(next) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = document.createElement('div');
  el.className = 'checkpoint-overlay';
  el.setAttribute('role', 'status');
  el.innerHTML = `<div class="checkpoint-card">${achievementHeaderMarkup(
    'Halfway through the legal section',
    "A few more questions about the property's condition, then you're done with disclosures."
  )}</div>`;
  document.body.appendChild(el);
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    el.classList.add('leaving');
    setTimeout(() => { el.remove(); next(); }, reduce ? 0 : 250);
  };
  el.addEventListener('click', finish);
  document.addEventListener('keydown', finish, { once: true });
  setTimeout(finish, reduce ? 1200 : 2200);
}

registerScreen('A2.3', { type: 'fullbleed', render() { navigateTo('A2.4'); } });

/* ---------------- A2.4 — Disclosures, batch 2 ---------------- */
/* Representative subset of the real ~19-item defect list (RF 201 Section B)
   plus a couple of Section C items — see build notes for the full count.

   PO feedback: ask "Are you aware of any defect or malfunction in…" once
   and step through the items as a carousel, each with its own icon.
   Answering moves to the next item on its own; side arrows and the item
   list below allow going back or jumping. */

/* The full RF 201 Section B list: the first 10 plus the 11 restored items
   (catalog keys defectFloors, defectWindows, …), in walk-through order. */
const CONDITION_ITEMS = [
  { id: 'interiorWalls', label: 'Interior walls', iconName: 'brick-wall' },
  { id: 'defectExteriorWalls', label: 'Exterior walls', iconName: 'fence' },
  { id: 'ceilings', label: 'Ceilings', iconName: 'panel-top' },
  { id: 'defectFloors', label: 'Floors', iconName: 'grid-2x2' },
  { id: 'defectWindows', label: 'Windows', iconName: 'app-window' },
  { id: 'defectDoors', label: 'Doors', iconName: 'door-open' },
  { id: 'defectInsulation', label: 'Insulation', iconName: 'thermometer' },
  { id: 'roof', label: 'Roof', iconName: 'house' },
  { id: 'defectBasement', label: 'Basement', iconName: 'warehouse' },
  { id: 'foundation', label: 'Foundation', iconName: 'layers' },
  { id: 'defectSlab', label: 'Slab', iconName: 'square' },
  { id: 'plumbing', label: 'Plumbing system', iconName: 'droplets' },
  { id: 'defectSewerSeptic', label: 'Sewer / septic system', iconName: 'droplet' },
  { id: 'electrical', label: 'Electrical system', iconName: 'zap' },
  { id: 'centralHeating', label: 'Central heating', iconName: 'flame' },
  { id: 'defectHeatPump', label: 'Heat pump', iconName: 'fan' },
  { id: 'centralAir', label: 'Central air conditioning', iconName: 'snowflake' },
  { id: 'defectDriveway', label: 'Driveway', iconName: 'car' },
  { id: 'defectSidewalks', label: 'Sidewalks', iconName: 'footprints' },
  { id: 'flooding', label: 'Flooding, drainage, or grading problems', iconName: 'waves' },
  { id: 'zoning', label: 'Zoning violations or nonconforming uses', iconName: 'map' }
];
const CONDITION_ANSWERS = ['Yes', 'No', 'Unknown'];

/* QuestionCard — confirmed real component (node 5663:54799): one bordered
   card per question, label + help-circle icon header, toggle group below.
   Used for A2.2/A2.5's standalone yes/no questions. */
function questionCardMarkup(label, key, options, value, dataAttr, help) {
  return `
    <div class="question-card">
      <div class="question-header">
        <span class="p-sm font-semibold">${label}</span>
        ${questionHelpMarkup(help)}
      </div>
      <div class="segmented" ${dataAttr}="${key}">
        ${options.map(v => `<button data-val="${v}" class="${value === v ? 'active' : ''}">${v}</button>`).join('')}
      </div>
    </div>`;
}

let defectIndex = 0;
let defectDirection = 0; // -1 back, 1 forward, 0 none: drives the slide animation

/* Disclosure tabs (RF 201 / 208 / 209) on the shared tabbed engine: the
   defect carousel stays as the first tab, then Environmental, Legal,
   Statutory (with the septic permit when the home is on septic) and Lead
   paint, which only appears for homes built before 1978. */
const YNU = ['Yes', 'No', 'Unknown'];
const dq = (key, label, extra = {}) => ({ key, type: 'toggle', label, options: YNU, ...extra });
const onSeptic = () => (listing.utilities.sewerSeptic || []).some(v => ['Septic In-Ground', 'Septic Above Ground'].includes(v));
const builtBefore1978 = () => Number(listing.basics.yearBuilt) > 0 && Number(listing.basics.yearBuilt) < 1978;

function defectCarouselMarkup(d) {
  defectIndex = Math.min(Math.max(defectIndex, 0), CONDITION_ITEMS.length - 1);
  const item = CONDITION_ITEMS[defectIndex];
  const answered = CONDITION_ITEMS.filter(i => d[i.id]).length;
  const slideClass = defectDirection > 0 ? 'from-right' : defectDirection < 0 ? 'from-left' : '';
  defectDirection = 0;
  const anyYes = CONDITION_ITEMS.some(i => d[i.id] === 'Yes');
  return `
    <section class="form-section">
      <p class="section-label">KNOWN DEFECTS &amp; MALFUNCTIONS (RF 201 SECTION B)</p>
      <div class="card defect-carousel">
        <div class="defect-head">
          <p class="p-sm font-semibold">Are you aware of any defect or malfunction in…</p>
          <span class="defect-count">${defectIndex + 1} of ${CONDITION_ITEMS.length}</span>
        </div>
        <div class="hd-overall-bar"><span style="width:${Math.round((answered / CONDITION_ITEMS.length) * 100)}%"></span></div>

        <div class="defect-stage">
          ${iconButtonMarkup('arrow-left', 'Previous item', `data-defect-go="-1" ${defectIndex === 0 ? 'disabled' : ''}`)}
          <div class="defect-slide ${slideClass}" aria-live="polite">
            <span class="defect-icon">${icon(item.iconName, 28)}</span>
            <p class="defect-label">${item.label}</p>
            <div class="defect-answers" data-condition="${item.id}">
              ${CONDITION_ANSWERS.map(v => `<button class="defect-answer ${d[item.id] === v ? 'active' : ''}" data-val="${v}">${v}</button>`).join('')}
            </div>
          </div>
          ${iconButtonMarkup('arrow-right', 'Next item', `data-defect-go="1" ${defectIndex === CONDITION_ITEMS.length - 1 ? 'disabled' : ''}`)}
        </div>

        <div class="defect-list">
          ${CONDITION_ITEMS.map((i, n) => `
            <button class="defect-pill ${n === defectIndex ? 'current' : ''} ${d[i.id] ? 'answered' : ''}" data-defect-jump="${n}">
              ${icon(i.iconName, 14)} ${i.label}${d[i.id] ? ` · <strong>${d[i.id]}</strong>` : ''}
            </button>`).join('')}
        </div>
      </div>
      ${anyYes ? hdItemMarkup({ key: 'defectExplain', type: 'textarea', label: 'If you answered "Yes" to any item above, please explain', rows: 3 }, d) : ''}
      <div class="field-reaction helper">${icon('circle-help')}<span>Answer honestly to the best of your knowledge — Unknown is fine and won't block you.</span></div>
    </section>`;
}

function wireDefectCarousel(root, d) {
  const item = CONDITION_ITEMS[defectIndex];
  const go = (to, dir) => { defectIndex = to; defectDirection = dir; renderApp(); };
  root.querySelectorAll('.defect-answer').forEach(btn => btn.addEventListener('click', () => {
    d[item.id] = btn.dataset.val;
    saveListing();
    if (defectIndex < CONDITION_ITEMS.length - 1) setTimeout(() => go(defectIndex + 1, 1), 180);
    else renderApp();
  }));
  root.querySelectorAll('[data-defect-go]').forEach(btn => btn.addEventListener('click', () => {
    const dir = Number(btn.dataset.defectGo);
    go(defectIndex + dir, dir);
  }));
  root.querySelectorAll('[data-defect-jump]').forEach(btn => btn.addEventListener('click', () => {
    const to = Number(btn.dataset.defectJump);
    go(to, Math.sign(to - defectIndex));
  }));
}

const CONDITION_TABS = [
  {
    id: 'defects', label: 'Defects',
    render: d => defectCarouselMarkup(d),
    wire: root => wireDefectCarousel(root, listing.disclosures),
    progress: d => ({ done: CONDITION_ITEMS.filter(i => d[i.id]).length, total: CONDITION_ITEMS.length })
  },
  {
    id: 'environmental', label: 'Environmental',
    items: [
      { heading: 'Environmental hazards' },
      dq('hazardsKnown', 'Are you aware of any environmental hazards (asbestos, radon, lead-based paint, fuel/chemical storage tanks, contaminated soil or water)?'),
      dq('floodInsuranceRequired', 'Is flood insurance required to be maintained on the property?'),
      dq('landfillOnProperty', 'Are you aware of any landfill on the property?'),
      dq('soilProblems', 'Are you aware of any settling, slippage, sliding, or other soil problems?'),
      { heading: 'Damage' },
      dq('structuralDamage', 'Has the property had any damage from fire, earthquake, flood, or landslide?'),
      { key: 'structuralDamageExplain', type: 'textarea', label: 'Describe the damage', rows: 2, showIf: d => d.structuralDamage === 'Yes' },
      { key: 'structuralDamageRepaired', type: 'toggle', label: 'Has that damage been repaired?', options: ['Yes', 'No', 'Partially'], showIf: d => d.structuralDamage === 'Yes' },
      { heading: 'Fire protection' },
      dq('fireDeptService', 'Is the property served by a fire department?'),
      { key: 'fireDeptName', type: 'text', label: 'Name of the fire department', showIf: d => d.fireDeptService === 'Yes' },
      dq('fireDeptFees', 'Is the property subject to fire-service fees?', { showIf: d => d.fireDeptService === 'Yes' })
    ]
  },
  {
    id: 'legal', label: 'Legal',
    items: [
      { heading: 'Neighborhood & restrictions' },
      dq('neighborhoodNuisances', 'Are you aware of any neighborhood noise problems or nuisances?'),
      dq('deedRestrictions', 'Are you aware of any subdivision or deed restrictions or obligations?'),
      dq('sharedFeatures', 'Are there features shared in common with adjoining owners (walls, fences, driveways, joint rights)?'),
      dq('roadDrainageUtilityChanges', 'Are you aware of any authorized changes to roads, drainage, or utilities affecting the property?'),
      dq('commonAreas', 'Is any "common area" co-owned in undivided interest with others?'),
      { heading: 'Notices & lawsuits' },
      dq('abatementCitations', 'Are you aware of any notices of abatement or citations against the property?'),
      dq('lawsuitsAffectingProperty', 'Are you aware of any lawsuits by or against you affecting the property?'),
      { heading: 'Leased systems & exterior' },
      dq('leasedSystems', 'Is any system, equipment, or part of the property being leased (e.g. solar, alarm, water softener)?'),
      { key: 'leasedSystemsExplain', type: 'textarea', label: 'Describe the leased items', rows: 2, showIf: d => d.leasedSystems === 'Yes' },
      dq('eifsStucco', 'Does the exterior have EIFS ("synthetic stucco")?'),
      dq('eifsMoistureInspection', 'Has a recent moisture inspection of the EIFS been performed?', { showIf: d => d.eifsStucco === 'Yes' }),
      { heading: 'Assessments & survey' },
      dq('improvementDistrictAssessment', 'Is the property within an improvement district subject to a special assessment?'),
      { key: 'improvementDistrictRate', type: 'text', label: 'What is the assessment rate?', showIf: d => d.improvementDistrictAssessment === 'Yes' },
      dq('surveyChangesSince', 'Have there been any changes to the property since the most recent survey?'),
      { key: 'surveyDate', type: 'text', label: 'Date of the most recent survey (if known)', optional: true, placeholder: 'MM/DD/YYYY' }
    ]
  },
  {
    id: 'statutory', label: 'Statutory',
    items: [
      { heading: 'Tennessee statutory disclosures' },
      dq('statutoryInjectionWell', 'Is there an exterior injection well anywhere on the property?'),
      dq('statutoryPercolationTest', 'Has a percolation or soil-absorption test accepted by TDEC ever been performed on the property?'),
      dq('statutoryMovedFoundation', 'Has any residence on the property ever been moved from its original foundation?'),
      dq('statutoryPud', 'Is the property located in a Planned Unit Development (PUD)?'),
      dq('statutorySinkhole', 'Is a sinkhole present on the property?'),
      dq('statutorySepticMoratorium', 'Was the septic permit issued during a sewer moratorium (TCA 68-221-409)?'),
      { heading: 'Septic permit (RF 208)', showIf: onSeptic },
      dq('septicPermitStatus', 'Do you have a copy of the septic (subsurface sewage disposal) permit for this property?', { showIf: onSeptic }),
      { key: 'septicPermittedBedrooms', type: 'stepper', label: 'How many bedrooms is the septic system permitted for?', min: 0,
        showIf: d => onSeptic() && d.septicPermitStatus === 'Yes' }
    ]
  },
  {
    id: 'lead', label: 'Lead paint', showIf: builtBefore1978,
    items: [
      { heading: 'Lead-based paint (RF 209)' },
      { callout: 'Homes built before 1978', text: 'Federal law requires sellers of homes built before 1978 to disclose any known lead-based paint or lead hazards, and to share any records or reports they have.' },
      { key: 'leadKnown', type: 'toggle', label: 'Do you know of any lead-based paint or lead hazards in the home?', options: ['Yes', 'No'] },
      { key: 'leadDescribe', type: 'textarea', label: 'Describe the known lead-based paint or hazards (where they are and what you know)', rows: 2, showIf: d => d.leadKnown === 'Yes' },
      { key: 'leadReports', type: 'toggle', label: 'Do you have any records or reports about lead-based paint or hazards in the home?', options: ['Yes', 'No'] },
      { key: 'leadReportsList', type: 'textarea', label: 'List each lead record or report you have', rows: 2, showIf: d => d.leadReports === 'Yes' }
    ]
  }
];

const conditionTabRef = { current: 'defects' };

function renderA24(root) {
  renderTabbedForm(root, {
    tabs: CONDITION_TABS,
    data: listing.disclosures,
    tabRef: conditionTabRef,
    ariaLabel: 'Property condition sections',
    eyebrow: 'Step 7 of 11 - Disclosures (2 of 2)',
    title: 'Property condition',
    description: "Tennessee law requires these. Leave anything you're unsure of as Unknown — it won't block you.",
    overallNote: 'Answer what you know — “Unknown” counts as an answer.',
    onBack: () => navigateTo('A2.2'),
    onContinue: () => navigateTo('A2.5')
  });
}

registerScreen('A2.4', { type: 'working', render: renderA24 });

/* ---------------- A2.5 — Financial & closing ---------------- */

function renderA25(root) {
  const f = listing.financial;
  const body = `
    ${questionCardMarkup('Are there any liens on the property?', 'liens', ['Yes', 'No'], f.liens, 'data-liens')}
    ${hdBlockMarkup('liens', [
      { key: 'otherLiensDetail', type: 'textarea', label: 'Please explain', rows: 2, hint: 'Who holds the lien and roughly how much is owed.', showIf: x => x.liens === 'Yes' }
    ], f)}
    <div class="field">
      <label>Mortgage balance <span class="chip" style="margin-left:6px">Proposed</span></label>
      <div class="field-reaction helper">${icon('circle-help')} This field is pending its own ticket — included here so net proceeds can eventually account for it.</div>
      <input type="number" id="f-mortgage" value="${f.mortgageBalance ?? ''}" placeholder="0" />
    </div>
    <div class="field">
      <label>Closing comments (Optional)</label>
      <textarea id="f-comments" rows="3">${f.closingComments || ''}</textarea>
    </div>
  `;

  root.innerHTML = workingScreenMarkup({
    eyebrow: 'Step 8 of 11 - Financial & closing',
    title: 'Financial, mortgage & closing',
    bodyHtml: body
  }) + footerBarMarkup('Back', 'Continue', false);

  root.querySelectorAll('[data-liens] button').forEach(btn => btn.addEventListener('click', () => { f.liens = btn.dataset.val; saveListing(); renderApp(); }));
  wireHdScope(root, 'liens', f);
  root.querySelector('#f-mortgage').addEventListener('input', e => { f.mortgageBalance = Number(e.target.value) || null; saveListing(); });
  root.querySelector('#f-comments').addEventListener('input', e => { f.closingComments = e.target.value; saveListing(); });

  wireFooter(root, {
    onBack: () => navigateTo('A2.4'),
    onContinue: () => {
      if (!listing.progress.completedActs.includes(2)) { listing.progress.completedActs.push(2); saveListing(); }
      navigateTo('A2.6');
    }
  });
}

registerScreen('A2.5', { type: 'working', render: renderA25 });

/* ---------------- A2.6 — Milestone ---------------- */

registerScreen('A2.6', {
  type: 'fullbleed',
  render(root) {
    root.innerHTML = milestoneMarkup({
      title: 'The hard part is done.',
      description: 'The legal section is behind you. Now the fun part — photos.',
      action: 'Continue to Act 3'
    });
    root.querySelector('#milestone-continue').addEventListener('click', () => navigateTo('A3.0'));
  }
});
