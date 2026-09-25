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
  { price: '$958,000', beds: 3, baths: 2, sqft: '2,410', photo: 'assets/images/comp-1.webp' },
  { price: '$972,500', beds: 4, baths: 2, sqft: '2,510', photo: 'assets/images/comp-2.webp' },
  { price: '$945,000', beds: 3, baths: 2, sqft: '2,380', photo: 'assets/images/comp-3.webp' },
  { price: '$981,200', beds: 3, baths: 3, sqft: '2,600', photo: 'assets/images/comp-4.webp' }
];

/* Valuation tiers (Figma node 6739:135111) */
const VALUATION_TIERS = [
  { label: 'Attractive price', value: 944000 },
  { label: 'Most likely to sell', value: 960000, suggested: true },
  { label: 'Top tier', value: 977000 }
];

/* Listing Card with photo + the 360 action (Figma node 4125:1409) */
function comparableCardMarkup(c, i) {
  const selected = (listing.selectedComparables || []).includes(i);
  return `<div class="comparable-item${selected ? ' selected' : ''}" data-comp-select="${i}" role="button" tabindex="0" aria-pressed="${selected}" aria-label="Comparable ${i + 1}, ${c.price}">
    ${selected ? `<span class="comparable-check">${icon('check', 14)}</span>` : ''}
    ${listingCardMarkup({
    photo: c.photo,
    placeholder: icon('house', 28),
    title: c.price,
    address: 'Comparable sale nearby',
    beds: c.beds,
    baths: c.baths,
    sqft: c.sqft,
    actionsHtml: `<span class="listing-card-action" aria-hidden="true">${icon('rotate-3d', 20)}</span>`
  })}
  </div>`;
}

/* Commission a traditional listing agent would take, less our tech charge,
   shown as a rounded range (5.75%–6.25% of the price) */
function savingsRange(price) {
  const round = n => Math.round(n / 1000) * 1000;
  return [round(price * 0.0575 - 1395), round(price * 0.0625 - 1395)];
}

/* Nothing is selected until the seller picks a tier; typing a different
   price afterwards clears the selection. */
const tierSelected = v => listing.priceTier === v && Number(listing.price) === v;

