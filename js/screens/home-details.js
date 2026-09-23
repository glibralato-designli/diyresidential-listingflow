/* A1.5 — Home & property details, split into horizontal tabs.
   Every question from the production step (Figma section 6647:109141) is
   here except "Selling objectives" (driveway pitch, improvements, public
   description), which already lives on A1.4 "Your home's story", and the
   bedroom/bathroom totals, which A1.2 asks (shown here as a summary).

   Pattern (Mobbin refs: Zillow amenities sub-steps, Etsy listing editor
   tabs, Airbnb unanswered-by-default toggles): a sticky tab bar with a
   per-tab count / check, an overall answered bar, 5-10 questions per tab,
   "I'm not sure" offered inside every question and counted as answered,
   and a "Next: <tab>" control at the end of each tab. Tabs are never
   locked; Continue is always available.

   Options for the four dropdowns the screenshots only show closed (sq-ft
   source, roof materials, roof age, interior features) are standard MLS
   values standing in until the real lists are confirmed. */

const NOT_SURE = "I'm not sure";

const HOME_DETAILS_TABS = [
  {
    id: 'structure', label: 'Structure',
    items: [
      { heading: 'Basic home info' },
      { key: 'homeStyle', type: 'checks', label: 'Describe the style of your home', notSure: true,
        options: ['A-Frame', 'Barndominium', 'Cape Cod', 'Colonial', 'Contemporary', 'Cottage', 'Log', 'Ranch', 'Rustic', 'Split Foyer', 'Split Level', 'Traditional', 'Tudor', 'Victorian', 'Other'] },
      { key: 'stories', type: 'stepper', label: 'Number of stories', min: 1 },
      { heading: 'Estimated square footage' },
      { row: [
        { key: 'sqftMain', type: 'number', label: 'Main level', placeholder: '0', unit: 'sq ft' },
        { key: 'sqftTotal', type: 'number', label: 'Total sq. ft. of entire dwelling', optional: true, placeholder: '0', unit: 'sq ft' }
      ] },
      { key: 'sqftSource', type: 'select', label: 'Sq. ft. measurement source', placeholder: 'Select a source',
        options: ['Appraisal', 'Assessor / public records', 'Builder', 'Owner', 'Plans', 'Other', NOT_SURE] },
      { heading: 'Construction details' },
      { key: 'construction', type: 'checks', label: 'Construction type', notSure: true,
        options: ['All Brick', 'Partial Brick', 'Aluminum Side', 'Asbestos', 'Ext Insul Coating System', 'Fiber Cement', 'Frame', 'Hardboard', 'Insulated Concrete Foam', 'Log', 'Struct Insulated Panels', 'Stone', 'Stucco', 'Vinyl Siding', 'Wood Siding'] },
      { row: [
        { key: 'roofMaterial', type: 'select', label: 'Roof materials', placeholder: 'Select a material',
          options: ['Asphalt shingle', 'Metal', 'Tile', 'Slate', 'Wood shake', 'Rubber / membrane', 'Other', NOT_SURE] },
        { key: 'roofAge', type: 'select', label: 'Roof age', placeholder: 'Select an age',
          options: ['0–5 years', '6–10 years', '11–15 years', '16–20 years', '20+ years', NOT_SURE] }
      ] },
      { key: 'finishedAttic', type: 'toggle', label: 'Finished attic', options: ['Full', 'Partial', 'No'], notSure: true },
      { key: 'codeViolations', type: 'toggle', label: 'Are you aware of any potential code violations?', options: ['Yes', 'No'], notSure: true,
        reveal: { when: 'Yes', key: 'codeViolationsNotes', type: 'textarea', label: 'Tell us briefly what they are' } }
    ]
  },
  {
    id: 'rooms', label: 'Rooms',
    items: [
      { summary: 'rooms' },
      { key: 'primaryBedroom', type: 'toggle', label: 'Primary bedroom is…', notSure: true,
        options: ['On MAIN level', 'Accessible by stairs', 'Accessible by stairs AND elevator or lift'] },
      { heading: 'Main level', showIf: f => (f.stories || 1) > 1 },
      { row: [
        { key: 'mainBeds', type: 'stepper', label: 'Bedrooms', min: 0 },
        { key: 'mainFullBaths', type: 'stepper', label: 'Full baths', min: 0 },
        { key: 'mainHalfBaths', type: 'stepper', label: 'Half baths', min: 0 }
      ], showIf: f => (f.stories || 1) > 1 },
      { heading: 'Other spaces' },
      { key: 'separateDwelling', type: 'toggle', label: 'Is there a separate dwelling on the property?', options: ['Yes', 'No'], notSure: true },
      { key: 'basement', type: 'toggle', label: 'Is there a basement?', options: ['Yes', 'No'], notSure: true },
      { key: 'fireplace', type: 'toggle', label: 'Has a fireplace?', options: ['Yes', 'No', 'Yes, but it is non-functional'], notSure: true }
    ]
  },
  {
    id: 'interior', label: 'Interior',
    items: [
      { heading: 'Interior features' },
      { key: 'interiorFeatures', type: 'checks', label: 'Interior features', optional: true,
        options: ['Ceiling fan(s)', 'High ceilings', 'Walk-in closet(s)', 'Pantry', 'Built-in shelving', 'Wet bar', 'Smart thermostat', 'Extra storage'] },
      { key: 'flooring', type: 'checks', label: 'Flooring types', notSure: true,
        options: ['Bamboo/Cork', 'Carpet', 'Concrete', 'Finished Wood', 'Laminate', 'Marble', 'Parquet', 'Slate', 'Tile', 'Vinyl'] },
      { heading: 'Kitchen & laundry appliances' },
      { row: [
        { key: 'ovenSource', type: 'toggle', label: 'Oven source', options: ['Electric', 'Gas', 'None'], notSure: true },
        { key: 'rangeSource', type: 'toggle', label: 'Range source', options: ['Gas', 'Electric', 'None', 'Other'], notSure: true }
      ] },
      { row: [
        { key: 'ovenType', type: 'toggle', label: 'Oven description', options: ['Single', 'Double', 'Built-in', 'None', 'Other'], notSure: true },
        { key: 'rangeType', type: 'toggle', label: 'Range description', options: ['Stove', 'Built-in', 'Drop-in', 'Cooktop', 'None', 'Other'], notSure: true }
      ] },
      { key: 'appliances', type: 'checks', label: 'Other appliances', optional: true,
        options: ['Dishwasher', 'Disposal', 'Microwave', 'Compactor', 'Refrigerator', 'Ice Maker', 'Grill', 'Washer', 'Dryer', 'Other'] },
      { key: 'laundry', type: 'checks', label: 'Laundry connections', optional: true,
        options: ['Electric Dryer Hookup', 'Gas Dryer Hookup', 'Washer Hookup', 'Washer/Dryer included'] },
      { heading: 'Security' },
      { key: 'security', type: 'checks', label: 'Security features', optional: true,
        options: ['Smoke Detectors', 'Carbon Monoxide Detectors', 'Fire Alarm', 'Fire Sprinkler System', 'Security Gate', 'Security Guard', 'Security System', 'Other'] }
    ]
  },
  {
    id: 'exterior', label: 'Exterior',
    items: [
      { heading: 'Parking & outdoor spaces' },
      { key: 'parking', type: 'checks', label: 'Type of parking', options: ['Garage', 'Carport', 'Open Parking'] },
      { key: 'exteriorFeatures', type: 'checks', label: 'Exterior features', optional: true,
        options: ['Balcony', 'Barn', 'Garage Door Opener', 'Gas Grill', 'Guest House', 'Smart Camera(s) Recording', 'Smart Irrigation', 'Smart Light(s)', 'Smart Lock(s)', 'Sprinkler', 'Stable', 'Storage Building', 'Storm Shelter', 'Tennis Courts', 'Outdoor Kitchen'] },
      { key: 'patioPorch', type: 'checks', label: 'Patio and porch features', optional: true,
        options: ['Covered Deck', 'Covered Patio', 'Covered Porch', 'Deck', 'Patio', 'Porch', 'Screened Deck', 'Screened Patio', 'Screened Deck/Patio'] },
      { heading: 'Land & survey' },
      { callout: 'About easements', text: "An easement is someone else's right to use part of your land for a specific purpose — a shared driveway or a utility line, for example. In Tennessee they're most often created by an express grant, but can also arise by reservation, prescription, estoppel, eminent domain, or implication." },
      { key: 'easement', type: 'toggle', label: 'Is there an easement over your property?', options: ['Yes', 'No'], notSure: true,
        reveal: { when: 'Yes', key: 'easementNotes', type: 'textarea', label: 'Describe the easement, if you know it' } },
      { key: 'survey', type: 'toggle', label: 'Do you have a recent survey of your property?', options: ['Yes', 'No'], notSure: true },
      { heading: 'Swimming pool / hot tub' },
      { callout: 'Keep in mind', text: "A pool or hot tub that sits in the yard above ground is usually personal property, not a fixture. Leaving it can help the price — but if the buyer doesn't want it, you may need to remove it." },
      { key: 'pool', type: 'toggle', label: 'Is there a swimming pool or hot tub on the property?', options: ['No', 'Pool', 'Hot Tub', 'Pool and Hot Tub'] },
      { key: 'poolType', type: 'select', label: 'Pool/spa type', placeholder: 'Select a type', options: ['In-ground', 'Above-ground'],
        showIf: f => f.pool && f.pool !== 'No' },
      { row: [
        { key: 'poolHeated', type: 'toggle', label: 'Heated?', options: ['Yes', 'No'], notSure: true },
        { key: 'poolFenced', type: 'toggle', label: 'Fenced?', options: ['Yes', 'No'], notSure: true }
      ], showIf: f => f.pool && f.pool !== 'No' }
    ]
  },
  {
    id: 'extras', label: 'Extras',
    items: [
      { heading: 'Included & excluded items' },
      { key: 'includedItems', type: 'textarea', label: 'Included items that will convey with the property (items that stay)',
        hint: 'List items that will convey with the property (not attached to walls or structure).' },
      { key: 'excludedItems', type: 'textarea', label: 'Excluded items that will be removed prior to closing',
        hint: 'List personal items that will be removed prior to closing.' },
      { heading: 'Green features & accessibility' },
      { key: 'greenCert', type: 'checks', label: 'Green certifying body', optional: true, notSure: true,
        options: ['Earth Craft Certified Home', 'Energy Star Certified Home', 'Environments for Living - Diamond', 'Environments for Living - Gold', 'Environments for Living - Platinum', 'LEED Certified Home', 'NAHB Green Building Certified - Gold', 'NAHB Green Building Certified - Bronze', 'NAHB Green Building Certified - Silver'] },
      { key: 'accessibility', type: 'checks', label: 'Accessibility features', optional: true, notSure: true,
        options: ['Accessible Approach with Ramp', 'Accessible Doors', 'Accessible Elevator Installed', 'Accessible Entrance', 'Accessible Hallway', 'Exterior Wheelchair Lift', 'Smart Technology', 'Stair Lift'] }
    ]
  }
];

