// The forge: an extruded ALLMIGHT chevron over a floor of incoming records.
// main.js drives it through `state` (intro, hero scroll, finale scroll, pointer).

import * as THREE from 'three';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const ACCENT = new THREE.Color('#ff4d2d');
const INK = new THREE.Color('#f4f4ee');
const CARBON = new THREE.Color('#09090b');

// Logo paths in SVG units (y down, 92 x 100). Outer chevron and its inset.
const OUTER = [[0, 100], [46, 0], [92, 100], [65, 100], [46, 57], [27, 100]];
const INNER = [[10.5, 93.5], [46, 16], [81.5, 93.5], [69.5, 93.5], [46, 40.5], [22.5, 93.5]];
const S = 0.03;
const toV = ([x, y]) => new THREE.Vector2((x - 46) * S, (60 - y) * S);

function shapeFrom(points) {
  const s = new THREE.Shape();
  points.map(toV).forEach((v, i) => (i ? s.lineTo(v.x, v.y) : s.moveTo(v.x, v.y)));
  s.closePath();
  return s;
}

function buildMark() {
  const group = new THREE.Group();

  const ring = shapeFrom(OUTER);
  const hole = new THREE.Path();
  INNER.slice().reverse().map(toV).forEach((v, i) => (i ? hole.lineTo(v.x, v.y) : hole.moveTo(v.x, v.y)));
  hole.closePath();
  ring.holes.push(hole);

  const depth = 0.46;
  const ringGeo = new THREE.ExtrudeGeometry(ring, { depth, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.022, bevelSegments: 4, curveSegments: 1 });
  ringGeo.translate(0, 0, -depth / 2);
  const innerGeo = new THREE.ExtrudeGeometry(shapeFrom(INNER), { depth: depth * 0.82, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.012, bevelSegments: 3, curveSegments: 1 });
  innerGeo.translate(0, 0, -depth / 2);

  const orange = new THREE.MeshPhysicalMaterial({
    color: ACCENT, roughness: 0.3, metalness: 0.25, clearcoat: 1, clearcoatRoughness: 0.18,
    envMapIntensity: 0.55, transparent: true, opacity: 0,
  });
  const white = new THREE.MeshPhysicalMaterial({
    color: INK, roughness: 0.38, metalness: 0.05, clearcoat: 0.6, clearcoatRoughness: 0.3,
    envMapIntensity: 0.5, transparent: true, opacity: 0,
  });
  const ringMesh = new THREE.Mesh(ringGeo, orange);
  const innerMesh = new THREE.Mesh(innerGeo, white);
  group.add(ringMesh, innerMesh);

  // Blueprint edges: what you see before the solid resolves.
  const edgeMat = new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0 });
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(ringGeo, 20), edgeMat);
  const edgesInner = new THREE.LineSegments(new THREE.EdgesGeometry(innerGeo, 20), edgeMat);
  group.add(edges, edgesInner);

  return { group, solids: [orange, white], edgeMat };
}

function buildFloor() {
  const geo = new THREE.PlaneGeometry(90, 90, 1, 1);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uFade: { value: 0 }, uAccent: { value: ACCENT }, uLine: { value: new THREE.Color('#2b2b31') } },
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `
      uniform float uTime; uniform float uFade; uniform vec3 uAccent; uniform vec3 uLine; varying vec3 vW;
      float grid(vec2 p, float s){ vec2 g = abs(fract(p/s - .5) - .5) / fwidth(p/s); return 1. - min(min(g.x,g.y),1.); }
      void main(){
        float d = length(vW.xz * vec2(.7,1.));
        float fade = smoothstep(22., 3., d) * smoothstep(-16., -4., vW.z);
        float g = grid(vW.xz, 1.) * .55 + grid(vW.xz, 4.) * .45;
        // a slow scan line travelling toward the viewer
        float scan = smoothstep(.0, .35, 1. - abs(vW.z - (mod(uTime * 2.2, 30.) - 14.))) * smoothstep(-7., 1., vW.z);
        vec3 col = uLine * g + uAccent * scan * g * .9;
        // warm pool of light under the mark
        float pool = smoothstep(7., 0., length(vW.xz - vec2(0., -.5)));
        col += uAccent * pool * pool * .09;
        gl_FragColor = vec4(col, (g * .9 + pool * .5 + scan * g) * fade * uFade);
      }`,
  });
  return new THREE.Mesh(geo, mat);
}

