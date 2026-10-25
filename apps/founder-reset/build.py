"""Builds the Founder Reset page: illustrations, index.html, and a single-file bundle.
Run from this directory:  python3 build.py [bundle_out.html]"""
import os, re, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src'))
import scenes
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')

ill = {'hero': scenes.hero(), 'routine': scenes.routine(), 'final': scenes.final(), **scenes.familiar(), **scenes.kits(), 'drinks': scenes.drinks(), 'calendar': scenes.calendar()}

# standalone illustration files
os.makedirs(os.path.join(HERE, 'assets', 'illustrations'), exist_ok=True)
for n, v in ill.items():
    open(os.path.join(HERE, 'assets', 'illustrations', n + '.svg'), 'w').write(v.replace('class="ill"', 'width="900"'))

def words(t, start=.15, step=.07):
    out = []; i = 0
    for w in t.split():
        out.append(f'<span class="w"><span style="--wd:{start+i*step:.2f}s">{w}</span></span>'); i += 1
    return ' '.join(out)

am_rows = [("Creatine monohydrate", "3,000 mg"), ("Sodium, elemental", "200 mg"), ("Potassium, elemental", "150 mg"), ("Vitamin D3", "15 µg (600 IU)"), ("Vitamin C", "80 mg"), ("Vitamin B1 (Thiamine)", "1.2 mg"), ("Vitamin B2 (Riboflavin)", "1.3 mg"), ("Vitamin B3 (Niacinamide)", "16 mg NE"), ("Vitamin B5 (Pantothenic acid)", "5 mg"), ("Vitamin B6", "1.7 mg"), ("Folate", "400 µg DFE")]
pm_rows = [("Glycine", "3,000 mg"), ("L-theanine", "200 mg"), ("Magnesium, elemental", "100 mg"), ("Zinc, elemental", "5 mg")]
def tbl(rows, col, label):
    return f'<table><caption hidden>Active ingredients per serving for {label}</caption><thead><tr><th scope="col">Ingredient</th><th scope="col">{col}</th></tr></thead><tbody>' + ''.join(f'<tr><td>{a}</td><td>{b}</td></tr>' for a, b in rows) + '</tbody></table>'

