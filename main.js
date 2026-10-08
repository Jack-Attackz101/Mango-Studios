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

// About: the paragraph reads like a teleprompter. The current line is black and
// centred, the lines after it sit below a little smaller and fainter, and
// scrolling greys the top one out and brings the next up. Off under reduced
// motion, and off until measured, so the lines stay a readable paragraph.
(function () {
  const reel = document.getElementById('about-reel');
  const wheel = document.getElementById('about-wheel');
  const drum = document.getElementById('about-drum');
  const stage = reel && reel.querySelector('.about-stage');
  if (!reel || !wheel || !drum || !stage || reduceMotion) return;

  const source = reel.parentElement.querySelector('.about-plain');
  const sliders = [].slice.call(stage.querySelectorAll('.about-title, .about-ghost'));
  const words = source ? source.textContent.trim().split(/\s+/) : [];
  if (!words.length) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let lines = [];
  let step = 60;
  let travel = 0;
  let top = 0;
  let runway = 1;
  let ticking = false;

  function pageTop(el) {
    let y = 0;
    for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
    return y;
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

  // One size for every line, taken from the longest, so the lines read as one
  // paragraph rather than each being stretched to a different scale.
  function fit() {
    const box = wheel.clientWidth;
    if (!box || !lines.length) return false;
    const probe = 100;
    const cs = getComputedStyle(lines[0]);
    ctx.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + probe + 'px ' + cs.fontFamily;
    let widest = 0;
    lines.forEach(function (el) {
      const m = ctx.measureText(el.textContent);
      widest = Math.max(widest, (m.actualBoundingBoxLeft || 0) + (m.actualBoundingBoxRight || m.width));
    });
    if (widest <= 0) return false;
    const size = Math.min(probe * (box * 0.94) / widest, window.innerHeight * 0.1);
    lines.forEach(function (el) { el.style.setProperty('--fit', size.toFixed(2) + 'px'); });
    return true;
  }

  function measure() {
    reel.dataset.wheel = 'off';
    if (!build(wheel.clientWidth || window.innerWidth) || !fit()) return;
    step = lines[0].offsetHeight * 1.34;
    reel.dataset.wheel = 'on';
    travel = Math.max(0, stage.clientWidth - sliders[0].offsetWidth - 24);
    reel.style.height = (1 + Math.min(lines.length * 0.42, 3.2)) * 100 + 'vh';
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
      // behind the current line: drifts up and dissolves. Ahead of it: stacked
      // below, each step smaller and fainter.
      const o = d < 0 ? Math.max(0, 1 + d * 1.5) : Math.pow(0.42, d);
      const sc = d <= 0 ? 1 : Math.max(0.58, 1 - 0.11 * d);
      const ty = d >= 0 ? d * step : d * step * 1.25;
      el.style.setProperty('--o', o.toFixed(3));
      el.style.setProperty('--sc', sc.toFixed(3));
      el.style.setProperty('--ty', ty.toFixed(1) + 'px');
    });
    const slide = (p * travel).toFixed(1) + 'px';
    sliders.forEach(function (el) { el.style.setProperty('--slide', slide); });
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

// Booking: pick a day, then a time, then send the request by email. Times are Toronto time.
(function () {
  const root = document.getElementById('booking');
  if (!root) return;
  // Fully open for now: every day of the week, hourly from 9 AM to 4 PM.
  const OPEN_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];
  const OPEN_HOURS = [9, 10, 11, 12, 13, 14, 15, 16];
  const MONTHS_AHEAD = 3;
  const TZ = 'America/Toronto';

  const monthEl = document.getElementById('cal-month');
  const daysEl = document.getElementById('cal-days');
  const slotTitle = document.getElementById('slots-title');
  const slotList = document.getElementById('slot-list');
  const sum = document.getElementById('book-sum');
  const choice = document.getElementById('book-choice');
  const go = document.getElementById('book-go');
  const prev = root.querySelector('[data-step="-1"]');
  const next = root.querySelector('[data-step="1"]');

  const todayParts = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()).split('-').map(Number);
  const today = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
  const nowHour = Number(new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', hourCycle: 'h23' }).format(new Date()));
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  let picked = null, pickedHour = null;

  const fmtMonth = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
  const fmtDay = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  function sameDay(a, b) { return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function hourLabel(h) { return (h % 12 || 12) + ':00 ' + (h < 12 ? 'AM' : 'PM'); }
  function hoursFor(d) {
    if (OPEN_WEEKDAYS.indexOf(d.getDay()) < 0 || d < today) return [];
    return OPEN_HOURS.filter(function (h) { return !sameDay(d, today) || h > nowHour; });
  }
  function monthOffset(d) { return (d.getFullYear() - today.getFullYear()) * 12 + d.getMonth() - today.getMonth(); }

  function renderMonth() {
    monthEl.textContent = fmtMonth.format(view);
    prev.disabled = monthOffset(view) <= 0;
    next.disabled = monthOffset(view) >= MONTHS_AHEAD;
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
      btn.className = 'cal-day' + (sameDay(d, today) ? ' is-today' : '');
      btn.textContent = String(day);
      const open = hoursFor(d).length > 0;
      btn.disabled = !open;
      btn.setAttribute('aria-label', fmtDay.format(d) + (sameDay(d, today) ? ', today' : '') + (open ? '' : ', unavailable'));
      btn.setAttribute('aria-pressed', String(sameDay(d, picked)));
      btn.addEventListener('click', function () { pickDay(d); });
      daysEl.appendChild(btn);
    }
    const trail = (7 - (lead + last) % 7) % 7;
    for (let i = 1; i <= trail; i++) outside(new Date(view.getFullYear(), view.getMonth() + 1, i));
  }
  function pickDay(d) {
    picked = d;
    pickedHour = null;
    renderMonth();
    slotTitle.textContent = fmtDay.format(d);
    slotList.textContent = '';
    hoursFor(d).forEach(function (h) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot';
      b.textContent = hourLabel(h);
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { pickHour(h); });
      slotList.appendChild(b);
    });
    sum.hidden = true;
  }
  function pickHour(h) {
    pickedHour = h;
    [].forEach.call(slotList.children, function (b) { b.setAttribute('aria-pressed', String(b.textContent === hourLabel(h))); });
    const when = fmtDay.format(picked) + ' at ' + hourLabel(h) + ' ET';
    choice.textContent = when;
    // hand the chosen slot to the booking form; the booking happens on the site
    const slotField = document.getElementById('bf-slot');
    const slotLabel = document.getElementById('bf-when');
    if (slotField) slotField.value = when + ' (Toronto time)';
    if (slotLabel) slotLabel.textContent = when;
    sum.hidden = false;
  }
  prev.addEventListener('click', function () { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); renderMonth(); });
  next.addEventListener('click', function () { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); renderMonth(); });
  renderMonth();
})();

