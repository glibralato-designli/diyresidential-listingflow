/* Preview — the buyer-facing listing, built from whatever has been entered.
   Always reachable, never locked. Section 7 "Preview — always available".

   Laid out as the live Property Details page (Figma node 5317:20557) inside
   a browser-window mockup: breadcrumb + actions, 1+4 gallery, then a main
   column (location + stat pills, price, description, engagement, About this
   home, floor plan, location, schools, estimated value, contact form) beside
   the buyer action cards (make an offer, schedule a visit, mortgage
   calculator, contact), and Similar Properties underneath.

   Everything shown comes from the seller's answers or from numbers the flow
   already computes (valuation tiers, comparables). Where the page would need
   data we don't have yet — photos, engagement counts before launch, a map —
   it shows an honest empty state instead of inventing values. Buyer actions
   are inert here. Seller controls (edit a step, finish) sit in a bar above
   the mockup so the page itself stays buyer-pure. */

const PREVIEW_TIERS = VALUATION_TIERS;

function allPhotos() {
  const out = [];
  Object.values(listing.media.photos).forEach(arr => { if (Array.isArray(arr)) out.push(...arr); });
  return out;
}

function missingItems() {
  const items = [];
  if (!listing.progress.completedActs.includes(1)) items.push('Home basics');
  if (!listing.progress.completedActs.includes(2)) items.push('Property disclosures');
  if (!listing.progress.completedActs.includes(3)) items.push('Photos & video');
  if (!listing.progress.completedActs.includes(4)) items.push('Final price');
  return items;
}

function nextIncompleteStep() {
  for (const actNum of [1, 2, 3, 4]) {
    if (!isActComplete(actNum)) return ACT_STEPS[actNum][0].id;
  }
  return null;
}

const money = n => `$${Math.round(n).toLocaleString()}`;

function previewPrice() {
  if (listing.price) return Number(listing.price);
  return null;
}

