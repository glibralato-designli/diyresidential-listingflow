/* Act 1 — Let's get to know your home (steps 1-5). Section 7 of the spec. */

function footerBarMarkup(backLabel, continueLabel, continueDisabled) {
  return `
    <div class="footer-bar">
      <div class="footer-bar-inner">
        <button class="btn btn-outline" id="footer-back">${backLabel || 'Back'}</button>
        <button class="btn btn-primary" id="footer-continue" ${continueDisabled ? 'disabled' : ''}>${continueLabel || 'Continue'}</button>
      </div>
    </div>`;
}

function wireFooter(root, { onBack, onContinue }) {
  const backBtn = root.querySelector('#footer-back');
  const continueBtn = root.querySelector('#footer-continue');
  if (backBtn) backBtn.addEventListener('click', onBack);
  if (continueBtn) continueBtn.addEventListener('click', onContinue);
}

function workingScreenMarkup({ eyebrow, title, description, whyLine, bodyHtml }) {
  return `
    <div class="screen-working">
      <div class="main-split-container">
        <div class="screen-text-block">
          <div class="eyebrow">${eyebrow}</div>
          <p class="screen-title">${title}</p>
          ${description ? `<p class="screen-description">${description}</p>` : ''}
          ${whyLine ? `<p class="screen-description">${whyLine}</p>` : ''}
        </div>
        <div class="living-card-band">${renderLivingCard({ band: true })}</div>
        <div class="split-zones">
          <div class="zone-content">${bodyHtml}</div>
          <div class="zone-rail">${renderLivingCard({ band: false })}</div>
        </div>
      </div>
    </div>`;
}

/* Act cover — split layout from the real cover frame (node 6654:185310):
   text column on the left (eyebrow, act number, h1, line, chips, primary
   action), illustration filling the right. The living card sits under the
   action so the seller sees their listing's progress at every act. */
const ACT_COVER_ACTIONS = {
  1: 'Start with my address',
  2: 'Start with service contracts',
  3: 'Start with photos',
  4: 'Start with pricing'
};

/* Progress block under the cover's action: header + the same binary act
   segments the Steps panel uses, then the living card in its compact
   "List" layout so it reads as a status summary, not a second hero. */
function actCoverProgressMarkup() {
  const done = actSegments().filter(Boolean).length;
  return `
    <div class="act-cover-progress">
      <div class="act-cover-progress-header">
        <span class="act-cover-progress-title">Your listing so far</span>
        <span class="act-cover-progress-meta">${done} of 4 acts complete</span>
      </div>
      <div class="act-segments">${actSegments().map(f => `<div class="act-segment ${f ? 'filled' : ''}"></div>`).join('')}</div>
      ${renderLivingCard({ band: true })}
    </div>`;
}

function actCoverMarkup({ actNum, title, line, chips }) {
  return `
    <div class="act-cover">
      <div class="act-cover-text">
        <p class="act-cover-eyebrow">LISTING YOUR HOME</p>
        <p class="act-cover-number">Act ${actNum} of 4</p>
        <h1 class="act-cover-title">${title}</h1>
        <p class="act-cover-line">${line}</p>
        <div class="act-cover-chips">${chips.map(c => `<span class="badge badge-secondary">${c}</span>`).join('')}</div>
        <button class="btn btn-primary act-cover-action" id="cover-continue">${ACT_COVER_ACTIONS[actNum]}</button>
        ${actCoverProgressMarkup()}
      </div>
      <div class="act-cover-art">
        <div class="act-cover-art-inner"><img src="assets/images/act-${actNum}-cover.webp" width="1024" height="1024" alt="" /></div>
      </div>
    </div>`;
}

/* ---------------- A1.0 — Cover ---------------- */

registerScreen('A1.0', {
  type: 'fullbleed',
  render(root) {
    root.innerHTML = actCoverMarkup({
      actNum: 1,
      iconName: 'house',
      title: ACT_NAMES[1],
      line: ACT_PROMISES[1],
      chips: ['Address', 'Property basics', 'Your home']
    });
    root.querySelector('#cover-continue').addEventListener('click', () => navigateTo('A1.1'));
  }
});

/* ---------------- A1.1 — Address ---------------- */

/* Agent representation — each answer opens its own follow-up question
   (reference screens, Figma section 6647:109132). */
const AGENT_OPTIONS = [
  { val: 'no', label: 'No' },
  { val: 'yes', label: 'Yes' },
  { val: 'is-agent', label: 'I am a Real Estate Agent' }
];

const AGENT_FOLLOW_UPS = {
  'no': {
    question: 'Have you previously worked with a real estate agent for this property?',
    options: ['No', 'Yes, but I am no longer working with them', 'Yes, and I am still working with them']
  },
  'yes': {
    question: 'Are you currently under an active agreement with a real estate agent?',
    options: ['Yes', 'No', "I'm not sure"]
  },
  'is-agent': {
    question: 'Are you a licensed real estate agent?',
    options: ['Yes', 'No']
  }
};

function radioListMarkup(name, options, value) {
  return `
    <div class="radio-list" role="radiogroup" data-radio-list="${name}">
      ${options.map(o => {
        const val = typeof o === 'string' ? o : o.val;
        const label = typeof o === 'string' ? o : o.label;
        const selected = value === val;
        return `
          <button type="button" class="radio-row ${selected ? 'selected' : ''}" role="radio" aria-checked="${selected}" data-val="${val}">
            <span class="radio-dot"></span>
            <span>${label}</span>
          </button>`;
      }).join('')}
    </div>`;
}

function agentQuestionMarkup() {
  const rep = listing.representedByAgent;
  const followUp = AGENT_FOLLOW_UPS[rep];
  return `
    <div class="field">
      <label>Are you currently represented by a real estate agent? <span class="field-optional">(Optional)</span></label>
      ${radioListMarkup('agent', AGENT_OPTIONS, rep)}
    </div>
    ${followUp ? `
      <div class="field">
        <label>${followUp.question}</label>
        ${radioListMarkup('agent-follow-up', followUp.options, listing.agentFollowUp[rep])}
      </div>` : ''}`;
}

const ADDRESS_SUGGESTIONS = [
  { line1: '123 Maple Street', city: 'Nashville', state: 'TN', zip: '37201', hasRecords: true },
  { line1: '42 County Road 8', city: 'Pikeville', state: 'TN', zip: '37367', hasRecords: false }
];

