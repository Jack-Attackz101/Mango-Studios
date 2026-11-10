"""Swiss Poster build of the Founder Reset landing page.
Reads ../content.json and writes ../v-swiss-poster.html (single self-contained file).
Direction: Vignelli / Swiss International. Ink, paper and the three product inks,
12-column grid, Geist only (Geist Mono for doses and tables), radius 0, no shadows,
no gradients, Tailwind type scale, 4px spacing scale."""
import json, os, html

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
C = json.load(open(os.path.join(ROOT, 'content.json'), encoding='utf-8'))
S = {s['type']: s for s in C['sections']}
e = lambda t: html.escape(t, quote=True)

hero = C['hero']; prob = S['problem']; rt = S['routine']; bn = S['benefits']; how = S['how']
ing = S['ingredients']; faq = S['faq']; fin = S['final_cta']; foot = C['footer']; on = C['order_notice']

def rows(rs):
    return ''.join(f'<tr><td>{e(a)}</td><td>{e(b)}</td></tr>' for a, b in rs)

def lead(t):
    # bold the lead-in before a colon ("Today:"), keep the rest verbatim
    if ':' in t and t.index(':') < 18:
        a, b = t.split(':', 1); return f'<strong>{e(a)}:</strong>{e(b)}'
    return e(t)

# hero headline, broken where the thought breaks
h1_lines = ['Your business', 'has a system.', 'Now your daily', 'supplements do too.']
assert ' '.join(h1_lines) == hero['headline']
h1 = ''.join(f'<span class="ln"><span style="--i:{i}">{e(l).replace("do too.", "do&nbsp;too.")}</span></span>' for i, l in enumerate(h1_lines))

# reveal sentence: verbatim from the problem section's closing body
lead_in, reveal = prob['body'].split('. ', 1)
lead_in += '.'
reveal_words = ''.join(f'<span class="rw">{e(w)}</span> ' for w in reveal.split())

nav_ids = ['routine', 'how', 'ingredients', 'faq']
nav = ''.join(f'<a href="#{i}" data-spy="{i}">{e(t)}</a>' for i, t in zip(nav_ids, C['nav']))
mnav = ''.join(f'<a href="#{i}" style="--i:{k}">{e(t)}</a>' for k, (i, t) in enumerate(zip(nav_ids, C['nav'])))

prob_items = ''.join(f'<li data-r>{e(t)}</li>' for t in prob['items'])

def fact_list(fs):
    return ''.join(f'<li>{e(f)}</li>' for f in fs)

steps = ''.join(f'<li data-r><span class="n">{k+1}</span><span class="lab">{e(s["label"])}</span><h3>{e(s["title"].replace(" $39", "").replace(" $99", ""))}</h3><p>{e(s["body"])}</p></li>' for k, s in enumerate(how['steps']))
bill = ''.join(f'<li>{lead(r)}</li>' for r in how['billing']['rows'])

def formula(f, cls, ben=None, plus=None):
    top = ''
    if ben:
        top = f'<div class="fb-ben"><h4>{e(ben["title"])}</h4><p>{e(ben["body"])}</p><ul class="facts">{fact_list(ben["facts"])}</ul></div>'
    if plus:
        top = f'<div class="fb-ben"><p class="plusp">{e(plus)}</p></div>'
    return (f'<article class="fx {cls}" data-r><header><h3>{e(f["name"])}</h3><p>{e(f["meta"])}</p></header>{top}' +
            (f'<details class="mc" open><summary>Full ingredient table ({len(f["rows"])})</summary>' if len(f["rows"]) > 1 else '<div>') + f'<div class="tw"><table><caption class="sr">Active ingredients per serving, {e(f["name"])}</caption><thead><tr><th scope="col">Ingredient</th><th scope="col">{e(f["unit"])}</th></tr></thead><tbody>{rows(f["rows"])}</tbody></table></div>' + ('</details>' if len(f["rows"]) > 1 else '</div>') +
            f'<p class="fdesc">{e(f["desc"])}</p><p class="fprep"><strong>Preparation.</strong> {e(f["prep"])}</p></article>')
fx = formula(ing['formulas'][0], 'am', bn['items'][0]) + formula(ing['formulas'][1], 'pm', bn['items'][1]) + formula(ing['formulas'][2], 'b12', plus=bn['plus']).replace('</article>', f'<div class="fx-after"><p class="fnote">{e(ing["formula_note"])} {e(bn["note"])}</p><button class="btn" type="button" data-order>{e(hero["cta_primary"])}</button></div></article>')

sci = ''.join(f'<article class="sc" data-r><h4>{e(x["name"])}</h4><div><p><strong>What it does.</strong> {e(x["does"])}</p><details class="mc" open><summary>Read the research</summary><p><strong>What the research shows.</strong> {e(x["research"])}</p><ul class="src">' + ''.join(f'<li>{e(s)}</li>' for s in x['sources']) + '</ul></details></div></article>' for x in ing['science']['items'])

faqs = ''.join(f'<details{" open" if k in (0, 5) else ""}><summary><span>{e(x["q"])}</span><i aria-hidden="true"></i></summary><div class="ans"><p>{e(x["a"])}</p></div></details>' for k, x in enumerate(faq['items']))

kit1, kit2 = how['kits']
pr = hero['products']
dots = ''.join(f'<i style="--i:{k}"></i>' for k in range(7))

page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Founder Reset, Swiss Poster</title>
<meta name="description" content="{e(C['brand']['name'])}: {e(hero['subhead'])}">
<meta property="og:title" content="{e(C['brand']['name'])}">
<meta property="og:description" content="{e(hero['headline'])} {e(hero['tagline'])}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23000'/%3E%3Crect x='6' y='6' width='9' height='20' fill='%23FF8A1F'/%3E%3Crect x='17' y='6' width='9' height='20' fill='%238B68F5'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;700&family=Geist+Mono:wght@400;500&display=swap">
<style>
/* Swiss Poster. Grid: 12 columns, 24px gutters, 40px margins (16px on phones).
   Inks: paper, ink, and the three product inks. Nothing else. */
