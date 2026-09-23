/* Figma-style comment pins for every screen. Runs only inside the claude.ai
   Artifact (the `comments` capability); on GitHub Pages `window.claude` is
   absent and this file does nothing.

   Every screen renders into the same document, so the shell's own CSS-path
   anchors can't tell "Lot size on A1.2" from whatever sits at that path on
   A1.3. The page takes anchoring over (customAnchors) and names each spot
   itself:

     A1.2 "Lot size" #f-lotSize/0@42,60
     ^screen ^label   ^nearest id + child path  ^% offset inside that element

   Pins are placed only for threads on the screen being shown; the rest stay
   in the shell's comment list, and opening one from there navigates to its
   screen first. The shell draws every pin, card and composer. */

const COMMENT_ROOT_SCREEN = '*'; // anchors in the shared nav bar show on every screen

let commentsApi = null;      // the capability namespace
let commentAnchors = null;   // the customAnchors controller
let commentThreads = [];     // current thread list from the shell
let shellCommentMode = false;
let pagePlacing = false;     // the page's own "Comment" button is armed
let pendingReveal = null;    // thread id to scroll to after a navigation
let placeFrame = 0;

function commentModeOn() { return shellCommentMode || pagePlacing; }

/* ---------- Anchor names ---------- */

function commentLabelFor(el) {
  const field = el.closest('.field, .question-card, .yn-row, .stepper, .radio-row, .listing-card, .card, button, label');
  const source = field ? (field.querySelector('label, .question-header > span, .stepper-label, .listing-card-title') || field) : el;
  const text = (source.textContent || '').replace(/["\s]+/g, ' ').trim();
  return text.slice(0, 28) || el.tagName.toLowerCase();
}

function childPath(from, el) {
  const parts = [];
  while (el && el !== from) {
    parts.unshift(Array.prototype.indexOf.call(el.parentElement.children, el));
    el = el.parentElement;
  }
  return parts.join('.');
}

function buildCommentAnchor(el, clientX, clientY) {
  const host = el.closest('[id]') || document.body;
  const screen = document.getElementById('screen-area').contains(el) ? currentScreenId() : COMMENT_ROOT_SCREEN;
  const r = el.getBoundingClientRect();
  const px = Math.round(Math.min(100, Math.max(0, ((clientX - r.left) / (r.width || 1)) * 100)));
  const py = Math.round(Math.min(100, Math.max(0, ((clientY - r.top) / (r.height || 1)) * 100)));
  const where = `${host === document.body ? '' : '#' + host.id}/${childPath(host, el)}@${px},${py}`;

  let label = commentLabelFor(el);
  const enc = new TextEncoder();
  let name = `${screen} "${label}" ${where}`;
  while (enc.encode(name).length > 128 && label.length) {
    label = label.slice(0, -1);
    name = `${screen} "${label}" ${where}`;
  }
  return name;
}

const COMMENT_ANCHOR_RE = /^(\S+) "([^"]*)" (#[^/\s]+)?\/([\d.]*)@(\d+),(\d+)$/;

function parseCommentAnchor(name) {
  const m = COMMENT_ANCHOR_RE.exec(name);
  if (!m) return null;
  return { screen: m[1], hostId: m[3] ? m[3].slice(1) : null, path: m[4], px: +m[5], py: +m[6] };
}

function resolveCommentPoint(a) {
  let el = a.hostId ? document.getElementById(a.hostId) : document.body;
  if (!el) return null;
  if (a.path) {
    for (const i of a.path.split('.')) {
      el = el.children[Number(i)];
      if (!el) return null;
    }
  }
  const r = el.getBoundingClientRect();
  if (!r.width && !r.height) return null; // hidden (closed reveal, collapsed toggle)
  return {
    x: r.left + window.scrollX + (r.width * a.px) / 100,
    y: r.top + window.scrollY + (r.height * a.py) / 100
  };
}

function threadIsOnThisScreen(a) {
  return a && (a.screen === COMMENT_ROOT_SCREEN || a.screen === currentScreenId());
}

/* ---------- Placement ---------- */

function placeCommentPins() {
  if (!commentAnchors) return;
  const map = {};
  commentThreads.forEach(t => {
    const a = parseCommentAnchor(t.anchor);
    if (!threadIsOnThisScreen(a)) return;
    const pt = resolveCommentPoint(a);
    if (pt) map[t.id] = pt;
  });
  commentAnchors.placed(map);

  if (pendingReveal && map[pendingReveal]) {
    const y = map[pendingReveal].y - window.innerHeight / 3;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
    pendingReveal = null;
  }
}

