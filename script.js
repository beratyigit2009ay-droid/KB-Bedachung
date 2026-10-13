/* =========================================================
   KB Bedachungen – script.js (Vanilla JS, keine Frameworks)
   ========================================================= */
(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
/* Handy: ruhigere Version ohne Parallax und Partikel */
const calm=()=>matchMedia("(max-width: 860px)").matches;
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
  return `<pattern id="foil${id}" width="44" height="10" patternUnits="userSpaceOnUse"><rect width="44" height="10" fill="#4b5157"/><rect width="2" height="10" fill="#5d646b"/><rect x="2" width="1" height="10" fill="#3a3f44"/></pattern>
  <pattern id="foilL${id}" width="44" height="10" patternUnits="userSpaceOnUse"><rect width="44" height="10" fill="#c9ced2"/><rect width="2" height="10" fill="#e3e6e9"/><rect x="2" width="1" height="10" fill="#aab1b7"/></pattern>
  <pattern id="old${id}" width="30" height="16" patternUnits="userSpaceOnUse"><rect width="30" height="16" fill="#3b3430"/><path d="M2 5l6 2 5-3M16 12l5-2 6 3" stroke="#22201e" stroke-width="1.2" fill="none"/><circle cx="24" cy="4" r="2.2" fill="#5e6b3a" opacity=".7"/><circle cx="8" cy="12" r="1.6" fill="#5e6b3a" opacity=".6"/></pattern>
  <pattern id="gravel${id}" width="12" height="8" patternUnits="userSpaceOnUse"><rect width="12" height="8" fill="#9a9690"/><circle cx="3" cy="3" r="1.4" fill="#b8b3ab"/><circle cx="9" cy="6" r="1.2" fill="#7f7b75"/></pattern>
  <pattern id="deck${id}" width="16" height="8" patternUnits="userSpaceOnUse"><rect width="16" height="8" fill="#a8774a"/><rect y="6" width="16" height="2" fill="#7d5532"/></pattern>`;
}
function skyBlock(id,sky){const [a,b,c]=SKY[sky];return `<linearGradient id="sky${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".6" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient><radialGradient id="sun${id}"><stop offset="0" stop-color="#fff6d8"/><stop offset=".4" stop-color="#ffd27a" stop-opacity=".9"/><stop offset="1" stop-color="#ffb35a" stop-opacity="0"/></radialGradient>`}
function clouds(w,h,n,op){let s="";for(let i=0;i<n;i++){const x=(i*277+60)%w,y=40+(i*53)%(h*.3),r=30+(i*17)%40;s+=`<g opacity="${op}" fill="#fff"><ellipse cx="${x}" cy="${y}" rx="${r*1.8}" ry="${r*.45}"/><ellipse cx="${x+r*.5}" cy="${y-r*.25}" rx="${r}" ry="${r*.45}"/></g>`}return s}
/* Silhouetten im Hintergrund: flache Baukörper */
function farRow(w,base,color,seed){let s="",x=-20,i=seed;while(x<w+40){const bw=60+(i*37)%80,bh=40+(i*23)%70;s+=`<rect x="${x}" y="${base-bh}" width="${bw}" height="${bh}" fill="${color}"/>`;if(i%2===0)s+=`<rect x="${x+bw*.2}" y="${base-bh-14}" width="${bw*.5}" height="14" fill="${color}"/>`;x+=bw+6;i++}return s}
function trees(xs,base,c){return xs.map(([x,r])=>`<rect x="${x-3}" y="${base-r*1.3}" width="6" height="${r*1.3}" fill="#4a3a2c"/><circle cx="${x}" cy="${base-r*1.5}" r="${r}" fill="${c}"/><circle cx="${x-r*.5}" cy="${base-r*1.2}" r="${r*.7}" fill="${c}"/>`).join("")}
/* Baukörper mit Flachdach in 2.5D: Front, rechte Seite, sichtbare Dachfläche */
function box(id,o){
  const {x,y,w,h,d=70,dy=28,roof="foil",wall="#f2f0ec",side="#d6d2cb",win=true,door=false,garage=false,domes=0,roofer=false,puddles=false,railing=false,deck=false,outlet=true}=o;
  const top=`${x},${y} ${x+w},${y} ${x+w+d},${y-dy} ${x+d},${y-dy}`;
  let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${wall}"/><path d="M${x+w} ${y}L${x+w+d} ${y-dy}V${y+h-dy}L${x+w} ${y+h}Z" fill="${side}"/>`;
  s+=`<polygon points="${top}" fill="url(#${roof}${id})"/>`;
  if(roof==="foil"||roof==="foilL"){for(let t=0;t<=1.0001;t+=.125){const px=x+t*w;s+=`<path d="M${px} ${y}L${px+d} ${y-dy}" stroke="${roof==="foil"?"#5f666d":"#e8ebee"}" stroke-width="1.4"/>`}}
  if(deck){const f=.45;s+=`<polygon points="${x+w*f},${y} ${x+w},${y} ${x+w+d},${y-dy} ${x+w*f+d},${y-dy}" fill="url(#deck${id})"/>`}
  if(puddles)[[.25,.5],[.6,.35],[.4,.8]].forEach(([fx,fy])=>{s+=`<ellipse cx="${x+fx*w+fy*d}" cy="${y-fy*dy}" rx="${22}" ry="5" fill="#6f8fa8" opacity=".55"/>`});
  // Attika (Dachrand)
  s+=`<path d="M${x-3} ${y}H${x+w}L${x+w+d+3} ${y-dy-1}" fill="none" stroke="${roof==="old"?"#5a4f48":"#2f3337"}" stroke-width="7"/><path d="M${x-3} ${y+4}H${x+w}" stroke="#9aa3ab" stroke-width="2"/>`;
  if(outlet)s+=`<path d="M${x+w+d*.6} ${y-dy*.6+8}V${y+h-dy*.6}" stroke="#8d969e" stroke-width="5"/>`;
  for(let i=0;i<domes;i++){const cx=x+w*(.28+i*.34)+d*.5,cy=y-dy*.5;s+=`<ellipse cx="${cx}" cy="${cy}" rx="22" ry="7" fill="#c9d6df"/><path d="M${cx-18} ${cy}A18 14 0 0 1 ${cx+18} ${cy}Z" fill="#dfeaf2" stroke="#a9b6c0" stroke-width="2"/>`}
  if(railing){s+=`<path d="M${x+2} ${y-14}H${x+w}L${x+w+d} ${y-dy-14}" fill="none" stroke="#2f3337" stroke-width="3"/>`;for(let t=0;t<=1.0001;t+=.1)s+=`<path d="M${x+2+t*(w-2)} ${y}V${y-14}" stroke="#2f3337" stroke-width="2"/>`}
  if(garage){s+=`<rect x="${x+w*.12}" y="${y+h*.28}" width="${w*.76}" height="${h*.72}" fill="#d9dde0"/>`;for(let i=1;i<6;i++)s+=`<path d="M${x+w*.12} ${y+h*.28+i*h*.12}H${x+w*.88}" stroke="#b4bbc0" stroke-width="2"/>`}
  else if(win){s+=`<rect x="${x+w*.08}" y="${y+24}" width="${w*.46}" height="${h*.42}" fill="#3d5a73"/><path d="M${x+w*.31} ${y+24}V${y+24+h*.42}" stroke="#2b2829" stroke-width="3"/><path d="M${x+w*.08} ${y+24}l${w*.2} 0l-${w*.2} ${h*.3}z" fill="#fff" opacity=".12"/>`}
  if(door)s+=`<rect x="${x+w*.66}" y="${y+28}" width="${w*.2}" height="${h-28}" fill="#4a3528"/>`;
  s+=`<rect x="${x}" y="${y+h-8}" width="${w}" height="8" fill="#393536"/>`;
  if(roofer){const px=x+w*.45+d*.4,py=y-dy*.4;s+=`<g><rect x="${px+10}" y="${py-6}" width="38" height="9" rx="4.5" fill="#2e3236"/><rect x="${px-6}" y="${py-30}" width="12" height="22" rx="4" fill="#2b2829"/><rect x="${px-5}" y="${py-30}" width="10" height="9" fill="#d98b4d"/><path d="M${px-4} ${py-8}L${px-8} ${py+4}M${px+4} ${py-8}L${px+9} ${py+3}" stroke="#2b2829" stroke-width="4" stroke-linecap="round"/><path d="M${px+5} ${py-22}L${px+14} ${py-8}" stroke="#2b2829" stroke-width="3.5" stroke-linecap="round"/><circle cx="${px}" cy="${py-36}" r="6" fill="#e9b892"/><path d="M${px-7} ${py-37}A7 7 0 0 1 ${px+7} ${py-37}Z" fill="#f3c623"/></g>`}
  return s;
}
function bench(x,y){return `<rect x="${x}" y="${y}" width="46" height="5" fill="#7d5532"/><path d="M${x+4} ${y+5}v12M${x+42} ${y+5}v12" stroke="#2f3337" stroke-width="3"/><circle cx="${x+70}" cy="${y-6}" r="14" fill="#3f6b3a"/><rect x="${x+62}" y="${y+4}" width="16" height="14" fill="#8d969e"/>`}
function scene(kind){
  const id=++uid,W=800,H=500;
  const cfg={flat:{sky:"evening",g:"#4f6b46"},garage:{sky:"day",g:"#7ea35c"},terrace:{sky:"morning",g:"#86a965"},domes:{sky:"grey",g:"#6f8a5a"},old:{sky:"storm",g:"#5f6d4c"},new:{sky:"day",g:"#7ea35c"}}[kind];
  const warm=kind==="flat";
  let s=`<svg class="scene" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${skyBlock(id,cfg.sky)}${patterns(id)}</defs><rect width="${W}" height="${H}" fill="url(#sky${id})"/>`;
  if(kind!=="old")s+=`<circle cx="${warm?620:150}" cy="${warm?330:110}" r="110" fill="url(#sun${id})"/>`;
  s+=clouds(W,H,4,kind==="old"?.9:.5)+farRow(W,400,"rgba(40,45,60,.25)",3)+`<path d="M0 410Q200 380 400 405T800 395V500H0Z" fill="${cfg.g}"/>`+trees([[70,26],[740,30]],420,"#3f6b3a");
  if(kind==="flat")s+=box(id,{x:200,y:240,w:340,h:190,roof:"foil",door:true,roofer:true});
  else if(kind==="garage")s+=box(id,{x:110,y:230,w:260,h:200,roof:"gravel",door:true})+box(id,{x:420,y:300,w:240,h:130,roof:"foil",garage:true,d:60,dy:24});
  else if(kind==="terrace")s+=box(id,{x:150,y:180,w:300,h:250,roof:"gravel",door:true,outlet:false})+box(id,{x:450,y:320,w:230,h:110,roof:"foilL",deck:true,railing:true,win:false,d:60,dy:24})+bench(560,282);
  else if(kind==="domes")s+=box(id,{x:200,y:240,w:340,h:190,roof:"foilL",domes:2,door:true});
  else if(kind==="old")s+=box(id,{x:200,y:240,w:340,h:190,roof:"old",wall:"#d8d0c2",side:"#bfb3a0",puddles:true,door:true});
  else if(kind==="new")s+=box(id,{x:200,y:240,w:340,h:190,roof:"foil",door:true});
  return s+`<path d="M0 470Q400 440 800 470V500H0Z" fill="rgba(0,0,0,.12)"/></svg>`;
}