let homeDetailsTab = 'structure';

/* ---------- Answer bookkeeping ---------- */

function homeDetailsQuestions(tab, f) {
  const out = [];
  tab.items.forEach(item => {
    if (item.showIf && !item.showIf(f)) return;
    if (item.row) item.row.forEach(q => out.push(q));
    else if (item.key) out.push(item);
  });
  return out;
}

function isAnswered(q, f) {
  const v = f[q.key];
  if (Array.isArray(v)) return v.length > 0;
  return v !== undefined && v !== null && v !== '';
}

function tabProgress(tab, f) {
  const qs = homeDetailsQuestions(tab, f);
  return { done: qs.filter(q => isAnswered(q, f)).length, total: qs.length };
}

/* ---------- Question renderers ---------- */

function hdLabel(q) {
  return `${q.label}${q.optional ? ' <span class="field-optional">(Optional)</span>' : ''}`;
}

function hdChecks(q, f) {
  const selected = new Set(Array.isArray(f[q.key]) ? f[q.key] : []);
  const options = q.notSure ? [...q.options, NOT_SURE] : q.options;
  return `
    <div class="field">
      <label>${hdLabel(q)}</label>
      <div class="checkbox-grid" data-hd-checks="${q.key}">
        ${options.map(opt => `
          <label class="checkbox-row${opt === NOT_SURE ? ' not-sure-option' : ''}">
            <input type="checkbox" value="${opt}" ${selected.has(opt) ? 'checked' : ''} />
            ${opt}
          </label>`).join('')}
      </div>
    </div>`;
}

