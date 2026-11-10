---
name: image
description: Get the images a page needs, by generating them or sourcing them. Generate website section comps and hero art, mobile app screen concepts, transparent PNG assets and sprites, and design images to code from; source free stock photos (Aura Assets, Unsplash) and real company logos (Simple Icons). Use for "make an image", "generate a hero", "design mockup image", "find photos", "add logos", "image for this section". For drawn illustration styles use design; for brand boards and logos use brand.
---

# Image

Find or make the right image, then put it on the page properly.

## Generate or source?

- **Real people, places or products:** source real photos, never generated ones. Use `unsplash-asset-images` or `aura-asset-images`.
- **Company or tool logos:** `company-logos` (Simple Icons). Never draw a logo by hand.
- **Art-directed hero or section visuals:** generate with `imagegen-frontend-web`, which makes one image per section.
- **App screen concepts:** `imagegen-frontend-mobile`.
- **Transparent assets** (ornaments, sprites, icons, emblems): `codex-gpt-image-2-5-flare`.
- **Design-by-image** (generate the page as images first, then build to match): `image-to-code`.

Generation needs an image tool in the session. If none is available, say so and source instead.

## Put it on the page right

- Save into the project's assets folder with descriptive names.
- Serve modern formats (AVIF or WebP) at the sizes actually displayed, with `srcset`.
- Write alt text that describes the content, or `alt=""` for decoration.
- Note each image's license and source in a comment or an assets README.
- Keep one style across a page. Mixing photo styles reads as stock.

## Modules

7 merged skills live in `modules/`. Read a module's `MODULE.md` when its job comes up, and follow it. Paths inside a module are relative to that module's folder. When a module says to run or invoke another skill by its old name, open that module instead: it is in this skill's `modules/` folder or in another Mango skill's (`design`, `landing-page`, `prototype`, `scroll-site`, `animate`, `image`, `brand`, `review`, `demo`, `research`).

### Generate

| Module | Use it for |
|---|---|
| `imagegen-frontend-web` | Elite frontend image-direction skill for generating premium, conversion-aware website design references. |
| `imagegen-frontend-mobile` | Elite mobile app image-generation skill for creating premium, app-native screen concepts and flows. |
| `codex-gpt-image-2-5-flare` | Generate or edit artwork with built-in Codex image gen, especially transparent PNG ornaments, game sprites, emblems, and UI graphics. |
| `image-to-code` | Elite website image-to-code skill for Codex. |

### Source

| Module | Use it for |
|---|---|
| `aura-asset-images` | Use when you need high-quality stock-style images from Aura Assets (aura.build/assets) similar to Unsplash for design mockups and marketing: backgrounds, abstract… |
| `unsplash-asset-images` | Use when you need to pick high-quality Unsplash images for product/design assets (avatars, headshots, portraits, large website backgrounds, and abstract wallpapers) and… |
| `company-logos` | Use Iconify Simple Icons logos (64x64) instead of text logos. |

Original authors and licenses: see `SOURCES.md`.
