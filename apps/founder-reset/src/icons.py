"""Small isometric objects used inline through the page."""
from iso import Scene

def _sc(pid, k=26):
    s = Scene(pid, k=k, pad=10); s.layer('o', .6); return s

def _wrap(s, fn, delay=0.0):
    s.begin(0, delay); fn(); s.end(); return s.render(cls='ill ico')

def build():
    I = {}
    s = _sc('iScoop'); I['scoop'] = _wrap(s, lambda: s.scoop(0, 0, 0), .2)
    s = _sc('iBottle'); I['bottle'] = _wrap(s, lambda: s.bottle(0, 0, 0), .8)
    def vit():
        s.tile(-1.2, -.2, 0, 'B', '6', col='#F5C04A', w=1.3, h=.35)
        s.tile(.4, -1.4, 0, 'C', '', col='#FFB45C', w=1.3, h=.35)
        s.tile(-.2, .9, 0, 'D3', '', col='#FF8A1F', w=1.3, h=.35)
    s = _sc('iVit'); I['vitamins'] = _wrap(s, vit, 1.4)
    s = _sc('iNocaf', 24); I['nocaf'] = _wrap(s, lambda: s.nocaf(0, 0, 0), .5)
    s = _sc('iMoon'); I['moon'] = _wrap(s, lambda: s.moon(0, 0, 0), 1.1)
    s = _sc('iTea', 24); I['tea'] = _wrap(s, lambda: s.teacup(0, 0, 0), .3)
    s = _sc('iMg'); I['mg'] = _wrap(s, lambda: s.tile(0, 0, 0, 'Mg', '12', col='#3DBFA0'), .9)
    s = _sc('iZn'); I['zn'] = _wrap(s, lambda: s.tile(0, 0, 0, 'Zn', '30', col='#8FA3C8'), 1.6)
    s = _sc('iB12'); I['b12'] = _wrap(s, lambda: s.tile(0, 0, 0, 'B12', '', col='#F4799F'), .4)
    s = _sc('iCoin'); I['coin'] = _wrap(s, lambda: s.coin(0, 0, 0), .2)
    s = _sc('iCard'); I['card'] = _wrap(s, lambda: s.card(0, 0, 0), 1.0)
    s = _sc('iToggle', 30); I['toggle'] = _wrap(s, lambda: s.toggle(0, 0, 0), .6)
    s = _sc('iBox', 22); I['box'] = _wrap(s, lambda: s.pkg(0, 0, 0, 2.6, 2.0, 1.4, '7-Day Starter', '14 sachets'), .3)
    s = _sc('iGlass', 24); I['glass'] = _wrap(s, lambda: s.glass(0, 0, 0, liquid='#FFB45C', swirl='#FF8A1F'), 1.2)
    s = _sc('iStrip', 24); I['strip'] = _wrap(s, lambda: s.strip(0, 0, 0), .7)
    def sach2():
        s.sachet(-1.6, 0, 0, 'am', side='left', W=1.6, H=2.4)
        s.sachet(.7, -1.6, 0, 'pm', side='right', W=1.6, H=2.4)
    s = _sc('iSach', 26); I['sachets'] = _wrap(s, sach2, .5)
    s = _sc('iAm', 26); I['am'] = _wrap(s, lambda: s.sachet(0, 0, 0, 'am', side='left', W=1.7, H=2.5), .2)
    s = _sc('iPm', 26); I['pm'] = _wrap(s, lambda: s.sachet(0, 0, 0, 'pm', side='right', W=1.7, H=2.5), .9)
    s = _sc('iCal', 24)
    def cal(): s.calendar_block(0, 0, 0, 'Every 30 days', '30')
    I['cal30'] = _wrap(s, cal, 1.3)
    s = _sc('iCal7', 24)
    def cal7(): s.calendar_block(0, 0, 0, '7-day reset', '7')
    I['cal7'] = _wrap(s, cal7, .4)
    def bubbles():
        s.bubble(-.4, 1.4, 0, '#ffffff', '?', 120, 92)
        s.bubble(1.8, -1.6, 1.4, '#8B68F5', '•••', 96, 70, tcol='#fff')
    s = _sc('iBub', 34); s.layer('o', 1.0); I['bubbles'] = _wrap(s, bubbles, .6)
    s = _sc('iSpark', 30); I['spark'] = _wrap(s, lambda: s.sparkle(0, 0, 0, 34), 0)
    s = _sc('iTab', 30); I['tablet'] = _wrap(s, lambda: s.tablet(0, 0, 0, r=.42), 0)
    s = _sc('iCap', 30); I['capsule'] = _wrap(s, lambda: s.capsule(0, 0, .3, ang=-24, L=1.3, Rr=.32), 0)
    return I
