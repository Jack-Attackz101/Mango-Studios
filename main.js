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

// Our software: one line that cycles through our apps, swapping the sticker icon each time.
(function () {
  const el = document.getElementById('app-cycle');
  if (!el) return;
  const APPS = [
    { name: 'Iris', kind: ', a macOS menu bar app for eye health', icon: 'assets/trail-hourglass.png' },
    { name: 'Alpine', kind: ', a platform that teaches kids to build software', icon: 'assets/trail-pencil.png' },
    { name: 'Klaritea', kind: ', a live SaaS product', icon: 'assets/trail-mug.png' },
    { name: 'Tvarit', kind: ', a live SaaS product', icon: 'assets/trail-camera.png' },
  ];
  APPS.forEach(function (a) { new Image().src = a.icon; });
  const icon = el.querySelector('.app-cycle-icon');
  const text = el.querySelector('.app-cycle-text');
  let i = 0, timer = 0;
  function show(app) {
    icon.src = app.icon;
    text.textContent = '';
    const b = document.createElement('b');
    b.textContent = app.name;
    text.append(b, app.kind);
  }
  function step() {
    i = (i + 1) % APPS.length;
    if (reduceMotion) { show(APPS[i]); return; }
    el.classList.add('is-swapping');
    setTimeout(function () { show(APPS[i]); el.classList.remove('is-swapping'); }, 320);
  }
  new IntersectionObserver(function (entries) {
    clearInterval(timer);
    if (entries[0].isIntersecting) timer = setInterval(step, 2600);
  }).observe(el);
})();

// Let's build: a 3D mango that turns slowly and can be dragged around. three.js loads only when it's near.
(function () {
  const box = document.getElementById('mango3d');
  if (!box) return;
  const LIBS = ['vendor/three/three.min.js', 'vendor/three/fflate.min.js', 'vendor/three/FBXLoader.js', 'vendor/three/OrbitControls.js'];
  const BLANK = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  function webgl() {
    try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
  }
  function load(src) {
    return new Promise(function (resolve, reject) {
      const s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  function start() {
    const THREE = window.THREE;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x6f9fc4, 0.85));
    const sun = new THREE.DirectionalLight(0xffffff, 1.15);
    sun.position.set(3, 5, 4);
    scene.add(sun);

    // three flat tones for a cartoon look
    const tones = new THREE.DataTexture(new Uint8Array([70, 150, 235]), 3, 1, THREE.RedFormat);
    tones.minFilter = tones.magFilter = THREE.NearestFilter;
    tones.needsUpdate = true;

    const manager = new THREE.LoadingManager();
    // the model references texture files that aren't bundled; hand it a blank pixel instead
    manager.setURLModifier(function (url) { return /\.(png|jpe?g|tga)$/i.test(url) ? BLANK : url; });
    new THREE.FBXLoader(manager).load(window.MANGO_FBX_URL || 'assets/mango.fbx', function (model) {
      const pivot = new THREE.Group();
      const bounds = new THREE.Box3().setFromObject(model);
      const size = bounds.getSize(new THREE.Vector3());
      const radius = size.length() / 2;
      model.position.sub(bounds.getCenter(new THREE.Vector3()));
      const meshes = [];
      model.traverse(function (o) { if (o.isMesh) meshes.push(o); });
      meshes.forEach(function (o) {
        if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();
        o.material = new THREE.MeshToonMaterial({ color: new THREE.Color(0xf9b435).convertSRGBToLinear(), gradientMap: tones });
        const outline = new THREE.Mesh(o.geometry, new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.BackSide }));
        outline.material.onBeforeCompile = function (shader) {
          shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
            'vec3 transformed = position + normal * ' + (radius * 0.022 / (o.getWorldScale(new THREE.Vector3()).x || 1)).toFixed(5) + ';');
        };
        o.add(outline);
      });
      pivot.add(model);
      scene.add(pivot);

      const dist = radius / Math.sin((camera.fov * Math.PI / 180) / 2) * 1.08;
      camera.position.set(0, radius * 0.15, dist);
      camera.near = dist / 50; camera.far = dist * 10; camera.updateProjectionMatrix();

      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.autoRotate = !reduceMotion;
      controls.autoRotateSpeed = 1.6;
      renderer.domElement.style.touchAction = 'pan-y';

      function resize() {
        const w = box.clientWidth, h = box.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h; camera.updateProjectionMatrix();
      }
      resize();
      new ResizeObserver(resize).observe(box);
      box.appendChild(renderer.domElement);
      box.classList.add('is-live');
      box.addEventListener('pointerdown', function () { box.classList.add('is-touched'); }, { once: true });

      let running = false;
      function frame() {
        if (!running) return;
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(frame);
      }
      new IntersectionObserver(function (entries) {
        const was = running;
        running = entries[0].isIntersecting;
        if (running && !was) requestAnimationFrame(frame);
      }).observe(box);
    }, undefined, function (err) { console.warn('3D mango failed to load; showing the flat mango.', err); });
  }

  if (!webgl()) return;
  const io = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    LIBS.reduce(function (p, src) { return p.then(function () { return load(src); }); }, Promise.resolve())
      .then(start)
      .catch(function (err) { console.warn('3D mango failed to start; showing the flat mango.', err); });
  }, { rootMargin: '600px 0px' });
  io.observe(box);
})();