function renderA11(root) {
  const a = listing.address;
  const confirmState = a.prefill.confirmed.sqft || 'unconfirmed';

  const prefillBox = () => {
    if (!a.resolved) return '';
    if (a.prefill.none) {
      return `<div class="field-reaction helper">${icon('circle-help')} We couldn't find public records for this address — no problem, you can fill these in yourself in the next step.</div>`;
    }
    if (confirmState === 'unconfirmed') {
      return `
        <div class="prefill-box">
          <p class="p-sm font-semibold">We found ${a.prefill.sqft.toLocaleString()} sq. ft. Is that correct?</p>
          <div class="prefill-actions">
            <button class="btn btn-sm btn-primary" id="prefill-yes">Yes, looks right</button>
            <button class="btn btn-sm btn-outline" id="prefill-fix">Let me fix it</button>
          </div>
        </div>`;
    }
    if (confirmState === 'fixing') {
      return `
        <div class="prefill-box">
          <p class="p-sm font-semibold">What's the correct square footage?</p>
          <div class="field"><input type="number" id="prefill-fix-input" value="${a.prefill.sqft}" /></div>
          <div class="prefill-actions"><button class="btn btn-sm btn-primary" id="prefill-save">Save</button></div>
        </div>`;
    }
    if (confirmState === 'confirmed') {
      return `<div class="prefill-box confirmed"><p class="p-sm font-semibold">${icon('check')} ${a.prefill.sqft.toLocaleString()} sq. ft. — confirmed</p></div>`;
    }
    if (confirmState === 'corrected') {
      return `<div class="prefill-box corrected"><p class="p-sm font-semibold">${icon('pencil-ruler')} ${a.prefill.sqft.toLocaleString()} sq. ft. — corrected by you</p></div>`;
    }
    return '';
  };

  const body = `
    <div class="field">
      <label for="addr-input">Property address</label>
      <input type="text" id="addr-input" placeholder="Start typing an address…" autocomplete="off" value="${a.line1 || ''}" />
      <div id="addr-suggestions"></div>
    </div>
    ${a.resolved ? `
      <div class="card" style="padding: var(--space-md); display:flex; gap: var(--space-md); align-items:center;">
        <div style="width:96px;height:72px;border-radius:var(--radius-lg);background:var(--background-subtle);display:flex;align-items:center;justify-content:center;color:var(--muted-foreground);flex-shrink:0;">${icon('map-pin')}</div>
        <div>
          <p class="p-sm font-semibold">${a.line1}</p>
          <p class="p-sm text-muted">${a.city}, ${a.state} ${a.zip}</p>
        </div>
      </div>
      ${prefillBox()}
    ` : ''}
    ${agentQuestionMarkup()}
    <div class="field-reaction helper">${icon('circle-help')} We'll ask for proof of ownership later, just before signing.</div>
  `;

  root.innerHTML = workingScreenMarkup({
    eyebrow: 'Step 1 of 11 - Address',
    title: "What's the property address?",
    description: "We'll pull in what public records already know, so you don't have to type it twice.",
    bodyHtml: body
  }) + footerBarMarkup('Back', 'Continue', !a.resolved);

  const input = root.querySelector('#addr-input');
  const suggBox = root.querySelector('#addr-suggestions');

  input.addEventListener('input', () => {
    if (input.value.trim().length < 2 || a.resolved) { suggBox.innerHTML = ''; return; }
    suggBox.innerHTML = `
      <div class="card" style="padding: var(--space-xs); margin-top: var(--space-xs);">
        ${ADDRESS_SUGGESTIONS.map((s, i) => `
          <button class="btn-ghost" data-suggestion="${i}" style="display:flex; width:100%; text-align:left; padding: var(--space-s); border-radius: var(--radius-md);">
            ${icon('map-pin')}&nbsp; ${s.line1}, ${s.city}, ${s.state} ${s.zip}
          </button>`).join('')}
      </div>`;
    suggBox.querySelectorAll('[data-suggestion]').forEach(btn => {
      btn.addEventListener('click', () => {
        const s = ADDRESS_SUGGESTIONS[Number(btn.dataset.suggestion)];
        listing.address.line1 = s.line1;
        listing.address.city = s.city;
        listing.address.state = s.state;
        listing.address.zip = s.zip;
        listing.address.resolved = true;
        listing.address.prefill.none = !s.hasRecords;
        if (s.hasRecords) listing.address.prefill.confirmed.sqft = 'unconfirmed';
        saveListing();
        renderApp();
      });
    });
  });

  const yesBtn = root.querySelector('#prefill-yes');
  if (yesBtn) yesBtn.addEventListener('click', () => { a.prefill.confirmed.sqft = 'confirmed'; saveListing(); renderApp(); });

  const fixBtn = root.querySelector('#prefill-fix');
  if (fixBtn) fixBtn.addEventListener('click', () => { a.prefill.confirmed.sqft = 'fixing'; saveListing(); renderApp(); });

  const saveFixBtn = root.querySelector('#prefill-save');
  if (saveFixBtn) saveFixBtn.addEventListener('click', () => {
    const val = Number(root.querySelector('#prefill-fix-input').value) || a.prefill.sqft;
    a.prefill.sqft = val;
    a.prefill.confirmed.sqft = 'corrected';
    saveListing();
    renderApp();
  });

  root.querySelectorAll('[data-radio-list="agent"] button').forEach(btn => {
    btn.addEventListener('click', () => {
      listing.representedByAgent = btn.dataset.val;
      saveListing();
      renderApp();
    });
  });
  root.querySelectorAll('[data-radio-list="agent-follow-up"] button').forEach(btn => {
    btn.addEventListener('click', () => {
      listing.agentFollowUp[listing.representedByAgent] = btn.dataset.val;
      saveListing();
      renderApp();
    });
  });

  wireFooter(root, {
    onBack: () => navigateTo('E2'),
    onContinue: () => { if (a.resolved) navigateTo('A1.2'); }
  });
}

registerScreen('A1.1', { type: 'working', render: renderA11 });

/* ---------------- A1.2 — Property basics ---------------- */

function seedBasicsFromPrefill() {
  const b = listing.basics;
  const p = listing.address.prefill;
  if (p.none) return;
  if (b.yearBuilt === null) b.yearBuilt = p.yearBuilt;
  if (b.sqft === null) b.sqft = p.sqft;
  if (b.lotSize === null) b.lotSize = p.lotSize;
  if (!b.beds) b.beds = p.beds;
  if (!b.baths) b.baths = p.baths;
  if (!b.garage) b.garage = p.garage;
}

function stepperMarkup(fieldKey, label, value) {
  return `
    <div class="stepper" data-stepper="${fieldKey}">
      <span class="stepper-label">${label}</span>
      <div class="stepper-controls">
        <button class="stepper-btn" data-action="dec" aria-label="Decrease">${icon('minus', 20)}</button>
        <span class="stepper-value">${value}</span>
        <button class="stepper-btn" data-action="inc" aria-label="Increase">${icon('plus', 20)}</button>
      </div>
    </div>`;
}