faq = [("Who is Founder Reset for?", "Adults who want a simple daily supplement routine that fits a busy working day. We built it with founders in mind, but you don't need to run a company to use it."),
("When will I notice a difference?", "Everyone's different, and we won't promise a change by a set day. With 3 g a day, creatine stores typically build up over around four weeks. The 7-Day Starter is there to build the habit and see if the routine suits you."),
("What does it taste like?", "Flavors will be confirmed before ordering opens."),
("Why not just buy these ingredients separately?", "You can. Founder Reset is for people who'd rather not manage a shelf of tubs, measure scoops and remember what goes when. Two sachets, already measured, with every dose on the label."),
("Does it contain caffeine?", "No. Neither drink has added caffeine, so it won't stack on top of your coffee."),
("Is this a subscription?", "Yes. Your $39 7-Day Starter rolls into a $99 Monthly box every 30 days until you cancel. See &ldquo;How billing works&rdquo; above."),
("How do I cancel?", "Canceling before your renewal date prevents the next charge. The exact cancellation process and full terms will be confirmed before ordering opens."),
("Can I pause or skip a month?", "This has not been confirmed yet. It will be shown in full before ordering opens, and before any payment."),
("When will it arrive, and what does shipping cost?", "Delivery times and shipping costs: this has not been confirmed yet. It will be shown in full before ordering opens, and before any payment."),
("What's your refund policy?", "Refund terms: this has not been confirmed yet. It will be shown in full before ordering opens, and before any payment."),
("Is it right for me if I take medicines or other supplements?", "Founder Reset is for adults. Compare the ingredient tables above with anything you already take, and talk to a pharmacist about any overlap. If you take medicines, have a health condition, or are pregnant or breastfeeding, check with a pharmacist or clinician first. Always follow the label."),
("Where are the full ingredients and allergens?", "Every active ingredient is listed above. The full ingredient list, allergens and directions are printed on each label.")]
sci = [("Creatine", "Supports strength and power during high-intensity exercise, with consistent daily use.*", "The International Society of Sports Nutrition reviewed research on creatine in exercise and training. At 3 g a day without a loading phase, muscle creatine stores typically build up over around four weeks.", ["International Society of Sports Nutrition position stand (2017)"]),
("Vitamin B12", "Needed for normal energy metabolism, red blood cell formation and nervous system function.*", "The NIH fact sheet covers B12 intake and absorption. Supplementing matters most when intake or absorption is low, which is more common with age and plant-based diets. Additional B12 has not been shown to improve energy or endurance when B12 status is adequate.", ["NIH Office of Dietary Supplements, Vitamin B12 fact sheet"]),
("Magnesium", "Supports normal muscle and nerve function and is involved in more than 300 enzyme systems, including energy metabolism.*", "The NIH fact sheet notes that many US adults get less magnesium from food than recommended. It reviews nutritional roles and intake, rather than testing the finished Founder Reset product.", ["NIH Office of Dietary Supplements, Magnesium fact sheet"]),
("Glycine", "An amino acid studied for its role in sleep quality.*", "Small studies in Japan gave volunteers 3 g of glycine before bed. Yamadera and colleagues (2007) measured self-reported sleep quality and sleep recordings in people with unsatisfactory sleep. Bannai and colleagues (2012) studied next-day fatigue and performance during partial sleep restriction. These studies were small and involved industry-affiliated researchers.", ["Bannai et al., Frontiers in Neurology (2012)", "Yamadera et al., Sleep and Biological Rhythms (2007)"]),
("L-theanine", "An amino acid found in tea, studied for relaxation.*", "Hidese and colleagues (2019) gave 30 healthy adults 200 mg a day of L-theanine or placebo for four weeks in a randomized crossover trial, measuring stress-related symptoms, sleep and cognitive function. The study was small and received industry support.", ["Hidese et al., Nutrients (2019)"])]
sci_html = ''.join(f'<article data-r><h4>{n}</h4><p><b>What it does.</b> {d}</p><p><b>What the research shows.</b> {r}</p>' + ''.join(f'<span class="src">{l}</span>' for l in ls) + '</article>' for n, d, r, ls in sci)
faq_html = ''.join(f'<details><summary>{q}</summary><p>{a}</p></details>' for q, a in faq)
fam = [('cup', 'Coffee is doing most of the heavy lifting.', .03), ('laptop', 'The laptop closes at 11. Your head doesn&rsquo;t.', -.025), ('bar', 'Lunch was a protein bar between calls.', -.03), ('tubs', 'There&rsquo;s a cupboard of supplement tubs you swore you&rsquo;d take.', .035)]
fam_html = ''.join(f'<li class="fam" data-r><figure><div data-speed="{sp}">{ill[n]}</div></figure><p>{t}</p></li>' for n, t, sp in fam)
fam_html = f'<ul class="fam-grid" style="list-style:none;padding:0;margin-bottom:0">{fam_html}</ul>'