function buildStreams(count) {
  const geo = new THREE.BufferGeometry();
  const seed = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const lane = Math.round((Math.random() * 2 - 1) * 14);
    seed.set([lane * 0.62, Math.random(), 0.04 + Math.random() * 0.07, Math.random() < 0.16 ? 1 : 0], i * 4);
  }
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uFade: { value: 0 }, uPx: { value: 1 }, uAccent: { value: ACCENT }, uInk: { value: INK } },
    vertexShader: `
      attribute vec4 aSeed; uniform float uTime; uniform float uPx; varying float vA; varying float vHot;
      void main(){
        float p = fract(aSeed.y + uTime * aSeed.z);
        float z = mix(13., -.6, p);
        float pull = smoothstep(.55, 1., p);
        vec3 pos = vec3(aSeed.x * mix(1., .04, pull), -2.18 + pull * pull * 2.2, z);
        vA = smoothstep(0., .12, p) * (1. - smoothstep(.9, 1., p));
        vHot = aSeed.w;
        vec4 mv = modelViewMatrix * vec4(pos, 1.);
        gl_PointSize = (aSeed.w > .5 ? 3.2 : 2.2) * uPx * (9. / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uAccent; uniform vec3 uInk; uniform float uFade; varying float vA; varying float vHot;
      void main(){
        vec2 c = gl_PointCoord - .5; if (max(abs(c.x), abs(c.y)) > .5) discard;
        gl_FragColor = vec4(mix(uInk * .55, uAccent * 1.4, vHot), vA * uFade * (vHot > .5 ? .95 : .45));
      }`,
  });
  return new THREE.Points(geo, mat);
}

function buildOrbits() {
  const group = new THREE.Group();
  const specs = [
    { r: [2.6, 1.15], rot: [1.25, 0.2, -0.35], color: ACCENT, o: 0.55 },
    { r: [2.3, 2.3], rot: [0.2, 0.9, 0.5], color: INK, o: 0.18 },
    { r: [2.9, 2.05], rot: [0.5, -0.6, 1.1], color: INK, o: 0.12 },
  ];
  const orbits = specs.map((s) => {
    const pts = new THREE.EllipseCurve(0, 0, s.r[0], s.r[1], 0, Math.PI * 2).getPoints(220).map((p) => new THREE.Vector3(p.x, p.y, 0));
    const pivot = new THREE.Group();
    pivot.rotation.set(...s.rot);
    const mat = new THREE.LineBasicMaterial({ color: s.color, transparent: true, opacity: 0 });
    const line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), mat);
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), new THREE.MeshBasicMaterial({ color: s.color === ACCENT ? ACCENT : INK, transparent: true, opacity: 0 }));
    pivot.add(line, bead);
    group.add(pivot);
    return { pivot, mat, bead, r: s.r, base: s.o, phase: Math.random() * 6.28 };
  });
  return { group, orbits };
}

function buildDust(count) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) pos.set([(Math.random() - 0.5) * 22, Math.random() * 9 - 2, (Math.random() - 0.5) * 18], i * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: INK, size: 0.018, transparent: true, opacity: 0, depthWrite: false });
  return new THREE.Points(geo, mat);
}