function wireSteppers(root, getPath, onChange) {
  root.querySelectorAll('[data-stepper]').forEach(el => {
    el.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = el.dataset.stepper;
        const delta = btn.dataset.action === 'inc' ? 1 : -1;
        onChange(key, delta);
        renderApp();
      });
    });
  });
}

const HOA_FEE_INCLUDES = ['Cable TV', 'Electricity', 'Exterior Maintenance', 'Gas', 'Grounds Maintenance', 'Insurance', 'Maint. on Pool/Tennis/Club', 'Sewer', 'Trash Pickup', 'Water', 'Other'];

function renderA12(root) {
  seedBasicsFromPrefill();
  const b = listing.basics;
  if (!b.hoaDetails || b.hoaDetails.phone === undefined) b.hoaDetails = {
    name: '', phone: '', contactName: '',
    street: '', street2: '', city: '', state: '', zip: '',
    fee: null, frequency: null, feeIncludes: [],
    transferFee: null, currentWithDues: null,
    rentingPermitted: null, trailersPermitted: null, petsPermitted: null, specialLevy: null
  };
  const wasPrefilled = (key) => !listing.address.prefill.none && listing.address.prefill[key] !== undefined;

  const fieldLabel = (text, key) => wasPrefilled(key)
    ? `<span class="label-row"><span>${text}</span><span class="badge-found">Found</span></span>`
    : text;

  const propertyTypeLabel = PROPERTY_TYPES.find(t => t.id === listing.propertyType)?.label
    || (listing.propertyType === 'other' ? (listing.propertyTypeOther || 'Other') : 'Not set');

  const body = `
    <div class="card" style="display:flex; align-items:center; justify-content:space-between;">
      <div>
        <p class="p-sm text-muted">Property type</p>
        <p class="p-reg font-semibold">${propertyTypeLabel}</p>
      </div>
      <a href="#/E1" class="btn-link">Edit</a>
    </div>

    <div class="field-grid dense">
      <div class="field">
        <label>${fieldLabel('Year built', 'yearBuilt')}</label>
        <input type="number" id="f-yearBuilt" value="${b.yearBuilt ?? ''}" />
      </div>
      <div class="field">
        <label>${fieldLabel('Square footage', 'sqft')}</label>
        <input type="number" id="f-sqft" value="${b.sqft ?? ''}" />
      </div>
      <div class="field">
        <label>${fieldLabel('Lot size', 'lotSize')}</label>
        <div class="input-with-toggle">
          <input type="number" id="f-lotSize" value="${b.lotSize ?? ''}" />
          <div class="segmented" id="lot-unit-segmented">
            <button data-val="sqft" class="${b.lotUnit === 'sqft' ? 'active' : ''}">Sq Ft</button>
            <button data-val="acre" class="${b.lotUnit === 'acre' ? 'active' : ''}">Acre</button>
          </div>
        </div>
        <label class="checkbox-row">
          <input type="checkbox" id="f-small-lot" ${b.lotSize && b.lotSize < 250 && b.lotUnit === 'acre' ? 'checked' : ''} /> Less than .25 acre
        </label>
        <p class="field-hint">For condos and zero lot line, use "less than .25 acres."</p>
      </div>
      <div class="field">
        <label>Part of an HOA?</label>
        <div class="segmented" id="hoa-segmented">
          <button data-val="yes" class="${b.hoa === 'yes' ? 'active' : ''}">Yes</button>
          <button data-val="no" class="${b.hoa === 'no' ? 'active' : ''}">No</button>
        </div>
      </div>
    </div>

    <div class="reveal ${b.hoa === 'yes' ? 'open' : ''}">
      <div class="card" style="display:flex; flex-direction:column; gap:var(--space-md);">
        <p class="p-mini font-bold text-muted" style="letter-spacing:1px;">HOME OWNERS ASSOCIATION</p>

        <div class="field-grid dense">
          <div class="field"><label>Name of HOA</label><input type="text" id="f-hoa-name" value="${b.hoaDetails.name}" /></div>
          <div class="field"><label>Phone number</label><input type="tel" id="f-hoa-phone" value="${b.hoaDetails.phone}" /></div>
          <div class="field"><label>Name of HOA contact or manager <span class="field-optional">(Optional)</span></label><input type="text" id="f-hoa-contactName" value="${b.hoaDetails.contactName}" /></div>
        </div>

        <div class="field-grid dense">
          <div class="field"><label>Street address</label><input type="text" id="f-hoa-street" value="${b.hoaDetails.street}" /></div>
          <div class="field"><label>Street address line 2 <span class="field-optional">(Optional)</span></label><input type="text" id="f-hoa-street2" value="${b.hoaDetails.street2}" /></div>
          <div class="field"><label>City</label><input type="text" id="f-hoa-city" value="${b.hoaDetails.city}" /></div>
          <div class="field">
            <label>State</label>
            <select id="f-hoa-state">
              <option value="">Select a state</option>
              ${US_STATES.map(s => `<option value="${s}" ${b.hoaDetails.state === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
          <div class="field"><label>ZIP code</label><input type="text" id="f-hoa-zip" value="${b.hoaDetails.zip}" /></div>
        </div>

        <div class="field-grid dense">
          <div class="field"><label>Association fee</label><input type="number" id="f-hoa-fee" value="${b.hoaDetails.fee ?? ''}" /></div>
          <div class="field"><label>Association transfer fee <span class="field-optional">(Optional)</span></label><input type="number" id="f-hoa-transferFee" value="${b.hoaDetails.transferFee ?? ''}" /></div>
        </div>

        <div class="field">
          <label>Fee frequency</label>
          <div class="segmented" id="hoa-frequency-segmented">
            ${['Monthly', 'Quarterly', 'Annually'].map(v => `<button data-val="${v}" class="${b.hoaDetails.frequency === v ? 'active' : ''}">${v}</button>`).join('')}
          </div>
        </div>

        <div class="field">
          <label>Association fee includes</label>
          ${checkboxGridMarkup('hoaFeeIncludes', HOA_FEE_INCLUDES, new Set(b.hoaDetails.feeIncludes))}
        </div>

        <div class="field-grid dense">
          <div class="field"><label>Current with HOA dues? <span class="field-optional">(Optional)</span></label><div class="segmented" id="hoa-current-segmented">${['Yes', 'No'].map(v => `<button data-val="${v}" class="${b.hoaDetails.currentWithDues === v ? 'active' : ''}">${v}</button>`).join('')}</div></div>
          <div class="field"><label>Is there a special levy?</label><div class="segmented" id="hoa-levy-segmented">${['Yes', 'No'].map(v => `<button data-val="${v}" class="${b.hoaDetails.specialLevy === v ? 'active' : ''}">${v}</button>`).join('')}</div></div>
        </div>

        <div class="field-grid dense">
          <div class="field"><label>Renting permitted?</label><div class="segmented" id="hoa-renting-segmented">${['Yes', 'No'].map(v => `<button data-val="${v}" class="${b.hoaDetails.rentingPermitted === v ? 'active' : ''}">${v}</button>`).join('')}</div></div>
          <div class="field"><label>Trailers permitted?</label><div class="segmented" id="hoa-trailers-segmented">${['Yes', 'No'].map(v => `<button data-val="${v}" class="${b.hoaDetails.trailersPermitted === v ? 'active' : ''}">${v}</button>`).join('')}</div></div>
          <div class="field"><label>Pets permitted?</label><div class="segmented" id="hoa-pets-segmented">${['Yes', 'No', 'See Remarks'].map(v => `<button data-val="${v}" class="${b.hoaDetails.petsPermitted === v ? 'active' : ''}">${v}</button>`).join('')}</div></div>
        </div>
      </div>
    </div>

    <div class="field-grid dense">
      ${stepperMarkup('beds', fieldLabel('Bedrooms', 'beds'), b.beds)}
      ${stepperMarkup('baths', fieldLabel('Bathrooms', 'baths'), b.baths)}
      ${stepperMarkup('garage', fieldLabel('Garage spaces', 'garage'), b.garage)}
    </div>
  `;

  root.innerHTML = workingScreenMarkup({
    eyebrow: 'Step 2 of 11 - Property basics',
    title: 'A few basics about the home',
    whyLine: 'We use these details to compare your home to similar listings.',
    bodyHtml: body
  }) + footerBarMarkup('Back', 'Continue', false);

  root.querySelector('#f-yearBuilt').addEventListener('input', e => { b.yearBuilt = Number(e.target.value) || null; saveListing(); });
  root.querySelector('#f-sqft').addEventListener('input', e => { b.sqft = Number(e.target.value) || null; saveListing(); refreshLivingCardRail(); });
  root.querySelector('#f-lotSize').addEventListener('input', e => { b.lotSize = Number(e.target.value) || null; saveListing(); });
  root.querySelector('#f-small-lot').addEventListener('change', e => { if (e.target.checked) { b.lotUnit = 'acre'; b.lotSize = 24; saveListing(); renderApp(); } });

  root.querySelectorAll('#lot-unit-segmented button').forEach(btn => btn.addEventListener('click', () => { b.lotUnit = btn.dataset.val; saveListing(); renderApp(); }));
  root.querySelectorAll('#hoa-segmented button').forEach(btn => btn.addEventListener('click', () => { b.hoa = btn.dataset.val; saveListing(); renderApp(); }));

  const hoaTextFields = { 'f-hoa-name': 'name', 'f-hoa-phone': 'phone', 'f-hoa-contactName': 'contactName', 'f-hoa-street': 'street', 'f-hoa-street2': 'street2', 'f-hoa-city': 'city' };
  Object.entries(hoaTextFields).forEach(([id, key]) => {
    const el = root.querySelector(`#${id}`);
    if (el) el.addEventListener('input', () => { b.hoaDetails[key] = el.value; saveListing(); });
  });
  const hoaState = root.querySelector('#f-hoa-state');
  if (hoaState) hoaState.addEventListener('change', () => { b.hoaDetails.state = hoaState.value; saveListing(); });
  const hoaZip = root.querySelector('#f-hoa-zip');
  if (hoaZip) hoaZip.addEventListener('input', () => { b.hoaDetails.zip = hoaZip.value; saveListing(); });
  const hoaFee = root.querySelector('#f-hoa-fee');
  if (hoaFee) hoaFee.addEventListener('input', e => { b.hoaDetails.fee = Number(e.target.value) || null; saveListing(); });
  const hoaTransferFee = root.querySelector('#f-hoa-transferFee');
  if (hoaTransferFee) hoaTransferFee.addEventListener('input', e => { b.hoaDetails.transferFee = Number(e.target.value) || null; saveListing(); });
  root.querySelectorAll('#hoa-frequency-segmented button').forEach(btn => btn.addEventListener('click', () => { b.hoaDetails.frequency = btn.dataset.val; saveListing(); renderApp(); }));

  const hoaSegMap = {
    'hoa-current-segmented': 'currentWithDues', 'hoa-levy-segmented': 'specialLevy',
    'hoa-renting-segmented': 'rentingPermitted', 'hoa-trailers-segmented': 'trailersPermitted', 'hoa-pets-segmented': 'petsPermitted'
  };
  Object.entries(hoaSegMap).forEach(([id, key]) => {
    const el = root.querySelector(`#${id}`);
    if (!el) return;
    el.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => { b.hoaDetails[key] = btn.dataset.val; saveListing(); renderApp(); }));
  });

  const hoaFeeIncludesGroup = root.querySelector('[data-checkbox-group="hoaFeeIncludes"]');
  if (hoaFeeIncludesGroup) {
    hoaFeeIncludesGroup.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const set = new Set(b.hoaDetails.feeIncludes || []);
        if (cb.checked) set.add(cb.value); else set.delete(cb.value);
        b.hoaDetails.feeIncludes = Array.from(set);
        saveListing();
      });
    });
  }

  wireSteppers(root, null, (key, delta) => {
    b[key] = Math.max(0, (b[key] || 0) + delta);
  });

  wireFooter(root, { onBack: () => navigateTo('A1.1'), onContinue: () => navigateTo('A1.3') });
}

