import re,sys
p=sys.argv[1];s=open(p,encoding='utf-8').read()
a=s.find('<link rel="icon" type="image/svg+xml" href="/favicon.svg">')
b=s.find('<link rel="stylesheet" href="/style-extra.css')
if a>=0 and b>a: b=s.index('\n',b)+1; s=s[:a]+s[b:]
s=re.sub(r'<script src="/(orders|analytics|nav|terms)\.js\?v=\d+"></script>\n?','',s)
s=s.replace('/* Авто на сайті. CARS — в наявності, TRANSIT — в дорозі.\n   Щоб перенести авто з дороги в наявність: перенесіть рядок з TRANSIT у CARS і змініть tag на ["ok","В наявності"]. */\n','')
assert 'favicon.svg' not in s and 'style-extra' not in s and 'analytics.js' not in s, 'strip failed'
open(p,'w',encoding='utf-8').write(s);print('stripped',len(s))