:root{{
 --paper:#FFFFFF; --ink:#000000; --ink2:#454545; --hair:#00000024; --hair-d:#FFFFFF33;
 --am:#FF8A1F; --pm:#8B68F5; --b12:#FF6F9C;
 --sans:"Geist",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif; --mono:"Geist Mono",ui-monospace,"SF Mono",Menlo,monospace;
 --s1:4px;--s2:8px;--s3:12px;--s4:16px;--s6:24px;--s8:32px;--s10:40px;--s12:48px;--s16:64px;--s20:80px;--s24:96px;
 --m:40px; --g:24px; --ease:cubic-bezier(.22,1,.36,1);
 color-scheme:light;
}}
@media (max-width:720px){{:root{{--m:16px;--g:16px}}}}
*,*::before,*::after{{box-sizing:border-box}}
html{{-webkit-text-size-adjust:100%}}
body{{margin:0;background:var(--paper);color:var(--ink);font:400 16px/24px var(--sans);-webkit-font-smoothing:antialiased;overflow-x:clip}}
[hidden]{{display:none!important}}
a{{color:inherit}}
h1,h2,h3,h4,p,ul,ol,figure{{margin:0;padding:0}}
ul,ol{{list-style:none}}
.sr{{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}}
.skip{{position:absolute;left:var(--s4);top:-100px;z-index:100;background:var(--ink);color:var(--paper);padding:var(--s3) var(--s4);font-weight:500}}
.skip:focus{{top:var(--s4)}}
:focus-visible{{outline:3px solid var(--ink);outline-offset:3px}}
.dark :focus-visible,.foot :focus-visible{{outline-color:var(--paper)}}
.wrap{{max-width:1440px;margin:0 auto;padding-left:max(var(--m),env(safe-area-inset-left,0px));padding-right:max(var(--m),env(safe-area-inset-right,0px))}}
.grid{{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--g)}}
@media (max-width:720px){{.grid{{grid-template-columns:repeat(4,minmax(0,1fr))}}}}
.mono{{font-family:var(--mono)}}

/* type scale (Tailwind steps) */
.t9{{font-size:128px;line-height:1}} .t8{{font-size:96px;line-height:1}} .t7{{font-size:72px;line-height:1}} .t6{{font-size:60px;line-height:1}} .t5{{font-size:48px;line-height:1}}
.t4{{font-size:36px;line-height:40px}} .t3{{font-size:30px;line-height:36px}} .t2{{font-size:24px;line-height:32px}} .txl{{font-size:20px;line-height:28px}} .tlg{{font-size:18px;line-height:28px}} .tsm{{font-size:14px;line-height:20px}} .txs{{font-size:12px;line-height:16px}}
h1,h2,h3,h4{{font-weight:700;letter-spacing:-.02em;text-wrap:balance}}
p,li,td{{text-wrap:pretty}}
.disp{{letter-spacing:-.045em}}

/* buttons */
.btn{{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:var(--s3) var(--s6);border:2px solid var(--ink);background:var(--ink);color:var(--paper);font:700 16px/24px var(--sans);text-decoration:none;cursor:pointer;border-radius:0;transition:background-color .3s var(--ease),color .3s var(--ease),transform .3s var(--ease)}}
.btn:hover{{background:var(--am);color:var(--ink)}}
.btn:active{{transform:scale(.98)}}
.btn.sm{{min-height:40px;padding:var(--s2) var(--s4);font-size:14px;line-height:20px}}
.btn.inv{{background:var(--paper);color:var(--ink);border-color:var(--paper)}}
.btn.inv:hover{{background:var(--am);border-color:var(--am)}}
.link{{display:inline-flex;align-items:center;min-height:44px;font-weight:500;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:6px;transition:text-decoration-color .3s var(--ease)}}
.link:hover{{text-decoration-color:var(--am)}}

