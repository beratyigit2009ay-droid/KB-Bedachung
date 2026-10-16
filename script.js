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

/* ---------- Referenzen: Fotos ---------- */
const REFS=[
  ["abdichtung-brenner","Abdichtung mit dem Brenner","Flachdach","Bitumenbahn wird verschweißt und am Rand sauber angeschlossen.","Dachdecker verlegt Bitumenbahn mit dem Brenner"],
  ["foliendach-hell","Großes Foliendach","Foliendach","Flachdach mit heller Kunststofffolie, mit Absturzsicherung.","Großes Flachdach mit heller Dachfolie"],
  ["laubengang","Laubengang abgedichtet","Balkon","Abdichtung mit Gitterrost über der Entwässerung.","Abgedichteter Laubengang mit Geländer und Gitterrost"],
  ["neubau-flachdach","Neubau mitten im Baugebiet","Neubau","Bitumenabdichtung auf einem Neubau, die Kräne noch nebenan.","Neubau-Flachdach mit Bitumenbahnen und Baukränen"],
  ["kiesdach-lichtkuppel","Kiesdach mit Lichtkuppel","Flachdach","Kiesschüttung, Lichtkuppel und dichte Anschlüsse am Mauerwerk.","Flachdach mit Kies, Lichtkuppel und Kupferattika"],
  ["gewerbedach","Gewerbedach mit Lichtkuppeln","Gewerbe","Große Dachfläche mit mehreren Lichtkuppeln und Abläufen.","Gewerbliches Flachdach mit Lichtkuppeln"],
  ["anschluss-fassade","Anschluss an die Fassade","Flachdach","Beschieferte Bahn, sauber an die Metallwand angeschlossen.","Flachdach mit roter Schieferbahn an einer Metallfassade"]
];
const PRINT="KB BEDACHUNGEN · FLACHDACH · ICHENHAUSEN · ";
$("#stage").innerHTML=REFS.map((r,i)=>`<button type="button" class="pc" data-i="${i}" aria-label="${r[1]} groß ansehen"><span class="pc-ph"><img src="assets/img/${r[0]}.jpg" alt="${r[4]}" ${i>2?'loading="lazy"':''} decoding="async"></span><span class="pc-lbl"><em>${String(i+1).padStart(2,"0")}</em><span>${r[2]}</span><b>${r[1]}</b></span><span class="pc-print" aria-hidden="true">${PRINT.repeat(4)}</span></button>`).join("");

/* Lightbox */
const lb=$("#lb");let lbI=0,lbLast=null;
function lbShow(i){lbI=(i+REFS.length)%REFS.length;const r=REFS[lbI];$("#lbImg").src=`assets/img/${r[0]}.jpg`;$("#lbImg").alt=r[4];$("#lbTag").textContent=r[2];$("#lbTitle").textContent=r[1];$("#lbText").textContent=r[3]}
function lbOpen(i){lbLast=document.activeElement;lbShow(i);lb.classList.add("open");document.body.classList.add("locked");$(".lb-x",lb).focus()}
function lbClose(){if(!lb.classList.contains("open"))return;lb.classList.remove("open");document.body.classList.remove("locked");lbLast&&lbLast.focus()}
$("#stage").addEventListener("click",e=>{const c=e.target.closest(".pc");if(c)lbOpen(+c.dataset.i)});
$(".lb-x",lb).onclick=lbClose;$(".prev",lb).onclick=()=>lbShow(lbI-1);$(".next",lb).onclick=()=>lbShow(lbI+1);
lb.addEventListener("click",e=>{if(e.target===lb)lbClose()});
addEventListener("keydown",e=>{if(!lb.classList.contains("open"))return;if(e.key==="Escape")lbClose();if(e.key==="ArrowLeft")lbShow(lbI-1);if(e.key==="ArrowRight")lbShow(lbI+1)});

/* Fotos: Dachbahn rollt beim Scrollen aus */
(()=>{const box=$("#rollout"),roof=$("#rlRoof"),track=$("#stage"),roll=$("#rlRoll"),heat=$("#rlHeat"),torch=$("#rlTorch"),pcs=$$("#stage .pc"),N=pcs.length,caps=$$("#rlRoll .sp");
  let L=0,cur=-1,raf=0;
  if(reduce){box.classList.add("flat");return}
  function spiral(turns){let d="";const n=Math.max(2,turns)*40;for(let k=0;k<=n;k++){const a=k/40*Math.PI*2,r=4+44*k/n;d+=(k?"L":"M")+(Math.cos(a)*r).toFixed(1)+" "+(Math.sin(a)*r).toFixed(1)}return d}
  function layout(){const g=parseFloat(getComputedStyle(track).columnGap)||0;L=track.scrollWidth+g;
    box.style.height=(innerHeight+L*(calm()?1:1.1))+"px"}
  function frame(){raf=0;const m=calm(),r=box.getBoundingClientRect(),run=box.offsetHeight-innerHeight,
      t=Math.min(1,Math.max(0,-r.top/run)),W=roof.clientWidth,rx=roof.dataset.rx=W*(m?.88:.8),u=12+t*(L-12);
    track.style.transform=`translate3d(${(rx-u).toFixed(1)}px,0,0)`;
    $("#rlSheet").style.clipPath=`inset(0 ${(W-rx).toFixed(1)}px 0 0)`;
    // Rolle: wird beim Abrollen dünner und dreht sich
    const H=roof.clientHeight,D=H*(m?.34:.4)*(1-.55*t)+H*.06;
    roll.style.cssText=`left:${(rx-D*.15).toFixed(1)}px;width:${D.toFixed(1)}px;--rot:${(u/(Math.PI*D)*360).toFixed(1)}deg;--shift:${(-u%52).toFixed(1)}px`;
    caps.forEach(c=>c.setAttribute("d",spiral(6*(1-t)+1.5)));
    heat.style.left=(rx-34)+"px";torch.style.left=(rx+D*.75-torch.clientWidth*.42)+"px";
    // Frisch verschweißt: Felder nah an der Rolle glühen
    let k=0,best=1e9;
    pcs.forEach((c,i)=>{const b=c.getBoundingClientRect(),rr=roof.getBoundingClientRect(),right=b.right-rr.left,mid=(b.left+b.right)/2-rr.left,
        dist=rx-right,hot=Math.max(0,1-dist/(b.width*.9));
      c.style.setProperty("--hot",hot.toFixed(3));
      const dc=Math.abs(mid-(rx-b.width*.65));if(dc<best&&right<=rx+4){best=dc;k=i}});
    if(k!==cur){cur=k;$("#rlNum").textContent=String(k+1).padStart(2,"0");$("#rlTitle").textContent=REFS[k][1];
      const el=$(".rl-count");el.classList.remove("swap");void el.offsetWidth;el.classList.add("swap")}
    $("#rlBar").style.transform=`scaleX(${t.toFixed(3)})`;
    $("#rlHint").classList.toggle("gone",t>.02);
    box.classList.toggle("done",t>.995);
  }
  const req=()=>{if(!raf)raf=requestAnimationFrame(frame)};
  addEventListener("scroll",req,{passive:true});
  addEventListener("resize",()=>{layout();req()});
  addEventListener("load",()=>{layout();req()});
  layout();frame();
})();

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
