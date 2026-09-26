import * as THREE from 'three';
import { OBJLoader } from './vendor/OBJLoader.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const OBJ_URL = 'assets/submarine.obj';
const OBJ_BYTES = 1303164; // fallback for progress when content-length is compressed/missing

document.body.classList.add('is-loading');
document.getElementById('year').textContent = new Date().getFullYear();

/* ------------------------------------------------------------------ */
/* Smooth scroll (Lenis) wired into GSAP's ticker                      */
/* ------------------------------------------------------------------ */
let lenis = null;
if (!reduceMotion && window.Lenis) {
  lenis = new window.Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
  window.ambLenis = lenis;
}

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const el = id.length > 1 ? document.querySelector(id) : document.body;
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { duration: 2.2, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  });
});

/* ------------------------------------------------------------------ */
/* Camera keyframes — spherical around a moving target                 */
/*   theta: azimuth from +Z (bow) toward +X (starboard)                */
/*   phi:   polar angle from +Y (0 = straight down from above)         */
/* ------------------------------------------------------------------ */
const KEYS = [
  { name: 'Surface',   r: 27,  phi: 1.47, theta: 0.80,  t: [0, 0.4, 0],   prop: 0.6, edges: 0 }, // hero 3/4
  { name: 'Bow',       r: 8.5, phi: 1.36, theta: 0.42,  t: [0, 0.1, 7.6], prop: 0.6, edges: 0 },
  { name: 'Broadside', r: 31,  phi: 1.52, theta: -1.57, t: [0, 0.8, 4],   prop: 0.8, edges: 0 },
  { name: 'Sail',      r: 8.5, phi: 0.92, theta: -0.75, t: [0, 3.0, 2.0], prop: 0.6, edges: 0 },
  { name: 'Keel',      r: 11,  phi: 2.30, theta: 0.55,  t: [0, -0.6, -1], prop: 0.8, edges: 0.25 },
  { name: 'Propulsor', r: 9.5, phi: 1.40, theta: 2.62,  t: [0, 0.0, -9.2], prop: 3.2, edges: 0 },
  { name: 'Plan',      r: 32,  phi: 0.06, theta: 1.571, t: [0, 0, -4.8],     prop: 1.0, edges: 1 },
  { name: 'Ascent',    r: 30,  phi: 1.22, theta: 2.35,  t: [0, 0.5, 0],   prop: 0.7, edges: 0.15 },
];

/* ------------------------------------------------------------------ */
/* Renderer + scene                                                   */
/* ------------------------------------------------------------------ */
const canvas = document.getElementById('scene');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (err) {
  console.warn('WebGL unavailable', err);
}

const loaderEl = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderPct = document.getElementById('loader-pct');
const setProgress = (p) => {
  loaderBar.style.strokeDashoffset = String(327 * (1 - p));
  loaderPct.textContent = String(Math.round(p * 100)).padStart(3, '0');
};

if (!renderer) {
  finishLoading();
  initDom();
} else {
  initScene();
}

