---
name: landing-page
description: Build, redesign or review landing pages and marketing sites: one offer, one audience, one primary action. Runs intake questions, picks the page structure and layout, writes conversion copy and SEO, applies a strict visual system (type, spacing, radius, backgrounds, hero, icons, motion), then hands the page to the Super Design judge loop until it scores 8/10. Covers pricing pages and premium, award-level marketing sites. Use for "landing page", "marketing site", "web design", "homepage", "pricing page", "hero section", "write the copy for this page", "make this page convert". For app screens and general UI use design; for scroll-story sites use scroll-site.
---

# Landing Page

The web design skill for pages that sell: one offer, one audience, one primary action. It owns the strategy, structure, copy and visual rules for landing pages and marketing sites. `/design` owns the general craft and the judge loop it finishes with.

## Process

### 1. Intake and strategy

Start with `landing-page-design` Part A: intake questions, page structure, layout selection, conversion rules, copy, build order, SEO and pitfalls. Settle the offer, audience and primary action before any visual work. Ask the intake questions only where the project and conversation don't already answer them.

### 2. Visual system

Apply `landing-page-design` Part B as the default, non-negotiable rules for type, spacing, radius, backgrounds, hero, icons, motion, content realism, states and ship requirements. If the user or the project has its own design system or a direction, that wins. Otherwise, pick a named look from `web-design-engineer`'s style recipes or a family in `/prototype`, then keep Part B's spacing, type scale and realism rules underneath it.

### 3. Build

- Standard landing page: follow `landing-page-design`'s build order.
- Pricing page: `pricing-page`.
- Premium, motion-led, award-level marketing site: `build-awwwards-quality-sites`. For pinned and scrubbed scroll storytelling, hand that part to `/scroll-site`.
- HTML craft, React artifacts, design critique and browser acceptance: `web-design-engineer`.
- Images: `/image`. Motion moments: `/animate`. Product shots: `/demo`.
- Want to compare directions first? Run `/prototype` on the content, pick one, then come back here.

### 4. Judge loop to 8/10

Hand the built page to `/design`'s judge loop: screenshots with `.claude/skills/review/scripts/shoot.mjs`, an independent judge per `.claude/skills/review/references/judge.md`, fixes worst first, until it passes or a stop rule fires. Add these landing-page checks to the judge's brief:
- Is the one primary action obvious above the fold on desktop and phone?
- Does the hero say what it is, who it's for and why now, in plain words?
- Does every section move the reader toward the action?
- Is the proof real: no invented logos, numbers or quotes?

### 5. Ship

Run `landing-page-design`'s quick checklist and ship requirements: meta tags, Open Graph image, favicon, performance, forms that work, and analytics if the user wants them.

## Rules

- A landing page is not a homepage. Cut anything that serves a second intent.
- Real copy only. If facts are missing, ask or mark the gap clearly; never invent proof.
- Phone first for the hero and CTA: most visitors arrive on a phone.

## Modules

5 merged skills live in `modules/`. Read a module's `MODULE.md` when its job comes up, and follow it. Paths inside a module are relative to that module's folder. When a module says to run or invoke another skill by its old name, open that module instead: it is in this skill's `modules/` folder or in another Mango skill's (`design`, `landing-page`, `prototype`, `scroll-site`, `animate`, `image`, `brand`, `review`, `demo`, `research`).

### Landing page system

| Module | Use it for |
|---|---|
| `landing-page-design` | Complete system for high-converting landing pages: intake, page structure, layout, conversion copy, SEO, and strict visual rules for type, spacing, radius, backgrounds, hero, icons and motion. |
| `landing-page` | Use when designing or rewriting a high-converting landing page (single-offer page) for SaaS/apps/services. |
| `pricing-page` | Use when designing or rewriting a high-converting SaaS pricing page (structure, plan design, copywriting, SEO/AEO, FAQs, layout patterns, experiments). |

### Web design craft

| Module | Use it for |
|---|---|
| `web-design-engineer` | Build or redesign polished browser-rendered visual artifacts with HTML/CSS/JavaScript/React: pages, dashboards, prototypes, slide decks, animations, UI mockups, and data… |
| `build-awwwards-quality-sites` | Art-direct and implement distinctive, motion-rich marketing, editorial, portfolio, and landing websites with original reference-inspired imagery, standout heroes, GSAP… |

Original authors and licenses: see `SOURCES.md`.
