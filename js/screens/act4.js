/* Act 4 — Price it and publish (steps 10-11). Section 7 of the spec.
   A4.1 ports the real canonical shell (Figma node 6531:96830) directly,
   including its sample figures — the spec explicitly exempts this one
   screen from the "no invented numbers" rule ("port 6531:96830 directly"). */

registerScreen('A4.0', {
  type: 'fullbleed',
  render(root) {
    root.innerHTML = actCoverMarkup({
      actNum: 4,
      iconName: 'calculator',
      title: ACT_NAMES[4],
      line: ACT_PROMISES[4],
      chips: ['Valuation', 'Review', 'Publish']
    });
    root.querySelector('#cover-continue').addEventListener('click', () => navigateTo('A4.1'));
  }
});

/* ---------------- A4.1 — Review & valuation ---------------- */
/* Rebuilt pixel-accurate from the real screen (node 6531:97549, the redesign
   the user pointed to directly): three-tier valuation row with a highlighted
   "Suggested" tier, a gradient AI-estimate disclaimer banner, a row of real
   Listing Card comparables, then an Adjust_Price_Card bundling the price
   field, a closing-costs breakdown box, and a large-numeral savings callout. */

const COMPARABLES = [
  { price: '$958,000', beds: 3, baths: 2, sqft: '2,410' },
  { price: '$972,500', beds: 4, baths: 2, sqft: '2,510' },
  { price: '$945,000', beds: 3, baths: 2, sqft: '2,380' },
  { price: '$981,200', beds: 3, baths: 3, sqft: '2,600' }
];

function comparableCardMarkup(c) {
  return listingCardMarkup({
    placeholder: icon('house', 28),
    title: c.price,
    address: 'Comparable sale nearby',
    beds: c.beds,
    baths: c.baths,
    sqft: c.sqft
  });
}

