/* State model — section 8 of the build spec, implemented verbatim.
   Everything derived (living card state, act segments, missing rows, photo slots)
   is computed fresh on every render from `listing`, never stored. */

const STORAGE_KEY = 'diy-listing-prototype-v1';

function defaultListing() {
  return {
    propertyType: null,
    propertyTypeOther: '',
    address: {
      line1: '', line2: '', city: '', state: '', zip: '',
      resolved: false,
      prefill: {
        sqft: 2450, lotSize: 3500, yearBuilt: 1998,
        beds: 3, baths: 2, garage: 2,
        confirmed: {}
      }
    },
    basics: {
      yearBuilt: null, sqft: null, lotSize: null, lotUnit: 'sqft',
      beds: 0, baths: 0, garage: 0, hoa: null
    },
    role: null,
    representedByAgent: null,
    agentFollowUp: {},
    contact: { firstName: '', lastName: '', phone: '', email: '', confirmEmail: '', prefMethod: null },
    roleDetails: {
      trustName: '',
      llc: { legalName: '', street: '', street2: '', city: '', state: '', zip: '', membersList: '', primaryContact: null },
      homeowners: [],
      showingsContact: null,
      occupancy: null,
      propertyReadiness: null
    },
    story: { driveway: '', willMiss: '', whyBought: '' },
    features: {},
    utilities: {},
    contracts: {},
    disclosures: {},
    media: { photos: {}, video: null, floorPlan: null, noFloorPlan: false },
    financial: { liens: null, mortgageBalance: null, photoReady: null, closingComments: '' },
    signing: { ownershipFile: null, docusignStatus: null, signed: false },
    price: null,
    progress: { currentAct: 1, currentScreen: 'A1.1', completedActs: [] }
  };
}

let listing = loadListing();

function loadListing() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultListing();
    const parsed = JSON.parse(raw);
    // shallow-merge over defaults so new fields added later don't break old saves
    const base = defaultListing();
    return deepMerge(base, parsed);
  } catch (e) {
    return defaultListing();
  }
}

function deepMerge(base, override) {
  if (typeof base !== 'object' || base === null || Array.isArray(base)) return override ?? base;
  const out = { ...base };
  for (const key in override) {
    out[key] = deepMerge(base[key], override[key]);
  }
  return out;
}

function saveListing() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(listing)); } catch (e) { /* storage blocked: keep in memory */ }
}

function resetListing() {
  listing = defaultListing();
  saveListing();
}

/* ---------------- Derived getters ---------------- */

const ACT_NAMES = {
  1: "Let's get to know your home",
  2: 'What buyers need to know',
  3: "Let's show it off",
  4: 'Price it and publish'
};

const ACT_STEPS = {
  1: [
    { id: 'A1.1', label: 'Address' },
    { id: 'A1.2', label: 'Property basics' },
    { id: 'A1.3', label: 'Contact & role' },
    { id: 'A1.4', label: "Your home's story" },
    { id: 'A1.5', label: 'Structure & features' },
    { id: 'A1.6', label: 'Schools & utilities' }
  ],
  2: [
    { id: 'A2.1', label: 'Service contracts' },
    { id: 'A2.2', label: 'Property details' },
    { id: 'A2.4', label: 'Property condition' },
    { id: 'A2.5', label: 'Financial & closing' }
  ],
  3: [
    { id: 'A3.1', label: 'Photos' },
    { id: 'A3.2', label: 'Video & floor plan' }
  ],
  4: [
    { id: 'A4.1', label: 'Review & valuation' },
    { id: 'A4.2', label: 'Ownership & signing' }
  ]
};

function isActComplete(actNum) {
  return listing.progress.completedActs.includes(actNum);
}

function actSegments() {
  return [1, 2, 3, 4].map(n => isActComplete(n));
}

function currentAct() {
  return listing.progress.currentAct;
}

