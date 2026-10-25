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
    s.glass(1.2, .9, z, liquid='#FFB45C', swirl='#FF8A1F')
    s.end()
    s.begin(.85, 1.8)
    s.strip(-2.4, 1.3, z)
    s.end()
    s.layer('fg', 2.3)
    s.begin(1.05, 2.4)
    s.tablet(-.3, 2.7, z, r=.34)
    s.tablet(2.7, 1.6, z, r=.28, col='#FF7AA5')
    s.end()
    return s.render()

def familiar():
    out = {}
    s = Scene('cup', k=42); s.layer('o', 0); s.cup(0, 0, 0); out['cup'] = s.render()
    s = Scene('lap', k=40); s.layer('o', 0); s.laptop(0, 0, 0); out['laptop'] = s.render()
    s = Scene('bar', k=42); s.layer('o', 0); s.bar(0, 0, 0); out['bar'] = s.render()
    s = Scene('tub', k=40); s.layer('o', 0)
    s.tub(-1.6, -.4, 0, r=.82, h=2.0, lid='#2b2b33', label='#FF8A1F', cap_text='D3')
    s.tub(.4, -1.1, 0, r=.7, h=1.6, lid='#7459CF', label='#8B68F5', cap_text='MG')
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
    s.glass(.9, -2.0, z, liquid='#FFB45C', swirl='#FF8A1F')
    s.strip(-.8, 1.3, z)
    s.add('</g>')
    s.layer('pm', .8)
    s.add('<g class="phase pm">')
    s.sachet(.6, -2.8, z, 'pm', side='right', W=2.4, H=3.6, num='02')
    s.glass(-1.9, -.4, z, liquid='#B49BFF', swirl='#8B68F5')
    s.add('</g>')
    return s.render()

def kits():
    out = {}
    s = Scene('k1', k=46); s.layer('o', 0)
    s.podium(0, 0, 0, 4.2, .3)
    s.pkg(-2.1, -1.8, .3, 3.0, 2.4, 1.5, '7-Day Starter', '14 sachets, 7 B12 RESET tablets')
    s.sachet(.5, 1.0, .3, 'am', side='left', W=1.5, H=2.2, num='01')
    s.sachet(2.3, -1.3, .3, 'pm', side='right', W=1.5, H=2.2, num='02')
    s.tablet(-1.0, 1.9, .3, r=.28); s.tablet(-.2, 2.4, .3, r=.26, col='#FF7AA5')
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
    s.glass(-1.7, .1, z, r_b=.7, r_t=.98, h=2.4, liquid='#FFB45C', swirl='#FF8A1F'); s.end()
    s.layer('b', 1.3); s.begin(.45, 1.5)
    s.glass(.1, -1.7, z, r_b=.7, r_t=.98, h=2.4, liquid='#B49BFF', swirl='#8B68F5'); s.end()
    return s.render()

def calendar():
    s = Scene('cal', k=46); s.layer('o', 0)
    w, d, h = 3.3, .5, 3.5
    s.shadow_box(0, 0, w, d, h)
    s.box(0, 0, 0, w, d, h, '#ffffff', top='#ffffff', left='#f7f7f9', right='#d9d9df')
    k = s.k; Wp = w * k; Hp = h * k
    s.defs.append('<linearGradient id="calh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFB45C"/><stop offset="1" stop-color="#FF8A1F"/></linearGradient>')
    dots = ''
    pos = [(i, 0) for i in range(4)] + [(i, 1) for i in range(3)]
    for i, (c, r) in enumerate(pos):
        cx = Wp * (.17 + c * .22) + (Wp * .11 if r else 0); cy = Hp * (.5 + r * .22)
        dots += f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{k*.25:.1f}" fill="#8B68F5"/><path d="M{cx-k*.11:.1f},{cy:.1f} l{k*.08:.1f},{k*.09:.1f} l{k*.15:.1f},{-k*.18:.1f}" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'
    inner = (f'<rect x="0" y="0" width="{Wp:.1f}" height="{Hp*.26:.1f}" fill="url(#calh)"/>'
             f'<text x="{Wp*.09:.1f}" y="{Hp*.17:.1f}" font-family="{FONT}" font-size="{k*.5:.1f}" font-weight="800" letter-spacing="-1" fill="#1a1208">7-day reset</text>'
             f'<text x="{Wp*.09:.1f}" y="{Hp*.36:.1f}" font-family="{FONT}" font-size="{k*.17:.1f}" font-weight="600" fill="#555">Seven days, seven checks</text>' + dots)
    s.on_left(0, 0, 0, w, d, h, inner)
    s.poly([s.P(0, d, h), s.P(w, d, h), s.P(w, d, 0), s.P(0, d, 0)], s.lg([(0, '#ffffff', .6), (.35, '#ffffff', 0), (1, '#ffffff', 0)], 0, 0, 1, 1))
    for cx in (.7, 1.65, 2.6):
        s.cyl(cx, .25, h - .12, .1, .5, '#2a2a31')
    return s.render()

