/* =========================================================
   KB Bedachungen – Intro-Film (film.js)
   Der Film läuft als echtes Video in einer ruhigen Endlosschleife:
   fünf Bilder (Haus, Schweißnaht, Dachaufbau, Flachdach von oben,
   Haus nah) mit langsamen, gleichmäßigen Kamerafahrten und weichen
   Überblendungen. Der Browser spielt es mit der Grafikkarte ab.
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
  const SMAP = [0,.0069,.0139,.0208,.0278,.0347,.0417,.0486,.0556,.0625,.0694,.0764,.0833,.0903,.0972,.1042,.1111,.1181,.125,.1319,.1389,.1458,.1528,.1597,.1667,.1736,.1806,.1875,.1944,.2014,.2083,.2153,.2222,.2292,.2361,.2431,.25,.2569,.2639,.2708,.2778,.2847,.2917,.2986,.3056,.3125,.3194,.3264,.3333,.3403,.3472,.3542,.3611,.3681,.375,.3819,.3889,.3958,.4028,.4097,.4167,.4236,.4306,.4375,.4444,.4514,.4583,.4653,.4722,.4792,.4861,.4931,.5,.5069,.5139,.5208,.5278,.5347,.5417,.5486,.5556,.5625,.5694,.5764,.5833,.5903,.5972,.6042,.6111,.6181,.625,.6319,.6389,.6458,.6528,.6597,.6667,.6736,.6806,.6875,.6944,.7014,.7083,.7153,.7222,.7292,.7361,.7431,.75,.7569,.7639,.7708,.7778,.7847,.7917,.7986,.8056,.8125,.8194,.8264,.8333,.8403,.8472,.8542,.8611,.8681,.875,.8819,.8889,.8958,.9028,.9097,.9167,.9236,.9306,.9375,.9444,.9514,.9583,.9653,.9722,.9792,.9861,.9931,1];
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