body = f'''<a class="skip" href="#main">Skip to content</a>
<div class="progress" aria-hidden="true"></div>
<header class="top"><div class="wrap"><a class="brand" href="#">Founder Reset</a><nav aria-label="Main"><a href="#routine">The routine</a><a href="#how">How it works</a><a href="#ingredients">Ingredients</a><a href="#faq">Questions</a></nav><button class="btn" data-order>Start My 7-Day Reset</button></div></header>
<main id="main">

<section class="hero"><div class="wrap hero-grid">
<div class="hero-copy">
<h1 class="h1" aria-label="Your business has a system. Now your daily supplements do too.">{words("Your business has a system. Now your daily supplements do too.")}</h1>
<p class="tagline">Start strong. Recover well. Repeat.</p>
<p class="lede">Two drinks a day, built for people who run companies. One to start the morning, one to wind down at night. No added caffeine. No shelf of half-used tubs. Just open a sachet.</p>
<div class="price"><p><span class="big">$39</span>for your 7-Day Starter</p><p>then <strong>$99 every 30 days</strong> for your Monthly box ($3.30 a day)</p><small>The Starter rolls into a monthly subscription that renews until you cancel.</small></div>
<div class="cta-row"><button class="btn" data-order>Start My 7-Day Reset</button><a class="link" href="#routine">See the routine</a></div>
<p class="trust">No added caffeine, individually portioned, renews until you cancel.</p>
</div>
<div class="scene" data-sy><i class="glow a"></i><i class="glow b"></i>{ill["hero"]}</div>
</div></section>

<section class="familiar"><div class="wrap">
<div class="fam-head"><h2 data-r>You&rsquo;ve built systems for everything except yourself.</h2></div>
{fam_html}
<p class="fam-after" data-r>Founder Reset won&rsquo;t fix your calendar. It gives your day two fixed points, morning and evening, that take under a minute and zero decisions.</p>
</div></section>

<section class="story" id="routine"><div class="pin"><div class="wrap story-grid">
<div class="h2c">
<h2>Open the day. Close the day. That&rsquo;s the whole routine.</h2>
<p class="lede" style="margin-top:1.2rem">Two moments that bookend the day you already have. Sunrise orange to start, dusk lavender to finish, so you never have to think about which one&rsquo;s next.</p>
<div class="phases">
<article class="ph am"><h3>Morning: AM FUEL + B12 RESET</h3><p>Stir one AM FUEL sachet into 400 to 500 mL of water. Dissolve one B12 RESET tablet under your tongue.</p></article>
<article class="ph pm"><h3>Evening: PM RECOVER</h3><p>Stir one PM RECOVER sachet into 250 to 400 mL of water as you wind down.</p></article>
</div>
<div class="legend" aria-hidden="true"><span class="on">Morning</span><i></i><span>Evening</span></div>
</div>
<div class="story-art scene" data-sy><i class="orb sun"></i><i class="orb moon"></i>{ill["routine"]}</div>
</div></div></section>
<div class="wrap story-note"><p class="small" data-r>Keep your regular meals. These are supplements, not meal replacements.</p></div>

<section class="bene" style="padding-top:clamp(3rem,7vw,6rem)"><div class="wrap">
<div class="head2"><div><h2 data-r>One drink to start strong. One to recover well.</h2>
<p class="lede" data-r style="margin-top:1.2rem">Full doses, every amount on the label. No proprietary blends.</p></div>
<div class="art scene" data-sy>{ill["drinks"]}</div></div>
<div class="bene-grid">
<article class="am" data-r><h3>AM FUEL. Start strong.</h3><p>3,000 mg of creatine monohydrate, one of the most studied supplements in sports nutrition*. Sodium and potassium for hydration. B vitamins that support normal energy metabolism*. Plus vitamins D3 and C. All without adding to your caffeine load.</p>
<ul class="facts"><li><span data-count="3000">3,000</span> mg creatine</li><li>Electrolytes</li><li>B vitamins, D3 and C</li><li>No added caffeine</li></ul>
<p class="plus"><strong>Plus B12 RESET.</strong> A 1,000 &micro;g tablet that dissolves under your tongue. Vitamin B12 supports normal energy metabolism and nervous system function*.</p></article>
<article class="pm" data-r><h3>PM RECOVER. Recover well.</h3><p>3,000 mg of glycine, 200 mg of L-theanine, plus magnesium and zinc, for a caffeine-free evening wind-down*. Made for the hour before bed.</p>
<ul class="facts"><li><span data-count="3000">3,000</span> mg glycine</li><li><span data-count="200">200</span> mg L-theanine</li><li>Magnesium</li><li>Zinc</li><li>Caffeine-free</li></ul></article>
</div>
<p class="note" data-r>Some ingredients, like creatine, build up over weeks of daily use. This is a routine, not a quick fix. Results vary from person to person.</p>
</div></section>

<section class="how" id="how" style="background:#fff"><div class="wrap">
<div class="head2 cal"><div><h2 data-r>Begin with a week. Keep the rhythm.</h2><p class="lede" data-r style="margin-top:1.2rem">Seven days to build the habit. Then your Monthly box arrives every 30 days, until you cancel.</p></div>
<div class="art scene" data-sy>{ill["calendar"]}</div></div>
<div class="kits">
<div class="kit" data-r><figure class="scene" data-sy>{ill["starter"]}</figure><figcaption><b>7-Day Starter, $39</b><span>14 sachets, 7 B12 RESET tablets</span></figcaption></div>
<div class="kit" data-r><figure class="scene" data-sy>{ill["monthly"]}</figure><figcaption><b>Monthly box, $99</b><span>60 sachets, 30 B12 RESET tablets</span></figcaption></div>
</div>
<div class="tl">
<article data-r><span class="small">Days 1 to 7</span><h3>Build the habit. $39</h3><p>Your 7-Day Starter: 7 AM FUEL sachets, 7 PM RECOVER sachets and 7 B12 RESET tablets.</p></article>
<article data-r><span class="small">Every day</span><h3>Two drinks, one tablet.</h3><p>AM FUEL and B12 RESET in the morning. PM RECOVER in the evening. Under a minute each.</p></article>
<article class="hi" data-r><span class="small">Every 30 days</span><h3>Keep it going. $99</h3><p>Your Monthly box: 30 AM FUEL sachets, 30 PM RECOVER sachets and 30 B12 RESET tablets. That&rsquo;s $3.30 a day. It renews automatically until you cancel.</p></article>
</div>
<div class="bill" data-r><h3>How billing works</h3><div>
<p><strong>Today:</strong> $39 for your 7-Day Starter.</p>
<p>The timing of your first $99 Monthly box charge will be confirmed before ordering opens. You&rsquo;ll see the exact date before you pay.</p>
<p><strong>After that:</strong> $99 every 30 days, until you cancel.</p>
<p>Canceling before your renewal date prevents the next charge. The cancellation process and full terms will be confirmed before ordering opens.</p>
<p>Shipping, taxes and refund terms are shown before you pay.</p>
<button class="btn" data-order>Start My 7-Day Reset</button></div></div>
</div></section>

<section id="ingredients" style="padding-top:0"><div class="wrap">
<h2 data-r>Everything, clearly laid out.</h2>
<p class="lede" data-r style="margin-top:1.2rem">Every active ingredient and amount, per serving. No proprietary blends, nothing hidden.</p>
<div class="ing-list">
<div class="ing" data-r><div><h3>AM FUEL <small>Morning, 11 active ingredients</small></h3>{tbl(am_rows, "Per sachet", "AM FUEL")}</div>
<aside><p>The first step of the day: creatine monohydrate, electrolytes, vitamin D3, vitamin C and a set of B vitamins, with a separate B12 tablet alongside.</p><h4>Preparation</h4><p>One sachet stirred into approximately 400 to 500 mL water, following the label directions.</p><p>Paired with a separate 1,000 &micro;g sublingual B12 tablet, dissolved under the tongue rather than mixed into the drink.</p></aside></div>
<div class="ing" data-r><div><h3>PM RECOVER <small>Evening, 4 active ingredients</small></h3>{tbl(pm_rows, "Per sachet", "PM RECOVER")}</div>
<aside><p>The closing step of the day: glycine, L-theanine, magnesium and zinc, organized around your evening routine.</p><h4>Preparation</h4><p>One sachet stirred into approximately 250 to 400 mL water, following the label directions.</p><p>The magnesium quantity shown is the elemental amount.</p></aside></div>
<div class="ing" data-r><div><h3>B12 RESET <small>Morning tablet, 1,000 &micro;g</small></h3>{tbl([("Vitamin B12", "1,000 µg")], "Per tablet", "B12 RESET")}</div>
<aside><p>Sublingual tablet, kept apart from both drinks.</p><h4>Directions</h4><p>One tablet each morning, dissolved under the tongue.</p></aside></div>
</div>
<p class="small" data-r style="margin-top:1.2rem">Formula awaiting manufacturing sign-off. Final label, ingredient forms and amounts will be confirmed before ordering opens.</p>
<div class="science"><div data-r><h3>The science behind the ingredients</h3><p class="lede" style="font-size:1rem">Independent research on the key ingredients. These studies looked at the ingredients, not the finished Founder Reset product.</p></div><div>{sci_html}</div></div>
<p class="fda" data-r>* These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.</p>
</div></section>

<section id="faq" style="padding-top:0"><div class="wrap faq-grid">
<h2 data-r>Good to know.</h2><div>{faq_html}</div>
</div></section>

<section class="final"><div class="wrap">
<h2 data-r>Start strong. Recover well. Repeat.</h2>
<p class="sub" data-r>$39 for your 7-Day Starter, then $99 every 30 days until you cancel.</p>
<button class="btn" data-order data-r>Start My 7-Day Reset</button>
<div class="scene" data-sy><i class="glow a"></i><i class="glow b"></i>{ill["final"]}</div>
</div></section>
</main>
<footer><div class="wrap"><div><a class="brand" href="#">Founder Reset</a><p>Start strong. Recover well. Repeat.</p><p>Dietary supplements complement a varied, balanced diet and a healthy lifestyle.</p></div>
<ul><li><a href="#routine">The routine</a></li><li><a href="#how">How it works</a></li><li><a href="#ingredients">Ingredients</a></li><li><a href="#faq">Questions</a></li></ul>
<ul><li>Ordering</li><li>The Core collection</li><li>AM FUEL, B12 RESET, PM RECOVER</li></ul></div></footer>
<div class="dock"><p><strong>$39</strong> Starter, then <strong>$99</strong> every 30 days until you cancel.</p><button class="btn" data-order>Start My 7-Day Reset</button></div>
<dialog id="order"><h3>Ordering isn&rsquo;t open yet</h3><p>Final formula, flavors, shipping, refund and cancellation terms will be confirmed before ordering opens. You&rsquo;ll see everything before any payment.</p><form method="dialog"><button class="btn">Got it</button></form></dialog>
'''

fonts = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..700&family=Geist:wght@400;500;600&display=swap'
css = open(os.path.join(SRC, 'styles.css')).read()
js = open(os.path.join(SRC, 'script.js')).read()
open(os.path.join(HERE, 'styles.css'), 'w').write(css)
open(os.path.join(HERE, 'script.js'), 'w').write(js)
page = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#ffffff">
<title>Founder Reset | Two daily drinks for founders</title>
<meta name="description" content="Morning creatine and an evening wind-down in two drinks. No added caffeine. $39 for a 7-Day Starter, then $99 every 30 days until you cancel.">
<meta name="robots" content="noindex, nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="{fonts}" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
</head>
<body>
{body}
<script src="script.js" defer></script>
</body>
</html>
'''
open(os.path.join(HERE, 'index.html'), 'w').write(page)

if len(sys.argv) > 1:
    bundle = f'<title>Founder Reset</title>\n<link rel="stylesheet" href="{fonts}">\n<style>\n{css}\n</style>\n{body}\n<script>\n{js}\n</script>\n'
    bundle = bundle.replace('\n<style>\n', '\n<style>\nbody{padding-inline:0}\n', 1)
    open(sys.argv[1], 'w').write(bundle)
print('built', len(page))
