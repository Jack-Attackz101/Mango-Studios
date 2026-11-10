---
name: scroll-site
description: Build cinematic scroll-driven websites, the 10k-site style, where scrolling moves the story. Smooth scroll with Lenis, GSAP ScrollTrigger timelines, pinned scenes, scrubbed image sequences, word-by-word reveals, horizontal scroll chapters, progress timelines and WebGL-heavy landing pages. Use for "scroll site", "scrollytelling", "cinematic landing page", "Awwwards-style scroll", "pin this section", "scrub this video on scroll", or debugging GSAP and ScrollTrigger. For motion that isn't tied to scroll use animate; for overall visual design and the 8/10 judge loop use design.
---

# Scroll Site

Build a site where scrolling drives the story: chapters, pinned scenes, scrubbed sequences and reveals that land in the right place on every screen.

Anthropic's `10k-websites` skill also builds and deploys scroll sites, and it handles hosting and AI-generated hero video. Use it for the deploy pipeline; use this skill for the scroll mechanics and craft.

## Process

1. **Story first.** Write the chapters before choosing effects: what each section says, and what the scroll should reveal there. `cinematic-scroll-storytelling` and `scroll-world-storytelling` turn a narrative into chapters.
2. **Pick one engine:**
   - Lenis + GSAP ScrollTrigger (default): `cinematic-gsap-lenis-motion-system`, `gsap-scrolltrigger-storytelling`, `gsap`.
   - Native CSS scroll timelines for light pages with no JavaScript budget: `animation-on-scroll`.
   - A persistent WebGL world when the page is one continuous 3D place: `scroll-world-storytelling`, `webgl-landing-steering`.
   Only one smooth-scroll engine per page.
3. **Build chapter by chapter.** Lock each section before starting the next. The effect modules below each own one move: horizontal scenes, scrubbed image sequences, word reveals, masked reveals, progress timelines.
4. **Copying a reference site's motion:** capture it with `/research` (`awwwards-motion-study`), then build it with `motion-authoring`.
5. **Check it.**
   - Phone: pinned sections must not trap scroll; test at 390px.
   - Reduced motion: every scrubbed or pinned effect has a static fallback.
   - Performance: animate transform and opacity only; see `/animate`'s `animation-performance`.
   - Design score: run `/design`'s judge loop or `/review` for the 8/10 bar.

## Rules

- Content must be readable with scrolling effects off.
- Never hijack scroll speed beyond what Lenis smooths.
- Keep the first screen complete at rest: no hero that waits for a scroll to appear.

## Modules

13 merged skills live in `modules/`. Read a module's `MODULE.md` when its job comes up, and follow it. Paths inside a module are relative to that module's folder. When a module says to run or invoke another skill by its old name, open that module instead: it is in this skill's `modules/` folder or in another Mango skill's (`design`, `landing-page`, `prototype`, `scroll-site`, `animate`, `image`, `brand`, `review`, `demo`, `research`).

### Scroll engines and storytelling

| Module | Use it for |
|---|---|
| `cinematic-gsap-lenis-motion-system` | Create premium cinematic web motion systems with GSAP, ScrollTrigger, and Lenis. |
| `cinematic-scroll-storytelling` | Create cinematic scroll-driven landing pages with Lenis smooth scrolling, GSAP ScrollTrigger, scroll-linked progression, staggered text reveals, sticky card stacks… |
| `gsap-scrolltrigger-storytelling` | Build cinematic sticky product storytelling with GSAP ScrollTrigger, progressive UI reveals, scroll-synced animation, smooth interpolation, and immersive section… |
| `scroll-world-storytelling` | Turn an article, case study, brand narrative, product journey, or long-form story into a cinematic scroll-driven landing page using one of three renderers: scrubbed… |
| `gsap` | Use when you need to add or debug professional web animations with GSAP (timelines, ScrollTrigger, stagger, transforms) in HTML/CSS/JS/React. |
| `motion-authoring` | Use when a converted project (build_project --authored) needs its motion authored — turning motion.manifest.json + inert skeletons into real per-section/page motion with… |

### Scroll effects

| Module | Use it for |
|---|---|
| `animation-on-scroll` | Create an on-scroll animation trigger using IntersectionObserver with Tailwind-friendly animation classes and keyframes. |
| `horizontal-scroll-scenes` | Build scene-by-scene chapters that advance left to right on one fixed stage while the user scrolls vertically, with native scroll as the only input. |
| `scroll-progress-timeline` | Turn any ordered process into a data-driven vertical or horizontal scroll story with a base line, progress fill, active step states, responsive collapse, semantic… |
| `scroll-scrubbed-visual-sequence` | Build reversible scroll-controlled visual transformations with a pinned or sticky stage, normalized progress, and video, image-sequence, canvas, SVG, or DOM renderers. |
| `scroll-scrubbed-word-reveal` | Reveal marked-up text word by word as scroll progress advances, while preserving semantic inline links, emphasis, responsive line wrapping, and reduced-motion readability. |
| `masked-reveal` | Create masked staggered word reveals on scroll with GSAP ScrollTrigger. |
| `webgl-landing-steering` | Use when creating or refining WebGL-heavy landing pages and you need to steer toward a specific visual outcome (premium, technical, playful, cinematic) while balancing… |

Original authors and licenses: see `SOURCES.md`.
