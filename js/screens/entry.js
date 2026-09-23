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

function renderE1(root) {
  root.innerHTML = `
    ${dashboardMarkup()}
    <div class="modal-scrim">
      <div class="modal-card">
        <button class="modal-close" id="e1-close" aria-label="Close">${icon('x')}</button>
        <p class="h4" style="margin-bottom: var(--space-xs)">What kind of property is this?</p>
        <p class="p-sm text-muted" style="margin-bottom: var(--space-xl)">We'll tailor the next few questions to your property type.</p>
        <div class="choice-grid">
          ${PROPERTY_TYPES.map(t => `
            <button class="choice-card ${t.id === 'other' && listing.propertyType === 'other' ? 'selected' : ''}" data-type="${t.id}">
              ${icon(t.iconName, 36)}
              <span class="choice-label">${t.label}</span>
            </button>`).join('')}
        </div>
        <div class="reveal ${listing.propertyType === 'other' ? 'open' : ''}" id="e1-other-reveal">
          <div class="field">
            <label for="e1-other-input">Tell us what kind of property it is</label>
            <input type="text" id="e1-other-input" value="${listing.propertyTypeOther || ''}" placeholder="e.g. mobile home, mixed-use building" />
          </div>
        </div>
        ${listing.propertyType === 'other' ? `
          <div style="display:flex; justify-content:flex-end; margin-top: var(--space-xl)">
            <button class="btn btn-primary" id="e1-continue" ${!(listing.propertyTypeOther || '').trim() ? 'disabled' : ''}>Continue</button>
          </div>` : ''}
      </div>
    </div>
  `;

  /* PO feedback: picking a type moves on straight away; only "Other"
     stays here to ask for the type, with Continue beside the input.
     Tiles always start blank (only an open "Other" stays marked). */
  root.querySelectorAll('.choice-card').forEach(card => {
    card.addEventListener('click', () => {
      listing.propertyType = card.dataset.type;
      saveListing();
      if (card.dataset.type === 'other') {
        renderApp();
        const input = document.getElementById('e1-other-input');
        if (input) input.focus();
      } else {
        navigateTo('E2');
      }
    });
  });

  const otherInput = root.querySelector('#e1-other-input');
  if (otherInput) {
    otherInput.addEventListener('input', () => {
      listing.propertyTypeOther = otherInput.value;
      saveListing();
      const btn = root.querySelector('#e1-continue');
      if (btn) btn.disabled = !otherInput.value.trim();
    });
  }

  root.querySelector('#e1-close').addEventListener('click', () => navigateTo('dashboard'));
  const startBtn = root.querySelector('#dashboard-start-btn');
  if (startBtn) startBtn.addEventListener('click', () => navigateTo('E1'));

  const continueBtn = root.querySelector('#e1-continue');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      if (!(listing.propertyTypeOther || '').trim()) return;
      saveListing();
      navigateTo('E2');
    });
  }
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