def unbox(pid='ub', final=False, want_pos=False):
    """Open-box hero. Flaps are drawn live by script into the .ub-* slots."""
    s = Scene(pid, k=46, pad=26)
    X, Y, W, D, H = -2.3, -1.8, 4.6, 3.6, 2.4
    s.layer('stage', .12); s.podium(0, 0, 0, 5.0, .36)
    z = .38; A = s.P
    s.layer('box', .55)
    s.shadow_box(X, Y, W, D, H, op=.18)
    s.add(f'<g class="ub-cfg" data-k="{s.k}" data-box="{X},{Y},{z},{W},{D},{H}" data-final="{1 if final else 0}"></g>')
    s.add('<g class="ub-fbo"></g>')
    # interior: back wall, side wall, floor, rims
    s.poly([A(X, Y, z + H), A(X + W, Y, z + H), A(X + W, Y, z), A(X, Y, z)], s.lg([(0, '#efe9df'), (1, '#e6ded1')], 0, 0, 0, 1))
    s.poly([A(X, Y, z + H), A(X, Y + D, z + H), A(X, Y + D, z), A(X, Y, z)], s.lg([(0, '#e2d9cb'), (1, '#d6ccbc')], 0, 0, 0, 1))
    s.poly([A(X, Y, z + .04), A(X + W, Y, z + .04), A(X + W, Y + D, z + .04), A(X, Y + D, z + .04)], '#f3eee6')
    s.poly([A(X, Y, z + .04), A(X + W, Y, z + .04), A(X + W * .7, Y + D * .35, z + .04), A(X, Y + D * .5, z + .04)], '#000000', op=.05)
    s.poly([A(X, Y, z + H), A(X + W, Y, z + H), A(X + W, Y + .08, z + H), A(X + .08, Y + .08, z + H), A(X + .08, Y + D, z + H), A(X, Y + D, z + H)], '#ffffff')
    # contents (rise by script)
    s.nosh = True
    for cls, rise, dx, fn in (
        ('am', 3.4, -70, lambda: s.sachet(X + .45, Y + 1.25, z + .05, 'am', side='left', W=1.95, H=2.6, num='01')),
        ('pm', 3.0, 70, lambda: s.sachet(X + 3.45, Y + .35, z + .05, 'pm', side='right', W=1.95, H=2.6, num='02')),
        ('b12', 2.9, 30, lambda: s.strip(X + .75, Y + 2.45, z + .05, w=3.0, d=1.0))):
        s.add(f'<g class="ub-c ub-{cls}" data-rise="{rise}" data-dx="{dx}"><g class="fl" style="--fd:{rise:.1f}s">'); fn(); s.add('</g></g>')
    s.nosh = False
    s.add('<g class="ub-fbc"></g>')
    # front walls with printed branding
    lp = [A(X, Y + D, z + H), A(X + W, Y + D, z + H), A(X + W, Y + D, z), A(X, Y + D, z)]
    rp = [A(X + W, Y, z + H), A(X + W, Y + D, z + H), A(X + W, Y + D, z), A(X + W, Y, z)]
    s.poly(lp, '#fbfbfc'); s.poly(rp, '#dcdce4')
    k = s.k; Wp = W * k; Hp = H * k; Dp = D * k
    s.defs.append(f'<linearGradient id="{pid}-band" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFB45C"/><stop offset=".5" stop-color="#FF8A1F"/><stop offset="1" stop-color="#B49BFF"/></linearGradient>')
    s.on_left(X, Y, z, W, D, H,
        f'<rect x="0" y="{Hp*.7:.1f}" width="{Wp:.1f}" height="{Hp*.3:.1f}" fill="url(#{pid}-band)"/>'
        f'<text x="{Wp*.06:.1f}" y="{Hp*.3:.1f}" font-family="{FONT}" font-size="{k*.62:.1f}" font-weight="800" letter-spacing="-1.2" fill="#111">Founder Reset</text>'
        f'<text x="{Wp*.06:.1f}" y="{Hp*.3+k*.42:.1f}" font-family="{FONT}" font-size="{k*.22:.1f}" font-weight="600" fill="#555">The Core collection</text>'
        f'<text x="{Wp*.06:.1f}" y="{Hp*.88:.1f}" font-family="{FONT}" font-size="{k*.2:.1f}" font-weight="800" letter-spacing="1.2" fill="#1a1208">AM FUEL   B12 RESET   PM RECOVER</text>')
    s.defs.append(f'<linearGradient id="{pid}-band2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B49BFF"/><stop offset="1" stop-color="#7C58EE"/></linearGradient>')
    s.on_right(X, Y, z, W, D, H, f'<rect x="0" y="{Hp*.7:.1f}" width="{Dp:.1f}" height="{Hp*.3:.1f}" fill="url(#{pid}-band2)"/>'
        f'<text x="{Dp*.08:.1f}" y="{Hp*.3:.1f}" font-family="{FONT}" font-size="{k*.3:.1f}" font-weight="800" fill="#2a2a33">Start strong.</text>'
        f'<text x="{Dp*.08:.1f}" y="{Hp*.3+k*.36:.1f}" font-family="{FONT}" font-size="{k*.3:.1f}" font-weight="800" fill="#2a2a33">Recover well.</text>')
    s.poly([A(X, Y + D - .08, z + H), A(X + W, Y + D - .08, z + H), A(X + W, Y + D, z + H), A(X, Y + D, z + H)], '#ffffff')
    s.poly([A(X + W - .08, Y, z + H), A(X + W, Y, z + H), A(X + W, Y + D, z + H), A(X + W - .08, Y + D, z + H)], '#ffffff')
    s.line([A(X, Y + D, z + H), A(X + W, Y + D, z + H), A(X + W, Y, z + H)], '#ffffff', 1.2, .9)
    s.add('<g class="ub-ff"></g>')
    # flap reach, so the view box leaves room for them
    for px, py in (A(X - 1.2, Y + D / 2, z + H + 1.9), A(X + W / 2, Y - 1.9, z + H + 1.7)):
        s.g(px, py)
    for cls, rise in (('am', 3.4), ('pm', 3.0)):
        pass
    s.g(*A(X + .45, Y + 1.25, z + 2.65 + 3.4)); s.g(*A(X + 3.45, Y + .35, z + 2.65 + 3.0))
    anchors = {'am': A(X + .45 + .3, Y + 1.35, z + 2.6 + 3.4), 'pm': A(X + 3.55, Y + .35 + 1.9, z + 2.6 + 3.0), 'b12': A(X + 3.75, Y + 2.95, z + .2 + 2.9)}
    anchors['am'] = (anchors['am'][0] - 70, anchors['am'][1]); anchors['pm'] = (anchors['pm'][0] + 70, anchors['pm'][1]); anchors['b12'] = (anchors['b12'][0] + 30, anchors['b12'][1])
    s.anchors = anchors
    s.layer('fg', 1.6)
    for i, (tx, ty, r) in enumerate(((3.4, 1.6, .36), (2.6, 3.2, .3), (-3.4, 2.6, .32))):
        s.add(f'<g class="ub-pop" style="--i:{i}"><g class="fl" style="--fd:{i*.8:.1f}s">'); s.tablet(tx, ty, z, r=r); s.add('</g></g>')
    s.add(f'<g class="ub-pop" style="--i:3"><g class="fl" style="--fd:1.4s">'); s.capsule(-1.0, 4.2, z + .3, ang=-24, L=1.2, Rr=.3); s.add('</g></g>')
    svg = s.render()
    import re as _re
    vx, vy, vw, vh = map(float, _re.search(r'viewBox="([^"]+)"', svg).group(1).split())
    pos = {n: ((x - vx) / vw * 100, (y - vy) / vh * 100) for n, (x, y) in s.anchors.items()}
    return (svg, pos) if want_pos else svg

def final():
    s = Scene('fin', k=44)
    s.layer('stage', .1); s.podium(0, 0, 0, 5.0, .36)
    z = .36
    s.layer('a', .7)
    s.pkg(-3.2, -2.5, z, 3.6, 2.8, 1.8, 'Monthly Box', '60 sachets, 30 B12 RESET tablets')
    s.layer('b', 1.2)
    s.sachet(.4, 1.0, z, 'am', side='left', num='01')
    s.sachet(2.4, -1.6, z, 'pm', side='right', num='02')
    s.glass(-1.4, 2.2, z, liquid='#B49BFF', swirl='#8B68F5')
    return s.render()

if __name__ == '__main__':
    import sys
    allsvg = {'hero': hero(), 'routine': routine(), 'final': final(), **familiar(), **kits(), 'drinks': drinks(), 'calendar': calendar(), 'unbox': unbox()}
    html = '<body style="margin:0;background:#fff;font-family:sans-serif;display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding:20px">'
    for n, v in allsvg.items():
        html += f'<div><div style="font:12px sans-serif">{n}</div>{v.replace("class=\"ill\"", "style=\"width:100%;height:auto\"")}</div>'
    open(sys.argv[1], 'w').write(html)
