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
      chips: ['Photos', 'Video', 'Floor plan']
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

function photoSlotCardMarkup(slot) {
  const photos = listing.media.photos[slot.id] || [];
  return `
    <div class="card" style="padding: var(--space-md);" data-slot-card="${slot.id}">
      <div style="display:flex; align-items:center; gap: var(--space-md);">
        <div class="icon-wrap" style="width:40px;height:40px;">${icon('camera')}</div>
        <div style="flex:1">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="p-sm font-semibold">${slot.label}</span>
            ${slot.required ? '<span class="badge badge-secondary">Required</span>' : '<span class="badge badge-muted">Optional</span>'}
          </div>
          <div style="display:flex; align-items:center; gap:8px; margin-top:2px;">
            <button class="btn-link" data-example-toggle="${slot.id}" style="font-size:12px">See example photos ↗</button>
          </div>
          <p class="p-mini text-muted" style="margin-top:4px">JPG, PNG or WEBP · up to 10 photos, 20MB each · ${photos.length}/10</p>
        </div>
        <label class="btn btn-sm btn-outline" style="cursor:pointer">
          Upload
          <input type="file" accept="image/*" multiple data-slot-input="${slot.id}" style="display:none" />
        </label>
      </div>
      <div class="reveal" id="example-${slot.id}">
        <div class="field-reaction helper" style="align-items:center;">
          <img src="${exampleThumb()}" alt="" style="width:64px;height:48px;border-radius:6px;object-fit:cover" />
          <span style="margin-left:8px">Example: shot straight-on, in daylight, with clutter cleared.</span>
        </div>
      </div>
      ${photos.length ? `<div style="display:flex; gap:6px; margin-top:var(--space-s); flex-wrap:wrap;">
        ${photos.map(p => `<img src="${p}" style="width:56px;height:42px;object-fit:cover;border-radius:6px;border:1px solid var(--border)" />`).join('')}
      </div>` : ''}
    </div>`;
}

function exampleThumb() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150"><rect width="200" height="150" fill="#f3faf7"/><rect x="20" y="90" width="160" height="45" fill="#265f50" opacity="0.25"/><rect x="70" y="60" width="60" height="75" fill="#265f50" opacity="0.4"/></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

let qrRevealed = false;

