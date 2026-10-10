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

  // The Work with us button is a quiet zone: no sticker lands on or around it,
  // from the pointer or the opening sweep, and the trail picks up fresh from
  // wherever it leaves rather than drawing a line of stickers back across it.
  const cta = area.querySelector('.hero-cta');
  function nearButton(x, y) {
    if (!cta) return false;
    const a = area.getBoundingClientRect();
    const r = cta.getBoundingClientRect();
    const scale = a.width / area.offsetWidth || 1;
    // half a sticker of clearance, matching --trail-size: clamp(64px, 7.5vw, 124px)
    const pad = Math.max(64, Math.min(window.innerWidth * 0.075, 124)) * 0.62;
    const left = (r.left - a.left) / scale, top = (r.top - a.top) / scale;
    const right = (r.right - a.left) / scale, bottom = (r.bottom - a.top) / scale;
    return x > left - pad && x < right + pad && y > top - pad && y < bottom + pad;
  }

  function trailTo(x, y) {
    if (nearButton(x, y)) { last = null; return; }
    if (!last) { spawn(x, y); last = { x: x, y: y }; return; }
    const gap = spacing();
    const dx = x - last.x, dy = y - last.y;
    const dist = Math.hypot(dx, dy);
    if (dist < gap) return;
    const steps = Math.min(4, Math.floor(dist / gap));
    for (let i = 1; i <= steps; i++) {
      const px = last.x + (dx * i) / steps, py = last.y + (dy * i) / steps;
      if (!nearButton(px, py)) spawn(px, py);
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

// About: a huge ABOUT US stretched edge to edge, and under it the paragraph on
// a wheel. The line facing you is plain black; the lines after it curve away
// below, each a step smaller and fainter. Off under reduced motion, and off
// until measured, so the lines stay a readable paragraph if this never runs.
(function () {
  const reel = document.getElementById('about-reel');
  const wheel = document.getElementById('about-wheel');
  const drum = document.getElementById('about-drum');
  const stage = reel && reel.querySelector('.about-stage');
  const title = document.getElementById('about-title');
  if (!reel || !wheel || !drum || !stage || !title || reduceMotion) return;

  const source = reel.parentElement.querySelector('.about-plain');
  const words = source ? source.textContent.trim().split(/\s+/) : [];
  if (!words.length) return;

  const TILT = 19;   // degrees between one line and the next
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let lines = [];
  let step = 60;
  let room = 400;
  let top = 0;
  let runway = 1;
  let ticking = false;

  function pageTop(el) {
    let y = 0;
    for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
    return y;
  }

  // the width of a string's letters at a given font, in px
  function inkWidth(text, cs, size) {
    ctx.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + size + 'px ' + cs.fontFamily;
    const m = ctx.measureText(text);
    return (m.actualBoundingBoxLeft || 0) + (m.actualBoundingBoxRight || m.width);
  }

  function split(boxWidth) {
    const per = Math.max(18, Math.round(boxWidth / 42));
    const out = [];
    let line = '';
    words.forEach(function (w) {
      const next = line ? line + ' ' + w : w;
      if (line && next.length > per) { out.push(line); line = w; } else { line = next; }
    });
    if (line) out.push(line);
    return out;
  }

  function build(boxWidth) {
    const text = split(boxWidth);
    if (text.length < 3) return false;
    if (lines.length === text.length && lines[0].textContent === text[0]) return true;
    drum.replaceChildren();
    lines = text.map(function (t) {
      const el = document.createElement('p');
      el.className = 'about-line';
      el.textContent = t;
      drum.appendChild(el);
      return el;
    });
    return true;
  }

  // Measured off the live element, not a canvas: canvas ignores font-stretch,
  // and this title is set at 125% width, so a canvas measure runs ~20% narrow
  // and the title ends up overflowing the page.
  function fitTitle(box) {
    const ink = title.querySelector('.about-title-ink');
    if (!ink) return;
    title.style.setProperty('--fit-title', '100px');
    const w = ink.getBoundingClientRect().width;
    if (w <= 0) return;
    // edge to edge, capped so it can never crowd out the wheel below it
    const size = Math.min(100 * (box * 0.96) / w, window.innerHeight * 0.3);
    title.style.setProperty('--fit-title', size.toFixed(1) + 'px');
  }

  // One size for every line, taken from the longest, so they read as one
  // paragraph rather than each being stretched to a different scale.
  function fitLines(box) {
    if (!lines.length) return false;
    const cs = getComputedStyle(lines[0]);
    let widest = 0;
    lines.forEach(function (el) { widest = Math.max(widest, inkWidth(el.textContent, cs, 100)); });
    if (widest <= 0) return false;
    const size = Math.min(100 * (box * 0.94) / widest, window.innerHeight * 0.088);
    lines.forEach(function (el) { el.style.setProperty('--fit', size.toFixed(2) + 'px'); });
    return true;
  }

  function measure() {
    reel.dataset.wheel = 'off';
    reel.style.marginBottom = '';
    const box = wheel.clientWidth || window.innerWidth;
    if (!build(box) || !fitLines(box)) return;
    step = lines[0].offsetHeight * 1.3;
    reel.dataset.wheel = 'on';
    fitTitle(stage.clientWidth || box);
    wheel.style.setProperty('--persp', Math.round(step * 13) + 'px');
    // each line gets its own stretch of scroll, with a ceiling so a phone's
    // many short lines don't turn the section into an endless runway
    reel.style.height = (1 + Math.min(lines.length * 0.42, 3.2)) * 100 + 'vh';
    // how far a line can rise above the facing position before it would run
    // into the bottom of the title
    room = drum.getBoundingClientRect().top - title.getBoundingClientRect().bottom;
    // When the paragraph ends, the last line sits mid-stage with the stage's
    // empty lower half still under it. Pull what follows up by exactly that much,
    // so Our values starts its usual distance below the last line instead of a
    // screen-half further down. Nothing is ever drawn there once the last line
    // is facing you, so the overlap is empty.
    reel.style.marginBottom = '0px';
    const sr = stage.getBoundingClientRect();
    const empty = sr.bottom - (drum.getBoundingClientRect().top + lines[0].offsetHeight);
    reel.style.marginBottom = -Math.max(0, Math.round(empty)) + 'px';
    top = pageTop(reel);
    runway = Math.max(1, reel.offsetHeight - window.innerHeight);
    render();
  }

  function render() {
    ticking = false;
    const p = Math.min(1, Math.max(0, (window.scrollY - top) / runway));
    const head = p * (lines.length - 1);
    lines.forEach(function (el, i) {
      const d = i - head;
      // Below the line facing you, each step down is smaller, fainter and more
      // tipped. Above it, a line greys to the same look as the first line
      // below and holds there, readable, all the way up to the title; only as
      // it reaches the title does it fade out.
      const far = d < 0 ? Math.min(-d, 1) : d;
      let o = Math.pow(0.42, far);
      const sc = Math.max(0.58, 1 - 0.1 * far);
      const ty = d * step;
      const rx = Math.max(-72, Math.min(72, d < 0 ? far * TILT : -d * TILT));
      // ease to nothing over the last line's height before the title, so the
      // giant ABOUT US never has text running through it
      if (d < 0) o *= Math.min(1, Math.max(0, (room + ty) / (step * 0.5)));
      el.style.setProperty('--o', o.toFixed(3));
      el.style.setProperty('--sc', sc.toFixed(3));
      el.style.setProperty('--ty', ty.toFixed(1) + 'px');
      el.style.setProperty('--rx', rx.toFixed(1) + 'deg');
    });
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(render); }
  }, { passive: true });

  let t = 0;
  window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(measure, 150); });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(measure);
  window.addEventListener('load', measure);
})();

