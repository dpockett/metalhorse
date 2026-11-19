import re
s=open('index.html',encoding='utf-8').read()
s='\n'.join(l for l in s.split('\n') if 'netlify' not in l.lower())
s=re.sub(r'<title>.*?</title>','<title>Metal Horse — розборка авто зі США в Рівному | запчастини та авто</title>',s,count=1,flags=re.S)
s=s.replace('</head>',open('../head.html',encoding='utf-8').read()+'</head>',1)
i=s.rfind('</body>')
s=s[:i]+'<script src="/orders.js?v=2"></script>\n'+s[i:]
open('index.html','w',encoding='utf-8').write(s)
print('ok', len(s))
