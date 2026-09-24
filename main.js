'use strict';

// Scrolling down while the hero is pinned walks the Mickey Mango parade left.
// Every walker is identical, so offsetting by (distance mod pitch) loops seamlessly.
(function () {
  const stage = document.getElementById('stage');
  const heroInner = document.getElementById('hero-inner');
  const parade = document.getElementById('parade');
  const sky = document.getElementById('hero-sky');
  const shade = document.getElementById('hero-shade');
  if (!stage || !parade) return;

  const MANGOS_PER_PASS = 6;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let vh = 0, pitch = 1, paradeRange = 1, walkPerPx = 0, skyTile = 1;
  let ticking = false;

  function measure() {
    vh = document.getElementById('hero').offsetHeight;
    pitch = parade.firstElementChild.getBoundingClientRect().width || 1;
    paradeRange = Math.max(1, stage.offsetHeight - 2 * vh);
    walkPerPx = (MANGOS_PER_PASS * pitch) / paradeRange;
    skyTile = vh * (2560 / 1440);
    render();
  }

  function render() {
    ticking = false;
    const y = Math.max(0, window.scrollY - stage.offsetTop);
    const walked = y * walkPerPx;

    parade.style.transform = 'translate3d(' + (-(walked % pitch)).toFixed(1) + 'px,0,0)';
    if (sky) sky.style.backgroundPositionX = (-(walked * 0.22) % skyTile).toFixed(1) + 'px';

    if (!reduceMotion) {
      const phase = (walked / (pitch / 2)) * Math.PI;
      parade.style.setProperty('--bob', (-Math.abs(Math.sin(phase)) * vh * 0.022).toFixed(1) + 'px');
      parade.style.setProperty('--tilt', (Math.sin(phase) * 3).toFixed(2) + 'deg');

      const cover = Math.min(1, Math.max(0, (y - paradeRange) / vh));
      heroInner.style.transform = cover ? 'scale(' + (1 - cover * 0.06).toFixed(4) + ')' : '';
      heroInner.style.borderRadius = (cover * 44).toFixed(1) + 'px';
      shade.style.opacity = (cover * 0.45).toFixed(3);
    }
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(render); }
  }, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  measure();
})();
