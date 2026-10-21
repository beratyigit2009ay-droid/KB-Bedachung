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

/* ---------- Logo am Anfang des Scroll-Intros ---------- */
const intro=$("#intro"),hero=$("#hero");
$$(".kb-l",intro).forEach((l,i)=>l.style.animationDelay=(1.4+i*.05)+"s");
requestAnimationFrame(()=>intro.classList.add("play"));
/* Hero blendet ein, sobald er nach dem Intro ins Bild kommt */
if("IntersectionObserver" in window){const hio=new IntersectionObserver(es=>{if(es[0].isIntersecting){hero.classList.add("go");hio.disconnect()}},{threshold:.15});hio.observe(hero)}else hero.classList.add("go");

/* ---------- Hinweis, Menü, Impressum, Modal ---------- */
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
  <g class="st-stack">${layers}</g>
  </svg>`;
}
heroStack();

/* ---------- Leistungen (SVG-Icons) ---------- */
const SVC=[
  ["Flachdach","Neubau und Abdichtung von Flachdächern, mit Dämmung, Attika und sauberer Entwässerung.","flachdach","Flachdach-Neubau mit Bitumenbahnen"],
  ["Foliendach","Abdichtung mit Kunststoff- oder EPDM-Dachfolie, nahtlos verarbeitet und dicht angeschlossen.","foliendach","Großes Dach mit heller Kunststofffolie"],
  ["Terrassen & Balkone","Abdichtung von Dachterrassen und Balkonen mit Folie, damit kein Wasser in die Bausubstanz läuft.","terrasse","Abgedichteter Laubengang mit Geländer"],
  ["Garagen & Carports","Garagendächer und Carports mit Foliendach, als Sanierung oder neu.","garage","Kleines Flachdach mit Kies und Lichtkuppel"],
  ["Flachdachsanierung","Alte, undichte Flachdächer prüfen, rückbauen und mit neuer Abdichtung versehen.","sanierung","Neue Abdichtung am Anschluss zur Fassade"],
  ["Reparatur & Leckortung","Undichte Stellen am Flachdach finden und reparieren, auch nach einem Unwetter.","reparatur","Abdichtungsbahn wird mit dem Brenner verschweißt"]
];
$("#services").innerHTML=SVC.map(([t,p,img,alt],i)=>`<article class="svc" data-reveal style="--d:${(i%3)*.1}s"><div class="pic"><img src="assets/img/klein/${img}.jpg" alt="${alt}" loading="lazy" decoding="async" width="720" height="450"></div><h3>${t}</h3><p>${p}</p></article>`).join("");

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
$("#stage").innerHTML=REFS.map((r,i)=>`<figure class="g-item g${i+1}" data-reveal style="--d:${(i%4)*.06}s"><button type="button" class="pc" data-i="${i}" aria-label="${r[1]} vergrößern"><img src="assets/img/${r[0]}.jpg" alt="${r[4]}" loading="lazy" decoding="async"></button><figcaption><span>${r[2]}</span>${r[1]}</figcaption></figure>`).join("");

/* Lightbox */
const lb=$("#lb");let lbI=0,lbLast=null;
function lbShow(i){lbI=(i+REFS.length)%REFS.length;const r=REFS[lbI];$("#lbImg").src=`assets/img/${r[0]}.jpg`;$("#lbImg").alt=r[4];$("#lbTag").textContent=r[2];$("#lbTitle").textContent=r[1];$("#lbText").textContent=r[3]}
function lbOpen(i){lbLast=document.activeElement;lbShow(i);lb.classList.add("open");document.body.classList.add("locked");$(".lb-x",lb).focus()}
function lbClose(){if(!lb.classList.contains("open"))return;lb.classList.remove("open");document.body.classList.remove("locked");lbLast&&lbLast.focus()}
$("#stage").addEventListener("click",e=>{const c=e.target.closest(".pc");if(c)lbOpen(+c.dataset.i)});
$(".lb-x",lb).onclick=lbClose;$(".prev",lb).onclick=()=>lbShow(lbI-1);$(".next",lb).onclick=()=>lbShow(lbI+1);
lb.addEventListener("click",e=>{if(e.target===lb)lbClose()});
addEventListener("keydown",e=>{if(!lb.classList.contains("open"))return;if(e.key==="Escape")lbClose();if(e.key==="ArrowLeft")lbShow(lbI-1);if(e.key==="ArrowRight")lbShow(lbI+1)});

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

/* ---------- Termin-Formular: Anfrage als E-Mail an Info@kb-bedachungen.de ---------- */
const form=$("#bookForm");
$("#f-date").min=new Date().toISOString().slice(0,10);
form.addEventListener("submit",e=>{
  e.preventDefault();
  const name=$("#f-name"),tel=$("#f-tel"),mail=$("#f-mail");
  [name,tel,mail].forEach(x=>x.classList.remove("err"));
  if(!name.value.trim()){name.classList.add("err");name.focus();toast("Bitte geben Sie Ihren Namen an.");return}
  if(!tel.value.trim()&&!mail.value.trim()){tel.classList.add("err");mail.classList.add("err");tel.focus();toast("Bitte Telefon oder E-Mail angeben.");return}
  if(mail.value.trim()&&!/^\S+@\S+\.\S+$/.test(mail.value.trim())){mail.classList.add("err");mail.focus();toast("Bitte eine gültige E-Mail-Adresse angeben.");return}
  const d=$("#f-date").value,msg=$("#f-msg").value.trim();
  const lines=["Hallo KB Bedachungen, ich habe eine Anfrage über die Website:","","Name: "+name.value.trim()];
  if(tel.value.trim())lines.push("Telefon: "+tel.value.trim());
  if(mail.value.trim())lines.push("E-Mail: "+mail.value.trim());
  lines.push("Thema: "+$("#f-topic").value);
  if(d)lines.push("Wunschdatum: "+d.split("-").reverse().join("."));
  if(msg)lines.push("","Nachricht: "+msg);
  location.href="mailto:Info@kb-bedachungen.de?subject="+encodeURIComponent("Anfrage über die Website: "+$("#f-topic").value)+"&body="+encodeURIComponent(lines.join("\r\n"));
  modal.classList.add("open");document.body.classList.add("locked");$("#mClose").focus();
  form.reset();
});

/* =========================================================
   Bewertungen: 3D-Karussell, beim Scrollen gedreht
   Echte Google-Bewertungen: [Name, Quelle, Text (leer = nur Sterne)]
   ========================================================= */
const REVIEWS=[
  ["Fatih Kaplan","Google-Bewertung","Wie immer perfekt 😍"],
  ["Hakan Aydin","Google-Bewertung",""],
  ["Berat Yigit","Google-Bewertung","Sehr zuverlässig, professionell und freundlich. Kann KB Bedachungen nur weiterempfehlen!"],
  ["D.K.","Google-Bewertung",""]
];
(()=>{
  const stage=$("#rvStage"),track=$("#rvTrack"),dots=$("#rvDots");if(!stage)return;
  const G='<svg class="rv-gl" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9z"/><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.5L6.4 10C7.2 7.8 9.4 6 12 6z"/></svg>';
  track.innerHTML=REVIEWS.map((r,i)=>`<article class="rv-card" aria-roledescription="Bewertung" aria-label="Bewertung ${i+1} von ${REVIEWS.length}">${r[2]?'<div class="rv-top"><span class="rv-stars" aria-label="5 von 5 Sternen">★★★★★</span></div>':''}${r[2]?`<blockquote${r[2].length>40?' class="long"':''}>${r[2]}</blockquote>`:'<p class="rv-only"><span aria-hidden="true">★★★★★</span>5 von 5 Sternen</p>'}<div class="rv-foot"><span class="rv-av">${r[0].trim()[0]}</span><span><b>${r[0]}</b><small>${r[1]}</small></span>${G}</div></article>`).join("");
  dots.innerHTML=REVIEWS.map((_,i)=>`<button type="button" role="tab" aria-label="Bewertung ${i+1}"></button>`).join("");
  const cards=$$(".rv-card",track),db=$$("button",dots),n=cards.length;
  let pos=0,target=0,raf=0;
  /* Kartenposition im Halbkreis: Mitte flach und scharf, Seiten gedreht und zurückgesetzt */
  function paint(){
    const m=calm(),flat=reduce;
    cards.forEach((c,i)=>{
      const o=i-pos,a=Math.abs(o);
      if(flat){c.style.transform="";c.style.opacity="";return}
      const x=o*(m?60:44),r=-Math.max(-1.4,Math.min(1.4,o))*(m?20:30),z=-a*(m?90:180);
      c.style.transform=`perspective(1400px) translate3d(calc(-50% + ${x}%),0,${z}px) rotateY(${r}deg)`;
      c.style.opacity=Math.max(0,Math.min(1,2.2-a)).toFixed(3);c.style.setProperty("--dim",Math.min(1,a)*.55);
      c.style.zIndex=10-Math.round(a*2);
      c.classList.toggle("on",a<.5);
    });
    db.forEach((b,i)=>b.setAttribute("aria-selected",Math.round(pos)===i));
  }
  function loop(){pos+=(target-pos)*.12;if(Math.abs(target-pos)<.002)pos=target;paint();raf=pos!==target?requestAnimationFrame(loop):0}
  function go(t){target=Math.max(0,Math.min(n-1,t));if(!raf)raf=requestAnimationFrame(loop)}
  /* Desktop: Fortschritt der Seite durch den Abschnitt bestimmt die vordere Karte */
  function fromScroll(){
    if(calm()||reduce||manual)return;
    const r=stage.getBoundingClientRect(),p=(innerHeight*.7-r.top)/(innerHeight*.75);
    go(Math.max(0,Math.min(1,p))*(n-1));
  }
  let manual=false,mt;
  function pick(i){manual=true;clearTimeout(mt);mt=setTimeout(()=>manual=false,2500);go(i)}
  db.forEach((b,i)=>b.addEventListener("click",()=>pick(i)));
  cards.forEach((c,i)=>c.addEventListener("click",()=>{if(Math.round(pos)!==i)pick(i)}));
  /* Handy: wischen */
  let sx=null;
  stage.addEventListener("touchstart",e=>{sx=e.touches[0].clientX},{passive:true});
  stage.addEventListener("touchend",e=>{if(sx===null)return;const d=e.changedTouches[0].clientX-sx;if(Math.abs(d)>40)pick(Math.round(target)+(d<0?1:-1));sx=null},{passive:true});
  stage.addEventListener("keydown",e=>{if(e.key==="ArrowRight")pick(Math.round(target)+1);if(e.key==="ArrowLeft")pick(Math.round(target)-1)});
  /* Einflug: Bühne kippt beim Hereinscrollen aus der Schräge in die Ebene */
  const tilt=()=>{if(reduce)return;const r=stage.getBoundingClientRect(),k=Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight*.55)));track.style.transform=`rotateX(${((1-k)*(calm()?10:18)).toFixed(2)}deg) translateY(${((1-k)*40).toFixed(1)}px)`};
  addEventListener("scroll",()=>requestAnimationFrame(()=>{fromScroll();tilt()}),{passive:true});
  addEventListener("resize",()=>{paint();tilt()});
  paint();fromScroll();tilt();
})();

/* ---------- FAQ (Accordion) ---------- */
const FAQ=[
  ["Welche Dächer macht KB Bedachungen?","Wir sind auf Flachdächer spezialisiert, vor allem Foliendächer für Häuser, Terrassen, Balkone, Garagen und Carports."],
  ["Kommen Sie für eine Besichtigung vorbei?","Ja. Rufen Sie an oder schicken Sie eine Anfrage, dann vereinbaren wir einen Termin bei Ihnen vor Ort."],
  ["In welcher Region sind Sie tätig?","Wir sind in Ichenhausen und Umgebung für Sie unterwegs. Fragen Sie gerne nach, ob Ihr Ort dazugehört."],
  ["Mein Flachdach ist undicht. Was tun?","Steigen Sie nicht selbst aufs Dach. Machen Sie wenn möglich Fotos von der betroffenen Stelle innen und rufen Sie uns an: +49 162 1546717."],
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

})();
