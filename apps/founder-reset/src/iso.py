"""Isometric illustration engine for Founder Reset. Pure Python, emits SVG strings."""
import math
C30 = math.cos(math.radians(30)); S30 = 0.5
FONT = "'Bricolage Grotesque','Helvetica Neue',Arial,sans-serif"

def hx(h):
    h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
def toh(c): return '#%02x%02x%02x' % tuple(max(0, min(255, int(round(v)))) for v in c)
def mix(a, b, t):
    a = hx(a); b = hx(b); return toh([a[i] + (b[i] - a[i]) * t for i in range(3)])
def lighten(c, t): return mix(c, '#ffffff', t)
def darken(c, t): return mix(c, '#000000', t)

def hull(pts):
    pts = sorted(set((round(x, 2), round(y, 2)) for x, y in pts))
    def cross(o, a, b): return (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0])
    lo = []
    for p in pts:
        while len(lo) >= 2 and cross(lo[-2], lo[-1], p) <= 0: lo.pop()
        lo.append(p)
    up = []
    for p in reversed(pts):
        while len(up) >= 2 and cross(up[-2], up[-1], p) <= 0: up.pop()
        up.append(p)
    return lo[:-1] + up[:-1]

class Scene:
    def __init__(s, pid, k=44, pad=18):
        s.pid = pid; s.k = k; s.pad = pad; s.defs = []; s.layers = []; s._cur = None
        s.n = 0; s.bb = [1e9, 1e9, -1e9, -1e9]
        s.defs.append(f'<filter id="{pid}-b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="{k*.07:.1f}"/></filter>')
        s.defs.append(f'<filter id="{pid}-b2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="{k*.025:.1f}"/></filter>')
        s.defs.append(f'<filter id="{pid}-b3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="{k*.34:.1f}"/></filter>')
    # structure
    def layer(s, name, depth=0.0):
        s._cur = {'name': name, 'depth': depth, 'items': []}; s.layers.append(s._cur)
    def add(s, x): s._cur['items'].append(x)
    def begin(s, delay=0.0, fl=0.0, cls=''):
        s.add(f'<g class="obj {cls}" style="--d:{delay}s"><g class="fl" style="--fd:{fl}s">')
    def end(s): s.add('</g></g>')
    def P(s, x, y, z=0): return ((x - y) * C30 * s.k, (x + y) * S30 * s.k - z * s.k)
    def g(s, x, y):
        b = s.bb; b[0] = min(b[0], x); b[1] = min(b[1], y); b[2] = max(b[2], x); b[3] = max(b[3], y)
    def id(s): s.n += 1; return f'{s.pid}-{s.n}'
    def lg(s, stops, x1=0, y1=0, x2=1, y2=0):
        i = s.id()
        st = ''
        for t in stops:
            o, c = t[0], t[1]; a = t[2] if len(t) > 2 else None
            st += f'<stop offset="{o}" stop-color="{c}"' + (f' stop-opacity="{a}"' if a is not None else '') + '/>'
        s.defs.append(f'<linearGradient id="{i}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{st}</linearGradient>')
        return f'url(#{i})'
    def rg(s, stops, cx=.5, cy=.5, r=.5):
        i = s.id(); st = ''
        for t in stops:
            o, c = t[0], t[1]; a = t[2] if len(t) > 2 else None
            st += f'<stop offset="{o}" stop-color="{c}"' + (f' stop-opacity="{a}"' if a is not None else '') + '/>'
        s.defs.append(f'<radialGradient id="{i}" cx="{cx}" cy="{cy}" r="{r}">{st}</radialGradient>')
        return f'url(#{i})'
    # primitives
    def poly(s, pts, fill, stroke=None, sw=1, op=None, extra=''):
        for x, y in pts: s.g(x, y)
        d = ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)
        a = f'<polygon points="{d}" fill="{fill}"'
        if stroke: a += f' stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round"'
        if op is not None: a += f' opacity="{op}"'
        s.add(a + f' {extra}/>')
    def line(s, pts, stroke, sw=1, op=1, fill='none', extra=''):
        for x, y in pts: s.g(x, y)
        d = ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)
        s.add(f'<polyline points="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round" opacity="{op}" {extra}/>')
    def ell(s, cx, cy, rx, ry, fill, stroke=None, sw=1, op=None, extra='', bb=True):
        if bb: s.g(cx - rx, cy - ry); s.g(cx + rx, cy + ry)
        a = f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" fill="{fill}"'
        if stroke: a += f' stroke="{stroke}" stroke-width="{sw}"'
        if op is not None: a += f' opacity="{op}"'
        s.add(a + f' {extra}/>')
    def path(s, d, fill='none', stroke=None, sw=1, op=None, extra='', pts=()):
        for x, y in pts: s.g(x, y)
        a = f'<path d="{d}" fill="{fill}"'
        if stroke: a += f' stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"'
        if op is not None: a += f' opacity="{op}"'
        s.add(a + f' {extra}/>')
    # surface helpers: content drawn in face-local px, origin top-left, x along, y down
    def on_left(s, x, y, z, w, d, h, inner):
        ox, oy = s.P(x, y + d, z + h); s.add(f'<g transform="matrix({C30:.4f} {S30} 0 1 {ox:.2f} {oy:.2f})">{inner}</g>')
    def on_right(s, x, y, z, w, d, h, inner):
        ox, oy = s.P(x + w, y + d, z + h); s.add(f'<g transform="matrix({C30:.4f} {-S30} 0 1 {ox:.2f} {oy:.2f})">{inner}</g>')
    def on_top(s, x, y, z, w, d, h, inner):
        ox, oy = s.P(x, y, z + h); s.add(f'<g transform="matrix({C30:.4f} {S30} {-C30:.4f} {S30} {ox:.2f} {oy:.2f})">{inner}</g>')
    def quad(s, p00, p10, p01, wpx, hpx, inner):
        # map local (0..wpx, 0..hpx) onto screen quad: p00 top-left, p10 top-right, p01 bottom-left
        a = (p10[0] - p00[0]) / wpx; b = (p10[1] - p00[1]) / wpx
        c = (p01[0] - p00[0]) / hpx; d = (p01[1] - p00[1]) / hpx
        s.add(f'<g transform="matrix({a:.4f} {b:.4f} {c:.4f} {d:.4f} {p00[0]:.2f} {p00[1]:.2f})">{inner}</g>')
    # shadows
    def shadow_box(s, x, y, w, d, h, op=.16):
        if getattr(s, 'nosh', False): return
        sh = (.16 + h * .07, -.05)
        base = [s.P(x, y, 0), s.P(x + w, y, 0), s.P(x + w, y + d, 0), s.P(x, y + d, 0)]
        moved = [s.P(x + sh[0], y + sh[1], 0), s.P(x + w + sh[0], y + sh[1], 0), s.P(x + w + sh[0], y + d + sh[1], 0), s.P(x + sh[0], y + d + sh[1], 0)]
        pts = hull(base + moved)
        for px, py in pts: s.g(px, py)
        s.add(f'<polygon points="{" ".join(f"{px:.1f},{py:.1f}" for px,py in pts)}" fill="#1b1530" opacity="{op}" filter="url(#{s.pid}-b)"/>')
        s.add(f'<polygon points="{" ".join(f"{px:.1f},{py:.1f}" for px,py in base)}" fill="#1b1530" opacity="{op*1.3:.2f}" filter="url(#{s.pid}-b2)"/>')
    def shadow_cyl(s, cx, cy, z, r, h=0, op=.16):
        if getattr(s, 'nosh', False): return
        k = s.k; bx, by = s.P(cx, cy, z)
        sx = (.16 + h * .07) * k * .9
        s.ell(bx + sx * .5, by + 1.5, r * k * 1.2247 + sx * .5, r * k * .7071 + 2, '#1b1530', op=op, extra=f'filter="url(#{s.pid}-b)"')
        s.ell(bx, by + 1, r * k * 1.2247 * .98, r * k * .7071 * .98, '#1b1530', op=op * 1.3, extra=f'filter="url(#{s.pid}-b2)"')

    def box(s, x, y, z, w, d, h, col, top=None, left=None, right=None):
        tc = top or lighten(col, .38); lc = left or col; rc = right or darken(col, .2)
        A = s.P
        tp = [A(x, y, z + h), A(x + w, y, z + h), A(x + w, y + d, z + h), A(x, y + d, z + h)]
        lp = [A(x, y + d, z + h), A(x + w, y + d, z + h), A(x + w, y + d, z), A(x, y + d, z)]
        rp = [A(x + w, y, z + h), A(x + w, y + d, z + h), A(x + w, y + d, z), A(x + w, y, z)]
        s.poly(tp, tc)
        s.poly(lp, s.lg([(0, lighten(lc, .04)), (1, darken(lc, .03))], 0, 0, 1, 0))
        s.poly(rp, s.lg([(0, rc), (1, darken(rc, .06))], 0, 0, 1, 0))
        s.line([A(x, y + d, z + h), A(x + w, y + d, z + h), A(x + w, y, z + h)], '#ffffff', 1.1, .85)

    def frustum(s, cx, cy, z, r0, r1, h, fill, topfill=None, op=None):
        k = s.k
        bx, by = s.P(cx, cy, z); tx, ty = s.P(cx, cy, z + h)
        rx0 = r0 * k * 1.2247; ry0 = r0 * k * .7071; rx1 = r1 * k * 1.2247; ry1 = r1 * k * .7071
        d = f'M{tx-rx1:.1f},{ty:.1f} L{bx-rx0:.1f},{by:.1f} A{rx0:.1f},{ry0:.1f} 0 0 0 {bx+rx0:.1f},{by:.1f} L{tx+rx1:.1f},{ty:.1f} Z'
        s.g(tx - rx1, ty - ry1); s.g(tx + rx1, ty + ry1); s.g(bx - rx0, by + ry0); s.g(bx + rx0, by + ry0)
        a = f'<path d="{d}" fill="{fill}"' + (f' opacity="{op}"' if op is not None else '') + '/>'
        s.add(a)
        if topfill: s.ell(tx, ty, rx1, ry1, topfill, op=op)
        return dict(bx=bx, by=by, tx=tx, ty=ty, rx0=rx0, ry0=ry0, rx1=rx1, ry1=ry1)

    def cyl(s, cx, cy, z, r, h, col, top=None, topline=True):
        L1 = lighten(col, .16); L2 = lighten(col, .5); D1 = darken(col, .1); D2 = darken(col, .24)
        g = s.lg([(0, L1), (.16, L1), (.16, L2), (.27, L2), (.27, col), (.62, col), (.62, D1), (.86, D1), (.86, D2), (1, D2)], 0, 0, 1, 0)
        f = s.frustum(cx, cy, z, r, r, h, g)
        s.ell(f['tx'], f['ty'], f['rx1'], f['ry1'], lighten(top or col, .3))
        if topline: s.ell(f['tx'], f['ty'], f['rx1'], f['ry1'], 'none', stroke='#ffffff', sw=1, op=.8)
        return f

    # ---------- products ----------
    def sachet(s, x, y, z, kind='am', side='left', W=2.2, H=3.3, T=.1, num='01'):
        pal = {'am': ('#FFB45C', '#FF8A1F', '#EA6A06', 'AM', 'FUEL', 'MORNING', '3,000 mg creatine'),
               'pm': ('#B49BFF', '#8B68F5', '#6A45E0', 'PM', 'RECOVER', 'EVENING', '3,000 mg glycine')}[kind]
        hi, base, deep, n1, n2, when, sub = pal
        k = s.k; f = k / 44
        if side == 'left':
            w, d = W, T; s.shadow_box(x, y, w, d, H)
        else:
            w, d = T, W; s.shadow_box(x, y, w, d, H)
        A = s.P
        tp = [A(x, y, z + H), A(x + w, y, z + H), A(x + w, y + d, z + H), A(x, y + d, z + H)]
        lp = [A(x, y + d, z + H), A(x + w, y + d, z + H), A(x + w, y + d, z), A(x, y + d, z)]
        rp = [A(x + w, y, z + H), A(x + w, y + d, z + H), A(x + w, y + d, z), A(x + w, y, z)]
        if side == 'left':
            s.poly(tp, lighten(hi, .35)); s.poly(rp, darken(base, .30))
            fp = lp; faceg = s.lg([(0, hi), (.5, base), (1, base)], 0, 0, 1, 1)
        else:
            s.poly(tp, lighten(hi, .35)); s.poly(lp, darken(base, .12))
            fp = rp; faceg = s.lg([(0, base), (.6, deep), (1, deep)], 0, 0, 1, 1)
        s.poly(fp, faceg)
        Wp = W * k; Hp = H * k
        ink = '#1a1208' if kind == 'am' else '#1a1230'
        seal = ''.join(f'<line x1="{i}" y1="1" x2="{i}" y2="{13*f:.1f}" stroke="#000" stroke-opacity=".16" stroke-width="1"/>' for i in range(2, int(Wp), 3))
        seal2 = ''.join(f'<line x1="{i}" y1="{Hp-9*f:.1f}" x2="{i}" y2="{Hp-1:.1f}" stroke="#000" stroke-opacity=".14" stroke-width="1"/>' for i in range(2, int(Wp), 3))
        inner = (
            f'<rect x="0" y="0" width="{Wp:.1f}" height="{14*f:.1f}" fill="#fff" fill-opacity=".14"/>{seal}'
            f'<rect x="0" y="{Hp-10*f:.1f}" width="{Wp:.1f}" height="{10*f:.1f}" fill="#fff" fill-opacity=".1"/>{seal2}'
            f'<text x="{9*f:.1f}" y="{33*f:.1f}" font-family="{FONT}" font-size="{6.4*f:.1f}" font-weight="700" letter-spacing="{.9*f:.1f}" fill="{ink}" fill-opacity=".78">FOUNDER RESET {num}</text>'
            f'<text x="{8*f:.1f}" y="{71*f:.1f}" font-family="{FONT}" font-size="{34*f:.1f}" font-weight="800" letter-spacing="{-1.2*f:.1f}" fill="{ink}">{n1}</text>'
            f'<text x="{8*f:.1f}" y="{{y2}}" font-family="{FONT}" font-size="{{fs2}}" font-weight="800" letter-spacing="{-1*f:.1f}" fill="{ink}">{n2}</text>'
            f'<line x1="{9*f:.1f}" y1="{Hp-31*f:.1f}" x2="{Wp-9*f:.1f}" y2="{Hp-31*f:.1f}" stroke="{ink}" stroke-opacity=".5" stroke-width=".8"/>'
            f'<text x="{9*f:.1f}" y="{Hp-19*f:.1f}" font-family="{FONT}" font-size="{6*f:.1f}" font-weight="700" letter-spacing="{1.1*f:.1f}" fill="{ink}" fill-opacity=".8">{when}</text>'
            f'<text x="{9*f:.1f}" y="{Hp-13*f:.1f}" font-family="{FONT}" font-size="{5.2*f:.1f}" font-weight="500" fill="{ink}" fill-opacity=".62">{sub}</text>'
        )
        fs2 = (16.5 if n2 == 'RECOVER' else 34) * f; y2 = 71 * f + fs2 * .92
        inner = inner.replace('{y2}', f'{y2:.1f}').replace('{fs2}', f'{fs2:.1f}')
        if side == 'left': s.on_left(x, y, z, w, d, H, inner)
        else: s.on_right(x, y, z, w, d, H, inner)
        # gloss + pouch puff
        gl = s.lg([(0, '#ffffff', 0), (.18, '#ffffff', 0), (.18, '#ffffff', .2), (.3, '#ffffff', .2), (.3, '#ffffff', 0), (1, '#ffffff', 0)], 0, 0, 1, 1)
        s.poly(fp, gl)
        edge = s.lg([(0, '#000000', .12), (.05, '#000000', 0), (.95, '#000000', 0), (1, '#000000', .14)], 0, 0, 1, 0)
        s.poly(fp, edge)
        s.line([A(x, y + d, z + H), A(x + w, y + d, z + H), A(x + w, y, z + H)], '#ffffff', .9, .7)

    def glass(s, cx, cy, z, r_b=.62, r_t=.86, h=2.0, liquid='#FFB45C', level=.7, swirl='#FF8A1F', plate=True):
        k = s.k
        s.shadow_cyl(cx, cy, z, r_t, h * .9)
        bx, by = s.P(cx, cy, z); tx, ty = s.P(cx, cy, z + h)
        rx1 = r_t * k * 1.2247; ry1 = r_t * k * .7071
        # back rim + inner back wall
        s.ell(tx, ty, rx1, ry1, s.lg([(0, '#dfe9f2', .55), (1, '#ffffff', .2)], 0, 0, 1, 1))
        # glass body
        gb = s.lg([(0, '#ffffff', .55), (.2, '#e6f0f9', .3), (.7, '#c9dcec', .26), (1, '#9cb7cf', .45)], 0, 0, 1, 0)
        s.frustum(cx, cy, z, r_b, r_t, h, gb)
        # liquid
        lh = h * level; rl = r_b + (r_t - r_b) * level
        lq = s.lg([(0, lighten(liquid, .3)), (.2, lighten(liquid, .3)), (.2, liquid), (.75, liquid), (.75, darken(liquid, .1)), (1, darken(liquid, .1))], 0, 0, 1, 0)
        f = s.frustum(cx, cy, z + .12, r_b * .94, rl * .96, lh - .12, lq)
        s.ell(f['tx'], f['ty'], f['rx1'], f['ry1'], s.lg([(0, lighten(liquid, .62)), (1, lighten(liquid, .3))], 0, 0, 1, 1))
        # powder swirl + particles
        s.add(f'<g class="swirl">')
        s.path(f"M{f['tx']-f['rx1']*.62:.1f},{f['ty']:.1f} C{f['tx']-f['rx1']*.3:.1f},{f['ty']-f['ry1']*.7:.1f} {f['tx']+f['rx1']*.45:.1f},{f['ty']-f['ry1']*.5:.1f} {f['tx']+f['rx1']*.35:.1f},{f['ty']+f['ry1']*.15:.1f} C{f['tx']+f['rx1']*.2:.1f},{f['ty']+f['ry1']*.5:.1f} {f['tx']-f['rx1']*.25:.1f},{f['ty']+f['ry1']*.35:.1f} {f['tx']-f['rx1']*.15:.1f},{f['ty']:.1f}", stroke=swirl, sw=2.2, op=.75)
        s.ell(f['tx'] + f['rx1'] * .05, f['ty'] - f['ry1'] * .02, f['rx1'] * .16, f['ry1'] * .16, swirl, op=.9)
        for i, (ox, oy, rr) in enumerate([(-.5, .35, 1.3), (.2, .6, 1.0), (.55, .25, 1.5), (-.15, .9, 1.1), (.0, .15, 1.0), (.35, .8, 1.2), (-.45, .7, 1.0)]):
            px = bx + ox * rl * k * .9; py = f['ty'] + (by - f['ty']) * (oy * .72) + 2
            s.ell(px, py, rr, rr, '#ffffff', op=.85)
        s.add('</g>')
        # rim + highlights
        s.ell(tx, ty, rx1, ry1, 'none', stroke='#ffffff', sw=1.3, op=.9)
        s.ell(tx, ty, rx1 - 2.5, ry1 - 1.5, 'none', stroke='#9db6cc', sw=.8, op=.5)
        hx0 = tx - rx1 * .74; hx1 = bx - r_b * k * 1.2247 * .7
        s.poly([(hx0, ty + 4), (hx0 + 5, ty + 4.5), (hx1 + 4, by - 3), (hx1, by - 4)], '#ffffff', op=.55)
        s.poly([(tx + rx1 * .62, ty + 6), (tx + rx1 * .7, ty + 6.5), (bx + r_b * k * 1.0, by - 5), (bx + r_b * k * .93, by - 5)], '#ffffff', op=.25)
        # thick base
        s.ell(bx, by, r_b * k * 1.2247, r_b * k * .7071, 'none', stroke='#ffffff', sw=1, op=.5)

    def cup(s, cx, cy, z, steam=True, liquid=('#6b3f23', '#3d2112')):
        k = s.k
        s.shadow_cyl(cx, cy, z, 1.25, .8)
        s.cyl(cx, cy, z, 1.18, .07, '#f2f2f4')
        s.cyl(cx, cy, z + .07, .62, .03, '#e6e6ea', topline=False)
        gb = s.lg([(0, '#ffffff'), (.3, '#f6f6f8'), (.7, '#e0e0e6'), (1, '#b9b9c4')], 0, 0, 1, 0)
        f = s.frustum(cx, cy, z + .1, .55, .8, .78, gb)
        s.ell(f['tx'], f['ty'], f['rx1'], f['ry1'], '#fbfbfd')
        s.ell(f['tx'], f['ty'], f['rx1'] * .86, f['ry1'] * .84, s.lg([(0, liquid[0]), (1, liquid[1])], 0, 0, 1, 1))
        s.ell(f['tx'] - f['rx1'] * .25, f['ty'] - f['ry1'] * .25, f['rx1'] * .28, f['ry1'] * .22, '#ffffff', op=.28)
        s.ell(f['tx'], f['ty'], f['rx1'], f['ry1'], 'none', stroke='#ffffff', sw=1, op=.9)
        # handle
        hx0 = f['bx'] + f['rx0'] * .96 + (f['rx1'] - f['rx0']) * .55; hy0 = (f['ty'] + f['by']) / 2 - 6
        s.path(f'M{hx0-2:.1f},{hy0:.1f} C{hx0+22:.1f},{hy0-8:.1f} {hx0+24:.1f},{hy0+30:.1f} {hx0-4:.1f},{hy0+26:.1f}', stroke='#d6d6dd', sw=7, pts=[(hx0 + 24, hy0 - 6), (hx0 + 24, hy0 + 30)])
        s.path(f'M{hx0-2:.1f},{hy0-1:.1f} C{hx0+20:.1f},{hy0-9:.1f} {hx0+22:.1f},{hy0+27:.1f} {hx0-4:.1f},{hy0+24:.1f}', stroke='#ffffff', sw=2.2, op=.8)
        s.poly([(f['tx'] - f['rx1'] * .78, f['ty'] + 5), (f['tx'] - f['rx1'] * .66, f['ty'] + 5), (f['bx'] - f['rx0'] * .62, f['by'] - 5), (f['bx'] - f['rx0'] * .74, f['by'] - 5)], '#ffffff', op=.7)
        if steam:
            for i, dx in enumerate((-8, 6, 19)):
                x0 = f['tx'] + dx; y0 = f['ty'] - 6
                s.path(f'M{x0:.1f},{y0:.1f} c-9,-12 9,-22 0,-34 c-7,-10 5,-18 0,-26', stroke='#d3d6df', sw=3, op=.95, extra=f'class="steam" style="--sd:{i*.7}s"', pts=[(x0, y0 - 76)])

    def laptop(s, x, y, z, w=3.6, d=2.4):
        k = s.k
        s.shadow_box(x, y, w, d, .9)
        s.box(x, y, z, w, d, .1, '#cfd3da', top='#e6e8ec', left='#c3c7ce', right='#9da2ab')
        # keys on top face (local px)
        Wp = w * k; Dp = d * k; keys = ''
        for r in range(4):
            for c in range(11):
                kx = Wp * .08 + c * (Wp * .84 / 11); ky = Dp * .1 + r * (Dp * .42 / 4)
                keys += f'<rect x="{kx:.1f}" y="{ky:.1f}" width="{Wp*.84/11-1.6:.1f}" height="{Dp*.42/4-1.6:.1f}" rx="1.2" fill="#aeb3bc"/>'
        keys += f'<rect x="{Wp*.34:.1f}" y="{Dp*.62:.1f}" width="{Wp*.32:.1f}" height="{Dp*.26:.1f}" rx="2" fill="#d4d7dd" stroke="#b9bdc6" stroke-width=".8"/>'
        s.on_top(x, y, z, w, d, .1, keys)
        # screen: hinged at back edge y=y, tilted back
        zb = z + .1; tilt = 1.15; hh = 2.35
        bl = s.P(x + .05, y + .02, zb); br = s.P(x + w - .05, y + .02, zb)
        tl = s.P(x + .05, y + .02 - tilt, zb + hh); tr = s.P(x + w - .05, y + .02 - tilt, zb + hh)
        # back/thickness edge
        s.poly([tl, tr, (tr[0], tr[1] + 3), (tl[0], tl[1] + 3)], '#9da2ab')
        s.poly([bl, br, tr, tl], '#17181d')
        ins = .07
        def lerp(a, b, t): return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
        def sp(u, v):
            top = lerp(tl, tr, u); bot = lerp(bl, br, u); return lerp(top, bot, v)
        scr = [sp(ins, ins * 1.4), sp(1 - ins, ins * 1.4), sp(1 - ins, 1 - ins * .8), sp(ins, 1 - ins * .8)]
        s.poly(scr, s.lg([(0, '#232a5c'), (.6, '#3b3f86'), (1, '#6a5fc0')], 0, 0, 1, 1))
        wpx = w * k * 1.0; hpx = 100
        # glow & content on the screen plane
        sx0 = sp(ins, ins * 1.4); sx1 = sp(1 - ins, ins * 1.4); sx2 = sp(ins, 1 - ins * .8)
        sw_ = (1 - 2 * ins) * w * k; sh_ = 110
        txt = (f'<circle cx="{sw_*.72:.1f}" cy="{sh_*.3:.1f}" r="{sh_*.2:.1f}" fill="#fff" fill-opacity=".14"/>'
               f'<circle cx="{sw_*.78:.1f}" cy="{sh_*.26:.1f}" r="{sh_*.13:.1f}" fill="#232a5c"/>'
               f'<text x="{sw_*.08:.1f}" y="{sh_*.5:.1f}" font-family="{FONT}" font-size="{sh_*.26:.1f}" font-weight="700" letter-spacing="-1" fill="#fff">11<tspan class="blink">:</tspan>04</text>'
               f'<text x="{sw_*.08:.1f}" y="{sh_*.66:.1f}" font-family="{FONT}" font-size="{sh_*.08:.1f}" font-weight="600" letter-spacing=".8" fill="#fff" fill-opacity=".65">PM</text>'
               f'<rect x="{sw_*.08:.1f}" y="{sh_*.78:.1f}" width="{sw_*.5:.1f}" height="3" rx="1.5" fill="#fff" fill-opacity=".35"/>'
               f'<rect x="{sw_*.08:.1f}" y="{sh_*.88:.1f}" width="{sw_*.32:.1f}" height="3" rx="1.5" fill="#fff" fill-opacity=".22"/>')
        s.quad(sx0, sx1, sx2, sw_, sh_, txt)
        s.poly([bl, br, tr, tl], s.lg([(0, '#ffffff', .0), (.5, '#ffffff', .0), (.5, '#ffffff', .07), (1, '#ffffff', .0)], 0, 0, 1, 1))
        s.line([tl, tr], '#ffffff', .8, .4)

    def bar(s, x, y, z, w=3.4, d=1.3, h=.5):
        k = s.k
        s.shadow_box(x - .2, y, w + .4, d, h)
        # crimped ends
        for ex in (x - .24, x + w):
            s.box(ex, y + .12, z + .05, .24, d - .24, h - .1, '#c8321f', top='#e2503a', left='#c8321f', right='#9b2314')
        s.box(x, y, z, w, d, h, '#d63a24', top='#f0624a', left='#d63a24', right='#a52717')
        Wp = w * k; Hp = h * k
        lab = (f'<rect x="{Wp*.06:.1f}" y="{Hp*.2:.1f}" width="{Wp*.88:.1f}" height="{Hp*.6:.1f}" fill="#fff" fill-opacity=".92" rx="1.5"/>'
               f'<text x="{Wp*.5:.1f}" y="{Hp*.62:.1f}" text-anchor="middle" font-family="{FONT}" font-size="{Hp*.44:.1f}" font-weight="800" letter-spacing=".6" fill="#b52a17">PROTEIN</text>')
        s.on_left(x, y, z, w, d, h, lab)
        top = (f'<rect x="{Wp*.04:.1f}" y="{d*k*.5:.1f}" width="{Wp*.92:.1f}" height="1.4" fill="#fff" fill-opacity=".35"/>'
               f'<rect x="{Wp*.04:.1f}" y="{d*k*.3:.1f}" width="{Wp*.92:.1f}" height="1.2" fill="#fff" fill-opacity=".22"/>')
        s.on_top(x, y, z, w, d, h, top)
        s.poly([s.P(x, y + d, z + h), s.P(x + w, y + d, z + h), s.P(x + w, y + d, z), s.P(x, y + d, z)], s.lg([(0, '#ffffff', .35), (.3, '#ffffff', 0), (1, '#ffffff', 0)], 0, 0, 1, 1))

    def tub(s, cx, cy, z, r=.8, h=1.9, lid='#2b2b33', label='#FF8A1F', cap_text='D3'):
        k = s.k
        s.shadow_cyl(cx, cy, z, r, h)
        f = s.cyl(cx, cy, z, r, h, '#f6f6f8', top='#eeeef2', topline=False)
        # label band
        bz0 = z + h * .2; bz1 = z + h * .66
        gb = s.lg([(0, lighten(label, .35)), (.3, lighten(label, .05)), (.65, label), (1, darken(label, .32))], 0, 0, 1, 0)
        s.frustum(cx, cy, bz0, r * 1.005, r * 1.005, bz1 - bz0, gb)
        bx, by = s.P(cx, cy, bz0); tx, ty = s.P(cx, cy, bz1)
        s.ell(bx, by, r * k * 1.2247 * 1.005, r * k * .7071 * 1.005, 'none', stroke=darken(label, .3), sw=.8, op=.5)
        s.ell((bx + tx) / 2 - r * k * .15, (by + ty) / 2 + r * k * .1, r * k * .48, r * k * .1, '#ffffff', op=.9)
        s.add(f'<text x="{(bx+tx)/2 - r*k*.15:.1f}" y="{(by+ty)/2 + r*k*.1 + 2.4:.1f}" text-anchor="middle" font-family="{FONT}" font-size="{r*k*.14:.1f}" font-weight="700" fill="{darken(label,.4)}">{cap_text}</text>')
        # lid
        lf = s.cyl(cx, cy, z + h, r * 1.04, h * .17, lid, top=lighten(lid, .18))
        s.poly([(f['tx'] - f['rx1'] * .8, f['ty'] + 6), (f['tx'] - f['rx1'] * .7, f['ty'] + 6), (f['bx'] - f['rx0'] * .66, f['by'] - 6), (f['bx'] - f['rx0'] * .76, f['by'] - 6)], '#ffffff', op=.6)

    def capsule(s, cx, cy, z, ang=-28, a='#FF7AA5', b='#ecebf1', L=1.0, Rr=.26):
        k = s.k; x, y = s.P(cx, cy, z); l = L * k; r = Rr * k
        s.g(x - l, y - l * .6); s.g(x + l, y + l * .6)
        s.ell(x + 2, y + r * .9, l * .5, r * .6, '#1b1530', op=.16, extra=f'filter="url(#{s.pid}-b2)"')
        s.add(f'<g transform="translate({x:.1f} {y:.1f}) rotate({ang})">'
              f'<rect x="{-l/2:.1f}" y="{-r:.1f}" width="{l/2:.1f}" height="{2*r:.1f}" rx="{r:.1f}" fill="{a}"/>'
              f'<rect x="0" y="{-r:.1f}" width="{l/2:.1f}" height="{2*r:.1f}" rx="{r:.1f}" fill="{b}"/>'
              f'<rect x="{-l/2+2:.1f}" y="{-r+1.5:.1f}" width="{l-4:.1f}" height="{r*.5:.1f}" rx="{r*.25:.1f}" fill="#fff" fill-opacity=".45"/></g>')

    def tablet(s, cx, cy, z, r=.3, col='#FF7AA5'):
        k = s.k
        s.shadow_cyl(cx, cy, z, r, .12, op=.2)
        s.cyl(cx, cy, z, r, .13, col, top=lighten(col, .2))

    def strip(s, x, y, z, w=3.1, d=1.1, n=7):
        k = s.k
        s.shadow_box(x, y, w, d, .2)
        s.box(x, y, z, w, d, .08, '#ffffff', top='#fbfbfc', left='#ececf0', right='#cfcfd6')
        Wp = w * k; Dp = d * k
        inner = (f'<rect x="{Wp*.03:.1f}" y="{Dp*.04:.1f}" width="{Wp*.94:.1f}" height="{Dp*.92:.1f}" rx="3" fill="none" stroke="#e1e1e6" stroke-width=".9"/>'
                 f'<text x="{Wp*.06:.1f}" y="{Dp*.88:.1f}" font-family="{FONT}" font-size="{Dp*.115:.1f}" font-weight="800" letter-spacing=".7" fill="#1a1a1a">B12 RESET</text>'
                 f'<text x="{Wp*.94:.1f}" y="{Dp*.88:.1f}" text-anchor="end" font-family="{FONT}" font-size="{Dp*.085:.1f}" font-weight="500" fill="#666">1,000 µg</text>')
        s.on_top(x, y, z, w, d, .08, inner)
        for i in range(n):
            tx = x + w * (.08 + .84 * (i + .5) / n)
            s.tablet(tx, y + d * .4, z + .08, r=.19, col='#FF6F9C')

    def podium(s, cx, cy, z, r, h=.32, col='#f1f1f3'):
        s.shadow_cyl(cx, cy, z, r, h * 3, op=.2)
        f = s.cyl(cx, cy, z, r, h, col, top='#f7f7f9', topline=False)
        k = s.k
        for rr, op in ((r * .82, .07), (r * .58, .06), (r * .34, .05)):
            s.ell(f['tx'], f['ty'], rr * k * 1.2247, rr * k * .7071, 'none', stroke='#000000', sw=1, op=op)
        s.ell(f['tx'], f['ty'], f['rx1'], f['ry1'], 'none', stroke='#ffffff', sw=1.2, op=.9)
        s.ell(f['tx'], f['ty'], r * .7 * k * 1.2247, r * .7 * k * .7071, 'none', stroke='#000000', sw=1.4, op=.16, extra='class="orbit" stroke-dasharray="1.5 9" stroke-linecap="round"')
        return f

    def pkg(s, x, y, z, w, d, h, label='7-Day Starter', sub='14 sachets, 7 B12 RESET tablets'):
        k = s.k
        s.shadow_box(x, y, w, d, h)
        s.box(x, y, z, w, d, h, '#fbfbfc', top='#ffffff', left='#f1f1f4', right='#d6d6dc')
        # colour band wrapping left + right at the bottom
        bh = h * .3
        Wp = w * k
        gA = s.lg([(0, '#FFB45C'), (1, '#FF8A1F')], 0, 0, 1, 0)
        s.on_left(x, y, z, w, d, h, f'<rect x="0" y="{h*k-bh*k:.1f}" width="{Wp:.1f}" height="{bh*k:.1f}" fill="url(#bandL{s.pid})"/>')
        s.defs.append(f'<linearGradient id="bandL{s.pid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFB45C"/><stop offset="1" stop-color="#B49BFF"/></linearGradient>')
        s.on_right(x, y, z, w, d, h, f'<rect x="0" y="{h*k-bh*k:.1f}" width="{d*k:.1f}" height="{bh*k:.1f}" fill="url(#bandR{s.pid})"/>')
        s.defs.append(f'<linearGradient id="bandR{s.pid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B49BFF"/><stop offset="1" stop-color="#8B68F5"/></linearGradient>')
        s.on_left(x, y, z, w, d, h, f'<text x="{Wp*.07:.1f}" y="{h*k*.4:.1f}" font-family="{FONT}" font-size="{k*.34:.1f}" font-weight="800" letter-spacing="-.5" fill="#111">Founder</text>'
                                    f'<text x="{Wp*.07:.1f}" y="{h*k*.4+k*.32:.1f}" font-family="{FONT}" font-size="{k*.34:.1f}" font-weight="800" letter-spacing="-.5" fill="#111">Reset</text>')
        fs = min(k * .42, w * k * .86 / (len(label) * .56)); fs2_ = min(k * .17, w * k * .86 / (len(sub) * .5))
        s.on_top(x, y, z, w, d, h, f'<text x="{w*k*.08:.1f}" y="{d*k*.5:.1f}" font-family="{FONT}" font-size="{fs:.1f}" font-weight="800" letter-spacing="-.5" fill="#111">{label}</text>'
                                   f'<text x="{w*k*.08:.1f}" y="{d*k*.5+fs*.85:.1f}" font-family="{FONT}" font-size="{fs2_:.1f}" font-weight="500" fill="#555">{sub}</text>')
        s.poly([s.P(x, y + d, z + h), s.P(x + w, y + d, z + h), s.P(x + w, y + d, z), s.P(x, y + d, z)], s.lg([(0, '#ffffff', .5), (.3, '#ffffff', 0), (1, '#ffffff', 0)], 0, 0, 1, 1))

    def calendar_block(s, x, y, z, title='7-day reset', big='7', col='#FF8A1F'):
        w, d, h = 2.6, .45, 2.8
        s.shadow_box(x, y, w, d, h)
        s.box(x, y, z, w, d, h, '#ffffff', top='#ffffff', left='#f7f7f9', right='#d9d9df')
        k = s.k; Wp = w * k; Hp = h * k
        g = s.lg([(0, '#FFB45C'), (1, col)], 0, 0, 1, 0)
        inner = (f'<rect x="0" y="0" width="{Wp:.1f}" height="{Hp*.24:.1f}" fill="{g}"/>'
                 f'<text x="{Wp*.5:.1f}" y="{Hp*.17:.1f}" text-anchor="middle" font-family="{FONT}" font-size="{Hp*.11:.1f}" font-weight="800" fill="#1a1208">{title}</text>'
                 f'<text x="{Wp*.5:.1f}" y="{Hp*.82:.1f}" text-anchor="middle" font-family="{FONT}" font-size="{Hp*.52:.1f}" font-weight="800" letter-spacing="-2" fill="#111">{big}</text>')
        s.on_left(x, y, z, w, d, h, inner)
        for cx in (.6, 1.3, 2.0):
            s.cyl(x + cx, y + .22, z + h - .1, .08, .4, '#2a2a31')

    # ---------- extrusion: any 2D path given depth on a plane ----------
    def extrude(s, plane, x, y, z, d, depth, front, side, w=60, h=60, inner='', hl=True, sidehi=None):
        ox, oy = s.P(x, y, z)
        if plane == 'left':
            m = f'matrix({C30:.4f} {S30} 0 1 {ox:.2f} {oy:.2f})'; off = lambda i: (i, -i); corners = lambda u, v: (ox + u * C30, oy + u * S30 + v)
        elif plane == 'right':
            m = f'matrix({C30:.4f} {-S30} 0 1 {ox:.2f} {oy:.2f})'; off = lambda i: (-i, -i); corners = lambda u, v: (ox + u * C30, oy - u * S30 + v)
        else:
            m = f'matrix({C30:.4f} {S30} {-C30:.4f} {S30} {ox:.2f} {oy:.2f})'; off = lambda i: (-i, -i); corners = lambda u, v: (ox + (u - v) * C30, oy + (u + v) * S30)
        n = max(1, int(round(depth)))
        for u, v in ((0, 0), (w, 0), (0, h), (w, h)):
            for i in (0, n):
                a, b = off(i); px, py = corners(u + a, v + b); s.g(px, py)
                if plane == 'top': s.g(px, py - n)
        out = f'<g transform="{m}">'
        hi = sidehi or lighten(side, .18)
        if plane == 'top':
            for i in range(n):
                a, b = off(i); c = mix(side, hi, i / n)
                out += f'<path d="{d}" transform="translate({a} {b})" fill="{c}"/>'
            a, b = off(n)
            out += f'<g transform="translate({a} {b})"><path d="{d}" fill="{front}"/>'
        else:
            for i in range(n, 0, -1):
                a, b = off(i); c = mix(side, hi, 1 - i / n)
                out += f'<path d="{d}" transform="translate({a} {b})" fill="{c}"/>'
            out += '<g>' + f'<path d="{d}" fill="{front}"/>'
        if hl: out += f'<path d="{d}" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1"/>'
        out += inner + '</g></g>'
        s.add(out)

    def top_at(s, cx, cy, z, inner):
        ox, oy = s.P(cx, cy, z)
        s.add(f'<g transform="matrix({C30:.4f} {S30} {-C30:.4f} {S30} {ox:.2f} {oy:.2f})">{inner}</g>')

    def tile(s, x, y, z, sym, num='', col='#8B68F5', w=1.7, h=.42):
        s.shadow_box(x, y, w, w, h, op=.18)
        s.box(x, y, z, w, w, h, col, top=lighten(col, .55), left=lighten(col, .1), right=darken(col, .18))
        k = s.k; W = w * k
        fs = W * (.5 if len(sym) < 3 else .36)
        s.on_top(x, y, z, w, w, h, f'<text x="{W*.5:.1f}" y="{W*.66:.1f}" text-anchor="middle" font-family="{FONT}" font-size="{fs:.1f}" font-weight="800" letter-spacing="-1" fill="{darken(col,.55)}">{sym}</text>'
                                    + (f'<text x="{W*.12:.1f}" y="{W*.24:.1f}" font-family="{FONT}" font-size="{W*.14:.1f}" font-weight="700" fill="{darken(col,.4)}">{num}</text>' if num else ''))

    def coin(s, cx, cy, z, n=3, col='#F5C04A'):
        s.shadow_cyl(cx, cy, z, .9, .3 * n)
        for i in range(n):
            s.cyl(cx + (i % 2) * .05, cy - (i % 2) * .04, z + i * .2, .9, .2, col, top=lighten(col, .25))
        tz = z + n * .2
        s.top_at(cx, cy, tz, f'<circle r="{s.k*.62:.1f}" fill="none" stroke="{darken(col,.25)}" stroke-width="1.2" stroke-opacity=".6"/><text x="0" y="{s.k*.24:.1f}" text-anchor="middle" font-family="{FONT}" font-size="{s.k*.75:.1f}" font-weight="800" fill="{darken(col,.4)}">$</text>')

    def card(s, x, y, z, col='#1d1d24'):
        w, d = 2.7, 1.7
        s.shadow_box(x, y, w, d, .3, op=.2)
        s.box(x, y, z, w, d, .07, col, top=lighten(col, .12), left=darken(col, .05), right=darken(col, .3))
        k = s.k; W = w * k; D = d * k
        s.on_top(x, y, z, w, d, .07, f'<rect x="0" y="0" width="{W:.1f}" height="{D:.1f}" fill="url(#{s.pid}-cg)"/>'
                 f'<rect x="{W*.1:.1f}" y="{D*.3:.1f}" width="{W*.16:.1f}" height="{D*.24:.1f}" rx="2" fill="#E9C46A"/>'
                 f'<rect x="{W*.1:.1f}" y="{D*.68:.1f}" width="{W*.62:.1f}" height="2.5" rx="1" fill="#fff" fill-opacity=".55"/>'
                 f'<rect x="{W*.1:.1f}" y="{D*.8:.1f}" width="{W*.32:.1f}" height="2.5" rx="1" fill="#fff" fill-opacity=".35"/>'
                 f'<circle cx="{W*.78:.1f}" cy="{D*.36:.1f}" r="{D*.13:.1f}" fill="#FF8A1F" fill-opacity=".9"/><circle cx="{W*.86:.1f}" cy="{D*.36:.1f}" r="{D*.13:.1f}" fill="#8B68F5" fill-opacity=".9"/>')
        s.defs.append(f'<linearGradient id="{s.pid}-cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".16"/><stop offset=".5" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#8B68F5" stop-opacity=".25"/></linearGradient>')

    def bottle(s, cx, cy, z, col='#3BB8E8'):
        s.shadow_cyl(cx, cy, z, .6, 2.4)
        g = s.lg([(0, lighten(col, .55), .9), (.3, lighten(col, .25), .85), (.7, col, .85), (1, darken(col, .3), .9)], 0, 0, 1, 0)
        f = s.frustum(cx, cy, z, .6, .6, 2.1, g)
        s.ell(f['tx'], f['ty'], f['rx1'], f['ry1'], lighten(col, .5))
        b2 = s.lg([(0, '#ffffff'), (.6, '#f1f1f4'), (1, '#c9c9d2')], 0, 0, 1, 0)
        s.frustum(cx, cy, z + .7, .61, .61, .8, b2)
        bx, by = s.P(cx, cy, z + 1.1)
        s.add(f'<text x="{bx-2:.1f}" y="{by+3:.1f}" text-anchor="middle" font-family="{FONT}" font-size="{s.k*.26:.1f}" font-weight="800" fill="{darken(col,.35)}">H₂O</text>')
        s.cyl(cx, cy, z + 2.1, .42, .32, '#1d1d24', top='#3a3a44')
        s.cyl(cx, cy, z + 2.42, .18, .3, '#f2f2f4', top='#ffffff')
        s.poly([(f['tx'] - f['rx1'] * .7, f['ty'] + 6), (f['tx'] - f['rx1'] * .55, f['ty'] + 6), (f['bx'] - f['rx0'] * .55, f['by'] - 6), (f['bx'] - f['rx0'] * .7, f['by'] - 6)], '#fff', op=.55)

    def scoop(s, cx, cy, z):
        s.shadow_cyl(cx, cy, z, .9, .7)
        s.box(cx + .55, cy - .14, z + .18, 1.5, .28, .12, '#FF8A1F', top='#FFB45C', left='#FF8A1F', right='#C9681D')
        f = s.cyl(cx, cy, z, .72, .55, '#FFB45C', top='#FFD9A8', topline=False)
        k = s.k
        for i, (r, dz, c) in enumerate(((.7, .0, '#f3ece0'), (.6, .12, '#f7f1e7'), (.46, .22, '#faf6ef'), (.3, .3, '#fdfbf7'))):
            tx, ty = s.P(cx, cy, z + .55 + dz)
            s.ell(tx, ty, r * k * 1.2247, r * k * .7071, c)
        for ox, oy in ((-1.2, .6), (-.9, 1.1), (1.0, 1.0), (.4, 1.4)):
            px, py = s.P(cx + ox, cy + oy, z); s.ell(px, py, 1.6, 1, '#efe7da')

    def billboard(s, x, y, z, d, depth, front, side, w, h, inner='', hl=True):
        ox, oy = s.P(x, y, z)
        n = int(round(depth))
        for u, v in ((0, 0), (w, 0), (0, h), (w, h)):
            s.g(ox + u, oy + v); s.g(ox + u + n * C30, oy + v - n * S30)
        out = f'<g transform="translate({ox:.2f} {oy:.2f})">'
        for i in range(n, 0, -1):
            out += f'<path d="{d}" transform="translate({i*C30:.2f} {-i*S30:.2f})" fill="{mix(side, lighten(side, .2), 1 - i / n)}"/>'
        out += f'<path d="{d}" fill="{front}"/>'
        if hl: out += f'<path d="{d}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1"/>'
        s.add(out + inner + '</g>')

    def moon(s, x, y, z, col='#8B68F5', size=70, ground=0):
        r = size / 2
        d = f'M{r:.1f},0 A{r:.1f},{r:.1f} 0 1 0 {size:.1f},{r*1.25:.1f} A{r*.92:.1f},{r*.92:.1f} 0 0 1 {r:.1f},0 Z'
        ox, oy = s.P(x, y, z)
        s.ell(ox + r * 1.1, s.P(x, y, ground)[1] + 4, r * .8, r * .22, '#1b1530', op=.14, extra=f'filter="url(#{s.pid}-b)"')
        s.billboard(x, y, z, d, 9, s.lg([(0, lighten(col, .35)), (.55, col), (1, col)], 0, 0, 1, 1), darken(col, .35), size, size)
        st = 'M0,-7 L2,-2 L7,0 L2,2 L0,7 L-2,2 L-7,0 L-2,-2 Z'
        s.add(f'<g transform="translate({ox+size*.95:.1f} {oy+size*.08:.1f})"><path d="{st}" transform="translate(1.5 -1)" fill="#d79a2a"/><path d="{st}" fill="#FFC94A"/></g>')

    def leafshape(s, plane, x, y, z, size=56, col='#3FB27F', depth=5):
        d = f'M0,{size:.1f} C{size*.05:.1f},{size*.35:.1f} {size*.45:.1f},0 {size:.1f},0 C{size:.1f},{size*.6:.1f} {size*.6:.1f},{size:.1f} 0,{size:.1f} Z'
        vein = f'<path d="M{size*.08:.1f},{size*.92:.1f} Q{size*.45:.1f},{size*.55:.1f} {size*.9:.1f},{size*.1:.1f}" stroke="#fff" stroke-opacity=".55" stroke-width="1.4" fill="none"/>'
        s.extrude(plane, x, y, z, d, depth, s.lg([(0, lighten(col, .35)), (1, col)], 0, 0, 1, 1), darken(col, .3), w=size, h=size, inner=vein)

    def teacup(s, cx, cy, z):
        s.cup(cx, cy, z, steam=True, liquid=('#9cc46a', '#5f8f2e'))
        s.leafshape('left', cx - 2.3, cy + .9, z + 1.3, size=34, depth=4)

    def nocaf(s, cx, cy, z):
        s.cup(cx, cy, z, steam=False)
        size = 40
        d = f'M{size/2},0 A{size/2},{size/2} 0 1 1 {size/2-.01},0 Z'
        slash = f'<path d="M{size*.24:.1f},{size*.24:.1f} L{size*.76:.1f},{size*.76:.1f}" stroke="#fff" stroke-width="{size*.12:.1f}" stroke-linecap="round"/>'
        s.extrude('left', cx + .5, cy - 1.5, z + 2.9, d, 6, s.lg([(0, '#ff8a8f'), (1, '#e5484d')], 0, 0, 1, 1), '#a92c31', w=size, h=size, inner=slash)

    def toggle(s, x, y, z, on=True):
        w = 64; h = 34
        d = f'M{h/2},0 H{w-h/2} A{h/2},{h/2} 0 0 1 {w-h/2},{h} H{h/2} A{h/2},{h/2} 0 0 1 {h/2},0 Z'
        s.shadow_box(x, y, w / s.k, h / s.k, .3, op=.16)
        col = '#34C759' if on else '#c9c9d0'
        s.extrude('top', x, y, z, d, 7, s.lg([(0, lighten(col, .3)), (1, col)], 0, 0, 1, 1), darken(col, .3), w=w, h=h)
        kx = x + (w - h / 2) / s.k if on else x + (h / 2) / s.k
        s.cyl(kx, y + (h / 2) / s.k, z + 7 / s.k, (h * .4) / s.k, .22, '#ffffff', top='#ffffff')

    def bubble(s, x, y, z, col='#ffffff', text='?', w=84, h=64, tcol='#111', side=None):
        r = 16
        d = (f'M{r},0 H{w-r} Q{w},0 {w},{r} V{h-r} Q{w},{h} {w-r},{h} H{w*.42:.1f} L{w*.2:.1f},{h+16} L{w*.26:.1f},{h} H{r} Q0,{h} 0,{h-r} V{r} Q0,0 {r},0 Z')
        s.shadow_cyl(x + w * .5 / s.k, y - .3, 0, w * .3 / s.k, .2, op=.07)
        inner = f'<text x="{w/2}" y="{h*.68:.1f}" text-anchor="middle" font-family="{FONT}" font-size="{h*.58:.1f}" font-weight="800" fill="{tcol}">{text}</text>'
        s.extrude('left', x, y, z + (h + 16) / s.k, d, 10, s.lg([(0, '#ffffff' if col == '#ffffff' else lighten(col, .3)), (1, col if col != '#ffffff' else '#ececf1')], 0, 0, 1, 1), side or darken(col, .2), w=w, h=h + 16, inner=inner)

    def sparkle(s, x, y, z, size=26, col='#FFC94A'):
        q = size / 2; t = size * .1
        d = f'M{q},0 Q{q+t},{q-t} {size},{q} Q{q+t},{q+t} {q},{size} Q{q-t},{q+t} 0,{q} Q{q-t},{q-t} {q},0 Z'
        s.extrude('left', x, y, z, d, 5, s.lg([(0, lighten(col, .55)), (1, col)], 0, 0, 1, 1), darken(col, .28), w=size, h=size, hl=False)

    # ---------- output ----------
    def render(s, aria='', cls='ill', pad=None):
        p = s.pad if pad is None else pad
        x0, y0, x1, y1 = s.bb[0] - p, s.bb[1] - p, s.bb[2] + p, s.bb[3] + p
        w, h = x1 - x0, y1 - y0
        out = f'<svg class="{cls}" viewBox="{x0:.0f} {y0:.0f} {w:.0f} {h:.0f}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>{"".join(s.defs)}</defs>'
        for L in s.layers:
            out += f'<g class="lyr" data-depth="{L["depth"]}">' + ''.join(L['items']) + '</g>'
        return out + '</svg>'
