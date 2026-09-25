/* Act 3 — Let's show it off (step 9). Section 7 of the spec.
   Copy and slot counts confirmed against the real Media step capture
   (Figma node 6647:109148) via research pass. */

registerScreen('A3.0', {
  type: 'fullbleed',
  render(root) {
    root.innerHTML = actCoverMarkup({
      actNum: 3,
      iconName: 'camera',
      title: ACT_NAMES[3],
      line: ACT_PROMISES[3],
      chips: ['Photos', 'Media', 'Listing story']
    });
    root.querySelector('#cover-continue').addEventListener('click', () => navigateTo('A3.1'));
  }
});

/* ---------------- A3.1 — Photos ---------------- */

function readFilesAsDataURLs(fileList) {
  return Promise.all(Array.from(fileList).map(file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  })));
}

/* Photo slots (Figma frames 5663:55330 empty, 5663:55035 uploaded,
   5663:55408 dragging). Each slot is a card: icon tile, name + status
   badge, "See example photos", Upload. Uploaded photos sit in a row of
   100px tiles with a remove button; while files load they show
   "Uploading…". Cards reorder by dragging the grip that appears on hover
   (or with the arrow keys on the grip). */

const SLOT_ICONS = { 'front-exterior': 'house', 'rear-exterior': 'house', 'living-room': 'tv', 'kitchen': 'coffee' };
const slotIcon = id => SLOT_ICONS[id] || (id.startsWith('bedroom') ? 'bed-double' : id.startsWith('bathroom') ? 'droplets' : 'image');

/* "Add another area": the icon follows the name the seller types, using
   the same icon set as the built-in slots plus a few area-specific ones. */
const AREA_ICON_RULES = [
  [/bath|shower|powder|toilet/, 'droplets'],
  [/bed|nursery|guest room|suite/, 'bed-double'],
  [/kitchen|pantry|breakfast/, 'coffee'],
  [/living|family|den|lounge|great room/, 'tv'],
  [/dining/, 'utensils'],
  [/garage|carport|driveway/, 'car'],
  [/basement|cellar|storage|shed|workshop/, 'warehouse'],
  [/office|study|library/, 'briefcase'],
  [/laundry|utility|mud ?room/, 'washing-machine'],
  [/gym|fitness|exercise/, 'dumbbell'],
  [/pool|spa|hot tub/, 'waves'],
  [/patio|deck|porch|balcony|yard|garden|lawn|backyard|landscap/, 'trees'],
  [/closet|wardrobe|dressing/, 'shirt'],
  [/hall|entry|foyer|stair|landing/, 'door-open'],
  [/theater|theatre|media|game|play/, 'clapperboard'],
  [/attic|loft|bonus/, 'house'],
  [/exterior|front|rear|view|aerial|street/, 'house']
];
function areaIcon(name) {
  const n = (name || '').toLowerCase();
  const hit = AREA_ICON_RULES.find(([re]) => re.test(n));
  return hit ? hit[1] : 'image';
}
let addingArea = false;

let photoUploading = {}; // slot id -> number of files still loading (session only)
let qrRevealed = false;

function orderedPhotoSlots() {
  const order = listing.media.slotOrder || [];
  const rank = id => { const i = order.indexOf(id); return i === -1 ? 999 : i; };
  const custom = (listing.media.customAreas || []).map(a => ({ id: a.id, label: a.label, required: false, custom: true }));
  return photoSlotDefinitions().concat(custom).map((s, i) => ({ ...s, i })).sort((a, b) => (rank(a.id) - rank(b.id)) || (a.i - b.i));
}