// "Your agent could be…": the phrase swaps on a timer. Without this the markup
// already shows the whole list, so the section reads fine if it never runs.
(function () {
  const slot = document.getElementById('could-slot');
  if (!slot || reduceMotion) return;

  const phrases = [
    'a support agent', 'a trading agent', 'a companion', 'an onboarding guide',
    'a booking agent', 'a research assistant', 'a triage bot', 'a follow-up agent',
  ];
  let i = 0;
  let timer = 0;

  function show(text) {
    const next = document.createElement('span');
    next.className = 'could-word is-in';
    next.textContent = text;
    const prev = slot.firstElementChild;
    slot.appendChild(next);
    requestAnimationFrame(function () {
      next.classList.remove('is-in');
      next.classList.add('is-live');
      if (prev) {
        prev.classList.remove('is-live');
        prev.classList.add('is-out');
        window.setTimeout(function () { prev.remove(); }, 500);
      }
    });
  }

  function step() { i = (i + 1) % phrases.length; show(phrases[i]); }

  show(phrases[0]);

  // only burn frames while the section is actually on screen
  const io = new IntersectionObserver(function (entries) {
    const visible = entries[0].isIntersecting;
    window.clearInterval(timer);
    if (visible) timer = window.setInterval(step, 2300);
  }, { threshold: 0.2 });
  io.observe(slot);
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

// Value cards tilt toward the pointer, as if you were holding the card at that angle.
(function () {
  if (reduceMotion || !window.matchMedia('(hover: hover)').matches) return;
  const MAX = 14;
  document.querySelectorAll('[data-tilt]').forEach(function (card) {
    let frame = 0;
    card.addEventListener('pointermove', function (e) {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(function () {
        card.classList.add('is-tilting');
        card.style.setProperty('--ry', ((x - 0.5) * 2 * MAX).toFixed(2) + 'deg');
        card.style.setProperty('--rx', ((0.5 - y) * 2 * MAX).toFixed(2) + 'deg');
        card.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
      });
    });
    card.addEventListener('pointerleave', function () {
      cancelAnimationFrame(frame);
      card.classList.remove('is-tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
})();

// Stretch MANGO and STUDIOS across the hero with equal space on both sides. The letter shapes sit a little
// off-centre inside their text box, so size and centre them by the shapes themselves (canvas measureText).
(function () {
  const inner = document.getElementById('hero-inner');
  if (!inner) return;
  const words = [].slice.call(inner.querySelectorAll('[data-fit]'));
  const FILL = 0.9;
  const ctx = document.createElement('canvas').getContext('2d');
  function fit() {
    const w = inner.clientWidth;
    if (!w) return;
    words.forEach(function (el) {
      el.style.translate = '';
      el.style.fontSize = '10cqw';
      const boxWidth = el.getBoundingClientRect().width;
      if (!boxWidth) return;
      const cs = getComputedStyle(el);
      const px = parseFloat(cs.fontSize);
      ctx.font = cs.fontWeight + ' ' + px + 'px ' + cs.fontFamily;
      if ('fontStretch' in ctx) ctx.fontStretch = 'expanded';
      if ('letterSpacing' in ctx) ctx.letterSpacing = cs.letterSpacing;
      const m = ctx.measureText(el.textContent.toUpperCase());
      const ink = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
      // only trust the canvas if it measured the same font the page is showing
      if (ink > 0 && Math.abs(m.width - boxWidth) / boxWidth < 0.04) {
        el.style.fontSize = (10 * (w * FILL) / ink).toFixed(3) + 'cqw';
        const shift = (m.width - m.actualBoundingBoxRight + m.actualBoundingBoxLeft) / 2;
        el.style.translate = (shift / px).toFixed(4) + 'em 0';
      } else {
        el.style.fontSize = (10 * (w * FILL) / boxWidth).toFixed(3) + 'cqw';
      }
    });
  }
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(fit);
  window.addEventListener('load', fit);
  window.addEventListener('resize', function () { requestAnimationFrame(fit); });
})();

// Menu: the hamburger opens a panel that grows out of it; Esc, a click outside or picking a link closes it.
(function () {
  const btn = document.getElementById('menu-btn');
  const panel = document.getElementById('menu-panel');
  const scrim = document.getElementById('menu-scrim');
  if (!btn || !panel) return;
  let hideTimer = 0;
  panel.dataset.state = 'closed';
  function setOpen(open) {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    clearTimeout(hideTimer);
    document.body.classList.toggle('menu-open', open);
    if (open) {
      panel.hidden = false;
      if (scrim) scrim.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { panel.dataset.state = 'open'; }); });
    } else {
      panel.dataset.state = 'closed';
      hideTimer = setTimeout(function () { panel.hidden = true; if (scrim) scrim.hidden = true; }, 450);
    }
  }
  btn.addEventListener('click', function () { setOpen(panel.dataset.state !== 'open'); });
  panel.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('pointerdown', function (e) {
    if (panel.dataset.state === 'open' && !e.target.closest('.menu')) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.dataset.state === 'open') { setOpen(false); btn.focus(); }
  });
})();

// Team: while the stage is pinned, each card rides the rainbow in from one side, over the top and out the other.
(function () {
  const team = document.getElementById('team');
  const rainbow = document.getElementById('rainbow');
  if (!team || !rainbow || reduceMotion) return;
  const members = [].slice.call(team.querySelectorAll('.member'));
  const pin = team.querySelector('.team-pin');
  const grid = team.querySelector('.team-grid-bg');
  const now = document.getElementById('team-now');
  const ride = parseFloat(team.dataset.ride || 62);
  const n = members.length;
  team.classList.add('is-scrolly');
  let top = 0, vh = 1, arc = null, ticking = false;

  function measure() {
    top = 0;
    for (let el = team; el; el = el.offsetParent) top += el.offsetTop;
    vh = window.innerHeight;
    const p = pin.getBoundingClientRect(), r = rainbow.getBoundingClientRect();
    // the path runs along the middle band of the rainbow, in the pin's coordinates
    arc = {
      cx: r.left - p.left + r.width / 2,
      cy: r.bottom - p.top,
      rx: r.width / 2 - ride,
      ry: r.height - ride,
    };
    render();
  }
  function render() {
    ticking = false;
    if (!team.offsetParent || !arc) return;
    const p = (window.scrollY - top) / vh;
    members.forEach(function (m, i) {
      const u = (p - i - 0.5) * 2;               // -1 entering on the left, 0 at the top, 1 leaving on the right
      if (u < -1.05 || u > 1.05) { m.style.visibility = 'hidden'; return; }
      m.style.visibility = 'visible';
      const s = Math.sign(u) * Math.pow(Math.abs(u), 1.7); // lingers near the top
      const a = Math.PI / 2 - s * (Math.PI / 2 + 0.25);
      const x = arc.cx + arc.rx * Math.cos(a) - m.offsetWidth / 2;
      const y = arc.cy - arc.ry * Math.sin(a) - m.offsetHeight / 2;
      const edge = Math.max(0, Math.abs(u) - 0.7) / 0.3;
      m.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + (s * 16).toFixed(2) + 'deg) scale(' + (1 - Math.abs(s) * 0.12).toFixed(3) + ')';
      m.style.opacity = (1 - Math.min(1, edge)).toFixed(3);
    });
    if (now) now.textContent = String(Math.max(1, Math.min(n, Math.floor(p) + 1)));
    if (grid) grid.style.transform = 'translate3d(0,' + (-(p * 0.3 * 56) % 56).toFixed(1) + 'px,0)';
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(render); }
  }, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  window.addEventListener('hashchange', function () { setTimeout(measure, 0); });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(measure);
  measure();
})();

// Booking calendar. The hours are set in Toronto; every slot is built as an
// exact moment from those hours and then shown to the visitor in their own time
// zone, on their own calendar date. The request that reaches us carries both
// the Toronto time and theirs.
(function () {
  const roots = [].slice.call(document.querySelectorAll('[data-calendar]'));
  if (!roots.length) return;

  const HOME = 'America/Toronto';
  // Toronto hours a session can start at, by weekday (0 is Sunday). Sessions
  // are an hour long, so 7 PM is the last start and every call ends by the
  // 8 PM hard stop.
  const WEEKEND = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  const WEEKDAY = [16, 17, 18, 19];
  const START_HOURS = { 0: WEEKEND, 1: WEEKDAY, 2: WEEKDAY, 3: WEEKDAY, 4: [], 5: WEEKDAY, 6: WEEKEND };
  const NOTICE = 60 * 60 * 1000;   // nothing that starts within the hour
  const DAYS_AHEAD = 92;

  const homeParts = new Intl.DateTimeFormat('en-US', {
    timeZone: HOME, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  function partsAt(t) {
    const out = {};
    homeParts.formatToParts(new Date(t)).forEach(function (p) { out[p.type] = +p.value; });
    return out;
  }
  // how far Toronto's wall clock is from UTC at a given moment, in ms
  function offsetAt(t) {
    const p = partsAt(t);
    return Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute, p.second) - t;
  }
  // the exact moment of a Toronto wall-clock time, daylight saving included
  function homeTime(y, m, d, h) {
    const guess = Date.UTC(y, m, d, h);
    let t = guess - offsetAt(guess);
    const again = guess - offsetAt(t);
    if (again !== t) t = again;
    return t;
  }

  // every open slot from now on, as exact moments
  const now = Date.now();
  const start = partsAt(now);
  const slots = [];
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const day = new Date(Date.UTC(start.year, start.month - 1, start.day + i));
    START_HOURS[day.getUTCDay()].forEach(function (h) {
      const t = homeTime(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), h);
      if (t > now + NOTICE) slots.push(t);
    });
  }

  // grouped by the visitor's own calendar date
  function key(d) { return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }
  const byDay = {};
  slots.forEach(function (t) {
    const k = key(new Date(t));
    (byDay[k] = byDay[k] || []).push(t);
  });

  const zone = (function () {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (err) { return ''; }
  })();
  const zoneShort = (function () {
    const part = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(new Date())
      .find(function (p) { return p.type === 'timeZoneName'; });
    return part ? part.value : '';
  })();
  // Toronto itself, or anywhere that keeps the same clock all year
  const sameClock = zone === HOME || slots.every(function (t) { return offsetAt(t) === -new Date(t).getTimezoneOffset() * 60000; });

  const fmtMonth = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
  const fmtDay = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const fmtTime = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
  const fmtHome = new Intl.DateTimeFormat('en-US', { timeZone: HOME, weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  const localToday = new Date(); localToday.setHours(0, 0, 0, 0);
  const lastSlot = slots.length ? new Date(slots[slots.length - 1]) : localToday;

  roots.forEach(function mount(root) {
    const monthEl = root.querySelector('.cal-month');
    const daysEl = root.querySelector('.cal-days');
    const slotTitle = root.querySelector('.slots-title');
    const slotList = root.querySelector('.slot-list');
    const sum = root.querySelector('.book-sum');
    const choice = root.querySelector('.book-choice');
    const prev = root.querySelector('[data-step="-1"]');
    const next = root.querySelector('[data-step="1"]');

    // say which clock the times are on, right under the day they belong to
    let note = root.querySelector('.slots-zone');
    if (!note) {
      note = document.createElement('p');
      note.className = 'slots-zone';
      slotTitle.insertAdjacentElement('afterend', note);
    }
    note.textContent = sameClock
      ? 'Toronto time (' + zoneShort + ')'
      : 'Shown in your time zone (' + zoneShort + ')';

    let view = new Date(localToday.getFullYear(), localToday.getMonth(), 1);
    let picked = null;

    function sameDay(a, b) { return a && b && key(a) === key(b); }
    function slotsFor(d) { return byDay[key(d)] || []; }
    function monthIndex(d) { return d.getFullYear() * 12 + d.getMonth(); }

    function renderMonth() {
      monthEl.textContent = fmtMonth.format(view);
      prev.disabled = monthIndex(view) <= monthIndex(localToday);
      next.disabled = monthIndex(view) >= monthIndex(lastSlot);
      daysEl.textContent = '';
      // days from the neighbouring months fill out the first and last weeks, faded and not clickable
      function outside(d) {
        const el = document.createElement('span');
        el.className = 'cal-day cal-out';
        el.setAttribute('aria-hidden', 'true');
        el.textContent = String(d.getDate());
        daysEl.appendChild(el);
      }
      const lead = view.getDay();
      for (let i = lead; i > 0; i--) outside(new Date(view.getFullYear(), view.getMonth(), 1 - i));
      const last = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
      for (let day = 1; day <= last; day++) {
        const d = new Date(view.getFullYear(), view.getMonth(), day);
        const btn = document.createElement('button');
        btn.type = 'button';
        const today = sameDay(d, localToday);
        btn.className = 'cal-day' + (today ? ' is-today' : '');
        btn.textContent = String(day);
        const open = slotsFor(d).length > 0;
        btn.disabled = !open;
        btn.setAttribute('aria-label', fmtDay.format(d) + (today ? ', today' : '') + (open ? '' : ', unavailable'));
        btn.setAttribute('aria-pressed', String(sameDay(d, picked)));
        btn.addEventListener('click', function () { pickDay(d); });
        daysEl.appendChild(btn);
      }
      const trail = (7 - (lead + last) % 7) % 7;
      for (let i = 1; i <= trail; i++) outside(new Date(view.getFullYear(), view.getMonth() + 1, i));
    }

    function pickDay(d) {
      picked = d;
      renderMonth();
      slotTitle.textContent = fmtDay.format(d);
      slotList.textContent = '';
      slotsFor(d).forEach(function (t) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'slot';
        b.textContent = fmtTime.format(new Date(t));
        b.dataset.t = String(t);
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', function () { pickSlot(t); });
        slotList.appendChild(b);
      });
      sum.hidden = true;
    }

    function pickSlot(t) {
      [].forEach.call(slotList.children, function (b) { b.setAttribute('aria-pressed', String(+b.dataset.t === t)); });
      const at = new Date(t);
      const when = fmtDay.format(at) + ' at ' + fmtTime.format(at) + ' ' + zoneShort;
      // what reaches us: always Toronto time, plus theirs when it differs
      const home = fmtHome.format(at).replace(/, (\d)/, ' at $1') + ' Toronto time';
      const value = sameClock ? home : home + ' (their time: ' + when + (zone ? ', ' + zone : '') + ')';
      choice.textContent = when;
      // hand the chosen slot to whatever is listening; the booking happens on the site
      root.dispatchEvent(new CustomEvent('slotpick', { bubbles: true, detail: { when: when, value: value } }));
      sum.hidden = false;
    }

    prev.addEventListener('click', function () { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); renderMonth(); });
    next.addEventListener('click', function () { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); renderMonth(); });

    // Open on the next day that has a free time, so the times are showing from
    // the start instead of an empty panel asking you to pick a day.
    if (slots.length) {
      const first = new Date(slots[0]);
      first.setHours(0, 0, 0, 0);
      view = new Date(first.getFullYear(), first.getMonth(), 1);
      pickDay(first);
    } else {
      renderMonth();
    }
  });
})();

