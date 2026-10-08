/* =========================================================
   KB Bedachungen – script.js (Vanilla JS, keine Frameworks)
   ========================================================= */
(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.add("js");

/* ---------- Öffnungszeiten (exakt laut Vorgabe) ----------
   0 = Sonntag … 6 = Samstag, null = geschlossen */
const HOURS={1:["07:00","18:00"],2:["07:00","18:00"],3:["07:00","18:00"],4:["07:00","18:00"],5:["07:00","18:00"],6:null,0:null};
const DAYS=["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],ORDER=[1,2,3,4,5,6,0];

/* ---------- Toast ---------- */
let tt;function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("show"),2600)}

/* ---------- Logo-Intro ---------- */
const intro=$("#intro"),hero=$("#hero");
$$(".kb-l",intro).forEach((l,i)=>l.style.animationDelay=(1.4+i*.05)+"s");
document.body.classList.add("locked");
let introDone=false;
function endIntro(){if(introDone)return;introDone=true;intro.classList.add("out");document.body.classList.remove("locked");setTimeout(()=>hero.classList.add("go"),250)}
requestAnimationFrame(()=>intro.classList.add("play"));
setTimeout(endIntro,reduce?300:3300);
intro.addEventListener("click",endIntro);

/* ---------- Hinweis, Menü, Impressum, Modal ---------- */
$("#pnote button").addEventListener("click",()=>$("#pnote").remove());
const header=$("#top"),burger=$(".burger");
burger.addEventListener("click",()=>{const o=header.classList.toggle("menu-open");burger.setAttribute("aria-expanded",o)});
$$("#menu a").forEach(a=>a.addEventListener("click",()=>{header.classList.remove("menu-open");burger.setAttribute("aria-expanded",false)}));
const sheet=$("#sheet"),modal=$("#modal");
function openSheet(w){$("#sheet-impressum").hidden=w!=="impressum";$("#sheet-datenschutz").hidden=w!=="datenschutz";sheet.classList.add("open");document.body.classList.add("locked");$(".x",sheet).focus()}
function closeAll(){sheet.classList.remove("open");modal.classList.remove("open");document.body.classList.remove("locked")}
$$("[data-open]").forEach(b=>b.addEventListener("click",()=>openSheet(b.dataset.open)));
$(".x",sheet).addEventListener("click",closeAll);
sheet.addEventListener("click",e=>{if(e.target===sheet)closeAll()});
modal.addEventListener("click",e=>{if(e.target===modal)closeAll()});
$("#mClose").addEventListener("click",closeAll);
addEventListener("keydown",e=>{if(e.key==="Escape")closeAll()});
if(location.hash==="#impressum")openSheet("impressum");
$(".fab .up").addEventListener("click",()=>scrollTo({top:0,behavior:reduce?"auto":"smooth"}));
$("#yr").textContent=new Date().getFullYear();

/* =========================================================
   SVG-Illustrationen (Vorschau-Bilder)
   ========================================================= */
