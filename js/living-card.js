/* The living card — non-interactive display, section 6.1.
   No click handler, no hover state, no pointer cursor, no elevation change. */

function livingCardImageMarkup(data) {
  if (data.state === 'skeleton') {
    return `<div class="living-card-image">No photos yet</div>`;
  }
  if (data.photo) {
    return `<div class="living-card-image"><img src="${data.photo}" alt="" /></div>`;
  }
  return `<div class="living-card-image">No photos yet</div>`;
}

function livingCardChipsMarkup(data) {
  const chip = (value, label) => value
    ? `<span class="living-card-chip">${value} ${label}</span>`
    : `<span class="living-card-chip ghost">— ${label}</span>`;
  return `
    <div class="living-card-chips">
      ${chip(data.beds, 'beds')}
      ${chip(data.baths, 'baths')}
      ${chip(data.sqft, 'sqft')}
    </div>`;
}

function livingCardBodyMarkup(data, opts) {
  const addressLine = data.address
    ? `<div class="living-card-address">${data.address}</div>`
    : `<div class="living-card-address placeholder">Your address will appear here</div>`;
  const cityLine = data.city ? `<div class="living-card-city">${data.city}</div>` : '';
  const priceLine = (data.state === 'complete' || data.state === 'photographed')
    ? `<div class="living-card-price">${data.priceLine}</div>` : '';

  let rowsMarkup = '';
  if (!opts.band) {
    const rows = livingCardRows();
    rowsMarkup = `<div class="living-card-rows">${rows.map(r => `
      <div class="living-card-row">
        <span class="row-label">${r.label}</span>
        <span class="row-action ${r.done ? 'done' : 'pending'}">${r.action}</span>
      </div>`).join('')}</div>`;
  }

  return `
    <div class="living-card-body">
      ${addressLine}
      ${cityLine}
      ${livingCardChipsMarkup(data)}
      ${priceLine}
      ${rowsMarkup}
    </div>`;
}

function renderLivingCard(opts = {}) {
  const data = livingCardData();
  const bandClass = opts.band ? ' band' : '';
  return `
    <div class="living-card${bandClass}" data-living-card-state="${data.state}" aria-label="Listing preview, non-interactive">
      ${livingCardImageMarkup(data)}
      ${livingCardBodyMarkup(data, opts)}
    </div>`;
}