function renderA41(root) {
  if (!listing.price) listing.price = 960000;

  const netEstimate = () => Math.max(0, Number(listing.price) - 1395 - (listing.financial.mortgageBalance || 0));

  const body = `
    <div class="card" style="display:flex; flex-direction:column; gap:var(--space-md);">
      <span class="badge badge-secondary">DIY suggested valuation</span>
      <div class="valuation-tiers">
        <div class="valuation-tier">
          <span class="badge badge-neutral">Conservative</span>
          <p class="tier-value">$944k</p>
        </div>
        <div class="valuation-tier suggested">
          <span class="badge badge-primary">Suggested</span>
          <p class="tier-value">$960k</p>
        </div>
        <div class="valuation-tier">
          <span class="badge badge-neutral">Optimal</span>
          <p class="tier-value">$977k</p>
        </div>
      </div>
      <p class="p-sm text-muted">Based on 2 comparable sales within 2 miles, closed in the last 6 months, refined with your home photos.</p>
      <div class="savings-alert-banner">
        ${icon('sparkles')}
        <span>AI-powered estimate for informational purposes only — not a professional appraisal.</span>
      </div>
    </div>

    <div class="field">
      <label>Comparable Properties</label>
      <div class="comparable-carousel">
        <div class="comparable-row" id="comparable-row" tabindex="0" aria-label="Comparable properties">
          ${COMPARABLES.map(comparableCardMarkup).join('')}
        </div>
        ${iconButtonMarkup('arrow-left', 'Previous comparables', 'data-comp-go="-1"')}
        ${iconButtonMarkup('arrow-right', 'More comparables', 'data-comp-go="1"')}
      </div>
      <div class="comparable-dots" id="comparable-dots"></div>
    </div>

    <div class="card" style="display:flex; flex-direction:column; gap:var(--space-xl);">
      <p class="h4">Adjust your target price</p>
      <div class="field">
        <label>Target listing price</label>
        <div class="field-icon-input">
          ${icon('dollar-sign')}
          <input type="number" id="price-input" value="${listing.price}" step="1000" />
        </div>
      </div>

      <div class="closing-costs-box">
        <p class="p-reg font-bold">Seller closing costs</p>
        <div class="yn-row">
          <span class="p-sm">DIY Residential tech charge <span class="badge badge-subtle" style="margin-left:6px">Only pay at closing</span></span>
          <span class="p-reg font-bold">-$1,395</span>
        </div>
        <div class="yn-row">
          <span class="p-sm font-semibold text-muted">Your estimated net</span>
          <span class="h2" id="net-estimate">$${netEstimate().toLocaleString()}</span>
        </div>
      </div>

      <div class="savings-emotional-box">
        <div style="display:flex; align-items:flex-start; justify-content:space-between;">
          <span class="badge badge-primary">You are saving</span>
          <span class="icon-button-outline" title="Compared to a traditional 6% listing commission">${icon('circle-help', 18)}</span>
        </div>
        <div>
          <p class="savings-figure">$58,120</p>
          <p class="p-sm text-muted" style="margin-top:var(--space-xs)">That's how much you are saving with DIY Residential, between our tech charge and a traditional 6% listing commission.</p>
        </div>
      </div>
    </div>
  `;

  root.innerHTML = workingScreenMarkup({
    eyebrow: 'Step 10 of 11 - Review & valuation',
    title: 'Your suggested valuation',
    description: 'Review your pricing, comparable sales, and compliance before proceeding to payment.',
    bodyHtml: body
  }) + footerBarMarkup('Back', 'Save and Continue', false);

  /* Arrows sit over the images and page the row one card at a time; each
     disables at its end. Dots show the position and jump to a card. */
  const row = root.querySelector('#comparable-row');
  const arrows = root.querySelectorAll('[data-comp-go]');
  const dots = root.querySelector('#comparable-dots');
  const step = () => {
    const card = row.querySelector('.listing-card');
    return card ? card.offsetWidth + 16 : row.clientWidth;
  };
  const pageCount = () => Math.max(1, Math.round((row.scrollWidth - row.clientWidth) / step()) + 1);
  const syncCarousel = () => {
    const max = row.scrollWidth - row.clientWidth;
    arrows[0].disabled = row.scrollLeft <= 2;
    arrows[1].disabled = row.scrollLeft >= max - 2;
    const n = pageCount();
    if (dots.children.length !== n) {
      dots.innerHTML = Array.from({ length: n }, (_, i) => `<button type="button" aria-label="Go to comparable ${i + 1}" data-comp-dot="${i}"></button>`).join('');
      dots.hidden = n < 2;
    }
    const current = row.scrollLeft >= max - 2 ? n - 1 : Math.round(row.scrollLeft / step());
    Array.from(dots.children).forEach((d, i) => d.classList.toggle('active', i === current));
  };
  arrows.forEach(btn => btn.addEventListener('click', () => {
    row.scrollBy({ left: Number(btn.dataset.compGo) * step(), behavior: 'smooth' });
  }));
  dots.addEventListener('click', e => {
    const dot = e.target.closest('[data-comp-dot]');
    if (dot) row.scrollTo({ left: Number(dot.dataset.compDot) * step(), behavior: 'smooth' });
  });
  row.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      row.scrollBy({ left: (e.key === 'ArrowRight' ? 1 : -1) * step(), behavior: 'smooth' });
    }
  });
  row.addEventListener('scroll', syncCarousel, { passive: true });
  new ResizeObserver(syncCarousel).observe(row);
  requestAnimationFrame(syncCarousel);

  root.querySelector('#price-input').addEventListener('input', e => {
    listing.price = Number(e.target.value) || 0;
    saveListing();
    root.querySelector('#net-estimate').textContent = `$${netEstimate().toLocaleString()}`;
    refreshLivingCardRail();
  });

  wireFooter(root, { onBack: () => navigateTo('A4.0'), onContinue: () => navigateTo('A4.2') });
}

registerScreen('A4.1', { type: 'working', render: renderA41 });

/* ---------------- A4.2 — Ownership evidence & signing ---------------- */

