"""Builds the Founder Reset icon pack page (single file) from the same generator as the site.
Usage: python3 build_pack.py out.html"""
import os, sys, re, html
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src'))
import icons, scenes

I = icons.build(); F = scenes.familiar()
groups = [
 ('Product', [('am', 'AM FUEL sachet'), ('pm', 'PM RECOVER sachet'), ('sachets', 'Sachet pair'), ('strip', 'B12 RESET strip'), ('box', 'Starter box'), ('glass', 'Morning glass'), ('tablet', 'Tablet'), ('capsule', 'Capsule')]),
 ('Ingredients', [('scoop', 'Creatine scoop'), ('bottle', 'Electrolytes'), ('vitamins', 'B, C and D3'), ('b12', 'Vitamin B12'), ('mg', 'Magnesium'), ('zn', 'Zinc'), ('moon', 'Glycine, sleep'), ('tea', 'L-theanine, tea'), ('nocaf', 'No added caffeine')]),
 ('Routine and billing', [('cal7', '7-day start'), ('cal30', 'Every 30 days'), ('coin', 'Price today'), ('card', 'Renewal charge'), ('toggle', 'Cancel anytime'), ('bubbles', 'Questions')]),
 ('Everyday', [('cup', 'Coffee'), ('laptop', 'Late night laptop'), ('bar', 'Protein bar'), ('tubs', 'Supplement tubs')]),
]
src = {**I, **F}
n = [0]
def uniq(svg):
    n[0] += 1; sfx = f'_p{n[0]}'
    for i in sorted(set(re.findall(r'id="([^"]+)"', svg)), key=len, reverse=True):
        svg = svg.replace(f'id="{i}"', f'id="{i}{sfx}"').replace(f'#{i})', f'#{i}{sfx})')
    return svg.replace('class="ill ico"', 'class="art"').replace('class="ill"', 'class="art"')

cards = ''; chips = '<button class="chip on" data-f="all" aria-pressed="true">All</button>'
total = 0
for g, items in groups:
    slug = g.lower().split()[0]
    chips += f'<button class="chip" data-f="{slug}" aria-pressed="false">{g}</button>'
    for key, label in items:
        total += 1
        cards += (f'<figure class="card" data-g="{slug}"><div class="well">{uniq(src[key])}</div>'
                  f'<figcaption><b>{html.escape(label)}</b><span>icon-{key}.svg</span></figcaption>'
                  f'<button class="copy" type="button" aria-label="Copy SVG for {html.escape(label)}">Copy SVG</button></figure>')

