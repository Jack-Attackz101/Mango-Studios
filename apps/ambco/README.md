# AMB — American Metal Bearing concept site

Scroll-driven 3D site for [American Metal Bearing](https://www.ambco.net/).

- **Hero:** the submarine (`assets/submarine.obj`) with the camera slowly orbiting it and a ring reading "American Metal Bearing Company" rotating around the hull. Headline sits at the bottom.
- **Journey:** as you scroll, the camera zooms in and moves through six angles of the submarine, paired with a timeline of AMB in national security (1921 → today). Between angles, five pinned pauses darken the scene and slide in a row of cards: capabilities, product lines, by the numbers, manufacturing, services & life cycle.
- **Product lines:** propulsor (stave), line shaft and thrust bearings as drag-to-rotate 3D models (`products.js`), each with a Learn more panel.
- **Who we are:** a pinned horizontal story. Our story scrolls, slides left to Our values, then Our quality, then the page scrolls normally into careers and contact.
- **Logo:** `assets/logo.svg`, a vector redraw of the AMB wordmark. Replace it with the official file if one is available.

Stack: three.js r169, GSAP 3.13 + ScrollTrigger, Lenis. All are vendored in `vendor/`, so nothing loads from a CDN.

Run it from the repo root:

```
python3 -m http.server 4173
# open http://localhost:4173/apps/ambco/
```

Camera angles are defined in the `KEYS` array at the top of `main.js`. Pauses are `<section class="pause">` blocks in `index.html`; the camera holds still while each one is pinned.