let docusignModalOpen = false;

function renderA42(root) {
  const s = listing.signing;
  const body = `
    <div class="field">
      <label>Proof of ownership</label>
      <div class="field-reaction helper">${icon('circle-help')} Our brokerage team reviews this within 2–4 business hours.</div>
      <div class="card" style="border-style:dashed; text-align:center;">
        ${s.ownershipFile ? `<p class="p-sm font-semibold">${icon('check', 16)} ${s.ownershipFile}</p>` : `
          <p>${icon('upload', 24)}</p>
          <p class="p-sm">Upload a deed, tax bill, or title document</p>
          <p class="p-mini text-muted">PDF, JPG or PNG, up to 10MB</p>
        `}
        <label class="btn btn-sm btn-outline" style="cursor:pointer; margin-top:8px;">
          ${s.ownershipFile ? 'Replace' : 'Upload'}
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" id="ownership-input" style="display:none" />
        </label>
      </div>
    </div>

    <div class="field-reaction helper">
      ${icon('circle-help')} This step has never been unlocked on a live test listing — treat the signing hand-off below as a best-effort reconstruction.
    </div>

    <button class="btn btn-primary" id="open-docusign" style="align-self:flex-start">Continue to signing</button>
  `;

  root.innerHTML = workingScreenMarkup({
    eyebrow: 'Step 11 of 11 - Ownership & signing',
    title: 'Ownership evidence & signing',
    bodyHtml: body
  }) + footerBarMarkup('Back', 'Publish listing', false) + `
    <div class="modal-scrim" id="docusign-scrim" ${docusignModalOpen ? '' : 'hidden'}>
      <div class="modal-card">
        <button class="modal-close" id="docusign-close">${icon('x')}</button>
        <p class="h4" style="margin-bottom:var(--space-md)">You're about to leave DIY Residential</p>
        <p class="p-reg text-muted" style="margin-bottom:var(--space-md)">Signing happens through DocuSign, a separate secure site. Come back here afterward — your progress is saved.</p>
        <div class="field-reaction helper">${icon('circle-help')} Return state: you'll land back on this screen. Processing state: a banner shows while DocuSign confirms. Stalled state: we'll show a "check your email" note if it takes longer than expected.</div>
        <button class="btn btn-primary" id="docusign-confirm" style="margin-top:var(--space-lg)">Open DocuSign</button>
      </div>
    </div>
  `;

  root.querySelector('#ownership-input').addEventListener('change', e => {
    if (e.target.files[0]) { s.ownershipFile = e.target.files[0].name; saveListing(); renderApp(); }
  });

  root.querySelector('#open-docusign').addEventListener('click', () => {
    docusignModalOpen = true;
    root.querySelector('#docusign-scrim').hidden = false;
  });
  root.querySelector('#docusign-close').addEventListener('click', () => {
    docusignModalOpen = false;
    root.querySelector('#docusign-scrim').hidden = true;
  });
  root.querySelector('#docusign-confirm').addEventListener('click', () => {
    s.signed = true;
    docusignModalOpen = false;
    if (!listing.progress.completedActs.includes(4)) { listing.progress.completedActs.push(4); }
    saveListing();
    navigateTo('A4.3');
  });

  wireFooter(root, {
    onBack: () => navigateTo('A4.1'),
    onContinue: () => { docusignModalOpen = true; renderApp(); }
  });
}

registerScreen('A4.2', { type: 'working', render: renderA42 });

/* ---------------- A4.3 — Published ---------------- */

registerScreen('A4.3', {
  type: 'fullbleed',
  render(root) {
    root.innerHTML = milestoneMarkup({
      title: 'You did it. Now we take it from here.',
      description: "Your listing is under review. We'll notify you as soon as it's live — usually within 2–4 hours.",
      action: 'View your listing',
      id: 'view-preview'
    });
    root.querySelector('#view-preview').addEventListener('click', () => navigateTo('preview'));
  }
});
