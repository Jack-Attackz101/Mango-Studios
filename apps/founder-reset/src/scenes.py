from iso import Scene, FONT

def hero():
    s = Scene('hero', k=46)
    s.layer('stage', .12)
    s.podium(0, 0, 0, 4.5, .38)
    z = .38
    s.layer('back', .5)
    s.begin(.45, 1.2)
    s.sachet(1.7, -2.5, z, 'pm', side='right', num='02')
    s.end()
    s.layer('mid', 1.0)
    s.begin(.65, .6)
    s.sachet(-3.0, -.3, z, 'am', side='left', num='01')
    s.end()
    s.layer('front', 1.5)
    s.begin(.25, 0)
    s.glass(1.2, .9, z, liquid='#FFB766', swirl='#F28B2E')
    s.end()
    s.begin(.85, 1.8)
    s.strip(-2.4, 1.3, z)
    s.end()
    s.layer('fg', 2.3)
    s.begin(1.05, 2.4)
    s.tablet(-.3, 2.7, z, r=.34)
    s.tablet(2.7, 1.6, z, r=.28, col='#F58BAF')
    s.end()
    return s.render()

def familiar():
    out = {}
    s = Scene('cup', k=42); s.layer('o', 0); s.cup(0, 0, 0); out['cup'] = s.render()
    s = Scene('lap', k=40); s.layer('o', 0); s.laptop(0, 0, 0); out['laptop'] = s.render()
    s = Scene('bar', k=42); s.layer('o', 0); s.bar(0, 0, 0); out['bar'] = s.render()
    s = Scene('tub', k=40); s.layer('o', 0)
    s.tub(-1.6, -.4, 0, r=.82, h=2.0, lid='#2b2b33', label='#F28B2E', cap_text='D3')
    s.tub(.4, -1.1, 0, r=.7, h=1.6, lid='#7459CF', label='#8F76E8', cap_text='MG')
    s.tub(.5, .9, 0, r=.9, h=2.4, lid='#1f6f5c', label='#2BA286', cap_text='C')
    s.capsule(-1.3, 1.5, .26, ang=-20); s.capsule(-2.2, 1.0, .26, ang=14, a='#F2B84B')
    out['tubs'] = s.render()
    return out

def routine():
    s = Scene('rt', k=50)
    s.layer('stage', .1)
    s.podium(0, 0, 0, 4.6, .4)
    z = .4
    s.layer('am', .8)
    s.add('<g class="phase am">')
    s.sachet(-2.6, -.4, z, 'am', side='left', W=2.4, H=3.6, num='01')
    s.glass(.9, -2.0, z, liquid='#FFB766', swirl='#F28B2E')
    s.strip(-.8, 1.3, z)
    s.add('</g>')
    s.layer('pm', .8)
    s.add('<g class="phase pm">')
    s.sachet(.6, -2.8, z, 'pm', side='right', W=2.4, H=3.6, num='02')
    s.glass(-1.9, -.4, z, liquid='#C3B0F7', swirl='#8F76E8')
    s.add('</g>')
    return s.render()

def kits():
    out = {}
    s = Scene('k1', k=46); s.layer('o', 0)
    s.podium(0, 0, 0, 4.2, .3)
    s.pkg(-2.1, -1.8, .3, 3.0, 2.4, 1.5, '7-Day Starter', '14 sachets, 7 B12 RESET tablets')
    s.sachet(.5, 1.0, .3, 'am', side='left', W=1.5, H=2.2, num='01')
    s.sachet(2.3, -1.3, .3, 'pm', side='right', W=1.5, H=2.2, num='02')
    s.tablet(-1.0, 1.9, .3, r=.28); s.tablet(-.2, 2.4, .3, r=.26, col='#F58BAF')
    out['starter'] = s.render()
    s = Scene('k2', k=42); s.layer('o', 0)
    s.podium(0, 0, 0, 4.9, .3)
    s.pkg(-3.0, -2.2, .3, 4.4, 3.2, 2.2, 'Monthly Box', '60 sachets, 30 B12 RESET tablets')
    s.sachet(.8, 1.4, .3, 'am', side='left', W=1.5, H=2.2, num='01')
    s.sachet(2.7, -1.5, .3, 'pm', side='right', W=1.5, H=2.2, num='02')
    s.strip(-2.6, 2.0, .3, w=2.6, d=.95, n=7)
    out['monthly'] = s.render()
    return out

