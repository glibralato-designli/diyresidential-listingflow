/* A1.6 — Utilities, on the same tabbed engine as Home details
   (renderTabbedForm in home-details.js). Every question from the production
   step (Figma section 6647:109144) except the school inputs, which moved to
   Address. Tabs: utility costs, heating & fuel, cooling & hot water, water &
   waste. Answers live in listing.utilities. */

const UTILITY_COMPANIES = [
  { key: 'electric', label: 'Electric' },
  { key: 'gas', label: 'Gas' },
  { key: 'water', label: 'Water' },
  { key: 'sewer', label: 'Sewer' },
  { key: 'trash', label: 'Trash' }
];

const UTILITIES_TABS = [
  {
    id: 'costs', label: 'Utility costs',
    items: [
      { heading: 'Utility companies & average monthly costs' },
      ...UTILITY_COMPANIES.map(u => ({ key: u.key, type: 'utility', label: u.label })),
      { type: 'utilityTotal' }
    ]
  },
  {
    id: 'heating', label: 'Heating & fuel',
    items: [
      { heading: 'Heating' },
      { key: 'hvacSystems', type: 'stepper', label: 'Number of HVAC systems', min: 0 },
      { key: 'heatType', type: 'checks', label: 'Type of heat', notSure: true,
        options: ['Base Board', 'Energy Star Unit(s)', 'Forced Air', 'Geothermal', 'Gravity Hot Air', 'Heat Pump Air', 'Heat Recovery System', 'Hot Water', 'Hydro Air', 'Passive Solar', 'Radiant', 'Radiator', 'Solar Thermal', 'Steam', 'None', 'See Remarks'] },
      { heading: 'Fuel' },
      { key: 'fuelType', type: 'checks', label: 'Type of fuel', notSure: true,
        options: ['Coal', 'Electric', 'Kerosene', 'Natural Gas', 'Oil Above Ground', 'Oil Below Ground', 'Propane', 'Solar', 'Wood', 'Other'] }
    ]
  },
  {
    id: 'cooling', label: 'Cooling & hot water',
    items: [
      { heading: 'Cooling' },
      { key: 'airConditioning', type: 'checks', label: 'Air conditioning', notSure: true,
        options: ['Air Purification System', 'Central', 'Ductless', 'Ductwork', 'Energy Star Unit(s)', 'Geothermal', 'High-Pressure System', 'SEER Rating 12+', 'Wall Units', 'Window Units', 'None'] },
      { heading: 'Hot water' },
      { key: 'hotWater', type: 'checks', label: 'Hot water', notSure: true,
        options: ['Electric Stand Alone', 'Fuel Oil Stand Alone', 'Gas Stand Alone', 'Geothermal', 'Indirect Tank', 'On-Demand', 'Solar Thermal', 'Tank Less Coil', 'None'] },
      { key: 'hotWaterTanks', type: 'stepper', label: 'Number of hot water tank(s)', optional: true, min: 0 }
    ]
  },
  {
    id: 'water', label: 'Water & waste',
    items: [
      { heading: 'Water source' },
      { key: 'waterSource', type: 'checks', label: 'Water', notSure: true,
        options: ['Community', 'Drilled Well', 'Dug Well', 'City/Municipal', 'Private', 'Seasonal', 'Shared', 'Spring', 'None', 'Other'] },
      { heading: 'Garbage' },
      { key: 'garbage', type: 'checks', label: 'Garbage', notSure: true,
        options: ['Private', 'Public', 'Other/See Remarks'] },
      { heading: 'Sewer / septic' },
      { key: 'sewerSeptic', type: 'checks', label: 'Sewer/Septic', notSure: true,
        options: ['Public Sewer', 'Step System', 'Septic In-Ground', 'Cesspool', 'Septic Above Ground', 'Other', 'None'] }
    ]
  }
];

/* One utility: company + monthly cost, or "I'm not sure" standing in for
   both (tapping it again clears it). Stored as {company, cost} or 'not-sure'. */
