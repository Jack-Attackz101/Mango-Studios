'use strict';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// About slides up over the pinned hero; the hero shrinks and dims underneath.
(function () {
  const stage = document.getElementById('stage');
  const hero = document.getElementById('hero');
  const heroInner = document.getElementById('hero-inner');
  const shade = document.getElementById('hero-shade');
  if (!stage || !heroInner || reduceMotion) return;

  let ticking = false;

  function render() {
    ticking = false;
    const vh = hero.offsetHeight;
    const y = window.scrollY - stage.offsetTop;
    const cover = Math.min(1, Math.max(0, y / vh));
    heroInner.style.transform = cover ? 'scale(' + (1 - cover * 0.06).toFixed(4) + ')' : '';
    heroInner.style.borderRadius = (cover * 44).toFixed(1) + 'px';
    shade.style.opacity = (cover * 0.45).toFixed(3);
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(render); }
  }, { passive: true });
  render();
})();

// Sticker trail: the icons repeat in order wherever the pointer travels over the hero.
(function () {
  const area = document.getElementById('hero-inner');
  const layer = document.getElementById('trail');
  if (!area || !layer) return;

  const ICONS = ['skull', 'hourglass', 'wink', 'camera', 'pizza', 'key', 'mug'].map(function (name) {
    const src = 'assets/trail-' + name + '.png';
    new Image().src = src;
    return src;
  });
  const MAX_LIVE = 40;

  let next = 0;
  let last = null;
  let userMoved = false;

  function spacing() {
    return Math.max(48, Math.min(area.clientWidth * 0.06, 100));
  }

  function spawn(x, y) {
    const img = document.createElement('img');
    img.src = ICONS[next];
    img.alt = '';
    next = (next + 1) % ICONS.length;
    const r = Math.random() * 36 - 18;
    img.style.setProperty('--x', x.toFixed(1) + 'px');
    img.style.setProperty('--y', y.toFixed(1) + 'px');
    img.style.setProperty('--r', r.toFixed(1) + 'deg');
    img.style.setProperty('--r0', (r - 25).toFixed(1) + 'deg');
    img.addEventListener('animationend', function () { img.remove(); });
    layer.appendChild(img);
    while (layer.childElementCount > MAX_LIVE) layer.firstElementChild.remove();
  }

  function trailTo(x, y) {
    if (!last) { spawn(x, y); last = { x: x, y: y }; return; }
    const gap = spacing();
    const dx = x - last.x, dy = y - last.y;
    const dist = Math.hypot(dx, dy);
    if (dist < gap) return;
    const steps = Math.min(4, Math.floor(dist / gap));
    for (let i = 1; i <= steps; i++) {
      spawn(last.x + (dx * i) / steps, last.y + (dy * i) / steps);
    }
    last = { x: x, y: y };
  }

  area.addEventListener('pointermove', function (e) {
    userMoved = true;
    const rect = area.getBoundingClientRect();
    const scale = rect.width / area.offsetWidth || 1;
    trailTo((e.clientX - rect.left) / scale, (e.clientY - rect.top) / scale);
  });
  area.addEventListener('pointerleave', function () { last = null; });

  // One lazy sweep across the hero on load, so the effect is visible before anyone moves.
  function intro() {
    const w = area.clientWidth, h = area.clientHeight;
    const start = performance.now(), duration = 1900;
    (function step(now) {
      if (userMoved) return;
      const t = Math.min(1, (now - start) / duration);
      const x = w * (0.08 + 0.84 * t);
      const y = h * 0.5 + Math.min(h * 0.3, w * 0.2) * Math.sin(t * Math.PI * 2.2 + 0.6);
      trailTo(x, y);
      if (t < 1) requestAnimationFrame(step);
      else last = null;
    })(start);
  }

  if (document.readyState === 'complete') setTimeout(intro, 400);
  else window.addEventListener('load', function () { setTimeout(intro, 400); });
})();
