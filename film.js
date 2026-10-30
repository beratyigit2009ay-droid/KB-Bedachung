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
  const SMAP = [0,.0069,.0139,.0208,.0278,.0347,.042,.0501,.0583,.0665,.0746,.0828,.091,.0992,.1073,.1155,.1236,.1317,.1396,.1473,.1548,.1621,.1692,.1764,.1836,.1911,.1987,.2065,.2145,.2227,.2309,.239,.2472,.2554,.2635,.2717,.2799,.2881,.2962,.3044,.3126,.3207,.3289,.3371,.3452,.3534,.3616,.3698,.3779,.3861,.3943,.4024,.4106,.4188,.4269,.4351,.4433,.4515,.4596,.4678,.476,.4841,.4923,.5005,.5086,.5168,.5249,.5328,.5404,.5475,.5542,.5605,.5665,.5723,.5778,.5833,.5888,.5943,.5999,.6057,.6115,.6176,.6237,.63,.6362,.6422,.6481,.6536,.6589,.6639,.6685,.673,.6773,.6815,.6855,.6896,.6936,.6976,.7016,.7057,.71,.7143,.7188,.7235,.7285,.7336,.7391,.7448,.751,.7576,.7647,.7721,.7799,.7879,.796,.804,.8117,.8191,.826,.8324,.8385,.8443,.8498,.8552,.8604,.8655,.8707,.8759,.8812,.8867,.8924,.8984,.9048,.9116,.919,.9267,.9347,.9428,.951,.9592,.9673,.9755,.9837,.9918,1];
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
  let fTop = 0, fH = 1;
  const measure = () => { const r = film.getBoundingClientRect(); fTop = r.top + scrollY; fH = r.height; };
  const inView = () => { const y = scrollY; return y + innerHeight > fTop && y < fTop + fH; };
  if ("ResizeObserver" in window) new ResizeObserver(() => { measure(); kick(); }).observe(document.body);

  function tick() {
    raf = 0;
    if (!inView() || document.hidden) { setInFilm(false); video.pause(); return; }
    paint(sAt(video.currentTime));
    raf = requestAnimationFrame(tick);
  }
  function play() {
    if (shot || !video.paused) return;
    const p = video.play();
    if (p && p.catch) p.catch(() => {
      /* Autoplay gesperrt (z. B. Stromsparmodus): beim ersten Tippen starten */
      const go = () => { removeEventListener("pointerdown", go); removeEventListener("keydown", go); video.play().catch(() => {}); };
      addEventListener("pointerdown", go); addEventListener("keydown", go);
    });
  }
  function kick() {
    const vis = inView() && !document.hidden;
    if (!vis) { setInFilm(false); video.pause(); return; }
    if (ready) play();
    if (!raf) raf = requestAnimationFrame(tick);
  }

  /* Drehen des Geräts: passende Fassung, gleiche Stelle */
  let rzT = 0;
  function load(k) {
    const t = video.currentTime || 0, was = ready;
    variant = k;
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
    clearTimeout(watch);
    ready = true;
    film.classList.remove("film-loading");
    film.classList.add("film-ready");
    lastS = -1;
    if (shot) { video.pause(); video.currentTime = tAt(+shot[1]); }
    kick();
  }
  video.addEventListener("canplay", onReady);
  video.addEventListener("error", () => { if (!ready) bail(); });

  /* Kommt nichts an, wird der Film übersprungen */
  const watch = setTimeout(() => { if (!ready && video.readyState < 2) bail(); }, 20000);
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
