---
name: animate
description: All motion that isn't scroll storytelling. Build animations that feel right (whether to animate, purpose, tool, properties, easing, duration, interruption), micro-interactions, hover and reveal effects, loaders and page transitions, animated borders and glows, cursor trails, particles and physics, shader and WebGL backgrounds, globes, pointer-reactive line figures, and React Native or Expo motion with gestures and haptics. Also audits and fixes existing motion and janky performance. Use for "animate this", "add motion", "make it feel alive", "cursor effect", "particles", "shader background", "globe", "it's janky", "what is this effect called". For scroll-driven sites use scroll-site.
---

# Animate

Motion with a purpose: build it, name it, review it, and make it run at 60fps.

## Decide before building

Follow `animate`'s order every time:
1. Should this animate at all? Frequent actions should feel instant.
2. What is it for: feedback, orientation, continuity or delight?
3. Which tool: CSS, Web Animations, Motion/Framer, GSAP, canvas, WebGL.
4. Which properties: transform and opacity first.
5. Which curve and duration: `animation-systems` has the defaults.
6. What happens when it's interrupted, and how it exits.

`apple-design` covers springs, momentum and gesture-driven interfaces. `animation-vocabulary` turns a vague description into the right term ("the bouncy popover thing" is a pop-in).

## Pick the module by job

- **UI micro-interactions and transitions:** hover reveals, staggered words, marquees, loaders, paper transitions, glowing borders, liquid-metal edges, thinking orbs, gooey blobs.
- **Cursor and particles:** shader cursor trails, ripples, pointer trails, particle trails, ambient section particles, falling leaves, Matter.js physics.
- **Backgrounds and 3D accents:** WebGL grids and lasers, globes (globe.gl, cobe, particle globe), Unicorn Studio, Vanta, Hairline line figures.
- **React Native and Expo:** `animate-expo`.
- **Copy an interaction you've seen:** `video-to-superprompt` turns a screen recording into a build prompt; `html-to-interaction-prompts` does the same from a page's code.
- **Existing motion:** `review-animations` to critique, `improve-animations` for a codebase-wide plan, `find-animation-opportunities` for places that should move, `animation-performance` and `optimize-web-animations` for jank.

## Rules

- Respect `prefers-reduced-motion` with a real static alternative.
- One signature moment per page beats effects everywhere.
- Pause off-screen loops and canvas work when the tab is hidden.
- Check it on a phone: particle counts and shader cost drop there.

## Modules

37 merged skills live in `modules/`. Read a module's `MODULE.md` when its job comes up, and follow it. Paths inside a module are relative to that module's folder. When a module says to run or invoke another skill by its old name, open that module instead: it is in this skill's `modules/` folder or in another Mango skill's (`design`, `landing-page`, `prototype`, `scroll-site`, `animate`, `image`, `brand`, `review`, `demo`, `marketing`).

### Principles and building

