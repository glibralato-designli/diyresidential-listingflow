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

const hdStories = f => Number(f.stories) || 1;
const hdHas = (f, key, val) => Array.isArray(f[key]) && f[key].includes(val);
const hdIsUnit = () => ['condo', 'townhouse'].includes(listing.propertyType);
const UNIT_LEVELS = ['1st floor', '2nd floor', '3rd floor', '4th floor or higher', 'Other'];
const AGE_OPTIONS = ['0–5 years', '6–10 years', '11–15 years', '16–20 years', '20+ years', NOT_SURE];
const hdRoomRow = (prefix, title, showIf) => ({ title, showIf, row: [
  { key: `${prefix}Bedrooms`, type: 'stepper', label: 'Bedrooms', min: 0 },
  { key: `${prefix}FullBaths`, type: 'stepper', label: 'Full baths', min: 0 },
  { key: `${prefix}HalfBaths`, type: 'stepper', label: 'Half baths', min: 0 }
] });

const HOME_DETAILS_TABS = [
  {
    id: 'structure', label: 'Structure',
    items: [
      { heading: 'Basic home info' },
      { key: 'homeStyle', type: 'checks', label: 'Describe the style of your home', notSure: true,
        options: ['A-Frame', 'Barndominium', 'Cape Cod', 'Colonial', 'Contemporary', 'Cottage', 'Log', 'Ranch', 'Rustic', 'Split Foyer', 'Split Level', 'Traditional', 'Tudor', 'Victorian', 'Other'] },
      { key: 'stories', type: 'stepper', label: 'Number of stories', min: 1 },
      /* #556: say whether the story count includes a basement */
      { key: 'storiesIncludeBasement', type: 'toggle', label: 'Does this number of stories include a basement?', options: ['Yes', 'No', 'There is no basement'] },
      { key: 'unitLevel', type: 'toggle', label: 'On what level is this unit?', options: UNIT_LEVELS, notSure: true, showIf: hdIsUnit },
      { key: 'unitMainLevel', type: 'toggle', label: 'On what level is the main level of the unit?', options: UNIT_LEVELS, notSure: true, showIf: hdIsUnit },
      { heading: 'Estimated square footage' },
      { row: [
        { key: 'sqftMain', type: 'number', label: 'Main level', placeholder: '0', unit: 'sq ft' },
        { key: 'sqftSecond', type: 'number', label: '2nd Floor', placeholder: '0', unit: 'sq ft', showIf: f => hdStories(f) >= 2 },
        { key: 'sqftThird', type: 'number', label: '3rd Floor', placeholder: '0', unit: 'sq ft', showIf: f => hdStories(f) >= 3 }
      ] },
      { key: 'sqftTotal', type: 'number', label: 'Total sq. ft. of entire dwelling', optional: true, placeholder: '0', unit: 'sq ft' },
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
      { heading: 'Bedrooms & bathrooms' },
      { summary: 'rooms' },
      { key: 'primaryBedroom', type: 'toggle', label: 'Primary bedroom is…', notSure: true,
        options: ['On MAIN level', 'Accessible by stairs', 'Accessible by stairs AND elevator or lift'] },
      /* #205: elevator follow-up */
      { key: 'elevatorType', type: 'toggle', label: 'What kind of elevator or lift is it?', options: ['Elevator', 'Stair lift', 'Platform lift', 'Other'],
        showIf: f => f.primaryBedroom === 'Accessible by stairs AND elevator or lift' },
      { key: 'elevatorConveys', type: 'toggle', label: 'Does the elevator or lift stay with the home?', options: ['Yes', 'No'],
        showIf: f => f.primaryBedroom === 'Accessible by stairs AND elevator or lift' },
      { heading: 'Main level', showIf: f => (f.stories || 1) > 1 },
      { row: [
        { key: 'mainBeds', type: 'stepper', label: 'Bedrooms', min: 0 },
        { key: 'mainFullBaths', type: 'stepper', label: 'Full baths', min: 0 },
        { key: 'mainHalfBaths', type: 'stepper', label: 'Half baths', min: 0 }
      ], showIf: f => (f.stories || 1) > 1 },
      { heading: 'Second floor', showIf: f => hdStories(f) >= 2 },
      hdRoomRow('second', null, f => hdStories(f) >= 2),
      { heading: 'Third floor', showIf: f => hdStories(f) >= 3 },
      hdRoomRow('third', null, f => hdStories(f) >= 3),
      { heading: 'Other spaces' },
      { key: 'separateDwelling', type: 'toggle', label: 'Is there a separate dwelling on the property?', options: ['Yes', 'No'], notSure: true },
      hdRoomRow('sepDwelling', 'Separate dwelling', f => f.separateDwelling === 'Yes'),
      { key: 'basement', type: 'toggle', label: 'Is there a basement?', options: ['Yes', 'No'], notSure: true },
      { heading: 'Basement', showIf: f => f.basement === 'Yes' },
      { callout: 'About basements', showIf: f => f.basement === 'Yes',
        text: 'A basement is a level that sits fully or partly below ground. Only the finished and heated part counts toward the square footage buyers see; unfinished space is listed separately.' },
      { key: 'basementType', type: 'toggle', label: 'Basement Type', options: ['Full', 'Partial', 'Crawl Space', 'Walk-Out', 'Daylight', 'Other'], notSure: true, showIf: f => f.basement === 'Yes' },
      { key: 'basementDescription', type: 'checks', label: 'Basement Description', notSure: true, showIf: f => f.basement === 'Yes',
        options: ['Finished', 'Partially Finished', 'Unfinished', 'Exterior Entry', 'Interior Entry', 'Sump Pump', 'Storage Space', 'Other'] },
      { key: 'sqftBasement', type: 'number', label: 'Basement (Finished & Heated area)', placeholder: '0', showIf: f => f.basement === 'Yes' },
      { title: 'Basement rooms', showIf: f => f.basement === 'Yes', row: [
        { key: 'basementBedrooms', type: 'stepper', label: 'Bedrooms', min: 0 },
        { key: 'basementFullBaths', type: 'stepper', label: 'Full baths', min: 0 },
        { key: 'basementHalfBaths', type: 'stepper', label: 'Half baths', min: 0 }
      ] },
      { heading: 'Fireplace' },
      { key: 'fireplace', type: 'toggle', label: 'Has a fireplace?', options: ['Yes', 'No', 'Yes, but it is non-functional'], notSure: true },
      { key: 'fireplaceCount', type: 'stepper', label: 'Total number of Fireplaces', min: 0, showIf: f => ['Yes', 'Yes, but it is non-functional'].includes(f.fireplace) },
      { key: 'fireplaceFeatures', type: 'checks', label: 'Fireplace Features', optional: true, showIf: f => ['Yes', 'Yes, but it is non-functional'].includes(f.fireplace),
        options: ['Wood Burning', 'Gas', 'Gas Logs', 'Electric', 'Insert', 'Ventless', 'Brick', 'Stone', 'Living Room', 'Family Room', 'Bedroom', 'Outdoor', 'Other'] }
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
        { key: 'rangeSource', type: 'toggle', label: 'Range source', options: ['Gas', 'Electric', 'None', 'Other'], notSure: true, otherKey: 'rangeSourceOther' }
      ] },
      { row: [
        { key: 'ovenType', type: 'toggle', label: 'Oven description', options: ['Single', 'Double', 'Built-in', 'None', 'Other'], notSure: true, otherKey: 'ovenDescriptionOther' },
        { key: 'rangeType', type: 'toggle', label: 'Range description', options: ['Stove', 'Built-in', 'Drop-in', 'Cooktop', 'None', 'Other'], notSure: true, otherKey: 'rangeDescriptionOther' }
      ] },
      { key: 'appliances', type: 'checks', label: 'Other appliances', optional: true, otherKey: 'otherAppliancesOther',
        options: ['Dishwasher', 'Disposal', 'Microwave', 'Compactor', 'Refrigerator', 'Ice Maker', 'Grill', 'Washer', 'Dryer', 'Other'] },
      { key: 'laundry', type: 'checks', label: 'Laundry connections', optional: true,
        options: ['Electric Dryer Hookup', 'Gas Dryer Hookup', 'Washer Hookup', 'Washer/Dryer included'] },
      { heading: 'Security' },
      { key: 'security', type: 'checks', label: 'Security features', optional: true, otherKey: 'securityFeaturesOther',
        options: ['Smoke Detectors', 'Carbon Monoxide Detectors', 'Fire Alarm', 'Fire Sprinkler System', 'Security Gate', 'Security Guard', 'Security System', 'Other'] }
    ]
  },
  {
    id: 'exterior', label: 'Exterior',
    items: [
      { heading: 'Parking & outdoor spaces' },
      { key: 'parking', type: 'checks', label: 'Type of parking', options: ['Garage', 'Carport', 'Open Parking'] },
      { key: 'garageFeatures', type: 'checks', label: 'Garage Features', optional: true, showIf: f => hdHas(f, 'parking', 'Garage'),
        options: ['Attached', 'Detached', 'Front Entry', 'Side Entry', 'Rear Entry', 'Door Opener', 'Heated', 'Finished', 'Workshop', 'Storage', 'Other'] },
      { key: 'carportSpaces', type: 'stepper', label: 'Number of Carport Spaces', min: 0, showIf: f => hdHas(f, 'parking', 'Carport') },
      { key: 'carportFeatures', type: 'checks', label: 'Carport Features', optional: true, showIf: f => hdHas(f, 'parking', 'Carport'),
        options: ['Attached', 'Detached', 'Covered', 'Storage', 'Other'] },
      { key: 'openParkingFeatures', type: 'checks', label: 'Open Parking Features', optional: true, showIf: f => hdHas(f, 'parking', 'Open Parking'),
        options: ['Asphalt Driveway', 'Concrete Driveway', 'Gravel Driveway', 'Paved Driveway', 'Circular Driveway', 'Shared Driveway', 'Parking Pad', 'On Street', 'Off Street', 'Assigned Spaces', 'Guest Parking', 'RV/Boat Parking', 'Private Lot', 'Unpaved', 'Other'] },
      { key: 'exteriorFeatures', type: 'checks', label: 'Exterior features', optional: true,
        options: ['Balcony', 'Barn', 'Garage Door Opener', 'Gas Grill', 'Guest House', 'Smart Camera(s) Recording', 'Smart Irrigation', 'Smart Light(s)', 'Smart Lock(s)', 'Sprinkler', 'Stable', 'Storage Building', 'Storm Shelter', 'Tennis Courts', 'Outdoor Kitchen'] },
      { key: 'patioPorch', type: 'checks', label: 'Patio and porch features', optional: true,
        options: ['Covered Deck', 'Covered Patio', 'Covered Porch', 'Deck', 'Patio', 'Porch', 'Screened Deck', 'Screened Patio', 'Screened Deck/Patio'] },
      { heading: 'Land & survey' },
      { callout: 'About easements', text: "An easement is someone else's right to use part of your land for a specific purpose — a shared driveway or a utility line, for example. In Tennessee they're most often created by an express grant, but can also arise by reservation, prescription, estoppel, eminent domain, or implication." },
      { key: 'easement', type: 'toggle', label: 'Is there an easement over your property?', options: ['Yes', 'No'], notSure: true,
        reveal: { when: 'Yes', key: 'easementNotes', type: 'textarea', label: 'Describe the easement, if you know it' } },
      { key: 'survey', type: 'toggle', label: 'Do you have a recent survey of your property?', options: ['Yes', 'No'], notSure: true },
      { key: 'surveyFile', type: 'file', label: 'Upload your survey', accept: '.pdf,.jpg,.jpeg,.png', dropTitle: 'Choose your survey or drag & drop it here', hint: 'PDF, JPG or PNG', showIf: f => f.survey === 'Yes' },
      { heading: 'Swimming pool / hot tub' },
      { callout: 'Keep in mind', text: "A pool or hot tub that sits in the yard above ground is usually personal property, not a fixture. Leaving it can help the price — but if the buyer doesn't want it, you may need to remove it." },
      { key: 'pool', type: 'toggle', label: 'Is there a swimming pool or hot tub on the property?', options: ['No', 'Pool', 'Hot Tub', 'Pool and Hot Tub'] },
      { key: 'poolType', type: 'select', label: 'Pool/spa type', placeholder: 'Select a type', options: ['In-ground', 'Above-ground'],
        showIf: f => f.pool && f.pool !== 'No' },
      { row: [
        { key: 'poolHeated', type: 'toggle', label: 'Heated?', options: ['Yes', 'No'], notSure: true },
        { key: 'poolFenced', type: 'toggle', label: 'Fenced?', options: ['Yes', 'No'], notSure: true }
      ], showIf: f => f.pool && f.pool !== 'No' },
      { heading: 'Swimming pool', showIf: f => ['Pool', 'Pool and Hot Tub'].includes(f.pool) },
      { row: [
        { key: 'poolMaterial', type: 'select', label: 'Construction Material (swimming pool)', placeholder: 'Select a material',
          options: ['Concrete / Gunite', 'Fiberglass', 'Vinyl Liner', 'Steel', 'Aluminum', 'Resin', 'Other', NOT_SURE] },
        { key: 'poolAge', type: 'select', label: 'What is the age of the pool?', placeholder: 'Select an age', options: AGE_OPTIONS }
      ], showIf: f => ['Pool', 'Pool and Hot Tub'].includes(f.pool) },
      { key: 'poolAccessories', type: 'textarea', label: 'What accessories are you including with the pool?', optional: true, rows: 2,
        placeholder: 'e.g. cover, pump, robot cleaner, ladder', showIf: f => ['Pool', 'Pool and Hot Tub'].includes(f.pool) },
      { heading: 'Hot tub', showIf: f => ['Hot Tub', 'Pool and Hot Tub'].includes(f.pool) },
      { key: 'hotTubIncluded', type: 'toggle', label: 'Is the hot tub included with the sale of home?', options: ['Yes', 'No'], showIf: f => ['Hot Tub', 'Pool and Hot Tub'].includes(f.pool) },
      { row: [
        { key: 'hotTubAge', type: 'select', label: 'What is the age of the hot tub?', placeholder: 'Select an age', options: AGE_OPTIONS },
        { key: 'hotTubBrand', type: 'text', label: 'Hot tub brand and model', placeholder: 'e.g. Jacuzzi J-335' }
      ], showIf: f => ['Hot Tub', 'Pool and Hot Tub'].includes(f.pool) && f.hotTubIncluded === 'Yes' },
      { key: 'hotTubAccessories', type: 'textarea', label: 'What accessories are you including with the hot tub?', optional: true, rows: 2,
        placeholder: 'e.g. cover, steps, cover lifter', showIf: f => ['Hot Tub', 'Pool and Hot Tub'].includes(f.pool) && f.hotTubIncluded === 'Yes' }
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


/* ---------- Answer bookkeeping ---------- */

const hdVisible = (q, f) => !q.showIf || q.showIf(f);

/* A "repeat" item asks one field per unit counted elsewhere (e.g. one age
   per HVAC system); keys follow the catalog: hvacAge, hvacAge2, hvacAge3… */
function hdRepeatQuestions(q, f) {
  const count = Math.min(q.max || 5, Math.max(0, Number(f[q.countKey]) || 0));
  const out = [];
  for (let i = 1; i <= count; i++) {
    out.push({ key: i === 1 ? q.baseKey : `${q.baseKey}${i}`, type: q.fieldType || 'number', label: q.labelFor(i), placeholder: q.placeholder, options: q.options });
  }
  return out;
}

function hdCountable(items, f) {
  const out = [];
  items.forEach(item => {
    if (!hdVisible(item, f)) return;
    if (item.row) item.row.filter(q => hdVisible(q, f)).forEach(q => out.push(q));
    else if (item.type === 'repeat') hdRepeatQuestions(item, f).forEach(q => out.push(q));
    else if (item.key && item.type !== 'file') out.push(item);
  });
  return out;
}

function homeDetailsQuestions(tab, f) {
  return hdCountable(tab.items || [], f);
}

function isAnswered(q, f) {
  const v = f[q.key];
  if (Array.isArray(v)) return v.length > 0;
  if (v && typeof v === 'object') return Object.values(v).some(x => x !== '' && x !== null && x !== undefined);
  return v !== undefined && v !== null && v !== '';
}

function tabProgress(tab, f) {
  if (tab.progress) return tab.progress(f);
  const qs = homeDetailsQuestions(tab, f);
  return { done: qs.filter(q => isAnswered(q, f)).length, total: qs.length };
}

/* ---------- Question renderers ---------- */

function hdLabel(q) {
  return `${q.label}${q.optional ? ' <span class="field-optional">(Optional)</span>' : ''}`;
}

/* Picking "Other" on any choice opens a "Please type another option here"
   box underneath; its key follows the catalog (homeStyleOther, …). */
const OTHER_VALUES = ['Other', 'Other/See Remarks'];

function hdEsc(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function hdHasOther(q, f) {
  if (q.noOther) return false;
  const v = f[q.key];
  return (Array.isArray(v) ? v : [v]).some(x => OTHER_VALUES.includes(x));
}

function hdOtherMarkup(q, f) {
  if (!hdHasOther(q, f)) return '';
  const k = q.otherKey || `${q.key}Other`;
  return `
    <div class="field hd-other">
      <label for="hd-${k}">Please type another option here:</label>
      <input type="text" id="hd-${k}" data-hd-text="${k}" value="${hdEsc(f[k])}" />
    </div>`;
}

function hdChecks(q, f) {
  const selected = new Set(Array.isArray(f[q.key]) ? f[q.key] : []);
  const options = q.notSure ? [...q.options, NOT_SURE] : q.options;
  return `
    <div class="field">
      <label>${hdLabel(q)}</label>
      <div class="checkbox-grid${q.compact ? ' compact' : ''}" data-hd-checks="${q.key}">
        ${options.map(opt => `
          <label class="checkbox-row${opt === NOT_SURE ? ' not-sure-option' : ''}">
            <input type="checkbox" value="${opt}" ${selected.has(opt) ? 'checked' : ''} />
            ${opt}
          </label>`).join('')}
      </div>
      ${hdOtherMarkup(q, f)}
      ${q.hint ? `<p class="field-hint">${q.hint}</p>` : ''}
    </div>`;
}

function hdRevealMarkup(q, f) {
  if (!q.reveal) return '';
  const when = Array.isArray(q.reveal.when) ? q.reveal.when : [q.reveal.when];
  if (!when.includes(f[q.key])) return '';
  const r = q.reveal;
  return `<div class="field"><label for="hd-${r.key}">${r.label}</label><textarea id="hd-${r.key}" data-hd-text="${r.key}" rows="2">${f[r.key] || ''}</textarea></div>`;
}

function hdToggle(q, f) {
  const options = q.notSure ? [...q.options, NOT_SURE] : q.options;
  const reveal = hdRevealMarkup(q, f) + hdOtherMarkup(q, f);
  /* plain: label + toggle group with no card, so it lines up with inputs in a row */
  if (q.plain) return `
    <div class="field">
      <label>${hdLabel(q)}</label>
      <div class="segmented" data-hd-toggle="${q.key}">
        ${options.map(v => `<button data-val="${v}" class="${f[q.key] === v ? 'active' : ''}">${v}</button>`).join('')}
      </div>
      ${reveal}
    </div>`;
  return `
    <div class="question-card">
      <div class="question-header"><span class="p-sm font-semibold">${hdLabel(q)}</span>${typeof questionHelpMarkup === 'function' ? questionHelpMarkup(q.help) : ''}</div>
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
      ${hdOtherMarkup(q, f)}
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
      <textarea id="hd-${q.key}" data-hd-text="${q.key}" rows="${q.rows || 3}"${q.maxLength ? ` maxlength="${q.maxLength}"` : ''}${q.placeholder ? ` placeholder="${hdEsc(q.placeholder)}"` : ''}>${f[q.key] || ''}</textarea>
      ${q.hint ? `<p class="field-hint">${q.hint}</p>` : ''}
      ${q.maxLength ? `<p class="field-hint hd-char-count" data-hd-count-for="${q.key}">${(f[q.key] || '').length.toLocaleString()} / ${q.maxLength.toLocaleString()} characters</p>` : ''}
    </div>`;
}

function hdText(q, f) {
  return `
    <div class="field">
      <label for="hd-${q.key}">${hdLabel(q)}</label>
      <input type="${q.inputType || 'text'}" id="hd-${q.key}" data-hd-text="${q.key}" placeholder="${hdEsc(q.placeholder)}" value="${hdEsc(f[q.key])}" />
      ${q.hint ? `<p class="field-hint">${q.hint}</p>` : ''}
    </div>`;
}

/* Shared upload drop zone (the video-walkthrough style, Figma 5663:55437).
   opts: { id, inputAttrs, accept, title, hint, fileName, doneHint, compact } */
function dropzoneMarkup(o) {
  return `
    <label class="media-dropzone${o.fileName ? ' has-file' : ''}${o.compact ? ' is-compact' : ''}"${o.id ? ` id="${o.id}"` : ''}>
      ${o.fileName ? `
        <span class="media-dropzone-icon is-done">${icon('circle-check', 24)}</span>
        <span class="media-dropzone-title">${hdEsc(o.fileName)}</span>
        <span class="media-dropzone-hint">${o.doneHint || 'File added. Upload another to replace it.'}</span>` : `
        <span class="media-dropzone-icon">${icon('upload', 24)}</span>
        <span class="media-dropzone-title">${o.title}</span>
        <span class="media-dropzone-hint">${o.hint}</span>`}
      <span class="btn btn-outline media-dropzone-btn">${o.fileName ? 'Replace' : 'Upload'}</span>
      <input type="file" accept="${o.accept || ''}" ${o.inputAttrs || ''} hidden />
    </label>`;
}

/* Drag & drop onto a drop zone hands the file to onFile(file) */
function wireDropzone(zone, onFile) {
  if (!zone) return;
  ['dragenter', 'dragover'].forEach(t => zone.addEventListener(t, e => { e.preventDefault(); zone.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach(t => zone.addEventListener(t, () => zone.classList.remove('is-over')));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]);
  });
}

/* File field: the prototype keeps the file name only */
function hdFile(q, f) {
  return `
    <div class="field">
      <label>${hdLabel(q)}</label>
      ${dropzoneMarkup({ compact: true, accept: q.accept, inputAttrs: `data-hd-file="${q.key}"`, fileName: f[q.key],
        title: q.dropTitle || 'Choose a file or drag & drop it here', hint: q.hint || '' })}
    </div>`;
}

function hdRepeat(q, f) {
  const qs = hdRepeatQuestions(q, f);
  if (!qs.length) return '';
  return `<div class="field-grid dense hd-row hd-row-${Math.min(qs.length, 3)}">${qs.map(sub => HD_RENDERERS[sub.type](sub, f)).join('')}</div>`;
}

function hdStepper(q, f) {
  const val = f[q.key] ?? q.min ?? 0;
  return `
    <div class="stepper" data-hd-stepper="${q.key}" data-min="${q.min ?? 0}"${q.max !== undefined ? ` data-max="${q.max}"` : ''}>
      <span class="stepper-label">${hdLabel(q)}</span>
      <div class="stepper-controls">
        <button class="stepper-btn" data-action="dec" aria-label="Decrease ${q.label}">${icon('minus', 20)}</button>
        <span class="stepper-value">${val}</span>
        <button class="stepper-btn" data-action="inc" aria-label="Increase ${q.label}">${icon('plus', 20)}</button>
      </div>
    </div>`;
}

const HD_RENDERERS = { checks: hdChecks, toggle: hdToggle, select: hdSelect, number: hdNumber, textarea: hdTextarea, stepper: hdStepper, text: hdText, file: hdFile, repeat: hdRepeat };

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
  if (item.callout) return `<div class="info-callout"><p class="info-callout-title">${icon('info', 16)} ${item.callout}</p><p class="info-callout-text">${item.text}</p></div>`;
  if (item.summary === 'rooms') return hdRoomsSummary();
  if (item.html) return item.html(f);
  if (item.row) {
    const qs = item.row.filter(q => hdVisible(q, f));
    if (!qs.length) return '';
    return `${item.title ? `<p class="hd-row-title">${item.title}</p>` : ''}<div class="field-grid dense hd-row hd-row-${qs.length}">${qs.map(q => HD_RENDERERS[q.type](q, f)).join('')}</div>`;
  }
  return HD_RENDERERS[item.type](item, f);
}

/* Each heading opens a bordered block holding the questions under it */
function hdSectionsMarkup(items, f) {
  const sections = [];
  items.forEach(item => {
    if (item.showIf && !item.showIf(f)) return;
    if (item.heading || !sections.length) sections.push({ heading: item.heading, parts: [] });
    if (!item.heading) sections[sections.length - 1].parts.push(hdItemMarkup(item, f));
  });
  return sections.map(sec => formSectionMarkup(sec.heading, sec.parts.join(''))).join('');
}

/* ---------- Tabbed form engine (shared by Home details and Utilities) ----------
   cfg: { id, tabs, data, tabRef: { current }, eyebrow, title, description,
          onBack, onContinue, ariaLabel } — every screen gets the same sticky
   tab strip with per-tab counts, the overall answered bar, bordered blocks
   per heading, "I'm not sure" as an answer, and Skip beside Continue. */

function hdTabBarMarkup(cfg) {
  return `
    <div class="hd-tabs" role="tablist" aria-label="${cfg.ariaLabel}">
      ${cfg.tabs.map(t => {
        const p = tabProgress(t, cfg.data);
        const complete = p.total && p.done === p.total;
        const active = t.id === cfg.tabRef.current;
        return `
          <button class="hd-tab ${active ? 'active' : ''} ${complete ? 'complete' : ''}" role="tab" aria-selected="${active}" data-hd-tab="${t.id}">
            <span>${t.label}</span>
            <span class="hd-tab-count">${complete ? icon('check', 14) : `${p.done}/${p.total}`}</span>
          </button>`;
      }).join('')}
    </div>`;
}

function hdOverallMarkup(cfg) {
  const all = cfg.tabs.map(t => tabProgress(t, cfg.data));
  const done = all.reduce((s, p) => s + p.done, 0);
  const total = all.reduce((s, p) => s + p.total, 0);
  return `
    <div class="hd-overall">
      <div class="hd-overall-row">
        <span>${cfg.overallNote || `Answer what you know — “${NOT_SURE}” counts as an answer.`}</span>
        <span class="hd-overall-count">${done} of ${total} answered</span>
      </div>
      <div class="hd-overall-bar"><span style="width:${total ? Math.round((done / total) * 100) : 0}%"></span></div>
    </div>`;
}

function hdTabNavMarkup(cfg) {
  const i = cfg.tabs.findIndex(t => t.id === cfg.tabRef.current);
  const prev = cfg.tabs[i - 1];
  const next = cfg.tabs[i + 1];
  return `
    <div class="hd-tab-nav">
      ${prev ? `<button class="btn btn-outline" data-hd-go="${prev.id}">${icon('arrow-left', 16)} ${prev.label}</button>` : '<span></span>'}
      ${next ? `<button class="btn btn-outline" data-hd-go="${next.id}">Next: ${next.label} ${icon('arrow-right', 16)}</button>` : ''}
    </div>`;
}

/* Plain blocks of engine questions on hand-built screens: wrap them in a
   data-hd-scope and wire each scope against its own answers object. */
function hdBlockMarkup(scope, items, f) {
  return `<div class="hd-block" data-hd-scope="${scope}">${items.map(i => hdItemMarkup(i, f)).join('')}</div>`;
}

function wireHdScope(root, scope, f, onChange) {
  const el = root.querySelector(`[data-hd-scope="${scope}"]`);
  if (!el) return;
  wireHdInputs(el, f, {
    save: () => { if (onChange) onChange(); saveListing(); renderApp(); },
    refreshCounts: () => { if (onChange) onChange(); }
  });
}

function wireHdInputs(root, f, { save, refreshCounts }) {
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
    const counter = root.querySelector(`[data-hd-count-for="${key}"]`);
    input.addEventListener('input', () => {
      f[key] = input.dataset.hdNumber ? (input.value === '' ? undefined : Number(input.value)) : input.value;
      if (counter) counter.textContent = `${input.value.length.toLocaleString()} / ${Number(input.maxLength).toLocaleString()} characters`;
      saveListing();
    });
    input.addEventListener('change', refreshCounts);
  });

  root.querySelectorAll('[data-hd-file]').forEach(input => {
    input.addEventListener('change', () => {
      if (input.files[0]) { f[input.dataset.hdFile] = input.files[0].name; save(); }
    });
    wireDropzone(input.closest('.media-dropzone'), file => { f[input.dataset.hdFile] = file.name; save(); });
  });

  root.querySelectorAll('[data-hd-stepper]').forEach(el => {
    const key = el.dataset.hdStepper;
    const min = Number(el.dataset.min);
    const max = el.dataset.max !== undefined ? Number(el.dataset.max) : Infinity;
    el.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
      const cur = f[key] ?? min;
      f[key] = Math.min(max, Math.max(min, cur + (btn.dataset.action === 'inc' ? 1 : -1)));
      save();
    }));
  });
}

