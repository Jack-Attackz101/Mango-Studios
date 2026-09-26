import * as THREE from 'three';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ */
/* Product copy (from ambco.net product pages)                         */
/* ------------------------------------------------------------------ */
const PRODUCTS = {
  propulsor: {
    kicker: 'Water lubricated · Stave & partial arc',
    title: 'Propulsor bearings',
    lede: 'Water-lubricated bearings manufactured in stave and partial arc systems for conventional and nuclear-powered submarines, naval surface vessels and other industrial equipment.',
    points: [
      'Stave systems use dual-hardness, low-friction nitrile rubber staves approved by the U.S. Navy',
      'Grooves between the staves channel seawater through the bearing, lubricating it and carrying away sand and abrasives',
      'Partial arc (round bore) bearings held to the exacting tolerances they require',
      'Application-specific liners proven with full or partial scale testing and finite element analysis',
    ],
    specs: [['Lubricant', 'Seawater'], ['Systems', 'Stave · Partial arc'], ['Platforms', 'Submarines · Surface']],
    link: 'https://www.ambco.net/bearing-propulsion-systems',
  },
  lineshaft: {
    kicker: 'Oil lubricated · Since 1921',
    title: 'Line shaft bearings',
    lede: 'AMB began engineering and producing oil-lubricated bearings in 1921 and is the premier engineering manufacturer of line shaft bearings to the U.S. Navy and its allies around the world.',
    points: [
      'Found on almost every large U.S. Navy surface combatant',
      'Babbitted bearings centrifugally cast in house',
      'Tested using NAVSEA and ABS approved procedures and in-house NDT',
      'Built for successful operation in harsh operating conditions',
    ],
    specs: [['Lubricant', 'Oil'], ['Liner', 'Cast babbitt'], ['Customers', 'U.S. Navy & allies']],
    link: 'https://www.ambco.net/lineshaft-bearings',
  },
  thrust: {
    kicker: 'Tilting pad · Self-lubricating',
    title: 'Thrust bearings',
    lede: 'Tilting pad thrust bearings designed and built for propulsion shafting and industrial equipment, whether the need is small or over 30,000 pounds.',
    points: [
      'Operate without a lube oil pumping system or jacking pumps',
      'Self-lubricate in every operating condition of a surface combatant, including jacking speeds',
      'Self-aligning, load-leveling design allows for shaft deflection while minimizing wear',
      'Thrust pads and radial bearings cast in house to NAVSEA and ABS approved procedures',
    ],
    specs: [['Capacity', '30,000+ lb'], ['Type', 'Tilting pad'], ['Oil pumps', 'None required']],
    link: 'https://www.ambco.net/thrust-bearings',
  },
};

/* ------------------------------------------------------------------ */
/* Materials                                                          */
/* ------------------------------------------------------------------ */
const M = {
  bronze: () => new THREE.MeshStandardMaterial({ color: 0xc08a4c, metalness: 1, roughness: 0.3 }),
  babbitt: () => new THREE.MeshStandardMaterial({ color: 0xd9dde0, metalness: 1, roughness: 0.22 }),
  steel: () => new THREE.MeshStandardMaterial({ color: 0x9aa4ab, metalness: 1, roughness: 0.32 }),
  housing: () => new THREE.MeshStandardMaterial({ color: 0x33424c, metalness: 0.55, roughness: 0.45 }),
  rubber: () => new THREE.MeshStandardMaterial({ color: 0x15191b, metalness: 0, roughness: 0.75 }),
};

const ring = (outer, inner, depth, segs = 96, bevel = 0.02) => {
  const s = new THREE.Shape();
  s.absarc(0, 0, outer, 0, Math.PI * 2, false);
  const h = new THREE.Path();
  h.absarc(0, 0, inner, 0, Math.PI * 2, true);
  s.holes.push(h);
  const g = new THREE.ExtrudeGeometry(s, { depth, curveSegments: segs, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2 });
  g.translate(0, 0, -depth / 2);
  return g;
};

const sector = (r0, r1, a0, a1, depth, bevel = 0.015) => {
  const s = new THREE.Shape();
  s.absarc(0, 0, r1, a0, a1, false);
  s.absarc(0, 0, r0, a1, a0, true);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, curveSegments: 24, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2 });
  g.translate(0, 0, -depth / 2);
  return g;
};

/* Stave bearing: bronze shell, flange, rubber staves with water grooves, shaft sleeve */
function buildPropulsor() {
  const g = new THREE.Group();
  const bronze = M.bronze();
  g.add(new THREE.Mesh(ring(1.22, 1.0, 2.6), bronze));
  const flange = new THREE.Mesh(ring(1.55, 1.0, 0.16), bronze);
  flange.position.z = 1.3;
  g.add(flange);
  const boltMat = M.steel();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.12, 12), boltMat);
    b.rotation.x = Math.PI / 2;
    b.position.set(Math.cos(a) * 1.4, Math.sin(a) * 1.4, 1.43);
    g.add(b);
  }
  const rubber = M.rubber();
  const n = 16;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2 + 0.05;
    const a1 = ((i + 1) / n) * Math.PI * 2 - 0.05;
    g.add(new THREE.Mesh(sector(0.8, 0.995, a0, a1, 2.52, 0.012), rubber));
  }
  const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.74, 3.6, 64, 1, true), M.steel());
  sleeve.rotation.x = Math.PI / 2;
  sleeve.position.z = -0.4;
  g.add(sleeve);
  const cap = new THREE.Mesh(new THREE.CircleGeometry(0.74, 64), M.steel());
  cap.position.z = -2.2;
  cap.rotation.y = Math.PI;
  g.add(cap);
  g.rotation.set(0.35, -0.7, 0);
  return { group: g, spinAxis: 'y', scale: 1 };
}

