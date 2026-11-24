# AMB — American Metal Bearing concept demo

A Mango Studios client demo with two complete concept sites for [American Metal Bearing](https://www.ambco.net/), behind a Mango-branded picker.

```
apps/ambco/
  index.html     Mango Studios launcher: pick Sub or Plain, then Enter
  launch/        preview images for the launcher cards
  sub/           Sub concept: cinematic three.js submarine dive
  plain/         Plain concept: editorial, Anduril-style site
    img/         AMB photography and CAD renders from ambco.net
  assets/        shared: submarine.obj, AMB logo, favicon
  vendor/        three.js r169, GSAP 3.13 + ScrollTrigger, Lenis (no CDN)
```

Both concept sites have a small "Mango Studios demo" pill in the bottom-left corner. It goes back to the picker or switches to the other concept.

## Sub

- **Hero:** the submarine with the camera slowly orbiting it and a ring reading "American Metal Bearing Company" rotating around the hull.
- **Journey:** scrolling moves the camera through six angles of the submarine, paired with AMB's legacy in national security. Five pinned pauses darken the scene and slide in card rows: capabilities, product lines (drag-to-rotate 3D bearings with Learn more), by the numbers, manufacturing, and services & life cycle.
- **Who we are:** a pinned horizontal story: Our story → Our values → Our quality.
- Camera angles live in the `KEYS` array at the top of `sub/main.js`.

## Plain

A blend of the Anduril and Human Delta sites: black, image-first sections with rounded mosaic tiles and a centered nav (Anduril), then white framed sections with hairline column rules, navy serif headings, a halftone dot wave, gradient navy buttons and a navy footer swell (Human Delta).

- Hero, mission, product and capability mosaics on black.
- "On the shafts of" fleet list, key figures, product detail rows, manufacturing 2x2 and services on white.
- Legacy as beige / olive / grey news-style panels, then Who we are and a closing careers CTA.
- **Images are scraped from ambco.net.** They are the real AMB photos and CAD renders, converted to WebP in `plain/img/`. The AMB lettermark is `plain/img/amb-logo.webp` (also `assets/amb-logo.webp`, used by Sub). Replace any file with the same name to swap an image.

## Run

From the repo root:

```
python3 -m http.server 4173
# open http://localhost:4173/apps/ambco/
```