function renderTabbedForm(root, cfg) {
  const f = cfg.data;
  /* Tabs can be conditional (e.g. Lead paint only for pre-1978 homes) */
  cfg = { ...cfg, tabs: cfg.tabs.filter(t => !t.showIf || t.showIf(f)) };
  const tab = cfg.tabs.find(t => t.id === cfg.tabRef.current) || cfg.tabs[0];
  cfg.tabRef.current = tab.id;

  const body = `
    <div class="hd-head">
      ${hdOverallMarkup(cfg)}
      ${hdTabBarMarkup(cfg)}
    </div>
    <div class="hd-panel" role="tabpanel" id="hd-panel">
      ${tab.render ? tab.render(f) : ''}
      ${tab.items ? hdSectionsMarkup(tab.items, f) : ''}
      ${hdTabNavMarkup(cfg)}
    </div>
  `;

  root.innerHTML = workingScreenMarkup({
    eyebrow: cfg.eyebrow,
    title: cfg.title,
    description: cfg.description,
    bodyHtml: body
  }) + footerBarMarkup('Back', 'Continue', false, { skip: true });

  const save = () => { saveListing(); renderApp(); };

  const goTab = id => {
    cfg.tabRef.current = id;
    renderApp();
    const head = document.querySelector('.hd-head');
    /* Stuck under the header: bring the new tab's first question into view */
    if (head && head.parentElement.getBoundingClientRect().top < head.getBoundingClientRect().top - 1) head.scrollIntoView({ block: 'start' });
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
    head.innerHTML = hdOverallMarkup(cfg) + hdTabBarMarkup(cfg);
    refreshIcons();
    wireTabs(head);
    refreshLivingCardRail();
    if (cfg.onRefresh) cfg.onRefresh(root);
  };

  wireHdInputs(root, f, { save, refreshCounts });
  if (tab.wire) tab.wire(root, { save, refreshCounts });

  if (cfg.wire) cfg.wire(root, { save, refreshCounts });

  wireFooter(root, { onBack: cfg.onBack, onContinue: cfg.onContinue, onSkip: cfg.onContinue });
}

/* ---------- Screen ---------- */

const homeDetailsTabRef = { current: 'structure' };

function renderA15(root) {
  renderTabbedForm(root, {
    tabs: HOME_DETAILS_TABS,
    data: listing.features,
    tabRef: homeDetailsTabRef,
    ariaLabel: 'Home details sections',
    eyebrow: 'Step 4 of 11 - Home & property details',
    title: 'Tell us about your home',
    description: 'Describe the structure, layout and features buyers will see.',
    onBack: () => navigateTo('A1.4'),
    onContinue: () => navigateTo('A1.6')
  });
}

registerScreen('A1.5', { type: 'working', render: renderA15 });