function hdRevealMarkup(q, f) {
  if (!q.reveal || f[q.key] !== q.reveal.when) return '';
  const r = q.reveal;
  return `<div class="field"><label for="hd-${r.key}">${r.label}</label><textarea id="hd-${r.key}" data-hd-text="${r.key}" rows="2">${f[r.key] || ''}</textarea></div>`;
}

function hdToggle(q, f) {
  const options = q.notSure ? [...q.options, NOT_SURE] : q.options;
  const reveal = hdRevealMarkup(q, f);
  return `
    <div class="question-card">
      <div class="question-header"><span class="p-sm font-semibold">${hdLabel(q)}</span></div>
      <div class="segmented" data-hd-toggle="${q.key}">
        ${options.map(v => `<button data-val="${v}" class="${f[q.key] === v ? 'active' : ''}">${v}</button>`).join('')}
      </div>
      ${reveal ? `<div class="question-card-reveal">${reveal}</div>` : ''}
    </div>`;
}

function hdSelect(q, f) {
  return `
    <div class="field">
      <label for="hd-${q.key}">${hdLabel(q)}</label>
      <select id="hd-${q.key}" data-hd-select="${q.key}">
        <option value="">${q.placeholder}</option>
        ${q.options.map(o => `<option value="${o}" ${f[q.key] === o ? 'selected' : ''}>${o}</option>`).join('')}
      </select>
    </div>`;
}