function schedulePlaceCommentPins() {
  cancelAnimationFrame(placeFrame);
  placeFrame = requestAnimationFrame(placeCommentPins);
}

/* Called by the router after every screen render */
function refreshCommentPins() {
  if (commentAnchors) schedulePlaceCommentPins();
}

/* ---------- Comment gestures ---------- */

function commentTargetAt(clientX, clientY) {
  const el = document.elementFromPoint(clientX, clientY);
  if (!el || el.closest('[data-uncommentable]')) return null;
  return el;
}

function onCommentClick(ev) {
  if (!commentModeOn() || !commentAnchors) return;
  const el = commentTargetAt(ev.clientX, ev.clientY);
  if (!el) return;
  ev.preventDefault();
  ev.stopPropagation();
  clearCommentHover();
  const anchor = buildCommentAnchor(el, ev.clientX, ev.clientY);
  commentAnchors.compose(anchor, { x: ev.pageX, y: ev.pageY }).catch(() => {});
  setPagePlacing(false);
}

let commentHoverEl = null;
function clearCommentHover() {
  if (commentHoverEl) commentHoverEl.classList.remove('comment-hover');
  commentHoverEl = null;
}

function onCommentHover(ev) {
  if (!commentModeOn()) { clearCommentHover(); return; }
  const el = commentTargetAt(ev.clientX, ev.clientY);
  if (el === commentHoverEl) return;
  clearCommentHover();
  if (el && el !== document.body && el !== document.documentElement && el.id !== 'screen-area') {
    commentHoverEl = el;
    el.classList.add('comment-hover');
  }
}

function setPagePlacing(on) {
  pagePlacing = on;
  document.body.classList.toggle('comment-mode', commentModeOn());
  const fab = document.getElementById('comment-fab');
  if (fab) {
    fab.classList.toggle('active', on);
    fab.setAttribute('aria-pressed', String(on));
    fab.querySelector('.comment-fab-label').textContent = on ? 'Click anywhere to comment' : 'Comment';
  }
  if (!on && !shellCommentMode) clearCommentHover();
}

function commentFabMarkup() {
  return `
    <button class="comment-fab" id="comment-fab" type="button" aria-pressed="false" data-uncommentable>
      ${icon('message-square-plus', 16)}
      <span class="comment-fab-label">Comment</span>
    </button>`;
}

/* ---------- Boot ---------- */

async function initComments() {
  if (!window.claude || typeof window.claude.use !== 'function') return;
  commentsApi = await window.claude.use('comments');
  if (!commentsApi) return;

  try {
    commentAnchors = await commentsApi.customAnchors({
      mode(on) {
        shellCommentMode = on;
        if (!on) { commentThreads = []; setPagePlacing(false); }
        document.body.classList.toggle('comment-mode', commentModeOn());
        schedulePlaceCommentPins();
      },
      threads(list) {
        commentThreads = list;
        schedulePlaceCommentPins();
      },
      reveal(id) {
        const t = commentThreads.find(x => x.id === id);
        const a = t && parseCommentAnchor(t.anchor);
        if (!a) return;
        pendingReveal = id;
        if (a.screen !== COMMENT_ROOT_SCREEN && a.screen !== currentScreenId()) navigateTo(a.screen);
        else schedulePlaceCommentPins();
      },
      move(id, at) {
        const el = commentTargetAt(at.x - window.scrollX, at.y - window.scrollY);
        if (!el) return null;
        return { anchor: buildCommentAnchor(el, at.x - window.scrollX, at.y - window.scrollY), at };
      }
    });
  } catch (e) {
    commentAnchors = null; // not granted here: leave the shell's own anchoring on
    return;
  }

  document.body.insertAdjacentHTML('beforeend', commentFabMarkup());
  refreshIcons();
  document.getElementById('comment-fab').addEventListener('click', ev => {
    ev.stopPropagation();
    setPagePlacing(!pagePlacing);
  });

  document.addEventListener('click', onCommentClick, true);
  document.addEventListener('mousemove', onCommentHover, true);
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && pagePlacing) setPagePlacing(false); });
  new ResizeObserver(schedulePlaceCommentPins).observe(document.body);
  document.addEventListener('transitionend', schedulePlaceCommentPins, true);
  placeCommentPins(); // first report tells the shell the page is listening
}
