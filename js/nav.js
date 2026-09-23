/* Act-scoped navigation, presented as a slide-over panel triggered from the
   nav bar (Airbnb-style full-bleed focus, per direction from the design lead —
   the persistent 280px sidebar in the Figma shell is replaced by this overlay
   at every breakpoint, not just <1024). Content is unchanged from spec section 5. */

const ACT_PROMISES = {
  1: "We'll start with the basics. Most of this we can fill in for you.",
  2: "This part is required by Tennessee law. You don't have to know everything.",
  3: "Photos are what buyers look at first. We'll walk you through it.",
  4: 'Not sure what to charge? No need to worry — we\'ll do the numbers'
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

function renderActGroup(actNum) {
  const done = isActComplete(actNum);
  const current = currentAct() === actNum && !done;
  const upcoming = !done && !current;
  const expanded = navOverlayExpanded.has(actNum);

  if (upcoming) {
    return `
      <div class="nav-act-group">
        <div class="nav-act-header upcoming">${ACT_NAMES[actNum]}</div>
        <div class="nav-act-promise">${ACT_PROMISES[actNum]}</div>
      </div>`;
  }

  const steps = ACT_STEPS[actNum].map(s => {
    const status = stepStatus(actNum, s.id);
    const clickable = status !== 'todo' || done;
    const skipped = status === 'done' && s.id === 'A2.1' && Object.keys(listing.contracts).length === 0;
    return `
      <div class="nav-step-row ${status}" data-clickable="${clickable}" ${clickable ? `data-step="${s.id}"` : ''}>
        ${stepIconMarkup(status)}
        <span>${s.label}${skipped ? ' <span class="text-muted" style="font-weight:400">(skipped)</span>' : ''}</span>
      </div>`;
  }).join('');

  return `
    <div class="nav-act-group">
      <div class="nav-act-header ${done ? 'done' : 'current'}" data-act-toggle="${actNum}">
        <span>${done ? icon('check') + ' ' : ''}${ACT_NAMES[actNum]}</span>
        ${icon(expanded ? 'chevron-down' : 'chevron-right')}
      </div>
      <div class="nav-step-list" ${expanded ? '' : 'hidden'}>${steps}</div>
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
      <a href="#/dashboard" class="nav-footer-link">Save &amp; Exit</a>
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
}