function initScene() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const surfaceCol = new THREE.Color('#0d4254');
  const abyssCol = new THREE.Color('#02080d');
  const waterCol = surfaceCol.clone();
  scene.fog = new THREE.FogExp2(waterCol, 0.018);
  renderer.setClearColor(waterCol);

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 400);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.45;

  scene.add(new THREE.HemisphereLight(0x5fb4c9, 0x04070a, 1.1));
  const key = new THREE.DirectionalLight(0xbfefff, 2.6);
  key.position.set(6, 22, 10);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffae62, 2.4);
  rim.position.set(-12, -3, -16);
  scene.add(rim);
  const rim2 = new THREE.DirectionalLight(0x6fd6e8, 1.4);
  rim2.position.set(14, 2, -6);
  scene.add(rim2);

  /* ---------------- Submarine ---------------- */
  const sub = new THREE.Group();
  const propeller = new THREE.Group();
  const bob = new THREE.Group();
  bob.add(sub);
  scene.add(bob);

  const hullMat = new THREE.MeshStandardMaterial({ color: 0x1a2227, metalness: 0.55, roughness: 0.42 });
  const detailMat = new THREE.MeshStandardMaterial({ color: 0x2a343a, metalness: 0.6, roughness: 0.35 });
  const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xc08a4c, metalness: 1, roughness: 0.28 });
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x6fd6e8, transparent: true, opacity: 0, depthWrite: false, fog: false });
  const PROP_PARTS = new Set(['01_low', '09_low', '10_low', '11_low', '12_low', '13_low', '14_low', '15_low', '16_low']);

  /* ---------------- Orbiting summary ring ---------------- */
  const ring = buildTextRing();
  scene.add(ring.group);

  /* ---------------- Marine snow ---------------- */
  const snow = buildSnow();
  scene.add(snow.points);

  /* ---------------- Load OBJ with real progress ---------------- */
  loadText(OBJ_URL, setProgress)
    .then((text) => {
      const obj = new OBJLoader().parse(text);
      const box = new THREE.Box3().setFromObject(obj);
      const zShift = -(box.min.z + box.max.z) / 2;

      obj.traverse((child) => {
        if (!child.isMesh) return;
        const name = child.name || '';
        child.geometry.translate(0, 0, zShift);
        if (PROP_PARTS.has(name)) {
          child.material = bronzeMat;
          propeller.add(child.clone());
        } else {
          child.material = name === '02_low' ? hullMat : detailMat;
          const mesh = child.clone();
          sub.add(mesh);
          if (name === '02_low') {
            const edges = new THREE.LineSegments(new THREE.EdgesGeometry(child.geometry, 6), edgeMat);
            sub.add(edges);
          }
        }
      });
      sub.add(propeller);
      setProgress(1);
      start();
    })
    .catch((err) => {
      console.error('Failed to load submarine', err);
      start();
    });

  /* ---------------- Scroll anchors ---------------- */
  const heroEl = document.querySelector('.hero');
  const chapters = [...document.querySelectorAll('.chapter')];
  const diveEnd = document.querySelector('.dive-end');
  let anchors = [];
  let heroH = 1;
  const computeAnchors = () => {
    const vh = window.innerHeight;
    const docTop = (el) => el.getBoundingClientRect().top + window.scrollY;
    heroH = heroEl.offsetHeight;
    anchors = [0];
    chapters.forEach((c) => anchors.push(docTop(c) + c.offsetHeight / 2 - vh / 2));
    anchors.push(docTop(diveEnd) + diveEnd.offsetHeight / 2 - vh / 2);
  };
  ScrollTrigger.addEventListener('refresh', computeAnchors);
  computeAnchors();

  const pathAt = (scroll) => {
    if (scroll <= anchors[0]) return 0;
    for (let i = 1; i < anchors.length; i++) {
      if (scroll < anchors[i]) return i - 1 + (scroll - anchors[i - 1]) / (anchors[i] - anchors[i - 1]);
    }
    return anchors.length - 1;
  };

  /* ---------------- Camera state ---------------- */
  const smooth = (x) => x * x * (3 - 2 * x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const wrapPi = (a) => Math.atan2(Math.sin(a), Math.cos(a));

  const sampleKeys = (p) => {
    const i = Math.min(Math.floor(p), KEYS.length - 2);
    const f = smooth(THREE.MathUtils.clamp(p - i, 0, 1));
    const a = KEYS[i];
    const b = KEYS[i + 1];
    return {
      r: lerp(a.r, b.r, f),
      phi: lerp(a.phi, b.phi, f),
      theta: lerp(a.theta, b.theta, f),
      tx: lerp(a.t[0], b.t[0], f),
      ty: lerp(a.t[1], b.t[1], f),
      tz: lerp(a.t[2], b.t[2], f),
      prop: lerp(a.prop, b.prop, f),
      edges: lerp(a.edges, b.edges, f),
    };
  };

  const cam = { r: 60, phi: 1.2, theta: 0.2, tx: 0, ty: 0, tz: 0 };
  const intro = { k: reduceMotion ? 0 : 1 };
  let orbitAngle = 0;
  let aspectScale = 1;
  let heroLift = 0.38;
  let ready = false;
  const spherical = new THREE.Spherical();
  const target = new THREE.Vector3();
  const vFov = THREE.MathUtils.degToRad(35);

  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    aspectScale = Math.pow(Math.max(1, 1.55 / camera.aspect), 0.8);
    heroLift = camera.aspect < 0.8 ? 0.48 : 0.3;
  };
  window.addEventListener('resize', resize);
  resize();

  /* ---------------- Render loop ---------------- */
  const hud = document.querySelector('.hud');
  const depthEl = document.getElementById('depth');
  const depthBar = document.getElementById('depth-bar');
  const rays = document.querySelector('.rays');
  let propSpeed = 0.6;
  let edgeAmt = 0;
  let lastDepth = -1;

  gsap.ticker.add((time, deltaMs) => {
    const dt = Math.min(deltaMs / 1000, 0.05);
    const scroll = window.scrollY;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const depthT = THREE.MathUtils.clamp(scroll / maxScroll, 0, 1);

    // hero orbit weight: 0 = free orbit, 1 = scroll path owns the camera
    const w = smooth(THREE.MathUtils.clamp(scroll / (heroH * 0.9), 0, 1));
    orbitAngle += dt * (reduceMotion ? 0.03 : 0.085) * (1 - w);

    const path = sampleKeys(pathAt(scroll));
    const k0 = KEYS[0];
    const orbitTheta = k0.theta + orbitAngle;
    const heroTy = k0.t[1] - heroLift * k0.r * aspectScale * Math.tan(vFov / 2);

    const goal = {
      r: lerp(k0.r, path.r, w) * aspectScale * (1 + intro.k * 0.9),
      phi: lerp(k0.phi - intro.k * 0.25, path.phi, w),
      theta: path.theta + wrapPi(orbitTheta - path.theta) * (1 - w),
      tx: lerp(k0.t[0], path.tx, w),
      ty: lerp(heroTy, path.ty, w),
      tz: lerp(k0.t[2], path.tz, w),
    };

    const damp = ready ? 1 - Math.exp(-dt * (reduceMotion ? 12 : 3.2)) : 1;
    cam.r = lerp(cam.r, goal.r, damp);
    cam.phi = lerp(cam.phi, goal.phi, damp);
    cam.theta = cam.theta + wrapPi(goal.theta - cam.theta) * damp;
    cam.tx = lerp(cam.tx, goal.tx, damp);
    cam.ty = lerp(cam.ty, goal.ty, damp);
    cam.tz = lerp(cam.tz, goal.tz, damp);

    const breathe = reduceMotion ? 0 : Math.sin(time * 0.35) * 0.015;
    spherical.set(cam.r, THREE.MathUtils.clamp(cam.phi + breathe, 0.02, Math.PI - 0.02), cam.theta);
    target.set(cam.tx, cam.ty, cam.tz);
    camera.position.setFromSpherical(spherical).add(target);
    camera.lookAt(target);

    // submarine idle motion
    if (!reduceMotion) {
      bob.position.y = Math.sin(time * 0.5) * 0.12;
      bob.rotation.z = Math.sin(time * 0.31) * 0.012;
      bob.rotation.x = Math.sin(time * 0.23) * 0.008;
    }
    propSpeed = lerp(propSpeed, path.prop, 1 - Math.exp(-dt * 2));
    propeller.rotation.z += dt * propSpeed * (reduceMotion ? 0.3 : 1);
    edgeAmt = lerp(edgeAmt, path.edges * w, 1 - Math.exp(-dt * 3));
    edgeMat.opacity = edgeAmt * 0.55;

    // orbiting summary ring fades as we dive
    ring.group.rotation.y -= dt * (reduceMotion ? 0.03 : 0.07);
    const ringOpacity = (1 - w) * (1 - intro.k);
    ring.front.opacity = ringOpacity * 0.95;
    ring.back.opacity = ringOpacity * 0.22;
    ring.group.visible = ringOpacity > 0.001;

    // water colour darkens with depth
    waterCol.copy(surfaceCol).lerp(abyssCol, smooth(Math.min(1, depthT * 1.6)));
    renderer.setClearColor(waterCol);
    scene.fog.color.copy(waterCol);
    scene.fog.density = lerp(0.016, 0.024, depthT);
    rays.style.opacity = String(Math.max(0, 1 - depthT * 3));

    snow.update(dt, time, camera);

    const depth = Math.round(depthT * 1320);
    if (depth !== lastDepth) {
      lastDepth = depth;
      depthEl.textContent = String(depth).padStart(4, '0');
      depthBar.style.height = `${depthT * 100}%`;
      hud.classList.toggle('is-on', scroll > anchors[1] - window.innerHeight && scroll < anchors[anchors.length - 1]);
    }

    renderer.render(scene, camera);
  });

  function start() {
    ready = true;
    finishLoading();
    initDom();
    if (!reduceMotion) {
      gsap.to(intro, { k: 0, duration: 3.2, ease: 'expo.out', delay: 0.15 });
    }
  }
}

