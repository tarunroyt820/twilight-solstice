const viewButtons = document.querySelectorAll('[data-view]');
const panels = document.querySelectorAll('[data-view-panel]');

function activateView(viewName) {
  panels.forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.viewPanel === viewName);
  });

  viewButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.view === viewName);
  });
}

function syncFromHash() {
  const hash = window.location.hash.replace('#', '');
  const authAliases = new Set(['login', 'signup']);
  const nextView = authAliases.has(hash) ? 'auth' : hash || 'home';
  activateView(nextView);
}

viewButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const nextView = button.dataset.view;
    window.location.hash = nextView;
  });
});

window.addEventListener('hashchange', syncFromHash);
syncFromHash();