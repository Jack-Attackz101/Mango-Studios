'use strict';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// About slides up over the pinned hero; the hero shrinks and dims underneath.
(function () {
  const stage = document.getElementById('stage');
  const hero = document.getElementById('hero');
  const heroInner = document.getElementById('hero-inner');
  const shade = document.getElementById('hero-shade');
  const title = document.getElementById('hero-title');
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
    if (title) title.style.translate = '0 ' + (-cover * 8).toFixed(2) + 'vh';
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

  const ICONS = ['skull', 'hourglass', 'wink', 'camera', 'pencil', 'pizza', 'key', 'mug'].map(function (name) {
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

// Parallax: data-parallax moves an element vertically, data-drift horizontally, against scroll.
// Positions come from layout offsets (cached), so the movement never feeds back into the measurement.
(function () {
  if (reduceMotion) return;
  const els = [].slice.call(document.querySelectorAll('[data-parallax], [data-drift]'));
  if (!els.length) return;
  let items = [];
  let ticking = false;

  function pageTop(el) {
    let y = 0;
    for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
    return y;
  }
  function measure() {
    const narrow = window.innerWidth < 760;
    items = els.map(function (el) {
      return {
        el: el,
        mid: pageTop(el) + el.offsetHeight / 2,
        y: parseFloat(el.dataset.parallax || 0),
        x: narrow ? 0 : parseFloat(el.dataset.drift || 0),
      };
    });
    render();
  }
  function render() {
    ticking = false;
    const vh = window.innerHeight;
    const view = window.scrollY + vh / 2;
    items.forEach(function (it) {
      if (!it.el.offsetParent) return;
      const d = view - it.mid;
      if (Math.abs(d) > vh * 1.6) return;
      it.el.style.translate = (d * it.x).toFixed(1) + 'px ' + (d * it.y).toFixed(1) + 'px';
    });
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(render); }
  }, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  window.addEventListener('hashchange', function () { setTimeout(measure, 0); });
  measure();
})();

// App deck: deals one card at a time, loops, pauses while the pointer or focus is on it or it is off screen.
(function () {
  const list = document.getElementById('deck');
  if (!list) return;
  const deck = list.parentElement;
  const cards = [].slice.call(list.children);
  const count = document.getElementById('deck-count');
  const total = cards.length;
  let order = cards.slice();
  let index = 0;
  let timer = 0;
  let paused = false;
  let visible = false;

  function layout() {
    order.forEach(function (card, pos) {
      card.dataset.pos = String(pos);
      card.setAttribute('aria-hidden', pos === 0 ? 'false' : 'true');
    });
    count.textContent = (index + 1) + ' / ' + total;
  }
  function step(dir) {
    if (dir > 0) {
      const top = order.shift();
      top.classList.add('is-leaving');
      order.push(top);
      setTimeout(function () { top.classList.remove('is-leaving'); }, 380);
    } else {
      order.unshift(order.pop());
    }
    index = (index + dir + total) % total;
    layout();
  }
  function schedule() {
    clearInterval(timer);
    if (!paused && visible && !reduceMotion) timer = setInterval(function () { step(1); }, 5000);
  }

  deck.querySelectorAll('.deck-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { step(Number(btn.dataset.dir)); schedule(); });
  });
  deck.addEventListener('pointerenter', function () { paused = true; schedule(); });
  deck.addEventListener('pointerleave', function () { paused = false; schedule(); });
  deck.addEventListener('focusin', function () { paused = true; schedule(); });
  deck.addEventListener('focusout', function () { paused = false; schedule(); });
  new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
    schedule();
  }, { threshold: 0.3 }).observe(deck);
  layout();
})();