/* ------------------------------------------------------------------ */
/* Helpers: loading, ring, snow                                        */
/* ------------------------------------------------------------------ */
async function loadText(url, onProgress) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  if (!res.body || !res.body.getReader) return res.text();
  const total = Number(res.headers.get('content-length')) || OBJ_BYTES;
  const reader = res.body.getReader();
  const chunks = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress(Math.min(0.98, received / Math.max(total, received)));
  }
  const all = new Uint8Array(received);
  let offset = 0;
  for (const c of chunks) { all.set(c, offset); offset += c.length; }
  return new TextDecoder().decode(all);
}

function buildTextRing() {
  const radius = 13.2;
  const circumference = Math.PI * 2 * radius;
  const cw = 8192;
  const ch = 128;
  const height = circumference / (cw / ch);

  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.wrapS = THREE.RepeatWrapping;
  const backTexture = texture.clone();
  backTexture.repeat.x = -1; // the far wall is seen from inside: mirror it so it reads

  const draw = () => {
    const phrase = 'AMERICAN METAL BEARING COMPANY  ✦  ';
    ctx.clearRect(0, 0, cw, ch);
    ctx.textBaseline = 'middle';
    let size = 64;
    ctx.font = `500 ${size}px "JetBrains Mono", ui-monospace, monospace`;
    const phraseW = ctx.measureText(phrase).width;
    const reps = Math.max(1, Math.round(cw / phraseW));
    size *= cw / (phraseW * reps); // fit a whole number of repeats exactly
    ctx.font = `500 ${size}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.fillStyle = '#f0c68a';
    let x = 0;
    for (let i = 0; i < reps; i++) {
      ctx.fillText(phrase, x, ch / 2);
      x += ctx.measureText(phrase).width;
    }
    ctx.fillStyle = 'rgba(240, 198, 138, 0.35)';
    ctx.fillRect(0, 6, cw, 2);
    ctx.fillRect(0, ch - 8, cw, 2);
    texture.needsUpdate = true;
    backTexture.needsUpdate = true;
  };
  draw();
  if (document.fonts) {
    document.fonts.load('500 64px "JetBrains Mono"').then(draw).catch(() => {});
  }

  const geo = new THREE.CylinderGeometry(radius, radius, height, 160, 1, true);
  const front = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.FrontSide, depthWrite: false, opacity: 0 });
  const back = new THREE.MeshBasicMaterial({ map: backTexture, transparent: true, side: THREE.BackSide, depthWrite: false, opacity: 0 });
  const group = new THREE.Group();
  const tilt = new THREE.Group();
  tilt.rotation.x = 0.07;
  tilt.rotation.z = -0.04;
  const backMesh = new THREE.Mesh(geo, back);
  const frontMesh = new THREE.Mesh(geo, front);
  backMesh.renderOrder = 1;
  frontMesh.renderOrder = 3;
  group.add(backMesh, frontMesh);
  tilt.add(group);
  tilt.position.y = 1.9;
  return { group: tilt, front, back };
}

function buildSnow() {
  const count = window.innerWidth < 720 ? 1400 : 2600;
  const range = new THREE.Vector3(70, 40, 70);
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * range.x;
    positions[i * 3 + 1] = (Math.random() - 0.5) * range.y;
    positions[i * 3 + 2] = (Math.random() - 0.5) * range.z;
    speeds[i] = 0.15 + Math.random() * 0.45;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const dot = document.createElement('canvas');
  dot.width = dot.height = 64;
  const g = dot.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(200,240,250,0.5)');
  grad.addColorStop(1, 'rgba(200,240,250,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);

  const mat = new THREE.PointsMaterial({
    size: 0.14,
    map: new THREE.CanvasTexture(dot),
    transparent: true,
    depthWrite: false,
    opacity: 0.55,
    color: 0xcdeef5,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  points.renderOrder = 2;

  const update = (dt, time, camera) => {
    const p = geo.attributes.position.array;
    const cx = camera.position.x;
    const cy = camera.position.y;
    const cz = camera.position.z;
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      p[ix + 1] -= speeds[i] * dt * 0.6;
      p[ix] += Math.sin(time * 0.3 + i) * dt * 0.05;
      // keep particles in a box that travels with the camera
      p[ix] = cx + wrap(p[ix] - cx, range.x);
      p[ix + 1] = cy + wrap(p[ix + 1] - cy, range.y);
      p[ix + 2] = cz + wrap(p[ix + 2] - cz, range.z);
    }
    geo.attributes.position.needsUpdate = true;
  };
  return { points, update };
}

function wrap(v, size) {
  const h = size / 2;
  return ((((v + h) % size) + size) % size) - h;
}

function finishLoading() {
  loaderEl.classList.add('is-done');
  document.body.classList.remove('is-loading');
  if (lenis) lenis.start();
}

/* ------------------------------------------------------------------ */
/* DOM motion: hero intro, parallax, reveals, counters                 */
/* ------------------------------------------------------------------ */
function initDom() {
  const header = document.querySelector('.site-header');
  ScrollTrigger.create({
    start: 40,
    end: 'max',
    onToggle: (self) => header.classList.toggle('is-scrolled', self.isActive),
  });

  initNav();
  initTabs();

  if (reduceMotion) {
    gsap.set('.hero-title .line > span, .reveal', { clearProps: 'all' });
    countersInstant();
    return;
  }

  // Hero entrance
  gsap.from('.hero-title .line > span', { yPercent: 110, duration: 1.6, ease: 'expo.out', stagger: 0.12, delay: 0.35 });
  gsap.from('.hero .reveal', { y: 24, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, delay: 0.8 });
  gsap.from('.site-header', { y: -30, opacity: 0, duration: 1.2, ease: 'expo.out', delay: 0.5, clearProps: 'transform,opacity' });

  // Hero copy parallaxes out as the camera takes over
  gsap.to('.hero-copy', {
    yPercent: -30, opacity: 0, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  // Marquee, reacting to scroll velocity
  const track = document.querySelector('[data-marquee]');
  const marquee = gsap.to(track, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
  ScrollTrigger.create({
    onUpdate: (self) => {
      const v = gsap.utils.clamp(-6, 6, self.getVelocity() / 250);
      gsap.to(marquee, { timeScale: 1 + Math.abs(v), duration: 0.3, overwrite: true });
      gsap.to(marquee, { timeScale: 1, duration: 1.2, delay: 0.3 });
    },
  });

  // Chapter cards: drift in, hold, drift out
  document.querySelectorAll('.chapter').forEach((ch) => {
    const card = ch.querySelector('.chapter-card');
    const fromX = ch.dataset.align === 'right' ? 60 : -60;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: ch, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
    });
    tl.fromTo(card, { opacity: 0, y: 140, x: fromX, rotateX: 8, transformPerspective: 900 }, { opacity: 1, y: 0, x: 0, rotateX: 0, ease: 'power2.out', duration: 0.35 })
      .to(card, { y: 0, duration: 0.3 })
      .to(card, { opacity: 0, y: -120, ease: 'power2.in', duration: 0.35 });

    ScrollTrigger.create({
      trigger: ch, start: 'top center', end: 'bottom center',
      onToggle: (self) => { if (self.isActive) document.getElementById('hud-chapter').textContent = ch.dataset.chapter; },
    });
  });
  const hudChapter = document.getElementById('hud-chapter');
  ScrollTrigger.create({
    trigger: '.dive', start: 'top center', end: 'bottom center',
    onLeave: () => { hudChapter.textContent = 'Ascent'; },
    onLeaveBack: () => { hudChapter.textContent = 'Surface'; },
  });

  // Generic vertical parallax
  document.querySelectorAll('[data-speed]').forEach((el) => {
    const s = parseFloat(el.dataset.speed);
    gsap.fromTo(el, { y: () => -s * window.innerHeight * 0.5 }, {
      y: () => s * window.innerHeight * 0.5, ease: 'none',
      scrollTrigger: { trigger: el.closest('section, article') || el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
    });
  });

  // Horizontal ghost words
  document.querySelectorAll('[data-speed-x]').forEach((el) => {
    const s = parseFloat(el.dataset.speedX);
    gsap.fromTo(el, { xPercent: s > 0 ? -s : 0 }, {
      xPercent: s > 0 ? 0 : s, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // Section headings rise line by line
  document.querySelectorAll('.section-head > *, .dive-intro > *, .svc-col > .eyebrow, .svc-col > h2, .careers-inner h2, .contact-grid h2').forEach((el) => {
    gsap.from(el, {
      y: 60, opacity: 0, duration: 1.3, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });
  gsap.from('.contact-card', {
    x: 40, opacity: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out',
    scrollTrigger: { trigger: '.contact-cards', start: 'top 85%' },
  });
  [['.cap-card', '.cap-grid'], ['.product', '.product-grid'], ['.step', '.process'], ['.svc-list li', '.svc-list']].forEach(([items, trigger]) => {
    gsap.from(items, {
      y: 70, opacity: 0, duration: 1.2, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger, start: 'top 85%' },
    });
  });
  const run = document.getElementById('cycle-run');
  if (run) {
    gsap.fromTo(run, { strokeDashoffset: 742 }, {
      strokeDashoffset: 0, ease: 'none',
      scrollTrigger: { trigger: '.lifecycle', start: 'top 80%', end: 'bottom 40%', scrub: true },
    });
  }

  // Counters
  document.querySelectorAll('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const obj = { v: el.hasAttribute('data-plain') ? 1800 : 0 };
    gsap.to(obj, {
      v: end, duration: 2.2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
      onUpdate: () => { el.textContent = formatCount(el, obj.v); },
    });
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
}

/* Header: dropdown menus on desktop, full-screen menu on phones */
function initNav() {
  const header = document.querySelector('.site-header');
  const groups = [...document.querySelectorAll('.nav-group')];
  const menuBtn = document.getElementById('menu-btn');

  const closeGroups = (except) => groups.forEach((g) => {
    if (g === except) return;
    g.classList.remove('is-open');
    g.querySelector('.nav-top').setAttribute('aria-expanded', 'false');
  });
  const setMobile = (open) => {
    header.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (window.ambLenis) open ? window.ambLenis.stop() : window.ambLenis.start();
  };

  groups.forEach((g) => {
    const btn = g.querySelector('.nav-top');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !g.classList.contains('is-open');
      closeGroups(g);
      g.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
    if (window.matchMedia('(hover: hover)').matches) {
      g.addEventListener('mouseenter', () => { if (!header.classList.contains('menu-open')) { closeGroups(g); g.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); } });
      g.addEventListener('mouseleave', () => { if (!header.classList.contains('menu-open')) closeGroups(); });
    }
  });
  menuBtn.addEventListener('click', () => setMobile(!header.classList.contains('menu-open')));
  document.addEventListener('click', (e) => { if (!e.target.closest('.nav-group')) closeGroups(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeGroups(); setMobile(false); } });
  document.querySelectorAll('.nav a').forEach((a) => a.addEventListener('click', () => { closeGroups(); setMobile(false); }));
}

/* Who we are: accessible tabs, also driven by nav links with data-tab */
function initTabs() {
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const ink = document.querySelector('.tab-ink');
  if (!tabs.length) return;
  const moveInk = (tab) => {
    if (!ink) return;
    ink.style.width = `${tab.offsetWidth}px`;
    ink.style.transform = `translateX(${tab.offsetLeft}px)`;
  };
  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      if (on && !reduceMotion) gsap.fromTo(panel, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' });
    });
    if (focus) tab.focus();
    moveInk(tab);
    ScrollTrigger.refresh();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
  });
  document.querySelectorAll('a[data-tab]').forEach((a) => {
    a.addEventListener('click', () => {
      const tab = document.getElementById(`tab-${a.dataset.tab}`);
      if (tab) select(tab);
    });
  });
  moveInk(tabs[0]);
  window.addEventListener('resize', () => moveInk(tabs.find((t) => t.getAttribute('aria-selected') === 'true')));
  if (document.fonts) document.fonts.ready.then(() => moveInk(tabs.find((t) => t.getAttribute('aria-selected') === 'true')));
}

function formatCount(el, v) {
  const n = Math.round(v);
  const txt = el.hasAttribute('data-plain') ? String(n) : n.toLocaleString('en-US');
  return txt + (el.dataset.suffix || '');
}

function countersInstant() {
  document.querySelectorAll('[data-count]').forEach((el) => {
    el.textContent = formatCount(el, Number(el.dataset.count));
  });
}