/* header */
.top{{position:sticky;top:0;z-index:50;background:var(--paper);border-bottom:2px solid var(--ink)}}
.top .wrap{{display:flex;align-items:center;gap:var(--s8);height:64px}}
.logo{{display:flex;align-items:center;gap:var(--s3);font:700 18px/28px var(--sans);letter-spacing:-.02em;text-decoration:none;margin-right:auto}}
.mark{{display:grid;grid-template-columns:repeat(2,8px);grid-template-rows:20px;gap:3px}}
.mark i{{background:var(--am)}}.mark i+i{{background:var(--pm)}}
.top nav{{display:flex;gap:var(--s8)}}
.top nav a{{position:relative;text-decoration:none;font-size:14px;line-height:20px;font-weight:500;padding:var(--s2) 0}}
.top nav a::after{{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:var(--ink);transform:scaleX(0);transform-origin:left;transition:transform .5s var(--ease)}}
.top nav a:hover::after,.top nav a.on::after{{transform:scaleX(1)}}
.top nav a.on{{font-weight:700}}
.menu-btn{{display:none;width:48px;height:48px;margin-right:calc(var(--s3) * -1);border:0;background:none;cursor:pointer;position:relative}}
.menu-btn i{{position:absolute;left:12px;right:12px;height:2px;background:var(--ink);transition:transform .5s var(--ease)}}
.menu-btn i:first-child{{top:19px}}.menu-btn i:last-child{{top:27px}}
.menu-btn[aria-expanded="true"] i:first-child{{transform:translateY(4px) rotate(45deg)}}
.menu-btn[aria-expanded="true"] i:last-child{{transform:translateY(-4px) rotate(-45deg)}}
.mpanel{{position:fixed;inset:64px 0 0 0;z-index:49;background:#fffffff2;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);padding:var(--s8) var(--m) calc(var(--s8) + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:var(--s2)}}
.mpanel a:not(.btn){{font:700 36px/40px var(--sans);letter-spacing:-.03em;text-decoration:none;padding:var(--s3) 0;border-bottom:2px solid var(--ink);opacity:0;transform:translateY(24px)}}
.mpanel.open a:not(.btn){{opacity:1;transform:none;transition:opacity .5s var(--ease),transform .5s var(--ease);transition-delay:calc(var(--i) * 60ms)}}
.mpanel .btn{{margin-top:var(--s6)}}
@media (max-width:860px){{.top nav,.top .btn{{display:none}}.menu-btn{{display:block}}}}

/* hero */
.hero{{position:relative;padding:var(--s12) 0 var(--s16)}}
.cols{{position:absolute;inset:0;pointer-events:none}}
.cols .wrap{{height:100%}}
.cols .grid{{height:100%}}
.cols .grid i{{border-left:1px solid var(--hair);border-right:1px solid var(--hair)}}
.hero .grid{{position:relative;align-items:start}}
.hero-copy{{grid-column:1/9}}
.h1{{font-size:96px;line-height:1}}
.h1 .ln{{display:block;overflow:hidden;padding-bottom:6px;margin-bottom:-6px}}
.h1 .ln>span{{display:block;animation:up .9s var(--ease) both;animation-delay:calc(var(--i) * 80ms)}}
.sub{{margin-top:var(--s6);max-width:640px;font-size:20px;line-height:28px;color:var(--ink2)}}
.buy{{margin-top:var(--s6);display:flex;flex-wrap:wrap;align-items:center;gap:var(--s4) var(--s8)}}
.price{{margin-top:var(--s6);max-width:640px;font-size:16px;line-height:24px}}
.price strong{{font-weight:700}}
.price small{{display:block;color:var(--ink2);font-size:14px;line-height:20px;margin-top:var(--s1)}}
.trust{{margin-top:var(--s6);display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:2px solid var(--ink);max-width:720px}}
.trust li{{padding:var(--s3) var(--s4) 0 0;font-size:14px;line-height:20px;font-weight:500}}
.trust li+li{{padding-left:var(--s4);border-left:1px solid var(--hair)}}
.stack{{grid-column:9/13;padding-left:var(--s10);display:grid;grid-template-rows:auto auto auto;gap:var(--s2)}}
.blk{{position:relative;display:flex;flex-direction:column;justify-content:space-between;padding:var(--s4);color:var(--ink);animation:slide .8s var(--ease) both;animation-delay:calc(240ms + var(--i) * 110ms)}}
.blk .k{{font:500 12px/16px var(--mono)}}
.blk b{{display:block;font-size:48px;line-height:1;font-weight:700;letter-spacing:-.045em;white-space:nowrap}}
.blk .d{{font:500 14px/20px var(--mono)}}
.blk.am{{background:var(--am);min-height:300px}}
.blk.pm{{background:var(--pm);min-height:260px}}
.blk.b12{{background:var(--ink);color:var(--paper);min-height:120px}}
.blk.b12 b{{font-size:30px;line-height:36px;letter-spacing:-.02em}}
.pills{{display:flex;gap:var(--s2);margin:var(--s3) 0}}
.pills i{{width:20px;height:20px;border-radius:50%;background:var(--b12);animation:pop .5s var(--ease) both;animation-delay:calc(800ms + var(--i) * 60ms)}}
.blk .row{{display:flex;justify-content:space-between;align-items:baseline;gap:var(--s4)}}
@media (max-width:1180px){{.h1{{font-size:72px}}}}
@media (max-width:960px){{.hero-copy,.stack{{grid-column:1/-1;padding-left:0}}.stack{{grid-template-columns:repeat(2,minmax(0,1fr));margin-top:var(--s12)}}.blk.b12{{grid-column:1/-1}}.blk.am,.blk.pm{{min-height:220px}}}}
@media (max-width:720px){{.hero{{padding-top:var(--s8)}}.h1{{font-size:48px}}.sub{{font-size:18px;line-height:28px;margin-top:var(--s6)}}.buy{{margin-top:var(--s6)}}.trust{{grid-template-columns:1fr}}.trust li+li{{padding-left:0;border-left:0;border-top:1px solid var(--hair);margin-top:var(--s3)}}.blk b{{font-size:36px;line-height:40px}}.blk.am,.blk.pm{{min-height:180px}}.blk.b12 b{{font-size:24px;line-height:32px}}.stack{{grid-template-columns:1fr}}.blk .k,.blk .d{{font-size:12px;line-height:16px}}}}

/* sections */
.sec{{padding:var(--s24) 0}}
@media (max-width:720px){{.sec{{padding:var(--s16) 0}}}}
.dark{{background:var(--ink);color:var(--paper)}}
.h2{{font-size:72px;line-height:1}}
@media (max-width:1180px){{.h2{{font-size:60px}}}}
@media (max-width:720px){{.h2{{font-size:36px;line-height:40px}}}}
.lede{{font-size:20px;line-height:28px;color:var(--ink2);max-width:600px}}
.dark .lede{{color:#FFFFFFCC}}
.bignum{{font:700 128px/1 var(--sans);letter-spacing:-.05em}}
@media (max-width:720px){{.bignum{{font-size:72px}}}}

/* problem */
.prob h2{{grid-column:1/9}}
.prob ul{{grid-column:1/-1;margin-top:var(--s16);display:grid;grid-template-columns:repeat(4,minmax(0,1fr));column-gap:var(--g)}}
.prob li{{border-top:2px solid var(--paper);padding-top:var(--s4);font-size:24px;line-height:32px;font-weight:500;letter-spacing:-.01em}}
@media (max-width:960px){{.prob ul{{grid-template-columns:repeat(2,minmax(0,1fr));row-gap:var(--s8)}}}}
@media (max-width:720px){{.prob h2{{grid-column:1/-1}}.prob ul{{grid-template-columns:1fr;margin-top:var(--s10)}}.prob li{{font-size:20px;line-height:28px}}}}

/* reveal */
.rev .lead{{grid-column:1/-1;font-size:30px;line-height:36px;font-weight:500;letter-spacing:-.02em}}
@media (max-width:720px){{.rev .lead{{font-size:24px;line-height:32px}}}}
.rev p.big{{grid-column:1/12;margin-top:var(--s4);font-size:96px;line-height:1;font-weight:700;letter-spacing:-.045em;text-wrap:balance}}
.rw{{color:var(--ink);opacity:.3;transition:opacity .6s var(--ease)}}
.rw.on{{opacity:1}}
@media (max-width:1180px){{.rev p.big{{font-size:72px}}}}
@media (max-width:720px){{.rev p.big{{grid-column:1/-1;font-size:48px}}}}

/* routine */
.rt-head h2{{grid-column:1/8}}
.rt-head .lede{{grid-column:9/13;align-self:start;margin-top:var(--s2)}}
@media (max-width:960px){{.rt-head h2,.rt-head .lede{{grid-column:1/-1}}.rt-head .lede{{margin-top:var(--s6)}}}}
.halves{{display:grid;grid-template-columns:1fr 1fr;margin-top:var(--s16)}}
.half{{position:relative;overflow:hidden;min-height:640px;padding:var(--s10) var(--m) var(--s12);display:flex;flex-direction:column;justify-content:flex-end;gap:var(--s4)}}
.half.am{{background:var(--am)}}.half.pm{{background:var(--pm)}}
.half .lab{{font:500 14px/20px var(--mono)}}
.half h3{{font-size:48px;line-height:1;letter-spacing:-.04em;max-width:520px}}
.half p{{font-size:18px;line-height:28px;max-width:460px}}
.sun{{position:absolute;width:280px;height:280px;border-radius:50%;background:var(--ink);right:var(--m);top:var(--s10);transform:translateY(calc(var(--rise,0) * 1px))}}
.moon{{position:absolute;width:300px;height:300px;border-radius:50%;background:var(--ink);right:var(--m);top:var(--s10)}}
.moon::after{{content:"";position:absolute;width:300px;height:300px;border-radius:50%;background:var(--pm);left:84px;top:-36px}}
.rt-note{{margin-top:var(--s6);font-size:14px;line-height:20px;color:var(--ink2)}}
@media (max-width:720px){{.halves{{grid-template-columns:1fr;margin-top:var(--s10)}}.half{{min-height:480px}}.half h3{{font-size:36px;line-height:40px}}.sun{{width:180px;height:180px;top:var(--s8)}}.moon,.moon::after{{width:200px;height:200px}}.moon::after{{left:56px;top:-24px}}}}

/* benefits */
.bn-head h2{{grid-column:1/9}}
.bn-head .lede{{grid-column:1/7;margin-top:var(--s6)}}
.bn-grid{{margin-top:var(--s16);display:grid;grid-template-columns:1fr 1fr;column-gap:var(--g)}}
.bn{{border-top:8px solid var(--c);padding-top:var(--s6)}}
.bn.am{{--c:var(--am)}}.bn.pm{{--c:var(--pm)}}
.bn h3{{font-size:36px;line-height:40px;letter-spacing:-.03em}}
.bn>p{{margin-top:var(--s4);font-size:18px;line-height:28px;color:var(--ink2);max-width:560px}}
.facts{{margin-top:var(--s8)}}
.facts li{{display:flex;align-items:center;gap:var(--s3);padding:var(--s3) 0;border-top:1px solid var(--hair);font-size:20px;line-height:28px;font-weight:500}}
.facts li:last-child{{border-bottom:1px solid var(--hair)}}
.facts li::before{{content:"";flex:none;width:12px;height:12px;background:var(--c)}}
.plus{{margin-top:var(--s8);display:flex;gap:var(--s4);padding:var(--s4);border:2px solid var(--ink);font-size:16px;line-height:24px}}
.plus i{{flex:none;width:20px;height:20px;border-radius:50%;background:var(--b12);margin-top:2px}}
.bn-note{{margin-top:var(--s12);max-width:720px;font-size:14px;line-height:20px;color:var(--ink2)}}
@media (max-width:860px){{.bn-head h2,.bn-head .lede{{grid-column:1/-1}}.bn-grid{{grid-template-columns:1fr;row-gap:var(--s12)}}.bn h3{{font-size:30px;line-height:36px}}}}

/* how */
.how-head h2{{grid-column:1/8}}
.how-head .lede{{grid-column:9/13;align-self:start;margin-top:var(--s2)}}
@media (max-width:960px){{.how-head h2,.how-head .lede{{grid-column:1/-1}}.how-head .lede{{margin-top:var(--s6)}}}}
.kits{{margin-top:var(--s16);display:grid;grid-template-columns:1fr 1fr;column-gap:var(--g)}}
.kit{{border:2px solid var(--ink);padding:var(--s6);display:flex;flex-direction:column;justify-content:space-between;min-height:340px}}
.kit.dk{{background:var(--ink);color:var(--paper)}}
.kit .nm{{display:flex;justify-content:space-between;gap:var(--s4);font-size:24px;line-height:32px;font-weight:700;letter-spacing:-.02em}}
.kit .nm span{{font:500 14px/20px var(--mono);align-self:center}}
.kit .pz{{font:700 128px/1 var(--sans);letter-spacing:-.05em}}
.kit .ct{{font:500 14px/20px var(--mono);border-top:1px solid currentColor;padding-top:var(--s3)}}
.steps{{margin-top:var(--s16);display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:var(--g)}}
.steps li{{border-top:2px solid var(--ink);padding-top:var(--s4);display:flex;flex-direction:column;gap:var(--s2)}}
.steps .n{{font:700 60px/1 var(--sans);letter-spacing:-.04em}}
.steps .lab{{font:500 14px/20px var(--mono);margin-top:var(--s4)}}
.steps h3{{font-size:24px;line-height:32px}}
.steps p{{color:var(--ink2)}}
.bill{{margin-top:var(--s16);display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--g);border-top:8px solid var(--ink);padding-top:var(--s6)}}
.bill h3{{grid-column:1/5;font-size:36px;line-height:40px;letter-spacing:-.03em}}
.bill .bx{{grid-column:1/5;grid-row:2;align-self:start;margin-top:var(--s6)}}
.bill ul{{grid-column:6/13;grid-row:1/4}}
.bill li{{padding:var(--s3) 0;border-bottom:1px solid var(--hair);font-size:18px;line-height:28px}}
.bill li:first-child{{padding-top:0}}
@media (max-width:600px){{.kit .nm{{flex-direction:column;gap:var(--s1)}}.kit .nm span{{align-self:flex-start}}}}
@media (max-width:860px){{.kits,.steps{{grid-template-columns:1fr;row-gap:var(--s6)}}.kit{{min-height:260px}}.kit .pz{{font-size:96px}}.bill{{grid-template-columns:1fr}}.bill h3,.bill .bx,.bill ul{{grid-column:1/-1;grid-row:auto}}.bill ul{{margin-top:var(--s6)}}}}

.kit-cta{{justify-content:flex-start;margin-top:var(--s6)}}.kit-cta p{{font-size:16px;line-height:24px;color:var(--ink2)}}
/* ingredients */
.ing-head h2{{grid-column:1/9}}
.ing-head .lede{{grid-column:1/7;margin-top:var(--s6)}}
.fxs{{margin-top:var(--s16);display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:var(--g);align-items:start}}
.fx header{{padding:var(--s4);background:var(--c);color:var(--ink)}}
.fx.am{{--c:var(--am)}}.fx.pm{{--c:var(--pm)}}.fx.b12{{--c:var(--b12)}}
.fx h3{{font-size:30px;line-height:36px;letter-spacing:-.03em}}
.fx header p{{font:500 14px/20px var(--mono);margin-top:var(--s1)}}
.tw{{overflow-x:auto}}
table{{width:100%;border-collapse:collapse;font-size:14px;line-height:20px}}
th{{text-align:left;font:500 12px/16px var(--mono);padding:var(--s3) 0 var(--s2);border-bottom:2px solid var(--ink)}}
td{{padding:var(--s2) 0;border-bottom:1px solid var(--hair);vertical-align:top}}
td:last-child,th:last-child{{text-align:right;font-family:var(--mono);white-space:nowrap;padding-left:var(--s4)}}
.fdesc{{margin-top:var(--s4);font-size:14px;line-height:20px}}
.fprep{{margin-top:var(--s3);font-size:14px;line-height:20px;color:var(--ink2)}}
.fnote{{margin-top:var(--s8);font-size:14px;line-height:20px;color:var(--ink2);max-width:720px}}
.sci{{margin-top:var(--s24)}}
.sci-head h3{{grid-column:1/7;font-size:48px;line-height:1;letter-spacing:-.04em}}
.sci-head p{{grid-column:8/13;align-self:start;margin-top:var(--s2);color:var(--ink2);font-size:18px;line-height:28px}}
.sc{{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--g);padding:var(--s6) 0;border-top:2px solid var(--ink)}}
.sci-list{{margin-top:var(--s12)}}
.sc h4{{grid-column:1/4;font-size:30px;line-height:36px;letter-spacing:-.03em}}
.sc>div{{grid-column:4/13;display:grid;gap:var(--s3);font-size:16px;line-height:24px}}
.sc>div p{{color:var(--ink2)}}.sc strong{{color:var(--ink);font-weight:700}}
.src{{font:500 12px/16px var(--mono);display:grid;gap:var(--s2)}}
.fda{{margin-top:var(--s8);padding-top:var(--s4);border-top:1px solid var(--hair);font-size:14px;line-height:20px;color:var(--ink2);max-width:880px}}
@media (min-width:1101px){{.fx.b12{{position:sticky;top:96px}}}}
@media (max-width:1100px){{.fxs{{grid-template-columns:1fr 1fr;row-gap:var(--s10)}}.fx.am{{grid-row:span 2}}}}
@media (max-width:860px){{.ing-head h2,.ing-head .lede,.sci-head h3,.sci-head p{{grid-column:1/-1}}.sci-head p{{margin-top:var(--s4)}}.fxs{{grid-template-columns:1fr}}.fx.am{{grid-row:auto}}.sc{{grid-template-columns:1fr;row-gap:var(--s3)}}.sc h4,.sc>div,.src{{grid-column:1/-1}}.sci-head h3{{font-size:36px;line-height:40px}}}}

.mc>summary{{display:none}}
@media (max-width:600px){{.mc>summary{{display:flex;align-items:center;justify-content:space-between;min-height:48px;cursor:pointer;list-style:none;font:500 14px/20px var(--mono);border-top:2px solid var(--ink);border-bottom:1px solid var(--hair)}}
 .mc>summary::-webkit-details-marker{{display:none}}
 .mc>summary::after{{content:"";width:14px;height:14px;background:linear-gradient(var(--ink),var(--ink)) center/14px 2px no-repeat,linear-gradient(var(--ink),var(--ink)) center/2px 14px no-repeat}}
 .mc[open]>summary::after{{background:linear-gradient(var(--ink),var(--ink)) center/14px 2px no-repeat}}
 .mc[open]>summary{{margin-bottom:var(--s2)}}}}
.sc details{{display:grid;gap:var(--s3)}}.sc .src{{margin-top:var(--s3)}}
.fx-after{{margin-top:var(--s10);padding-top:var(--s6);border-top:2px solid var(--ink);display:grid;gap:var(--s6);justify-items:start}}.fx-after .fnote{{margin:0}}
@media (max-width:600px){{.after.m-hide,.after.m-trim .btn{{display:none}}}}
.sl{{display:block}}
@media (max-width:720px){{.prob li{{text-wrap:wrap}}}}
.mc:not([open])>summary{{border-bottom:0}}
/* faq */
.faq .grid{{align-items:start}}
.faq h2{{grid-column:1/5;position:sticky;top:96px}}
.faq-list{{grid-column:6/13;border-top:2px solid var(--ink)}}
details{{border-bottom:1px solid var(--hair)}}
summary{{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:var(--s6);padding:var(--s4) 0;font-size:20px;line-height:28px;font-weight:500;transition:color .3s var(--ease)}}
summary::-webkit-details-marker{{display:none}}
summary:hover{{color:#000000B3}}
summary i{{position:relative;flex:none;width:16px;height:16px}}
summary i::before,summary i::after{{content:"";position:absolute;left:0;right:0;top:7px;height:2px;background:var(--ink);transition:transform .5s var(--ease)}}
summary i::after{{transform:rotate(90deg)}}
details[open] summary i::after{{transform:rotate(0)}}
.ans{{overflow:hidden}}
.ans p{{padding:0 var(--s12) var(--s6) 0;font-size:16px;line-height:24px;color:var(--ink2);max-width:640px}}
@media (max-width:860px){{.faq h2{{grid-column:1/-1;position:static}}.faq-list{{grid-column:1/-1;margin-top:var(--s8)}}summary{{font-size:18px;line-height:28px}}.ans p{{padding-right:0}}}}

/* final */
.final{{background:var(--am)}}
.final h2{{grid-column:1/11;font-size:128px;line-height:1;letter-spacing:-.05em}}
.final .fb{{grid-column:1/-1;margin-top:var(--s10);display:flex;flex-wrap:wrap;align-items:center;gap:var(--s4) var(--s8)}}
.final .fb p{{font-size:20px;line-height:28px;font-weight:500}}
@media (max-width:1180px){{.final h2{{font-size:96px}}}}
.final :focus-visible{{outline-color:var(--paper)}}
@media (max-width:720px){{.final h2{{grid-column:1/-1;font-size:48px}}.final .fb p{{font-size:18px}}}}

/* footer */
.foot{{background:var(--ink);color:var(--paper);padding:var(--s16) 0 calc(var(--s10) + env(safe-area-inset-bottom,0px))}}
.foot .logo{{color:var(--paper)}}
.foot .grid{{align-items:start}}.foot .f1{{grid-column:1/6}}.foot .f1 .logo{{min-height:44px}}.foot button.lk{{font:inherit;line-height:20px}}.foot .f2{{grid-column:7/10}}.foot .f3{{grid-column:10/13}}
.foot p{{margin-top:var(--s4);font-size:14px;line-height:20px;color:#FFFFFFB3;max-width:360px}}
.foot ul{{display:grid;font-size:14px;line-height:20px}}
.foot ul li{{min-height:44px;display:flex;align-items:center}}
.foot a{{text-decoration:none;color:#FFFFFFCC;transition:color .3s var(--ease)}}.foot a:hover{{color:var(--paper)}}
.foot button.lk{{all:unset;cursor:pointer;color:var(--paper);font-weight:500}}.foot button.lk:hover{{color:var(--am)}}.foot .f3 li{{color:#FFFFFF99}}
.foot .base{{grid-column:1/-1;margin-top:var(--s16);padding-top:var(--s4);border-top:1px solid var(--hair-d);font-size:12px;line-height:16px;color:#FFFFFF99}}
@media (max-width:720px){{.foot .f1,.foot .f2,.foot .f3{{grid-column:1/-1}}.foot .f2,.foot .f3{{margin-top:var(--s8)}}}}

/* dialog */
dialog{{border:2px solid var(--ink);border-radius:0;padding:var(--s8);max-width:min(520px,calc(100vw - 32px));background:var(--paper);color:var(--ink)}}
dialog::backdrop{{background:#000000B3}}
dialog[open]{{animation:dlg .5s var(--ease)}}
dialog h2{{font-size:36px;line-height:40px;letter-spacing:-.03em}}
dialog p{{margin:var(--s4) 0 var(--s6);color:var(--ink2)}}
dialog .bar{{height:8px;display:grid;grid-template-columns:1fr 1fr;margin:calc(var(--s8) * -1) calc(var(--s8) * -1) var(--s6)}}
dialog .bar i{{background:var(--am)}}dialog .bar i+i{{background:var(--pm)}}

/* sachets: flat packets with crimped seals */
.blk.am,.blk.pm,.sach{{--teeth:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='6'%3E%3Cpath d='M0 0h12L6 6z' fill='%23fff'/%3E%3C/svg%3E")}}
.blk.am::before,.blk.pm::before,.sach::before,.blk.am::after,.blk.pm::after,.sach::after{{content:"";position:absolute;left:0;right:0;height:6px;background:var(--teeth) repeat-x;background-size:12px 6px}}
.blk.am::before,.blk.pm::before,.sach::before{{top:0}}
.blk.am::after,.blk.pm::after,.sach::after{{bottom:0;transform:scaleY(-1)}}
.blk .seal,.sach .seal{{position:absolute;left:var(--s4);right:var(--s4);top:20px;border-top:2px dashed #00000040}}
.blk.am,.blk.pm{{padding-top:var(--s10)}}
.after{{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--s4) var(--s8);margin-top:var(--s8)}}
.after .rt-note,.after .fnote{{margin-top:0;max-width:720px}}
.fb-ben{{padding:var(--s4) 0 var(--s6)}}
.fb-ben h4{{font-size:24px;line-height:32px;letter-spacing:-.02em}}
.fb-ben>p{{margin-top:var(--s3);font-size:16px;line-height:24px;color:var(--ink2)}}
.fx .facts{{margin-top:var(--s6)}}.fx .facts li{{font-size:16px;line-height:24px}}
.plusp{{font-size:16px;line-height:24px}}
.ing-head .lede strong{{color:var(--ink);font-weight:700}}
.final{{position:relative;overflow:hidden;background:var(--ink);color:var(--paper);border-bottom:1px solid var(--hair-d)}}
.final h2{{grid-column:1/9}}
.final .fb{{grid-column:1/9}}
.final .fb p{{color:#FFFFFFCC}}
.final .btn{{background:var(--am);border-color:var(--am);color:var(--ink)}}
.final .btn:hover{{background:var(--paper);border-color:var(--paper)}}
.fin-art{{grid-column:9/13;grid-row:1/3;align-self:end;display:grid;gap:var(--s2)}}
.tix{{display:grid;grid-template-columns:1fr 1fr;gap:var(--s2)}}
.sach{{position:relative;min-height:340px;padding:var(--s10) var(--s4) var(--s4);display:flex;flex-direction:column;justify-content:flex-end;gap:var(--s1);color:var(--ink)}}
.sach b{{font:700 24px/32px var(--sans);letter-spacing:-.02em;white-space:nowrap}}
.sach small{{font:500 12px/16px var(--mono)}}
.sach.am{{background:var(--am)}}.sach.pm{{background:var(--pm)}}
.sach::before,.sach::after{{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='6'%3E%3Cpath d='M0 0h12L6 6z' fill='%23000'/%3E%3C/svg%3E")}}
.strip{{background:var(--paper);color:var(--ink);display:flex;align-items:center;justify-content:space-between;gap:var(--s4);padding:var(--s4);font:500 12px/16px var(--mono)}}.strip .d{{display:flex;gap:var(--s2)}}
.strip i{{width:20px;height:20px;border-radius:50%;background:var(--b12)}}
@media (max-width:960px){{.final h2,.final .fb,.fin-art{{grid-column:1/-1}}.fin-art{{grid-row:auto;margin-top:var(--s12)}}}}
@media (max-width:720px){{.sach{{min-height:240px}}.sach b{{font-size:20px;line-height:28px}}.strip i{{width:12px;height:12px}}.strip .d{{gap:var(--s1)}}}}

/* motion */
@keyframes up{{from{{transform:translateY(105%)}}}}
@keyframes slide{{from{{transform:translateX(48px);opacity:0}}}}
@keyframes pop{{from{{transform:scale(.4);opacity:0}}}}
@keyframes dlg{{from{{transform:translateY(24px);opacity:0}}}}
.pre{{opacity:0;transform:translateY(32px)}}
.pre.in{{opacity:1;transform:none;transition:opacity .7s var(--ease),transform .7s var(--ease);transition-delay:var(--d,0ms)}}
@media (prefers-reduced-motion:reduce){{
 .h1 .ln>span,.blk,.pills i,dialog[open]{{animation:none}}
 .pre{{transform:none}}
 .mpanel a:not(.btn){{transform:none}}
 .sun{{transform:none}}
 *{{transition-property:opacity,color,background-color!important}}
}}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="top"><div class="wrap">
 <a class="logo" href="#top" aria-label="{e(C['brand']['name'])}, back to top"><span class="mark" aria-hidden="true"><i></i><i></i></span>{e(C['brand']['name'])}</a>
 <nav aria-label="Main">{nav}</nav>
 <button class="btn sm" type="button" data-order>{e(hero['cta_primary'])}</button>
 <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mpanel" aria-label="Open menu"><i></i><i></i></button>
</div></header>
<div class="mpanel" id="mpanel" hidden>{mnav}<button class="btn" type="button" data-order>{e(hero['cta_primary'])}</button></div>

<main id="main">
<section class="hero" id="top" aria-labelledby="h1">
 <div class="cols" aria-hidden="true"><div class="wrap"><div class="grid">{'<i></i>' * 12}</div></div></div>
 <div class="wrap"><div class="grid">
  <div class="hero-copy">
   <h1 class="h1 disp" id="h1" aria-label="{e(hero['headline'])}">{h1}</h1>
   <p class="sub">{e(hero['subhead'])}</p>
   <div class="buy"><button class="btn" type="button" data-order>{e(hero['cta_primary'])}</button><a class="link" href="#routine">{e(hero['cta_secondary'])}</a></div>
   <p class="price"><strong>$39</strong> for your 7-Day Starter, then <strong>$99 every 30 days</strong> for your Monthly box ($3.30 a day)<small>{e(hero['price_note'])}</small></p>
   <ul class="trust" aria-label="At a glance">{''.join(f'<li>{e(t)}</li>' for t in hero['trust'])}</ul>
  </div>
  <div class="stack" aria-label="What's in the box">
   <div class="blk am" style="--i:0"><span class="seal" aria-hidden="true"></span><div class="row"><span class="k">{e(pr[0]['when'])}</span><span class="k">{e(pr[0]['key'])}</span></div><div><b>{e(pr[0]['name'])}</b><span class="d">{e(pr[0]['what'])}</span></div></div>
   <div class="blk pm" style="--i:1"><span class="seal" aria-hidden="true"></span><div class="row"><span class="k">{e(pr[2]['when'])}</span><span class="k">{e(pr[2]['key'])}</span></div><div><b>{e(pr[2]['name'])}</b><span class="d">{e(pr[2]['what'])}</span></div></div>
   <div class="blk b12" style="--i:2"><div class="row"><b>{e(pr[1]['name'])}</b><span class="k">{e(pr[1]['when'])}</span></div><div class="pills" aria-hidden="true">{dots}</div><span class="d">{e(pr[1]['what'])}</span></div>
  </div>
 </div></div>
</section>

<section class="sec dark prob" aria-labelledby="p-h">
 <div class="wrap"><div class="grid">
  <h2 class="h2 disp" id="p-h" data-r>{e(prob['heading'])}</h2>
  <ul>{prob_items}</ul>
 </div></div>
</section>

<section class="sec rev" aria-label="{e(lead_in)}">
 <div class="wrap"><div class="grid">
  <p class="lead" data-r>{e(lead_in)}</p>
  <p class="big" id="reveal">{reveal_words}</p>
 </div></div>
</section>

<section class="sec" id="routine" aria-labelledby="r-h" style="padding-bottom:0">
 <div class="wrap"><div class="grid rt-head">
  <h2 class="h2 disp" id="r-h" data-r>{''.join(f'<span class="sl">{e(x.strip())}</span> ' for x in rt['heading'].replace('. ', '.|').split('|'))}</h2>
  <p class="lede" data-r>{e(rt['body'])}</p>
 </div></div>
 <div class="halves">
  <article class="half am"><span class="sun" aria-hidden="true"></span><span class="lab">{e(rt['steps'][0]['label'])}</span><h3>{e(rt['steps'][0]['title'])}</h3><p>{e(rt['steps'][0]['body'])}</p></article>
  <article class="half pm"><span class="moon" aria-hidden="true"></span><span class="lab">{e(rt['steps'][1]['label'])}</span><h3>{e(rt['steps'][1]['title'])}</h3><p>{e(rt['steps'][1]['body'])}</p></article>
 </div>
 <div class="wrap after m-trim"><p class="rt-note">{e(rt['note'])}</p><button class="btn" type="button" data-order>{e(hero['cta_primary'])}</button></div>
</section>

<section class="sec" id="how" aria-labelledby="h-h">
 <div class="wrap">
  <div class="grid how-head"><h2 class="h2 disp" id="h-h" data-r>{e(how['heading'])}</h2><p class="lede" data-r>{e(how['body'])}</p></div>
  <div class="kits">
   <article class="kit" data-r><div class="nm">{e(kit1['name'])}<span>{e(kit1['contents'])}</span></div><div class="pz">{e(kit1['price'])}</div><p class="ct">Days 1 to 7, then the Monthly box</p></article>
   <article class="kit dk" data-r style="--d:120ms"><div class="nm">{e(kit2['name'])}<span>{e(kit2['contents'])}</span></div><div class="pz">{e(kit2['price'])}</div><p class="ct">Every 30 days, until you cancel</p></article>
  </div>
  <ol class="steps">{steps}</ol>
  <div class="bill" data-r><h3>{e(how['billing']['heading'])}</h3><ul>{bill}</ul><div class="bx"><button class="btn" type="button" data-order>{e(hero['cta_primary'])}</button></div></div>
 </div>
</section>

<section class="sec" id="ingredients" aria-labelledby="i-h" style="background:#F4F4F4">
 <div class="wrap">
  <div class="grid ing-head"><h2 class="h2 disp" id="i-h" data-r>{e(bn['heading'])}</h2><p class="lede" data-r><strong>{e(ing['heading'])}</strong> {e(ing['body'])}</p></div>
  <div class="fxs">{fx}</div>

  <div class="sci">
   <div class="grid sci-head"><h3 data-r>{e(ing['science']['heading'])}</h3><p data-r>{e(ing['science']['body'])}</p></div>
   <div class="sci-list">{sci}</div>
  </div>
 </div>
</section>

<section class="sec faq" id="faq" aria-labelledby="f-h">
 <div class="wrap"><div class="grid">
  <h2 class="h2 disp" id="f-h">{e(faq['heading'])}</h2>
  <div class="faq-list">{faqs}</div>
 </div></div>
</section>

<section class="sec final" aria-labelledby="c-h">
 <div class="wrap"><div class="grid">
  <h2 class="disp" id="c-h" data-r>{e(fin['heading'])}</h2>
  <div class="fb" data-r><button class="btn" type="button" data-order>{e(fin['cta'])}</button><p>{e(fin['body'])}</p></div>
  <div class="fin-art" aria-hidden="true"><div class="tix"><div class="sach am"><span class="seal"></span><b>{e(pr[0]['name'])}</b><small>{e(pr[0]['when'])}</small></div><div class="sach pm"><span class="seal"></span><b>{e(pr[2]['name'])}</b><small>{e(pr[2]['when'])}</small></div></div><div class="strip"><span>{e(pr[1]['name'])}</span><span class="d">{dots}</span></div></div>
 </div></div>
</section>
</main>

<footer class="foot"><div class="wrap"><div class="grid">
 <div class="f1"><a class="logo" href="#top"><span class="mark" aria-hidden="true"><i></i><i></i></span>{e(C['brand']['name'])}</a><p>{e(foot['tagline'])}</p><p>{e(foot['disclaimer'])}</p></div>
 <ul class="f2">{''.join(f'<li><a href="#{i}">{e(t)}</a></li>' for i, t in zip(nav_ids, foot['links']))}</ul>
 <ul class="f3"><li><button class="lk" type="button" data-order>{e(foot['extra'][0])}</button></li>{''.join(f'<li>{e(t)}</li>' for t in foot['extra'][1:])}</ul>
 <p class="base">{e(ing['fda'])}</p>
</div></div></footer>

<dialog id="order" aria-labelledby="o-h"><div class="bar" aria-hidden="true"><i></i><i></i></div><h2 id="o-h">{e(on['title'])}</h2><p>{e(on['body'])}</p><form method="dialog"><button class="btn">{e(on['button'])}</button></form></dialog>

<script>
(function(){{
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(s,r){{return Array.prototype.slice.call((r||document).querySelectorAll(s))}};
// order notice
var dlg=document.getElementById('order'),last=null;
$('[data-order]').forEach(function(b){{b.addEventListener('click',function(){{last=b;closeMenu();dlg.showModal()}})}});
dlg.addEventListener('close',function(){{last&&last.focus()}});
dlg.addEventListener('click',function(ev){{if(ev.target===dlg)dlg.close()}});
// in-page links scroll smoothly (never set in CSS, so tools and back-to-top stay instant)
$('a[href^="#"]').forEach(function(a){{a.addEventListener('click',function(ev){{var id=a.getAttribute('href').slice(1),t=id==='top'?document.body:document.getElementById(id);if(!t)return;ev.preventDefault();
 var y=id==='top'?0:t.getBoundingClientRect().top+scrollY-64;scrollTo({{top:y,behavior:reduce?'auto':'smooth'}});history.replaceState(null,'','#'+id)}})}});
// mobile menu
var mb=document.querySelector('.menu-btn'),mp=document.getElementById('mpanel');
function closeMenu(){{if(mp.hidden)return;mp.classList.remove('open');mb.setAttribute('aria-expanded','false');mb.setAttribute('aria-label','Open menu');mp.hidden=true;document.body.style.overflow=''}}
mb.addEventListener('click',function(){{if(!mp.hidden){{closeMenu();return}}mp.hidden=false;mb.setAttribute('aria-expanded','true');mb.setAttribute('aria-label','Close menu');document.body.style.overflow='hidden';requestAnimationFrame(function(){{mp.classList.add('open')}})}});
$('a',mp).forEach(function(a){{a.addEventListener('click',closeMenu)}});
addEventListener('keydown',function(ev){{if(ev.key==='Escape')closeMenu()}});
// reveals, once
var io='IntersectionObserver' in window?new IntersectionObserver(function(es){{es.forEach(function(x){{if(x.isIntersecting){{x.target.classList.add('in');io.unobserve(x.target)}}}})}},{{rootMargin:'0px 0px -8% 0px',threshold:.08}}):null;
if(matchMedia('(max-width:600px)').matches)$('details.mc').forEach(function(d){{d.open=false}});
var pend=$('[data-r]').filter(function(el){{return el.getBoundingClientRect().top>innerHeight*.92}});
pend.forEach(function(el){{el.classList.add('pre');io?io.observe(el):el.classList.add('in')}});
// tagline: each word inks in as it crosses the trigger line
var words=$('.rw'),spy=$('[data-spy]'),secs=spy.map(function(a){{return document.getElementById(a.dataset.spy)}}),sun=document.querySelector('.sun'),tick=false;
function frame(){{tick=false;var vh=innerHeight,line=vh*.62;
 pend.forEach(function(el){{if(!el.classList.contains('in')&&el.getBoundingClientRect().top<vh)el.classList.add('in')}});
 words.forEach(function(w){{if(w.getBoundingClientRect().top<line)w.classList.add('on')}});
 var mid=vh*.4,cur=-1;secs.forEach(function(s,i){{var r=s.getBoundingClientRect();if(r.top<=mid&&r.bottom>mid)cur=i}});
 spy.forEach(function(a,i){{a.classList.toggle('on',i===cur);if(i===cur)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')}});
 if(sun&&!reduce){{var r=sun.parentNode.getBoundingClientRect();var p=Math.max(-1,Math.min(1,(r.top+r.height/2-vh/2)/vh));sun.style.setProperty('--rise',(p*60).toFixed(1))}}
}}
addEventListener('scroll',function(){{if(!tick){{tick=true;requestAnimationFrame(frame)}}}},{{passive:true}});
addEventListener('resize',frame);frame();
// FAQ opens and closes with its height
$('details').forEach(function(d){{var s=d.querySelector('summary'),a=d.querySelector('.ans'),an=null;
 s.addEventListener('click',function(ev){{if(reduce)return;ev.preventDefault();var h=a.offsetHeight;if(an)an.cancel();
  if(!d.open){{d.open=true;an=a.animate({{height:[h+'px',a.scrollHeight+'px']}},{{duration:500,easing:'cubic-bezier(.22,1,.36,1)'}})}}
  else{{an=a.animate({{height:[h+'px','0px']}},{{duration:400,easing:'cubic-bezier(.22,1,.36,1)'}});an.onfinish=function(){{d.open=false}}}}}})}});
}})();
</script>
</body>
</html>
'''
open(os.path.join(ROOT, 'v-swiss-poster.html'), 'w', encoding='utf-8').write(page)
print('wrote', len(page))