// Stretch MANGO and STUDIOS across the hero. Sizes are in cqw, so one measurement holds at every width.
(function () {
  const inner = document.getElementById('hero-inner');
  if (!inner) return;
  const words = [].slice.call(inner.querySelectorAll('[data-fit]'));
  function fit() {
    const w = inner.clientWidth;
    if (!w) return;
    words.forEach(function (el) {
      el.style.fontSize = '10cqw';
      const measured = el.getBoundingClientRect().width;
      if (measured) el.style.fontSize = (10 * (w * 0.96) / measured).toFixed(3) + 'cqw';
    });
  }
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(fit);
  window.addEventListener('load', fit);
})();

// Menu: the hamburger opens a panel that grows out of it; Esc, a click outside or picking a link closes it.
(function () {
  const btn = document.getElementById('menu-btn');
  const panel = document.getElementById('menu-panel');
  if (!btn || !panel) return;
  let hideTimer = 0;
  panel.dataset.state = 'closed';
  function setOpen(open) {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    clearTimeout(hideTimer);
    if (open) {
      panel.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { panel.dataset.state = 'open'; }); });
    } else {
      panel.dataset.state = 'closed';
      hideTimer = setTimeout(function () { panel.hidden = true; }, 380);
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
  const EMAIL = 'hello@mangostudios.xyz';

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
    for (let i = 0; i < view.getDay(); i++) {
      const blank = document.createElement('span');
      blank.className = 'cal-blank';
      daysEl.appendChild(blank);
    }
    const last = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    for (let day = 1; day <= last; day++) {
      const d = new Date(view.getFullYear(), view.getMonth(), day);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal-day' + (sameDay(d, today) ? ' is-today' : '');
      btn.textContent = String(day);
      const open = hoursFor(d).length > 0;
      btn.disabled = !open;
      btn.setAttribute('aria-label', fmtDay.format(d) + (open ? ', open' : ', unavailable'));
      btn.setAttribute('aria-pressed', String(sameDay(d, picked)));
      btn.addEventListener('click', function () { pickDay(d); });
      daysEl.appendChild(btn);
    }
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
    go.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('AI Consulting session') +
      '&body=' + encodeURIComponent("Hi Mango Studios,\n\nI'd like to book an AI Consulting session on " + when + ' (Toronto time).\n\n');
    sum.hidden = false;
  }
  prev.addEventListener('click', function () { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); renderMonth(); });
  next.addEventListener('click', function () { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); renderMonth(); });
  renderMonth();
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
