async function loadPartial(selector, path) {
  const el = document.querySelector(selector);
  if (!el) return;

  try {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    el.innerHTML = await res.text();
  } catch (err) {
    console.error(`Partial load failed: ${path}`, err);
  }
}

function getBasePath() {
  return document.body.dataset.base || './';
}

function initTheme() {
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');

  if (!themeToggle || !themeIcon) return;

  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  function applyTheme(theme) {
    body.classList.toggle('dark', theme === 'dark');
    themeIcon.textContent = theme === 'dark' ? '☀' : '◐';
    themeToggle.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'
    );
    localStorage.setItem('theme', theme);
  }

  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

  themeToggle.addEventListener('click', () => {
    applyTheme(body.classList.contains('dark') ? 'light' : 'dark');
  });
}

function normalizeHref(href) {
  return (href || '').replace(/\\/g, '/');
}

function setActiveNav() {
  const current = normalizeHref(window.location.pathname);
  const page = document.body.dataset.page || '';

  document.querySelectorAll('[data-nav]').forEach(link => {
    const href = normalizeHref(link.getAttribute('href') || '');
    const normalizedHref = href.replace(/^\.\.\//, '/').replace(/^\.\//, '/');
    const isByPage = page && link.dataset.nav === page;
    const isByPath = normalizedHref && current.endsWith(normalizedHref);
    link.classList.toggle('active', isByPage || isByPath);
  });
}

function shouldSkipPath(value) {
  return (
    !value ||
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('mailto:') ||
    value.startsWith('tel:') ||
    value.startsWith('data:') ||
    value.startsWith('#') ||
    value.startsWith('/')
  );
}

function rewriteAttributePath(element, attribute, base) {
  const value = element.getAttribute(attribute);
  if (shouldSkipPath(value)) return;
  element.setAttribute(attribute, `${base}${value}`);
}

function rewritePartialPaths(base) {
  document
    .querySelectorAll('#site-header a[href], #site-footer a[href], #site-bottom-nav a[href]')
    .forEach(el => rewriteAttributePath(el, 'href', base));

  document
    .querySelectorAll('#site-header img[src], #site-footer img[src], #site-bottom-nav img[src]')
    .forEach(el => rewriteAttributePath(el, 'src', base));
}

async function initLayout() {
  const base = getBasePath();

  await loadPartial('#site-header', `${base}partials/header.html`);
  await loadPartial('#site-footer', `${base}partials/footer.html`);
  await loadPartial('#site-bottom-nav', `${base}partials/bottom-nav.html`);

  rewritePartialPaths(base);
  initTheme();
  setActiveNav();
}

document.addEventListener('DOMContentLoaded', initLayout);