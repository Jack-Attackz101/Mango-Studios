/* ─────────────────────────────────────────────
   Mango Studios · script.js
   Lenis · GSAP + ScrollTrigger · SplitType
   ───────────────────────────────────────────── */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── SMOOTH SCROLL ───────────────────────────── */
const lenis = new Lenis({ duration: 1.2, smoothWheel: true, wheelMultiplier: 0.9 });
gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ── HEADER SHADOW ───────────────────────────── */
const header = document.querySelector('.site-header');
lenis.on('scroll', ({ scroll }) => {
  header.classList.toggle('scrolled', scroll > 50);
});

if (reduced) {
  // Show everything immediately and stop here
  document.querySelectorAll('.card, .step-item').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
} else {

/* ── SPLIT TEXT ──────────────────────────────── */
const heroH1 = document.querySelector('.hero-copy h1');
let heroWords = [];
if (heroH1) {
  const split = new SplitType(heroH1, { types: 'words' });
  heroWords = split.words;
  // Highlight "ripe" word after split
  heroWords.forEach(w => {
    if (w.textContent.trim().toLowerCase() === 'ripe') w.classList.add('h1-accent');
  });
  gsap.set(heroWords, { y: 38, opacity: 0 });
}

/* ── PAGE CURTAIN REVEAL ─────────────────────── */
const curtain = document.querySelector('.curtain');
if (curtain) {
  const tl = gsap.timeline({
    defaults: { ease: 'expo.inOut', duration: 1.15 },
    onComplete: () => curtain.remove(),
  });
  tl.to('.curtain-panel', { xPercent: (i) => i === 0 ? -100 : 100 });
  tl.from('.hero-eyebrow',    { y: 14, opacity: 0, ease: 'power2.out', duration: 0.5 }, 0.82)
    .to(heroWords,            { y: 0, opacity: 1, stagger: 0.065, ease: 'power4.out', duration: 0.85 }, 0.88)
    .from('.hero-copy .lede', { y: 18, opacity: 0, ease: 'power2.out', duration: 0.6 }, 1.15)
    .from('.hero-copy .btn',  { y: 18, opacity: 0, ease: 'power2.out', duration: 0.6 }, 1.3)
    .from('.hero-sphere-slot',{ opacity: 0, scale: 0.86, ease: 'power3.out', duration: 0.9 }, 0.9)
    .from('.hero-year',       { opacity: 0, duration: 0.5 }, 1.45)
    .from('.scroll-indicator',{ opacity: 0, y: 12, duration: 0.5 }, 1.55);
}

/* ── HERO SCROLL PARALLAX ────────────────────── */
const hTrg = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
gsap.to('.hero-sky',          { yPercent: -22, ease: 'none', scrollTrigger: hTrg });
gsap.to('.cloud-back',        { yPercent: -14, ease: 'none', scrollTrigger: hTrg });
gsap.to('.cloud-mid',         { yPercent: -30, ease: 'none', scrollTrigger: hTrg });
gsap.to('.hero-sphere-slot',  { yPercent:  20, ease: 'none', scrollTrigger: hTrg });
gsap.to('.hero-copy',         { yPercent:   7, ease: 'none', scrollTrigger: hTrg });

/* ── MOUSE PARALLAX ──────────────────────────── */
const mpLayers = [
  { sel: '.hero-sky',          f: 0.010 },
  { sel: '.cloud-back',        f: 0.022 },
  { sel: '.cloud-mid',         f: 0.040 },
  { sel: '.hero-sphere-slot',  f: 0.056 },
];
const mpSet = mpLayers.map(({ sel, f }) => {
  const el = document.querySelector(sel);
  return el ? { f, x: gsap.quickSetter(el, 'x', 'px'), y: gsap.quickSetter(el, 'y', 'px') } : null;
}).filter(Boolean);

window.addEventListener('mousemove', ({ clientX, clientY }) => {
  const dx = clientX - window.innerWidth  / 2;
  const dy = clientY - window.innerHeight / 2;
  mpSet.forEach(({ f, x, y }) => { x(dx * f); y(dy * f); });
}, { passive: true });

/* ── CUSTOM CURSOR ───────────────────────────── */
const cDot  = document.querySelector('.cursor-dot');
const cRing = document.querySelector('.cursor-ring');
if (cDot && window.matchMedia('(pointer: fine)').matches) {
  document.body.classList.add('has-cursor');
  let mx = -100, my = -100, rx = -100, ry = -100;
  window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  gsap.ticker.add(() => {
    gsap.set(cDot,  { x: mx, y: my });
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    gsap.set(cRing, { x: rx, y: ry });
  });
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(cRing, { scale: 2.8, duration: 0.3, ease: 'power2.out' });
      gsap.to(cDot,  { scale: 0.5, duration: 0.2 });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(cRing, { scale: 1, duration: 0.3 });
      gsap.to(cDot,  { scale: 1, duration: 0.2 });
    });
  });
  document.querySelectorAll('a, .btn').forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.to(cDot,  { scale: 2.2, background: 'var(--mango)', duration: 0.2 });
      gsap.to(cRing, { opacity: 0, scale: 0.5, duration: 0.2 });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(cDot,  { scale: 1, background: 'var(--ink)', duration: 0.2 });
      gsap.to(cRing, { opacity: 1, scale: 1, duration: 0.2 });
    });
  });
}

