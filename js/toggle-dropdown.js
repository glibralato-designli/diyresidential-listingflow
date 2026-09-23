/* Responsive Toggle Groups. A .segmented group never wraps or stacks:
   on mobile, or whenever its buttons don't fit the row they sit in, it is
   swapped for a styled <select> with the same options. The select drives
   the original buttons (it just clicks the matching one), so every screen's
   existing click handlers keep working unchanged. */

const TOGGLE_MOBILE_QUERY = window.matchMedia('(max-width: 640px)');

function toggleGroupLabel(seg) {
  const field = seg.closest('.field, .question-card, .yn-row');
  if (!field) return '';
  const label = field.querySelector('label, .question-header > span, .yn-row > span:first-child');
  return label ? label.textContent.replace(/\s+/g, ' ').trim() : '';
}

function buildToggleSelect(seg) {
  const select = document.createElement('select');
  select.className = 'segmented-select';
  const label = toggleGroupLabel(seg);
  if (label) select.setAttribute('aria-label', label);
  select.addEventListener('change', () => {
    const btn = Array.from(seg.querySelectorAll('button')).find(b => (b.dataset.val ?? b.textContent.trim()) === select.value);
    if (btn) btn.click();
  });
  seg.after(select);
  return select;
}

function syncToggleSelect(seg, select) {
  const buttons = Array.from(seg.querySelectorAll('button'));
  const active = buttons.find(b => b.classList.contains('active'));
  select.innerHTML = `<option value="" disabled ${active ? '' : 'selected'}>Select</option>` +
    buttons.map(b => {
      const val = b.dataset.val ?? b.textContent.trim();
      return `<option value="${val}" ${b === active ? 'selected' : ''}>${b.textContent.trim()}</option>`;
    }).join('');
  select.classList.toggle('has-value', !!active);
}

/* Room the group has in its row: the parent's content box, minus any
   siblings that sit beside it in a horizontal flex row (their min-width
   for growable ones like an input or a flex:1 label). */
function toggleAvailableWidth(seg) {
  const parent = seg.parentElement;
  const cs = getComputedStyle(parent);
  let width = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  if (cs.display.includes('flex') && !cs.flexDirection.startsWith('column')) {
    const gap = parseFloat(cs.columnGap) || 0;
    Array.from(parent.children).forEach(sib => {
      if (sib === seg || sib.classList.contains('segmented-select')) return;
      const s = getComputedStyle(sib);
      if (s.display === 'none' || s.position === 'absolute') return;
      const grows = parseFloat(s.flexGrow) > 0;
      width -= (grows ? (parseFloat(s.minWidth) || 0) : sib.offsetWidth) + gap;
    });
  }
  return width;
}

function enhanceToggleGroups(root = document) {
  root.querySelectorAll('.segmented').forEach(seg => {
    const next = seg.nextElementSibling;
    const select = next && next.classList.contains('segmented-select') ? next : buildToggleSelect(seg);
    syncToggleSelect(seg, select);

    seg.classList.remove('is-collapsed');
    /* data-keep-toggle: short optional answers stay buttons on mobile when they fit */
    const forceOnMobile = TOGGLE_MOBILE_QUERY.matches && !seg.hasAttribute('data-keep-toggle');
    const collapse = forceOnMobile || seg.scrollWidth > toggleAvailableWidth(seg) + 1;
    seg.classList.toggle('is-collapsed', collapse);
    select.hidden = !collapse;
  });
}

let toggleResizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(toggleResizeTimer);
  toggleResizeTimer = setTimeout(() => enhanceToggleGroups(), 100);
});
