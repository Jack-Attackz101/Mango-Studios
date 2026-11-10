---
name: prototype
description: Turn a site, app or idea into a gallery page of many full-page prototypes, each the same content in a different theme, that you can open full screen and flip through. Themes come from 36 visual styles grouped into 8 families (dark glass, atmospheric dark, clean light, editorial, agency grids, brutalist, skeuomorphic, SaaS) plus brand-inspired style recipes. Output is a local folder served on localhost or a published artifact. Use for "prototype this", "show me versions", "different themes", "explore directions", "mood options", or turning daily inspiration captures into landing-page builds. For polishing one chosen direction to 8/10, hand off to design.
---

# Prototype

Make one gallery page that holds several complete versions of the same site, each in a different theme. The user clicks a version to open it full size or full screen, then picks a direction to take into `/design`.

## Inputs

- **A URL**: capture its content and structure.
- **A local project**: read the pages and components.
- **A brief or idea**: write real draft copy for it first.
- **A daily inspiration capture**: use the `build-daily-inspiration-sites` engine (5 original builds from 5 references).

## Process

### 1. Content model

Pull the real content into `content.json` before designing anything:
- `brand`, `nav`, `hero` (headline, subhead, CTAs)
- `sections` (a list with type, heading, body and items)
- `proof` (logos, quotes, numbers)
- `footer`, `images` (paths or URLs, with alt text)

Every version uses this same content, so the comparison is about design, not words. For a URL, use the awwwards MCP (`analyze_page_structure`, `capture_component`) or read the HTML. Never invent metrics or logos.

### 2. Pick themes

Default to 6 versions, each from a different family, unless the user names themes or a count. See the family table below. Mix light and dark. Add a brand-inspired recipe from `/landing-page`'s `web-design-engineer` module (`.claude/skills/landing-page/modules/web-design-engineer/references/style-recipes/`) when it fits the subject. The user can also ask for a theme not in the list; write a short token set for it and build it the same way.

### 3. Build the versions

Each version is one self-contained HTML file: inline CSS, Google Fonts only, no build step, real content from `content.json`, responsive down to 390px. Build versions in parallel with subagents (Agent tool), one per theme. Give each subagent:
- the path to `content.json`
- the path to its theme module's `MODULE.md`
- the output file name `v-<theme-slug>.html`
- the rules: one direction only, real content, works at phone width, no lorem ipsum

Optional details per version: one signature motion moment from `/animate`, illustrations from `/design`'s illustration modules, images from `/image`.

### 4. Build the gallery

Copy `assets/gallery.html` to `index.html` in the output folder and fill in the `VARIANTS` list (slug, file, name, family, one-line description). The gallery shows a live thumbnail of every version. A click opens it full size, the Full screen button goes browser full screen, arrow keys flip between versions, and Esc closes.

### 5. Optional quick score

If the user wants a pick, shoot each version with `.claude/skills/review/scripts/shoot.mjs` and run one judge round per version (`.claude/skills/review/references/judge.md`). Put the score in each variant's `score` field so the gallery shows it.

### 6. Deliver

- **Local (default in a code project):** write to `prototypes/<yyyy-mm-dd>-<name>/`. Serve it with `npx -y serve -l 4173 <folder>` or `python3 -m http.server 4173 -d <folder>`, then report the port so the user can open it.
- **Artifact (when asked, or with no local project):** publish `index.html` with the version files as supporting files, so it opens anywhere.

End by asking which version to take forward, then hand off to `/design` with that file as the starting point.

## Theme families

| Family | Feel | Good for |
|--------|------|----------|
| Dark glass and tech | Frosted panels, thin lasers, tech greens and purples | AI, dev tools, dashboards |
| Atmospheric dark | Light folds, dither, mesh gradients | Launches, premium tech, studios |
| Clean light and paper | Beige, paper, soft clouds, quiet grids | SaaS, services, calm brands |
| Editorial | Magazine grids, serif-led, image-first | Portfolios, publishing, hospitality |
| Agency grids and frames | Visible grid, nested frames, technical layouts | Agencies, studios, B2B |
| Brutalist | Billboard type, raw black and white | Culture, fashion, bold studios |
| Skeuomorphic and tactile | Real-world materials, depth, high contrast | Consumer apps, hardware |
| SaaS and product | Product proof, enterprise ops, bold duotone | B2B SaaS, AI products |

Each theme's module is listed under its family below.

## Modules

38 merged skills live in `modules/`. Read a module's `MODULE.md` when its job comes up, and follow it. Paths inside a module are relative to that module's folder. When a module says to run or invoke another skill by its old name, open that module instead: it is in this skill's `modules/` folder or in another Mango skill's (`design`, `landing-page`, `prototype`, `scroll-site`, `animate`, `image`, `brand`, `review`, `demo`, `research`).

### Prototype engines

| Module | Use it for |
|---|---|
| `prototype` | Build multiple genuinely different versions of a UI piece you describe, rendered behind a visual picker so you can flip through them live and promote the one that feels… |
| `build-daily-inspiration-sites` | Turn a completed daily UI inspiration capture into exactly five original landing-page builds, one per separate Codex task, using Sites. |

### Dark glass and tech