function renderA31(root) {
  const slots = photoSlotDefinitions();

  const body = `
    <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap:var(--space-md);">
      <div>
        <p class="p-sm font-semibold">Capture on mobile</p>
        <p class="p-sm text-muted">Scan to continue on your phone. Photos sync automatically.</p>
      </div>
      <button class="btn btn-outline" id="qr-toggle">${icon('qr-code', 16)} Show QR code</button>
    </div>
    <div class="reveal ${qrRevealed ? 'open' : ''}" id="qr-reveal">
      <div class="card" style="text-align:center;">
        ${icon('qr-code', 96)}
        <p class="p-sm text-muted" style="margin-top:8px">This would open the mobile capture flow on a real device.</p>
      </div>
    </div>

    <div style="display:flex; flex-direction:column; gap:var(--space-md);">
      ${slots.map(photoSlotCardMarkup).join('')}
    </div>

    <button class="btn btn-outline" id="add-area-btn" style="border-style:dashed;">${icon('plus', 14)} Add another area</button>
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
      if (!input.files.length) return;
      const urls = await readFilesAsDataURLs(input.files);
      const slotId = input.dataset.slotInput;
      const existing = listing.media.photos[slotId] || [];
      listing.media.photos[slotId] = existing.concat(urls).slice(0, 10);
      saveListing();
      renderApp();
    });
  });

  root.querySelector('#add-area-btn').addEventListener('click', () => {
    alert_stub();
  });

  wireFooter(root, { onBack: () => navigateTo('A2.6'), onContinue: () => navigateTo('A3.2') });
}

function alert_stub() {
  // Kept intentionally inert with visible feedback rather than a dead click.
  const el = document.getElementById('add-area-btn');
  if (el) { el.textContent = 'Added — name it from the thumbnail (not wired in this prototype)'; }
}

registerScreen('A3.1', { type: 'working', render: renderA31 });

/* ---------------- A3.2 — Video & floor plan ---------------- */

const VIDEO_CHIPS = [
  'Walk slowly, room by room',
  'Keep lights on throughout',
  'Include basement & attic',
  'Landscape and driveway',
  'Turn off all ceiling fans',
  'Declutter first, then record'
];

function renderA32(root) {
  const m = listing.media;
  const body = `
    <div class="field">
      <label>Record a video walkthrough <span class="badge badge-muted">Optional</span></label>
      <p class="p-sm text-muted">Walk through each room slowly to show the flow and layout of your home. A walkthrough video helps buyers picture living there and builds confidence before they schedule a visit.</p>
      <div class="card" style="border-style:dashed; text-align:center;">
        ${m.video ? `<p class="p-sm font-semibold">${icon('check', 16)} ${m.video}</p>` : `
          <p>${icon('upload', 24)}</p>
          <p class="p-sm">Choose a video or drag &amp; drop it here</p>
          <p class="p-mini text-muted">MP4, MOV, up to 10 minutes</p>
        `}
        <label class="btn btn-sm btn-outline" style="cursor:pointer; margin-top:8px;">
          ${m.video ? 'Replace' : 'Upload'}
          <input type="file" accept="video/*" id="video-input" style="display:none" />
        </label>
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top: var(--space-md)">
        ${VIDEO_CHIPS.map(c => `<span class="chip">${icon('check', 12)} ${c}</span>`).join('')}
      </div>
    </div>

    <div class="field">
      <label>Add your floor plan</label>
      <p class="p-sm text-muted">Buyers love floor plans: they show how the rooms connect and make your home easier to picture.</p>
      <label class="checkbox-row">
        <input type="checkbox" id="no-floorplan" ${m.noFloorPlan ? 'checked' : ''} /> I don't have a floor plan
      </label>
      <div class="reveal ${!m.noFloorPlan ? 'open' : ''}" id="floorplan-fields">
        <div class="card" style="border-style:dashed; text-align:center;">
          ${m.floorPlan ? `<p class="p-sm font-semibold">${icon('check', 16)} ${m.floorPlan}</p>` : `
            <p>${icon('upload', 24)}</p>
            <p class="p-sm">Choose your floor plans or drag &amp; drop them here</p>
            <p class="p-mini text-muted">PDF, PNG, JPG or WEBP · up to 5 files, one per floor</p>
          `}
          <label class="btn btn-sm btn-outline" style="cursor:pointer; margin-top:8px;">
            ${m.floorPlan ? 'Replace' : 'Upload'}
            <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" id="floorplan-input" style="display:none" />
          </label>
        </div>
        <button class="btn btn-outline" id="get-floorplan-service" style="margin-top:var(--space-s)">${icon('pencil-ruler', 14)} Get a free floor plan in 5 minutes</button>
        <div class="reveal" id="floorplan-service-note"><div class="field-reaction helper">${icon('circle-help')} This connects to a separate paid service — not wired up in this prototype.</div></div>
        <div class="field" style="margin-top: var(--space-md)">
          <label>Interactive floor plan link</label>
          <div style="display:flex; gap:8px;">
            <input type="text" id="floorplan-link" placeholder="https://your-floor-plan-link" value="${m.floorPlanLink || ''}" style="flex:1" />
            <button class="btn btn-sm btn-primary" id="floorplan-link-save" ${!m.floorPlanLink ? 'disabled' : ''}>Save link</button>
          </div>
          <p class="p-mini text-muted">Paste the link your scanning app gave you. Buyers open it from your listing.</p>
        </div>
      </div>
    </div>
  `;

  root.innerHTML = workingScreenMarkup({
    eyebrow: 'Step 9 of 11 - Video & floor plan',
    title: 'Video & floor plan',
    bodyHtml: body
  }) + footerBarMarkup('Back', 'Continue', false);

  root.querySelector('#video-input').addEventListener('change', e => {
    if (e.target.files[0]) { m.video = e.target.files[0].name; saveListing(); renderApp(); }
  });
  root.querySelector('#floorplan-input').addEventListener('change', e => {
    if (e.target.files[0]) { m.floorPlan = e.target.files[0].name; saveListing(); renderApp(); }
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
    root.innerHTML = `
      <div class="screen-fullbleed">
        <div class="fullbleed-inner">
          <p class="act-cover-number">Your listing is real now</p>
          <div class="milestone-card" style="max-width:320px; margin: 0 auto var(--space-xl);">${renderLivingCard({ band: false })}</div>
          <p class="p-reg act-cover-line">That's what buyers will see first. Last step — pricing and publishing.</p>
          <button class="btn btn-primary" id="milestone-continue">Continue to Act 4</button>
        </div>
      </div>`;
    root.querySelector('#milestone-continue').addEventListener('click', () => navigateTo('A4.0'));
  }
});
