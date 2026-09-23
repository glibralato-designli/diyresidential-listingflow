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
            <button data-val="na" class="${c[q.id] === 'na' ? 'active' : ''}">N/A</button>
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

const CONDITION_ITEMS = [
  { id: 'interiorWalls', label: 'Interior walls', iconName: 'brick-wall' },
  { id: 'ceilings', label: 'Ceilings', iconName: 'panel-top' },
  { id: 'roof', label: 'Roof', iconName: 'house' },
  { id: 'plumbing', label: 'Plumbing system', iconName: 'droplets' },
  { id: 'electrical', label: 'Electrical system', iconName: 'zap' },
  { id: 'foundation', label: 'Foundation', iconName: 'layers' },
  { id: 'centralHeating', label: 'Central heating', iconName: 'flame' },
  { id: 'centralAir', label: 'Central air conditioning', iconName: 'snowflake' },
  { id: 'flooding', label: 'Flooding, drainage, or grading problems', iconName: 'waves' },
  { id: 'zoning', label: 'Zoning violations or nonconforming uses', iconName: 'map' }
];
const CONDITION_ANSWERS = ['Yes', 'No', 'Unknown'];

/* QuestionCard — confirmed real component (node 5663:54799): one bordered
   card per question, label + help-circle icon header, toggle group below.
   Used for A2.2/A2.5's standalone yes/no questions. */
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

let defectIndex = 0;
let defectDirection = 0; // -1 back, 1 forward, 0 none: drives the slide animation

function renderA24(root) {
  const d = listing.disclosures;
  defectIndex = Math.min(Math.max(defectIndex, 0), CONDITION_ITEMS.length - 1);
  const item = CONDITION_ITEMS[defectIndex];
  const answered = CONDITION_ITEMS.filter(i => d[i.id]).length;
  const slideClass = defectDirection > 0 ? 'from-right' : defectDirection < 0 ? 'from-left' : '';
  defectDirection = 0;

  const body = `
    <div class="section-label">KNOWN DEFECTS &amp; MALFUNCTIONS (RF 201 SECTION B)</div>
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
    <div class="field-reaction helper">${icon('circle-help')}<span>Answer honestly to the best of your knowledge — Unknown is fine and won't block you.</span></div>
  `;

  root.innerHTML = workingScreenMarkup({
    eyebrow: 'Step 7 of 11 - Disclosures (2 of 2)',
    title: 'Property condition',
    whyLine: "Leave anything you're unsure of as Unknown — it won't block you.",
    bodyHtml: body
  }) + footerBarMarkup('Back', 'Continue', false);

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

  wireFooter(root, { onBack: () => navigateTo('A2.2'), onContinue: () => navigateTo('A2.5') });
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
    root.innerHTML = milestoneMarkup({
      title: 'The hard part is done.',
      description: 'The legal section is behind you. Now the fun part — photos.',
      action: 'Continue to Act 3'
    });
    root.querySelector('#milestone-continue').addEventListener('click', () => navigateTo('A3.0'));
  }
});