function photoSlotCardMarkup(slot) {
  const photos = listing.media.photos[slot.id] || [];
  const loading = photoUploading[slot.id] || 0;
  const blurry = (listing.media.flags || {})[slot.id] === 'blurry';
  const badge = photos.length
    ? '<span class="badge photo-slot-badge is-uploaded">Uploaded</span>'
    : `<span class="badge photo-slot-badge">${slot.required ? 'Required' : 'Optional'}</span>`;
  return `
    <div class="photo-slot" data-slot-card="${slot.id}">
      <div class="photo-slot-row">
        <button type="button" class="photo-slot-grip" data-grip="${slot.id}" aria-label="Drag to reorder ${slot.label}">${icon('grip-vertical', 20)}</button>
        <span class="photo-slot-icon">${icon(slot.custom ? areaIcon(slot.label) : slotIcon(slot.id), 20)}</span>
        <div class="photo-slot-text">
          <div class="photo-slot-title-row"><span class="photo-slot-title">${slot.label}</span>${badge}</div>
          <button type="button" class="photo-slot-example" data-example-toggle="${slot.id}">See example photos ${icon('arrow-up-right', 16)}</button>
        </div>
        <label class="btn btn-outline photo-slot-upload">
          ${icon('upload', 16)} Upload
          <input type="file" accept="image/*" multiple data-slot-input="${slot.id}" hidden />
        </label>
        ${slot.custom ? `<button type="button" class="photo-slot-remove" data-remove-area="${slot.id}" aria-label="Remove ${slot.label}">${icon('trash-2', 18)}</button>` : ''}
      </div>
      <div class="reveal" id="example-${slot.id}">
        <div class="field-reaction helper" style="align-items:center;">
          <img src="${exampleThumb()}" alt="" style="width:64px;height:48px;border-radius:6px;object-fit:cover" />
          <span style="margin-left:8px">Example: shot straight-on, in daylight, with clutter cleared.</span>
        </div>
      </div>
      ${photos.length || loading ? `
        <div class="photo-slot-files">
          ${photos.map((p, n) => `
            <div class="photo-tile">
              <img src="${p}" alt="${slot.label} photo ${n + 1}" />
              <button type="button" class="photo-tile-remove" data-remove-photo="${slot.id}:${n}" aria-label="Remove photo ${n + 1}">${icon('x', 10)}</button>
            </div>`).join('')}
          ${Array.from({ length: loading }).map(() => `
            <div class="photo-tile is-loading">${icon('loader', 20)}<span>Uploading…</span></div>`).join('')}
        </div>` : ''}
      ${blurry && photos.length ? `<p class="photo-slot-warning">${icon('triangle-alert', 16)} Blurry photo detected. Retake or replace.</p>` : ''}
    </div>`;
}

function exampleThumb() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150"><rect width="200" height="150" fill="#f3faf7"/><rect x="20" y="90" width="160" height="45" fill="#265f50" opacity="0.25"/><rect x="70" y="60" width="60" height="75" fill="#265f50" opacity="0.4"/></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

/* A photo under ~1000px wide reads as blurry once it's shown large */
function looksBlurry(dataUrl) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth < 1000);
    img.onerror = () => resolve(false);
    img.src = dataUrl;
  });
}

/* Drag the grip: the card lifts and follows the pointer; passing another
   card's midpoint swaps them. The order is saved on release. */
function wirePhotoReorder(root) {
  const saveOrder = list => {
    const ids = Array.from(root.querySelectorAll('[data-slot-card]')).map(el => el.dataset.slotCard);
    listing.media.slotOrder = ids;
    saveListing();
  };

  root.querySelectorAll('[data-grip]').forEach(grip => {
    const card = grip.closest('[data-slot-card]');
    const list = card.parentElement;

    grip.addEventListener('pointerdown', ev => {
      ev.preventDefault();
      grip.setPointerCapture(ev.pointerId);
      let tr = 0;
      const naturalTop = () => card.getBoundingClientRect().top - tr;
      const grab = ev.clientY - naturalTop();
      card.classList.add('is-dragging');
      list.classList.add('is-sorting');

      const move = e => {
        const top = e.clientY - grab;
        const mid = top + card.offsetHeight / 2;
        const siblings = Array.from(list.querySelectorAll('[data-slot-card]')).filter(el => el !== card);
        for (const sib of siblings) {
          const r = sib.getBoundingClientRect();
          const sibMid = r.top + r.height / 2;
          const sibIsAbove = card.compareDocumentPosition(sib) & Node.DOCUMENT_POSITION_PRECEDING;
          if (sibIsAbove && mid < sibMid) { list.insertBefore(card, sib); break; }
          if (!sibIsAbove && mid > sibMid) { list.insertBefore(card, sib.nextSibling); }
        }
        tr = top - (card.getBoundingClientRect().top - tr);
        card.style.transform = `translateY(${tr}px)`;
      };
      const end = () => {
        grip.removeEventListener('pointermove', move);
        card.classList.remove('is-dragging');
        list.classList.remove('is-sorting');
        card.style.transform = '';
        saveOrder();
      };
      grip.addEventListener('pointermove', move);
      grip.addEventListener('pointerup', end, { once: true });
      grip.addEventListener('pointercancel', end, { once: true });
    });

    grip.addEventListener('keydown', ev => {
      if (ev.key !== 'ArrowUp' && ev.key !== 'ArrowDown') return;
      ev.preventDefault();
      if (ev.key === 'ArrowUp' && card.previousElementSibling) list.insertBefore(card, card.previousElementSibling);
      else if (ev.key === 'ArrowDown' && card.nextElementSibling) list.insertBefore(card.nextElementSibling, card);
      saveOrder();
      grip.focus();
    });
  });
}

