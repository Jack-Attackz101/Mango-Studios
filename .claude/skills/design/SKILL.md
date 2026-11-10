---
name: design
description: Super Design. The main skill for making any website, page, app screen or component look great. It sets an art direction, builds or redesigns the UI, then runs a judge loop where a second AI scores the result against the Mango rubric and the builder fixes issues until it scores 8/10 or higher. Use for "design this", "make this look good", "redesign this", "this looks AI-generated", "polish this screen", "critique this", app screens, dashboards, components, illustration, CSS details, UX copy, user research, dev handoff and design inspiration from Awwwards, on any stack (HTML/CSS, React, Next.js, Vue, Svelte, Astro, Tailwind). For landing pages and marketing sites use landing-page; for many themed versions side by side use prototype; for scroll-driven story sites use scroll-site; for a review without changes use review.
---

# Super Design

Take a page from wherever it is to a design that scores 8/10 or higher with an independent judge. The modules below hold the detailed playbooks from the merged skills; this file is the process that ties them together.

Paths that start with `<skills>/` point into your other Mango skills. `<skills>` is the folder that holds this skill's folder (the parent of this skill's base directory), so `<skills>/review` is the review skill, wherever the skills are installed.

## When to use something else

- Landing pages and marketing sites: `/landing-page` (it uses this skill's judge loop to finish)
- Several themed versions to compare: `/prototype`
- A scroll-driven story site with pinned scenes and scrubbed motion: `/scroll-site`
- Motion, cursor effects, particles, shaders: `/animate`
- Generating or sourcing images: `/image`
- Brand identity or a design system: `/brand`
- A graded report with no changes: `/review`

## The loop

### 1. Intake

Work out what exists and what it is for. Read the code or open the URL. Note the audience, the page's one job, and any direction the user gave. If the project has a design system (tokens, theme file, CLAUDE.md rules), it wins over every module below. Ask at most one question, only if the page's purpose can't be inferred.

### 2. Baseline score

If there is an existing page, shoot it and judge it before changing anything (round 0). This shows the user where it started and tells you what to fix first.

```
node <skills>/review/scripts/shoot.mjs <url-or-file> <outDir> --label r0
```

Then run the judge as described in `<skills>/review/references/judge.md`.

### 3. Direction

Pick one art direction before writing code, and write it down as tokens (palette, type pairing, spacing scale, layout concept). Sources, in order:
1. The user's words and the project's existing system.
2. `tastemaker` for a direction drawn from the product itself, or to match reference images.
3. `/landing-page`'s `web-design-engineer` style recipes when the user names a look ("Aesop", "Linear", "Swiss").
4. `design-taste-frontend` for the anti-generic house rules and section blueprints.
5. `better-ui`, `high-end-visual-design` and `emil-design-eng` for the finish: exact values for radius, shadows, icon states, press and transition timing.
6. The theme families in `/prototype` when you want a ready-made look.

Need references first? `awwwards-inspiration` searches award-winning sites by style, color or tech and pulls their design DNA (run `awwwards-setup` on first use, `awwwards-doctor` if the tools fail). References inform the direction; they are never copied.

Use only one direction per page. Mixing modules' looks produces exactly the generic result this skill exists to avoid.

### 4. Build or redesign

- New screen or page: `design-first-ui-prompting` to plan sections first. Landing pages, pricing pages and marketing sites go to `/landing-page`.
- Existing page: `redesign-existing-projects` to upgrade without breaking functionality, `unslop` to strip AI-looking defaults in its fixed order (spacing, color, icons, copy, type, layout, details, visuals, motion).
- Details: `better-ui` first for exact polish values, then the other Details and CSS modules (shadows, gradient borders, masks, corner cuts, progressive blur, container lines).
- Illustration: one of the illustration modules when the page needs drawn art. Pick one style for the whole page.
- Phone: `mobile-native` for the fixes that make a web page feel native.
- Words on the page: `ux-copy` for buttons, errors, empty states and microcopy.
- Long outputs: follow `full-output-enforcement`; never leave placeholder code.

### 5. Judge loop

Repeat until the judge passes the page or a stop rule fires:
1. Shoot desktop and phone with `shoot.mjs`.
2. Spawn a fresh judge subagent with only the rubric, the screenshots and the brief (see `judge.md`). The judge scores with the rubric and writes a full critique using the `design-critique` framework: first impression, usability, hierarchy, consistency, accessibility.
3. Fix issues worst first: every critical, then majors, then cheap minors.
4. Log the round in the score table.

Pass is overall 8.0 or more, no dimension below 7, and no critical issue. Stop after 5 rounds, or on a plateau, and report what is left. Never score your own work; only the judge's number counts.

### 6. Report

Give the user: the score table, the judge's final critique, before and after screenshots (fold, desktop and phone), what changed, and anything left under 8. Keep it short.

## Other jobs this skill covers

- **Critique only:** run one judge round and return the critique without changing anything. For a full graded audit, use `/review`.
- **Plan the research:** `user-research` for interview guides, usability tests and surveys; `research-synthesis` to turn notes, transcripts or survey results into themes and next steps.
- **Handoff:** `design-handoff` for a developer spec sheet (layout, tokens, props, states, breakpoints).
- **Big multi-step work:** `iterate-until-verified` for fanning work out to subagents with independent checks.
- **Make a new skill from a source:** `web-technique-to-skill` or `article-prompts-to-skills`.

## Rules that always apply

- Real content only: no lorem ipsum, fake logos or invented metrics.
- Both themes if the page supports dark mode.
- Accessible by default: contrast, focus states, alt text, reduced motion.
- Don't break working features while redesigning. Run the project's build or tests after big changes.

## Modules

40 merged skills live in `modules/`. Read a module's `MODULE.md` when its job comes up, and follow it. Paths inside a module are relative to that module's folder. When a module says to run or invoke another skill by its old name, open that module instead: it is in this skill's `modules/` folder or in another Mango skill's (`design`, `landing-page`, `prototype`, `scroll-site`, `animate`, `image`, `brand`, `review`, `demo`, `marketing`).

### Art direction and taste

| Module | Use it for |
|---|---|
| `tastemaker` | Generate genuinely beautiful, on-brand UI instead of generic "AI slop" — use whenever the user asks to build, design, style, or improve a UI, landing page, dashboard… |
| `design-taste-frontend` | tasteskill v2, the anti-slop frontend skill. |
| `design-taste-frontend-v1` | The original v1 taste-skill, preserved for projects depending on its exact behavior. |
| `design-taste-frontend-v2-experimental` | Old v2 (experimental) of taste-skill, the single-file dial-driven version, preserved for projects depending on its exact behavior. |
| `high-end-visual-design` | Teaches the AI to design like a high-end agency. |
| `gpt-taste` | Elite UX/UI & Advanced GSAP Motion Engineer. |
| `emil-design-eng` | This skill encodes Emil Kowalski's philosophy on UI polish, component design, animation decisions, and the invisible details that make software feel great. |

### Build and redesign

| Module | Use it for |
|---|---|
| `redesign-existing-projects` | Upgrades existing websites and apps to premium quality. |
| `unslop` | Turns vibecoded, AI-looking UI into a designed interface with its own character. |
| `design-first-ui-prompting` | Use when you need design-first, spec-driven, skimmable prompts for UI generation. |
| `mobile-native` | Make a web app feel native on a phone — the small CSS and meta-tag fixes that separate "a website in a browser" from something that feels installed. |
| `full-output-enforcement` | Overrides default LLM truncation behavior. |

### Details and CSS

| Module | Use it for |
|---|---|
| `beautiful-shadows` | Apply exact Tailwind arbitrary shadow utilities for polished, layered neutral elevation. |
| `container-lines` | Add vertical container-size guide lines with mini corner squares for precise, structured web layouts. |
| `corner-diagonals` | Apply diagonal-cut corners and chamfered edges to buttons, cards, panels, and container shells. |
| `corner-lasers` | Create a corner-anchored laser composition with thin beams, a bright emitter node, bloom, and atmospheric glow or fog. |
| `css-alpha-masking` | Apply CSS alpha masking with linear-gradient for horizontal or vertical edge fades (mask-image and -webkit-mask-image). |
| `css-border-gradient` | Apply subtle gradient-border treatments for premium web surfaces. |
| `number-details` | Add decorative 01, 02, 03 numeric detail markers. |
| `progressive-blur` | Create a layered CSS progressive blur (top or bottom) using multiple backdrop-filter masks for depth and softness. |
| `tailwindcss` | Use when designing/implementing UI with Tailwind CSS (layout, typography, responsive, theming, component patterns). |
| `ask-sonner` | Guide to Sonner, the React toast library — install and wire up the Toaster, pick the right toast() call, promise and loading toasts, updating, dismissing and persisting… |
| `better-ui` | Polishes surfaces, icons and motion with exact values for border radius, optical alignment, shadows, icon states and animation. |

### Illustration

| Module | Use it for |
|---|---|
| `illustration-framed-panel` | Draws original design-and-coding scenes as SVG cards (480x360) in a framed-panel cartoon style. |
| `illustration-grainy-gouache` | Draws original cosy animal scenes as hand-authored SVG cards (480x360) in a grainy gouache, risograph-like style. |
| `illustration-halftone-line` | Draws hand-authored SVG spot illustrations in a halftone line style for design and coding scenes. |
| `illustration-ink-sketch` | Draws hand-inked cartoon critters and living objects as SVG cards (480x360), each acting out a coding or design idea. |
| `illustration-line-interior` | Draws original hand-written SVG spot scenes in the Line interior style, wide airy rooms or terraces where slim, realistic people do design and coding work. |
| `illustration-one-line` | Draws original hand-written SVG spot illustrations in the One-line style, joyful action figures doing design and coding work. |

### References and inspiration

| Module | Use it for |
|---|---|
| `awwwards-inspiration` | Use when building a site that needs design references (e.g. |
| `awwwards-setup` | Use when the awwwards MCP server or its skills are invoked for the first time in a session or on a new machine — when no awwwards preferences exist yet, or the user asks… |
| `awwwards-doctor` | Use when awwwards-mcp scraping or tools stop working — BlockedError, "layout may have changed" parser errors, empty results, failed captures, stale searches — or when… |
| `web-technique-to-skill` | Turn a visual or interaction technique you already built into a reusable web-design skill, by isolating the one mechanism that makes it work while reproducing its… |
| `article-prompts-to-skills` | Convert an article, tutorial, or prompt pack into focused reusable AgentSkills, one independent capability per skill, with portable instructions, example prompts… |

### Loops and verification

| Module | Use it for |
|---|---|
| `iterate-until-verified` | Apply a prompt-agnostic execution and verification loop to any substantial task while preserving the original request. |

### Critique and research

| Module | Use it for |
|---|---|
| `design-critique` | Get structured design feedback on usability, hierarchy, and consistency. |
| `user-research` | Plan, conduct, and synthesize user research. |
| `research-synthesis` | Synthesize user research into themes, insights, and recommendations. |
| `ux-copy` | Write or review UX copy — microcopy, error messages, empty states, CTAs. |
| `design-handoff` | Generate developer handoff specs from a design. |

Original authors and licenses: see `SOURCES.md`.
