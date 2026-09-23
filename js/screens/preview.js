/* Preview — the buyer-facing listing, built from whatever has been entered.
   Always reachable, never locked. Section 7 "Preview — always available".

   Reimagined per direct user request: the buyer-facing content now sits
   inside a browser-window mockup (matching the real buyer-facing listing
   detail page, node 6424:172238: gallery, verified-badge title row with
   stat pills, price, description, an "about this home" grid), so it reads
   as "here's the live page," not just another wizard screen. Deliberately
   dropped from that real page: the engagement-stats row (views/favorites/
   shares), map, schools/parks, and market-value charts — all would require
   numbers or geodata we don't have, and the spec forbids inventing them.
   The "about this home" grid only shows fields the seller has actually
   entered. Seller-only controls (edit-any-step, finish & publish) live
   outside the window, in the rail, so the mockup itself stays "buyer-pure". */

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

/* Seller-only controls, kept outside the browser-mockup so the mockup
   itself only ever shows what a buyer would actually see. */
function nextIncompleteStep() {
  for (const actNum of [1, 2, 3, 4]) {
    if (!isActComplete(actNum)) return ACT_STEPS[actNum][0].id;
  }
  return null;
}

function editStepsMarkup() {
  return [1, 2, 3, 4].map(actNum => `
    <div class="nav-act-group">
      <div class="nav-act-header done">${ACT_NAMES[actNum]}</div>
      <div class="nav-step-list">
        ${ACT_STEPS[actNum].map(s => `
          <div class="nav-step-row" data-clickable="true" data-edit-step="${s.id}">
            <span class="nav-step-icon">${icon('pencil', 14)}</span>
            <span>${s.label}</span>
          </div>`).join('')}
      </div>
    </div>`).join('');
}

function galleryMarkup(photos) {
  if (!photos.length) {
    return `<div style="aspect-ratio:16/9; background:var(--background-subtle); display:flex; align-items:center; justify-content:center; color:var(--muted-foreground);">No photos yet</div>`;
  }
  const hero = photos[0];
  const thumbs = photos.slice(1, 5);
  return `
    <div style="display:flex; gap:4px; height:280px;">
      <div style="flex:1.4; min-width:0;"><img src="${hero}" style="width:100%;height:100%;object-fit:cover" /></div>
      ${thumbs.length ? `<div style="flex:1; display:grid; grid-template-columns:1fr 1fr; gap:4px; min-width:0;">
        ${thumbs.map((p, i) => `<div style="position:relative;"><img src="${p}" style="width:100%;height:100%;object-fit:cover" />
          ${i === thumbs.length - 1 && photos.length > 5 ? `<span class="badge badge-outline" style="position:absolute;bottom:6px;right:6px;background:rgba(255,255,255,0.92)">See all ${photos.length} photos</span>` : ''}
        </div>`).join('')}
      </div>` : ''}
    </div>`;
}

function aboutHomeGrid() {
  const b = listing.basics;
  const cells = [];
  cells.push(['Home type', PROPERTY_TYPES.find(t => t.id === listing.propertyType)?.label || (listing.propertyType === 'other' ? (listing.propertyTypeOther || 'Other') : null)]);
  cells.push(['Year built', b.yearBuilt]);
  cells.push(['Lot size', b.lotSize ? `${b.lotSize.toLocaleString()} ${b.lotUnit === 'acre' ? 'acres' : 'sqft'}` : null]);
  cells.push(['Interior', b.sqft ? `${b.sqft.toLocaleString()} sqft` : null]);
  cells.push(['Parking', b.garage ? `${b.garage}-car garage` : null]);
  cells.push(['HOA fee', b.hoa === 'yes' ? (b.hoaDetails?.fee ? `$${b.hoaDetails.fee}/${(b.hoaDetails.frequency || 'month').replace(/ly$/, '')}` : 'Yes') : (b.hoa === 'no' ? 'None' : null)]);
  if (listing.price && b.sqft) cells.push(['Price / sqft', `$${Math.round(listing.price / b.sqft)}`]);

  const known = cells.filter(([, v]) => v !== null && v !== undefined && v !== '');
  if (!known.length) return '';
  return `
    <div class="card" style="margin-top:var(--space-lg)">
      <p class="h4" style="margin-bottom:var(--space-md)">Home facts</p>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(140px,1fr)); gap:var(--space-md);">
        ${known.map(([label, value]) => `<div><p class="p-mini text-muted">${label}</p><p class="p-sm font-semibold">${value}</p></div>`).join('')}
      </div>
    </div>`;
}