registerScreen('A1.2', { type: 'working', render: renderA12 });

/* Lightweight helper: some inline field changes only affect the rail, not the whole DOM */
function refreshLivingCardRail() {
  const rail = document.querySelector('.zone-rail');
  if (rail) rail.innerHTML = renderLivingCard({ band: false });
  const band = document.querySelector('.living-card-band');
  if (band) band.innerHTML = renderLivingCard({ band: true });
}

/* ---------------- A1.3 — Contact & role ---------------- */
/* Rebuilt per direct user request ("show me all of the questions") against
   the real Figma reference screens (research/role-and-basics.md) — every
   role now drives its own real field set: filer Contact Information, a
   role-specific entity block (Trust name / LLC legal name+address+members),
   one-or-more Homeowner entries (fixed at 2 for co-owner, an addable
   repeater for attorney/trustee/llc/assisting), a showings-contact question
   once there are 2+ homeowners, then the shared Occupancy + Property
   Readiness tail every role ends with. "Assisting the homeowner" had no
   reference screens captured — its extra fields are a best-effort
   reconstruction (contact info + one homeowner entry), flagged inline. */

const ROLES = [
  { id: 'sole-owner', title: 'Sole owner', subtitle: 'I own the property by myself.', iconName: 'user' },
  { id: 'co-owner', title: 'Co-owner with spouse/domestic partner', subtitle: 'I own with a spouse or partner.', iconName: 'users' },
  { id: 'attorney', title: 'Attorney-in-fact (POA)', subtitle: 'I act under a power of attorney.', iconName: 'scale' },
  { id: 'trustee', title: 'Trustee (held in a trust)', subtitle: 'The property is held in a trust.', iconName: 'landmark' },
  { id: 'llc', title: 'Member of an LLC', subtitle: 'The property is held by an LLC.', iconName: 'building-2' },
  { id: 'assisting', title: 'Assisting the homeowner', subtitle: 'I am helping the owner complete this form.', iconName: 'link' }
];

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

