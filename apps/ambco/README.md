# AMB — American Metal Bearing concept site

Scroll-driven 3D site for [American Metal Bearing](https://www.ambco.net/).

- **Hero:** the submarine (`assets/submarine.obj`) with the camera slowly orbiting it and a ring of company copy rotating around the hull. Headline sits at the bottom.
- **The dive:** as you scroll, the camera zooms in and moves through six angles (bow, broadside, sail, keel, propulsor, plan view). Each angle comes with one AMB capability.
- **After the dive:** manufacturing stats, quality certifications, careers and contact, with parallax layers throughout.

Stack: three.js r169, GSAP 3.13 + ScrollTrigger, Lenis. All are vendored in `vendor/`, so nothing loads from a CDN.

Run it from the repo root:

```
python3 -m http.server 4173
# open http://localhost:4173/apps/ambco/
```

Camera angles are defined in the `KEYS` array at the top of `main.js`.