// Booking and project forms. Both post to /api/send, which is the only place the
// Resend key exists; the page never sees it. Nothing is reported as sent unless
// the request actually succeeded.
(function () {
  const dialogs = [].slice.call(document.querySelectorAll('.formbox'));
  if (!dialogs.length || typeof HTMLDialogElement !== 'function') return;

  let opener = null;

  function open(dialog, trigger) {
    if (!dialog || typeof dialog.showModal !== 'function') return;
    opener = trigger || null;
    dialog.showModal();
    const first = dialog.querySelector('select, input:not([type="hidden"]), textarea');
    if (first) first.focus({ preventScroll: true });
  }

  document.querySelectorAll('[data-project-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const dialog = document.getElementById('project-form');
      const type = btn.getAttribute('data-project-type');
      const select = document.getElementById('pf-type');
      if (type && select) {
        [].forEach.call(select.options, function (o) { if (o.text === type) select.value = o.value; });
      }
      open(dialog, btn);
    });
  });

  const bookGo = document.getElementById('book-go');
  if (bookGo) {
    bookGo.addEventListener('click', function () {
      open(document.getElementById('booking-form'), bookGo);
    });
  }

  dialogs.forEach(function (dialog) {
    dialog.querySelectorAll('[data-form-close]').forEach(function (btn) {
      btn.addEventListener('click', function () { dialog.close(); });
    });
    // clicking the backdrop closes it
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', function () {
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
      opener = null;
    });

    const form = dialog.querySelector('form[data-form]');
    if (!form) return;
    const status = form.querySelector('.formbox-status');
    const send = form.querySelector('.formbox-send');
    let sending = false;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (sending) return;
      if (!form.reportValidity()) return;

      // every control on the form, in order, blank ones included
      const fields = [].slice.call(form.elements)
        .filter(function (el) { return el.name && el.type !== 'submit' && el.type !== 'button'; })
        .map(function (el) { return { label: el.name, value: el.value }; });

      sending = true;
      send.disabled = true;
      const label = send.innerHTML;
      send.textContent = 'Sending\u2026';
      status.textContent = '';
      status.className = 'formbox-status';

      fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form: form.dataset.form, fields: fields }),
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (!res.ok || !data.ok) throw new Error(data.error || 'That did not send.');
        });
      }).then(function () {
        form.classList.add('is-sent');
        status.className = 'formbox-status is-good';
        status.textContent = 'Sent. We\u2019ll be in touch by email.';
        send.textContent = 'Sent';
      }).catch(function (err) {
        status.className = 'formbox-status is-bad';
        status.textContent = err.message || 'That did not send. Please try again.';
        send.innerHTML = label;
        send.disabled = false;
        sending = false;
      });
    });
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
