---
name: marketing
description: Marketing for Mango Studios and its clients. Plan campaigns with briefs, channels, calendars and metrics; research competitors and positioning; write blog posts, social posts, emails, landing-page copy, press releases and case studies; build email sequences; run SEO audits; check content against the brand voice; and write performance reports. Use for "campaign", "launch plan", "write a post", "newsletter", "email sequence", "SEO", "competitor analysis", "brand voice check", "marketing report", "quote post".
---

# Marketing

Plan it, write it, ship it, measure it. Modules come from Anthropic's marketing plugin plus two X/Twitter post tools.

## Pick by job

- **Plan:** `campaign-plan` for a full brief with objectives, audience, channels, calendar and metrics. `competitive-brief` for competitor positioning, messaging gaps and battlecards.
- **Write:** `content-creation` and `draft-content` for blog, social, newsletter, landing-page, press and case-study copy. `email-sequence` for onboarding, nurture, launch and win-back flows.
- **Grow and measure:** `seo-audit` for keyword gaps and an action plan. `brand-review` to check a draft against the brand voice before it ships. `performance-report` for wins, misses and next steps.
- **X posts:** `write-like-meng-on-x` and `x-bookmark-quote-posts` were built around another person's account and post history. Use their method, but give them your own posts and voice; never write as someone else.

## Connected tools

Several modules can pull live data from HubSpot, Klaviyo, Ahrefs, Similarweb, Amplitude, Supermetrics, Canva, Figma or Slack when those connectors are signed in (see `CONNECTORS.md`). Without them, the modules work from what you paste in. Never invent numbers.

## Hand-offs

- The landing page itself: `/landing-page`
- Visuals: `/image`; brand identity: `/brand`
- Product demo video for a launch: `/demo`

## Modules

10 merged skills live in `modules/`. Read a module's `MODULE.md` when its job comes up, and follow it. Paths inside a module are relative to that module's folder. When a module says to run or invoke another skill by its old name, open that module instead: it is in this skill's `modules/` folder or in another Mango skill's (`design`, `landing-page`, `prototype`, `scroll-site`, `animate`, `image`, `brand`, `review`, `demo`, `marketing`).

### Plan

| Module | Use it for |
|---|---|
| `campaign-plan` | Generate a full campaign brief with objectives, audience, messaging, channel strategy, content calendar, and success metrics. |
| `competitive-brief` | Research competitors and generate a positioning and messaging comparison with content gaps, opportunities, and threats. |

### Write

| Module | Use it for |
|---|---|
| `content-creation` | Draft marketing content across channels — blog posts, social media, email newsletters, landing pages, press releases, and case studies. |
| `draft-content` | Draft blog posts, social media, email newsletters, landing pages, press releases, and case studies with channel-specific formatting and SEO recommendations. |
| `email-sequence` | Design and draft multi-email sequences with full copy, timing, branching logic, exit conditions, and performance benchmarks. |

### Grow and measure

| Module | Use it for |
|---|---|
| `seo-audit` | Run a comprehensive SEO audit — keyword research, on-page analysis, content gaps, technical checks, and competitor comparison. |
| `brand-review` | Review content against your brand voice, style guide, and messaging pillars, flagging deviations by severity with specific before/after fixes. |
| `performance-report` | Build a marketing performance report with key metrics, trend analysis, wins and misses, and prioritized optimization recommendations. |

### Social posts on X

| Module | Use it for |
|---|---|
| `write-like-meng-on-x` | Write, rewrite, review, or continuously refine X/Twitter posts in Meng To's current voice using his deduplicated authored-post corpus, personal and product context… |
| `x-bookmark-quote-posts` | Check a user's latest X/Twitter bookmarks and turn recent saved posts into source-backed quote-post drafts calibrated against the user's latest 100 authored posts. |

Original authors and licenses: see `SOURCES.md`.
