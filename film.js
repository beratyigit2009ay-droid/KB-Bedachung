/* =========================================================
   KB Bedachungen – Intro-Film (film.js)
   Der vorgerenderte Film (Blender/Cycles) läuft als echtes Video in
   einer ruhigen Endlosschleife. Das Video ist auf 30 Bilder pro Sekunde
   zwischengerechnet und an schnellen Kameraschwenks verlangsamt, so
   läuft es gleichmässig und ohne Ruckeln; der Browser spielt es mit der
   Grafikkarte ab.
   Logo, Texte, Schritte, Abspann und Weissblende folgen der Stelle im
   Film (s = 0..1), die aus der Abspielzeit abgelesen wird.
   ========================================================= */
const film = document.getElementById("film");
if (film) start();

function start() {
  const clamp = v => (v < 0 ? 0 : v > 1 ? 1 : v);

  /* ---------- Quellen: quer = 16:9, Hochformat = quadratisch ---------- */
  const SRC = { wide: "assets/film/film-w", sq: "assets/film/film-s" };
  const pick = () => (innerHeight > innerWidth && innerWidth <= 900 ? "sq" : "wide");

  /* Stelle im Film s für die Abspielzeit, alle 0,25 s (aus dem Schnitt
     berechnet, damit Texte und Schritte genau zum Bild passen) */
  const DUR = 36, STEP = .25;
  const SMAP = [0,.0069,.0139,.0208,.0278,.0347,.0421,.0508,.0594,.0681,.0768,.0855,.0942,.1028,.1115,.1202,.1289,.1376,.1462,.1548,.1632,.1716,.1799,.1882,.1965,.205,.2136,.2223,.231,.2396,.2483,.257,.2657,.2744,.2831,.2917,.3005,.3091,.3178,.3265,.3351,.3438,.3525,.3612,.3699,.3785,.3872,.3959,.4046,.4133,.4219,.4306,.4393,.448,.4567,.4653,.474,.4827,.4914,.5001,.5087,.5174,.526,.5343,.542,.5491,.5555,.5615,.567,.5722,.5773,.5822,.5872,.5922,.5973,.6026,.6081,.6139,.62,.6263,.6327,.6388,.6444,.6497,.6544,.6588,.6628,.6666,.6701,.6734,.6767,.6798,.6828,.6858,.6887,.6916,.6945,.6973,.7002,.7032,.7062,.7092,.7124,.7157,.7192,.7229,.7269,.7313,.7361,.7415,.7476,.7545,.7623,.7706,.7792,.7878,.7965,.8051,.8132,.8208,.8277,.8341,.8401,.8457,.8512,.8565,.8619,.8673,.8729,.8788,.885,.8916,.8985,.906,.9139,.9221,.9306,.9392,.9479,.9566,.9653,.974,.9826,.9913,1];
  const sAt = t => {
    const x = clamp(t / DUR) * (SMAP.length - 1), i = Math.min(SMAP.length - 2, Math.floor(x));
    return SMAP[i] + (SMAP[i + 1] - SMAP[i]) * (x - i);
  };
  const tAt = s => { /* Umkehrung, nur für Testbilder */
    let i = 0; while (i < SMAP.length - 2 && SMAP[i + 1] < s) i++;
    return (i + clamp((s - SMAP[i]) / ((SMAP[i + 1] - SMAP[i]) || 1))) * STEP;
  };

  const stage = document.getElementById("filmStage");
  const video = document.getElementById("filmVideo");
  const skip  = document.getElementById("filmSkip");

  const off = () => {
    film.classList.remove("film-loading", "film-ready");
    film.classList.add("film-off");
    document.body.classList.remove("in-film");
    if (video) { video.pause(); video.removeAttribute("src"); video.load(); }
  };

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* H.264 (MP4) kann jeder Browser; WebM nur als Ersatz */
  const EXT = !video || !video.canPlayType ? "" : video.canPlayType('video/mp4; codecs="avc1.4d401f"') ? ".mp4" : video.canPlayType('video/webm; codecs="vp9"') ? ".webm" : "";
  if (reduce || !stage || !EXT) { off(); return; }
  video.muted = true;

  /* Überspringen: direkt zur Seite */
  if (skip) skip.addEventListener("click", () => scrollTo({ top: film.offsetTop + film.offsetHeight, behavior: "instant" }));

  /* ---------- Texte und Überblendungen (wie im alten Player) ---------- */
  const ui = {
    logo:  document.getElementById("intro"),
    hint:  document.getElementById("filmHint"),
    fade:  document.getElementById("filmFade"),
    end:   document.getElementById("filmEnd"),
    skip:  skip,
    lines: [...film.querySelectorAll(".film-lines p")].map(p => ({ el: p, a: +p.dataset.a, b: +p.dataset.b })),
    steps: [...film.querySelectorAll(".film-steps")].map(o => ({
      el: o, a: +o.dataset.a, b: +o.dataset.b,
      li: [...o.children].map(l => ({ el: l, t: +l.dataset.t }))
    }))
  };
  /* weiche Ein- und Ausblendung (smoothstep) für einen ruhigeren Verlauf */
  const ease = x => x * x * (3 - 2 * x);
  const win01 = (s, a, b, f = .045) => ease(Math.min(clamp((s - a) / f), clamp((b - s) / f)));

  /* Stilwerte nur schreiben, wenn sie sich wirklich ändern – spart
     Stil-Neuberechnungen in jedem Bild */
  const css = (el, k, v) => {
    const c = el._fc || (el._fc = {});
    if (c[k] !== v) { c[k] = v; el.style[k] = v; }
  };
  const r3 = v => Math.round(v * 1000) / 1000;
  let inFilm = null;
  const setInFilm = on => { if (on !== inFilm) { inFilm = on; document.body.classList.toggle("in-film", on); } };

  function paintUI(s) {
    setInFilm(s < .985 && inView());
    if (!ready) return; /* solange geladen wird, steht nur das Logo (siehe .film-loading) */
    const lo = clamp((s - .035) / .07);
    if (ui.logo) {
      css(ui.logo, "opacity", String(r3(1 - lo)));
      css(ui.logo, "transform", `translateY(${(-40 * lo).toFixed(1)}px) scale(${r3(1 - .05 * lo)})`);
      css(ui.logo, "visibility", lo >= 1 ? "hidden" : "");
    }
    if (ui.hint) css(ui.hint, "opacity", String(r3(1 - ease(clamp((s - .86) / .04)) + ease(clamp((s - .985) / .015)))));
    css(stage, "opacity", String(r3(ease(clamp((s - .02) / .09)))));
    for (const l of ui.lines) {
      const o = win01(s, l.a, l.b);
      css(l.el, "opacity", String(r3(o)));
      css(l.el, "transform", `translateY(${((1 - o) * (s < (l.a + l.b) / 2 ? 14 : -14)).toFixed(1)}px)`);
    }
    for (const g of ui.steps) {
      css(g.el, "opacity", String(r3(win01(s, g.a, g.b, .02))));
      for (const l of g.li) { const on = s >= l.t; if (l.on !== on) { l.on = on; l.el.classList.toggle("on", on); } }
    }
    if (ui.end) {
      const eo = ease(clamp((s - .875) / .05));
      css(ui.end, "opacity", String(r3(eo)));
      css(ui.end, "transform", `translateY(${((1 - eo) * 14).toFixed(1)}px)`);
      css(ui.end, "pointerEvents", eo > .5 ? "auto" : "none");
    }
    if (ui.fade) css(ui.fade, "opacity", String(r3(ease(clamp((s - .955) / .045)))));
    /* Der Abspann blendet ab .875 ein – der Knopf geht vorher aus, damit
       sich beides auf kleinen Displays nicht in die Quere kommt. */
    if (ui.skip) { css(ui.skip, "opacity", s > .87 ? "0" : "1"); css(ui.skip, "pointerEvents", s > .87 ? "none" : ""); }
  }

  let lastS = -1;
  function paint(s) {
    if (s === lastS) return;
    lastS = s;
    paintUI(s);
  }

  /* ---------- Ablauf ----------
     Das Video läuft nur, solange der Abschnitt im Bild ist. Lage des
     Abschnitts nur bei Größenänderung messen, beim Scrollen reicht scrollY. */
  const shot = location.search.match(/filmshot=([\d.]+)/); /* nur für Testbilder: ?filmshot=0.4 */
  let ready = false, raf = 0, variant = null;
  /* Autoplay gesperrt (iPhone im Stromsparmodus): ruhiges Standbild
     zeigen, beim ersten Tippen startet der Film */
  let blocked = false;
  const STILL = .115;
  let fTop = 0, fH = 1;
  const measure = () => { const r = film.getBoundingClientRect(); fTop = r.top + scrollY; fH = r.height; };
  const inView = () => { const y = scrollY; return y + innerHeight > fTop && y < fTop + fH; };
  if ("ResizeObserver" in window) new ResizeObserver(() => { measure(); kick(); }).observe(document.body);

  function tick() {
    raf = 0;
    if (!inView() || document.hidden) { setInFilm(false); video.pause(); return; }
    paint(blocked && video.paused ? STILL : sAt(video.currentTime));
    raf = requestAnimationFrame(tick);
  }
  function play() {
    if (shot || !video.paused) return;
    const p = video.play();
    if (p && p.catch) p.catch(() => {
      if (blocked || !video.paused) return;
      blocked = true;
      onReady();
      const go = () => {
        removeEventListener("pointerdown", go); removeEventListener("keydown", go);
        video.play().then(() => { blocked = false; }).catch(() => {});
      };
      addEventListener("pointerdown", go); addEventListener("keydown", go);
    });
  }
  function kick() {
    const vis = inView() && !document.hidden;
    if (!vis) { setInFilm(false); video.pause(); return; }
    /* play() gleich aufrufen: Safari auf dem iPhone lädt ein Video
       erst, wenn es abgespielt werden soll */
    play();
    if (!raf) raf = requestAnimationFrame(tick);
  }

  /* Drehen des Geräts: passende Fassung, gleiche Stelle */
  let rzT = 0;
  function load(k) {
    const t = video.currentTime || 0, was = ready;
    variant = k;
    video.poster = "assets/film/poster-" + (k === "wide" ? "w" : "s") + ".jpg";
    video.src = SRC[k] + EXT;
    if (was) video.addEventListener("loadedmetadata", () => { video.currentTime = t; kick(); }, { once: true });
  }
  function swap() { const k = pick(); if (k !== variant) load(k); }
  addEventListener("scroll", kick, { passive: true });
  addEventListener("resize", () => { measure(); kick(); clearTimeout(rzT); rzT = setTimeout(swap, 500); });
  document.addEventListener("visibilitychange", kick);

  /* ---------- Start: Logo steht, bis das Video läuft ---------- */
  film.classList.add("film-loading");
  measure();
  paintUI(0);

  function onReady() {
    if (ready) return;
    ready = true;
    film.classList.remove("film-loading");
    film.classList.add("film-ready");
    lastS = -1;
    if (shot) { video.pause(); video.currentTime = tAt(+shot[1]); }
    kick();
  }
  /* Bereit, sobald das erste Bild da ist oder der Film läuft */
  for (const ev of ["loadeddata", "canplay", "playing"]) video.addEventListener(ev, onReady);
  /* Nur wenn das Video gar nicht geladen werden kann, fällt der Film weg;
     ein langsames Netz lässt einfach das Logo etwas länger stehen */
  video.addEventListener("error", () => { if (!ready) bail(); });
  function bail() {
    if (film.classList.contains("film-off") || ready) return;
    const r = film.getBoundingClientRect();
    const inside = r.top <= 0 && r.bottom > innerHeight * .5;
    off();
    if (inside) scrollTo({ top: film.offsetTop + film.offsetHeight, behavior: "instant" });
  }

  load(pick());
  kick();
}
