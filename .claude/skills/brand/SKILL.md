---
name: brand
description: Brand identity and design systems. Create brand-guideline boards, logo systems and identity decks; build reference-inspired brand worlds; and build, audit, document or migrate a design system (tokens, components, states, specs, docs), map hardcoded styles to tokens, write a DESIGN.md, or choose a UI component library. Use for "make a brand", "brand kit", "logo", "design system", "our UI is inconsistent", "extract tokens", "document this component", "migrate to our design system", "which UI library". For designing pages with an existing system use design.
---

# Brand

The identity and the system underneath every page: what the brand looks like, and the tokens and components that make it consistent.

## Which mode

- **New brand identity:** `brandkit` for guideline boards, logo concepts and identity decks. `generate-reference-inspired-brand-worlds` for a full visual world drawn from references without copying them.
- **The whole app is inconsistent** ("we need a design system", "fix our UI"): start with `design-system-boss`. It triages, then runs the other system modules in order.
- **One phase of system work** (extract tokens, add states and specs to a component, start from an empty repo): `build-design-system`.
- **Move an app onto an existing system:** `migrate-design-system`.
- **Audit, document or extend a design system** quickly (naming, hardcoded values, component docs): `design-system`.
- **Check token use on a page or diff:** `token-mapping` (read-only).
- **Document one component:** `component-docs`.
- **A DESIGN.md for agents** (Google Stitch or any coding agent): `stitch-design-taste`.
- **Choose a component library:** `pick-ui-library`.

## Rules

- Tokens get semantic names (`--color-text-muted`, not `--grey-3`).
- Every color token has a light and a dark value.
- A new system is checked against real screens, not just a token sheet.
- Once the system exists, `/design` and `/prototype` must use it instead of their own styles.

## Modules

10 merged skills live in `modules/`. Read a module's `MODULE.md` when its job comes up, and follow it. Paths inside a module are relative to that module's folder. When a module says to run or invoke another skill by its old name, open that module instead: it is in this skill's `modules/` folder or in another Mango skill's (`design`, `landing-page`, `prototype`, `scroll-site`, `animate`, `image`, `brand`, `review`, `demo`, `marketing`).

### Brand identity

| Module | Use it for |
|---|---|
| `brandkit` | Premium brand-kit image generation skill for creating high-end brand-guidelines boards, logo systems, identity decks, and visual-world presentations. |
| `generate-reference-inspired-brand-worlds` | Generate multiple original brand campaign worlds from a supplied visual reference while controlling how close the new work feels without copying protected signature… |

### Design systems

| Module | Use it for |
|---|---|
| `design-system-boss` | Use for vague whole-app design system asks on an app that already ships UI, like "our UI is a mess, fix it", "we need a design system", "we hardcode colors everywhere"… |
| `build-design-system` | Use when an ask names one phase of design system work, such as "extract tokens from the app" or "add states and specs to our Button", or for an empty repo, such as… |
| `migrate-design-system` | Use when an app has to move onto a design system that already exists, such as "migrate the app to our design system", "move every screen onto the new components", a… |
| `token-mapping` | Reports how hardcoded style values on a page, file or diff map onto a project's existing design tokens, purpose first, then value. |
| `component-docs` | Writes one component's documentation entry from its code, stories and real call sites, in a Geist-style page order. |
| `stitch-design-taste` | Semantic Design System Skill for Google Stitch. |
| `pick-ui-library` | Pick the right library for a given frontend task from a curated, opinionated list — numbers, OTP inputs, charts, command menus, virtualization, drag and drop, toasts… |
| `design-system` | Audit, document, or extend your design system. |

Original authors and licenses: see `SOURCES.md`.
