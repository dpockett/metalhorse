/* Metal Horse — гарантія, умови оплати/доставки, галочка погодження,
   кнопка «Оформити» в картці запчастини веде одразу на оформлення */
(function(){
  var $=function(s){return document.querySelector(s)};
  var PAY=[
    "Відправляємо тільки після передоплати за пересилку — накладеним платежем без передоплати не відправляємо",
    "Сума передоплати залежить від розміру деталі: великі деталі (бампери, двері, ляди) коштують дорожче",
    "Оплата й відправка — лише після того, як менеджер підтвердить замовлення",
    "Нова Пошта по всій Україні — відділення або поштомат. Самовивіз: Рівне, вул. Боярка, 40а"
  ];
  var WAR=[
    "Звірте каталожний номер (артикул) у картці з номером на вашій деталі",
    "Якщо номер відрізняється або ви підбираєте деталь лише за назвою чи фото — гарантії сумісності й повернення немає",
    "Ми не підбираємо запчастини за VIN-кодом і не відповідаємо за сумісність деталі з конкретним авто",
    "Потрібні додаткові фото чи відео деталі — напишіть нам, надішлемо"
  ];
  var AGREE="Я звірив(-ла) каталожний номер і погоджуюсь з умовами гарантії та оплати";
  var li=function(a){return a.map(function(x){return "<li>"+x+"</li>"}).join("")};

  var css=document.createElement("style");css.textContent=
    ".mh-agree{display:flex;gap:10px;align-items:flex-start;margin:12px 0 10px;font-size:13px;line-height:1.45;color:var(--fg);cursor:pointer;text-align:left}"+
    ".mh-agree input{appearance:none;-webkit-appearance:none;flex:none;width:20px;height:20px;margin:0;border-radius:6px;border:1.5px solid var(--or);background:transparent;display:grid;place-items:center;cursor:pointer}"+
    ".mh-agree input:checked{background:var(--or)}.mh-agree input:checked::after{content:'✓';color:#140600;font-weight:800;font-size:13px;line-height:1}"+
    ".mh-agree.err{animation:mhShake .35s}.mh-agree.err span{color:#ff6b6b}"+
    "@keyframes mhShake{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}"+
    ".mh-terms{margin-top:14px;padding:16px 18px;border-radius:16px;border:1px dashed rgba(255,106,19,.55);background:rgba(255,106,19,.05)}"+
    ".mh-terms h4{margin:0 0 8px;font-size:15px}.mh-terms h4+ul+h4{margin-top:14px}"+
    ".mh-terms ul{margin:0;padding:0;list-style:none;display:grid;gap:7px;font-size:13.5px;color:var(--muted);line-height:1.5}"+
    ".mh-terms li{padding-left:20px;position:relative}.mh-terms li::before{content:'•';position:absolute;left:4px;color:var(--or);font-weight:800}"+
    ".mh-war{display:none}#cv.part-mode .mh-war{display:block}#cv:not(.part-mode) .mh-agree-cv{display:none}"+
    ".dl-terms{padding:0 0 80px}.dl-terms .mh-terms{max-width:900px}";
  document.head.appendChild(css);

  /* ---- картка запчастини ---- */
  var add=$("#cvAdd");
  if(add){
    var lab=document.createElement("label");lab.className="mh-agree mh-agree-cv";
    lab.innerHTML='<input type="checkbox" id="cvAgree"><span>'+AGREE+'</span>';
    add.parentNode.insertBefore(lab,add);
    var why=$("#cvWhy");
    if(why){var sec=document.createElement("section");sec.className="cv-sec cv-why mh-war";
      sec.innerHTML="<h3>Гарантія та сумісність</h3><ul>"+li(WAR)+"</ul>";
      why.closest(".cv-sec").after(sec)}
    add.addEventListener("click",function(e){
      var id=add.dataset.add;var inc=false;try{inc=inCart(id)}catch(_){}
      if(inc){ // вже в кошику → одразу оформлення, а не кошик
        e.stopImmediatePropagation();e.preventDefault();
        var x=$("#cvX");if(x)x.click();setTimeout(function(){try{openCo()}catch(_){}},320);return}
      var cb=$("#cvAgree");
      if(cb&&!cb.checked){e.stopImmediatePropagation();e.preventDefault();
        lab.classList.remove("err");void lab.offsetWidth;lab.classList.add("err");
        try{toast("Поставте галочку: ви звірили номер деталі")}catch(_){}}
    },true);
    var op=window.openPart;
    if(typeof op==="function")window.openPart=function(){var r=op.apply(this,arguments);
      try{$("#cvWhy").innerHTML=li(PAY);var cb=$("#cvAgree");if(cb){var id=add.dataset.add;cb.checked=!!(id&&inCart(id))}
        if(add.classList.contains("in"))add.textContent="✓ У кошику — оформити замовлення →"}catch(_){}
      return r};
    // після додавання — підказка, що далі оформлення
    add.addEventListener("click",function(){setTimeout(function(){if(add.classList.contains("in"))add.textContent="✓ У кошику — оформити замовлення →"},0)});
  }

  /* ---- оформлення: умови + обов'язкова галочка ---- */
  var pane=$("#panePay");
  if(pane){
    var box=document.createElement("div");box.className="mh-terms";
    box.innerHTML="<h4>Оплата й доставка</h4><ul>"+li(PAY.slice(0,3))+"</ul><h4>Гарантія та сумісність</h4><ul>"+li(WAR.slice(0,3))+"</ul>"+
      '<label class="mh-agree" id="coAgreeL"><input type="checkbox" id="coAgree"><span>'+AGREE+'</span></label>';
    var sec2=pane.querySelectorAll(".co-step");(sec2[sec2.length-1]||pane).appendChild(box);
    document.addEventListener("submit",function(e){
      if(!e.target||e.target.id!=="orderForm"||pane.hidden)return;
      var cb=$("#coAgree");if(cb&&!cb.checked){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
        var l=$("#coAgreeL");l.classList.remove("err");void l.offsetWidth;l.classList.add("err");l.scrollIntoView({block:"center",behavior:"smooth"});
        var er=$("#oErr");if(er)er.textContent="Поставте галочку погодження з умовами гарантії та оплати"}
    },true);
  }

  /* ---- сторінка «Доставка» ---- */
  var ways=$(".dl-ways");
  if(ways){var s3=document.createElement("section");s3.className="dl-terms";
    s3.innerHTML='<div class="wrap"><div class="mh-terms"><h4>Оплата й доставка</h4><ul>'+li(PAY)+'</ul><h4>Гарантія та сумісність</h4><ul>'+li(WAR)+"</ul></div></div>";
    ways.after(s3)}
})();