def drinks():
    s = Scene('dr', k=48)
    s.layer('stage', .1); s.podium(0, 0, 0, 3.7, .34)
    z = .34
    s.layer('a', .8); s.begin(.2, 0)
    s.glass(-1.7, .1, z, r_b=.7, r_t=.98, h=2.4, liquid='#FFB766', swirl='#F28B2E'); s.end()
    s.layer('b', 1.3); s.begin(.45, 1.5)
    s.glass(.1, -1.7, z, r_b=.7, r_t=.98, h=2.4, liquid='#C3B0F7', swirl='#8F76E8'); s.end()
    return s.render()

def calendar():
    s = Scene('cal', k=46); s.layer('o', 0)
    w, d, h = 3.3, .5, 3.5
    s.shadow_box(0, 0, w, d, h)
    s.box(0, 0, 0, w, d, h, '#ffffff', top='#ffffff', left='#f7f7f9', right='#d9d9df')
    k = s.k; Wp = w * k; Hp = h * k
    s.defs.append('<linearGradient id="calh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFB766"/><stop offset="1" stop-color="#F28B2E"/></linearGradient>')
    dots = ''
    pos = [(i, 0) for i in range(4)] + [(i, 1) for i in range(3)]
    for i, (c, r) in enumerate(pos):
        cx = Wp * (.17 + c * .22) + (Wp * .11 if r else 0); cy = Hp * (.5 + r * .22)
        dots += f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{k*.25:.1f}" fill="#8F76E8"/><path d="M{cx-k*.11:.1f},{cy:.1f} l{k*.08:.1f},{k*.09:.1f} l{k*.15:.1f},{-k*.18:.1f}" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'
    inner = (f'<rect x="0" y="0" width="{Wp:.1f}" height="{Hp*.26:.1f}" fill="url(#calh)"/>'
             f'<text x="{Wp*.09:.1f}" y="{Hp*.17:.1f}" font-family="{FONT}" font-size="{k*.5:.1f}" font-weight="800" letter-spacing="-1" fill="#1a1208">7-day reset</text>'
             f'<text x="{Wp*.09:.1f}" y="{Hp*.36:.1f}" font-family="{FONT}" font-size="{k*.17:.1f}" font-weight="600" fill="#555">Seven days, seven checks</text>' + dots)
    s.on_left(0, 0, 0, w, d, h, inner)
    s.poly([s.P(0, d, h), s.P(w, d, h), s.P(w, d, 0), s.P(0, d, 0)], s.lg([(0, '#ffffff', .6), (.35, '#ffffff', 0), (1, '#ffffff', 0)], 0, 0, 1, 1))
    for cx in (.7, 1.65, 2.6):
        s.cyl(cx, .25, h - .12, .1, .5, '#2a2a31')
    return s.render()

def final():
    s = Scene('fin', k=44)
    s.layer('stage', .1); s.podium(0, 0, 0, 5.0, .36)
    z = .36
    s.layer('a', .7)
    s.pkg(-3.2, -2.5, z, 3.6, 2.8, 1.8, 'Monthly Box', '60 sachets, 30 B12 RESET tablets')
    s.layer('b', 1.2)
    s.sachet(.4, 1.0, z, 'am', side='left', num='01')
    s.sachet(2.4, -1.6, z, 'pm', side='right', num='02')
    s.glass(-1.4, 2.2, z, liquid='#C3B0F7', swirl='#8F76E8')
    return s.render()

if __name__ == '__main__':
    import sys
    allsvg = {'hero': hero(), 'routine': routine(), 'final': final(), **familiar(), **kits(), 'drinks': drinks(), 'calendar': calendar()}
    html = '<body style="margin:0;background:#fff;font-family:sans-serif;display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding:20px">'
    for n, v in allsvg.items():
        html += f'<div><div style="font:12px sans-serif">{n}</div>{v.replace("class=\"ill\"", "style=\"width:100%;height:auto\"")}</div>'
    open(sys.argv[1], 'w').write(html)
