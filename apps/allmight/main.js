import { createScene } from './scene.js';
import { buildCards, buildPanes, STAGES } from './ui.js';

const { gsap, ScrollTrigger, Lenis } = window;
gsap.registerPlugin(ScrollTrigger);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

buildCards($('#track'));
buildPanes($('#panes'));

/* ---------- Smooth scroll ---------- */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}
window.history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href');
  const el = id === '#top' ? document.body : $(id);
  if (!el) return;
  e.preventDefault();
  if (lenis) lenis.scrollTo(el === document.body ? 0 : el, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else el.scrollIntoView();
}));

/* ---------- WebGL ---------- */
let gl = null;
try { gl = createScene($('#gl')); } catch (err) { $('#gl').remove(); }
let glVisible = true;
if (gl) {
  window.addEventListener('resize', () => gl.resize());
  gsap.ticker.add(() => { if (glVisible) gl.render(); });
}

/* ---------- Words and lines ---------- */
$$('[data-words]').forEach((el) => {
  el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
});

/* ---------- Loader → intro ---------- */
function intro() {
  const count = { v: 0 };
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  const heroLines = $$('[data-hero-line] > span');
  gsap.set(heroLines, { yPercent: 115 });
  gsap.set('[data-hero-fade], .hero__meta, .nav', { autoAlpha: 0, y: 14 });
  gsap.set('.tick', { scale: 0 });

  if (reduced) {
    $('#loader').remove();
    document.body.classList.remove('is-loading');
    gsap.set(heroLines, { yPercent: 0 });
    gsap.set('[data-hero-fade], .hero__meta, .nav', { autoAlpha: 1, y: 0 });
    gsap.set('.tick', { scale: 1 });
    if (gl) { gl.state.intro = 1; gl.state.playing = false; syncPause(); }
    return;
  }

  tl.to('.loader__stroke', { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, 0)
    .to(count, { v: 100, duration: 1.7, ease: 'power3.inOut', onUpdate: () => { $('#loader-count').textContent = String(Math.round(count.v)).padStart(3, '0'); } }, 0)
    .to('#loader-bar', { scaleX: 1, duration: 1.7, ease: 'power3.inOut' }, 0)
    .fromTo('.loader__fill', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.8 }, 1.05)
    .to('.loader__meta, .loader__bar', { autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, 1.85)
    .to('.loader__mark', { y: -40, autoAlpha: 0, duration: 0.6, ease: 'power3.in' }, 1.9)
    .to('#loader', { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, 2.15)
    .add(() => { document.body.classList.remove('is-loading'); }, 2.6)
    .to(gl ? gl.state : {}, { intro: 1, duration: 3.2, ease: 'power2.out' }, 2.45)
    .to(heroLines, { yPercent: 0, duration: 1.6, stagger: 0.12 }, 2.7)
    .to('.tick', { scale: 1, duration: 1.2, stagger: 0.06 }, 2.9)
    .to('.nav, .hero__meta', { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.08 }, 3.0)
    .to('[data-hero-fade]', { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.08 }, 3.15)
    .add(() => { $('#loader').remove(); lenis && lenis.start(); }, 3.3);
}

/* ---------- Scroll choreography ---------- */
function scenes() {
  const mm = gsap.matchMedia();

  // Hero: the title splits apart, the camera dives through the mark.
  ScrollTrigger.create({
    trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true,
    onUpdate: (s) => { if (gl) gl.state.hero = s.progress; updateGl(); },
  });
  gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 } })
    .to('[data-hero-line]:nth-child(1)', { xPercent: -14, ease: 'none' }, 0)
    .to('[data-hero-line]:nth-child(2)', { xPercent: 12, ease: 'none' }, 0)
    .to('.hero__title', { y: -80, autoAlpha: 0.15, ease: 'none' }, 0)
    .to('.hero__foot, .hero__meta, .hero__frame', { y: -60, autoAlpha: 0, ease: 'none' }, 0);

  // Finale: the mark returns, with orbits.
  ScrollTrigger.create({
    trigger: '#waitlist', start: 'top bottom', end: 'top 15%', scrub: true,
    onUpdate: (s) => { if (gl) gl.state.finale = s.progress; updateGl(); },
  });

  // Section headings: masked line reveals.
  $$('h2, .policy__title').forEach((h) => {
    const lines = $$('[data-line] > span', h);
    if (!lines.length) return;
    gsap.from(lines, { yPercent: 115, rotate: 2.5, duration: 1.5, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: h, start: 'top 85%' } });
  });
  $$('[data-reveal]').forEach((el) => {
    gsap.from(el, { y: 28, autoAlpha: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });

  // Scrubbed word lighting.
  $$('[data-words]').forEach((el) => {
    gsap.fromTo($$('.w', el), { opacity: 0.12 }, { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } });
  });

  // Policy underline.
  gsap.to('.policy__title em', { '--u': 1, duration: 1.2, ease: 'expo.inOut', delay: 0.5, scrollTrigger: { trigger: '.policy__title', start: 'top 75%' } });

  // Mission bands drift against each other.
  $$('[data-band]').forEach((row) => {
    const dir = +row.dataset.band;
    gsap.fromTo(row, { xPercent: dir < 0 ? 0 : -25 }, { xPercent: dir < 0 ? -25 : 0, ease: 'none', scrollTrigger: { trigger: '.mission', start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  $$('[data-tenet]').forEach((t, i) => {
    gsap.timeline({ scrollTrigger: { trigger: '.tenets', start: 'top 80%' } })
      .to(t, { '--d': 1, duration: 1.4, ease: 'expo.inOut' }, i * 0.12)
      .from($$('.tenet__n, h3, p', t), { y: 24, autoAlpha: 0, duration: 1.2, ease: 'expo.out', stagger: 0.07 }, 0.3 + i * 0.12);
  });

  // Footer: rises out from under the page; letters stand up.
  gsap.fromTo('.footer__inner', { yPercent: -35 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  gsap.from('.footer__mark .ltr', { yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: '.footer__mark', start: 'top 95%' } });

  compliance(mm);
  problems(mm);
  forge(mm);
  chrome();
}

function compliance(mm) {
  const plates = $$('.plate');
  const steps = $$('.step');
  const num = $('#stage-num');
  const name = $('#stage-name');
  const titles = ['Plan', 'Build', 'Test', 'Validate', 'Deploy'];
  let current = -1;
  const setStage = (k) => {
    if (k === current) return;
    current = k;
    steps.forEach((s, i) => s.classList.toggle('is-active', i === k));
    plates.forEach((p, i) => { p.classList.toggle('is-active', i === k); p.classList.toggle('is-done', i < k); });
    num.textContent = String(k + 1).padStart(2, '0');
    name.textContent = titles[k];
  };
  setStage(0);

  mm.add({ desktop: '(min-width: 1101px)', mobile: '(max-width: 1100px)' }, (ctx) => {
    const gap = ctx.conditions.desktop ? 64 : 44;
    gsap.set(plates, { z: (i) => (2 - i) * 8 });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#process', start: 'top top', end: '+=320%', pin: true, scrub: 0.9,
        onUpdate: (s) => setStage(Math.min(4, Math.floor(Math.max(0, s.progress - 0.12) / 0.88 * 5))),
      },
      defaults: { ease: 'power2.inOut' },
    });
    tl.to(plates, { z: (i) => (2 - i) * gap, duration: 1 })
      .to('#stack', { rotateZ: -28, rotateX: 54, duration: 6, ease: 'none' }, 0);
    plates.forEach((p, i) => {
      tl.to(p, { z: `+=${gap * 0.7}`, duration: 0.5 }, 1 + i * 1)
        .to(p, { z: `-=${gap * 0.7}`, duration: 0.5 }, 1.5 + i * 1);
    });
  });
}

function problems(mm) {
  const track = $('#track');
  const cardNum = $('#card-num');
  const bar = $('#card-bar');
  mm.add('(min-width: 901px)', () => {
    const distance = () => track.scrollWidth - window.innerWidth;
    const tween = gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: '.problems__pin', start: 'top top', end: () => '+=' + distance(), pin: true, scrub: 1, invalidateOnRefresh: true,
        onUpdate: (s) => {
          cardNum.textContent = String(Math.min(7, 1 + Math.floor(s.progress * 7.2))).padStart(2, '0');
          bar.style.transform = `scaleX(${s.progress})`;
        },
      },
    });
    $$('[data-card]').forEach((card) => {
      gsap.fromTo($('[data-parallax-x]', card), { xPercent: 10 }, { xPercent: -8, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      gsap.fromTo($('.card__problem', card), { x: 60 }, { x: -20, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
    });
  });
  mm.add('(max-width: 900px)', () => {
    $$('[data-card]').forEach((card) => gsap.from(card, { y: 60, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 88%' } }));
  });
}

function forge(mm) {
  const buttons = $$('.window__nav button');
  const panes = $$('.pane');
  const ind = $('#nav-ind');
  const crumb = $('#forge-crumb');
  let current = 0;
  let st = null;

  const show = (k, animate = true) => {
    if (k === current && animate) return;
    const prev = panes[current];
    current = k;
    buttons.forEach((b, i) => b.classList.toggle('is-active', i === k));
    ind.style.transform = `translateY(${buttons[k].offsetTop - buttons[0].offsetTop}px)`;
    crumb.textContent = STAGES[k];
    const next = panes[k];
    gsap.killTweensOf([prev, next, $$('[data-i]', next)]);
    if (prev !== next) gsap.to(prev, { autoAlpha: 0, y: -10, duration: 0.35, ease: 'power2.in', onComplete: () => prev.classList.remove('is-active') });
    next.classList.add('is-active');
    gsap.fromTo(next, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'expo.out', delay: 0.1 });
    gsap.fromTo($$('[data-i]', next), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.035, delay: 0.15 });
    const meter = $('[data-meter]', next);
    if (meter) gsap.fromTo(meter, { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'expo.inOut', delay: 0.3 });
  };
  panes.forEach((p, i) => gsap.set(p, { autoAlpha: i ? 0 : 1 }));

  buttons.forEach((b, i) => b.addEventListener('click', () => {
    if (st && lenis) {
      const span = st.end - st.start;
      lenis.scrollTo(st.start + span * (0.25 + (i + 0.5) / 5 * 0.75), { duration: 1.2 });
    } else show(i);
  }));

  mm.add('(min-width: 901px)', () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#forge-pin', start: 'top top', end: '+=360%', pin: true, scrub: 0.8,
        onUpdate: (s) => show(Math.min(4, Math.max(0, Math.floor((s.progress - 0.25) / 0.75 * 5)))),
      },
    });
    st = tl.scrollTrigger;
    tl.fromTo('#window', { scale: 0.72, yPercent: 8, clipPath: 'inset(14% 18% 14% 18% round 12px)', rotateX: 10, transformPerspective: 1600 },
      { scale: 1, yPercent: 0, clipPath: 'inset(0% 0% 0% 0% round 12px)', rotateX: 0, duration: 1, ease: 'power3.inOut' })
      .to({}, { duration: 3 });
    return () => { st = null; };
  });
}

function chrome() {
  const nav = $('#nav');
  const hud = $('#hud');
  const links = $$('.nav__links a');
  let hidden = false;

  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (s) => {
      const y = s.scroll();
      nav.classList.toggle('is-solid', y > 40);
      const hide = s.direction === 1 && y > window.innerHeight * 0.6;
      if (hide !== hidden) {
        hidden = hide;
        gsap.to(nav, { yPercent: hide ? -100 : 0, duration: 0.7, ease: 'expo.out' });
      }
    },
  });

  const sections = $$('[data-section]');
  sections.forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec, start: 'top 55%', end: 'bottom 55%',
      onToggle: (s) => {
        if (!s.isActive) return;
        $('#hud-num').textContent = sec.dataset.section;
        $('#hud-name').textContent = sec.dataset.name;
        links.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === '#' + sec.id));
      },
    });
  });
  ScrollTrigger.create({
    trigger: sections[0], endTrigger: '#waitlist', start: 'top 55%', end: 'top 55%',
    onUpdate: (s) => { $('#hud-bar').style.transform = `scaleX(${s.progress})`; },
    onToggle: (s) => { hud.classList.toggle('is-on', s.isActive); if (!s.isActive) links.forEach((a) => a.classList.remove('is-current')); },
  });
}

