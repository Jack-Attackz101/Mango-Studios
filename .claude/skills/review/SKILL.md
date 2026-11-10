---
name: review
description: Review and audit a website, page, screen or app and return a graded report without changing anything. Scores it 0-10 on the Mango rubric (hierarchy, typography, color, spacing, originality, imagery, motion, responsiveness, accessibility, copy) using an independent judge AI, then adds audits for AI-design slop, accessibility, performance, motion and originality against references. Use for "review my site", "audit this page", "grade this design", "is this ready to ship", "why does this look AI-generated". To fix what it finds, hand off to design, which loops until 8/10.
---

# Review

A full, evidence-based report on a page or site. Review only reports; it changes nothing unless the user asks, and then it hands off to `/design`.

The scorecard here is the same one `/design` uses for its judge loop, so a review score and a design score mean the same thing.

## Files this skill owns

- `references/rubric.md`: the Mango rubric. Dimensions, weights, anchors, caps, output format.
- `references/judge.md`: how to run the independent judge AI.
- `scripts/shoot.mjs`: desktop and phone screenshots plus overflow check. `node .claude/skills/review/scripts/shoot.mjs <url-or-file> <outDir> --label name`

## Modes

- **Quick** (default for one page): screenshots, judge scorecard, top issues.
- **Full** (when the user says full, audit, or ready to ship): quick plus every audit below that applies.

## Process

1. **Capture.** Shoot desktop and phone. For a whole site, cover the home page plus the two or three most important pages.
2. **Score.** Run the judge exactly as `references/judge.md` says. The judge's JSON is the scorecard.
3. **Audits** (full mode):
   - AI-design slop: `audit-ai-design-slop` for an evidence-backed list, with `no-ai-design-slop` as the rule set.
   - UI and flows: `ui-review` for severity-ranked findings, keyboard and screen-reader checks.
   - Accessibility: `accessibility-review` for a WCAG 2.1 AA audit, and the inclusive-design plugins for cognitive and adaptive concerns. If the awwwards MCP is connected, `analyze_accessibility` gives contrast and alt evidence.
   - Performance: `performance-profiling`, and the awwwards MCP `audit_url` for frame drops and long tasks when available.
   - Motion: `/animate`'s review modules (`review-animations`, `animation-performance`).
   - Originality: `audit-reference-originality` when the page was built from reference sites.
   - Tokens: `/brand`'s `token-mapping` when the project has design tokens.
   - Worst-case data: `break-ui` feeds long names, empty states, huge numbers and non-Latin text, then reports what broke.
   - Work in progress across sessions: `workflow-threads-manager` checks what other Claude sessions are doing and whether finished work is merged and live.
4. **Report.** Use the format below.
5. **Hand-off.** Offer to run `/design` on the issues. `workflow-score-to-target` describes the score-to-target loop it will run.

## Report format

1. **Verdict** in one line: overall score, pass or not, and the single biggest problem.
2. **Scorecard** table: dimension, score, one-line reason.
3. **Issues**, worst first: severity, where, evidence (screenshot and location), fix.
4. **Strengths**: two or three things to keep.
5. **Audits** (full mode): one short section each, with findings only.
6. **Screenshots**: paths to desktop and phone shots.

For a non-technical reader, add a plain-language summary following `audit-verify-explain-grade-5`.

## Rules

- Evidence or it didn't happen: every score and issue cites a screenshot or a line of code.
- Contrast and accessibility results are evidence, not a WCAG certificate. Say so.
- Don't soften scores. An honest 6 is more useful than a polite 8.

## Modules

10 merged skills live in `modules/`. Read a module's `MODULE.md` when its job comes up, and follow it. Paths inside a module are relative to that module's folder. When a module says to run or invoke another skill by its old name, open that module instead: it is in this skill's `modules/` folder or in another Mango skill's (`design`, `landing-page`, `prototype`, `scroll-site`, `animate`, `image`, `brand`, `review`, `demo`, `marketing`).

### Design review

| Module | Use it for |
|---|---|
| `ui-review` | Critiques a screen, flow, prototype or running build against agreed criteria, accessibility included, and ranks findings by severity. |
| `audit-ai-design-slop` | Audit websites, apps, screenshots, mockups, and design code for harmful AI-design clichés, generic generated defaults, and established UI defects. |
| `no-ai-design-slop` | Prevent and remove generic AI-generated design defaults, incoherent visual choices, and established UI defects while creating, revising, or reviewing websites, apps… |
| `workflow-score-to-target` | Score work out of 10 against a clear rubric, then improve it round by round until every item reaches the target score the user named (for example "get it to 8 out of… |

### Originality, performance and reporting

| Module | Use it for |
|---|---|
| `audit-reference-originality` | Audit a website or digital experience against its supplied source references for originality and plagiarism risk. |
| `performance-profiling` | Guide performance profiling for Apple platform apps with Instruments, Xcode diagnostics, and MetricKit. |
| `audit-verify-explain-grade-5` | Audit work, verify claims with concrete evidence, and explain the result in simple grade-5 language. |

### Stress tests and status

| Module | Use it for |
|---|---|
| `break-ui` | Try to break a piece of UI by feeding it worst-case data — long names, unbreakable emails, one-letter names, missing fields, huge counts, zero items, long labels… |
| `workflow-threads-manager` | Oversee the other Claude threads (sessions) working on the same project. |

### Accessibility

| Module | Use it for |
|---|---|
| `accessibility-review` | Run a WCAG 2.1 AA accessibility audit on a design or page. |

Original authors and licenses: see `SOURCES.md`.
