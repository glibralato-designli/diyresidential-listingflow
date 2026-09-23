/* Hash router. Screens register themselves into SCREENS before initApp() runs.
   Each screen def: { type: 'modal'|'fullbleed'|'working'|'preview', render(root) } */

const SCREENS = {};
let lastRenderedScreen = null;

function registerScreen(id, def) {
  SCREENS[id] = def;
}

/* Routes are plain "#A1.2" tokens (the only hash form an Artifact link
   passes through); the older "#/A1.2" form still resolves. */
function navigateTo(id) {
  if (currentScreenId() === id && location.hash) { renderApp(); return; }
  location.hash = '#' + id;
}

function currentScreenId() {
  const h = location.hash.replace(/^#\/?/, '');
  return h || 'E1';
}

function renderApp() {
  const id = currentScreenId();
  const screen = SCREENS[id];
  const root = document.getElementById('screen-area');

  if (!screen) {
    root.innerHTML = `<div class="screen-fullbleed"><div class="fullbleed-inner"><p class="h2">Not built yet</p><p class="p-reg text-muted">Screen "${id}" isn't wired up in this prototype.</p></div></div>`;
    return;
  }

  // Track progress.currentScreen for act/step-in-progress screens (ids like A1.3)
  if (/^A\d\.\d/.test(id)) {
    listing.progress.currentScreen = id;
    const actNum = Number(id[1]);
    listing.progress.currentAct = actNum;
    saveListing();
  }

  document.body.dataset.screenType = screen.type;
  const stepsTrigger = document.getElementById('steps-trigger');
  stepsTrigger.hidden = !(screen.type === 'working' || screen.type === 'preview');
  document.getElementById('save-exit').hidden = stepsTrigger.hidden;

  /* Re-rendering the same screen (a toggle click, a checkbox) keeps the
     reader's place; only a real navigation starts at the top. */
  const sameScreen = lastRenderedScreen === id;
  const keepY = window.scrollY;
  lastRenderedScreen = id;

  root.innerHTML = '';
  screen.render(root);
  refreshIcons();
  enhanceToggleGroups(root);
  window.scrollTo(0, sameScreen ? keepY : 0);
  root.querySelectorAll('.act-cover-art img').forEach(img => { if (img.complete) img.classList.add('is-loaded'); });
  refreshCommentPins();
}

function initApp() {
  initNavOverlay();
  window.addEventListener('hashchange', renderApp);
  renderApp();
  initComments();
  /* Warm the act cover illustrations so each cover paints straight away */
  const warm = () => [1, 2, 3, 4].forEach(n => { const img = new Image(); img.src = `assets/images/act-${n}-cover.webp`; });
  if ('requestIdleCallback' in window) requestIdleCallback(warm); else setTimeout(warm, 1200);
}