export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 0.95;

  const scene = new THREE.Scene();
  scene.background = CARBON;
  scene.fog = new THREE.Fog(CARBON, 12, 30);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

  const key = new THREE.DirectionalLight(0xfff1e6, 1.1);
  key.position.set(-4, 6, 6);
  const rim = new THREE.PointLight(ACCENT, 26, 14, 2);
  rim.position.set(2.5, 1.5, -2.5);
  const fill = new THREE.PointLight(0x8899ff, 4, 12, 2);
  fill.position.set(-4, -1, 3);
  scene.add(key, rim, fill);

  const mark = buildMark();
  const holder = new THREE.Group();
  holder.add(mark.group);
  scene.add(holder);

  const floor = buildFloor();
  floor.position.y = -2.2;
  scene.add(floor);

  const streams = buildStreams(window.innerWidth < 700 ? 700 : 1600);
  scene.add(streams);

  const { group: orbitGroup, orbits } = buildOrbits();
  holder.add(orbitGroup);

  const dust = buildDust(260);
  scene.add(dust);

  const state = { intro: 0, hero: 0, finale: 0, mx: 0, my: 0, playing: true, finaleX: 2.7 };
  const smooth = { mx: 0, my: 0 };
  let time = 0;
  let last = performance.now();
  let compact = false;

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    compact = w / h < 0.9;
    state.finaleX = compact ? 0 : Math.min(3.4, 0.6 + camera.aspect * 1.25);
    camera.updateProjectionMatrix();
    streams.material.uniforms.uPx.value = renderer.getPixelRatio() * Math.min(1, w / 1400 + 0.3);
  }
  resize();

  const ease = (x) => x * x * (3 - 2 * x);
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const mix = (a, b, t) => a + (b - a) * t;

  function render() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (state.playing) time += dt;

    smooth.mx += (state.mx - smooth.mx) * 0.05;
    smooth.my += (state.my - smooth.my) * 0.05;

    const intro = state.intro;
    const h = ease(clamp01(state.hero));
    const f = ease(clamp01(state.finale));

    // Mark: materialise as blueprint, then resolve to solid.
    const solid = clamp01((intro - 0.35) / 0.65);
    mark.solids.forEach((m) => { m.opacity = solid; m.transparent = solid < 1; m.depthWrite = solid > 0.5; });
    mark.edgeMat.opacity = Math.min(1, intro * 2.5) * (1 - solid * 0.92);

    const baseY = compact ? 1.6 : 1.42;
    const bob = Math.sin(time * 0.8) * 0.06;
    holder.position.x = mix(0, state.finaleX, f);
    holder.position.y = mix(baseY + bob + h * 0.25, 0.35 + bob, f);
    holder.scale.setScalar(mix(0.74 + intro * 0.12, compact ? 0.82 : 1, f));
    mark.group.rotation.y = (1 - intro) * -1.2 + Math.sin(time * 0.35) * 0.22 + smooth.mx * 0.35 + h * Math.PI * 0.85 + f * time * 0.0;
    mark.group.rotation.x = smooth.my * 0.12 - h * 0.25;
    if (f > 0) mark.group.rotation.y += Math.sin(time * 0.5) * 0.15 * f;

    orbits.forEach((o, i) => {
      o.mat.opacity = o.base * f;
      o.bead.material.opacity = f;
      const a = time * (0.35 + i * 0.12) + o.phase;
      o.bead.position.set(Math.cos(a) * o.r[0], Math.sin(a) * o.r[1], 0);
      o.pivot.rotation.z += dt * 0.04 * (i % 2 ? -1 : 1) * (state.playing ? 1 : 0);
    });

    const floorFade = Math.min(1, intro * 1.4) * (1 - f);
    floor.material.uniforms.uTime.value = time;
    floor.material.uniforms.uFade.value = floorFade;
    streams.material.uniforms.uTime.value = time;
    streams.material.uniforms.uFade.value = clamp01(intro * 1.6 - 0.4) * (1 - f * 0.85);
    dust.material.opacity = 0.35 * intro;
    dust.rotation.y = time * 0.01;

    // Camera: pointer parallax, then a dive through the mark as the hero scrolls away.
    const camZ = mix(mix(compact ? 17 : 12.5, 2.4, h), compact ? 16 : 12, f);
    camera.position.set(smooth.mx * 0.6 * (1 - h), mix(0.9 + smooth.my * -0.35 + h * 0.6, 0.6, f), camZ);
    camera.lookAt(holder.position.x * 0.55 * (1 - f), mix(0.55 + h * 0.85, 0.3, f), 0);

    renderer.render(scene, camera);
  }

  return { state, render, resize, renderer };
}
