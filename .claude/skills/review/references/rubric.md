# Mango design rubric

The one scorecard that `/review` reports and that the `/design` judge loop grades against. Score from evidence only: screenshots at desktop and phone width, plus the page source when available. Every score names the evidence behind it.

## How to score

Score each dimension 0 to 10 using the anchors. Use whole or half points. A dimension that does not apply (no motion on a static page, no imagery in a dashboard) is marked `n/a` and left out of the average.

**Overall** = weighted average of the applicable dimensions, rounded to one decimal.

**Caps** (apply after averaging):
- Any `critical` issue caps overall at 6.0.
- Any dimension at 4 or below caps overall at 6.5.
- Phone layout broken (horizontal scroll, overlapping or clipped text, unusable navigation) caps overall at 5.0.

**Pass** = overall at or above 8.0, no dimension below 7, no `critical` issue.

## Dimensions

| # | Dimension | Weight | What it covers |
|---|-----------|--------|----------------|
| 1 | Hierarchy and layout | 1.5 | One clear focal point per view, reading order, grid discipline, density that fits the content |
| 2 | Typography | 1.5 | Pairing, a consistent type scale, line length, leading, heading balance, no orphaned words in headlines |
| 3 | Color and contrast | 1.0 | A deliberate palette, accent used with restraint, text contrast, both themes if the page has them |
| 4 | Spacing and consistency | 1.0 | One spacing scale, aligned edges, matching padding on repeated elements, nothing cramped or floating |
| 5 | Originality | 1.5 | Looks designed for this subject, free of AI-default tells (see list below) |
| 6 | Imagery and illustration | 0.75 | Real or art-directed images, consistent style, correct crops and ratios, no stock clichés |
| 7 | Motion | 0.75 | Motion with a purpose, good easing and duration, no jank, respects reduced motion |
| 8 | Responsiveness | 1.0 | Phone layout designed, not squeezed; touch targets; no overflow |
| 9 | Accessibility basics | 0.75 | Contrast, focus states, alt text, heading order, labels |
| 10 | Copy | 0.75 | Specific, plain, scannable; buttons say what happens; no filler |

## Anchors

Use these to keep scores stable from round to round.

- **10**: Award-level. Nothing to fix. A design lead would ship it as is.
- **8**: Strong and intentional. Two or three small refinements left, none a reader would notice first.
- **6**: Competent but generic, or good with one clear flaw that a reader notices.
- **4**: Visible problems: inconsistent spacing, weak hierarchy, clashing type, broken phone layout in places.
- **2**: Broken or unfinished.

## AI-default tells (Originality)

Each one present costs at least one point on Originality unless the brief asked for it:
- Purple-to-blue gradient hero on white, or gradient text in headlines
- Glows, glassy blobs, pulsing dots, sparkle emoji or "New ✨" badges
- Emoji as section markers or bullet icons
- Everything centered; identical rounded cards with the same shadow everywhere
- Generic three-column feature grid with icon, title and two lines
- Uppercase tracked micro-labels over every section
- Warm cream background with serif display and terracotta accent, used by default
- Near-black with one acid-green or vermilion accent, used by default
- Stock phrases: "Unlock", "Elevate", "Seamless", "Supercharge", "Revolutionize"
- Fake metrics, fake logos, lorem ipsum

## Severity for issues

- `critical`: breaks use or trust. Unreadable text, broken layout, a control that does nothing, phone overflow.
- `major`: a reader notices it in the first few seconds. Weak hero, clashing type, inconsistent spacing.
- `minor`: polish. Small alignment, a weak word, a slightly long transition.

## Output format (judge and review both use this)

```json
{
  "round": 1,
  "scores": {"hierarchy": 7, "typography": 6.5, "color": 8, "spacing": 7, "originality": 5, "imagery": "n/a", "motion": 7, "responsive": 6, "accessibility": 7, "copy": 6},
  "overall": 6.6,
  "caps_applied": ["dimension at 4 or below"],
  "pass": false,
  "issues": [
    {"severity": "major", "dimension": "originality", "where": "hero", "evidence": "desktop.png: purple-blue gradient behind centered headline", "fix": "Replace with a full-bleed product photo and left-aligned headline on the grid"}
  ],
  "strengths": ["Type scale is consistent across sections"]
}
```

List issues worst first. Give at most 8. Each fix must be concrete enough to implement without asking.
