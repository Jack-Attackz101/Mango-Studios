(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const parallaxNodes = [...document.querySelectorAll("[data-parallax]")];
  const cards = [...document.querySelectorAll(".card")];

  if (cards.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.28 }
    );
    cards.forEach((card) => io.observe(card));
  } else {
    cards.forEach((card) => card.classList.add("is-in"));
  }

  if (reduce || !parallaxNodes.length) return;

  const pointer = { x: 0, y: 0 };
  let mx = 0;
  let my = 0;
  let ticking = false;

  const paint = () => {
    ticking = false;
    mx += (pointer.x - mx) * 0.08;
    my += (pointer.y - my) * 0.08;
    const y = window.scrollY;
    for (const node of parallaxNodes) {
      const depth = Number(node.dataset.parallax) || 0;
      const shiftY = y * depth * -0.35 + my * depth * 18;
      const shiftX = mx * depth * 22;
      node.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0)`;
    }
  };

  const requestPaint = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(paint);
    }
  };

  window.addEventListener("scroll", requestPaint, { passive: true });
  window.addEventListener(
    "pointermove",
    (event) => {
      const nx = event.clientX / window.innerWidth - 0.5;
      const ny = event.clientY / window.innerHeight - 0.5;
      pointer.x = nx;
      pointer.y = ny;
      requestPaint();
    },
    { passive: true }
  );

  requestPaint();
})();