/* Line shaft bearing: pedestal housing with split cap, babbitt liner, shaft */
function buildLineshaft() {
  const g = new THREE.Group();
  const housing = M.housing();

  const base = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.22, 1.5), housing);
  base.position.y = -1.25;
  g.add(base);

  const halfRing = (outer, inner, depth, upper) => {
    const s = new THREE.Shape();
    const a0 = upper ? 0 : Math.PI;
    const a1 = upper ? Math.PI : Math.PI * 2;
    s.absarc(0, 0, outer, a0, a1, false);
    s.absarc(0, 0, inner, a1, a0, true);
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth, curveSegments: 64, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 });
    geo.translate(0, 0, -depth / 2);
    return geo;
  };

  // lower pedestal: half ring + web down to the base
  const lower = new THREE.Mesh(halfRing(1.05, 0.8, 1.3, false), housing);
  g.add(lower);
  const web = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 1.1), housing);
  web.position.y = -0.95;
  g.add(web);
  const feet = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.12, 1.3), housing);
  feet.position.y = -1.08;
  g.add(feet);

  // split line flanges
  const flangeGeo = new THREE.BoxGeometry(0.55, 0.14, 1.3);
  [-1.3, 1.3].forEach((x) => {
    const lf = new THREE.Mesh(flangeGeo, housing);
    lf.position.set(x, -0.07, 0);
    g.add(lf);
    const uf = new THREE.Mesh(flangeGeo, housing);
    uf.position.set(x, 0.09, 0);
    g.add(uf);
  });

  // upper cap in bronze-tinted steel, lifted slightly to show the split
  const capGroup = new THREE.Group();
  capGroup.add(new THREE.Mesh(halfRing(1.05, 0.8, 1.3, true), M.housing()));
  const sight = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.12, 24), M.bronze());
  sight.position.y = 1.08;
  capGroup.add(sight);
  capGroup.position.y = 0.16;
  g.add(capGroup);

  // bolts
  const boltMat = M.steel();
  [-1.3, 1.3].forEach((x) => [-0.4, 0.4].forEach((z) => {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.62, 12), boltMat);
    b.position.set(x, 0.05, z);
    g.add(b);
    const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 6), boltMat);
    nut.position.set(x, 0.36, z);
    g.add(nut);
  }));

  // babbitt liner (two shells) + shaft
  const liner = new THREE.Mesh(ring(0.8, 0.72, 1.36, 64, 0.01), M.babbitt());
  g.add(liner);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 4.4, 64), M.steel());
  shaft.rotation.x = Math.PI / 2;
  g.add(shaft);

  g.rotation.set(0.25, -0.75, 0);
  g.position.y = 0.15;
  return { group: g, spinAxis: 'y', scale: 0.92 };
}

/* Tilting pad thrust bearing: carrier ring, eight babbitt-faced pads, collar, shaft */
function buildThrust() {
  const g = new THREE.Group();
  const carrier = new THREE.Mesh(ring(1.6, 0.62, 0.34), M.housing());
  carrier.position.z = -0.32;
  g.add(carrier);

  const n = 8;
  const steel = M.steel();
  const babbitt = M.babbitt();
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2 + 0.07;
    const a1 = ((i + 1) / n) * Math.PI * 2 - 0.07;
    const mid = (a0 + a1) / 2;
    const pad = new THREE.Group();
    const back = new THREE.Mesh(sector(0.7, 1.5, a0, a1, 0.2), steel);
    const face = new THREE.Mesh(sector(0.72, 1.48, a0 + 0.01, a1 - 0.01, 0.06, 0.008), babbitt);
    face.position.z = 0.13;
    pad.add(back, face);
    // tilt each pad slightly about its radial line
    pad.rotateOnAxis(new THREE.Vector3(Math.cos(mid), Math.sin(mid), 0), 0.05);
    g.add(pad);
    const pivot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 12), M.bronze());
    pivot.position.set(Math.cos(mid) * 1.1, Math.sin(mid) * 1.1, -0.14);
    g.add(pivot);
  }

  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.22, 96), M.steel());
  collar.rotation.x = Math.PI / 2;
  collar.position.z = 1.0;
  g.add(collar);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 3.6, 64), M.steel());
  shaft.rotation.x = Math.PI / 2;
  shaft.position.z = 0.4;
  g.add(shaft);

  g.rotation.set(0.5, -0.6, 0);
  return { group: g, spinAxis: 'y', scale: 0.95 };
}

