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
  ];
  /* Figma order: Home Type, Year built, Est. annual taxes, Lot size / Interior, Parking, Price / sqft, HOA fee */
  const parking = listing.features.parking && listing.features.parking.length && !b.garage ? listing.features.parking.join(', ') : null;
  if (parking) cells[4][1] = parking;
  cells.splice(2, 0, ['Est. annual taxes', null]);
  const [homeType, yearBuilt, taxes, lot, interior, park, ppsf, hoa] = cells;
  cells.length = 0;
  cells.push(homeType, yearBuilt, taxes, lot, interior, park, ppsf, hoa);
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
        <span class="lp-btn-chip">Zoom in ${icon('zoom-in', 16)}</span>
      </div>
      <div class="lp-card lp-floorplan">
        ${m.floorPlan
          ? `<div class="lp-floorplan-sheet">${icon('layout-panel-left', 48)}<span>${m.floorPlan}</span><em>FLOOR 1</em></div>`
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
        <img src="assets/images/address-map.webp" alt="" />
        <span class="lp-map-chip">${a.resolved ? a.line1 : 'Your home'}</span>
        <span class="lp-map-zoom"><span>${icon('plus', 18)}</span><span>${icon('minus', 18)}</span></span>
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
  const lo = VALUATION_TIERS[0].value;
  const hi = VALUATION_TIERS[VALUATION_TIERS.length - 1].value;
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
        ${VALUATION_TIERS.map(t => `
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
          <p class="lp-action-note is-plain">Open house times appear here</p>
          <span class="lp-btn lp-btn-secondary">Schedule a visit ${icon('chevron-right', 16)}</span>
        </div>
      </div>
      <div class="lp-card lp-action">
        <p class="lp-action-title">${icon('calculator', 20)} Mortgage Calculator</p>
        <div class="lp-action-box">
          <p class="lp-payment-label">Est. Monthly Payment</p>
          <p class="lp-payment">${payment}</p>
          <p class="lp-action-note is-plain is-strong">20% down · 30 yr · 7.0%</p>
          <span class="lp-btn lp-btn-outline">Customize estimate ${icon('chevron-right', 16)}</span>
        </div>
      </div>
      <span class="lp-divider" aria-hidden="true"></span>
      <div class="lp-card lp-action">
        <p class="lp-action-title">${icon('phone', 20)} Contact DIY Residential</p>
        <div class="lp-action-box">
          <p class="lp-action-note is-plain">Have more questions?</p>
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

/* ---------- Property Details - Full (Figma 5663:50126) additions ----------
   Seller answers fill everything they can. Market data the seller doesn't
   provide (neighbourhood stats, parks, value history) is drawn from the
   listing's own price and valuation tiers and tagged "Sample data" so it
   reads as a layout preview, not a real figure. */

const lpSample = () => `<span class="lp-sample" title="Illustrative until live market data is connected">Sample data</span>`;
const lpImgPlaceholder = (label, iconName = 'image') => `<span class="lp-img-ph">${icon(iconName, 24)}${label ? `<span>${label}</span>` : ''}</span>`;
const lpCity = () => (listing.address.resolved && listing.address.city) || 'Your city';
const lpBasePrice = () => previewPrice() || VALUATION_TIERS[1].value;
const kFmt = n => n >= 1e6 ? `$${(n / 1e6).toFixed(n >= 1e7 ? 0 : 2).replace(/\.?0+$/, '')}M` : `$${Math.round(n / 1000)}K`;

function lpSiteNav() {
  const c = listing.contact || {};
  const initials = ((c.firstName || '')[0] || '') + ((c.lastName || '')[0] || '');
  return `
    <header class="lp-site-nav" aria-hidden="true">
      <span class="lp-site-logo"><img src="assets/icons/logo-symbol.svg" width="26" height="26" alt="" /> DIY Residential</span>
      <div class="lp-site-right">
        <nav class="lp-site-menu">
          <span>Home</span><span class="is-active">Properties ${icon('chevron-down', 16)}</span><span>Services ${icon('chevron-down', 16)}</span><span>Get help</span>
        </nav>
        <span class="lp-site-list">${icon('house', 16)} List a home</span>
        <span class="lp-site-icon">${icon('inbox', 18)}</span>
        <span class="lp-site-avatar">${(initials || 'ME').toUpperCase()}</span>
      </div>
    </header>`;
}

function lpNeighbourhood() {
  const p = lpBasePrice();
  const stats = [
    ['Median sale price', kFmt(p * 0.92)],
    ['Avg household income', `$${Math.round(p * 0.00019 * 1000 / 1000)}k`],
    ['Median age', '36'],
    ['Walk score', '72 / 100']
  ];
  return `
    <section class="lp-section">
      <div class="lp-section-head">
        <h3 class="lp-h3">${lpCity()} Neighbourhood ${lpSample()}</h3>
        <span class="lp-btn-chip">Explore ${icon('chevron-right', 16)}</span>
      </div>
      <div class="lp-hood">
        <div class="lp-card lp-hood-stats">
          ${stats.map(([l, v]) => `<div class="lp-fact"><p class="lp-fact-label">${l}</p><p class="lp-fact-value">${v}</p></div>`).join('')}
        </div>
        <div class="lp-hood-photos">
          <div class="lp-hood-main">${lpImgPlaceholder(`${lpCity()} photos`)}</div>
          <div class="lp-hood-row">${[1, 2, 3].map(() => `<div>${lpImgPlaceholder('')}</div>`).join('')}</div>
        </div>
      </div>
    </section>`;
}

function lpPlaceCard(name, meta, iconName) {
  return `
    <div class="lp-card lp-place">
      <div class="lp-place-img">${lpImgPlaceholder('', iconName)}<span class="lp-place-360">360°</span></div>
      <p class="lp-place-name">${name}</p>
      <p class="lp-place-meta">${meta}</p>
    </div>`;
}

function lpSchoolsFull() {
  const sc = listing.schools || {};
  const list = [['Elementary', sc.elementary], ['Middle', sc.middle], ['High', sc.high]].filter(([, n]) => n);
  return `
    <section class="lp-section">
      <div class="lp-section-head">
        <h3 class="lp-h3">Schools</h3>
        <span class="lp-note">Source: GreatSchools</span>
      </div>
      ${list.length ? `<div class="lp-place-row">${list.map(([level, name]) => lpPlaceCard(name, `${level} school · Zoned for this home`, 'graduation-cap')).join('')}</div>`
        : `<div class="lp-card lp-empty-card"><p class="lp-empty">No schools added yet. The seller can add zoned schools on the Address step.</p></div>`}
    </section>`;
}

function lpParks() {
  return `
    <section class="lp-section">
      <div class="lp-section-head"><h3 class="lp-h3">Parks in the area ${lpSample()}</h3></div>
      <div class="lp-place-row">
        ${[['Neighbourhood park', '5 min walk'], ['Community playground', '10 min walk'], ['City greenway', '6 min drive']].map(([n, m]) => lpPlaceCard(n, m, 'trees')).join('')}
      </div>
    </section>`;
}

/* Estimated value: the four provider estimates are the valuation tiers
   (plus a midpoint), and each line eases up to its value over the period. */
let lpValueYears = 5;
function lpValueSeries() {
  const [lo, mid, hi] = VALUATION_TIERS.map(t => t.value);
  return [
    { name: 'Collateral Analytics', end: Math.round((mid + hi) / 2 / 1000) * 1000, color: '#3b82f6', dash: '5 4', off: 0.02 },
    { name: 'ICE', end: mid, color: '#c084fc', dash: '2 4', off: 0.035 },
    { name: 'First American', end: hi, color: '#1f4d40', dash: '6 4', off: -0.01 },
    { name: 'Quantarium', end: lo, color: '#14b8a6', dash: '2 4', off: -0.04 }
  ];
}
function lpEstimatedValueFull() {
  const series = lpValueSeries();
  const avg = Math.round(series.reduce((sum, x) => sum + x.end, 0) / series.length);
  const growth = { 1: 0.05, 5: 0.28, 10: 0.62 }[lpValueYears];
  const startAvg = avg / (1 + growth);
  const pts = 24, W = 446, H = 190;
  const all = [];
  const lines = series.concat([{ name: 'Average Value', end: avg, color: '#d78d38', avg: true, off: 0 }]).map(sr => {
    const start = sr.end / (1 + growth) * (1 + sr.off);
    const vals = Array.from({ length: pts }, (_, i) => {
      const t = i / (pts - 1);
      const wobble = Math.sin(i * 1.3 + sr.off * 90) * 0.012 * sr.end * (sr.avg ? 0.4 : 1);
      return start + (sr.end - start) * (t * 0.85 + 0.15 * Math.sin(t * Math.PI / 2)) + (i && i < pts - 1 ? wobble : 0);
    });
    all.push(...vals);
    return { ...sr, vals };
  });
  const min = Math.min(...all) * 0.97, max = Math.max(...all) * 1.02;
  const y = v => H - ((v - min) / (max - min)) * H;
  const path = vals => vals.map((v, i) => `${i ? 'L' : 'M'}${((i / (pts - 1)) * W).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const ticks = Array.from({ length: 5 }, (_, i) => max - ((max - min) / 4) * i);
  const now = 2026;
  const years = Array.from({ length: 6 }, (_, i) => Math.round(now - lpValueYears + (lpValueYears / 5) * i));
  const inc = avg - startAvg;
  return `
    <section class="lp-section" id="lp-value">
      <div>
        <h3 class="lp-h3">Estimated Home Value ${lpSample()}</h3>
        <div class="lp-section-sub">
          <p class="lp-lead">Range of Values: <strong>${money(Math.min(...series.map(x => x.end)))} - ${money(Math.max(...series.map(x => x.end)))}</strong></p>
          <p class="lp-note">Based on your valuation estimate</p>
        </div>
      </div>
      <div class="lp-card lp-chart-card">
        <div class="lp-chart-top">
          <div class="lp-kpis">
            <div><p class="lp-kpi">${money(inc)}</p><p class="lp-kpi-label">Value Increase</p></div>
            <div><p class="lp-kpi">${Math.round((inc / startAvg) * 100)}%</p><p class="lp-kpi-label">Percent Increase</p></div>
            <div><p class="lp-kpi">${money(inc * 0.66)}</p><p class="lp-kpi-label">Adjusted for Inflation</p></div>
          </div>
          <div class="lp-tabs" role="tablist">
            ${[1, 5, 10].map(n => `<button type="button" class="${n === lpValueYears ? 'active' : ''}" data-lp-years="${n}">${n} Year${n > 1 ? 's' : ''}</button>`).join('')}
          </div>
        </div>
        <div class="lp-chart-body">
          <svg class="lp-line-chart" viewBox="0 0 506 214" role="img" aria-label="Estimated value over ${lpValueYears} years">
            ${ticks.map(t => `<line x1="0" x2="${W}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}" class="lp-grid" /><text x="${W + 14}" y="${(y(t) + 4).toFixed(1)}" class="lp-axis">${kFmt(t).replace('K', '.0K')}</text>`).join('')}
            ${lines.map(l => `<path d="${path(l.vals)}" fill="none" stroke="${l.color}" stroke-width="${l.avg ? 3 : 1.5}" ${l.dash ? `stroke-dasharray="${l.dash}"` : ''} stroke-linecap="round" />`).join('')}
            ${years.map((yr, i) => `<text x="${((i / 5) * W).toFixed(1)}" y="210" class="lp-axis" text-anchor="${i === 0 ? 'start' : i === 5 ? 'end' : 'middle'}">${yr}</text>`).join('')}
          </svg>
          <div class="lp-legend-box">
            ${series.map(sr => `<div class="lp-legend-row"><span class="lp-legend-line" style="border-top:2px ${sr.dash.startsWith('2') ? 'dotted' : 'dashed'} ${sr.color}"></span><span>${sr.name}</span><strong>${money(sr.end)}</strong></div>`).join('')}
            <div class="lp-legend-row is-avg"><span class="lp-legend-line" style="border-top:3px solid #d78d38"></span><span>Average Value</span><strong>${money(avg)}</strong></div>
          </div>
        </div>
      </div>
    </section>`;
}

/* Home values in the area: price buckets around this home, with its own
   bucket in amber; bars are market share, lines the area trends. */
let lpAreaMode = 'value';
function lpAreaValues() {
  const p = lpBasePrice();
  const sqft = Number(listing.basics.sqft) || 0;
  const mult = [0.37, 0.48, 0.5, 0.64, 0.7, 0.75, 0.82, 0.88, 0.94, 1, 1.1, 1.2, 1.31, 1.43, 1.6];
  const share = [4.9, 7.6, 9.4, 11.2, 11.8, 14.6, 15.4, 10.1, 8.3, 4.9, 3.4, 2.8, 2.2, 2.8, 3.4];
  const perSq = lpAreaMode === 'sqft' && sqft;
  const label = m => (perSq ? `$${Math.round((p * m) / sqft)}` : kFmt(p * m)) + (m === 1.6 ? '+' : '');
  const W = 715, H = 188, bw = 32.7, gap = (W - bw * 15) / 14;
  const bars = share.map((v, i) => {
    const h = (v / 20) * H;
    return `<rect x="${(i * (bw + gap)).toFixed(1)}" y="${(H - h).toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" rx="6" class="${i === 9 ? 'is-home' : ''}" />`;
  }).join('');
  const line = (fn, cls) => `<path d="${Array.from({ length: 15 }, (_, i) => `${i ? 'L' : 'M'}${(i * (bw + gap) + bw / 2).toFixed(1)},${fn(i).toFixed(1)}`).join(' ')}" class="${cls}" fill="none" />`;
  const typeLabel = PROPERTY_TYPES.find(t => t.id === listing.propertyType)?.label || 'Single-family home';
  return `
    <section class="lp-section" id="lp-area">
      <div class="lp-section-sub" style="margin-top:0">
        <h3 class="lp-h3">Home Values in the Area ${lpSample()}</h3>
        <p class="lp-note">Based on nearby sales</p>
      </div>
      <div class="lp-card lp-chart-card">
        <div class="lp-chart-top">
          <div class="lp-tabs is-wide" role="tablist">
            <button type="button" class="${lpAreaMode === 'value' ? 'active' : ''}" data-lp-area="value">Value</button>
            <button type="button" class="${lpAreaMode === 'sqft' ? 'active' : ''}" data-lp-area="sqft" ${sqft ? '' : 'disabled title="Add square footage to see this"'}>Values per sq ft</button>
          </div>
          <span class="lp-select">${typeLabel}s ${icon('chevron-down', 16)}</span>
        </div>
        <div class="lp-bar-wrap">
          <div class="lp-bar-axis">${['20%', '15%', '10%', '5%', ''].map(t => `<span>${t}</span>`).join('')}</div>
          <svg class="lp-bar-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Market share by price">
            ${[0, 0.25, 0.5, 0.75].map(f => `<line x1="0" x2="${W}" y1="${(H * f).toFixed(1)}" y2="${(H * f).toFixed(1)}" class="lp-grid" />`).join('')}
            ${bars}
            ${line(i => H * (0.9 - 0.55 * Math.pow(i / 14, 0.8)), 'lp-area-avg')}
            ${line(i => H * (0.82 - 0.7 * Math.pow(i / 14, 0.7)), 'lp-area-metro')}
            ${line(i => H * (0.97 - 0.45 * Math.pow(i / 14, 0.9)), 'lp-area-us')}
          </svg>
        </div>
        <div class="lp-bar-labels">${mult.map(m => `<span>${label(m)}</span>`).join('')}</div>
        <div class="lp-bar-legend">
          <span><i class="dot is-share"></i>Market Share</span>
          <span><i class="dot is-home"></i>This Home</span>
          <span><i class="ln is-avg"></i>Average</span>
          <span><i class="ln is-metro"></i>Metro Area</span>
          <span><i class="ln is-us"></i>U.S.</span>
        </div>
      </div>
    </section>`;
}

function lpContactFormFull() {
  return `
    <section class="lp-section">
      <h3 class="lp-h3">Reach out to the seller</h3>
      <div class="lp-card lp-form-card" aria-disabled="true">
        <div class="lp-form">
          <div class="field-grid dense">
            <div class="field"><label>First name</label><input type="text" placeholder="Jamie" disabled /></div>
            <div class="field"><label>Last name</label><input type="text" placeholder="Harris" disabled /></div>
          </div>
          <div class="field"><label>Message</label><textarea rows="4" placeholder="Type your message here." disabled></textarea></div>
          <span class="lp-btn lp-btn-outline">Send Message ${icon('chevron-right', 16)}</span>
        </div>
        <p class="lp-form-legal">By submitting this form, you agree to DIY Residential's <u>Terms of Use</u> and <u>Privacy Policy</u>. You also agree to receive calls/texts from DIY Residential and its affiliates, including for marketing purposes.</p>
      </div>
    </section>`;
}

function lpSiteFooter() {
  const col = (title, items) => `<div class="lp-foot-col"><p class="lp-foot-title">${title}</p>${items.map(i => `<span>${i}</span>`).join('')}</div>`;
  return `
    <footer class="lp-footer" aria-hidden="true">
      <div class="lp-foot-top">
        <div class="lp-foot-brand">
          <span class="lp-site-logo"><img src="assets/icons/logo-symbol.svg" width="26" height="26" alt="" /> DIY Residential</span>
          <p class="lp-foot-h">Stay In The Know</p>
          <p class="lp-foot-text">Subscribe to receive the latest listings, market info, and exclusive deals right to your inbox.</p>
          <div class="lp-foot-sub"><span>${icon('mail', 16)} Enter your email</span><span class="lp-foot-sub-btn">Subscribe</span></div>
        </div>
        <div class="lp-foot-cols">
          ${col('Company', ['About Us', 'Careers', 'Contact', 'FAQ'])}
          ${col('Explore', ['Our Blog', 'New Deals', 'Listings', 'Open Houses', 'Guides'])}
          ${col('Services', ['Sell Property', 'Management', 'Mortgages', 'Valuation'])}
        </div>
      </div>
      <div class="lp-foot-bottom">
        <span>© 2026 DIY Residential. All rights reserved.</span>
        <span class="lp-foot-social"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H6.5v3.5H9V21h3.5v-8.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z"/></svg><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l16 16M20 4L4 20"/></svg><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6" fill="currentColor"/></svg><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="9" width="3.5" height="11.5"/><circle cx="5.25" cy="5" r="1.75"/><path d="M10.5 20.5V9h3.3v1.6a3.6 3.6 0 0 1 3.2-1.8c2.3 0 3.5 1.5 3.5 4.3v7.4h-3.5v-6.6c0-1.3-.5-2.1-1.6-2.1s-1.9.8-1.9 2.1v6.6z"/></svg></span>
        <span class="lp-foot-links"><span>Privacy Policy</span><span>Terms of Service</span></span>
      </div>
      <p class="lp-foot-legal">DIY Residential • 403A Uptown Square, Murfreesboro, TN 37129 • 629-310-5871 • Tennessee Real Estate Commission firm licence 267339<br /><strong>DIY Residential supervises both sides of this transaction and represents neither the buyer nor the seller.</strong></p>
    </footer>`;
}

function listingPageMarkup() {
  const a = listing.address;
  const b = listing.basics;
  const photos = allPhotos();
  const price = previewPrice();
  const halfBaths = b.halfBaths ? ` · ${b.halfBaths} half` : '';

  return `
    ${lpSiteNav()}
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
            <p class="lp-description${(listing.story.publicDescription || listing.story.driveway) ? '' : ' empty'}">${listing.story.publicDescription || listing.story.driveway || "The seller hasn't added a description yet."}</p>
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
          ${lpNeighbourhood()}
          ${lpSchoolsFull()}
          ${lpParks()}
          ${lpEstimatedValueFull()}
          ${lpAreaValues()}
          ${lpContactFormFull()}
        </div>
        ${lpSidebar(price)}
      </div>

      <hr class="lp-separator" />
      ${lpSimilar()}
    </div>
    ${lpSiteFooter()}`;
}

function wireLpCharts(root) {
  root.querySelectorAll('[data-lp-years]').forEach(btn => btn.onclick = () => {
    lpValueYears = Number(btn.dataset.lpYears);
    root.querySelector('#lp-value').outerHTML = lpEstimatedValueFull();
    refreshIcons(); wireLpCharts(root);
  });
  root.querySelectorAll('[data-lp-area]').forEach(btn => btn.onclick = () => {
    lpAreaMode = btn.dataset.lpArea;
    root.querySelector('#lp-area').outerHTML = lpAreaValues();
    refreshIcons(); wireLpCharts(root);
  });
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
    wireLpCharts(root);
    const finishBtn = root.querySelector('#finish-listing');
    if (finishBtn) finishBtn.addEventListener('click', () => navigateTo(next || 'A4.1'));
  }
});
