/* Act 2 — What buyers need to know (steps 6-8). Section 7 of the spec. */

registerScreen('A2.0', {
  type: 'fullbleed',
  render(root) {
    root.innerHTML = actCoverMarkup({
      actNum: 2,
      iconName: 'newspaper',
      title: ACT_NAMES[2],
      line: ACT_PROMISES[2],
      chips: ['Service contracts', 'Property condition', 'Closing details']
    });
    root.querySelector('#cover-continue').addEventListener('click', () => navigateTo('A2.1'));
  }
});

/* ---------------- A2.1 — Service contracts ---------------- */
/* Spec names 6 questions explicitly. Production (confirmed via Figma capture
   6647:108579/108582) actually has 8 — adds Alarm monitoring and Water
   purification. Following the spec's explicit list; see build notes. */

const SERVICE_CONTRACTS = [
  { id: 'termite', label: 'Termite' },
  { id: 'pest', label: 'Pest control' },
  { id: 'hvac', label: 'HVAC service' },
  { id: 'pool', label: 'Pool' },
  { id: 'landscaping', label: 'Landscaping / lawn' },
  { id: 'handyman', label: 'Handyman' }
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
          </div>
        </div>`).join('')}
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

  wireFooter(root, { onBack: () => navigateTo('A2.0'), onContinue: () => navigateTo('A2.2') });
}

registerScreen('A2.1', { type: 'working', render: renderA21 });

/* ---------------- A2.2 — Disclosures, batch 1 ---------------- */

const INCLUDED_ITEMS = ['Trash compactor', 'Window screens', 'Intercom', 'Central vacuum system', 'Sauna', 'Sump pump', 'Water softener', 'Gas fireplace logs', 'Rain gutters', 'Spa / whirlpool tub'];

function renderA22(root) {
  const d = listing.disclosures;
  const includedSet = new Set(d.includedItems || []);

  const body = `
    <div class="section-label">PROPERTY DETAILS &amp; INCLUDED ITEMS (RF 201 SECTION A)</div>
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
      <label>Which of these items are present and included in the sale? (Optional)</label>
      ${checkboxGridMarkup('includedItems', INCLUDED_ITEMS, includedSet)}
    </div>
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

  wireFooter(root, { onBack: () => navigateTo('A2.1'), onContinue: () => navigateTo('A2.3') });
}

registerScreen('A2.2', { type: 'working', render: renderA22 });

/* ---------------- A2.3 — Checkpoint ---------------- */

registerScreen('A2.3', {
  type: 'fullbleed',
  render(root) {
    root.innerHTML = `
      <div class="screen-fullbleed">
        <div class="fullbleed-inner">
          <p class="h2" style="margin-bottom:var(--space-md)">Halfway through the legal section</p>
          <p class="p-reg act-cover-line">A few more questions about the property's condition, then you're done with disclosures.</p>
          <button class="btn btn-primary" id="checkpoint-continue">Continue</button>
        </div>
      </div>`;
    root.querySelector('#checkpoint-continue').addEventListener('click', () => navigateTo('A2.4'));
  }
});

/* ---------------- A2.4 — Disclosures, batch 2 ---------------- */
/* Representative subset of the real ~19-item defect list (RF 201 Section B)
   plus a couple of Section C items — see build notes for the full count. */

const CONDITION_ITEMS = [
  { id: 'interiorWalls', label: 'Interior walls' },
  { id: 'ceilings', label: 'Ceilings' },
  { id: 'roof', label: 'Roof' },
  { id: 'plumbing', label: 'Plumbing system' },
  { id: 'electrical', label: 'Electrical system' },
  { id: 'foundation', label: 'Foundation' },
  { id: 'centralHeating', label: 'Central heating' },
  { id: 'centralAir', label: 'Central air conditioning' },
  { id: 'flooding', label: 'Flooding, drainage, or grading problems' },
  { id: 'zoning', label: 'Zoning violations or nonconforming uses' }
];

/* QuestionCard — confirmed real component for exactly this content (the
   disclosure questionnaire in the earlier wizard file, node 5663:54799):
   one bordered card per question, label + help-circle icon header, the
   toggle group below. Used here and for A2.2/A2.5's yes/no questions;
   NOT used for A2.1's service contracts, which has no equivalent real
   screen and where the spec explicitly demands a compact table instead
   of one-row-per-question sprawl. */
function questionCardMarkup(label, key, options, value, dataAttr) {
  return `
    <div class="question-card">
      <div class="question-header">
        <span class="p-sm font-semibold">${label}</span>
        ${icon('circle-help', 20)}
      </div>
      <div class="segmented" ${dataAttr}="${key}">
        ${options.map(v => `<button data-val="${v}" class="${value === v ? 'active' : ''}">${v}</button>`).join('')}
      </div>
    </div>`;
}

