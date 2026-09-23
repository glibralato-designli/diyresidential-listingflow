/* E1 — Property type modal (over the dashboard)
   E2 — How this works (four-act overview)
   Section 7 "Entry" + section 4 full-bleed chrome rules. */

const PROPERTY_TYPES = [
  { id: 'single-family', label: 'Single-family home', iconName: 'house' },
  { id: 'condo', label: 'Condo', iconName: 'building-2' },
  { id: 'townhouse', label: 'Townhouse', iconName: 'building' },
  { id: 'multi-family', label: 'Multi-family', iconName: 'hotel' },
  { id: 'land', label: 'Land / Lot', iconName: 'land-plot' },
  { id: 'other', label: 'Other', iconName: 'ellipsis' }
];

function dashboardMarkup() {
  return `
    <div class="screen-fullbleed">
      <div class="fullbleed-inner">
        <p class="h2" style="margin-bottom: var(--space-md)">Your listings</p>
        <div class="dashboard-empty">
          <p class="p-reg" style="margin-bottom: var(--space-lg)">You haven't started a listing yet.</p>
          <button class="btn btn-primary" id="dashboard-start-btn">List your home</button>
        </div>
      </div>
    </div>`;
}

/* E1 — tiles always start blank when the modal opens. Picking one selects
   it in place (no re-render) and enables Continue; "Other" also opens a text
   input, and Continue then waits for that text. */
function renderE1(root) {
  let pick = null;

  root.innerHTML = `
    ${dashboardMarkup()}
    <div class="modal-scrim">
      <div class="modal-card">
        <button class="modal-close" id="e1-close" aria-label="Close">${icon('x')}</button>
        <p class="h4" style="margin-bottom: var(--space-xs)">What kind of property is this?</p>
        <p class="p-sm text-muted" style="margin-bottom: var(--space-xl)">We'll tailor the next few questions to your property type.</p>
        <div class="choice-grid" role="radiogroup" aria-label="Property type">
          ${PROPERTY_TYPES.map(t => `
            <button class="choice-card" role="radio" aria-checked="false" data-type="${t.id}">
              ${icon(t.iconName, 36)}
              <span class="choice-label">${t.label}</span>
            </button>`).join('')}
        </div>
        <div class="reveal" id="e1-other-reveal">
          <div class="field">
            <label for="e1-other-input">Tell us what kind of property it is</label>
            <input type="text" id="e1-other-input" value="${listing.propertyTypeOther || ''}" placeholder="e.g. mobile home, mixed-use building" />
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" id="e1-continue" disabled>Continue</button>
        </div>
      </div>
    </div>
  `;

  const continueBtn = root.querySelector('#e1-continue');
  const otherInput = root.querySelector('#e1-other-input');
  const reveal = root.querySelector('#e1-other-reveal');
  const canContinue = () => pick && (pick !== 'other' || otherInput.value.trim());
  const sync = () => { continueBtn.disabled = !canContinue(); };

  root.querySelectorAll('.choice-card').forEach(card => {
    card.addEventListener('click', () => {
      pick = card.dataset.type;
      root.querySelectorAll('.choice-card').forEach(c => {
        const on = c === card;
        c.classList.toggle('selected', on);
        c.setAttribute('aria-checked', String(on));
      });
      reveal.classList.toggle('open', pick === 'other');
      if (pick === 'other') otherInput.focus();
      sync();
    });
  });

  otherInput.addEventListener('input', sync);
  otherInput.addEventListener('keydown', ev => { if (ev.key === 'Enter' && canContinue()) continueBtn.click(); });

  continueBtn.addEventListener('click', () => {
    if (!canContinue()) return;
    listing.propertyType = pick;
    if (pick === 'other') listing.propertyTypeOther = otherInput.value.trim();
    saveListing();
    navigateTo('E2');
  });

  root.querySelector('#e1-close').addEventListener('click', () => navigateTo('dashboard'));
  const startBtn = root.querySelector('#dashboard-start-btn');
  if (startBtn) startBtn.addEventListener('click', () => navigateTo('E1'));
}

registerScreen('E1', { type: 'modal', render: renderE1 });

registerScreen('dashboard', {
  type: 'fullbleed',
  render(root) {
    root.innerHTML = dashboardMarkup();
    const startBtn = root.querySelector('#dashboard-start-btn');
    if (startBtn) startBtn.addEventListener('click', () => navigateTo('E1'));
  }
});

function renderE2(root) {
  const acts = [1, 2, 3, 4];
  root.innerHTML = `
    <div class="screen-fullbleed has-top-back">
      ${topBackMarkup('e2-back')}
      <div class="fullbleed-inner">
        <p class="p-sm text-muted" style="margin-bottom: var(--space-xs); letter-spacing: 1px; text-transform: uppercase;">How this works</p>
        <p class="h2" style="margin-bottom: var(--space-2xl)">Four parts, at your pace</p>
        <div style="display:flex; flex-direction:column; gap: var(--space-lg); text-align:left; margin-bottom: var(--space-2xl)">
          ${acts.map(n => `
            <div class="card" style="display:flex; gap: var(--space-md); align-items:flex-start;">
              <div class="badge badge-secondary" style="min-width: 64px; justify-content:center;">Act ${n}</div>
              <div>
                <p class="h4" style="margin-bottom: 4px;">${ACT_NAMES[n]}</p>
                <p class="p-sm text-muted">${ACT_PROMISES[n]}</p>
              </div>
            </div>`).join('')}
        </div>
        <button class="btn btn-primary" id="e2-start">Let's start</button>
      </div>
    </div>
  `;
  root.querySelector('#e2-start').addEventListener('click', () => navigateTo('A1.0'));
  root.querySelector('#e2-back').addEventListener('click', () => navigateTo('E1'));
}

registerScreen('E2', { type: 'fullbleed', render: renderE2 });

/* Preview screen lives in js/screens/preview.js */