function renderA41(root) {
  if (!listing.price) listing.price = 960000;

  const savingsText = () => {
    const [lo, hi] = savingsRange(Number(listing.price) || 0);
    return `$${lo.toLocaleString()} - $${hi.toLocaleString()}<sup>*</sup>`;
  };
  const netEstimate = () => Math.max(0, Number(listing.price) - 1395 - (listing.financial.mortgageBalance || 0));

  const body = `
    <div class="card" style="display:flex; flex-direction:column; gap:var(--space-md);">
      <span class="badge badge-secondary">DIY suggested valuation</span>
      <div class="valuation-tiers">
        ${VALUATION_TIERS.map(t => {
          const on = tierSelected(t.value);
          return `
          <button type="button" class="valuation-tier${on ? ' selected' : ''}" data-tier="${t.value}" aria-pressed="${on}">
            <span class="badge ${on ? 'badge-primary' : 'badge-neutral'}">${t.label}</span>
            <span class="tier-value">$${t.value.toLocaleString()}</span>
          </button>`;
        }).join('')}
      </div>
      <p class="p-sm text-muted">Based on 2 comparable sales within 2 miles, closed in the last 6 months, refined with your home photos.</p>
      <div class="savings-alert-banner">
        ${icon('sparkles')}
        <span>AI-powered estimate for informational purposes only — not a professional appraisal.</span>
      </div>
    </div>

    <div class="field">
      <label>Comparable Properties</label>
      <p class="field-hint" style="margin-top:-4px">Drag sideways to see more. Click a property to select it as a comparable.</p>
      <div class="comparable-carousel">
        <div class="comparable-row" id="comparable-row" tabindex="0" aria-label="Comparable properties">
          ${COMPARABLES.map((c, i) => comparableCardMarkup(c, i)).join('')}
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
          <span class="badge badge-primary">Estimated Savings</span>
          ${questionHelpMarkup("*Assumes your buyer isn't represented by an agent. If they are, their commission may reduce your savings. A DIY seller with a DIY buyer pays $0 in commission.")}
        </div>
        <div>
          <p class="savings-figure" id="savings-range">${savingsText()}</p>
          <p class="p-sm text-muted" style="margin-top:var(--space-xs)">That's roughly what you keep by skipping a traditional listing agent's commission.</p>
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
    const card = row.querySelector('.comparable-item');
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
  /* Mouse drag scrolls the row sideways (touch scrolls natively); a click
     without a drag selects or unselects that comparable. */
  let drag = null;
  row.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag = { x: e.clientX, left: row.scrollLeft, moved: false };
  });
  row.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 5) { drag.moved = true; row.classList.add('is-dragging'); row.setPointerCapture(e.pointerId); }
    if (drag.moved) row.scrollLeft = drag.left - dx;
  });
  const endDrag = () => {
    if (!drag) return;
    const moved = drag.moved;
    drag = null;
    if (moved) {
      row.classList.remove('is-dragging');
      row.dataset.justDragged = '1';
      setTimeout(() => { delete row.dataset.justDragged; }, 0);
      const i = Math.round(row.scrollLeft / step());
      row.scrollTo({ left: i * step(), behavior: 'smooth' });
    }
  };
  row.addEventListener('pointerup', endDrag);
  row.addEventListener('pointercancel', endDrag);
  row.addEventListener('dragstart', e => e.preventDefault());

  const toggleComp = i => {
    const set = new Set(listing.selectedComparables || []);
    if (set.has(i)) set.delete(i); else set.add(i);
    listing.selectedComparables = Array.from(set).sort();
    saveListing();
    const item = row.querySelector(`[data-comp-select="${i}"]`);
    const on = set.has(i);
    item.classList.toggle('selected', on);
    item.setAttribute('aria-pressed', on);
    const check = item.querySelector('.comparable-check');
    if (on && !check) { item.insertAdjacentHTML('afterbegin', `<span class="comparable-check">${icon('check', 14)}</span>`); refreshIcons(); }
    if (!on && check) check.remove();
  };
  row.querySelectorAll('[data-comp-select]').forEach(item => {
    item.addEventListener('click', () => { if (!row.dataset.justDragged) toggleComp(Number(item.dataset.compSelect)); });
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleComp(Number(item.dataset.compSelect)); } });
  });

  row.addEventListener('scroll', syncCarousel, { passive: true });
  new ResizeObserver(syncCarousel).observe(row);
  requestAnimationFrame(syncCarousel);

  /* Picking a tier sets the target price below; typing a price selects the
     tier it matches (or none, for a custom price). */
  const priceInput = root.querySelector('#price-input');
  const syncPrice = () => {
    root.querySelector('#net-estimate').textContent = `$${netEstimate().toLocaleString()}`;
    root.querySelector('#savings-range').innerHTML = savingsText();
    root.querySelectorAll('[data-tier]').forEach(btn => {
      const on = tierSelected(Number(btn.dataset.tier));
      btn.classList.toggle('selected', on);
      btn.setAttribute('aria-pressed', on);
      const badge = btn.querySelector('.badge');
      badge.classList.toggle('badge-primary', on);
      badge.classList.toggle('badge-neutral', !on);
    });
    refreshLivingCardRail();
  };
  root.querySelectorAll('[data-tier]').forEach(btn => btn.addEventListener('click', () => {
    listing.price = Number(btn.dataset.tier);
    listing.priceTier = listing.price;
    priceInput.value = listing.price;
    saveListing();
    syncPrice();
    priceInput.classList.add('just-set');
    setTimeout(() => priceInput.classList.remove('just-set'), 600);
  }));
  priceInput.addEventListener('input', e => {
    listing.price = Number(e.target.value) || 0;
    saveListing();
    syncPrice();
  });

  wireFooter(root, { onBack: () => navigateTo('A4.0'), onContinue: () => navigateTo('A4.2') });
}

registerScreen('A4.1', { type: 'working', render: renderA41 });

/* ---------------- A4.2 — Ownership evidence & signing ---------------- */

let docusignModalOpen = false;

function renderA42(root) {
  const s = listing.signing;
  const body = `
    <section class="media-section">
      <div class="media-section-head">
        <p class="media-section-title">Proof of ownership</p>
        <p class="media-section-text">Upload a deed, tax bill, or title document. Our brokerage team reviews it within 2–4 business hours.</p>
      </div>
      <div class="media-card">
        ${dropzoneMarkup({ id: 'ownership-drop', accept: '.pdf,.jpg,.jpeg,.png', inputAttrs: 'id="ownership-input"', fileName: s.ownershipFile,
          title: 'Choose a document or drag &amp; drop it here', hint: 'PDF, JPG or PNG, Up to 10MB', doneHint: 'Document added. Upload another to replace it.' })}
      </div>
    </section>

    <div class="field-reaction helper">
      ${icon('circle-help')} This step has never been unlocked on a live test listing — treat the DocuSign hand-off after "Continue to signing" as a best-effort reconstruction.
    </div>
  `;

  root.innerHTML = workingScreenMarkup({
    eyebrow: 'Step 11 of 11 - Ownership & signing',
    title: 'Ownership evidence & signing',
    bodyHtml: body
  }) + footerBarMarkup('Back', 'Continue to signing', false) + `
    <div class="modal-scrim" id="docusign-scrim" ${docusignModalOpen ? '' : 'hidden'}>
      <div class="modal-card">
        <button class="modal-close" id="docusign-close">${icon('x')}</button>
        <p class="h4" style="margin-bottom:var(--space-md)">You're about to leave DIY Residential</p>
        <p class="p-reg text-muted" style="margin-bottom:var(--space-md)">Signing happens through DocuSign, a separate secure site. Come back here afterward — your progress is saved.</p>
        <div class="note-callout">Return state: you'll land back on this screen. Processing state: a banner shows while DocuSign confirms. Stalled state: we'll show a "check your email" note if it takes longer than expected.</div>
        <div class="modal-actions">
          <button class="btn btn-outline" id="docusign-later">Not right now</button>
          <button class="btn btn-primary" id="docusign-confirm">Open DocuSign</button>
        </div>
      </div>
    </div>
  `;

  root.querySelector('#ownership-input').addEventListener('change', e => {
    if (e.target.files[0]) { s.ownershipFile = e.target.files[0].name; saveListing(); renderApp(); }
  });
  wireDropzone(root.querySelector('#ownership-drop'), file => { s.ownershipFile = file.name; saveListing(); renderApp(); });

  root.querySelectorAll('#docusign-close, #docusign-later').forEach(btn => btn.addEventListener('click', () => {
    docusignModalOpen = false;
    root.querySelector('#docusign-scrim').hidden = true;
  }));
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
