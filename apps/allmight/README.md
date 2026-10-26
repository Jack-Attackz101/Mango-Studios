# ALLMIGHT — concept rebuild

A rebuild of [allmight.ai](https://allmight.ai/) with the same design language (carbon black, off-white, signal orange, Space Grotesk, chevron mark) pushed into a scroll-driven, motion-led site. Copy is taken from the live site; every number inside the example apps is fictional demo data.

- **Loader:** the chevron draws itself, a counter runs to 100, then the curtain lifts.
- **Hero:** three.js. The chevron is extruded from the real logo paths, resolves from blueprint edges into a solid, and floats over a grid floor with data records streaming into it. Pointer parallax on the camera. Scrolling splits the headline apart and dives the camera through the mark.
- **Preface:** a paragraph that lights up word by word as you scroll.
- **01 Compliance:** pinned. Five isometric plates (CSS 3D) fan apart and light up one stage at a time while the Plan → Deploy list follows. Then the data policy, with an underline drawn under "not".
- **02 Problems:** pinned horizontal scroll through the seven starting paths. Each card pairs the problem/solution copy with a light example app (estimating, inventory, CRM, timesheets, ERP, beam calculation, mass-spring-damper) that drifts at its own speed.
- **03 Forge:** pinned. The workspace window opens out of a clipped frame and scroll steps through Plan, Build, Test, Validate and Deploy wireframes. The stage buttons scroll to their step.
- **04 Mission:** two giant text bands drift against each other; the three tenets draw in.
- **05 Waitlist:** the WebGL mark returns with orbit rings. The button goes to the real waitlist on allmight.ai.
- **Footer:** rises out from under the page; the wordmark letters stand up.

Also: Lenis smooth scroll, a custom cursor and magnetic buttons on fine pointers, film grain, a section HUD, a nav that hides on scroll down, a pause-motion control, and a static fallback for `prefers-reduced-motion`. Under 900px the horizontal scroll and Forge pin become a normal vertical flow.

Stack: three.js r169, GSAP 3.13 + ScrollTrigger, Lenis, all vendored in `vendor/`. Fonts come from Google Fonts.

| File | What it holds |
| --- | --- |
| `scene.js` | WebGL: mark, floor shader, record streams, orbits, camera states |
| `main.js` | Loader, scroll choreography, cursor, nav, HUD |
| `ui.js` | Problem cards, example apps and Forge panes |
| `styles.css` | Everything visual |

Run it from the repo root:

```
python3 -m http.server 4173
# open http://localhost:4173/apps/allmight/
```