const BUILDERS = { propulsor: buildPropulsor, lineshaft: buildLineshaft, thrust: buildThrust };

/* ------------------------------------------------------------------ */
/* Viewer: one renderer per canvas, drag to rotate, idle spin          */
/* ------------------------------------------------------------------ */
function createViewer(canvas, { distance = 9.6 } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (err) {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.8;
  scene.add(new THREE.HemisphereLight(0x8fd8e8, 0x0a0f12, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 6, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffb070, 2.4);
  rim.position.set(-6, -2, -5);
  scene.add(rim);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.4, distance);
  camera.lookAt(0, 0, 0);

  const pivot = new THREE.Group();
  scene.add(pivot);
  let model = null;
  const rot = { x: 0, y: 0, vx: 0, vy: 0 };
  let dragging = false;
  let last = null;

  const setModel = (key) => {
    if (model) {
      pivot.remove(model.group);
      model.group.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
    }
    model = BUILDERS[key]();
    model.group.scale.setScalar(model.scale);
    pivot.add(model.group);
    rot.x = 0; rot.y = 0;
  };

  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    last = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add('is-dragging');
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - last.x;
    const dy = e.clientY - last.y;
    last = { x: e.clientX, y: e.clientY };
    rot.vy = dx * 0.01;
    rot.vx = dy * 0.01;
    rot.y += rot.vy;
    rot.x = THREE.MathUtils.clamp(rot.x + rot.vx, -1.1, 1.1);
  });
  const end = () => { dragging = false; canvas.classList.remove('is-dragging'); };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    if (canvas.width !== Math.round(w * renderer.getPixelRatio()) || canvas.height !== Math.round(h * renderer.getPixelRatio())) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  };

  const tick = (dt) => {
    resize();
    if (!dragging) {
      rot.vy *= 0.94;
      rot.vx *= 0.9;
      rot.y += rot.vy + (reduceMotion ? 0 : dt * 0.35);
      rot.x = THREE.MathUtils.clamp(rot.x + rot.vx, -1.1, 1.1) * 0.985;
    }
    pivot.rotation.set(rot.x, rot.y, 0);
    renderer.render(scene, camera);
  };

  return { setModel, tick };
}

/* ------------------------------------------------------------------ */
/* Cards                                                              */
/* ------------------------------------------------------------------ */
const viewers = [];
document.querySelectorAll('.product').forEach((card) => {
  const canvas = card.querySelector('.product-canvas');
  const viewer = createViewer(canvas);
  if (!viewer) { card.classList.add('no-3d'); return; }
  viewer.setModel(card.dataset.product);
  const entry = { viewer, visible: false };
  viewers.push(entry);
  new IntersectionObserver(([e]) => { entry.visible = e.isIntersecting; }, { rootMargin: '100px' }).observe(canvas);
});

/* ------------------------------------------------------------------ */
/* Learn more dialog                                                  */
/* ------------------------------------------------------------------ */
const dialog = document.getElementById('product-dialog');
const dialogViewer = dialog ? createViewer(document.getElementById('pd-canvas'), { distance: 8.8 }) : null;
let dialogOpen = false;

const fill = (key) => {
  const p = PRODUCTS[key];
  document.getElementById('pd-kicker').textContent = p.kicker;
  document.getElementById('pd-title').textContent = p.title;
  document.getElementById('pd-lede').textContent = p.lede;
  document.getElementById('pd-points').innerHTML = p.points.map((t) => `<li>${t}</li>`).join('');
  document.getElementById('pd-specs').innerHTML = p.specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  document.getElementById('pd-link').href = p.link;
  if (dialogViewer) dialogViewer.setModel(key);
};

const closeDialog = () => {
  if (!dialog.open) return;
  dialog.close();
};

if (dialog) {
  document.querySelectorAll('[data-open]').forEach((btn) => {
    btn.addEventListener('click', () => {
      fill(btn.dataset.open);
      dialog.showModal();
      dialogOpen = true;
      document.documentElement.classList.add('dialog-open');
      if (window.ambLenis) window.ambLenis.stop();
      if (!reduceMotion && window.gsap) {
        window.gsap.fromTo(dialog.querySelector('.pd-inner'), { y: 40, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out' });
      }
    });
  });
  dialog.addEventListener('close', () => {
    dialogOpen = false;
    document.documentElement.classList.remove('dialog-open');
    if (window.ambLenis) window.ambLenis.start();
  });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) closeDialog(); });
  dialog.querySelectorAll('[data-close]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const href = el.getAttribute('href');
      closeDialog();
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (window.ambLenis) window.ambLenis.scrollTo(target, { duration: 1.8 });
        else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    });
  });
}

/* ------------------------------------------------------------------ */
/* Shared loop                                                        */
/* ------------------------------------------------------------------ */
let prev = performance.now();
const loop = (now) => {
  const dt = Math.min((now - prev) / 1000, 0.05);
  prev = now;
  if (!document.hidden) {
    if (dialogOpen && dialogViewer) dialogViewer.tick(dt);
    else viewers.forEach((v) => { if (v.visible) v.viewer.tick(dt); });
  }
  requestAnimationFrame(loop);
};
requestAnimationFrame(loop);