const READINESS_OPTIONS = ['Yes', 'No, we need cleaning/staging', 'No, repairs are needed before listing', 'Other'];
const PREF_METHODS = ['Phone', 'Text', 'Email'];

function emptyHomeowner() { return { firstName: '', lastName: '', phone: '', email: '', prefMethod: null }; }

/* Co-owner is fixed at exactly 2 homeowners (no add/remove in the real
   screens); every other multi-owner role starts at 1 with a repeater. */
function ensureHomeownersForRole(roleId) {
  const rd = listing.roleDetails;
  if (roleId === 'sole-owner') { rd.homeowners = []; return; }
  if (roleId === 'co-owner') {
    while (rd.homeowners.length < 2) rd.homeowners.push(emptyHomeowner());
    if (rd.homeowners.length > 2) rd.homeowners = rd.homeowners.slice(0, 2);
    return;
  }
  if (!rd.homeowners.length) rd.homeowners.push(emptyHomeowner());
}

function radioGroupMarkup(name, options, value) {
  return `<div class="segmented" data-radio="${name}">${options.map(v => `<button data-val="${v}" class="${value === v ? 'active' : ''}">${v}</button>`).join('')}</div>`;
}

function contactInfoFieldsMarkup(c) {
  return `
    <p class="p-mini font-bold text-muted" style="letter-spacing:1px; margin-bottom:var(--space-s)">CONTACT INFORMATION</p>
    <div class="field-grid dense">
      <div class="field"><label>First name</label><input type="text" data-contact="firstName" value="${c.firstName}" /></div>
      <div class="field"><label>Last name</label><input type="text" data-contact="lastName" value="${c.lastName}" /></div>
      <div class="field"><label>Phone number</label><input type="tel" data-contact="phone" value="${c.phone}" /></div>
      <div class="field"><label>Email address</label><input type="text" data-contact="email" value="${c.email}" /></div>
      <div class="field"><label>Confirm email address</label><input type="text" data-contact="confirmEmail" value="${c.confirmEmail}" /></div>
    </div>
    <div class="field" style="margin-top:var(--space-md)">
      <label>Preferred method of communication</label>
      ${radioGroupMarkup('contact-prefMethod', PREF_METHODS, c.prefMethod)}
    </div>`;
}

function homeownerFieldsMarkup(h, idx) {
  return `
    <div class="card" data-homeowner="${idx}" style="margin-top:var(--space-md); position:relative;">
      ${idx > 0 ? `<button class="btn-ghost" data-remove-homeowner="${idx}" style="position:absolute; top:var(--space-md); right:var(--space-md); width:28px;height:28px; border-radius:var(--radius-full); display:flex; align-items:center; justify-content:center;" aria-label="Remove">${icon('x', 16)}</button>` : ''}
      <p class="p-mini font-bold text-muted" style="letter-spacing:1px; margin-bottom:var(--space-s)">HOMEOWNER #${idx + 1}</p>
      <div class="field-grid dense">
        <div class="field"><label>First name</label><input type="text" data-homeowner-field="firstName" value="${h.firstName}" /></div>
        <div class="field"><label>Last name</label><input type="text" data-homeowner-field="lastName" value="${h.lastName}" /></div>
        <div class="field"><label>Cell phone</label><input type="tel" data-homeowner-field="phone" value="${h.phone}" /></div>
        <div class="field"><label>Email address</label><input type="text" data-homeowner-field="email" value="${h.email}" /></div>
      </div>
      <div class="field" style="margin-top:var(--space-md)">
        <label>Preferred method of communication</label>
        ${radioGroupMarkup(`homeowner-${idx}-prefMethod`, PREF_METHODS, h.prefMethod)}
      </div>
    </div>`;
}

function trustCalloutMarkup() {
  return `
    <div class="card" style="background:var(--background-subtle); border-style:dashed;">
      <p class="p-sm font-semibold" style="margin-bottom:var(--space-s)">Trust information</p>
      <p class="p-sm text-muted">Selling a property held in a trust can be more involved, especially if it was inherited — we just need the title company to know the trust is involved and handle it accordingly.</p>
      <p class="p-sm text-muted" style="margin-top:var(--space-s)">Revocable, irrevocable, living, and testamentary trusts are all handled a little differently — your title company will guide you through what's needed for yours.</p>
    </div>
    <div class="field" style="margin-top:var(--space-md)">
      <label>Name of the trust</label>
      <input type="text" id="f-trustName" value="${listing.roleDetails.trustName}" />
    </div>`;
}

