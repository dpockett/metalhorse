/* Metal Horse — надсилання замовлення в адмінпанель */
(function(){
  var API="https://script.google.com/macros/s/AKfycbw7Xzy_71TPw8t9UELgWtQ00haffn84r9Mcl0hhcNbpGeVugpJKsOMcRd06UMUFEeRrUw/exec";
  var f=document.getElementById("orderForm");if(!f)return;
  var sent={};
  function v(id){var e=document.getElementById(id);return e?e.value.trim():""}
  function r(n){var e=document.querySelector('input[name="'+n+'"]:checked');return e?e.value:""}
  f.addEventListener("submit",function(){setTimeout(function(){
    var done=document.getElementById("doneStep");if(!done||done.hidden)return;
    var h=(done.querySelector(".done-h")||{}).textContent||"";var m=h.match(/MH-\d+/);var num=m?m[0]:"MH-"+String(Date.now()).slice(-6);
    if(sent[num])return;sent[num]=1;
    var items="",total="";
    try{items=CART.map(function(it,i){return (i+1)+". "+itemName(it)+" — "+it.qty+" шт. ("+itemSub(it)+"; "+itemPrice(it)+")"}).join("\n");
      var t=cartTotal();total=t.uah?Math.round(t.uah).toLocaleString("uk-UA")+" грн"+(t.partial?" + уточнення":""):"уточнити"}catch(e){}
    var dlv=r("dlv");
    var d={num:num,name:(v("oName")+" "+v("oLast")).trim(),tel:v("oTel"),msgr:r("msgr")||"Viber",
      dlv:dlv==="self"?"Самовивіз (Рівне, Боярка 40а)":dlv==="npm"?"Нова Пошта — поштомат":"Нова Пошта — відділення",
      city:dlv==="self"?"":v("oCity"),np:dlv==="self"?"":v("oNp"),pay:r("pay"),items:items,total:total,note:v("oNote"),
      text:(document.getElementById("orderText")||{}).textContent||""};
    var note=document.getElementById("doneNote");
    if(note)note.innerHTML="Надсилаємо замовлення менеджеру…";
    fetch(API,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(d)})
      .then(function(x){return x.json()}).then(function(j){if(!j.ok)throw 0;
        if(note)note.innerHTML="<b style='color:var(--ok)'>Замовлення прийнято!</b> Менеджер зв'яжеться з вами найближчим часом"+(d.msgr&&d.msgr!=="Дзвінок"?" у "+d.msgr:"")+", щоб підтвердити наявність і деталі.";
        try{CART.length=0;saveCart();renderCart()}catch(e){}})
      .catch(function(){sent[num]=0;if(note)note.innerHTML="Не вдалося надіслати автоматично. Скопіюйте текст і надішліть нам у Viber на <b class='mono'>099 030 99 49</b> або подзвоніть.";});
  },0)});
})();