function hdNumber(q, f) {
  return `
    <div class="field">
      <label for="hd-${q.key}">${hdLabel(q)}</label>
      <input type="number" id="hd-${q.key}" data-hd-number="${q.key}" placeholder="${q.placeholder || ''}" value="${f[q.key] ?? ''}" />
    </div>`;
}

function hdTextarea(q, f) {
  return `
    <div class="field">
      <label for="hd-${q.key}">${hdLabel(q)}</label>
      <textarea id="hd-${q.key}" data-hd-text="${q.key}" rows="3">${f[q.key] || ''}</textarea>
      ${q.hint ? `<p class="field-hint">${q.hint}</p>` : ''}
    </div>`;
}

function hdStepper(q, f) {
  const val = f[q.key] ?? q.min ?? 0;
  return `
    <div class="stepper" data-hd-stepper="${q.key}" data-min="${q.min ?? 0}">
      <span class="stepper-label">${hdLabel(q)}</span>
      <div class="stepper-controls">
        <button class="stepper-btn" data-action="dec" aria-label="Decrease ${q.label}">${icon('minus', 20)}</button>
        <span class="stepper-value">${val}</span>
        <button class="stepper-btn" data-action="inc" aria-label="Increase ${q.label}">${icon('plus', 20)}</button>
      </div>
    </div>`;
}

const HD_RENDERERS = { checks: hdChecks, toggle: hdToggle, select: hdSelect, number: hdNumber, textarea: hdTextarea, stepper: hdStepper };

function hdRoomsSummary() {
  const b = listing.basics;
  const parts = [
    `${b.beds || 0} bedroom${b.beds === 1 ? '' : 's'}`,
    `${b.baths || 0} full bath${b.baths === 1 ? '' : 's'}`,
    `${b.halfBaths || 0} half bath${b.halfBaths === 1 ? '' : 's'}`
  ];
  return `
    <div class="card hd-summary">
      <div>
        <p class="p-sm text-muted">From Property basics</p>
        <p class="p-reg font-semibold">${parts.join(' · ')}</p>
      </div>
      <a href="#A1.2" class="btn-link">Edit</a>
    </div>`;
}

function hdItemMarkup(item, f) {
  if (item.showIf && !item.showIf(f)) return '';
  if (item.heading) return `<p class="section-label hd-heading">${item.heading.toUpperCase()}</p>`;
  if (item.callout) return `<div class="info-callout"><p class="info-callout-title">${icon('info', 16)} ${item.callout}</p><p class="info-callout-text">${item.text}</p></div>`;
  if (item.summary === 'rooms') return hdRoomsSummary();
  if (item.row) return `<div class="field-grid dense hd-row hd-row-${item.row.length}">${item.row.map(q => HD_RENDERERS[q.type](q, f)).join('')}</div>`;
  return HD_RENDERERS[item.type](item, f);
}

/* ---------- Tab bar ---------- */

function hdTabBarMarkup(f) {
  return `
    <div class="hd-tabs" role="tablist" aria-label="Home details sections">
      ${HOME_DETAILS_TABS.map((t, i) => {
        const p = tabProgress(t, f);
        const complete = p.total && p.done === p.total;
        const active = t.id === homeDetailsTab;
        return `
          <button class="hd-tab ${active ? 'active' : ''} ${complete ? 'complete' : ''}" role="tab" aria-selected="${active}" data-hd-tab="${t.id}">
            <span>${t.label}</span>
            <span class="hd-tab-count">${complete ? icon('check', 14) : `${p.done}/${p.total}`}</span>
          </button>`;
      }).join('')}
    </div>`;
}

function hdOverallMarkup(f) {
  const all = HOME_DETAILS_TABS.map(t => tabProgress(t, f));
  const done = all.reduce((s, p) => s + p.done, 0);
  const total = all.reduce((s, p) => s + p.total, 0);
  return `
    <div class="hd-overall">
      <div class="hd-overall-row">
        <span>Answer what you know — “${NOT_SURE}” counts as an answer.</span>
        <span class="hd-overall-count">${done} of ${total} answered</span>
      </div>
      <div class="hd-overall-bar"><span style="width:${total ? Math.round((done / total) * 100) : 0}%"></span></div>
    </div>`;
}

