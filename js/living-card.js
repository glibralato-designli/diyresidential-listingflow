/* The living card — non-interactive display, section 6.1.
   No click handler, no hover state, no pointer cursor, no elevation change.
   Rendered through the shared Listing Card component (Figma node 4125:1409);
   the photo-carousel arrows and favourite/360 action buttons from that
   component are left out because this card is deliberately non-interactive. */

const LISTING_STAT_ICONS = {
  beds: { src: 'assets/icons/bed-double.svg', w: 14.8333, h: 13.5, flipped: true },
  baths: { src: 'assets/icons/bathtub.svg', w: 14.8333, h: 13.5, flipped: true },
  sqft: { src: 'assets/icons/pencil-ruler.svg', w: 16, h: 16, flipped: false }
};

function listingStatMarkup(kind, value, label) {
  const i = LISTING_STAT_ICONS[kind];
  const ghost = value === null || value === undefined || value === '';
  return `
    <span class="listing-card-stat${ghost ? ' ghost' : ''}">
      <span class="listing-card-stat-icon${i.flipped ? ' flipped' : ''}"><img src="${i.src}" width="${i.w}" height="${i.h}" alt="" /></span>
      ${ghost ? '—' : value} ${label}
    </span>`;
}

/* Shared Listing Card markup. opts: { photo, placeholder, badge, title,
   titlePlaceholder, address, beds, baths, sqft, extraHtml, band, label } */
function listingCardMarkup(opts) {
  const image = opts.photo
    ? `<img src="${opts.photo}" alt="" />`
    : (opts.placeholder || '');
  return `
    <div class="listing-card${opts.band ? ' band' : ''}"${opts.label ? ` aria-label="${opts.label}"` : ''}${opts.state ? ` data-living-card-state="${opts.state}"` : ''}>
      <div class="listing-card-image">
        ${image}
        ${opts.badge ? `<span class="badge badge-primary">${opts.badge}</span>` : ''}
        ${opts.actionsHtml ? `<div class="listing-card-actions">${opts.actionsHtml}</div>` : ''}
      </div>
      <div class="listing-card-content">
        <div class="listing-card-heading">
          <p class="listing-card-title${opts.titlePlaceholder ? ' placeholder' : ''}">${opts.title}</p>
          ${opts.address ? `<p class="listing-card-address">${opts.address}</p>` : ''}
        </div>
        <div class="listing-card-stats">
          ${listingStatMarkup('beds', opts.beds, 'beds')}
          ${listingStatMarkup('baths', opts.baths, 'baths')}
          ${listingStatMarkup('sqft', opts.sqft, 'sqft')}
        </div>
        ${opts.extraHtml || ''}
      </div>
    </div>`;
}

function livingCardRowsMarkup() {
  return `<div class="living-card-rows">${livingCardRows().map(r => `
    <div class="living-card-row">
      <span class="row-label">${r.label}</span>
      <span class="row-action ${r.done ? 'done' : 'pending'}">${r.action}</span>
    </div>`).join('')}</div>`;
}

function renderLivingCard(opts = {}) {
  const data = livingCardData();
  const hasPrice = (data.state === 'complete' || data.state === 'photographed') && data.priceLine.startsWith('$');
  const place = [data.address, data.city].filter(Boolean).join(', ');

  let title, address, titlePlaceholder = false;
  if (hasPrice) {
    title = data.priceLine;
    address = place;
  } else if (data.address) {
    title = data.address;
    address = data.city;
  } else {
    title = 'Your address will appear here';
    titlePlaceholder = true;
  }

  return listingCardMarkup({
    band: opts.band,
    state: data.state,
    label: 'Listing preview, non-interactive',
    photo: data.state === 'skeleton' ? null : data.photo,
    placeholder: 'No photos yet',
    title,
    titlePlaceholder,
    address,
    beds: data.beds,
    baths: data.baths,
    sqft: data.sqft ? data.sqft.toLocaleString() : null,
    extraHtml: opts.band ? '' : livingCardRowsMarkup()
  });
}