// The start flow: one full-screen takeover. Pick what you need, then either
// describe the project or book the consulting call. Both forms post to
// /api/send, which is the only place the Resend key exists; the page never sees
// it, and nothing is reported as sent unless the request actually succeeded.
(function () {
  const flow = document.getElementById('startflow');
  if (!flow || typeof flow.showModal !== 'function') return;

  const LINKEDIN_ICON = '<svg class="i i--fill" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>';

  const steps = {};
  [].forEach.call(flow.querySelectorAll('.flow-step'), function (el) { steps[el.dataset.step] = el; });
  let opener = null;
  let history = [];

  function show(name) {
    Object.keys(steps).forEach(function (key) { steps[key].hidden = key !== name; });
    const el = steps[name];
    if (!el) return;
    if (!reduceMotion) {
      el.classList.remove('is-entering');
      void el.offsetWidth;
      el.classList.add('is-entering');
    }
    flow.scrollTop = 0;
    const focusable = el.querySelector('.flow-back, .card, select, input:not([type="hidden"]), textarea');
    if (focusable) focusable.focus({ preventScroll: true });
  }

  function go(name) { history.push(name); show(name); }

  function openFlow(start, trigger) {
    opener = trigger || null;
    history = [];
    if (!flow.open) flow.showModal();
    go(start);
  }

  function pick(type) {
    if (type === 'AI Consulting') { go('book'); return; }
    flow.querySelectorAll('input[name="What do you need"]').forEach(function (r) { r.checked = r.value === type; });
    go('project');
  }

  flow.querySelectorAll('[data-pick]').forEach(function (btn) {
    btn.addEventListener('click', function () { pick(btn.getAttribute('data-pick')); });
  });

  flow.querySelectorAll('[data-flow-back]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      history.pop();
      show(history[history.length - 1] || 'pick');
      if (!history.length) history = ['pick'];
    });
  });

  flow.querySelectorAll('[data-flow-close]').forEach(function (btn) {
    btn.addEventListener('click', function () { flow.close(); });
  });
  flow.addEventListener('close', function () {
    if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    opener = null;
    // a finished form starts fresh next time
    flow.querySelectorAll('form.is-sent').forEach(function (form) { form._reset(); });
  });

  // every Start a project / Get a quote / Work with us button on the site
  document.querySelectorAll('[data-project-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const type = btn.getAttribute('data-project-type');
      openFlow('pick', btn);
      if (type) pick(type);
    });
  });

  // the consulting page's own calendar opens the flow straight at the booking
  // step with the chosen time already filled in
  const pageBook = document.querySelector('#booking .book-go');
  if (pageBook) {
    pageBook.addEventListener('click', function () { openFlow('book', pageBook); });
  }

  // any calendar, on the page or inside the flow, reports its pick here
  const slotField = document.getElementById('bf-slot');
  const slotLabel = document.getElementById('bf-when');
  document.addEventListener('slotpick', function (event) {
    if (!slotField) return;
    slotField.value = event.detail.value;
    if (slotLabel) slotLabel.textContent = event.detail.when;
  });

  flow.querySelectorAll('form[data-form]').forEach(function (form) {
    const body = form.querySelector('.flow-form-body');
    const done = form.querySelector('.flow-done');
    const status = form.querySelector('.formbox-status');
    const send = form.querySelector('.formbox-send');
    const label = send.innerHTML;
    let sending = false;

    form._reset = function () {
      form.reset();
      form.classList.remove('is-sent', 'was-validated');
      body.hidden = false;
      done.hidden = true;
      send.innerHTML = label;
      send.disabled = false;
      status.textContent = '';
      status.className = 'formbox-status';
      sending = false;
    };

    // every control in form order, blank ones included; a group of chips
    // counts once, as whichever one is picked
    function collect() {
      const seen = {};
      const fields = [];
      [].forEach.call(form.elements, function (el) {
        if (!el.name || el.type === 'submit' || el.type === 'button') return;
        if (el.type === 'radio') {
          if (seen[el.name]) return;
          seen[el.name] = true;
          const on = [].find.call(form.elements, function (x) { return x.name === el.name && x.checked; });
          fields.push({ label: el.name, value: on ? on.value : '' });
          return;
        }
        fields.push({ label: el.name, value: el.value });
      });
      return fields;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (sending) return;

      // our own message under each field, not the browser's tooltip
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        const first = form.querySelector('input:invalid, textarea:invalid');
        if (first) first.focus();
        return;
      }
      if (slotField && form.contains(slotField) && !slotField.value) {
        status.className = 'formbox-status is-bad';
        status.textContent = 'Pick a day and a time first.';
        const cal = form.querySelector('[data-calendar]');
        if (cal) cal.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
        return;
      }

      const fields = collect();
      sending = true;
      send.disabled = true;
      send.textContent = 'Sending…';
      status.textContent = '';
      status.className = 'formbox-status';

      fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form: form.dataset.form, fields: fields }),
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (!res.ok || !data.ok) {
            const err = new Error(data.error || 'That did not send.');
            err.fallback = !!data.fallback;
            throw err;
          }
        });
      }).then(function () {
        function get(name) {
          const f = fields.find(function (x) { return x.label === name; });
          return f ? f.value : '';
        }
        const first = get('Your name').trim().split(/\s+/)[0];
        const hi = 'Thanks' + (first ? ', ' + first : '') + '. ';
        // tell them the time on their own clock, the one they picked it in
        const when = get('Session') && slotLabel ? slotLabel.textContent : '';
        done.querySelector('.flow-done-text').textContent = when
          ? hi + 'We’ll confirm ' + when + ' by email to ' + get('Email') + '.'
          : hi + 'We’ll reply to ' + get('Email') + ' with a real price, usually within a day.';
        form.classList.add('is-sent');
        body.hidden = true;
        done.hidden = false;
        flow.scrollTop = 0;
        done.querySelector('.flow-done-title').focus({ preventScroll: true });
      }).catch(function (err) {
        status.className = 'formbox-status is-bad';
        status.textContent = err.message || 'That did not send. Please try again.';
        if (err.fallback) {
          // nothing is set up to receive this yet, so point them somewhere that works
          const link = document.createElement('a');
          link.href = 'https://www.linkedin.com/company/mango-studios1/';
          link.target = '_blank';
          link.rel = 'noopener';
          link.innerHTML = LINKEDIN_ICON + 'Reach us on LinkedIn';
          status.appendChild(link);
        }
        send.innerHTML = label;
        send.disabled = false;
        sending = false;
      });
    });
  });
})();