/* ---------- Hero: Schichtaufbau Flachdach (SVG) ---------- */
function heroStack(){
  const W=600,H=612,x0=58,x1=470,dx=58,dy=40,yb=566;
  const L=[ // [Name, Höhe, Front, Seite, Oben, Muster]
    ["Tragkonstruktion",44,"#5d6268","#474b50","#70757b","hatch"],
    ["Dampfsperre",22,"#8d5a36","#6e4428","#a96f45",""],
    ["Wärmedämmung",58,"#e9d6a6","#cbb581","#f3e5bf","ins"],
    ["Dachfolie",26,"#2c2f34","#1f2226","#3a3e44","seam"],
    ["Kies als Schutz",30,"#a49a8e","#857c71","#b9b0a5","grav"]];
  let y=yb,layers="";
  L.forEach(([n,h,f,s,t,p],i)=>{
    const yt=y-h, fill=p?`url(#st-${p})`:f;
    layers+=`<g class="ly" style="--i:${i}">
      <path d="M${x1} ${yt}L${x1+dx} ${yt-dy}V${y-dy}L${x1} ${y}Z" fill="${s}"/>
      <path d="M${x0} ${yt}L${x0+dx} ${yt-dy}H${x1+dx}L${x1} ${yt}Z" fill="${t}"/>
      <rect x="${x0}" y="${yt}" width="${x1-x0}" height="${h}" fill="${f}"/>
      ${p?`<rect x="${x0}" y="${yt}" width="${x1-x0}" height="${h}" fill="${fill}"/>`:""}
      <path d="M${x0} ${yt+.5}H${x1}" stroke="rgba(255,255,255,.18)"/>
      <text x="${x1-14}" y="${yt+h/2+5}" text-anchor="end" class="st-l" fill="${i===2||i===4?"#2a2420":"#fff"}" stroke="${f}" stroke-width="7" paint-order="stroke">${n}</text>
    </g>`;
    y=yt;
  });
  const top=y; // Oberkante Kies
  // Regen
  let rain="";for(let i=0;i<34;i++){const x=40+(i*97)%540,yy=(i*61)%300,l=14+(i*7)%12;rain+=`<path d="M${x} ${yy}l-4 ${l}" style="--r:${(i%7)*.17}s"/>`}
  // Spritzer auf der Oberseite
  let spl="";for(let i=0;i<7;i++){const x=x0+40+i*62+(i%2)*20,yy=top-8-(i%3)*10;spl+=`<ellipse cx="${x+((i%3)*12)}" cy="${yy}" rx="9" ry="2.6" style="--s:${i*.33}s"/>`}
  $("#lStack").innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>
    <linearGradient id="st-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1f25"/><stop offset=".65" stop-color="#2c2a2d"/><stop offset="1" stop-color="#4a3326"/></linearGradient>
    <radialGradient id="st-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#e08a4a" stop-opacity=".55"/><stop offset="1" stop-color="#e08a4a" stop-opacity="0"/></radialGradient>
    <pattern id="st-hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V12" stroke="rgba(255,255,255,.12)" stroke-width="3"/></pattern>
    <pattern id="st-ins" width="28" height="58" patternUnits="userSpaceOnUse"><path d="M0 50L7 8L14 50L21 8L28 50" fill="none" stroke="rgba(150,110,50,.45)" stroke-width="2"/></pattern>
    <pattern id="st-seam" width="92" height="26" patternUnits="userSpaceOnUse"><path d="M0 0V26" stroke="rgba(255,255,255,.14)" stroke-width="2"/></pattern>
    <pattern id="st-grav" width="18" height="12" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="3" fill="#cfc6bb"/><circle cx="13" cy="8" r="2.6" fill="#7f766c"/><circle cx="9" cy="2" r="1.6" fill="#e3dbd1"/></pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#st-sky)"/>
  <circle cx="300" cy="${top+10}" r="300" fill="url(#st-glow)"/>
  <g class="st-rain" stroke="rgba(200,215,235,.55)" stroke-width="2" stroke-linecap="round">${rain}</g>
  <g class="st-stack">${layers}</g>
  <g class="st-spl" fill="none" stroke="rgba(210,225,240,.8)" stroke-width="1.5">${spl}</g>
  <g class="st-out">
    <path d="M${x1+dx-6} ${top-dy+30}h34v12" fill="none" stroke="#9aa1a8" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="st-drip" d="M${x1+dx+28} ${top-dy+50}v26" stroke="rgba(170,200,235,.9)" stroke-width="4" stroke-linecap="round" stroke-dasharray="6 12"/>
  </g>
  <g class="st-badge" transform="translate(${x0+6} ${top-dy-92})">
    <rect width="168" height="46" rx="23" fill="#c4733a"/>
    <path d="M22 23l7 7 13-14" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="54" y="30" class="st-b">100 % dicht</text>
  </g>
  </svg>`;
}
heroStack();

/* ---------- Leistungen (SVG-Icons) ---------- */
const SVC=[
  ["Flachdach","Neubau und Abdichtung von Flachdächern, mit Dämmung, Attika und sauberer Entwässerung.",'<path d="M3 9h18v11H3z"/><path d="M3 9l2-3h14l2 3"/><path d="M7 13h10"/>'],
  ["Foliendach","Abdichtung mit Kunststoff- oder EPDM-Dachfolie, nahtlos verarbeitet und dicht angeschlossen.",'<path d="M3 17l9-4 9 4-9 4z"/><path d="M3 13l9-4 9 4"/><path d="M7 11V7m10 4V7"/>'],
  ["Terrassen & Balkone","Abdichtung von Dachterrassen und Balkonen mit Folie, damit kein Wasser in die Bausubstanz läuft.",'<path d="M3 12h18"/><path d="M5 12v8M19 12v8M5 16h14"/><path d="M8 12V6h8v6"/>'],
  ["Garagen & Carports","Garagendächer und Carports mit Foliendach, als Sanierung oder neu.",'<path d="M3 10l9-5 9 5v10H3z"/><path d="M7 20v-7h10v7M7 16h10"/>'],
  ["Flachdachsanierung","Alte, undichte Flachdächer prüfen, rückbauen und mit neuer Abdichtung versehen.",'<path d="M3 9h18v11H3z"/><path d="M8 15l3 3 5-6"/>'],
  ["Reparatur & Leckortung","Undichte Stellen am Flachdach finden und reparieren, auch nach einem Unwetter.",'<path d="M12 3s5 6 5 10a5 5 0 0 1-10 0c0-4 5-10 5-10z"/><path d="M10 14a2 2 0 0 0 2 2"/>']
];
$("#services").innerHTML=SVC.map(([t,p,ico],i)=>`<article class="svc" data-reveal style="--d:${(i%3)*.1}s"><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ico}</svg></div><h3>${t}</h3><p>${p}</p></article>`).join("");

/* ---------- Referenzen + Vorher/Nachher ---------- */
const REFS=[
  ["abdichtung-brenner","Abdichtung mit dem Brenner","Flachdach","Bitumenbahn wird verschweißt und am Rand sauber angeschlossen.","Dachdecker verlegt Bitumenbahn mit dem Brenner"],
  ["foliendach-hell","Großes Foliendach","Foliendach","Flachdach mit heller Kunststofffolie, mit Absturzsicherung.","Großes Flachdach mit heller Dachfolie"],
  ["laubengang","Laubengang abgedichtet","Balkon","Abdichtung mit Gitterrost über der Entwässerung.","Abgedichteter Laubengang mit Geländer und Gitterrost"],
  ["neubau-flachdach","Neubau mitten im Baugebiet","Neubau","Bitumenabdichtung auf einem Neubau, die Kräne noch nebenan.","Neubau-Flachdach mit Bitumenbahnen und Baukränen"],
  ["kiesdach-lichtkuppel","Kiesdach mit Lichtkuppel","Flachdach","Kiesschüttung, Lichtkuppel und dichte Anschlüsse am Mauerwerk.","Flachdach mit Kies, Lichtkuppel und Kupferattika"],
  ["gewerbedach","Gewerbedach mit Lichtkuppeln","Gewerbe","Große Dachfläche mit mehreren Lichtkuppeln und Abläufen.","Gewerbliches Flachdach mit Lichtkuppeln"],
  ["anschluss-fassade","Anschluss an die Fassade","Flachdach","Beschieferte Bahn, sauber an die Metallwand angeschlossen.","Flachdach mit roter Schieferbahn an einer Metallfassade"]
];
$("#stage").innerHTML=REFS.map((r,i)=>`<button type="button" class="pc" data-i="${i}" aria-label="${r[1]} groß ansehen"><img src="assets/img/${r[0]}.jpg" alt="${r[4]}" ${i>1?'loading="lazy"':''} decoding="async"><span class="pc-shine"></span></button>`).join("");
const cards=[];
cards.push(`<figure class="ref ba" data-reveal style="--d:.1s"><div class="pane before">${scene("old")}</div><div class="pane after">${scene("new")}</div><span class="tag-ill">Illustration</span><span class="lbl l">Vorher</span><span class="lbl r">Nachher</span><div class="handle"></div><input type="range" min="0" max="100" value="50" aria-label="Vorher/Nachher vergleichen"><figcaption><span>Vorher / Nachher</span><b>Flachdachsanierung</b></figcaption></figure>`);
$("#refs").innerHTML=cards.join("");

/* Lightbox */
const lb=$("#lb");let lbI=0,lbLast=null;
function lbShow(i){lbI=(i+REFS.length)%REFS.length;const r=REFS[lbI];$("#lbImg").src=`assets/img/${r[0]}.jpg`;$("#lbImg").alt=r[4];$("#lbTag").textContent=r[2];$("#lbTitle").textContent=r[1];$("#lbText").textContent=r[3]}
function lbOpen(i){lbLast=document.activeElement;lbShow(i);lb.classList.add("open");document.body.classList.add("locked");$(".lb-x",lb).focus()}
function lbClose(){if(!lb.classList.contains("open"))return;lb.classList.remove("open");document.body.classList.remove("locked");lbLast&&lbLast.focus()}
$("#stage").addEventListener("click",e=>{const c=e.target.closest(".pc");if(c)lbOpen(+c.dataset.i)});
$(".lb-x",lb).onclick=lbClose;$(".prev",lb).onclick=()=>lbShow(lbI-1);$(".next",lb).onclick=()=>lbShow(lbI+1);
lb.addEventListener("click",e=>{if(e.target===lb)lbClose()});
addEventListener("keydown",e=>{if(!lb.classList.contains("open"))return;if(e.key==="Escape")lbClose();if(e.key==="ArrowLeft")lbShow(lbI-1);if(e.key==="ArrowRight")lbShow(lbI+1)});

/* Fotos: 3D-Flug beim Scrollen */
(()=>{const box=$("#sc3d"),pcs=$$("#stage .pc"),N=pcs.length;let cur=-1,tick=false;
  if(reduce){box.classList.add("flat");return}
  function upd(){tick=false;const m=calm(),r=box.getBoundingClientRect(),run=box.offsetHeight-innerHeight;
    const t=Math.min(1,Math.max(0,-r.top/run)),raw=t*(N-1),fi=Math.floor(raw),fr=raw-fi,
      s=fr<.22?0:fr>.78?1:(u=>u*u*(3-2*u))((fr-.22)/.56),p=Math.min(N-1,fi+s);
    const gap=m?520:1050,sx=m?0:380,rot=m?0:16;
    pcs.forEach((c,i)=>{const d=i-p,side=i%2?1:-1;
      const z=d>0?-d*gap:-d*gap*.7,x=d>0?side*d*sx:-side*d*(m?0:520),y=d>0?d*(m?-22:-28):-d*(m?60:40),ry=d>0?-side*Math.min(d,2)*rot:side*d*rot*1.6;
      let o=d>2.4?Math.max(0,3.2-d):d<0?Math.max(0,1+d*2.6):1;
      c.style.transform=`translate3d(${x}px,${y}px,${z}px) rotateY(${ry}deg)`;
      c.style.opacity=o.toFixed(3);c.style.zIndex=100-Math.round(Math.abs(d)*10);
      c.style.setProperty("--l",Math.max(0,1-Math.abs(d)).toFixed(3));
      c.style.pointerEvents=Math.abs(d)<.5?"auto":"none";c.tabIndex=Math.abs(d)<.5?0:-1});
    const k=Math.min(N-1,Math.round(p));
    if(k!==cur){cur=k;const q=REFS[k];$("#scNum").textContent=String(k+1).padStart(2,"0");$("#scTag").textContent=q[2];$("#scTitle").textContent=q[1];$("#scText").textContent=q[3];
      const cap=$(".sc-cap");cap.classList.remove("swap");void cap.offsetWidth;cap.classList.add("swap")}
    $("#scBar").style.transform=`scaleX(${(p/(N-1)).toFixed(3)})`;
    $("#scHint").classList.toggle("gone",t>.04);
  }
  const req=()=>{if(!tick){tick=true;requestAnimationFrame(upd)}};
  addEventListener("scroll",req,{passive:true});addEventListener("resize",req);upd();
})();
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
  ["Welche Dächer macht KB Bedachungen?","Wir sind auf Flachdächer spezialisiert, vor allem Foliendächer für Häuser, Terrassen, Balkone, Garagen und Carports."],
  ["Kommen Sie für eine Besichtigung vorbei?","Ja. Rufen Sie an oder schicken Sie eine Anfrage, dann vereinbaren wir einen Termin bei Ihnen vor Ort."],
  ["In welcher Region sind Sie tätig?","Wir sind in Ichenhausen und Umgebung für Sie unterwegs. Fragen Sie gerne nach, ob Ihr Ort dazugehört."],
  ["Mein Flachdach ist undicht. Was tun?","Steigen Sie nicht selbst aufs Dach. Machen Sie wenn möglich Fotos von der betroffenen Stelle innen und rufen Sie uns an: 0162 1546717."],
  ["Kann ich Fotos per WhatsApp schicken?","Ja, Fotos vom Dach, der Terrasse oder der Garage helfen uns bei einer ersten Einschätzung."],
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
  if(!reduce&&!calm()&&y<innerHeight*1.5){
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
if(cv&&cv.getContext&&!reduce&&!calm()){
  const ctx=cv.getContext("2d");let W=0,H=0,dpr=Math.min(2,devicePixelRatio||1),pts=[],running=true;
  function size(){W=cv.offsetWidth;H=cv.offsetHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    pts=Array.from({length:Math.round(W*H/22000)},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.6+.4,vy:-(Math.random()*.25+.05),vx:(Math.random()-.5)*.15,a:Math.random()*.5+.15}))}
  size();addEventListener("resize",size);
  new IntersectionObserver(es=>running=es[0].isIntersecting).observe(cv);
  (function tick(){if(running){ctx.clearRect(0,0,W,H);for(const p of pts){p.x+=p.vx;p.y+=p.vy;if(p.y<-5){p.y=H+5;p.x=Math.random()*W}ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.283);ctx.fillStyle=`rgba(217,139,77,${p.a})`;ctx.fill()}}requestAnimationFrame(tick)})();
}
})();
