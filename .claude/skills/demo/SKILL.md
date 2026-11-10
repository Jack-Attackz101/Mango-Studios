---
name: demo
description: Product demos and walkthrough media. Build realistic faux product UI (browser and app windows, dashboards, phones, terminals, bento grids) as still illustrations or animated cursor walkthroughs; record polished browser demos with cursor clicks and zooms; turn an HTML page into a video reel; and add voiceover with ElevenLabs. Use for "product demo", "fake UI for the hero", "feature card illustration", "record a walkthrough", "make a video of the site", "voiceover".
---

# Demo

Show the product working, and show the work itself: a mocked UI, a recorded walkthrough, a video with voice, progress screenshots, or a polished GitHub page.

## Pick by output

- **Hero or feature-card product shot** (still or animated with a cursor): `stageshow`. It builds faux UI that looks like the real product.
- **Interactive HTML demo or screenshot set:** `html-demo`.
- **Video from a page** (frames, cuts, captions, export): `html-reel`.
- **Recorded browser session** with natural cursor, clicks and zoom-follow framing, in 4K: `browser-video-recording`.
- **Screenshots of work in progress,** sent as you go: `workflow-progress-screenshots`.
- **Ship a change with before and after pictures and a changelog entry:** `workflow-ship-change`.
- **Publish a finished project to GitHub** with a strong README, preview image and GitHub Pages link: `publish-project-to-github`.
- **Voiceover or narration:** `elevenlabs-tts`. It needs an ElevenLabs key in the user's local config; never ask for the key in chat.

## Rules

- Mocked UI uses realistic but clearly fictional data; never real customer data.
- Keep demo videos short: one feature per clip, under 30 seconds.
- Video and recording need ffmpeg and Playwright. Check they exist before starting.

## Modules

8 merged skills live in `modules/`. Read a module's `MODULE.md` when its job comes up, and follow it. Paths inside a module are relative to that module's folder. When a module says to run or invoke another skill by its old name, open that module instead: it is in this skill's `modules/` folder or in another Mango skill's (`design`, `landing-page`, `prototype`, `scroll-site`, `animate`, `image`, `brand`, `review`, `demo`, `marketing`).

### Product UI and demos

| Module | Use it for |
|---|---|
| `stageshow` | Build faux product UI that looks like a real product, as a still illustration or an animated demo with a cursor. |
| `html-demo` | Show an app working on a web page by drawing it live in HTML instead of recording it. |

### Video and voice

| Module | Use it for |
|---|---|
| `html-reel` | Turn a tweet, a video, a YouTube video or a landing page into a 9:16 reel (Instagram Reels, TikTok, Shorts) that says what the source says and looks like it, with every… |
| `browser-video-recording` | Create polished 60 fps 4:3 4K browser screen-recording style videos from Codex in-app browser captures, with browser-only crop, natural macOS cursor styling, deliberate… |
| `elevenlabs-tts` | Generate ElevenLabs text-to-speech audio from scripts or inline text using local voice profiles. |

### Show and ship work

| Module | Use it for |
|---|---|
| `workflow-progress-screenshots` | Show the user real screenshots of the work as it progresses, without being asked. |
| `workflow-ship-change` | Ship every change the way the user requires, with the guardrails. |
| `publish-project-to-github` | Package a finished local project into an intentional GitHub repository, create a strong README and visual preview, push it safely, configure a public GitHub Pages URL… |

Original authors and licenses: see `SOURCES.md`.