let uid=0;
const SKY={day:["#7fb6e6","#cfe6f7","#f3d9a4"],dusk:["#2a3550","#c4566a","#f6b26b"],evening:["#1b2340","#4a3f6b","#e08a5b"],grey:["#8a98a8","#c9d2da","#e8ebee"],morning:["#9cc7e8","#f2d2c0","#fbe7c6"],storm:["#4d5662","#7d8692","#a9adb2"]};
function patterns(id){
  return `<pattern id="tile${id}" width="24" height="28" patternUnits="userSpaceOnUse"><rect width="24" height="28" fill="#8e1a14"/><path d="M0 0H24V10C24 13 19 14 12 14S0 13 0 10Z" fill="#c8402c"/><path d="M0 9.5C0 13 5 14 12 14S24 13 24 9.5" fill="none" stroke="#7a130f" stroke-width="1.4"/><path d="M-12 14H12V24C12 27 7 28 0 28S-12 27-12 24Z" fill="#b8352a"/><path d="M12 14H36V24C36 27 31 28 24 28S12 27 12 24Z" fill="#b8352a"/><path d="M-12 23.5C-12 27-7 28 0 28S12 27 12 23.5M12 23.5C12 27 17 28 24 28S36 27 36 23.5" fill="none" stroke="#7a130f" stroke-width="1.4"/></pattern>
  <pattern id="old${id}" width="24" height="28" patternUnits="userSpaceOnUse"><rect width="24" height="28" fill="#4a3a30"/><path d="M0 0H24V10C24 13 19 14 12 14S0 13 0 10Z" fill="#7d5a48"/><path d="M-12 14H12V24C12 27 7 28 0 28S-12 27-12 24Z" fill="#6f6550"/><path d="M12 14H36V24C36 27 31 28 24 28S12 27 12 24Z" fill="#76604c"/><circle cx="6" cy="6" r="3" fill="#6d7a3f" opacity=".7"/><circle cx="18" cy="20" r="2.5" fill="#6d7a3f" opacity=".6"/></pattern>
  <pattern id="anth${id}" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#2c2f33"/><rect x="1" y="1" width="22" height="10" rx="1.5" fill="#43474d"/><rect x="-11" y="13" width="22" height="10" rx="1.5" fill="#3b3f45"/><rect x="13" y="13" width="22" height="10" rx="1.5" fill="#3b3f45"/></pattern>
  <pattern id="slate${id}" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#2a2d33"/><path d="M0 0H20V8L10 11L0 8Z" fill="#4b5563"/><path d="M-10 10H10V18L0 21L-10 18ZM10 10H30V18L20 21L10 18Z" fill="#3f4753"/></pattern>
  <pattern id="batten${id}" width="40" height="16" patternUnits="userSpaceOnUse"><rect width="40" height="16" fill="#d9c7a3"/><rect y="9" width="40" height="5" fill="#a87b45"/><rect x="18" width="4" height="16" fill="#8a6234" opacity=".55"/></pattern>
  <pattern id="gravel${id}" width="12" height="8" patternUnits="userSpaceOnUse"><rect width="12" height="8" fill="#9a9690"/><circle cx="3" cy="3" r="1.4" fill="#b8b3ab"/><circle cx="9" cy="6" r="1.2" fill="#7f7b75"/></pattern>`;
}
function skyBlock(id,sky){const [a,b,c]=SKY[sky];return `<linearGradient id="sky${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".6" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient><radialGradient id="sun${id}"><stop offset="0" stop-color="#fff6d8"/><stop offset=".4" stop-color="#ffd27a" stop-opacity=".9"/><stop offset="1" stop-color="#ffb35a" stop-opacity="0"/></radialGradient>`}
function clouds(w,h,n,op){let s="";for(let i=0;i<n;i++){const x=(i*277+60)%w,y=40+(i*53)%(h*.3),r=30+(i*17)%40;s+=`<g opacity="${op}" fill="#fff"><ellipse cx="${x}" cy="${y}" rx="${r*1.8}" ry="${r*.45}"/><ellipse cx="${x+r*.5}" cy="${y-r*.25}" rx="${r}" ry="${r*.45}"/></g>`}return s}
function farRow(w,base,color,seed){let s="",x=-20,i=seed;while(x<w+40){const bw=60+(i*37)%70,bh=40+(i*23)%50,rh=24+(i*13)%26;s+=`<path d="M${x} ${base}V${base-bh}L${x+bw/2} ${base-bh-rh}L${x+bw} ${base-bh}V${base}Z" fill="${color}"/>`;if(i%3===0)s+=`<rect x="${x+bw*.68}" y="${base-bh-rh+4}" width="8" height="${rh*.7}" fill="${color}"/>`;x+=bw+4;i++}return s}
function trees(xs,base,c){return xs.map(([x,r])=>`<rect x="${x-3}" y="${base-r*1.3}" width="6" height="${r*1.3}" fill="#4a3a2c"/><circle cx="${x}" cy="${base-r*1.5}" r="${r}" fill="${c}"/><circle cx="${x-r*.5}" cy="${base-r*1.2}" r="${r*.7}" fill="${c}"/>`).join("")}
/* Haus in 2.5D: Traufseite mit Dachfläche, rechts der Giebel */
function house(id,o){
  const {x,y,w,h,d,rh,roof="tile",wall="#efe6da",wallSide="#d9cbb8",chimney=true,winRows=2,skylights=0,scaffold=false,half=false,dormer=false,roofer=false,damage=false}=o;
  const ax=x+w+d/2, ay=y-rh, t=10/rh, ex=x+w-t*d/2, ey=y+10, lx=x-14, ly=ey, rx=lx+(ax-ex), ry=ay;
  const plane=`${lx},${ly} ${ex},${ey} ${ax},${ay} ${rx},${ry}`;
  let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${wall}"/><path d="M${x+w} ${y+h}V${y}L${ax} ${ay}L${x+w+d} ${y}V${y+h}Z" fill="${wallSide}"/>`;
  const cols=Math.max(2,Math.round(w/70));
  for(let r=0;r<winRows;r++)for(let c=0;c<cols;c++){
    const ww=Math.min(34,w/cols*.45),wh=ww*1.25,wx=x+(c+.5)*(w/cols)-ww/2,wy=y+20+r*(h/winRows);
    if(r===winRows-1&&c===Math.floor(cols/2)){s+=`<rect x="${wx-2}" y="${y+h-wh*1.6}" width="${ww+4}" height="${wh*1.6}" fill="#5b3a26"/><circle cx="${wx+ww-4}" cy="${y+h-wh*.8}" r="2" fill="#e6c27a"/>`;continue}
    s+=`<rect x="${wx-3}" y="${wy-3}" width="${ww+6}" height="${wh+6}" fill="#fff"/><rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="#3d5a73"/><path d="M${wx} ${wy+wh*.45}H${wx+ww}M${wx+ww/2} ${wy}V${wy+wh}" stroke="#fff" stroke-width="2"/>`;
  }
  s+=`<rect x="${ax-12}" y="${y+18}" width="24" height="30" fill="#fff"/><rect x="${ax-9}" y="${y+21}" width="18" height="24" fill="#3d5a73"/>`;
  if(chimney&&!half){const cx=rx+(ex-lx)*.72;s+=`<rect x="${cx}" y="${ay-26}" width="20" height="${rh*.55+26}" fill="#8b4a3c"/><rect x="${cx-3}" y="${ay-30}" width="26" height="6" fill="#5e2f25"/>`}
  if(half){
    s+=`<polygon points="${plane}" fill="url(#batten${id})"/>`;
    const mx=lx+(ex-lx)*.55, mrx=rx+(ex-lx)*.55;
    s+=`<polygon points="${mx},${ly} ${ex},${ey} ${ax},${ay} ${mrx},${ry}" fill="url(#tile${id})"/><path d="M${mx} ${ly}L${mrx} ${ry}" stroke="#5e130f" stroke-width="2"/>`;
  } else s+=`<polygon points="${plane}" fill="url(#${roof}${id})"/>`;
  if(damage){[[.3,.4],[.55,.6],[.7,.3],[.42,.75]].forEach(([fx,fy])=>{const px=lx+(ex-lx)*fx+(rx-lx)*fy,py=ly-(ly-ay)*fy;s+=`<rect x="${px}" y="${py}" width="26" height="16" fill="#2a1d16"/><rect x="${px+3}" y="${py+9}" width="20" height="4" fill="#a87b45"/>`})}
  s+=`<path d="M${lx} ${ly}L${ex} ${ey}" stroke="rgba(0,0,0,.35)" stroke-width="4"/><path d="M${rx} ${ry}L${ax} ${ay}" stroke="#5e130f" stroke-width="6" stroke-linecap="round"/><path d="M${ex} ${ey}L${ax} ${ay}L${x+w+d+10} ${ey}" fill="none" stroke="#3a2a26" stroke-width="7" stroke-linejoin="round"/>`;
  s+=`<path d="M${lx-4} ${ly+4}H${ex+2}" stroke="${damage?"#6b6f73":"#9aa3ab"}" stroke-width="5" stroke-linecap="round"/><path d="M${x+6} ${ly+4}V${y+h}" stroke="#9aa3ab" stroke-width="4"/>`;
  for(let i=0;i<skylights;i++){const f=.25+i*.3,px=lx+(ex-lx)*f,py=ly-(ly-ay)*.35,k=(ax-ex)/(ay-ey),hg=34,wd=26;s+=`<polygon points="${px},${py} ${px+wd},${py} ${px+wd+k*-hg},${py-hg} ${px+k*-hg},${py-hg}" fill="#1e2a36" stroke="#3a3f45" stroke-width="3"/>`}
  if(dormer){const px=lx+(ex-lx)*.35,py=ly-(ly-ay)*.25;s+=`<rect x="${px}" y="${py-50}" width="60" height="50" fill="${wall}"/><path d="M${px-8} ${py-48}L${px+30} ${py-78}L${px+68} ${py-48}Z" fill="url(#${roof}${id})" stroke="#3a2a26" stroke-width="4"/><rect x="${px+15}" y="${py-40}" width="30" height="32" fill="#3d5a73" stroke="#fff" stroke-width="3"/>`}
  if(scaffold){let g="";const top=ey-6;for(let i=0;i<=cols*2;i++){const sx=x-20+i*((w+30)/(cols*2));g+=`<path d="M${sx} ${y+h+4}V${top}" stroke="#c9ced3" stroke-width="3"/>`}for(let j=0;j<3;j++){const sy=y+h-j*(h/2.2);g+=`<rect x="${x-24}" y="${sy-6}" width="${w+34}" height="6" fill="#c08a3e"/><path d="M${x-24} ${sy-18}H${x+w+10}" stroke="#e3342b" stroke-width="2"/>`}s+=g}
  if(roofer){const px=lx+(ex-lx)*.5,py=ly-(ly-ay)*.55;s+=`<g><rect x="${px-6}" y="${py-30}" width="12" height="22" rx="4" fill="#2b2829"/><rect x="${px-5}" y="${py-30}" width="10" height="9" fill="#d98b4d"/><path d="M${px-4} ${py-8}L${px-8} ${py+4}M${px+4} ${py-8}L${px+9} ${py+3}" stroke="#2b2829" stroke-width="4" stroke-linecap="round"/><path d="M${px+5} ${py-24}L${px+16} ${py-16}" stroke="#2b2829" stroke-width="3.5" stroke-linecap="round"/><circle cx="${px}" cy="${py-36}" r="6" fill="#e9b892"/><path d="M${px-7} ${py-37}A7 7 0 0 1 ${px+7} ${py-37}Z" fill="#f3c623"/></g>`}
  return s;
}
function flatHouse(id,o){
  const {x,y,w,h,d=70}=o;let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f2f0ec"/><path d="M${x+w} ${y}L${x+w+d} ${y-28}V${y+h-28}L${x+w} ${y+h}Z" fill="#d6d2cb"/><path d="M${x} ${y}L${x+d} ${y-28}H${x+w+d}L${x+w} ${y}Z" fill="url(#gravel${id})"/><path d="M${x-4} ${y}H${x+w}L${x+w+d+4} ${y-30}" fill="none" stroke="#3a3f45" stroke-width="7"/>`;
  [.3,.62].forEach(f=>{const cx=x+w*f+14,cy=y-12;s+=`<ellipse cx="${cx}" cy="${cy}" rx="22" ry="7" fill="#c9d6df"/><path d="M${cx-18} ${cy}A18 14 0 0 1 ${cx+18} ${cy}Z" fill="#dfeaf2" stroke="#a9b6c0" stroke-width="2"/>`});
  return s+`<rect x="${x+w*.08}" y="${y+28}" width="${w*.5}" height="${h*.42}" fill="#3d5a73"/><path d="M${x+w*.33} ${y+28}V${y+28+h*.42}" stroke="#2b2829" stroke-width="3"/><rect x="${x+w*.68}" y="${y+28}" width="${w*.22}" height="${h-28}" fill="#4a3528"/><rect x="${x}" y="${y+h-10}" width="${w}" height="10" fill="#393536"/>`;
}
function scene(kind){
  const id=++uid,W=800,H=500;
  const cfg={tile:{sky:"day",g:"#7ea35c"},flat:{sky:"evening",g:"#4f6b46"},slate:{sky:"grey",g:"#6f8a5a"},window:{sky:"morning",g:"#86a965"},reno:{sky:"dusk",g:"#5a7349"},old:{sky:"storm",g:"#5f6d4c"},new:{sky:"day",g:"#7ea35c"}}[kind];
  const warm=kind==="flat"||kind==="reno";
  let s=`<svg class="scene" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${skyBlock(id,cfg.sky)}${patterns(id)}</defs><rect width="${W}" height="${H}" fill="url(#sky${id})"/>`;
  if(kind!=="old")s+=`<circle cx="${warm?620:150}" cy="${warm?330:110}" r="110" fill="url(#sun${id})"/>`;
  s+=clouds(W,H,4,kind==="old"?.9:.5)+farRow(W,400,"rgba(40,45,60,.25)",3)+`<path d="M0 410Q200 380 400 405T800 395V500H0Z" fill="${cfg.g}"/>`+trees([[70,26],[720,32],[760,22]],420,"#3f6b3a");
  const base={x:180,y:260,w:330,h:170,d:150,rh:130};
  if(kind==="flat")s+=flatHouse(id,{x:220,y:240,w:330,h:190});
  else if(kind==="old")s+=house(id,{...base,roof:"old",wall:"#d8d0c2",wallSide:"#bfb3a0",damage:true});
  else if(kind==="new")s+=house(id,{...base,roof:"tile"});
  else s+=house(id,{...base,roof:kind==="slate"?"slate":kind==="window"?"anth":"tile",wall:kind==="slate"?"#e8e2d6":kind==="window"?"#f4f1ec":"#efe6da",wallSide:kind==="slate"?"#cfc6b5":"#d9cbb8",skylights:kind==="window"?2:0,dormer:kind==="slate",scaffold:kind==="reno",half:kind==="reno",roofer:kind==="reno"||kind==="tile",chimney:kind!=="window"});
  return s+`<path d="M0 470Q400 440 800 470V500H0Z" fill="rgba(0,0,0,.12)"/></svg>`;
}
function heroLayers(){
  const id=++uid,W=600,H=620;
  $("#lSky").innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>${skyBlock(id,"dusk")}</defs><rect width="${W}" height="${H}" fill="url(#sky${id})"/><circle cx="420" cy="380" r="170" fill="url(#sun${id})"/>${clouds(W,H,4,.35)}</svg>`;
  $("#lFar").innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${farRow(W,520,"#5b3a52",1)}${farRow(W,560,"#3d2a40",5)}</svg>`;
  const id2=++uid;
  $("#lNear").innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>${patterns(id2)}</defs><path d="M0 560Q300 530 600 555V620H0Z" fill="#2b2433"/>${house(id2,{x:110,y:380,w:260,h:180,d:130,rh:120,roof:"tile",wall:"#f1e2d2",wallSide:"#d7bfa8",roofer:true})}${trees([[540,30],[60,24]],575,"#2f3b2e")}</svg>`;
}
heroLayers();

/* ---------- Leistungen (SVG-Icons) ---------- */
const SVC=[
  ["Steildach & Neueindeckung","Eindeckung mit Ziegeln oder Dachsteinen, inklusive Lattung und Unterdeckbahn.",'<path d="M3 20L12 4l9 16"/><path d="M6.5 14h11M8.8 10h6.4"/>'],
  ["Flachdach & Abdichtung","Abdichtung von Flachdächern, Garagen und Anbauten, zum Beispiel mit Bitumen oder EPDM.",'<path d="M3 10h18v9H3z"/><path d="M3 10l3-3h12l3 3"/><path d="M7 14h10"/>'],
  ["Dachsanierung & Dämmung","Sanierung älterer Dächer und Verbesserung der Dämmung nach Absprache.",'<path d="M3 12l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M8 20v-5c0-1 1-2 2-2s2 1 2 2 1 2 2 2 2-1 2-2"/>'],
  ["Dachfenster","Einbau und Austausch von Dachfenstern für mehr Licht unterm Dach.",'<path d="M4 20L10 4h10l-6 16z"/><path d="M7 12h10M12 4l-3 16"/>'],
  ["Dachrinnen & Klempnerarbeiten","Dachrinnen, Fallrohre und Anschlüsse erneuern oder reparieren.",'<path d="M3 6h18"/><path d="M4 6c0 3 2 5 5 5h6c3 0 5-2 5-5"/><path d="M17 11v9"/>'],
  ["Reparatur & Sturmschäden","Verrutschte Ziegel, undichte Stellen oder Schäden nach einem Unwetter.",'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5z"/>']
];
$("#services").innerHTML=SVC.map(([t,p,ico],i)=>`<article class="svc" data-reveal style="--d:${(i%3)*.1}s"><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ico}</svg></div><h3>${t}</h3><p>${p}</p></article>`).join("");

/* ---------- Referenzen + Vorher/Nachher ---------- */
const REFS=[["tile","Neueindeckung Satteldach","Steildach","Neue Tondachziegel mit neuer Lattung."],["flat","Flachdach mit Lichtkuppeln","Flachdach","Abdichtung mit Kiesauflage."],["slate","Dach mit Gaube","Altbau","Eindeckung inklusive Gaube."],["window","Dachfenster-Einbau","Dachfenster","Zwei neue Wohndachfenster."]];
const cards=REFS.map(([k,t,m,p],i)=>`<figure class="ref" tabindex="0" data-reveal style="--d:${(i%3)*.1}s">${scene(k)}<span class="tag-ill">Illustration</span><figcaption><span>${m}</span><b>${t}</b><p>${p}</p></figcaption></figure>`);
cards.splice(3,0,`<figure class="ref ba" data-reveal style="--d:.1s"><div class="pane before">${scene("old")}</div><div class="pane after">${scene("new")}</div><span class="lbl l">Vorher</span><span class="lbl r">Nachher</span><div class="handle"></div><input type="range" min="0" max="100" value="50" aria-label="Vorher/Nachher vergleichen"><figcaption><span>Vorher / Nachher</span><b>Dachsanierung</b></figcaption></figure>`);
$("#refs").innerHTML=cards.join("");
const ba=$(".ba"),baIn=$(".ba input");
baIn.addEventListener("input",()=>ba.style.setProperty("--pos",baIn.value+"%"));

/* ---------- Öffnungszeiten ---------- */
function berlinNow(){
  try{const p=new Intl.DateTimeFormat("de-DE",{timeZone:"Europe/Berlin",weekday:"short",hour:"2-digit",minute:"2-digit",hour12:false}).formatToParts(new Date());
    const wd={"So.":0,"Mo.":1,"Di.":2,"Mi.":3,"Do.":4,"Fr.":5,"Sa.":6}[p.find(x=>x.type==="weekday").value];
    const h=+p.find(x=>x.type==="hour").value%24,m=+p.find(x=>x.type==="minute").value;
    if(wd!==undefined)return{day:wd,min:h*60+m}}catch(e){}
  const d=new Date();return{day:d.getDay(),min:d.getHours()*60+d.getMinutes()};
}
const toMin=s=>{const[a,b]=s.split(":");return a*60+ +b};
function renderHours(){
  const now=berlinNow();
  $("#hoursTable").innerHTML=ORDER.map((d,i)=>{const h=HOURS[d];return `<div class="row${d===now.day?" today":""}" style="--i:${i}"><span class="d">${DAYS[d]}</span><span>${h?`${h[0]}–${h[1]}`:'<span class="closed">Geschlossen</span>'}</span></div>`}).join("");
  const today=HOURS[now.day],open=!!(today&&now.min>=toMin(today[0])&&now.min<toMin(today[1]));let text;
  if(open)text=`Jetzt geöffnet · bis ${today[1]} Uhr`;
  else{let next="";for(let i=0;i<8;i++){const d=(now.day+i)%7,h=HOURS[d];if(h&&(i>0||now.min<toMin(h[0]))){next=(i===0?"heute":i===1?"morgen":DAYS[d])+" ab "+h[0]+" Uhr";break}}text="Gerade geschlossen"+(next?" · wieder "+next:"")}
  $("#stText").textContent=text;$("#stDot").classList.toggle("closed",!open);
  $("#heroStatus").textContent=open?"Jetzt geöffnet":"Gerade geschlossen";$("#heroDot").classList.toggle("closed",!open);
}
renderHours();setInterval(renderHours,60000);

/* ---------- Termin-Formular (Vorschau: Fake-Submit) ---------- */
const form=$("#bookForm");
$("#f-date").min=new Date().toISOString().slice(0,10);
form.addEventListener("submit",e=>{
  e.preventDefault();
  const name=$("#f-name"),tel=$("#f-tel"),mail=$("#f-mail");
  [name,tel,mail].forEach(x=>x.classList.remove("err"));
  if(!name.value.trim()){name.classList.add("err");name.focus();toast("Bitte geben Sie Ihren Namen an.");return}
  if(!tel.value.trim()&&!mail.value.trim()){tel.classList.add("err");mail.classList.add("err");tel.focus();toast("Bitte Telefon oder E-Mail angeben.");return}
  if(mail.value.trim()&&!/^\S+@\S+\.\S+$/.test(mail.value.trim())){mail.classList.add("err");mail.focus();toast("Bitte eine gültige E-Mail-Adresse angeben.");return}
  modal.classList.add("open");document.body.classList.add("locked");$("#mClose").focus();
  form.reset();
});

/* ---------- FAQ (Accordion) ---------- */
const FAQ=[
  ["Kommen Sie für eine Besichtigung vorbei?","Ja. Rufen Sie an oder schicken Sie eine Anfrage, dann vereinbaren wir einen Termin bei Ihnen vor Ort."],
  ["In welcher Region sind Sie tätig?","Wir sind in Ichenhausen und Umgebung für Sie unterwegs. Fragen Sie gerne nach, ob Ihr Ort dazugehört."],
  ["Wie schnell bekomme ich ein Angebot?","Nach der Besichtigung erstellen wir Ihnen ein schriftliches Angebot. Wie lange das dauert, besprechen wir direkt beim Termin."],
  ["Was soll ich bei einem Sturmschaden tun?","Bringen Sie sich nicht selbst in Gefahr und steigen Sie nicht aufs Dach. Machen Sie wenn möglich Fotos vom Boden aus und rufen Sie uns an: 0162 1546717."],
  ["Kann ich Fotos per WhatsApp schicken?","Ja, Fotos vom Dach helfen uns bei einer ersten Einschätzung. Schicken Sie sie einfach per WhatsApp."],
  ["Wann sind Sie erreichbar?","Montag bis Freitag von 07:00 bis 18:00 Uhr. Samstag und Sonntag ist geschlossen."]
];
$("#faqList").innerHTML=FAQ.map(([q,a],i)=>`<div class="qa" data-reveal style="--d:${i*.06}s"><button type="button" aria-expanded="false" aria-controls="qa${i}" id="qb${i}">${q}<span class="pm" aria-hidden="true"></span></button><div class="a" id="qa${i}" role="region" aria-labelledby="qb${i}"><div><p>${a}</p></div></div></div>`).join("");
$$(".qa button").forEach(b=>b.addEventListener("click",()=>{
  const qa=b.parentNode,open=!qa.classList.contains("open");
  $$(".qa.open").forEach(o=>{o.classList.remove("open");$("button",o).setAttribute("aria-expanded",false)});
  if(open){qa.classList.add("open");b.setAttribute("aria-expanded",true)}
}));

/* =========================================================
   Scroll-Effekte (IntersectionObserver + Parallax)
   ========================================================= */
const io="IntersectionObserver" in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.12,rootMargin:"0px 0px -6% 0px"}):null;
$$("[data-reveal]").forEach(el=>io?io.observe(el):el.classList.add("in"));

let ticking=false;
const prog=$("#progress"),fab=$("#fab"),layers=$$("#heroArt .layer"),bgLayers=$$(".hero-bg .lines");
const navLinks=$$("#menu a"),secs=navLinks.map(a=>$(a.getAttribute("href")));
function onScroll(){
  const y=scrollY,max=document.documentElement.scrollHeight-innerHeight;
  prog.style.transform=`scaleX(${max>0?y/max:0})`;
  header.classList.toggle("scrolled",y>20);
  fab.classList.toggle("show",y>innerHeight*.6);
  if(!reduce&&y<innerHeight*1.5){
    layers.forEach(l=>l.style.transform=`translate3d(0,${y*+l.dataset.depth}px,0)`);
    bgLayers.forEach(l=>l.style.transform=`translate3d(0,${y*+l.dataset.depth}px,0)`);
  }
  let cur=-1;secs.forEach((s,i)=>{if(s&&s.getBoundingClientRect().top<innerHeight*.4)cur=i});navLinks.forEach((a,i)=>a.classList.toggle("active",i===cur));
  ticking=false;
}
addEventListener("scroll",()=>{if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});
onScroll();

/* Maus-Parallax im Hero */
if(!reduce&&matchMedia("(hover:hover)").matches){
  hero.addEventListener("mousemove",e=>{const dx=e.clientX/innerWidth-.5,dy=e.clientY/innerHeight-.5;
    layers.forEach(l=>{const k=+l.dataset.depth*120;l.style.translate=`${-dx*k}px ${-dy*k*.5}px`});
    bgLayers.forEach(l=>{const k=+l.dataset.depth*80;l.style.translate=`${dx*k}px ${dy*k}px`})});
}

/* ---------- Partikel im Hero (Canvas) ---------- */
const cv=$("#particles");
if(cv&&cv.getContext&&!reduce){
  const ctx=cv.getContext("2d");let W=0,H=0,dpr=Math.min(2,devicePixelRatio||1),pts=[],running=true;
  function size(){W=cv.offsetWidth;H=cv.offsetHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    pts=Array.from({length:Math.round(W*H/22000)},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.6+.4,vy:-(Math.random()*.25+.05),vx:(Math.random()-.5)*.15,a:Math.random()*.5+.15}))}
  size();addEventListener("resize",size);
  new IntersectionObserver(es=>running=es[0].isIntersecting).observe(cv);
  (function tick(){if(running){ctx.clearRect(0,0,W,H);for(const p of pts){p.x+=p.vx;p.y+=p.vy;if(p.y<-5){p.y=H+5;p.x=Math.random()*W}ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.283);ctx.fillStyle=`rgba(217,139,77,${p.a})`;ctx.fill()}}requestAnimationFrame(tick)})();
}
})();