function hdUtility(q, f) {
  const val = f[q.key] || {};
  const notSure = val === 'not-sure';
  const obj = typeof val === 'object' ? val : {};
  return `
    <div class="utility-row" data-utility="${q.key}">
      <div class="field">
        <label>${q.label} — company name</label>
        <input type="text" data-u-field="company" value="${notSure ? '' : (obj.company || '')}" ${notSure ? 'disabled' : ''} />
      </div>
      <div class="field">
        <label>Avg. monthly cost</label>
        <div class="field-icon-input${notSure ? ' is-disabled' : ''}">
          ${icon('dollar-sign')}
          <input type="number" min="0" data-u-field="cost" placeholder="0" value="${notSure ? '' : (obj.cost ?? '')}" ${notSure ? 'disabled' : ''} />
        </div>
      </div>
      <div class="segmented utility-status" data-keep-toggle data-u-status="${q.key}" aria-label="${q.label} answer">
        <button data-val="not-sure" class="${notSure ? 'active' : ''}">${NOT_SURE}</button>
      </div>
    </div>`;
}

function utilityTotals(f) {
  let total = 0, entered = 0;
  UTILITY_COMPANIES.forEach(u => {
    const v = f[u.key];
    const cost = v && typeof v === 'object' ? Number(v.cost) : NaN;
    if (!Number.isNaN(cost) && v.cost !== '' && v.cost !== undefined) { total += cost; entered++; }
  });
  return { total, entered, of: UTILITY_COMPANIES.length };
}

function hdUtilityTotal(q, f) {
  const t = utilityTotals(f);
  return `
    <div class="utility-total" id="utility-total">
      <div>
        <p class="utility-total-title">Estimated combined monthly cost</p>
        <p class="utility-total-note">${t.entered < t.of
          ? `Partial total based on ${t.entered} of ${t.of} costs entered so far — self-reported average, actual costs may vary.`
          : 'Self-reported average — actual costs may vary.'}</p>
      </div>
      <p class="utility-total-amount">$${Math.round(t.total).toLocaleString()}<span>/mo</span></p>
    </div>`;
}

HD_RENDERERS.utility = hdUtility;
HD_RENDERERS.utilityTotal = hdUtilityTotal;

const utilitiesTabRef = { current: 'costs' };

function renderA16(root) {
  const u = listing.utilities;
  const finishAct1 = () => {
    if (!listing.progress.completedActs.includes(1)) {
      listing.progress.completedActs.push(1);
      saveListing();
    }
    navigateTo('A1.7');
  };

  renderTabbedForm(root, {
    tabs: UTILITIES_TABS,
    data: u,
    tabRef: utilitiesTabRef,
    ariaLabel: 'Utilities sections',
    eyebrow: 'Step 5 of 11 - Utilities',
    title: 'Utilities',
    description: "Share how the home is serviced. Nobody remembers every bill — mark what you're not sure of.",
    onBack: () => navigateTo('A1.5'),
    onContinue: finishAct1,
    onRefresh: scope => {
      const total = scope.querySelector('#utility-total');
      if (total) total.outerHTML = hdUtilityTotal(null, u);
    },
    wire: (scope, { save, refreshCounts }) => {
      scope.querySelectorAll('[data-utility]').forEach(row => {
        const key = row.dataset.utility;
        row.querySelectorAll('[data-u-field]').forEach(input => {
          input.addEventListener('input', () => {
            if (typeof u[key] !== 'object' || u[key] === null) u[key] = {};
            u[key][input.dataset.uField] = input.value;
            saveListing();
            if (input.dataset.uField === 'cost') {
              const total = scope.querySelector('#utility-total');
              if (total) total.outerHTML = hdUtilityTotal(null, u);
            }
          });
          input.addEventListener('change', refreshCounts);
        });
      });
      scope.querySelectorAll('[data-u-status]').forEach(group => {
        const key = group.dataset.uStatus;
        group.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
          u[key] = u[key] === btn.dataset.val ? {} : btn.dataset.val;
          save();
        }));
      });
    }
  });
}

registerScreen('A1.6', { type: 'working', render: renderA16 });