function updateGl() {
  if (!gl) return;
  glVisible = gl.state.hero < 0.999 || gl.state.finale > 0.001;
}

/* ---------- Pointer: cursor, magnetics, scene parallax ---------- */
function pointer() {
  const cursor = $('.cursor');
  const dot = $('.cursor__dot');
  const ring = $('.cursor__ring');
  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const ringPos = { ...pos };

  window.addEventListener('pointermove', (e) => {
    pos.x = e.clientX; pos.y = e.clientY;
    if (gl) { gl.state.mx = (e.clientX / innerWidth) * 2 - 1; gl.state.my = (e.clientY / innerHeight) * 2 - 1; }
    cursor.classList.add('is-on');
  }, { passive: true });
  document.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));

  if (!finePointer) return;
  gsap.ticker.add(() => {
    ringPos.x += (pos.x - ringPos.x) * 0.16;
    ringPos.y += (pos.y - ringPos.y) * 0.16;
    dot.style.transform = `translate3d(${pos.x}px,${pos.y}px,0)`;
    ring.style.transform = `translate3d(${ringPos.x}px,${ringPos.y}px,0)`;
  });
  document.addEventListener('pointerover', (e) => {
    cursor.classList.toggle('is-hover', !!e.target.closest('[data-hover], a, button'));
  });

  if (reduced) return;
  $$('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/* ---------- Motion toggle ---------- */
const toggle = $('#motion-toggle');
function syncPause() {
  const paused = gl ? !gl.state.playing : true;
  toggle.setAttribute('aria-pressed', String(paused));
  $('.hero__pause-text').textContent = paused ? 'Play motion' : 'Pause motion';
}
toggle.addEventListener('click', () => {
  if (!gl) return;
  gl.state.playing = !gl.state.playing;
  syncPause();
});

/* ---------- Boot ---------- */
const ready = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 2500))]);
ready.then(() => {
  scenes();
  pointer();
  intro();
  ScrollTrigger.refresh();
});