function renderA31(root) {
  const slots = orderedPhotoSlots();
  const required = slots.filter(s => s.required);
  const optional = slots.filter(s => !s.required);
  const pro = !!listing.media.proPhotography;

  const body = `
    <div class="capture-card">
      <div>
        <p class="capture-title">Capture on mobile</p>
        <p class="capture-text">Scan to continue on your phone. Progress syncs automatically.</p>
      </div>
      <button type="button" class="capture-qr" id="qr-toggle" aria-label="Show QR code" aria-expanded="${qrRevealed}">${icon('qr-code', 36)}</button>
    </div>
    <div class="reveal ${qrRevealed ? 'open' : ''}" id="qr-reveal">
      <div class="card" style="text-align:center;">
        ${icon('qr-code', 96)}
        <p class="p-sm text-muted" style="margin-top:8px">This would open the mobile capture flow on a real device.</p>
      </div>
    </div>

    <div class="photo-group">
      <p class="section-label">REQUIRED PHOTOS</p>
      <div class="photo-slot-list">${required.map(photoSlotCardMarkup).join('')}</div>
    </div>
    ${optional.length ? `
    <div class="photo-group">
      <p class="section-label">OPTIONAL PHOTOS</p>
      <div class="photo-slot-list">${optional.map(photoSlotCardMarkup).join('')}</div>
    </div>` : ''}

    ${addingArea ? `
      <div class="add-area-form">
        <span class="photo-slot-icon" id="add-area-icon" aria-hidden="true">${icon('image', 20)}</span>
        <div class="field add-area-field">
          <label for="add-area-name">Name this area</label>
          <input type="text" id="add-area-name" placeholder="e.g. Home office, Laundry room, Back patio" autocomplete="off" />
        </div>
        <div class="add-area-actions">
          <button type="button" class="btn btn-outline" id="add-area-cancel">Cancel</button>
          <button type="button" class="btn btn-primary" id="add-area-save" disabled>Add area</button>
        </div>
      </div>` : `
      <button type="button" class="add-area-btn" id="add-area-btn">${icon('plus', 16)} Add another area</button>`}

    <div class="photo-slot pro-photo">
      <div class="photo-slot-row">
        <span class="photo-slot-icon is-accent">${icon('switch-camera', 20)}</span>
        <div class="photo-slot-text">
          <p class="photo-slot-title">Add Professional Photography</p>
          <p class="pro-photo-text">Aerial and interior shots from <strong>$149</strong>, ordered seamlessly through our portal.</p>
        </div>
        <button type="button" class="switch${pro ? ' on' : ''}" role="switch" aria-checked="${pro}" aria-label="Add Professional Photography" id="pro-photo-switch"><span></span></button>
      </div>
    </div>
  `;

  root.innerHTML = workingScreenMarkup({
    eyebrow: 'Step 9 of 11 - Photos',
    title: 'Add photos of your home',
    whyLine: 'More photos help buyers picture living there — and improve your price estimate.',
    bodyHtml: body
  }) + footerBarMarkup('Back', 'Continue', false);

  root.querySelector('#qr-toggle').addEventListener('click', () => {
    qrRevealed = !qrRevealed;
    root.querySelector('#qr-reveal').classList.toggle('open', qrRevealed);
  });

  root.querySelectorAll('[data-example-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      root.querySelector(`#example-${btn.dataset.exampleToggle}`).classList.toggle('open');
    });
  });

  root.querySelectorAll('[data-slot-input]').forEach(input => {
    input.addEventListener('change', async () => {
      const files = Array.from(input.files);
      if (!files.length) return;
      const slotId = input.dataset.slotInput;
      const room = Math.max(0, 10 - (listing.media.photos[slotId] || []).length);
      const batch = files.slice(0, room);
      photoUploading[slotId] = batch.length;
      renderApp();
      const urls = await readFilesAsDataURLs(batch);
      const blurry = (await Promise.all(urls.map(looksBlurry))).some(Boolean);
      setTimeout(() => {
        listing.media.photos[slotId] = (listing.media.photos[slotId] || []).concat(urls).slice(0, 10);
        listing.media.flags = { ...(listing.media.flags || {}), [slotId]: blurry ? 'blurry' : null };
        delete photoUploading[slotId];
        saveListing();
        renderApp();
      }, 900);
    });
  });

  root.querySelectorAll('[data-remove-photo]').forEach(btn => btn.addEventListener('click', () => {
    const [slotId, n] = btn.dataset.removePhoto.split(':');
    const list = listing.media.photos[slotId] || [];
    list.splice(Number(n), 1);
    listing.media.photos[slotId] = list;
    if (!list.length && listing.media.flags) listing.media.flags[slotId] = null;
    saveListing();
    renderApp();
  }));

  root.querySelector('#pro-photo-switch').addEventListener('click', () => {
    listing.media.proPhotography = !listing.media.proPhotography;
    saveListing();
    renderApp();
  });

  wirePhotoReorder(root);

  const addBtn = root.querySelector('#add-area-btn');
  if (addBtn) addBtn.addEventListener('click', () => {
    addingArea = true;
    renderApp();
    const input = document.getElementById('add-area-name');
    if (input) input.focus();
  });
  const nameInput = root.querySelector('#add-area-name');
  if (nameInput) {
    const saveBtn = root.querySelector('#add-area-save');
    const iconEl = root.querySelector('#add-area-icon');
    let lastIcon = 'image';
    nameInput.addEventListener('input', () => {
      saveBtn.disabled = !nameInput.value.trim();
      const next = areaIcon(nameInput.value);
      if (next !== lastIcon) { lastIcon = next; iconEl.innerHTML = icon(next, 20); refreshIcons(); }
    });
    const add = () => {
      const label = nameInput.value.trim();
      if (!label) return;
      const areas = listing.media.customAreas || [];
      areas.push({ id: `custom-${Date.now().toString(36)}`, label });
      listing.media.customAreas = areas;
      addingArea = false;
      saveListing();
      renderApp();
    };
    saveBtn.addEventListener('click', add);
    nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') add(); if (e.key === 'Escape') { addingArea = false; renderApp(); } });
    root.querySelector('#add-area-cancel').addEventListener('click', () => { addingArea = false; renderApp(); });
  }
  root.querySelectorAll('[data-remove-area]').forEach(btn => btn.addEventListener('click', () => {
    const id = btn.dataset.removeArea;
    listing.media.customAreas = (listing.media.customAreas || []).filter(a => a.id !== id);
    delete listing.media.photos[id];
    saveListing();
    renderApp();
  }));

  wireFooter(root, { onBack: () => navigateTo('A2.6'), onContinue: () => navigateTo('A3.2') });
}

