/* =========================================================
   KB Bedachungen – Scroll-Intro (film.js)
   Spielt den vorgerenderten Film (Blender/Cycles, 200 Bilder, 24 fps)
   ab: ein <video> wird nicht abgespielt, sondern vom Scrollen gescrubbt.
   Die Datei wird als Blob geladen, damit das Springen zwischen Bildern
   sofort geht – auch auf iOS und Android. Logo, Texte, Schritte,
   Abspann und Weissblende hängen wie bisher direkt an der Scrollposition,
   rückwärts läuft alles natürlich zurück.
   ========================================================= */
const film = document.getElementById("film");
if (film) start();

function start() {
  const clamp = v => (v < 0 ? 0 : v > 1 ? 1 : v);

  /* ---------- Zeitachse: Bild 1..200 deckt s = 0.04 .. 1.00 ab ---------- */
  const N = 200, FPS = 24, S0 = 0.04, S1 = 1.0;
  const frameAt = s => {
    const f = Math.round(1 + clamp((s - S0) / (S1 - S0)) * (N - 1));
    return f < 1 ? 1 : f > N ? N : f;
  };
  /* Mitte des Bildes anspringen, damit immer genau dieses Bild steht */
  const timeAt = f => (f - 0.5) / FPS;

  /* ---------- Quellen: quer = 16:9, Hochformat = quadratisch ---------- */
  const SRC = {
    wide: { v: "assets/film/film-1280.mp4", p: "assets/film/poster-1280.jpg" },
    sq:   { v: "assets/film/film-sq.mp4",   p: "assets/film/poster-sq.jpg" }
  };
  const pick = () => (innerHeight > innerWidth && innerWidth <= 900 ? "sq" : "wide");

  const stage = document.getElementById("filmStage");
  const video = document.getElementById("filmVideo");
  const skip  = document.getElementById("filmSkip");

  const off = () => {
    film.classList.remove("film-loading", "film-ready");
    film.classList.add("film-off");
    document.body.classList.remove("in-film");
  };

  /* Reduzierte Bewegung oder kein Video möglich: Film einklappen.
     Ob der Browser das MP4 wirklich kann, zeigt sich beim Laden –
     scheitert es, greift derselbe Notausgang (siehe bail()). */
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !stage || !video || typeof video.canPlayType !== "function") { off(); return; }

  /* Überspringen: direkt zur Seite, ohne den Film im Schnelldurchlauf */
  if (skip) skip.addEventListener("click", () => scrollTo({ top: film.offsetTop + film.offsetHeight, behavior: "instant" }));

  /* Ton und Vollbild sind hier nie erwünscht – auch als Eigenschaft setzen,
     sonst spielt iOS das Video nicht stumm und verweigert das Scrubben. */
  video.muted = true; video.defaultMuted = true; video.playsInline = true;
  video.loop = false; video.controls = false; video.autoplay = false;

  /* ---------- Film laden ---------- */
  let variant = null, objUrl = null, ready = false, swapping = false;

  /* Ganze Datei holen, damit sie lokal liegt und das Springen sofort geht.
     Klappt das nicht, wird notfalls direkt von der URL gestreamt. */
  let gotBytes = false;
  async function grab(kind) {
    try {
      const res = await fetch(SRC[kind].v, { cache: "force-cache", credentials: "same-origin" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      gotBytes = true;
      const blob = await res.blob();
      if (!blob || blob.size < 1024) throw new Error("leer");
      return { url: URL.createObjectURL(blob), blob: true };
    } catch (e) {
      return { url: SRC[kind].v, blob: false };
    }
  }

  function attach(kind, src, keep) {
    return new Promise((res, rej) => {
      const done = () => { clean(); res(); };
      const bad  = () => { clean(); rej(new Error("video")); };
      const clean = () => {
        video.removeEventListener("loadeddata", done);
        video.removeEventListener("error", bad);
        clearTimeout(t);
      };
      const t = setTimeout(bad, 30000);
      video.addEventListener("loadeddata", done);
      video.addEventListener("error", bad);
      video.poster = SRC[kind].p;
      video.src = src.url;
      video.load();
    }).then(() => {
      const old = objUrl;
      objUrl = src.blob ? src.url : null;
      if (old && old !== src.url) URL.revokeObjectURL(old);
      variant = kind;
      shown = 0; want = -1;
      if (keep != null) { try { video.currentTime = keep; } catch (e) {} }
    });
  }

  const load = kind => grab(kind).then(src => attach(kind, src, null));

  /* ---------- Bildweise springen, ohne das Video zu überfahren ---------- */
  let shown = 0, want = -1;
  function show(f) {
    if (!ready || f === shown) return;
    if (video.seeking) { want = f; return; }
    want = -1; shown = f;
    try { video.currentTime = timeAt(f); } catch (e) {}
  }
  function flush() {
    if (want < 0) return;
    const f = want; want = -1;
    if (f !== shown) { shown = f; try { video.currentTime = timeAt(f); } catch (e) {} }
  }
  video.addEventListener("seeked", () => { flush(); kick(); });

  /* iOS zeigt bei einem nie gestarteten Video oft kein Bild: einmal kurz
     starten und sofort anhalten, solange der Film noch unsichtbar ist. */
  let unlocked = false, tries = 0;
  function unlock() {
    if (unlocked || tries > 3 || !video.src) return;
    tries++;
    try {
      const p = video.play();
      if (p && p.then) p.then(() => { unlocked = true; video.pause(); flushBack(); }).catch(() => {});
      else { unlocked = true; video.pause(); flushBack(); }
    } catch (e) {}
  }
  const flushBack = () => { shown = 0; need = true; kick(); };
  addEventListener("pointerdown", unlock, { passive: true });
  addEventListener("touchstart", unlock, { passive: true });

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
  const win01 = (s, a, b, f = .035) => Math.min(clamp((s - a) / f), clamp((b - s) / f));

  function paintUI(s) {
    document.body.classList.toggle("in-film", s < .985 && inView());
    if (!ready) return; /* solange geladen wird, steht nur das Logo (siehe .film-loading) */
    const lo = clamp((s - .035) / .07);
    if (ui.logo) {
      ui.logo.style.opacity = 1 - lo;
      ui.logo.style.transform = `translateY(${-40 * lo}px) scale(${1 - .05 * lo})`;
      ui.logo.style.visibility = lo >= 1 ? "hidden" : "";
    }
    if (ui.hint) ui.hint.style.opacity = 1 - clamp(s / .03);
    stage.style.opacity = clamp((s - .02) / .09);
    for (const l of ui.lines) {
      const o = win01(s, l.a, l.b);
      l.el.style.opacity = o;
      l.el.style.transform = `translateY(${(1 - o) * (s < (l.a + l.b) / 2 ? 24 : -24)}px)`;
    }
    for (const g of ui.steps) {
      g.el.style.opacity = win01(s, g.a, g.b, .02);
      for (const l of g.li) l.el.classList.toggle("on", s >= l.t);
    }
    if (ui.end) {
      const eo = clamp((s - .875) / .035);
      ui.end.style.opacity = eo;
      ui.end.style.transform = `translateY(${(1 - eo) * 24}px)`;
      ui.end.style.pointerEvents = eo > .5 ? "auto" : "none";
    }
    if (ui.fade) ui.fade.style.opacity = clamp((s - .955) / .045);
    /* Der Abspann blendet ab .875 ein – der Knopf geht vorher aus, damit
       sich beides auf kleinen Displays nicht in die Quere kommt. */
    if (ui.skip) { ui.skip.style.opacity = s > .87 ? 0 : 1; ui.skip.style.pointerEvents = s > .87 ? "none" : ""; }
  }

  let lastS = -1;
  function paint(s) {
    if (s === lastS) return;
    lastS = s;
    if (ready) show(frameAt(s));
    paintUI(s);
  }

  /* ---------- Scroll-Kopplung mit weichem Nachlauf ---------- */
  const still = /filmshot/.test(location.search); /* nur für Testbilder */
  let target = 0, cur = 0, raf = 0, need = true, last = performance.now();
  const progress = () => { const r = film.getBoundingClientRect(), span = r.height - innerHeight; return span > 0 ? clamp(-r.top / span) : 0; };
  const inView = () => { const r = film.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };

  function tick(now) {
    raf = 0;
    const dt = Math.min(.1, (now - last) / 1000); last = now;
    const d = target - cur;
    cur = (Math.abs(d) < .0004 || still) ? target : cur + d * (1 - Math.exp(-dt * 9));
    if (!inView() || document.hidden) { document.body.classList.remove("in-film"); return; }
    if (need) { lastS = -1; need = false; }
    paint(cur);
    if (!video.seeking) flush();
    if (Math.abs(target - cur) > .0002 || want >= 0 || video.seeking) raf = requestAnimationFrame(tick);
  }
  function kick() {
    target = progress();
    const vis = inView();
    /* Springt man genau an den Rand des Abschnitts, läuft keine Schleife
       mehr – die Seite muss trotzdem wieder normal werden. */
    if (!vis) document.body.classList.remove("in-film");
    if (!raf && vis && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }

  /* Drehen des Geräts: passende Fassung nachladen, Bildstand behalten */
  let rzT = 0;
  function swap() {
    const k = pick();
    if (!ready || swapping || k === variant) return;
    swapping = true;
    const keep = video.currentTime;
    grab(k).then(src => attach(k, src, keep)).then(() => {
      swapping = false; need = true; shown = 0; kick();
    }).catch(() => { swapping = false; });
  }
  addEventListener("scroll", kick, { passive: true });
  addEventListener("resize", () => { need = true; kick(); clearTimeout(rzT); rzT = setTimeout(swap, 500); });
  addEventListener("orientationchange", () => { need = true; clearTimeout(rzT); rzT = setTimeout(swap, 500); });
  document.addEventListener("visibilitychange", kick);

  /* ---------- Start: Logo steht, im Hintergrund lädt der Film ---------- */
  film.classList.add("film-loading");
  /* Standbild schon jetzt setzen, damit beim Einhängen des Films nichts aufblitzt */
  video.poster = SRC[pick()].p;
  cur = target = progress();
  paintUI(cur);
  kick();

  /* Lädt nichts, bleibt das Logo stehen und man scrollt normal weiter.
     Kommt gar nichts an, wird der Film ganz übersprungen. */
  let waited = 0;
  const watch = setInterval(() => {
    if (ready) { clearInterval(watch); return; }
    waited += 1000;
    /* Nur abbrechen, wenn wirklich nichts ankommt. Läuft die Leitung nur
       langsam, bleibt das Logo stehen und der Film kommt nach. */
    if (waited >= 20000 && !gotBytes && video.readyState === 0) { clearInterval(watch); bail(); }
  }, 1000);

  function bail() {
    if (film.classList.contains("film-off")) return;
    const r = film.getBoundingClientRect();
    const inside = r.top <= 0 && r.bottom > innerHeight * .5;
    off();
    if (inside) scrollTo({ top: film.offsetTop + film.offsetHeight, behavior: "instant" });
  }

  load(pick()).then(() => {
    clearInterval(watch);
    ready = true;
    film.classList.remove("film-loading");
    film.classList.add("film-ready");
    unlock();
    shown = 0; want = -1; need = true; lastS = -1;
    paint(cur);
    kick();
  }).catch(() => { clearInterval(watch); bail(); });
}