| Module | Use it for |
|---|---|
| `animate` | Build an animation from scratch, making the decisions in the order that determines whether it feels right — should it animate at all, what purpose, which tool, which… |
| `animation-vocabulary` | Reverse-lookup glossary that turns a vague description of a web animation or motion effect into its exact term ("the bouncy thing when a popover opens" → Pop in; |
| `apple-design` | Apple's approach to interface design and fluid, physical motion, translated for the web. |
| `animation-systems` | Use when designing or implementing product-grade web motion like Stripe, Linear, Apple, and Vercel. |
| `animate-expo` | Build animations in React Native and Expo, making the decisions in the order that determines whether they feel right — should it animate, which thread it runs on, which… |

### Micro-interactions and transitions

| Module | Use it for |
|---|---|
| `reveal-hover-effect` | Build cursor-following spotlight reveals that expose a second aligned image through a soft radial mask. |
| `staggered-word-reveal` | Create subtle editorial word-by-word text reveal animations where each word fades and rises into place once it enters the viewport. |
| `marquee-loop` | Apply seamless infinite marquee loops using duplicated items. |
| `fire-paper-loader` | Build a burning-paper ring loader whose GLSL flame is drawn by a Worker on an OffscreenCanvas started from the head, so a main thread blocked by the page build cannot… |
| `paper-cinder-transition` | Change between pages, chapters or scenes with a paper-burn transition, a ragged ember line that sweeps across the frame, chars the old page ahead of it and reveals the… |
| `beam-glow-states` | Create React loading, processing, selected, current, focus, and pressed states with the border-beam package's animated edge glow. |
| `liquid-metal-border` | Add and tune animated liquid-metal WebGL borders with the React `metal-fx` package. |
| `thinking-orbs` | Add accessible animated AI loading and agent-status indicators with the React thinking-orbs library. |
| `gooey-blob-system` | Create a gooey blob system using SVG filters where multiple shapes merge into a single fluid form. |

### Cursor and particles

| Module | Use it for |
|---|---|
| `add-shader-cursor-trail` | Add the Shaders WebGPU mouse effect used for the Tidal Commons hero: a white twinkling halftone cursor trail driven by ChromaFlow, masked through a DotGrid, finished… |
| `shaders-cursor-ripples` | Add cursor-following fluid WebGPU distortion over an existing image with the Shaders library's ImageTexture and CursorRipples components. |
| `pointer-trail-emitter` | Build a cursor trail whose spacing stays constant at any hand speed, by emitting motes per unit of distance travelled rather than on a timer, so a flick draws the same… |
| `build-interactive-particle-trail` | Build a cursor or touch particle interaction that emits by distance along the traveled segment into a recycled GPU point pool, with optional keyboard-triggered bursts. |
| `ambient-section-particles` | Add a restrained particle atmosphere inside one section with configurable shapes, density, gravity, wind, sway, rotation, recycling or settling, pointer disturbance… |
| `falling-leaves` | Build falling leaves that read as leaves, with each one tumbling on its own axis so it presents a face, thins to an edge, and opens out again, and with its sideways slip… |
| `matterjs` | Use when implementing 2D physics interactions with Matter.js, including Engine/World setup, Render/Runner configuration, adding bodies and constraints, and… |

### Shaders, WebGL and 3D accents

| Module | Use it for |
|---|---|
| `background-grid-webgl` | Create a perspective WebGL background grid with fading lines, subtle particle haze, slow forward drift, and gentle camera parallax. |
| `webgl-laser` | Create a fixed full-screen WebGL laser background effect with a thin white-hot vertical core, restrained brand-colored halo, and soft smoky fog around the beam. |
| `globe-gl` | Use when implementing globe.gl (Globe.GL) for 3D globe data visualization with WebGL/ThreeJS, including setup, data layers (points, arcs, polygons, labels), and… |
| `globe-particles` | Create a globe-like 3D particle visualization with a dense luminous spherical core and thinner orbital ring or flattened disc. |
| `cobejs` | Use when adding a lightweight interactive globe with cobe (canvas setup, markers, interaction, performance, integration with React/Next.js). |
| `unicorn-studio` | Use when embedding and customizing Unicorn Studio interactive animations on the web (embed, responsive sizing, performance, layering with UI, fallbacks). |
| `vantajs` | Use when adding animated WebGL background effects with Vanta.js (setup, parameters, resizing, performance, integration in React/Next.js). |
| `hairline-create` | Use when someone asks for a new Hairline figure, or runs /hairline-create with an idea. |
| `hairline-adopt` | Use when someone has an SVG (an icon, a logo, an illustration) and wants it as a Hairline figure, or runs /hairline-adopt with a file. |

### Motion review and performance

| Module | Use it for |
|---|---|
| `review-animations` | Reviews animation and motion code against a high craft bar derived from Emil Kowalski's design engineering philosophy. |
| `improve-animations` | Survey a codebase's animation and motion code as a senior motion advisor, then produce a prioritized audit and self-contained implementation plans for other agents (or… |
| `find-animation-opportunities` | Search a codebase or UI for places that don't animate but should, and reject everything that shouldn't. |
| `animation-performance` | Keep web animations inside the frame budget — animate composite-only properties, keep motion off the main thread when the page is busy, and find the cause when an… |
| `optimize-web-animations` | Profile, audit, and optimize frontend page performance with emphasis on animation work, memory-leak risks, long-session slowdowns, CSS animations, canvas/WebGL… |

### Copy an interaction

| Module | Use it for |
|---|---|
| `video-to-superprompt` | Turn a reference video into a super detailed recreation or inspiration prompt. |
| `html-to-interaction-prompts` | Convert a supplied HTML page or generated HTML reference into a screenshot-backed article containing multiple reusable interaction prompts. |

Original authors and licenses: see `SOURCES.md`.