registerScreen('preview', {
  type: 'preview',
  render(root) {
    const b = listing.basics;
    const photos = allPhotos();
    const priceLine = listing.progress.completedActs.includes(4) && listing.price
      ? `$${Number(listing.price).toLocaleString()}`
      : 'Price set after your valuation';
    const missing = missingItems();

    const content = `
      <div class="card" style="padding:0; overflow:hidden;">
        ${galleryMarkup(photos)}
        <div style="padding:var(--space-xl)">
          <div style="display:flex; align-items:center; gap:8px;">
            <p class="p-sm font-semibold">${listing.address.resolved ? `${listing.address.city}, ${listing.address.state} ${listing.address.zip}` : 'Address not yet entered'}</p>
            ${listing.address.resolved ? `<span title="Verified">${icon('badge-check', 14)}</span>` : ''}
          </div>
          <p class="p-reg text-muted" style="margin-top:2px">${listing.address.resolved ? listing.address.line1 : ''}</p>
          <div style="display:flex; gap:var(--space-xl); margin-top:var(--space-md);">
            <span class="p-sm">${icon('bed-double', 16)} ${b.beds || '—'} beds</span>
            <span class="p-sm">${icon('bath', 16)} ${b.baths || '—'} baths</span>
            <span class="p-sm">${icon('gallery-vertical-end', 16)} ${b.sqft || '—'} sqft</span>
            ${b.garage ? `<span class="p-sm">${icon('car', 16)} ${b.garage} parking</span>` : ''}
          </div>
          <p class="h2" style="margin-top:var(--space-md)">${priceLine}</p>
        </div>
      </div>

      <div class="card" style="margin-top:var(--space-lg)">
        <p class="h4" style="margin-bottom:var(--space-s)">About this home</p>
        <p class="p-reg">${listing.story.driveway || "This seller hasn't added a description yet."}</p>
        ${(listing.features.homeStyle || []).length ? `<div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:var(--space-md)">${listing.features.homeStyle.map(s => `<span class="chip">${s}</span>`).join('')}</div>` : ''}
      </div>

      ${aboutHomeGrid()}

      ${photos.length > 1 ? `
        <div class="card" style="margin-top:var(--space-lg)">
          <p class="h4" style="margin-bottom:var(--space-s)">Photos</p>
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(120px,1fr)); gap:var(--space-xs);">
            ${photos.map(p => `<img src="${p}" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--radius-md)" />`).join('')}
          </div>
        </div>` : ''}

      ${missing.length ? `
        <div class="card" style="margin-top:var(--space-lg)">
          <p class="h4" style="margin-bottom:var(--space-s)">Still being finalized</p>
          <p class="p-sm text-muted" style="margin-bottom:var(--space-md)">Buyers won't see raw form data — just a plain note that these parts are on the way.</p>
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${missing.map(label => `<div class="yn-row"><span class="p-sm">${label}</span><span class="chip">In progress</span></div>`).join('')}
          </div>
        </div>` : ''}
    `;

    const urlSlug = listing.address.resolved
      ? listing.address.line1.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : 'your-new-listing';

    const next = nextIncompleteStep();
    const finishCard = listing.signing.signed
      ? `
        <div class="card" style="text-align:center;">
          <span class="badge badge-primary">Live</span>
          <p class="p-sm text-muted" style="margin-top:var(--space-s); margin-bottom:var(--space-s)">This listing is published.</p>
          <a href="#/A4.3" class="btn-link">View publish confirmation</a>
        </div>`
      : `
        <div class="card" style="text-align:center;">
          <p class="p-sm text-muted" style="margin-bottom:var(--space-md)">${next ? "This preview updates as you go — nothing here is public yet." : "Everything's filled in — you're ready to publish."}</p>
          <button class="btn btn-primary" id="finish-listing" style="width:100%">${next ? 'Continue to finish your listing' : 'Finish & publish listing'}</button>
        </div>`;

    const sidebar = `
      ${finishCard}
      <div class="card" style="margin-top:var(--space-lg)">
        <p class="p-sm font-semibold" style="margin-bottom:var(--space-s)">Edit any step</p>
        ${editStepsMarkup()}
      </div>
    `;

    root.innerHTML = `
      <div class="screen-working">
        <div class="main-split-container">
          <div class="screen-text-block">
            <div class="eyebrow">Preview</div>
            <p class="h2">What buyers will see</p>
            <p class="p-reg text-muted" style="margin-top:8px">This updates as you fill in the wizard. It's never locked.</p>
          </div>
          <div class="split-zones">
            <div class="zone-content">
              <div class="browser-mockup">
                <div class="browser-mockup-bar">
                  <div class="browser-mockup-dots"><span></span><span></span><span></span></div>
                  <div class="browser-mockup-url">diyresidential.com/homes/${urlSlug}</div>
                </div>
                <div class="browser-mockup-body">${content}</div>
              </div>
            </div>
            <div class="zone-rail">${sidebar}</div>
          </div>
        </div>
      </div>
    `;

    root.querySelectorAll('[data-edit-step]').forEach(el => {
      el.addEventListener('click', () => navigateTo(el.dataset.editStep));
    });

    const finishBtn = root.querySelector('#finish-listing');
    if (finishBtn) finishBtn.addEventListener('click', () => navigateTo(next || 'A4.1'));
  }
});
