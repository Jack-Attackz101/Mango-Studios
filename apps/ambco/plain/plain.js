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

  /* Header: hides on the way down, returns on the way up */
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
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (!header.classList.contains('menu-open')) header.classList.toggle('is-hidden', y > 300 && y > lastY + 2);
    if (y < lastY - 2) header.classList.remove('is-hidden');
    lastY = y;
  }, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const el = id.length > 1 ? document.querySelector(id) : document.body;
      if (!el) return;
      e.preventDefault();
      setMenu(false);
      if (lenis) lenis.scrollTo(el, { offset: -72, duration: 1.5 });
      else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Halftone wave, in the style of Human Delta's hero */
  const canvas = document.getElementById('halftone');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let t0 = 0;
    const draw = (time = 0) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const step = 11;
      const p = time * 0.00012;
      for (let y = step / 2; y < h; y += step) {
        for (let x = step / 2; x < w; x += step) {
          const u = x / w;
          const c1 = h * (0.6 + 0.07 * Math.sin(u * 3.1 + p * 2.2) + 0.12 * (u - 0.5));
          const c2 = h * (0.72 + 0.06 * Math.sin(u * 2.4 - p * 1.6 + 1.7) - 0.1 * (u - 0.5));
          const d1 = (y - c1) / (h * 0.07);
          const d2 = (y - c2) / (h * 0.055);
          let v = Math.exp(-d1 * d1) + 0.8 * Math.exp(-d2 * d2);
          v *= Math.pow(Math.abs(u - 0.5) * 2, 0.8); // thin out toward the center, like Human Delta's wave
          const r = Math.min(v, 1) * 3.6;
          if (r < 0.35) continue;
          ctx.fillStyle = `rgba(43, 66, 118, ${0.2 + Math.min(v, 1) * 0.55})`;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
    draw();
    window.addEventListener('resize', () => draw(t0));
    if (!reduce) {
      let visible = true;
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '100px' }).observe(canvas);
      let last = 0;
      const loop = (now) => {
        if (visible && now - last > 66) { t0 = now; draw(now); last = now; }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
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

  /* Mission: words light up as you read */
  const mission = document.querySelector('[data-words]');
  if (mission) {
    mission.innerHTML = mission.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
    if (reduce) return;
    const words = mission.querySelectorAll('.w');
    ScrollTrigger.create({
      trigger: mission, start: 'top 82%', end: 'bottom 50%', scrub: true,
      onUpdate: (self) => {
        const n = Math.round(self.progress * words.length);
        words.forEach((w, i) => { w.style.opacity = i < n ? 1 : 0.2; });
      },
    });
  }

  /* Hero: slow push-in, text rises */
  gsap.fromTo('.hero-card > img', { scale: 1.1 }, { scale: 1, duration: 2.4, ease: 'power3.out' });
  gsap.to('.hero-card > img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.from('.hero-copy > *', { y: 36, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.1, delay: 0.2 });

  /* Reveals */
  const up = (items, trigger, extra = {}) => {
    gsap.from(items, { y: 40, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger, start: 'top 85%' }, ...extra });
  };
  up('.mosaic:not(.mosaic--b) .tile', '.mosaic:not(.mosaic--b)');
  up('.mosaic--b .tile', '.mosaic--b');
  up('.mosaic-head', '.mosaic-head');
  document.querySelectorAll('.row').forEach((r) => up(r.querySelectorAll('.cell-text > *, .card'), r, { stagger: 0.05 }));
  document.querySelectorAll('.band').forEach((b) => up(b.children, b));
  up('.grid2 .cell', '.grid2');
  up('.grid3:not(.grid3--tight) .cell', '.grid3:not(.grid3--tight)');
  up('.grid3--tight .cell', '.grid3--tight');
  up('.panel-pair .panel', '.panel-pair');
  up('.close-frame > *', '.close-frame', { stagger: 0.07 });
  up('.foot-grid > div', '.foot-grid', { stagger: 0.06 });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