function stepStatus(actNum, stepId) {
  const steps = ACT_STEPS[actNum];
  const idx = steps.findIndex(s => s.id === stepId);
  const currentIdx = steps.findIndex(s => s.id === listing.progress.currentScreen);
  if (isActComplete(actNum)) return 'done';
  if (stepId === listing.progress.currentScreen) return 'active';
  if (currentIdx === -1) return idx === 0 ? 'active' : 'todo';
  return idx < currentIdx ? 'done' : (idx === currentIdx ? 'active' : 'todo');
}

/* media.photos is keyed by slot id -> array of data-URL strings (0-10 each) */
function totalPhotoCount() {
  return Object.values(listing.media.photos).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
}

function firstPhoto() {
  for (const arr of Object.values(listing.media.photos)) {
    if (Array.isArray(arr) && arr.length) return arr[0];
  }
  return null;
}

/* Living card state machine */
function livingCardState() {
  if (totalPhotoCount() > 0) {
    if (isActComplete(1) && isActComplete(2) && isActComplete(3)) return 'complete';
    return 'photographed';
  }
  if (listing.address.resolved) return 'partial';
  return 'skeleton';
}

function livingCardData() {
  const state = livingCardState();
  const b = listing.basics;
  return {
    state,
    address: listing.address.resolved ? (listing.address.line1 || '') : null,
    city: listing.address.resolved ? [listing.address.city, listing.address.state].filter(Boolean).join(', ') : null,
    beds: b.beds || null,
    baths: b.baths || null,
    sqft: b.sqft || null,
    photo: firstPhoto(),
    priceLine: isActComplete(4) && listing.price ? `$${Number(listing.price).toLocaleString()}` : 'Set in Act 4'
  };
}

/* "What's missing" rows — up to four, six words each, one-word action */
function livingCardRows() {
  const rows = [];
  const b = listing.basics;

  rows.push(
    listing.story.driveway
      ? { label: 'Your story', action: 'Done', done: true }
      : { label: 'Your story', action: 'Continue', done: false }
  );

  rows.push(
    Object.keys(listing.features).length > 0
      ? { label: 'Structure & features', action: 'Done', done: true }
      : { label: 'Structure & features', action: 'Continue', done: false }
  );

  rows.push(
    totalPhotoCount() > 0
      ? { label: 'Photos', action: 'Done', done: true }
      : { label: 'Photos', action: 'Act 3', done: false }
  );

  rows.push(
    isActComplete(4)
      ? { label: 'Price', action: 'Done', done: true }
      : { label: 'Price', action: 'Act 4', done: false }
  );

  return rows.slice(0, 4);
}

/* Photo slots derive from beds/baths, capped at 10 each */
function photoSlotDefinitions() {
  const base = [
    { id: 'front-exterior', label: 'Front exterior', required: true },
    { id: 'rear-exterior', label: 'Rear exterior', required: true },
    { id: 'living-room', label: 'Living room', required: true },
    { id: 'kitchen', label: 'Kitchen', required: true }
  ];
  const beds = Math.min(listing.basics.beds || 1, 10);
  const baths = Math.min(listing.basics.baths || 1, 10);

  const bedSlots = [];
  for (let i = 1; i <= beds; i++) {
    bedSlots.push({
      id: `bedroom-${i}`,
      label: i === 1 ? 'Primary bedroom' : `Bedroom ${i}`,
      required: i <= 2
    });
  }

  const bathSlots = [];
  for (let i = 1; i <= baths; i++) {
    bathSlots.push({ id: `bathroom-${i}`, label: `Bathroom ${i}`, required: i === 1 });
  }

  return [...base, ...bedSlots, ...bathSlots];
}

/* Word-budget guard: cuts a string to a max word count rather than expanding it */
function capWords(str, max) {
  const words = str.trim().split(/\s+/);
  if (words.length <= max) return str;
  return words.slice(0, max).join(' ');
}
