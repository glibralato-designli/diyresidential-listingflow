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

/* E2 — How this works. Split overview (Airbnb "It's easy to get started"
   pattern the user pointed to on Mobbin): the promise on the left, the four
   acts as a numbered list with their cover art on the right, and a pinned
   bottom bar with the start button. Back stays top-left (earlier request). */
function renderE2(root) {
  const acts = [1, 2, 3, 4];
  root.innerHTML = `
    <div class="how-it-works">
      <div class="how-intro">
        ${topBackMarkup('e2-back')}
        <p class="how-eyebrow">How this works</p>
        <h1 class="how-title">Four parts, at your pace</h1>
        <p class="how-lead">List your home yourself in four short parts. Your progress saves as you go, so you can stop and come back anytime.</p>
      </div>
      <ol class="how-steps">
        ${acts.map(n => `
          <li class="how-step">
            <div class="how-step-text">
              <span class="how-step-num">${n}</span>
              <p class="how-step-title">${ACT_NAMES[n]}</p>
              <p class="how-step-desc">${ACT_PROMISES[n]}</p>
            </div>
            <img class="how-step-art" src="assets/images/act-${n}-cover.webp" width="1024" height="1024" alt="" loading="lazy" />
          </li>`).join('')}
      </ol>
    </div>
    <div class="footer-bar">
      <div class="footer-bar-inner">
        <span></span>
        <button class="btn btn-primary" id="e2-start">Let's start</button>
      </div>
    </div>
  `;
  root.querySelector('#e2-start').addEventListener('click', () => navigateTo('A1.0'));
  root.querySelector('#e2-back').addEventListener('click', () => navigateTo('E1'));
}

registerScreen('E2', { type: 'fullbleed', render: renderE2 });

/* Preview screen lives in js/screens/preview.js */
