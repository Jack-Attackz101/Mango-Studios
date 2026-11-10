# Judge protocol

The judge is a second AI that grades the work. It never sees the builder's reasoning, so it can't be talked into a good score. `/design` runs it every round; `/review` runs it once.

## Spawning the judge

Start a fresh subagent each round (Agent tool, general-purpose). Starting fresh stops it from anchoring on its last score. Give it only:

1. The rubric: `.claude/skills/review/references/rubric.md` (tell it to read the file).
2. The critique framework: `.claude/skills/design/modules/design-critique/MODULE.md` (first impression, usability, hierarchy, consistency, accessibility).
3. The screenshots for this round: desktop fold, desktop full, phone fold, phone full. Use `.claude/skills/review/scripts/shoot.mjs` to make them.
4. The overflow numbers from the screenshot script.
5. The brief in two or three sentences: what the page is, who it is for, and any direction the user gave.
6. From round 2 on, last round's issue list only, so it can check what got fixed. No scores.

Do not give it the builder's notes, the plan, or what the builder thinks it improved.

## Prompt for the judge

> You are a strict senior design judge. Read the rubric at `<path>`. Look at every screenshot listed below before scoring. Score the page against the rubric's dimensions and anchors, apply its caps, and return the JSON in the rubric's output format. After the JSON, write a critique using the critique framework at `<path>`: overall impression, then usability, hierarchy, consistency and accessibility findings with severity and a fix for each. Every issue must cite a screenshot and a location. Do not be generous: an 8 means a design lead would ship it with only small refinements. If last round's issues are listed, say in `strengths` which were fixed and keep any that were not.
>
> Brief: …
> Screenshots: …
> Overflow: desktop Npx, phone Npx
> Last round's issues: …

## Reading the verdict

The JSON decides pass or fail; the critique explains it. Show the user the critique from the final round.


- `pass` true (overall 8.0 or more, no dimension below 7, no critical issue): stop and report.
- Otherwise fix the issues worst first. Fix every `critical`, then `major` ones, then `minor` ones if they are cheap. Re-shoot and re-judge.

## Stop rules

- **Pass:** stop.
- **Plateau:** overall improved by less than 0.3 for two rounds in a row. Stop and give the user two concrete direction changes to pick from, because small fixes won't get there.
- **Round limit:** 5 rounds by default, or whatever the user set. Stop and report the remaining issues.
- **Regression:** if a round scores lower than the one before, revert that round's changes before trying again.

## Score log

Keep a running table in your reply so the user can see the climb:

| Round | Overall | Lowest dimension | Fixed this round |
|-------|---------|------------------|------------------|
| 1 | 6.4 | Originality 5 | baseline |
| 2 | 7.3 | Responsive 6.5 | hero, type scale, gradient removed |
| 3 | 8.2 | Copy 7 | phone nav, card spacing |