| Module | Use it for |
|---|---|
| `blue-laser-clean-glass-layout` | Create a clean dark glass layout system with a thin blue laser atmosphere, frosted premium shells, and polished dashboard structure. |
| `dark-glass-clean-layout` | Create a dark glass layout system with frosted premium shells, clean multi-column workspace structure, floating data cards, and restrained atmospheric depth. |
| `glass-dark-ui` | Build dark-mode glassmorphism interfaces with readable contrast, frosted surfaces, and gradient borders using a pseudo-element mask. |
| `glass-dark-mode-clock` | Create a dark glass design system with frosted shells, soft beam grids, circular clock-like calibration dials, and precise sci-fi instrument framing. |
| `framed-tech-dark-border-gradient` | Create a framed dark technical design system with border-gradient shells, asymmetrical grid panels, mono utility labeling, and restrained monochrome atmosphere. |
| `tech-green-dark-mode-modern` | Create a modern dark-mode technical design system with matte-black surfaces, emerald signal accents, mono system labeling, framed dashboard cards, and restrained glow. |
| `bright-green-tech-system-webgl` | Create a bright-green technical design system with structured split layouts, hard-framed dark surfaces, mono utility labels, and a prominent WebGL visualization zone. |
| `funky-purple-container-tech` | Create a dark container-led technical design system with fuchsia-purple accents, layered rounded shells, crisp frame lines, and playful futuristic focal objects. |

### Atmospheric dark

| Module | Use it for |
|---|---|
| `atmosphere-background` | Create a dark atmospheric background with drifting vertical light folds, screen-blended glow, and a concentrated luminous corner or lower-edge bloom. |
| `dither-background` | Create a dark monochrome procedural background with enlarged square pixels and visible Bayer-style ordered dithering. |
| `dither-laser-dark-mode` | Create a dark premium design system that combines near-black surfaces, subtle ordered-dither texture, and a thin accent-colored laser atmosphere. |
| `mesh-gradient-dark-blue-clean` | Create a futuristic, premium, clean dark-blue mesh-gradient design system across background rendering, hero shell, navigation, floating nodes, framed sections, CTAs, and… |
| `dark-blue-contrasting-clean` | Create a dark-blue clean design system with strong contrast, cobalt gradient feature blocks, crisp framed structure, and restrained premium glow. |

### Clean light and paper

| Module | Use it for |
|---|---|
| `clean-minimal-beige-light-mode` | Create a clean minimal beige light-mode design system with warm neutral shells, quiet process grids, restrained accent color, and elegant low-contrast structure. |
| `light-mode-paper-technical` | Create a light-mode technical design system with warm paper surfaces, dark outer framing, subtle diagonal texture, precise bracketed geometry, and restrained accent… |
| `orange-clean-paper-saas` | Create a clean paper-toned SaaS design system with warm neutrals, orange accent signals, rounded premium forms, and polished product illustration surfaces. |
| `blue-cloudy-clean-modern` | Create a clean modern design system with a luminous blue sky atmosphere, soft drifting cloud light, minimal white framing, and serene premium typography. |
| `minimalist-ui` | Clean editorial-style interfaces. Warm monochrome palette, typographic contrast, flat bento grids, muted pastels. |

### Editorial

| Module | Use it for |
|---|---|
| `editorial-tech` | Blend editorial magazine composition with precision product-tech detailing using asymmetrical grids, cinematic media bands, mono utility labels, and restrained accent… |
| `editorial-portfolio-chapters` | Create or redesign creative-studio, agency, photographer, artist, and portfolio websites where project work leads the story. |
| `book-serif-index` | Create an archival book-reader design system with serif-led pages, mono index navigation, aged paper surfaces, margin notes, and a premium catalog frame. |
| `editorial-service-booking` | Create or redesign appointment-based service websites for salons, barbers, spas, wellness studios, clinics, and hospitality brands. |
| `image-first-grid-layout` | Create an image-led grid design system with full-bleed photography, structural guide lines, anchored content blocks, and restrained technical overlays. |

### Agency grids and frames

| Module | Use it for |
|---|---|
| `agency-grid-layout-minimal` | Create a minimal agency design system with a disciplined editorial grid, oversized typography, quiet uppercase utility labels, restrained image blocks, and subtle… |
| `framed-grid-layout` | Create minimal framed grid layouts with thin visible boundary lines, L-shaped corner brackets, subtle diagonal line texture, and strict section alignment. |
| `nested-container-clean-agency` | Create a clean agency design system built from nested containers, with an outer editorial shell, inset dark feature blocks, rounded premium cards, and restrained accent… |
| `nested-container-frames` | Create a container-in-container layout system using nested frames. |
| `split-layout-technical` | Create a technical split-screen design system with dual panels, fine frame lines, mono metadata, quiet editorial typography, and premium inset surfaces. |
| `technical-wireframe-info-layout` | Create a monochrome technical wireframe design system with exploded 3D structure, connector annotations, sparse information labels, and precise dark diagnostic framing. |

### Brutalist

| Module | Use it for |
|---|---|
| `documentary-brutalist-agency` | Create or redesign creative agency, production studio, architecture, culture, and portfolio websites with billboard typography, hard black-and-white chapters, exposed… |
| `industrial-brutalist-ui` | Raw mechanical interfaces fusing Swiss typographic print with military terminal aesthetics. |

### Skeuomorphic and tactile

| Module | Use it for |
|---|---|
| `skeuomorphic-ui` | Create skeuomorphic web UI surfaces with layered gradients, stacked inner and outer shadows, reflective gradient borders, micro texture, and embossed text or icon details. |
| `high-contrast-skeuomorphic-clean` | Create a high-contrast clean skeuomorphic design system with molded dark surfaces, crisp light separation, tactile inset depth, and restrained signal accents. |

### SaaS and product

| Module | Use it for |
|---|---|
| `product-proof-saas` | Create or redesign SaaS and AI product landing pages where a real workflow, interface, or deterministic demo is the central proof. |
| `operational-enterprise-ai` | Create or redesign enterprise AI, automation, security, and operations product pages that explain system boundaries, approvals, auditability, exceptions, and rollback. |
| `solar-duotone-bold` | Use Iconify Solar Duotone Bold icon style. |

Original authors and licenses: see `SOURCES.md`.