function llcFieldsMarkup(llc) {
  return `
    <div class="card" style="background:var(--background-subtle); border-style:dashed;">
      <p class="p-sm font-semibold" style="margin-bottom:var(--space-s)">LLC information</p>
      <p class="p-sm text-muted">When an LLC holds title, the title company will request its Operating Agreement, Articles of Organization, EIN #, and a Proceeds Disbursement Authorization before closing.</p>
    </div>
    <div class="field" style="margin-top:var(--space-md)">
      <label>Legal name of the LLC</label>
      <input type="text" data-llc="legalName" value="${llc.legalName}" />
    </div>
    <div class="field-grid dense" style="margin-top:var(--space-md)">
      <div class="field"><label>Street address</label><input type="text" data-llc="street" value="${llc.street}" /></div>
      <div class="field"><label>Street address line 2 <span class="field-optional">(Optional)</span></label><input type="text" data-llc="street2" value="${llc.street2}" /></div>
      <div class="field"><label>City</label><input type="text" data-llc="city" value="${llc.city}" /></div>
      <div class="field">
        <label>State</label>
        <select data-llc="state">
          <option value="">Select a state</option>
          ${US_STATES.map(s => `<option value="${s}" ${llc.state === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="field"><label>ZIP code</label><input type="text" data-llc="zip" value="${llc.zip}" /></div>
    </div>
    <div class="field" style="margin-top:var(--space-md)">
      <label>Contact info for each LLC member required to sign <span class="field-optional">(Optional)</span></label>
      <textarea data-llc="membersList" rows="2">${llc.membersList}</textarea>
    </div>
    <div class="field" style="margin-top:var(--space-md)">
      <label>Who is the primary contact for the LLC?</label>
      ${radioGroupMarkup('llc-primaryContact', ['I am the Primary Contact', 'Other'], llc.primaryContact)}
    </div>`;
}

function showingsContactMarkup(rd) {
  if (rd.homeowners.length < 2) return '';
  const options = rd.homeowners.map((_, i) => `Homeowner #${i + 1}`);
  return `
    <div class="field" style="margin-top:var(--space-lg)">
      <label>Which party will handle showings and buyer questions? <span class="field-optional">(Optional)</span></label>
      ${radioGroupMarkup('showingsContact', options, rd.showingsContact)}
    </div>`;
}

function renderA13(root) {
  const a = listing.address;
  const role = listing.role;
  const rd = listing.roleDetails;
  if (role) ensureHomeownersForRole(role);

  const roleDetailBody = () => {
    if (!role) return '';
    const parts = [];

    if (role === 'trustee') parts.push(trustCalloutMarkup());
    if (role === 'llc') parts.push(llcFieldsMarkup(rd.llc));

    if (role === 'assisting') {
      parts.push(`<div class="field-reaction helper">${icon('circle-help')} This role has no reference screens in the source file — this is a best-effort reconstruction (your contact info, then the homeowner's).</div>`);
    }

    /* Co-owner has no separate "filer" — the filer IS Homeowner #1 */
    if (role !== 'co-owner') parts.push(contactInfoFieldsMarkup(listing.contact));

    rd.homeowners.forEach((h, i) => parts.push(homeownerFieldsMarkup(h, i)));

    if (role !== 'co-owner' && rd.homeowners.length) {
      parts.push(`
        <button class="btn btn-sm btn-outline" id="add-homeowner" style="margin-top:var(--space-md); border-style:dashed;">
          ${icon('plus', 14)} Add Homeowner
        </button>`);
    }

    parts.push(showingsContactMarkup(rd));

    parts.push(`
      <div class="field" style="margin-top:var(--space-lg)">
        <p class="p-mini font-bold text-muted" style="letter-spacing:1px; margin-bottom:var(--space-s)">OCCUPANCY</p>
        <label>Do the owners live on the property?</label>
        ${radioGroupMarkup('occupancy', ['Yes', 'No'], rd.occupancy)}
      </div>
      <div class="field" style="margin-top:var(--space-lg)">
        <p class="p-mini font-bold text-muted" style="letter-spacing:1px; margin-bottom:var(--space-s)">PROPERTY READINESS</p>
        <label>Do you feel the property is ready to be photographed?</label>
        ${radioGroupMarkup('propertyReadiness', READINESS_OPTIONS, rd.propertyReadiness)}
      </div>`);

    return parts.join('');
  };

  const body = `
    <div class="card" style="display:flex; align-items:center; justify-content:space-between;">
      <div>
        <p class="p-sm text-muted">We found that for you — no need to enter it manually.</p>
        <p class="p-reg font-semibold">${a.line1}</p>
        <p class="p-sm text-muted">${a.city}, ${a.state} ${a.zip}</p>
      </div>
      <a href="#/A1.1" class="btn-link">Edit</a>
    </div>

    <div class="field">
      <label>I am the…</label>
      <div style="display:flex; flex-direction:column; gap: var(--space-xs);">
        ${ROLES.map(r => `
          <button class="rich-row ${role === r.id ? 'selected' : ''}" data-role="${r.id}">
            ${icon(r.iconName)}
            <div>
              <div class="rich-row-title">${r.title}</div>
              <div class="rich-row-subtitle">${r.subtitle}</div>
            </div>
          </button>`).join('')}
      </div>
    </div>

    <div class="reveal ${role ? 'open' : ''}">${roleDetailBody()}</div>
  `;

  root.innerHTML = workingScreenMarkup({
    eyebrow: 'Step 3 of 11 - Contact & role',
    title: 'Your role in this sale',
    bodyHtml: body
  }) + footerBarMarkup('Back', 'Continue', !role);

  root.querySelectorAll('[data-role]').forEach(btn => {
    btn.addEventListener('click', () => { listing.role = btn.dataset.role; saveListing(); renderApp(); });
  });

  root.querySelectorAll('[data-contact]').forEach(input => {
    input.addEventListener('input', () => { listing.contact[input.dataset.contact] = input.value; saveListing(); });
  });

  root.querySelectorAll('[data-llc]').forEach(input => {
    input.addEventListener('input', () => { rd.llc[input.dataset.llc] = input.value; saveListing(); });
    input.addEventListener('change', () => { rd.llc[input.dataset.llc] = input.value; saveListing(); });
  });

  const trustInput = root.querySelector('#f-trustName');
  if (trustInput) trustInput.addEventListener('input', () => { rd.trustName = trustInput.value; saveListing(); });

  root.querySelectorAll('[data-homeowner]').forEach(card => {
    const idx = Number(card.dataset.homeowner);
    card.querySelectorAll('[data-homeowner-field]').forEach(input => {
      input.addEventListener('input', () => { rd.homeowners[idx][input.dataset.homeownerField] = input.value; saveListing(); });
    });
  });

  root.querySelectorAll('[data-remove-homeowner]').forEach(btn => {
    btn.addEventListener('click', () => {
      rd.homeowners.splice(Number(btn.dataset.removeHomeowner), 1);
      saveListing();
      renderApp();
    });
  });

  const addBtn = root.querySelector('#add-homeowner');
  if (addBtn) addBtn.addEventListener('click', () => { rd.homeowners.push(emptyHomeowner()); saveListing(); renderApp(); });

  root.querySelectorAll('[data-radio]').forEach(group => {
    group.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = group.dataset.radio;
        const val = btn.dataset.val;
        if (name === 'contact-prefMethod') listing.contact.prefMethod = val;
        else if (name === 'llc-primaryContact') rd.llc.primaryContact = val;
        else if (name === 'occupancy') rd.occupancy = val;
        else if (name === 'propertyReadiness') rd.propertyReadiness = val;
        else if (name === 'showingsContact') rd.showingsContact = val;
        else if (name.startsWith('homeowner-')) {
          const idx = Number(name.split('-')[1]);
          rd.homeowners[idx].prefMethod = val;
        }
        saveListing();
        renderApp();
      });
    });
  });

  wireFooter(root, { onBack: () => navigateTo('A1.2'), onContinue: () => navigateTo('A1.4') });
}