page = f'''<title>Founder Reset Icons</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..700&family=Geist:wght@400;500;600&display=swap">
<style>
/* Single light look on purpose: the icons are drawn for a white page. */
:root{{--bg:#ffffff;--ink:#000;--text:#1d1d1f;--mute:#5d5d63;--line:#ececef;--well:#f6f6f8;--am:#FF8A1F;--pm:#8B68F5;--b12:#FF6F9C;--zn:#8FA3C8;
--display:"Bricolage Grotesque","Helvetica Neue",Arial,sans-serif;--sans:"Geist",system-ui,-apple-system,"Segoe UI",sans-serif;--expo:cubic-bezier(.16,1,.3,1);color-scheme:light}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--text);font:400 1rem/1.55 var(--sans);-webkit-font-smoothing:antialiased;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}}
.wrap{{max-width:72rem;margin:0 auto;padding-block:clamp(2.5rem,6vw,5rem)}}
h1{{font:500 clamp(2.4rem,6vw,4.6rem)/1 var(--display);letter-spacing:-.035em;color:var(--ink);margin:0;text-wrap:balance}}
.lede{{margin:1rem 0 0;max-width:40rem;color:var(--mute);font-size:1.1rem}}
.meta{{display:flex;flex-wrap:wrap;gap:1.4rem 2.4rem;margin-top:2rem;padding-block:1.2rem;border-block:1px solid var(--line);font-size:.92rem}}
.meta div{{display:grid;gap:.15rem}}.meta b{{font:500 1.5rem var(--display);letter-spacing:-.02em;color:var(--ink)}}.meta span{{color:var(--mute)}}
.sw{{display:flex;gap:.4rem;align-items:center}}.sw i{{width:22px;height:22px;border-radius:7px;box-shadow:inset 0 -3px 0 #0000001f}}
.chips{{display:flex;flex-wrap:wrap;gap:.5rem;margin:2.2rem 0 1.4rem}}
.chip{{appearance:none;border:1px solid var(--line);background:#fff;color:var(--mute);border-radius:999px;padding:.5rem 1rem;font:500 .92rem var(--sans);cursor:pointer;transition:background .2s,color .2s,border-color .2s,transform .15s}}
.chip:active{{transform:scale(.97)}}.chip.on{{background:#000;color:#fff;border-color:#000}}
.chip:focus-visible,.copy:focus-visible{{outline:2px solid #000;outline-offset:3px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,150px),1fr));gap:14px}}
.card{{margin:0;border:1px solid var(--line);border-radius:22px;padding:10px 10px 14px;display:flex;flex-direction:column;gap:10px;background:#fff;transition:transform .5s var(--expo),box-shadow .5s var(--expo)}}
.card[hidden]{{display:none}}
.well{{background:var(--well);border-radius:14px;height:clamp(150px,16vw,190px);display:flex;align-items:center;justify-content:center;padding:18px;overflow:hidden}}
.well svg{{width:auto;height:auto;max-width:100%;max-height:100%;overflow:visible}}
figcaption{{display:grid;gap:.1rem;padding:0 4px;min-width:0}}figcaption b{{font:600 .98rem var(--display);letter-spacing:-.01em;color:var(--ink)}}
figcaption span{{font-size:.8rem;color:var(--mute);overflow-wrap:anywhere}}
.copy{{margin:auto 4px 0;align-self:flex-start;appearance:none;border:0;background:#000;color:#fff;border-radius:999px;padding:.45rem .9rem;font:500 .82rem var(--sans);cursor:pointer;transition:transform .15s,background .2s}}
.copy:active{{transform:scale(.96)}}.copy.done{{background:#1f8f55}}
@media(hover:hover){{.card:hover{{transform:translateY(-4px);box-shadow:0 24px 40px -28px #1b153066}}}}
.fl{{animation:fl 6s ease-in-out var(--fd,0s) infinite alternate}}@keyframes fl{{to{{transform:translateY(-4px)}}}}
.steam{{animation:steam 4s ease-in-out var(--sd,0s) infinite}}@keyframes steam{{0%,100%{{opacity:.3}}50%{{opacity:1}}}}
.blink{{animation:blink 1.2s steps(1) infinite}}@keyframes blink{{50%{{opacity:0}}}}
.note{{margin-top:2.4rem;font-size:.9rem;color:var(--mute);max-width:44rem}}
textarea.fallback{{position:fixed;inset:auto 16px 16px 16px;height:30vh;font:12px ui-monospace,monospace;border:1px solid var(--line);border-radius:12px;padding:10px;background:#fff;color:#000;z-index:5}}
@media(prefers-reduced-motion:reduce){{.fl,.steam,.blink{{animation:none}}.card{{transition:none}}}}
</style>
<div class="wrap">
<h1>Founder Reset icon pack</h1>
<p class="lede">The isometric objects used across the Founder Reset site, drawn by one generator so every icon shares the same light, angle and palette. Copy any icon as SVG.</p>
<div class="meta"><div><b>{total}</b><span>icons</span></div><div><b>30&deg;</b><span>true isometric</span></div><div><b>1</b><span>light source, top left</span></div>
<div><span class="sw"><i style="background:var(--am)"></i><i style="background:var(--pm)"></i><i style="background:var(--b12)"></i><i style="background:#3DBFA0"></i><i style="background:#F5C04A"></i><i style="background:#1d1d24"></i></span><span>palette</span></div></div>
<div class="chips" role="group" aria-label="Filter icons">{chips}</div>
<div class="grid">{cards}</div>
<p class="note">Each SVG is self-contained and scales to any size. Text on packaging uses Bricolage Grotesque with a Helvetica fallback.</p>
</div>
<script>
(function(){{
var chips=[].slice.call(document.querySelectorAll('.chip')),cards=[].slice.call(document.querySelectorAll('.card'));
chips.forEach(function(c){{c.addEventListener('click',function(){{chips.forEach(function(x){{var on=x===c;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on)}});
 cards.forEach(function(k){{k.hidden=!(c.dataset.f==='all'||k.dataset.g===c.dataset.f)}})}})}});
document.querySelectorAll('.copy').forEach(function(b){{b.addEventListener('click',function(){{
 var svg=b.parentNode.querySelector('svg').outerHTML.replace('class="art"','width="512"');
 function ok(){{b.textContent='Copied';b.classList.add('done');setTimeout(function(){{b.textContent='Copy SVG';b.classList.remove('done')}},1600)}}
 function fallback(){{var t=document.querySelector('textarea.fallback')||document.body.appendChild(Object.assign(document.createElement('textarea'),{{className:'fallback'}}));
  t.value=svg;t.focus();t.select();b.textContent='Selected, press copy'}}
 try{{navigator.clipboard.writeText(svg).then(ok,fallback)}}catch(e){{fallback()}}}})}});
}})();
</script>
'''
open(sys.argv[1], 'w').write(page)
print('pack', total, len(page))