/* 20% down, 30-year fixed at 7.0% — the same assumptions the Figma card states */
function monthlyPayment(price) {
  const principal = price * 0.8;
  const r = 0.07 / 12;
  const n = 360;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

/* ---------- Page pieces ---------- */

function lpPhotoSlot(photo, extraHtml = '') {
  return `
    <div class="lp-photo">
      ${photo ? `<img src="${photo}" alt="" />` : `<span class="lp-photo-empty">${icon('image', 24)}</span>`}
      ${extraHtml}
    </div>`;
}

function lpGalleryMarkup(photos) {
  const slots = [0, 1, 2, 3, 4].map(i => photos[i] || null);
  const overlay = label => `<span class="lp-photo-btn">${icon('image', 16)} ${label}</span>`;
  return `
    <div class="lp-gallery">
      ${lpPhotoSlot(slots[0], photos.length ? overlay('3D Tour') : '')}
      <div class="lp-gallery-grid">
        ${slots.slice(1).map((p, i) => lpPhotoSlot(p, i === 3 ? overlay(photos.length ? `See all ${photos.length} photos` : 'Photos coming soon') : '')).join('')}
      </div>
    </div>`;
}

function lpAboutGrid() {
  const b = listing.basics;
  const typeLabel = PROPERTY_TYPES.find(t => t.id === listing.propertyType)?.label
    || (listing.propertyType === 'other' ? (listing.propertyTypeOther || 'Other') : null);
  const price = previewPrice();
  const cells = [
    ['Home Type', typeLabel],
    ['Year built', b.yearBuilt],
    ['Lot size', b.lotSize ? `${Number(b.lotSize).toLocaleString()} ${b.lotUnit === 'acre' ? 'acres' : 'sqft'}` : null],
    ['Interior', b.sqft ? `${Number(b.sqft).toLocaleString()} sqft` : null],
    ['Parking', b.garage ? `${b.garage}-car garage` : null],
    ['Price / sqft', price && b.sqft ? money(price / b.sqft) : null],
    ['HOA fee', b.hoa === 'yes' ? (b.hoaDetails?.fee ? `$${b.hoaDetails.fee}/${(b.hoaDetails.frequency || 'month').replace(/ly$/, '').toLowerCase()}` : 'Yes') : (b.hoa === 'no' ? 'None' : null)],
    ['Stories', listing.features.stories || null]
  ];
  return `
    <section class="lp-section">
      <h3 class="lp-h3">About this home</h3>
      <div class="lp-card lp-facts">
        ${cells.map(([label, value]) => `
          <div class="lp-fact">
            <p class="lp-fact-label">${label}</p>
            <p class="lp-fact-value${value ? '' : ' empty'}">${value || 'Not added yet'}</p>
          </div>`).join('')}
      </div>
    </section>`;
}

function lpFloorPlan() {
  const m = listing.media;
  return `
    <section class="lp-section">
      <div class="lp-section-head">
        <h3 class="lp-h3">Floor Plan</h3>
        <span class="lp-pill" aria-disabled="true">${icon('maximize-2', 16)} Expand</span>
      </div>
      <div class="lp-card lp-floorplan">
        ${m.floorPlan
          ? `<div class="lp-floorplan-file">${icon('file-text', 20)}<span>${m.floorPlan}</span></div>`
          : `<p class="lp-empty">${m.noFloorPlan ? 'The seller doesn’t have a floor plan for this home.' : 'Floor plan coming soon.'}</p>`}
      </div>
    </section>`;
}

function lpLocation() {
  const a = listing.address;
  return `
    <section class="lp-section">
      <div>
        <h3 class="lp-h3">Location</h3>
        <p class="lp-lead">${a.resolved ? `${a.line1}, ${a.city}, ${a.state} ${a.zip}` : 'Address not yet entered'}</p>
      </div>
      <div class="lp-map" aria-label="Map">
        <span class="lp-map-pin">${icon('map-pin', 22)}</span>
      </div>
    </section>`;
}

function lpSchools() {
  const sc = listing.schools || {};
  const list = [['Elementary', sc.elementary], ['Middle', sc.middle], ['High', sc.high]].filter(([, n]) => n);
  if (sc.nearby !== 'Yes' || !list.length) return '';
  return `
    <section class="lp-section">
      <h3 class="lp-h3">Schools</h3>
      <div class="lp-school-row">
        ${list.map(([level, name]) => `
          <div class="lp-card lp-school">
            <span class="lp-school-icon">${icon('graduation-cap', 20)}</span>
            <p class="lp-fact-label">${level} school</p>
            <p class="lp-fact-value">${name}</p>
          </div>`).join('')}
      </div>
    </section>`;
}

function lpEstimatedValue() {
  const lo = PREVIEW_TIERS[0].value;
  const hi = PREVIEW_TIERS[PREVIEW_TIERS.length - 1].value;
  const base = lo - (hi - lo); // bars start below the range so their differences read
  return `
    <section class="lp-section">
      <div>
        <h3 class="lp-h3">Estimated Home Value</h3>
        <div class="lp-section-sub">
          <p class="lp-lead">Range of Values: ${money(lo)} – ${money(hi)}</p>
          <p class="lp-note">Based on 2 comparable sales nearby</p>
        </div>
      </div>
      <div class="lp-card lp-values">
        ${PREVIEW_TIERS.map(t => `
          <div class="lp-value-row${t.suggested ? ' is-suggested' : ''}">
            <span class="lp-value-label">${t.label}</span>
            <span class="lp-value-bar"><span style="width:${Math.round(((t.value - base) / (hi - base)) * 100)}%"></span></span>
            <span class="lp-value-amount">${money(t.value)}</span>
          </div>`).join('')}
      </div>
    </section>`;
}

function lpContactForm() {
  return `
    <section class="lp-section">
      <h3 class="lp-h3">Reach out to the seller</h3>
      <div class="lp-card lp-form" aria-disabled="true">
        <div class="field-grid dense">
          <div class="field"><label>Name</label><input type="text" placeholder="Your name" disabled /></div>
          <div class="field"><label>Email</label><input type="text" placeholder="you@email.com" disabled /></div>
        </div>
        <div class="field"><label>Message</label><textarea rows="3" placeholder="I'd like to know more about this home…" disabled></textarea></div>
        <button class="btn btn-primary lp-btn-lg" type="button" disabled>Send message</button>
      </div>
    </section>`;
}

function lpSidebar(price) {
  const payment = price ? money(monthlyPayment(price)) : '—';
  return `
    <aside class="lp-sidebar">
      <div class="lp-card lp-action is-primary">
        <div class="lp-action-head">
          <p class="lp-action-title">${icon('receipt-text', 20)} Make an offer</p>
          <p class="lp-action-text">The seller is reviewing offers. Your offer status is private, only you see how your offer compares.</p>
        </div>
        <div class="lp-action-box">
          <p class="lp-action-note">${icon('square-check', 16)} Attach a pre-approval letter</p>
          <span class="lp-btn lp-btn-primary">Make Offer ${icon('chevron-right', 16)}</span>
        </div>
      </div>
      <div class="lp-card lp-action">
        <p class="lp-action-title">${icon('calendar-plus', 20)} Schedule a visit</p>
        <div class="lp-action-box">
          <p class="lp-action-note">Open house times appear here</p>
          <span class="lp-btn lp-btn-secondary">Schedule a visit ${icon('chevron-right', 16)}</span>
        </div>
      </div>
      <div class="lp-card lp-action">
        <p class="lp-action-title">${icon('calculator', 20)} Mortgage Calculator</p>
        <div class="lp-action-box">
          <p class="lp-payment-label">Est. Monthly Payment</p>
          <p class="lp-payment">${payment}</p>
          <p class="lp-action-note">20% down · 30 yr · 7.0%</p>
          <span class="lp-btn lp-btn-outline">Customize estimate ${icon('chevron-right', 16)}</span>
        </div>
      </div>
      <span class="lp-divider" aria-hidden="true"></span>
      <div class="lp-card lp-action">
        <p class="lp-action-title">${icon('phone', 20)} Contact DIY Residential</p>
        <div class="lp-action-box">
          <p class="lp-action-note">Have more questions?</p>
          <span class="lp-btn lp-btn-outline">Contact us ${icon('chevron-right', 16)}</span>
        </div>
      </div>
    </aside>`;
}

function lpSimilar() {
  if (typeof COMPARABLES === 'undefined') return '';
  return `
    <section class="lp-similar">
      <h2 class="lp-h2">Similar Properties</h2>
      <div class="lp-similar-row">
        ${COMPARABLES.slice(0, 3).map(c => listingCardMarkup({
          photo: c.photo,
          placeholder: icon('house', 28),
          title: c.price,
          address: 'Comparable sale nearby',
          beds: c.beds, baths: c.baths, sqft: c.sqft
        })).join('')}
      </div>
    </section>`;
}

function listingPageMarkup() {
  const a = listing.address;
  const b = listing.basics;
  const photos = allPhotos();
  const price = previewPrice();
  const halfBaths = b.halfBaths ? ` · ${b.halfBaths} half` : '';

  return `
    <div class="lp">
      <div class="lp-top">
        <nav class="lp-breadcrumb" aria-label="Breadcrumb">
          <span>Listings</span>${icon('chevron-right', 16)}
          <span>${a.resolved ? a.city : 'Your city'}</span>${icon('chevron-right', 16)}
          <strong>${a.resolved ? a.line1 : 'Your home'}</strong>
        </nav>
        <div class="lp-top-actions" aria-hidden="true">
          <span class="lp-pill">${icon('heart', 16)} Favorite</span>
          <span class="lp-pill">${icon('bell', 16)} Set Alert</span>
          <span class="lp-pill">${icon('eye', 16)} Hide</span>
          <span class="lp-pill">${icon('share', 16)} Share</span>
          <span class="lp-pill">${icon('ellipsis', 16)} More</span>
        </div>
      </div>

      ${lpGalleryMarkup(photos)}

      <hr class="lp-separator" />

      <div class="lp-body">
        <div class="lp-main">
          <section class="lp-section lp-summary">
            <div class="lp-summary-row">
              <p class="lp-location">
                ${a.resolved ? `${a.city}, ${a.state} · ${a.zip}` : 'Address not yet entered'}
                ${a.resolved ? `<span class="lp-verified" title="Verified address">${icon('badge-check', 24)}</span>` : ''}
              </p>
              <div class="lp-stats">
                ${listingStatMarkup('beds', b.beds || null, 'beds')}
                ${listingStatMarkup('baths', b.baths || null, `baths${halfBaths}`)}
                ${listingStatMarkup('sqft', b.sqft ? Number(b.sqft).toLocaleString() : null, 'sq')}
                ${b.garage ? `<span class="listing-card-stat"><span class="listing-card-stat-icon">${icon('car', 16)}</span>${b.garage} Parking</span>` : ''}
              </div>
            </div>
            <div class="lp-price-row">
              <p class="lp-price${price ? '' : ' placeholder'}">${price ? money(price) : 'Price set after valuation'}</p>
              ${listing.signing.signed ? '<span class="badge badge-primary">New listing</span>' : ''}
            </div>
            <p class="lp-description${listing.story.driveway ? '' : ' empty'}">${listing.story.driveway || "The seller hasn't added a description yet."}</p>
            <div class="lp-engagement">
              <span>${icon('eye', 24)} Total Views: 0</span>
              <span>${icon('calendar', 24)} Days On Market: 0</span>
              <span>${icon('heart', 24)} Favorites: 0</span>
              <span>${icon('share-2', 24)} Shares: 0</span>
            </div>
          </section>
          ${lpAboutGrid()}
          ${lpFloorPlan()}
          ${lpLocation()}
          ${lpSchools()}
          ${lpEstimatedValue()}
          ${lpContactForm()}
        </div>
        ${lpSidebar(price)}
      </div>

      <hr class="lp-separator" />
      ${lpSimilar()}
    </div>`;
}

registerScreen('preview', {
  type: 'preview',
  render(root) {
    const missing = missingItems();
    const next = nextIncompleteStep();
    const urlSlug = listing.address.resolved
      ? listing.address.line1.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : 'your-new-listing';

    const status = listing.signing.signed
      ? `<span class="badge badge-primary">Live</span><span>This listing is published.</span>`
      : `<span class="badge badge-secondary">Draft</span><span>${missing.length ? `Still to finish: ${missing.join(', ')}. Nothing here is public yet.` : "Everything's filled in — you're ready to publish."}</span>`;

    root.innerHTML = `
      <div class="screen-working">
        <div class="main-split-container">
          <div class="screen-text-block">
            <div class="eyebrow">Preview</div>
            <p class="screen-title">What buyers will see</p>
            <p class="screen-description">This is your listing page as buyers will see it. It updates as you fill in the wizard.</p>
          </div>
          <div class="preview-seller-bar">
            <p class="preview-seller-status">${status}</p>
            <div class="preview-seller-actions">
              <button class="btn btn-outline" id="preview-edit">${icon('pencil', 16)} Edit a step</button>
              ${listing.signing.signed
                ? '<a href="#A4.3" class="btn btn-primary">View publish confirmation</a>'
                : `<button class="btn btn-primary" id="finish-listing">${next ? 'Continue my listing' : 'Finish & publish'}</button>`}
            </div>
          </div>
          <div class="browser-mockup preview-mockup">
            <div class="browser-mockup-bar">
              <div class="browser-mockup-dots"><span></span><span></span><span></span></div>
              <div class="browser-mockup-url">diyresidential.com/homes/${urlSlug}</div>
            </div>
            <div class="browser-mockup-body">${listingPageMarkup()}</div>
          </div>
        </div>
      </div>
    `;

    root.querySelector('#preview-edit').addEventListener('click', openNavOverlay);
    const finishBtn = root.querySelector('#finish-listing');
    if (finishBtn) finishBtn.addEventListener('click', () => navigateTo(next || 'A4.1'));
  }
});
