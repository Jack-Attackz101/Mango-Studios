# AMB — American Metal Bearing concept site

Scroll-driven 3D site for [American Metal Bearing](https://www.ambco.net/).

- **Hero:** the submarine (`assets/submarine.obj`) with the camera slowly orbiting it and a ring reading "American Metal Bearing Company" rotating around the hull. Headline sits at the bottom.
- **Capabilities:** advanced manufacturing, applied research & prototyping, structural analysis & simulation.
- **Legacy:** as you scroll, the camera zooms in and moves through six angles of the submarine, paired with a timeline of AMB in national security (1921 → today).
- **Product lines:** propulsor (stave), line shaft and thrust bearings as drag-to-rotate 3D models (`products.js`), each with a Learn more panel.
- **Who we are:** Our story / Our values / Our quality tabs, then advanced manufacturing, services, life cycle management, careers and contact.

Stack: three.js r169, GSAP 3.13 + ScrollTrigger, Lenis. All are vendored in `vendor/`, so nothing loads from a CDN.

Run it from the repo root:

```
python3 -m http.server 4173
# open http://localhost:4173/apps/ambco/
```

Camera angles are defined in the `KEYS` array at the top of `main.js`.