/* ── MAGNETIC BUTTONS ────────────────────────── */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const r  = btn.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width  / 2);
    const dy = e.clientY - (r.top  + r.height / 2);
    gsap.to(btn, { x: dx * 0.32, y: dy * 0.32, duration: 0.25, ease: 'power2.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.75, ease: 'elastic.out(1, 0.35)' });
  });
});

/* ── SECTION H2 WORD REVEALS ─────────────────── */
document.querySelectorAll('.section-head h2, .studio h2, .close h2').forEach(h2 => {
  const s = new SplitType(h2, { types: 'words' });
  gsap.from(s.words, {
    y: 28, opacity: 0, stagger: 0.055, duration: 0.7, ease: 'power3.out',
    scrollTrigger: { trigger: h2, start: 'top 85%', once: true },
  });
});

/* ── CARD REVEALS ────────────────────────────── */
[
  { el: '.card-sky',   x: -55, y: 0,  scale: 1 },
  { el: '.card-mango', x:  55, y: 0,  scale: 1 },
  { el: '.card-green', x: 0,  y: 55,  scale: 1 },
  { el: '.card-cream', x: 0,  y: 30,  scale: 0.96 },
].forEach(({ el, x, y, scale }) => {
  const card = document.querySelector(el);
  if (!card) return;
  gsap.set(card, { x, y, opacity: 0, scale });
  ScrollTrigger.create({
    trigger: card, start: 'top 88%', once: true,
    onEnter: () =>
      gsap.to(card, {
        x: 0, y: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out',
        onComplete: () => gsap.set(card, { clearProps: 'x,y,opacity,scale' }),
      }),
  });
});

/* ── PROCESS: STEP REVEALS + COUNTER ─────────── */
document.querySelectorAll('.step-item').forEach((step, i) => {
  gsap.set(step, { x: -28, opacity: 0 });
  ScrollTrigger.create({
    trigger: step, start: 'top 85%', once: true,
    onEnter: () =>
      gsap.to(step, {
        x: 0, opacity: 1, duration: 0.65, ease: 'power3.out', delay: i * 0.07,
        onComplete: () => gsap.set(step, { clearProps: 'x,opacity' }),
      }),
  });
});

document.querySelectorAll('.step-num').forEach(num => {
  const target = parseInt(num.textContent, 10);
  ScrollTrigger.create({
    trigger: num, start: 'top 82%', once: true,
    onEnter: () => {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target, duration: 0.9, ease: 'power2.out',
        onUpdate() { num.textContent = String(Math.round(obj.val)).padStart(2, '0'); },
      });
    },
  });
});

/* ── VELOCITY-SENSITIVE TICKER ───────────────── */
const tickerTrack = document.querySelector('.ticker-track');
if (tickerTrack) {
  let tickerDur = 28, lastScroll = 0;
  lenis.on('scroll', ({ scroll }) => {
    const delta  = Math.abs(scroll - lastScroll);
    lastScroll   = scroll;
    const target = Math.max(8, 28 - delta * 0.28);
    tickerDur   += (target - tickerDur) * 0.14;
    tickerTrack.style.animationDuration = tickerDur + 's';
  });
}

/* ── MISC SCROLL REVEALS ─────────────────────── */
['.studio-bio', '.eyebrow'].forEach(sel => {
  document.querySelectorAll(sel).forEach(el => {
    gsap.from(el, {
      y: 18, opacity: 0, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
});

} // end !reduced
