/* Metal Horse — кнопка «Назад» повертає на попередній крок каталогу
   (марка → категорія → підкатегорія → сторінка → картка запчастини/авто) */
(function(){
  if(typeof st==="undefined"||!window.history||!history.pushState)return;
  var KEYS=["model","cat","sub","q","page","sort","brand"],restoring=false,closingByBack=false;
  function snap(){var o={};KEYS.forEach(function(k){o[k]=st[k]});return o}
  function same(a,b){if(!a||!b)return false;for(var i=0;i<KEYS.length;i++)if(a[KEYS[i]]!==b[KEYS[i]])return false;return true}
  function onlyQ(a,b){if(!a||!b)return false;for(var i=0;i<KEYS.length;i++){var k=KEYS[i];if(k!=="q"&&k!=="page"&&a[k]!==b[k])return false}return true}
  function cur(){return history.state&&history.state.mh?history.state:null}
  history.replaceState({mh:1,f:snap()},"",location.href);
  addEventListener("hashchange",function(){if(!history.state)history.replaceState({mh:1,f:snap()},"",location.href)});

  /* фільтри каталогу */
  var rp=window.renderParts;
  if(typeof rp==="function"){
    window.renderParts=function(){var r=rp.apply(this,arguments);
      if(!restoring){var s=snap(),c=cur();
        if(!c)history.replaceState({mh:1,f:s},"",location.href);
        else if(!same(c.f,s)){
          if(onlyQ(c.f,s)&&c.f.q!==s.q)history.replaceState({mh:1,f:s},"",location.href);
          else history.pushState({mh:1,f:s},"",location.href)}}
      return r};
  }
  /* картка запчастини / авто */
  function wrap(name){var o=window[name];if(typeof o!=="function")return;
    window[name]=function(){var r=o.apply(this,arguments);var c=cur();
      if(!(c&&c.cv))history.pushState({mh:1,f:snap(),cv:1},"",location.href);return r}}
  wrap("openPart");wrap("openCar");
  var cv=document.getElementById("cv");
  function cvOpen(){return cv&&!cv.hidden&&cv.classList.contains("on")}
  ["cvBack","cvX","cvAsk"].forEach(function(id){var b=document.getElementById(id);if(!b)return;
    b.addEventListener("click",function(){if(closingByBack)return;var c=cur();if(c&&c.cv)history.back()})});
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&cvOpen()){var c=cur();if(c&&c.cv)setTimeout(function(){history.back()},0)}});

  addEventListener("popstate",function(e){var s=e.state;
    if(cvOpen()&&!(s&&s.cv)){closingByBack=true;var x=document.getElementById("cvX");if(x)x.click();closingByBack=false}
    if(!(s&&s.mh&&s.f))return;
    if(!same(s.f,snap())){restoring=true;
      KEYS.forEach(function(k){st[k]=s.f[k]});
      try{var q=document.getElementById("q");if(q)q.value=st.q||""}catch(_){}
      try{renderBrands();renderModels()}catch(_){}
      try{syncControls()}catch(_){}
      try{rp()}catch(_){}
      restoring=false;
      var p=document.getElementById("parts");if(p&&!p.closest(".view").hidden)p.scrollIntoView({block:"start"})}
  });
})();
