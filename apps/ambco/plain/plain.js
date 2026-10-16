(() => {
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('year').textContent = new Date().getFullYear();

  /* Smooth scroll */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const header = document.getElementById('hdr');
  const menuBtn = document.getElementById('hdr-menu');
  const setMenu = (open) => {
    header.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  menuBtn.addEventListener('click', () => setMenu(!header.classList.contains('menu-open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const el = id.length > 1 ? document.querySelector(id) : document.body;
      if (!el) return;
      e.preventDefault();
      setMenu(false);
      if (lenis) lenis.scrollTo(el, { offset: -64, duration: 1.6 });
      else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Header: solid after the hero starts to scroll, hides going down, returns going up */
  let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      header.classList.toggle('is-solid', y > 40);
      if (!header.classList.contains('menu-open')) header.classList.toggle('is-hidden', y > 400 && y > lastY);
      lastY = y;
    },
  });

  /* Legacy: the sticky image follows whichever year is in the middle of the screen */
  const legacyImgs = [...document.querySelectorAll('.legacy-frame img')];
  const legacyCap = document.getElementById('legacy-cap');
  document.querySelectorAll('.years li').forEach((li) => {
    ScrollTrigger.create({
      trigger: li, start: 'top 60%', end: 'bottom 60%',
      onToggle: (self) => {
        li.classList.toggle('is-on', self.isActive);
        if (!self.isActive) return;
        legacyImgs.forEach((img) => img.classList.toggle('is-on', img.dataset.step === li.dataset.step));
        legacyCap.textContent = li.dataset.cap;
      },
    });
  });

  /* Mission: words light up as you read */
  const mission = document.querySelector('[data-words]');
  if (mission) {
    mission.innerHTML = mission.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
    const words = mission.querySelectorAll('.w');
    if (!reduce) {
      ScrollTrigger.create({
        trigger: mission, start: 'top 80%', end: 'bottom 45%', scrub: true,
        onUpdate: (self) => {
          const n = Math.round(self.progress * words.length);
          words.forEach((w, i) => { w.style.opacity = i < n ? 1 : 0.18; });
        },
      });
    }
  }

  /* Count-up figures */
  document.querySelectorAll('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const plain = el.hasAttribute('data-plain');
    const fmt = (v) => (plain ? String(Math.round(v)) : Math.round(v).toLocaleString('en-US')) + (el.dataset.suffix || '');
    if (reduce) return;
    const obj = { v: plain ? 1880 : 0 };
    el.textContent = fmt(obj.v);
    gsap.to(obj, { v: end, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => { el.textContent = fmt(obj.v); } });
  });

  if (reduce) return;

  /* Hero: slow push-in on load, image drifts as you leave */
  gsap.fromTo('.hero-media img', { scale: 1.12 }, { scale: 1, duration: 2.6, ease: 'power3.out' });
  gsap.to('.hero-media img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.from('.hero-copy > *', { y: 40, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: 0.1, delay: 0.2 });

  /* Headings rise in */
  document.querySelectorAll('[data-lines]').forEach((el) => {
    if (el.closest('.hero')) return;
    gsap.from(el, { y: 50, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  /* Image parallax inside frames */
  document.querySelectorAll('[data-parallax]').forEach((img) => {
    gsap.fromTo(img, { yPercent: -6 }, {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  /* Cards and rows fade up in sequence */
  [['.tile', '.product-grid'], ['.cap', '.caps-grid'], ['.company-grid article', '.company-grid'], ['.rows li', '.rows'], ['.contact-grid > div', '.contact-grid']].forEach(([items, trigger]) => {
    gsap.from(items, { y: 40, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger, start: 'top 85%' } });
  });
  document.querySelectorAll('.pdetail').forEach((row) => {
    gsap.from(row.querySelectorAll('.pdetail-body > *'), { y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.06, scrollTrigger: { trigger: row, start: 'top 70%' } });
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
