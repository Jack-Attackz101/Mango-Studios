#!/usr/bin/env node
// Screenshot a URL or local HTML file at desktop and phone width.
// Usage: node shoot.mjs <url-or-file> [outDir] [--label name]
// Writes <label>-desktop.png, <label>-desktop-fold.png, <label>-phone.png, <label>-phone-fold.png
// and prints a JSON summary including horizontal-overflow checks.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
function loadPlaywright() {
  const tries = [process.env.PLAYWRIGHT, 'playwright'];
  try { tries.push(join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'playwright')); } catch {}
  for (const t of tries.filter(Boolean)) { try { return require(t); } catch {} }
  console.error('Playwright not found. Install it with: npm i -D playwright  (then: npx playwright install chromium)');
  process.exit(2);
}

const args = process.argv.slice(2);
const target = args.find(a => !a.startsWith('--'));
if (!target) { console.error('Usage: node shoot.mjs <url-or-file> [outDir] [--label name]'); process.exit(1); }
const outDir = resolve(args.filter(a => !a.startsWith('--'))[1] || 'shots');
const li = args.indexOf('--label');
const label = li >= 0 ? args[li + 1] : 'page';
const url = /^https?:|^file:/.test(target) ? target : pathToFileURL(resolve(target)).href;
mkdirSync(outDir, { recursive: true });

const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const views = [['desktop', { width: 1440, height: 900 }, 1], ['phone', { width: 390, height: 844 }, 2]];
const summary = { url, outDir, shots: [] };
for (const [name, viewport, dpr] of views) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: dpr });
  await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  // scroll through once so lazy content and scroll-triggered states render
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
  const fold = join(outDir, `${label}-${name}-fold.png`);
  const full = join(outDir, `${label}-${name}.png`);
  await page.screenshot({ path: fold });
  await page.screenshot({ path: full, fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  summary.shots.push({ view: name, fold, full, horizontalOverflowPx: Math.max(0, overflow) });
  await page.close();
}
await browser.close();
console.log(JSON.stringify(summary, null, 2));