/* Dense one-row-per-question layout — explicit user direction: "I don't have
   any problem to have every question in one block... probably might be a
   lot." Unlike A2.2/A2.5 (a couple of standalone questions, still full
   QuestionCards), this list can run to ~20 real RF 201 Section B items, so
   each question is a compact row (label — toggle — tooltip) inside one card
   instead of one bordered QuestionCard per item. */
function conditionRowMarkup(item, value) {
  return `
    <div class="yn-row" data-condition="${item.id}">
      <span class="p-sm font-semibold">Are you aware of any defect or malfunction in ${item.label.toLowerCase()}?</span>
      <div class="segmented">
        ${['Yes', 'No', 'Unknown'].map(v => `<button data-val="${v}" class="${value === v ? 'active' : ''}">${v}</button>`).join('')}
      </div>
      <span class="yn-row-tooltip" title="Answer honestly to the best of your knowledge — Unknown is fine and won't block you.">${icon('circle-help', 18)}</span>
    </div>`;
}

function renderA24(root) {
  const d = listing.disclosures;
  const body = `
    <div class="section-label">KNOWN DEFECTS &amp; MALFUNCTIONS (RF 201 SECTION B)</div>
    <div class="card">
      ${CONDITION_ITEMS.map(item => conditionRowMarkup(item, d[item.id])).join('')}
    </div>
  `;

  root.innerHTML = workingScreenMarkup({
    eyebrow: 'Step 7 of 11 - Disclosures (2 of 2)',
    title: 'Property condition',
    whyLine: "Leave anything you're unsure of as Unknown — it won't block you.",
    bodyHtml: body
  }) + footerBarMarkup('Back', 'Continue', false);

  root.querySelectorAll('[data-condition]').forEach(row => {
    row.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        d[row.dataset.condition] = btn.dataset.val;
        saveListing();
        renderApp();
      });
    });
  });

  wireFooter(root, { onBack: () => navigateTo('A2.3'), onContinue: () => navigateTo('A2.5') });
}

registerScreen('A2.4', { type: 'working', render: renderA24 });

/* ---------------- A2.5 — Financial & closing ---------------- */

function renderA25(root) {
  const f = listing.financial;
  const body = `
    ${questionCardMarkup('Are there any liens on the property?', 'liens', ['Yes', 'No'], f.liens, 'data-liens')}
    <div class="field">
      <label>Mortgage balance <span class="chip" style="margin-left:6px">Proposed</span></label>
      <div class="field-reaction helper">${icon('circle-help')} This field is pending its own ticket — included here so net proceeds can eventually account for it.</div>
      <input type="number" id="f-mortgage" value="${f.mortgageBalance ?? ''}" placeholder="0" />
    </div>
    <div class="field">
      <label>Closing comments (Optional)</label>
      <textarea id="f-comments" rows="3">${f.closingComments || ''}</textarea>
    </div>
    <div class="field">
      <label>Do you feel the property is ready to be photographed?</label>
      <div class="segmented" id="photoready-segmented">
        ${['Yes', 'No, needs cleaning/staging', 'No, repairs needed'].map(v => `<button data-val="${v}" class="${f.photoReady === v ? 'active' : ''}">${v}</button>`).join('')}
      </div>
    </div>
  `;

  root.innerHTML = workingScreenMarkup({
    eyebrow: 'Step 8 of 11 - Financial & closing',
    title: 'Financial, mortgage & closing',
    bodyHtml: body
  }) + footerBarMarkup('Back', 'Continue', false);

  root.querySelectorAll('[data-liens] button').forEach(btn => btn.addEventListener('click', () => { f.liens = btn.dataset.val; saveListing(); renderApp(); }));
  root.querySelectorAll('#photoready-segmented button').forEach(btn => btn.addEventListener('click', () => { f.photoReady = btn.dataset.val; saveListing(); renderApp(); }));
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
    root.innerHTML = `
      <div class="screen-fullbleed">
        <div class="fullbleed-inner">
          <p class="act-cover-number">The hard part is done</p>
          <div class="milestone-card" style="max-width:320px; margin: 0 auto var(--space-xl);">${renderLivingCard({ band: false })}</div>
          <p class="p-reg act-cover-line">The legal section is behind you. Now the fun part — photos.</p>
          <button class="btn btn-primary" id="milestone-continue">Continue to Act 3</button>
        </div>
      </div>`;
    root.querySelector('#milestone-continue').addEventListener('click', () => navigateTo('A3.0'));
  }
});