// After two minutes on the site, offer the readiness quiz once. Dismissing it,
// or taking the quiz, retires it for good. Storage can throw or come back empty
// in a private window, so a failure here just means they may see it again.
(function () {
  const nudge = document.getElementById('nudge');
  if (!nudge) return;

  const KEY = 'ms-nudge-seen';
  const DELAY = 120000;

  function seen() {
    try { return localStorage.getItem(KEY) === '1'; } catch (err) { return false; }
  }
  function remember() {
    try { localStorage.setItem(KEY, '1'); } catch (err) { /* nothing to do */ }
  }

  if (seen()) return;

  const timer = window.setTimeout(function () { nudge.hidden = false; }, DELAY);

  function dismiss() {
    window.clearTimeout(timer);
    remember();
    if (nudge.hidden) return;
    nudge.classList.add('is-going');
    window.setTimeout(function () { nudge.hidden = true; }, reduceMotion ? 0 : 300);
  }

  document.getElementById('nudge-x').addEventListener('click', dismiss);
  nudge.querySelector('.nudge-go').addEventListener('click', remember);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !nudge.hidden) dismiss();
  });
})();

// The menu marks the section in view on the home page.
(function () {
  const links = [].slice.call(document.querySelectorAll('.menu-links a[data-section]'));
  const map = { hero: '', about: 'about', services: 'services', apps: 'software', team: 'team', manifesto: 'manifesto', faq: 'faq', build: 'faq' };
  const targets = Object.keys(map).map(function (id) { return document.getElementById(id); }).filter(Boolean);
  if (!links.length || targets.length < 3) return;
  const inView = new Set();
  const spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) inView.add(entry.target); else inView.delete(entry.target);
    });
    // the pinned hero stays "in view" under About, so the latest section in page order wins
    const current = targets.filter(function (t) { return inView.has(t); }).pop();
    if (!current) return;
    const section = map[current.id];
    links.forEach(function (a) {
      if (a.dataset.section === section) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }, { rootMargin: '-50% 0px -50% 0px' });
  targets.forEach(function (t) { spy.observe(t); });
})();

