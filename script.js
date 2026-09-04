(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ─── Scroll-triggered reveals ───────────────────────────────────────────
  const revealItems = [...document.querySelectorAll(".card, .step-item")];

  if (revealItems.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.18 }
    );
    revealItems.forEach((el) => io.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add("is-in"));
  }

  // ─── Header shadow on scroll ────────────────────────────────────────────
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ─── Parallax ──────────────────────────────────────────────────────────
  const parallaxNodes = [...document.querySelectorAll("[data-parallax]")];
  if (reduce || !parallaxNodes.length) return;

  const ptr = { x: 0, y: 0 };
  let mx = 0, my = 0, ticking = false;

  const paint = () => {
    ticking = false;
    mx += (ptr.x - mx) * 0.06;
    my += (ptr.y - my) * 0.06;
    const scrollY = window.scrollY;
    for (const node of parallaxNodes) {
      const depth = Number(node.dataset.parallax) || 0;
      const shiftY = scrollY * depth * -0.35 + my * depth * 20;
      const shiftX = mx * depth * 24;
      node.style.transform = `translate3d(${shiftX}px,${shiftY}px,0)`;
    }
  };

  const requestPaint = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(paint); }
  };

  window.addEventListener("scroll", requestPaint, { passive: true });
  window.addEventListener(
    "pointermove",
    (e) => {
      ptr.x = e.clientX / window.innerWidth  - 0.5;
      ptr.y = e.clientY / window.innerHeight - 0.5;
      requestPaint();
    },
    { passive: true }
  );

  requestPaint();
})();
