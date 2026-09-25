/* Act-scoped navigation, presented as a slide-over panel triggered from the
   nav bar (Airbnb-style full-bleed focus, per direction from the design lead —
   the persistent 280px sidebar in the Figma shell is replaced by this overlay
   at every breakpoint, not just <1024). Content is unchanged from spec section 5. */

const ACT_PROMISES = {
  1: "We'll start with the basics. Most of this we can fill in for you.",
  2: 'Not sure what matters? We’ll guide you through disclosures, services, and closing details.',
  3: 'Not sure what to feature? We’ll help your home look clear and inviting.',
  4: 'Not sure where to start? We’ll help you price, review, and publish confidently.'
};

let navOverlayExpanded = new Set();

function openNavOverlay() {
  navOverlayExpanded = new Set([currentAct()]);
  document.getElementById('nav-overlay-scrim').classList.add('open');
  document.getElementById('nav-overlay-panel').classList.add('open');
  renderNavOverlayContent();
}

function closeNavOverlay() {
  document.getElementById('nav-overlay-scrim').classList.remove('open');
  document.getElementById('nav-overlay-panel').classList.remove('open');
}

function toggleActGroup(actNum) {
  if (navOverlayExpanded.has(actNum)) navOverlayExpanded.delete(actNum);
  else navOverlayExpanded.add(actNum);
  renderNavOverlayContent();
}

function stepIconMarkup(status) {
  if (status === 'done') return `<span class="nav-step-icon">${icon('check')}</span>`;
  if (status === 'active') return `<span class="nav-step-icon"><span class="dot dot-filled"></span></span>`;
  return `<span class="nav-step-icon"><span class="dot dot-hollow"></span></span>`;
}

/* Act rows follow the Navigation List (Figma node 6739:116629): three
   states — done (green, check, chevron-right), current (secondary, number
   badge) and upcoming (muted, number badge) — with the act's promise under
   every row (below its steps when expanded), whatever its state. Any row expands to show its steps. */
function actStateOf(actNum) {
  if (isActComplete(actNum)) return 'done';
  return currentAct() === actNum ? 'current' : 'upcoming';
}

function renderActGroup(actNum) {
  const state = actStateOf(actNum);
  const expanded = navOverlayExpanded.has(actNum);
  const lead = state === 'done'
    ? '<span class="nav-act-check" aria-hidden="true"></span>'
    : `<span class="nav-act-number" aria-hidden="true">${actNum}</span>`;
  const chevron = expanded || state !== 'done' ? 'chevron-down-li' : 'chevron-right-li';
  const chevronSize = chevron === 'chevron-down-li' ? 'width="9.251" height="5.251"' : 'width="5.251" height="9.251"';

  const steps = ACT_STEPS[actNum].map(s => {
    const status = stepStatus(actNum, s.id);
    const clickable = state === 'done' || status !== 'todo';
    const skipped = status === 'done' && s.id === 'A2.1' && Object.keys(listing.contracts).length === 0;
    return `
      <div class="nav-step-row ${status}" data-clickable="${clickable}" ${clickable ? `data-step="${s.id}"` : ''}>
        ${stepIconMarkup(status)}
        <span>${s.label}${skipped ? ' <span class="text-muted" style="font-weight:400">(skipped)</span>' : ''}</span>
      </div>`;
  }).join('');

  return `
    <div class="nav-act-group">
      <button type="button" class="nav-act-item ${state}" data-act-toggle="${actNum}" aria-expanded="${expanded}">
        <span class="nav-act-lead">${lead}</span>
        <span class="nav-act-name">${ACT_NAMES[actNum]}</span>
        <img class="nav-act-chevron" src="assets/icons/${chevron}.svg" ${chevronSize} alt="" />
      </button>
      <div class="nav-step-list" ${expanded ? '' : 'hidden'}>${steps}</div>
      <p class="nav-act-promise">${ACT_PROMISES[actNum]}</p>
    </div>`;
}

function renderNavOverlayContent() {
  const el = document.getElementById('nav-overlay-content');
  const segments = actSegments();
  el.innerHTML = `
    <div class="nav-overlay-eyebrow">YOUR LISTING</div>
    <div class="act-progress" style="padding: var(--space-xs) 0 var(--space-md) var(--space-xs)">
      <div class="act-label">Act ${currentAct()} of 4</div>
      <div class="act-segments">
        ${segments.map(f => `<div class="act-segment ${f ? 'filled' : ''}"></div>`).join('')}
      </div>
    </div>
    ${[1, 2, 3, 4].map(renderActGroup).join('')}
    <div class="nav-overlay-footer">
      <a href="#/preview" class="nav-footer-link">Preview</a>
    </div>
  `;
  refreshIcons();

  el.querySelectorAll('[data-act-toggle]').forEach(node => {
    node.addEventListener('click', () => toggleActGroup(Number(node.dataset.actToggle)));
  });
  el.querySelectorAll('[data-step]').forEach(node => {
    node.addEventListener('click', () => {
      closeNavOverlay();
      navigateTo(node.dataset.step);
    });
  });
}

function initNavOverlay() {
  document.getElementById('nav-overlay-scrim').addEventListener('click', closeNavOverlay);
  document.getElementById('nav-overlay-close').addEventListener('click', closeNavOverlay);
  document.getElementById('steps-trigger').addEventListener('click', openNavOverlay);
  document.getElementById('save-exit').addEventListener('click', openSaveExitModal);
}

/* Save & Exit asks first: progress is kept, but the home isn't listed
   until every step is finished and the listing is signed. */
function openSaveExitModal() {
  if (document.getElementById('save-exit-scrim')) return;
  const remaining = [1, 2, 3, 4].filter(n => !isActComplete(n)).length;
  const el = document.createElement('div');
  el.className = 'modal-scrim';
  el.id = 'save-exit-scrim';
  el.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="save-exit-title">
      <button class="modal-close" id="save-exit-close" aria-label="Close">${icon('x')}</button>
      <p class="h4" id="save-exit-title" style="margin-bottom:var(--space-md)">Leave your listing for now?</p>
      <p class="p-reg text-muted">Your progress is saved and you can pick up right where you left off.</p>
      <div class="note-callout" style="margin-top:var(--space-md)">Your listing isn't finished yet${remaining ? ` (${remaining} of 4 acts still to complete)` : ''}, so your property won't be listed until you complete every step and sign.</div>
      <div class="modal-actions">
        <button class="btn btn-outline" id="save-exit-stay">Keep going</button>
        <button class="btn btn-primary" id="save-exit-confirm">Save &amp; Exit</button>
      </div>
    </div>`;
  document.body.appendChild(el);
  refreshIcons();
  const close = () => { el.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  el.addEventListener('click', e => { if (e.target === el) close(); });
  el.querySelector('#save-exit-close').addEventListener('click', close);
  el.querySelector('#save-exit-stay').addEventListener('click', close);
  el.querySelector('#save-exit-confirm').addEventListener('click', () => { saveListing(); close(); navigateTo('dashboard'); });
  el.querySelector('#save-exit-stay').focus();
}
