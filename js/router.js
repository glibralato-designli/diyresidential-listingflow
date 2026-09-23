/* Hash router. Screens register themselves into SCREENS before initApp() runs.
   Each screen def: { type: 'modal'|'fullbleed'|'working'|'preview', render(root) } */

const SCREENS = {};

function registerScreen(id, def) {
  SCREENS[id] = def;
}

function navigateTo(id) {
  if (location.hash === '#/' + id) { renderApp(); return; }
  location.hash = '#/' + id;
}

function currentScreenId() {
  const h = location.hash.replace(/^#\//, '');
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

  root.innerHTML = '';
  screen.render(root);
  refreshIcons();
  window.scrollTo(0, 0);
}

function initApp() {
  initNavOverlay();
  window.addEventListener('hashchange', renderApp);
  renderApp();
}
