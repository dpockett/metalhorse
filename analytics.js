/* Metal Horse — статистика (Google Analytics + Microsoft Clarity), тільки після згоди на cookies */
(function(){
  var GA="G-L3NSMPRDZ4",CL="zgaysb09x4",on=false,q=[];
  function ok(){try{return localStorage.getItem("mh_cookie")==="all"}catch(e){return false}}
  function ev(name,p){if(!on){q.push([name,p]);if(q.length>50)q.shift();return}
    try{gtag("event",name,p||{})}catch(e){}
    try{clarity("event",name)}catch(e){}}
  window.mhTrack=ev;
  function start(){if(on)return;on=true;
    var s=document.createElement("script");s.async=true;s.src="https://www.googletagmanager.com/gtag/js?id="+GA;document.head.appendChild(s);
    window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};
    gtag("js",new Date());gtag("config",GA,{anonymize_ip:true});
    (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script",CL);
    var w=q;q=[];w.forEach(function(x){ev(x[0],x[1])})}
  if(ok())start();
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest('[data-ck="all"]');if(b){setTimeout(start,50);return}
    var a=e.target.closest&&e.target.closest("a[href]");if(!a)return;var h=a.getAttribute("href")||"";
    var t=/^tel:/.test(h)?"phone":/viber:/.test(h)?"viber":/t\.me\//.test(h)?"telegram":/wa\.me\//.test(h)?"whatsapp":/ig\.me|instagram\.com/.test(h)?"instagram":"";
    if(t)ev("contact_click",{method:t})},true);
  function wrap(name,fn){var o=window[name];if(typeof o!=="function")return;window[name]=function(){try{fn.apply(null,arguments)}catch(e){}return o.apply(this,arguments)}}
  function hook(){
    wrap("addToCart",function(id,custom){var n="";try{var p=partById(id);n=p?p.n:(custom||"")}catch(e){}ev("add_to_cart",{item_name:String(n).slice(0,90)})});
    wrap("openCar",function(k){ev("view_car",{car:String(k||"").replace(/\|/g," ").slice(0,90)})});
    wrap("openPart",function(id){var n="";try{var p=partById(id);n=p?p.n:""}catch(e){}ev("view_part",{item_name:String(n).slice(0,90)})});
    wrap("openCo",function(){ev("begin_checkout")});
    var note=document.getElementById("doneNote");
    if(note&&window.MutationObserver)new MutationObserver(function(){if(/прийнято/.test(note.textContent)&&!note.dataset.tr){note.dataset.tr=1;var h=(document.querySelector("#doneStep .done-h")||{}).textContent||"";ev("purchase",{transaction_id:(h.match(/MH-\d+/)||[""])[0],currency:"UAH"})}if(!/прийнято/.test(note.textContent))note.dataset.tr=""}).observe(note,{childList:true,subtree:true,characterData:true});
  }
  if(document.readyState==="complete")hook();else addEventListener("load",hook);
})();
