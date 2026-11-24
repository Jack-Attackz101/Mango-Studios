#!/usr/bin/env node
// Put the site's main screens side by side on a private Twombly canvas.
//
//   node scripts/twombly-screens.mjs           build the frames, create or join the canvas, add them
//   node scripts/twombly-screens.mjs --build   only build the frame folder (no canvas)
//
// Run it from your own computer so the canvas is yours: Twombly opens Google
// sign-in in your browser the first time. Frames must work with no server and
// no network, so this copies the pages into .twombly/work/mango-screens/site,
// bundles the Google Fonts locally, and answers the contact form's /api/send
// call with a success so the form shows its thank-you state without sending.
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, '.twombly/work/mango-screens/site');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const FONTS = 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,900&family=Chewy&family=Fredoka:wght@500;600&family=Inter+Tight:wght@500;600;650;700;800&display=swap';
const SCREENS = [
  ['Home', 'index.html'], ['Sites & Apps', 'sites-and-apps.html'], ['AI Agents', 'ai-agents.html'],
  ['Automations', 'automations.html'], ['Consulting', 'consulting.html'], ['Software', 'software.html'],
  ['Our Work', 'work.html'], ['AI Readiness Quiz', 'ai-readiness.html'],
];
const STUB = "<script>(function(){var f=window.fetch;window.fetch=function(u,o){if(typeof u==='string'&&u.indexOf('/api/')===0){" +
  "return Promise.resolve(new Response(JSON.stringify({ok:true}),{status:200,headers:{'Content-Type':'application/json'}}));}" +
  "return f.apply(this,arguments);};})();</script>\n";

async function build() {
  rmSync(out, { recursive: true, force: true });
  mkdirSync(join(out, 'fonts'), { recursive: true });
  for (const f of readdirSync(root).filter(f => /\.(html|css)$/.test(f) || f === 'main.js')) cpSync(join(root, f), join(out, f));
  cpSync(join(root, 'assets'), join(out, 'assets'), { recursive: true });

  let css = await (await fetch(FONTS, { headers: { 'user-agent': UA } })).text();
  const urls = [...new Set(css.match(/https:\/\/fonts\.gstatic\.com\/[^)]+/g) || [])];
  for (const u of urls) {
    const name = createHash('sha1').update(u).digest('hex').slice(0, 12) + '.woff2';
    writeFileSync(join(out, 'fonts', name), Buffer.from(await (await fetch(u, { headers: { 'user-agent': UA } })).arrayBuffer()));
    css = css.split(u).join(name);
  }
  writeFileSync(join(out, 'fonts/fonts.css'), css);

  for (const f of readdirSync(out).filter(f => f.endsWith('.html'))) {
    let h = readFileSync(join(out, f), 'utf8');
    h = h.replace(/\s*<link[^>]+href="https:\/\/fonts\.(googleapis|gstatic)\.com[^"]*"[^>]*>/g, '');
    h = h.replace('</head>', '  <link rel="stylesheet" href="fonts/fonts.css">\n</head>');
    h = h.replace('<script src="main.js">', STUB + '<script src="main.js">');
    writeFileSync(join(out, f), h);
  }
  console.log(`Built ${SCREENS.length} screens with ${urls.length} local font files in ${out}`);
}

function twombly(...args) {
  const text = execFileSync('npx', ['-y', 'twombly@latest', ...args], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
  const result = JSON.parse(text);
  if (result.ok === false) throw new Error(JSON.stringify(result.problems || result.error, null, 2));
  return result;
}

await build();
if (!process.argv.includes('--build')) {
  const canvas = twombly('init', '--name', 'Mango Studios Screens');
  const existing = new Set((canvas.frames || []).map(f => f.title));
  const site = '.twombly/work/mango-screens/site';
  // Home is scroll-driven (pinned hero, reveals on scroll), so it gets a real 1440x900 window to scroll in.
  // The other pages show at full height.
  const home = SCREENS[0];
  if (!existing.has(home[0])) twombly('add', site, '--title', home[0], '--entry', home[1], '--width', '1440', '--height', '900', '--level', 'build');
  const rest = SCREENS.slice(1).filter(([title]) => !existing.has(title)).map(([title, entry]) => ({ title, entry }));
  if (rest.length) twombly('add', site, '--width', '1440', '--height', 'auto', '--level', 'build', '--frames', JSON.stringify(rest));
  twombly('done');
  console.log(`Canvas: ${canvas.link || canvas.local} (private until you click Share)`);
}
