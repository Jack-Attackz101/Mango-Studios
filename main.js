/* ─────────────────────────────────────────────
   Mango Studios · main.js
   Count-up stats + mobile menu
   ───────────────────────────────────────────── */

'use strict';

/* ── Easing ── */
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/* ── Count-up ── */
function animateCount(valueEl, target, decimals, suffix, duration) {
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const current  = easeOutCubic(progress) * target;
    valueEl.textContent = current.toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

/* ── Observe stats ── */
const statEls = document.querySelectorAll('.stat[data-target]');

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el       = entry.target;
    const idx      = [...statEls].indexOf(el);
    const target   = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals, 10);
    const suffix   = el.dataset.suffix;
    const valueEl  = el.querySelector('.stat-value');
    const delay    = 480 + idx * 90;
    const duration = 1500 + idx * 80;

    setTimeout(() => animateCount(valueEl, target, decimals, suffix, duration), delay);
    statObserver.unobserve(el);
  });
}, { threshold: 0.25 });

statEls.forEach(el => statObserver.observe(el));

/* ── Mobile menu ── */
const burgerBtn   = document.getElementById('burger-btn');
const mobileMenu  = document.getElementById('mobile-menu');
const menuOverlay = document.getElementById('menu-overlay');

function openMenu() {
  burgerBtn.setAttribute('aria-expanded', 'true');
  mobileMenu.hidden  = false;
  menuOverlay.hidden = false;
  document.body.classList.add('menu-open');
  mobileMenu.querySelector('a')?.focus();
}

function closeMenu() {
  burgerBtn.setAttribute('aria-expanded', 'false');
  mobileMenu.hidden  = true;
  menuOverlay.hidden = true;
  document.body.classList.remove('menu-open');
}

if (burgerBtn) {
  burgerBtn.addEventListener('click', () => {
    burgerBtn.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
  });
}

if (menuOverlay) {
  menuOverlay.addEventListener('click', closeMenu);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && burgerBtn?.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    burgerBtn.focus();
  }
});

if (mobileMenu) {
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

window.addEventListener('resize', () => {
  if (window.innerWidth > 720) closeMenu();
}, { passive: true });