registerScreen('A1.3', { type: 'working', render: renderA13 });

/* ---------------- A1.4 — Your home's story ---------------- */

function renderA14(root) {
  const s = listing.story;
  const body = `
    <div class="field">
      <label class="p-lg font-semibold" style="font-size:18px;">If you had 30 seconds with a buyer standing in your driveway, what would you want them to know about this home?</label>
      <textarea id="f-driveway" rows="4">${s.driveway}</textarea>
    </div>
    <div class="reveal ${s.driveway ? 'open' : ''}">
      <div class="field">
        <label>What will you miss most about living here?</label>
        <textarea id="f-willMiss" rows="2">${s.willMiss}</textarea>
      </div>
      <div class="field" style="margin-top: var(--space-md)">
        <label>Why did you buy this home?</label>
        <textarea id="f-whyBought" rows="2">${s.whyBought}</textarea>
      </div>
    </div>
  `;

  root.innerHTML = workingScreenMarkup({
    eyebrow: 'Step 4 of 11 - Your home’s story',
    title: 'Tell us about this home',
    bodyHtml: body
  }) + footerBarMarkup('Back', 'Continue', false);

  const driveway = root.querySelector('#f-driveway');
  driveway.addEventListener('input', () => {
    const wasEmpty = !s.driveway;
    s.driveway = driveway.value;
    saveListing();
    if (wasEmpty !== !s.driveway) renderApp();
    else refreshLivingCardRail();
  });
  root.querySelector('#f-willMiss').addEventListener('input', e => { s.willMiss = e.target.value; saveListing(); });
  root.querySelector('#f-whyBought').addEventListener('input', e => { s.whyBought = e.target.value; saveListing(); });

  wireFooter(root, { onBack: () => navigateTo('A1.3'), onContinue: () => navigateTo('A1.5') });
}

registerScreen('A1.4', { type: 'working', render: renderA14 });

/* ---------------- A1.5 — Structure & features ---------------- */
/* Field names below are drawn from the production "Home & property details"
   step (Figma node 6647:109141), a curated subset of its ~45-50 fields —
   see the build notes for why the full list isn't reproduced here. */

const HOME_STYLES = ['A-Frame', 'Barndominium', 'Cape Cod', 'Colonial', 'Contemporary', 'Cottage', 'Log', 'Ranch', 'Traditional', 'Victorian', 'Other'];
const CONSTRUCTION_TYPES = ['All Brick', 'Vinyl Siding', 'Wood Siding', 'Stone', 'Stucco', 'Frame', 'Other'];
const FLOORING_TYPES = ['Carpet', 'Tile', 'Finished Wood', 'Laminate', 'Vinyl', 'Other'];
const FEATURES_TOTAL = 40;

function checkboxGridMarkup(fieldKey, options, selectedSet) {
  return `
    <div class="checkbox-grid" data-checkbox-group="${fieldKey}">
      ${options.map(opt => `
        <label class="checkbox-row">
          <input type="checkbox" value="${opt}" ${selectedSet.has(opt) ? 'checked' : ''} />
          ${opt}
        </label>`).join('')}
    </div>`;
}

function notSureChip(fieldKey, isNotSure) {
  return `<button class="not-sure-inline ${isNotSure ? 'active' : ''}" data-not-sure="${fieldKey}">${icon('circle-help', 12)} I'm not sure</button>`;
}

function renderA15(root) {
  const f = listing.features;
  const answeredCount = Object.keys(f).filter(k => f[k] && (Array.isArray(f[k]) ? f[k].length : true)).length;

  const styleSet = new Set(f.homeStyle || []);
  const constructionSet = new Set(f.construction || []);
  const flooringSet = new Set(f.flooring || []);
  const poolValue = f.pool || null;

  const body = `
    <div class="field">
      <label>Describe the style of your home</label>
      ${checkboxGridMarkup('homeStyle', HOME_STYLES, styleSet)}
    </div>

    <div class="field-grid dense">
      ${stepperMarkup('stories', 'Number of stories', f.stories || 1)}
      <div class="field">
        <label>Finished attic</label>
        <div class="segmented" id="attic-segmented">
          ${['Full', 'Partial', 'No'].map(v => `<button data-val="${v}" class="${f.finishedAttic === v ? 'active' : ''}">${v}</button>`).join('')}
        </div>
      </div>
    </div>

    <div class="field">
      <label>Construction type ${notSureChip('construction', f.construction === 'not-sure')}</label>
      ${checkboxGridMarkup('construction', CONSTRUCTION_TYPES, constructionSet)}
    </div>

    <div class="field-grid dense">
      <div class="field">
        <label>Basement? ${notSureChip('basement', f.basement === 'not-sure')}</label>
        <div class="segmented" id="basement-segmented">
          ${['Yes', 'No'].map(v => `<button data-val="${v}" class="${f.basement === v ? 'active' : ''}">${v}</button>`).join('')}
        </div>
      </div>
      <div class="field">
        <label>Fireplace? ${notSureChip('fireplace', f.fireplace === 'not-sure')}</label>
        <div class="segmented" id="fireplace-segmented">
          ${['Yes', 'No', 'Non-functional'].map(v => `<button data-val="${v}" class="${f.fireplace === v ? 'active' : ''}">${v}</button>`).join('')}
        </div>
      </div>
    </div>

    <div class="field">
      <label>Swimming pool or hot tub?</label>
      <div class="segmented" id="pool-segmented">
        ${['No', 'Pool', 'Hot Tub', 'Pool and Hot Tub'].map(v => `<button data-val="${v}" class="${poolValue === v ? 'active' : ''}">${v}</button>`).join('')}
      </div>
    </div>
    <div class="reveal ${poolValue && poolValue !== 'No' ? 'open' : ''}">
      <div class="field-grid dense">
        <div class="field"><label>Pool/spa type</label><select id="f-poolType"><option>In-ground</option><option>Above-ground</option></select></div>
        <div class="field"><label>Heated?</label>
          <div class="segmented" id="heated-segmented">${['Yes', 'No'].map(v => `<button data-val="${v}" class="${f.poolHeated === v ? 'active' : ''}">${v}</button>`).join('')}</div>
        </div>
        <div class="field"><label>Fenced?</label>
          <div class="segmented" id="fenced-segmented">${['Yes', 'No'].map(v => `<button data-val="${v}" class="${f.poolFenced === v ? 'active' : ''}">${v}</button>`).join('')}</div>
        </div>
      </div>
    </div>

    <div class="field">
      <label>Flooring types (Optional) ${notSureChip('flooring', f.flooring === 'not-sure')}</label>
      ${checkboxGridMarkup('flooring', FLOORING_TYPES, flooringSet)}
    </div>
  `;

  root.innerHTML = workingScreenMarkup({
    eyebrow: 'Step 4 of 11 - Structure & features',
    title: 'Structure & features',
    bodyHtml: `<div class="field-counter" style="margin-bottom:var(--space-md)"><span class="count-big">${answeredCount}</span><span class="count-label">of ${FEATURES_TOTAL} fields</span></div>${body}`
  }) + footerBarMarkup('Back', 'Continue', false);

  root.querySelectorAll('[data-checkbox-group]').forEach(group => {
    group.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const key = group.dataset.checkboxGroup;
        const list = new Set(f[key] || []);
        if (cb.checked) list.add(cb.value); else list.delete(cb.value);
        f[key] = Array.from(list);
        saveListing();
        renderApp();
      });
    });
  });

  root.querySelectorAll('[data-not-sure]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.notSure;
      f[key] = f[key] === 'not-sure' ? [] : 'not-sure';
      saveListing();
      renderApp();
    });
  });

  const segMap = {
    'attic-segmented': 'finishedAttic', 'basement-segmented': 'basement',
    'fireplace-segmented': 'fireplace', 'pool-segmented': 'pool',
    'heated-segmented': 'poolHeated', 'fenced-segmented': 'poolFenced'
  };
  Object.entries(segMap).forEach(([id, key]) => {
    const el = root.querySelector(`#${id}`);
    if (!el) return;
    el.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => { f[key] = btn.dataset.val; saveListing(); renderApp(); }));
  });

  wireSteppers(root, null, (key, delta) => { f[key] = Math.max(1, (f[key] || 1) + delta); });

  wireFooter(root, { onBack: () => navigateTo('A1.4'), onContinue: () => navigateTo('A1.6') });
}

