"use strict";
const $ = s => document.querySelector(s);
const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };

const TYPES = [
  ["كوفي / مقهى","مقهى"],["مطعم","مطعم"],["فندق","فندق"],["شقق فندقية","شقق فندقية"],
  ["سوبرماركت / بقالة","سوبرماركت"],["صيدلية","صيدلية"],["مستشفى / عيادة","عيادة"],
  ["صالون حلاقة / تجميل","صالون"],["مغسلة ملابس","مغسلة"],["ورشة سيارات","ورشة سيارات"],
  ["محطة وقود","محطة وقود"],["مخبز / حلويات","مخبز"],["ملابس / أزياء","محل ملابس"],
  ["إلكترونيات / جوالات","محل جوالات"],["أثاث / منزلية","محل أثاث"],["عطور / هدايا","محل عطور"],
  ["نادي رياضي","نادي رياضي"],["مدرسة / معهد","معهد"],["عقار / مكاتب","مكتب عقار"],
  ["مقاولات / بناء","مقاولات"],["حديقة / منتزه","منتزه"],["مول / مركز تجاري","مول"]
];
const QUICK = ["مقهى","مطعم","فندق","صيدلية","صالون","ورشة سيارات"];

const KINDS = {
  website:{label:"موقع إلكتروني",color:"#2b7de9",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18"/></svg>'},
  tiktok:{label:"تيك توك",color:"#25f4ee",icon:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 3c.4 2.3 1.9 3.8 4.2 4v3c-1.6 0-3-.5-4.2-1.3v6.5a6.2 6.2 0 1 1-6.2-6.2c.3 0 .7 0 1 .1v3.1a3.1 3.1 0 1 0 2.2 3V3h3z"/></svg>'},
  instagram:{label:"انستقرام",color:"#dd2a7b",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg>'},
  twitter:{label:"X / تويتر",color:"#e7e9ea",icon:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 3h3l-7 8 8.2 10h-6.4l-5-6.1L4.6 21H1.5l7.5-8.6L1.2 3h6.6l4.5 5.6L17.5 3zm-1.1 16h1.7L7.7 4.8H5.9L16.4 19z"/></svg>'},
  facebook:{label:"فيسبوك",color:"#1877f2",icon:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.6V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.3H7.6V13h2.7v8h3.2z"/></svg>'},
  snapchat:{label:"سناب شات",color:"#e6d200",icon:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5c3 0 5 2.2 5 5.2 0 1 .1 2 .2 2.6.5.2 1.2-.2 1.6-.2.5 0 .9.3.9.7 0 .6-.9.9-1.6 1.2-.3.1-.5.3-.4.6.4 1.4 2 2.8 3.4 3.1.3.1.4.4.3.6-.2.6-1.5.9-2.2 1-.1.3-.2.8-.4.9-.3.2-1 0-1.8.1-.7.1-1.4.9-2.6 1.2-.8.2-1.6.2-2.4 0-1.2-.3-1.9-1.1-2.6-1.2-.8-.1-1.5.1-1.8-.1-.2-.1-.3-.6-.4-.9-.7-.1-2-.4-2.2-1-.1-.2 0-.5.3-.6 1.4-.3 3-1.7 3.4-3.1.1-.3-.1-.5-.4-.6-.7-.3-1.6-.6-1.6-1.2 0-.4.4-.7.9-.7.4 0 1.1.4 1.6.2.1-.6.2-1.6.2-2.6 0-3 2-5.2 5-5.2z"/></svg>'},
  youtube:{label:"يوتيوب",color:"#ff0033",icon:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12s0-3.3-.4-4.8c-.2-.9-.9-1.5-1.7-1.7C18.3 5 12 5 12 5s-6.3 0-7.9.5c-.8.2-1.5.8-1.7 1.7C2 8.7 2 12 2 12s0 3.3.4 4.8c.2.9.9 1.5 1.7 1.7C5.7 19 12 19 12 19s6.3 0 7.9-.5c.8-.2 1.5-.8 1.7-1.7.4-1.5.4-4.8.4-4.8zM10 15V9l5.2 3L10 15z"/></svg>'},
  linkedin:{label:"لينكدإن",color:"#0a66c2",icon:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.5c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21H9z"/></svg>'},
  whatsapp:{label:"واتساب",color:"#25d366",icon:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.4l.8 2c.1.2.1.4 0 .5l-.4.6-.3.3c-.1.1-.3.3-.1.5.1.3.6 1.1 1.4 1.8 1 .9 1.8 1.1 2 1.2.3.1.4.1.6-.1l.8-.9c.2-.2.4-.2.6-.1l1.9.9c.2.1.4.2.4.3.1.2.1.7-.1 1.3z"/></svg>'},
  linktree:{label:"رابط مجمع",color:"#43e660",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 3v18M12 8l5-4M12 8 7 4M12 13l6-3M12 13l-6-3"/></svg>'}
};
const ICON_PHONE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>';
const ICON_MAP='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
const ICON_COPY='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
const ICON_STAR='<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';

const state={rows:[],nextToken:null,sortK:null,sortDir:1,filter:"",hidden:new Set(),loading:false,lastQuery:null,apiCalls:0,isGrid:false};
const regionSel=$("#region"),citySel=$("#city"),typeSel=$("#type");

function fillRegions(){
  const cur=regionSel.value;
  regionSel.innerHTML="";regionSel.add(new Option("اختر المنطقة…",""));
  KSA.forEach(([name],i)=>regionSel.add(new Option(name,i)));
  if(cur!==""&&KSA[+cur])regionSel.value=cur;
  $("#stRegions").textContent=KSA.length.toLocaleString("ar-SA");
  $("#stCities").textContent=KSA.reduce((a,[,c])=>a+c.length,0).toLocaleString("ar-SA");
}
fillRegions();
document.addEventListener("ksa-ready",()=>{const rn=regionSel.value!==""?KSA[+regionSel.value]?.[0]:null;fillRegions();if(rn){const i=KSA.findIndex(([n])=>n===rn);if(i>=0){regionSel.value=i;regionSel.dispatchEvent(new Event("change"));}}});
TYPES.forEach(([label,q])=>typeSel.add(new Option(label,q)));

regionSel.addEventListener("change",()=>{
  citySel.innerHTML="";
  if(regionSel.value===""){citySel.disabled=true;citySel.add(new Option("اختر المنطقة أولاً",""));return;}
  const cities=KSA[+regionSel.value][1];
  citySel.disabled=false;
  citySel.add(new Option(`كل مدن المنطقة (${cities.length})`,""));
  cities.forEach(c=>citySel.add(new Option(c,c)));
});

const quickBox=$("#quickTypes");
QUICK.forEach(q=>{const b=el("button","chip",q);b.type="button";b.onclick=()=>{typeSel.value=q;syncChips();if(regionSel.value!=="")$("#goBtn").click();else toast("اختر المنطقة أولاً");};quickBox.appendChild(b);});
function syncChips(){quickBox.querySelectorAll(".chip").forEach(c=>c.classList.toggle("on",c.textContent===typeSel.value));}
typeSel.addEventListener("change",syncChips);

const legend=$("#legend");
Object.entries(KINDS).forEach(([k,v])=>{
  const b=el("button","lg",`<span class="sw" style="--c:${v.color}"></span>${v.label}`);
  b.style.setProperty("--c",v.color);b.type="button";b.title="إظهار/إخفاء هذا النوع";
  b.onclick=()=>{state.hidden.has(k)?state.hidden.delete(k):state.hidden.add(k);b.classList.toggle("off");render();};
  legend.appendChild(b);
});

$("#filterForm").addEventListener("submit",e=>{e.preventDefault();search(false);});
$("#moreBtn").addEventListener("click",()=>search(true));
$("#clearBtn").addEventListener("click",()=>{state.rows=[];state.nextToken=null;state.lastQuery=null;state.isGrid=false;render();setState("idle");$("#count").textContent="لم يبدأ البحث بعد";$("#stFound").textContent="0";updateApiCounter();});
$("#q").addEventListener("input",e=>{state.filter=e.target.value.trim();render();});
$("#csvBtn").addEventListener("click",exportCSV);
document.querySelectorAll("thead th[data-k]").forEach(th=>th.addEventListener("click",()=>{
  const k=th.dataset.k;
  if(state.sortK===k)state.sortDir*=-1;else{state.sortK=k;state.sortDir=1;}
  document.querySelectorAll("thead th").forEach(x=>x.classList.remove("sorted"));
  th.classList.add("sorted");th.querySelector(".arr").textContent=state.sortDir===1?"↑":"↓";
  render();
}));

async function search(append){
  if(state.loading)return;
  if(regionSel.value===""){toast("اختر المنطقة");regionSel.focus();return;}
  if(!typeSel.value){toast("اختر نوع النشاط");typeSel.focus();return;}

  const isFullSearch=citySel.value==="" || citySel.options[citySel.selectedIndex].text.startsWith("كل مدن");
  state.isGrid=isFullSearch;
  const action=isFullSearch?"grid":"search";
  const params=new URLSearchParams({action,region:regionSel.options[regionSel.selectedIndex].text,city:citySel.value||"",type:typeSel.value});
  if(append&&state.nextToken&&!isFullSearch)params.set("pageToken",state.nextToken);

  state.loading=true;setLoading(true);
  if(!append){state.rows=[];state.nextToken=null;setState("loading");}
  try{
    const r=await fetch("/api/search?"+params.toString());
    const data=await r.json();
    if(!r.ok)throw new Error(data.error||("خطأ "+r.status));
    const seen=new Set(state.rows.map(x=>x.id));
    (data.places||[]).forEach(p=>{if(!seen.has(p.id))state.rows.push(p);});
    state.nextToken=data.nextPageToken||null;
    state.apiCalls+=data.totalRequests||1;
    updateApiCounter();
    state.lastQuery={region:regionSel.options[regionSel.selectedIndex].text,city:citySel.value||"كل المدن",type:typeSel.value};
    saveRecent(state.lastQuery);
    render();
    setState(state.rows.length?null:"empty");
    $("#stFound").textContent=state.rows.length.toLocaleString("ar-SA");
    if(!append&&state.rows.length)$("#results").scrollIntoView({behavior:"smooth",block:"start"});
  }catch(err){setState("error",err.message);}
  finally{state.loading=false;setLoading(false);}
}

async function fetchDetails(id,row){
  if(row._loaded)return;
  row._loading=true;render();
  try{
    const r=await fetch(`/api/search?action=details&id=${id}`);
    const d=await r.json();
    if(r.ok){row.phone=d.phone||"";row.tel=d.tel||"";row.rating=d.rating??null;row.reviews=d.reviews??null;row._loaded=true;}
  }catch{}
  row._loading=false;render();
}

function setLoading(on){
  const b=$("#goBtn");b.disabled=on;
  b.innerHTML=on?'<span class="spin"></span><span>جاري السحب…</span>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><span>بحث</span>';
  $("#moreBtn").disabled=on;
}

function visibleRows(){
  let rows=state.rows.slice();
  if(state.filter){const f=state.filter.toLowerCase();rows=rows.filter(r=>(r.name+" "+r.phone+" "+r.address+" "+(r.url||"")).toLowerCase().includes(f));}
  if(state.hidden.size)rows=rows.filter(r=>!state.hidden.has(r.link||"none"));
  if(state.sortK){const k=state.sortK;rows.sort((a,b)=>{let x=a[k],y=b[k];if(k==="rating"){x=x??-1;y=y??-1;return(x-y)*state.sortDir;}return String(x||"").localeCompare(String(y||""),"ar")*state.sortDir;});}
  return rows;
}

function render(){
  const tb=$("#tbody");tb.innerHTML="";
  const rows=visibleRows();
  rows.forEach((r,i)=>{
    const tr=el("tr");tr.style.animationDelay=Math.min(i*25,400)+"ms";
    tr.appendChild(el("td","idx",String(i+1)));
    const badge=r.status==="OPERATIONAL"?'<span class="badge open">يعمل</span>':r.status==="CLOSED_TEMPORARILY"?'<span class="badge closed">مغلق مؤقتاً</span>':r.status==="CLOSED_PERMANENTLY"?'<span class="badge closed">مغلق نهائياً</span>':"";
    const tdN=el("td","name",`<span>${esc(r.name)}</span><span class="sub"><span class="cat">${esc(r.category||"")}</span>${badge}<span>${esc(shortAddr(r.address))}</span></span>`);tdN.dataset.l="المحل";tr.appendChild(tdN);

    // رقم الجوال + زر التفاصيل
    const tdP=el("td");tdP.dataset.l="الجوال";
    if(r.phone){
      const a=el("a","phone",ICON_PHONE+`<span>${esc(r.phone)}</span>`);a.href="tel:"+(r.tel||r.phone);
      const cp=el("button","copy",ICON_COPY);cp.title="نسخ الرقم";cp.onclick=()=>copy(r.phone);
      tdP.append(a,cp);
    } else if(r._loading){
      tdP.innerHTML='<span class="skel" style="width:120px"></span>';
    } else {
      const btn=el("button","btn btn-sm btn-ghost",'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="14" height="14"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> تفاصيل');
      btn.onclick=()=>fetchDetails(r.id,r);
      tdP.appendChild(btn);
    }
    tr.appendChild(tdP);

    // الحسابات
    const tdL=el("td");tdL.dataset.l="الحساب";const wrap=el("div","links");
    if(r.link&&KINDS[r.link]){const k=KINDS[r.link];const a=el("a","lnk "+r.link,k.icon+`<span>${k.label}</span>`);a.href=r.url;a.target="_blank";a.rel="noopener noreferrer";a.title=r.url;wrap.appendChild(a);const cp=el("button","copy",ICON_COPY);cp.title="نسخ الرابط";cp.onclick=()=>copy(r.url);wrap.appendChild(cp);}
    else wrap.appendChild(el("span","none","لا يوجد رابط مسجّل"));
    tdL.appendChild(wrap);tr.appendChild(tdL);

    // التقييم
    const tdR=el("td");tdR.dataset.l="التقييم";
    if(r._loading){tdR.innerHTML='<span class="skel" style="width:60px"></span>';}
    else if(r.rating!=null){tdR.innerHTML=`<span class="rate">${ICON_STAR} ${r.rating.toFixed(1)} <small>(${(r.reviews||0).toLocaleString("ar-SA")})</small></span>`;}
    else{tdR.innerHTML='<span class="none">—</span>';}
    tr.appendChild(tdR);

    // الخريطة
    const tdM=el("td");tdM.dataset.l="الخريطة";
    if(r.maps){const a=el("a","mapbtn",ICON_MAP);a.href=r.maps;a.target="_blank";a.rel="noopener";a.title="فتح في خرائط قوقل";tdM.appendChild(a);}else tdM.innerHTML='<span class="none">—</span>';
    tr.appendChild(tdM);
    tb.appendChild(tr);
  });
  const has=state.rows.length>0;
  $("#q").disabled=!has;$("#csvBtn").disabled=!has;$("#clearBtn").disabled=!has;
  $("#moreBox").hidden=!state.nextToken||state.isGrid;
  $("#count").innerHTML=has?`<b>${rows.length.toLocaleString("ar-SA")}</b> من ${state.rows.length.toLocaleString("ar-SA")} نتيجة${state.lastQuery?` · ${esc(state.lastQuery.type)} — ${esc(state.lastQuery.city)}`:""}${state.isGrid?` <span style="color:var(--teal)">· شبكة مربعات (${state.apiCalls} طلب)</span>`:state.nextToken?' <span style="color:var(--ink-3)">· توجد صفحات إضافية</span>':""}`:(state.lastQuery?"لا نتائج مطابقة":"لم يبدأ البحث بعد");
}

function updateApiCounter(){
  const pill=$("#apiPill");
  if(pill)pill.innerHTML=`<span class="dot"></span> ${state.apiCalls} طلب قوقل`;
}

function setState(kind,msg){
  const box=$("#stateBox");box.innerHTML="";if(!kind)return;
  if(kind==="loading"){const t=el("div","state");let h='<div style="display:grid;gap:12px;max-width:760px;margin:0 auto">';for(let i=0;i<6;i++)h+=`<div class="skel" style="width:${90-i*7}%"></div>`;t.innerHTML=h+'</div><p style="margin-top:16px">'+(state.isGrid?"جاري مسح المنطقة بشبكة مربعات…":"جاري سحب البيانات من خرائط قوقل…")+'</p>';box.appendChild(t);return;}
  if(kind==="idle"){box.appendChild(stateNode('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',"ابدأ بالبحث","اختر المنطقة ثم المدينة ثم نوع النشاط واضغط «بحث». ستظهر النتائج هنا في جدول قابل للفرز والتصفية والتصدير."));return;}
  if(kind==="empty"){box.appendChild(stateNode('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h10M4 17h7"/></svg>',"لا توجد نتائج","جرّب مدينة أخرى أو نشاطاً أوسع."));return;}
  if(kind==="error"){box.appendChild(stateNode('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 8v5m0 3h.01M10.3 3.9 2.6 17.4A2 2 0 0 0 4.3 20.4h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',"تعذّر جلب البيانات",esc(msg||""),true));}
}
function stateNode(icon,title,text,err){const d=el("div","state"+(err?" err":""));d.innerHTML=`<div class="ico">${icon}</div><h3>${title}</h3><p>${text}</p>`;return d;}
setState("idle");

function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function shortAddr(a){if(!a)return"";return a.replace(/،?\s*السعودية\s*$/,"").split("،").slice(-2).join("،").trim();}
function copy(t){navigator.clipboard?.writeText(t).then(()=>toast("تم النسخ ✓")).catch(()=>toast("تعذّر النسخ"));}
let toastT;function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove("show"),1800);}

function exportCSV(){
  const rows=visibleRows();
  const head=["اسم المحل","رقم الجوال","نوع الرابط","الرابط","التصنيف","التقييم","عدد التقييمات","العنوان","رابط الخريطة"];
  const lines=[head.join(",")];
  rows.forEach(r=>lines.push([r.name,r.phone,r.link?KINDS[r.link].label:"",r.url,r.category,r.rating??"",r.reviews??"",r.address,r.maps].map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")));
  const blob=new Blob(["\uFEFF"+lines.join("\r\n")],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);
  a.download=`checker-${(state.lastQuery?.city||"results")}-${(state.lastQuery?.type||"")}.csv`.replace(/\s+/g,"-");
  a.click();URL.revokeObjectURL(a.href);toast("تم تنزيل الملف ✓");
}

function saveRecent(q){try{const list=JSON.parse(localStorage.getItem("checker_recent")||"[]").filter(x=>!(x.region===q.region&&x.city===q.city&&x.type===q.type));list.unshift(q);localStorage.setItem("checker_recent",JSON.stringify(list.slice(0,5)));drawRecent();}catch{}}
function drawRecent(){
  let list=[];try{list=JSON.parse(localStorage.getItem("checker_recent")||"[]");}catch{}
  const box=$("#recent");box.hidden=!list.length;box.querySelectorAll(".chip").forEach(c=>c.remove());
  list.forEach(q=>{const b=el("button","chip",`${q.type} · ${q.city}`);b.type="button";
    b.onclick=()=>{const ri=KSA.findIndex(([n])=>n===q.region);if(ri>=0){regionSel.value=ri;regionSel.dispatchEvent(new Event("change"));citySel.value=q.city==="كل مدن"?"":q.city;}typeSel.value=q.type;syncChips();search(false);};
    box.appendChild(b);});
}
drawRecent();

const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}}),{threshold:.12});
document.querySelectorAll(".reveal").forEach(n=>io.observe(n));
document.querySelectorAll(".nav a").forEach(a=>a.addEventListener("click",()=>{document.querySelectorAll(".nav a").forEach(x=>x.classList.remove("active"));a.classList.add("active");}));