// Tech stack popup: opened from the manifesto's spacebar and the AI crew card.
(function () {
  const dialog = document.getElementById('stack');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  let opener = null;
  document.querySelectorAll('[data-stack-open]').forEach(function (btn) {
    btn.addEventListener('click', function () { opener = btn; dialog.showModal(); });
  });
  dialog.querySelector('[data-stack-close]').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', function () { if (opener) opener.focus(); });
})();

// Service strip: repeat the set of services until the strip is always full, then loop by exactly one set,
// so the items keep the same gap and never leave an empty stretch.
(function () {
  const run = document.querySelector('.ticker-run');
  if (!run) return;
  const items = [].slice.call(run.children);
  const setSize = items.length / 2;
  const set = items.slice(0, setSize);
  const SPEED = 60; // px per second
  function build() {
    run.textContent = '';
    set.forEach(function (el) { run.appendChild(el); });
    const setWidth = run.scrollWidth;
    if (!setWidth) return;
    const need = run.parentElement.offsetWidth * 1.1 + setWidth;
    while (run.scrollWidth < need) {
      set.forEach(function (el) {
        const c = el.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        run.appendChild(c);
      });
    }
    run.style.setProperty('--tick-shift', -setWidth + 'px');
    run.style.setProperty('--tick-time', (setWidth / SPEED).toFixed(2) + 's');
  }
  let t = 0;
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(build);
  window.addEventListener('load', build);
  window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(build, 150); });
})();
