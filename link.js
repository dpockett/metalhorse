/* Metal Horse — посилання на товар, авто і фільтр каталогу + кнопка «Поділитися»
   Запчастина:  metalhorse.com.ua/?p=<код DNTrade>
   Авто:        metalhorse.com.ua/?car=jeep-wagoneer-s-2025
   Фільтр:      metalhorse.com.ua/?model=...&cat=...&sub=...&q=...&sort=...&page=...#parts */
(function(){
  if(typeof st==="undefined"||typeof URLSearchParams==="undefined")return;
  var ORIGIN=location.origin&&location.origin.indexOf("http")===0?location.origin:"https://metalhorse.com.ua";
  var ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>';
  var CUR=null; /* відкрита картка: {t:"p"|"car", v:...} */

  /* ---------- стилі ---------- */
  var css=document.createElement("style");
  css.textContent=
   ".mh-sh{position:absolute;z-index:4;width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.16);background:rgba(6,7,9,.82);color:#fff;display:grid;place-items:center;cursor:pointer;padding:0;transition:background .2s,transform .2s}"+
   ".mh-sh svg{width:17px;height:17px}.mh-sh:hover{background:var(--or,#ff6a13);transform:scale(1.06)}"+
   ".part>.mh-sh{top:20px;right:20px}"+
   ".vis>.mh-sh{left:14px;bottom:14px}"+
   ".cv-stage>.mh-sh{right:62px;top:14px;width:40px;height:40px}"+
   ".cv-link{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:-4px;font-size:13px;color:var(--muted,#9aa)}"+
   ".cv-link code{font-family:var(--f-mono,monospace);font-size:12px;padding:6px 10px;border-radius:10px;background:rgba(255,255,255,.05);border:1px solid var(--line,rgba(255,255,255,.1));color:#fff;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"+
   ".cv-link button{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line-2,rgba(255,255,255,.18));background:transparent;color:inherit;border-radius:999px;padding:6px 12px;font-size:13px;cursor:pointer}"+
   ".cv-link button svg{width:14px;height:14px}.cv-link button:hover{border-color:var(--or,#ff6a13);color:var(--or,#ff6a13)}"+
   ".active-filter .mh-afsh{display:inline-flex;align-items:center;gap:6px}.active-filter .mh-afsh svg{width:13px;height:13px}"+
   ".mh-shm{position:fixed;inset:0;z-index:400;display:flex;align-items:flex-end;justify-content:center}.mh-shm[hidden]{display:none}"+
   ".mh-shm-bg{position:absolute;inset:0;background:rgba(0,0,0,.6);opacity:0;transition:opacity .2s}.mh-shm.on .mh-shm-bg{opacity:1}"+
   ".mh-shm-box{position:relative;width:min(420px,100%);margin:0 0 max(12px,env(safe-area-inset-bottom));padding:18px;border-radius:22px;background:#111317;border:1px solid rgba(255,255,255,.1);display:grid;gap:8px;transform:translateY(30px);opacity:0;transition:transform .22s,opacity .22s;color:#fff;font-size:15px}"+
   ".mh-shm.on .mh-shm-box{transform:none;opacity:1}"+
   "@media (min-width:700px){.mh-shm{align-items:center}.mh-shm-box{margin:0}}"+
   ".mh-shm-box>b{font-size:17px}.mh-shm-u{font-family:var(--f-mono,monospace);font-size:12px;color:#aab;word-break:break-all;margin-bottom:4px}"+
   ".mh-shm-box>button,.mh-shm-box>a{display:flex;align-items:center;gap:12px;width:100%;padding:13px 14px;border-radius:14px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#fff;font:inherit;text-decoration:none;cursor:pointer;text-align:left}"+
   ".mh-shm-box>button:hover,.mh-shm-box>a:hover{border-color:var(--or,#ff6a13)}.mh-shm-box>[hidden]{display:none}"+
   ".mh-shm-box svg{width:18px;height:18px}.mh-shm-box i{width:18px;height:18px;border-radius:50%;display:inline-block}"+
   ".mh-shm-box .mh-shm-x{justify-content:center;background:transparent;color:#aab}";
  document.head.appendChild(css);

  /* ---------- допоміжні ---------- */
  function slug(c){return (c.b+" "+c.m+" "+(c.yr||"")).toLowerCase().replace(/[^a-z0-9а-яіїєґ]+/gi,"-").replace(/^-+|-+$/g,"")}
  function carKey(c){return c.b+"|"+c.m+"|"+(c.yr||"")}
  function allCars(){try{return [].concat(CARS,TRANSIT)}catch(e){return []}}
  function carBySlug(s){var L=allCars();for(var i=0;i<L.length;i++)if(slug(L[i])===s)return L[i];return null}
  function carByKey(k){var L=allCars();for(var i=0;i<L.length;i++)if(carKey(L[i])===k)return L[i];return null}
  function partCode(p){return p.code!=null&&p.code!==""?String(p.code):String(p.id).replace(/^d/,"")}
  function findPart(v){return partById("d"+v)||partById(v)}
  function partURL(id){var p=partById(id);return p?ORIGIN+"/?p="+encodeURIComponent(partCode(p)):ORIGIN+"/#parts"}
  function carURL(key){var c=carByKey(key);return c?ORIGIN+"/?car="+slug(c):ORIGIN+"/#cars"}
  function filterQS(){var q=new URLSearchParams();
    if(st.model)q.set("model",st.model);if(st.cat&&st.cat!=="Усі")q.set("cat",st.cat);if(st.sub)q.set("sub",st.sub);
    if(st.q&&st.q.trim())q.set("q",st.q.trim());if(st.sort&&st.sort!=="def")q.set("sort",st.sort);if(st.page>1)q.set("page",st.page);
    return q.toString()}
  function filterURL(){var s=filterQS();return ORIGIN+"/"+(s?"?"+s:"")+"#parts"}
  function setURL(u){try{var x=new URL(u);history.replaceState(history.state,"",x.pathname+x.search+x.hash)}catch(e){}}

  function copy(t){
    function ok(){try{toast("Посилання скопійовано ✓")}catch(e){}}
    function old(){var a=document.createElement("textarea");a.value=t;a.setAttribute("readonly","");a.style.cssText="position:fixed;left:-9999px;top:0";document.body.appendChild(a);a.select();
      try{document.execCommand("copy");ok()}catch(e){try{toast("Скопіюйте: "+t)}catch(_){}}a.remove()}
    if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(t).then(ok,old);else old()}
  /* меню «Поділитися»: працює в будь-якому браузері, у т.ч. всередині Instagram/Telegram */
  var MENU=null,MURL="",MTITLE="";
  function menu(){if(MENU)return MENU;MENU=document.createElement("div");MENU.className="mh-shm";MENU.hidden=true;
    MENU.innerHTML='<div class="mh-shm-bg"></div><div class="mh-shm-box" role="dialog" aria-label="Поділитися"><b>Поділитися</b><code class="mh-shm-u"></code>'+
      '<button type="button" data-a="copy">'+'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>Копіювати посилання</button>'+
      '<a data-a="tg" target="_blank" rel="noopener"><i style="background:#229ED9"></i>Telegram</a>'+
      '<a data-a="vb"><i style="background:#7360F2"></i>Viber</a>'+
      '<a data-a="wa" target="_blank" rel="noopener"><i style="background:#25D366"></i>WhatsApp</a>'+
      '<button type="button" data-a="more" hidden>'+ICON+'Інші додатки…</button>'+
      '<button type="button" data-a="x" class="mh-shm-x">Закрити</button></div>';
    document.body.appendChild(MENU);
    MENU.addEventListener("click",function(e){var t=e.target.closest("[data-a]");if(e.target.classList.contains("mh-shm-bg")){hide();return}if(!t)return;var a=t.dataset.a;
      if(a==="copy"){e.preventDefault();copy(MURL);hide()}
      else if(a==="more"){e.preventDefault();var u=MURL,ti=MTITLE;hide();try{navigator.share({title:ti||"Metal Horse",url:u}).catch(function(){})}catch(_){copy(u)}}
      else if(a==="x"){hide()}
      else setTimeout(hide,300)});
    addEventListener("keydown",function(e){if(e.key==="Escape"&&MENU&&!MENU.hidden)hide()});
    return MENU}
  function hide(){if(MENU){MENU.classList.remove("on");setTimeout(function(){MENU.hidden=true},200)}}
  function share(url,title){var m=menu();MURL=url;MTITLE=title||"";var txt=(title?title+" — ":"")+url;
    m.querySelector(".mh-shm-u").textContent=url.replace(/^https?:\/\//,"");
    m.querySelector('[data-a="tg"]').href="https://t.me/share/url?url="+encodeURIComponent(url)+(title?"&text="+encodeURIComponent(title):"");
    m.querySelector('[data-a="vb"]').href="viber://forward?text="+encodeURIComponent(txt);
    m.querySelector('[data-a="wa"]').href="https://wa.me/?text="+encodeURIComponent(txt);
    m.querySelector('[data-a="more"]').hidden=!navigator.share;
    m.hidden=false;requestAnimationFrame(function(){m.classList.add("on")})}
  function btn(cls,label){var b=document.createElement("button");b.type="button";b.className=cls;b.setAttribute("aria-label",label);b.title=label;b.innerHTML=ICON;return b}


  /* ---------- легкі фото в каталозі: зменшена копія (~40 КБ замість ~150 КБ) ---------- */
  function thumbs(root){if(!root)return;[].forEach.call(root.querySelectorAll("img"),function(im){if(im.dataset.th)return;var o=im.getAttribute("src")||"";
    if(o.indexOf("https://cdn.dntrade.com.ua/")!==0)return;im.dataset.th="1";
    im.onerror=function(){if(this.dataset.th==="1"){this.dataset.th="2";this.src=o}else this.remove()};
    im.src="https://wsrv.nl/?url="+encodeURIComponent(o)+"&w=520&q=72&output=webp&we"})}

  /* ---------- кнопки на картках ---------- */
  function decorate(){
    document.querySelectorAll(".part[data-pid]").forEach(function(a){if(a.querySelector(":scope>.mh-sh"))return;var b=btn("mh-sh","Поділитися посиланням");b.dataset.shP=a.dataset.pid;a.appendChild(b)});
    document.querySelectorAll("[data-open-car] .vis").forEach(function(v){if(v.querySelector(":scope>.mh-sh"))return;var a=v.closest("[data-open-car]");var b=btn("mh-sh","Поділитися посиланням");b.dataset.shCar=a.dataset.openCar;v.appendChild(b)});
  }
  var dT;new MutationObserver(function(){clearTimeout(dT);dT=setTimeout(decorate,30)}).observe(document.body,{childList:true,subtree:true});decorate();thumbs(document.getElementById("partGrid"));

  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-sh-p],[data-sh-car],.mh-cvsh,.mh-cvcopy,.mh-afsh");if(!b)return;
    e.preventDefault();e.stopPropagation();
    if(b.dataset.shP){var p=partById(b.dataset.shP);share(partURL(b.dataset.shP),p?p.n:"")}
    else if(b.dataset.shCar){share(carURL(b.dataset.shCar),b.dataset.shCar.replace(/\|/g," "))}
    else if(b.classList.contains("mh-afsh"))share(filterURL(),"Metal Horse — запчастини");
    else if(CUR){var u=curURL();if(b.classList.contains("mh-cvcopy"))copy(u);else share(u,(document.getElementById("cvH")||{}).textContent)}
  },true);

  /* ---------- картка товару / авто ---------- */
  var stage=document.getElementById("cvStage");
  if(stage&&!stage.querySelector(".mh-sh")){var sb=btn("mh-sh mh-cvsh","Поділитися посиланням");stage.appendChild(sb)}
  var price=document.querySelector("#cv .cv-price"),row=null;
  if(price){row=document.createElement("div");row.className="cv-link";
    row.innerHTML='<code id="mhLink"></code><button type="button" class="mh-cvcopy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>Копіювати</button><button type="button" class="mh-cvsh">'+ICON+'Поділитися</button>';
    price.parentNode.insertBefore(row,price.nextSibling)}
  function curURL(){return CUR?(CUR.t==="p"?partURL(CUR.v):carURL(CUR.v)):location.href}
  function showLink(){var u=curURL(),c=document.getElementById("mhLink");if(c)c.textContent=u.replace(/^https?:\/\//,"");setURL(u)}
  function wrap(name,t){var o=window[name];if(typeof o!=="function")return;
    window[name]=function(v){var r=o.apply(this,arguments);var cv=document.getElementById("cv");if(cv&&!cv.hidden){CUR={t:t,v:v};showLink();if(t==="p")thumbs(document.getElementById("cvTh"))}return r}}
  wrap("openPart","p");wrap("openCar","car");
  var cvEl=document.getElementById("cv");
  if(cvEl)new MutationObserver(function(){if(cvEl.hidden&&CUR){CUR=null;if(/[?&](p|car)=/.test(location.search)){var f=filterQS();setURL(f?filterURL():ORIGIN+"/"+location.hash)}}}).observe(cvEl,{attributes:true,attributeFilter:["hidden"]});

  /* ---------- адреса сторінки = поточний фільтр ---------- */
  var rp=window.renderParts;
  if(typeof rp==="function")window.renderParts=function(){var r=rp.apply(this,arguments);thumbs(document.getElementById("partGrid"));
    if(!CUR&&typeof CAT_STATE!=="undefined"&&CAT_STATE!=="loading"&&!APPLYING){var s=filterQS();
      if(s)setURL(ORIGIN+"/?"+s+"#parts");else if(location.search&&!/[?&](p|car)=/.test(location.search))setURL(ORIGIN+"/"+location.hash)}
    return r};

  /* кнопка «Поділитися» біля активного фільтра */
  var af=document.getElementById("af"),rs=document.getElementById("afReset");
  if(af&&rs&&!af.querySelector(".mh-afsh")){var fb=document.createElement("button");fb.type="button";fb.className="mh-afsh";fb.innerHTML=ICON+"Поділитися";fb.title="Скопіювати посилання на цей фільтр";af.insertBefore(fb,rs)}

  /* ---------- відкриття за посиланням ---------- */
  var APPLYING=false,P=new URLSearchParams(location.search);
  var wantP=P.get("p"),wantCar=P.get("car"),hasF=["model","cat","sub","q","sort","page"].some(function(k){return P.has(k)});
  if(!wantP&&!wantCar&&!hasF)return;
  if(wantCar){var c=carBySlug(wantCar);
    if(c){setURL(ORIGIN+"/#cars");try{route(false)}catch(e){}setTimeout(function(){openCar(carKey(c))},60)}
  }
  var tries=0;(function wait(){
    if(typeof CAT_STATE==="undefined"||CAT_STATE==="loading"){if(++tries<200)return setTimeout(wait,100);return}
    if(hasF){APPLYING=true;
      var m=P.get("model"),ca=P.get("cat"),sb=P.get("sub"),q=P.get("q"),so=P.get("sort"),pg=parseInt(P.get("page"),10);
      try{if(m&&MODELS.some(function(x){return x.m===m}))st.model=m}catch(e){}
      try{if(ca&&CATS.indexOf(ca)>=0)st.cat=ca}catch(e){}
      if(sb)st.sub=sb;if(q){st.q=q;var qi=document.getElementById("q");if(qi)qi.value=q}
      if(so&&/^(def|asc|desc|new)$/.test(so)){st.sort=so;try{document.getElementById("sortLbl").textContent=SORT_L[so];[].forEach.call(document.getElementById("sortMenu").children,function(x){x.setAttribute("aria-selected",x.dataset.s===so)})}catch(e){}}
      if(pg>1)st.page=pg;
      try{syncControls()}catch(e){}APPLYING=false;
      setURL(filterURL());try{route(false)}catch(e){}
      renderParts();
      setTimeout(function(){var el=document.getElementById("parts");if(el)el.scrollIntoView({block:"start"})},450)}
    if(wantP){var p=findPart(wantP);
      if(p){if(!hasF)setURL(ORIGIN+"/#parts");try{route(false)}catch(e){}setTimeout(function(){openPart(p.id)},hasF?500:120)}
      else{setURL(ORIGIN+"/#parts");try{route(false)}catch(e){}setTimeout(function(){try{toast("Цю деталь уже продано — подивіться схожі в каталозі")}catch(e){}},600)}}
  })();
})();