registerScreen('A1.5', { type: 'working', render: renderA15 });

/* ---------------- A1.6 — Schools & utilities ---------------- */

const UTILITIES = ['electric', 'gas', 'water', 'sewer', 'trash'];
const UTILITY_LABELS = { electric: 'Electric', gas: 'Gas', water: 'Water', sewer: 'Sewer', trash: 'Trash' };

function renderA16(root) {
  const u = listing.utilities;

  const utilityRow = (key) => {
    const val = u[key] || {};
    const notSure = val === 'not-sure';
    return `
      <div class="field-grid dense" style="align-items:end; margin-bottom: var(--space-md);" data-utility="${key}">
        <div class="field">
          <label>${UTILITY_LABELS[key]} — company name</label>
          <input type="text" data-u-field="company" value="${notSure ? '' : (val.company || '')}" ${notSure ? 'disabled' : ''} />
        </div>
        <div class="field">
          <label>Avg. monthly cost</label>
          <div style="display:flex; gap:8px; align-items:center;">
            <input type="number" data-u-field="cost" value="${notSure ? '' : (val.cost || '')}" ${notSure ? 'disabled' : ''} style="flex:1" />
            ${notSureChip('u-' + key, notSure)}
          </div>
        </div>
      </div>`;
  };

  const body = `
    <div class="field">
      <label>Elementary School</label>
      <input type="text" id="f-elementary" value="${listing.utilities.elementary || ''}" />
    </div>
    <div class="field">
      <label>Middle School</label>
      <input type="text" id="f-middle" value="${listing.utilities.middle || ''}" />
    </div>
    <div class="field">
      <label>High School</label>
      <input type="text" id="f-high" value="${listing.utilities.high || ''}" />
    </div>
    <div class="field-reaction helper">${icon('circle-help')} Need help finding your zoned schools? <a href="#" class="btn-link" style="margin-left:4px">Click here.</a></div>

    <div class="field">
      <label>Utility companies &amp; average monthly costs</label>
      ${UTILITIES.map(utilityRow).join('')}
    </div>
  `;

  root.innerHTML = workingScreenMarkup({
    eyebrow: 'Step 5 of 11 - Schools & utilities',
    title: 'Schools & utilities',
    whyLine: "Nobody remembers every bill — mark what you're not sure of.",
    bodyHtml: body
  }) + footerBarMarkup('Back', 'Continue', false);

  ['elementary', 'middle', 'high'].forEach(k => {
    root.querySelector(`#f-${k}`).addEventListener('input', e => { u[k] = e.target.value; saveListing(); });
  });

  root.querySelectorAll('[data-utility]').forEach(row => {
    const key = row.dataset.utility;
    row.querySelectorAll('[data-u-field]').forEach(input => {
      input.addEventListener('input', () => {
        if (typeof u[key] !== 'object' || u[key] === 'not-sure') u[key] = {};
        u[key][input.dataset.uField] = input.value;
        saveListing();
      });
    });
  });

  root.querySelectorAll('[data-not-sure]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.notSure.replace('u-', '');
      u[key] = u[key] === 'not-sure' ? {} : 'not-sure';
      saveListing();
      renderApp();
    });
  });

  wireFooter(root, {
    onBack: () => navigateTo('A1.5'),
    onContinue: () => {
      if (!listing.progress.completedActs.includes(1)) {
        listing.progress.completedActs.push(1);
        saveListing();
      }
      navigateTo('A1.7');
    }
  });
}

registerScreen('A1.6', { type: 'working', render: renderA16 });

/* ---------------- A1.7 — Milestone ---------------- */

registerScreen('A1.7', {
  type: 'fullbleed',
  render(root) {
    root.innerHTML = `
      <div class="screen-fullbleed">
        <div class="fullbleed-inner">
          <p class="act-cover-number">Act 1 complete</p>
          <div class="milestone-card" style="max-width:320px; margin: 0 auto var(--space-xl);">${renderLivingCard({ band: false })}</div>
          <p class="p-reg act-cover-line">You've covered the basics — next, we'll walk through what buyers legally need to know.</p>
          <button class="btn btn-primary" id="milestone-continue">Continue to Act 2</button>
        </div>
      </div>`;
    root.querySelector('#milestone-continue').addEventListener('click', () => navigateTo('A2.0'));
  }
});
