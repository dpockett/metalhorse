import re
s=open('index.html',encoding='utf-8').read()
s='\n'.join(l for l in s.split('\n') if 'netlify' not in l.lower())
s=re.sub(r'<title>.*?</title>','<title>Metal Horse — авто з США, запчастини | Рівне</title>',s,count=1,flags=re.S)

# --- авто: список з cars.js ---
def _end(s,i):
    j=s.index('[',i);d=0;q=None;k=j
    while True:
        c=s[k]
        if q:
            if c=='\\':k+=2;continue
            if c==q:q=None
        elif c in '"\'`':q=c
        elif c=='[':d+=1
        elif c==']':
            d-=1
            if d==0:return k+1
        k+=1
a=s.index('const CARS=');b=_end(s,s.index('const TRANSIT='))
if s[b]==';':b+=1
s=s[:a]+open('../cars.js',encoding='utf-8').read().strip()+s[b:]

# --- "Авторозбірка" -> "Авто з США" ---
REP=[
 ('font-size="68" textLength="590"','font-size="74" textLength="560"'),
 ('>АВТОРОЗБІРКА</text>','>АВТО З США</text>'),
 ('АВТОРОЗБІРКА · РІВНЕ','АВТО З США · РІВНЕ'),
 ('Емблема Metal Horse — авторозбірка','Емблема Metal Horse — авто з США'),
 ('— Авторозбірка</div>','— Авто з США</div>'),
 ('<span class="chrome">Розбірка</span>','<span class="chrome">Авто</span>'),
 ('<span class="thin">авто з</span> <span class="or">США</span>','<span class="thin">та запчастини з</span> <span class="or">США</span>'),
 ('Авторозбірка авто та електромобілів зі США в Рівному.','Авто та запчастини з США в Рівному.'),
 ('Розбірка авто та електромобілів зі США.','Авто та запчастини з США.'),
 ('Metal Horse · Розбірка авто з США · Рівне','Metal Horse · Авто з США · Рівне'),
]
for x,y in REP: s=s.replace(x,y)

# --- іконка сайту з емблеми ---
try:
    a=s.index('<svg width="0" height="0" style="position:absolute" aria-hidden="true">')
    b=s.index('</svg>',s.index('<symbol id="mh-emblem"',a))+6
    inner=s[a:b]
    inner=inner[inner.index('>')+1:-6]
    fav='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="110 10 990 1190">'+inner+'<use href="#mh-emblem" xlink:href="#mh-emblem" x="110" y="10" width="990" height="1190"/></svg>'
    open('favicon.svg','w',encoding='utf-8').write(fav)
    icon='<link rel="icon" type="image/svg+xml" href="/favicon.svg">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n'
except Exception as e:
    print('favicon skipped',e);icon=''

s=s.replace('</head>',icon+open('../head.html',encoding='utf-8').read()+'<link rel="stylesheet" href="/style-extra.css?v=1">\n</head>',1)
i=s.rfind('</body>')
s=s[:i]+'<script src="/orders.js?v=2"></script>\n<script src="/analytics.js?v=1"></script>\n'+s[i:]
open('index.html','w',encoding='utf-8').write(s)
print('ok', len(s))