registerScreen('A3.1', { type: 'working', render: renderA31 });

/* ---------------- A3.2 — Video & floor plan ---------------- */

/* Tips under the video drop zone (Figma node 5663:55437) */
const VIDEO_CHIPS = [
  'Walk slowly, room by room',
  'Keep lights on throughout',
  'Include basement & attic',
  'Landscape and driveway'
];

function renderA32(root) {
  const m = listing.media;
  const body = `
    <section class="media-section">
      <div class="media-section-head">
        <p class="media-section-title">Record a video walkthrough</p>
        <p class="media-section-text">Walk through each room slowly. Our AI detects condition issues, water stains, aging fixtures, structural concerns and more, that photos might miss. This improves your valuation accuracy significantly.</p>
      </div>
      <div class="media-card">
        <label class="media-dropzone${m.video ? ' has-file' : ''}" id="video-drop">
          ${m.video ? `
            <span class="media-dropzone-icon is-done">${icon('circle-check', 24)}</span>
            <span class="media-dropzone-title">${m.video}</span>
            <span class="media-dropzone-hint">Video added. Upload another to replace it.</span>` : `
            <span class="media-dropzone-icon">${icon('upload', 24)}</span>
            <span class="media-dropzone-title">Choose a video or drag &amp; drop it here</span>
            <span class="media-dropzone-hint">MP4, MOV, Up to 10 minutes</span>`}
          <span class="btn btn-outline media-dropzone-btn">${m.video ? 'Replace' : 'Upload'}</span>
          <input type="file" accept="video/mp4,video/quicktime,video/*" id="video-input" hidden />
        </label>
        <div class="media-tips">
          ${VIDEO_CHIPS.map(c => `<span class="media-tip">${icon('circle-check', 14)} ${c}</span>`).join('')}
        </div>
      </div>
    </section>

    <section class="media-section">
      <div class="media-section-head">
        <p class="media-section-title">Add your floor plan</p>
        <p class="media-section-text">Buyers love floor plans: they show how the rooms connect and make your home easier to picture.</p>
      </div>
      <div class="media-card">
        <label class="checkbox-row">
          <input type="checkbox" id="no-floorplan" ${m.noFloorPlan ? 'checked' : ''} /> I don't have a floor plan
        </label>
        <div class="reveal ${!m.noFloorPlan ? 'open' : ''}" id="floorplan-fields">
          <div class="media-card-stack">
            <label class="media-dropzone${m.floorPlan ? ' has-file' : ''}" id="floorplan-drop">
              ${m.floorPlan ? `
                <span class="media-dropzone-icon is-done">${icon('circle-check', 24)}</span>
                <span class="media-dropzone-title">${m.floorPlan}</span>
                <span class="media-dropzone-hint">Floor plan added. Upload another to replace it.</span>` : `
                <span class="media-dropzone-icon">${icon('upload', 24)}</span>
                <span class="media-dropzone-title">Choose your floor plans or drag &amp; drop them here</span>
                <span class="media-dropzone-hint">PDF, PNG, JPG or WEBP, Up to 5 files, one per floor</span>`}
              <span class="btn btn-outline media-dropzone-btn">${m.floorPlan ? 'Replace' : 'Upload'}</span>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" id="floorplan-input" hidden />
            </label>
            <div class="media-tips">
              <button type="button" class="media-tip media-tip-action" id="get-floorplan-service">${icon('pencil-ruler', 14)} Get a free floor plan in 5 minutes</button>
            </div>
            <div class="reveal" id="floorplan-service-note"><div class="field-reaction helper">${icon('circle-help')} This connects to a separate paid service — not wired up in this prototype.</div></div>
            <div class="field">
              <label for="floorplan-link">Interactive floor plan link <span class="field-optional">(Optional)</span></label>
              <div style="display:flex; gap:8px;">
                <input type="text" id="floorplan-link" placeholder="https://your-floor-plan-link" value="${m.floorPlanLink || ''}" style="flex:1" />
                <button class="btn btn-primary" id="floorplan-link-save" ${!m.floorPlanLink ? 'disabled' : ''}>Save link</button>
              </div>
              <p class="field-hint">Paste the link your scanning app gave you. Buyers open it from your listing.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  root.innerHTML = workingScreenMarkup({
    eyebrow: 'Step 9 of 11 - Video & floor plan',
    title: 'Video & floor plan',
    bodyHtml: body
  }) + footerBarMarkup('Back', 'Continue', false);

  root.querySelector('#video-input').addEventListener('change', e => {
    if (e.target.files[0]) { m.video = e.target.files[0].name; saveListing(); renderApp(); }
  });
  /* Drag & drop a video onto the zone */
  const drop = root.querySelector('#video-drop');
  ['dragenter', 'dragover'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach(t => drop.addEventListener(t, () => drop.classList.remove('is-over')));
  drop.addEventListener('drop', e => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) { m.video = file.name; saveListing(); renderApp(); }
  });
  root.querySelector('#floorplan-input').addEventListener('change', e => {
    if (e.target.files[0]) { m.floorPlan = e.target.files[0].name; saveListing(); renderApp(); }
  });
  const fpDrop = root.querySelector('#floorplan-drop');
  ['dragenter', 'dragover'].forEach(t => fpDrop.addEventListener(t, e => { e.preventDefault(); fpDrop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach(t => fpDrop.addEventListener(t, () => fpDrop.classList.remove('is-over')));
  fpDrop.addEventListener('drop', e => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) { m.floorPlan = file.name; saveListing(); renderApp(); }
  });
  root.querySelector('#no-floorplan').addEventListener('change', e => {
    m.noFloorPlan = e.target.checked;
    saveListing();
    root.querySelector('#floorplan-fields').classList.toggle('open', !m.noFloorPlan);
  });
  root.querySelector('#get-floorplan-service').addEventListener('click', () => {
    root.querySelector('#floorplan-service-note').classList.toggle('open');
  });
  const linkInput = root.querySelector('#floorplan-link');
  linkInput.addEventListener('input', () => {
    root.querySelector('#floorplan-link-save').disabled = !linkInput.value.trim();
  });
  root.querySelector('#floorplan-link-save').addEventListener('click', () => {
    m.floorPlanLink = linkInput.value.trim();
    saveListing();
    renderApp();
  });

  wireFooter(root, {
    onBack: () => navigateTo('A3.1'),
    onContinue: () => {
      if (!listing.progress.completedActs.includes(3)) { listing.progress.completedActs.push(3); saveListing(); }
      navigateTo('A3.3');
    }
  });
}

registerScreen('A3.2', { type: 'working', render: renderA32 });

/* ---------------- A3.3 — Milestone ---------------- */

registerScreen('A3.3', {
  type: 'fullbleed',
  render(root) {
    root.innerHTML = milestoneMarkup({
      title: 'Your listing is real now.',
      description: "That's what buyers will see first. Last step — pricing and publishing.",
      action: 'Continue to Act 4'
    });
    root.querySelector('#milestone-continue').addEventListener('click', () => navigateTo('A4.0'));
  }
});
