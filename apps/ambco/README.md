# AMB — American Metal Bearing concept demo

A Mango Studios client demo with two complete concept sites for [American Metal Bearing](https://www.ambco.net/), behind a Mango-branded picker.

```
apps/ambco/
  index.html     Mango Studios launcher: pick Sub or Plain, then Enter
  launch/        preview images for the launcher cards
  sub/           Sub concept: cinematic three.js submarine dive
  plain/         Plain concept: editorial, Anduril-style site
    img/         imagery (renders of the submarine and bearing models for now)
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

- Black and off-white, large grotesk type, mono labels, full-bleed media.
- Sections: hero, mission (words light up as you read), product lines with detail rows, capabilities, legacy (sticky image that changes per year), company (story, values, quality), manufacturing & services, careers, contact.
- Images in `plain/img/` are renders of our own submarine and bearing models. To use AMB's real photography, drop files with the same names into `plain/img/`.

## Run

From the repo root:

```
python3 -m http.server 4173
# open http://localhost:4173/apps/ambco/
```