function hdTabNavMarkup() {
  const i = HOME_DETAILS_TABS.findIndex(t => t.id === homeDetailsTab);
  const prev = HOME_DETAILS_TABS[i - 1];
  const next = HOME_DETAILS_TABS[i + 1];
  return `
    <div class="hd-tab-nav">
      ${prev ? `<button class="btn btn-outline" data-hd-go="${prev.id}">${icon('arrow-left', 16)} ${prev.label}</button>` : '<span></span>'}
      ${next ? `<button class="btn btn-outline" data-hd-go="${next.id}">Next: ${next.label} ${icon('arrow-right', 16)}</button>` : ''}
    </div>`;
}

/* ---------- Screen ---------- */

function renderA15(root) {
  const f = listing.features;
  const tab = HOME_DETAILS_TABS.find(t => t.id === homeDetailsTab) || HOME_DETAILS_TABS[0];

  const body = `
    <div class="hd-head">
      ${hdOverallMarkup(f)}
      ${hdTabBarMarkup(f)}
    </div>
    <div class="hd-panel" role="tabpanel" id="hd-panel">
      ${tab.items.map(item => hdItemMarkup(item, f)).join('')}
      ${hdTabNavMarkup()}
    </div>
  `;

  root.innerHTML = workingScreenMarkup({
    eyebrow: 'Step 4 of 11 - Home & property details',
    title: 'Tell us about your home',
    description: 'Describe the structure, layout and features buyers will see.',
    bodyHtml: body
  }) + footerBarMarkup('Back', 'Continue', false);

  const save = () => { saveListing(); renderApp(); };

  const goTab = id => {
    homeDetailsTab = id;
    renderApp();
    const head = document.querySelector('.hd-head');
    if (head && head.getBoundingClientRect().top < 0) head.scrollIntoView({ block: 'start' });
  };
  const wireTabs = scope => scope.querySelectorAll('[data-hd-tab], [data-hd-go]').forEach(btn => {
    btn.addEventListener('click', () => goTab(btn.dataset.hdTab || btn.dataset.hdGo));
  });
  wireTabs(root);
  const activeTab = root.querySelector('.hd-tab.active');
  if (activeTab) activeTab.scrollIntoView({ block: 'nearest', inline: 'nearest' });

  /* Counts refresh in place so a blur never swallows the next click */
  const refreshCounts = () => {
    const head = root.querySelector('.hd-head');
    head.innerHTML = hdOverallMarkup(f) + hdTabBarMarkup(f);
    refreshIcons();
    wireTabs(head);
    refreshLivingCardRail();
  };

  /* "I'm not sure" is exclusive inside a checkbox group */
  root.querySelectorAll('[data-hd-checks]').forEach(group => {
    const key = group.dataset.hdChecks;
    group.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        let list = new Set(Array.isArray(f[key]) ? f[key] : []);
        if (cb.checked) {
          if (cb.value === NOT_SURE) list = new Set([NOT_SURE]);
          else { list.delete(NOT_SURE); list.add(cb.value); }
        } else list.delete(cb.value);
        f[key] = Array.from(list);
        save();
      });
    });
  });

  root.querySelectorAll('[data-hd-toggle]').forEach(group => {
    group.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
      f[group.dataset.hdToggle] = btn.dataset.val;
      save();
    }));
  });

  root.querySelectorAll('[data-hd-select]').forEach(sel => sel.addEventListener('change', () => {
    f[sel.dataset.hdSelect] = sel.value || undefined;
    save();
  }));

  /* Typing updates state quietly; the tab counts refresh on blur */
  root.querySelectorAll('[data-hd-number], [data-hd-text]').forEach(input => {
    const key = input.dataset.hdNumber || input.dataset.hdText;
    input.addEventListener('input', () => {
      f[key] = input.dataset.hdNumber ? (input.value === '' ? undefined : Number(input.value)) : input.value;
      saveListing();
    });
    input.addEventListener('change', refreshCounts);
  });

  root.querySelectorAll('[data-hd-stepper]').forEach(el => {
    const key = el.dataset.hdStepper;
    const min = Number(el.dataset.min);
    el.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
      const cur = f[key] ?? min;
      f[key] = Math.max(min, cur + (btn.dataset.action === 'inc' ? 1 : -1));
      save();
    }));
  });

  wireFooter(root, { onBack: () => navigateTo('A1.4'), onContinue: () => navigateTo('A1.6') });
}

registerScreen('A1.5', { type: 'working', render: renderA15 });
