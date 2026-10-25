/* =========================================================
   KB Bedachungen – Scroll-Intro (film.js)
   Spielt den vorgerenderten Film (Blender/Cycles, 399 Bilder) als
   Bildfolge auf einem <canvas> ab. Zwischen zwei Bildern wird weich
   überblendet, so läuft der Film beim Scrollen stufenlos – ohne die
   Sprünge, die ein gescrubbtes <video> macht.
   Die Bilder kommen in wenigen Paketen, grob nach fein: nach dem ersten
   Paket (jedes 8. Bild) läuft der Film schon, die übrigen füllen nach.
   Logo, Texte, Schritte, Abspann und Weissblende hängen wie bisher an
   der Scrollposition, rückwärts läuft alles natürlich zurück.
   ========================================================= */
const film = document.getElementById("film");
if (film) start();

function start() {
  const clamp = v => (v < 0 ? 0 : v > 1 ? 1 : v);

  /* ---------- Zeitachse: Bild 1..N deckt s = 0.04 .. 1.00 ab ---------- */
  const S0 = 0.04, S1 = 1.0;
  let N = 399;
  const posAt = s => 1 + clamp((s - S0) / (S1 - S0)) * (N - 1); /* Bild als Kommazahl */

  /* ---------- Quellen: quer = 16:9, Hochformat = quadratisch ---------- */
  const BASE = "assets/film/";
  const SRC = { wide: { m: "w.json", w: 1280, h: 720 }, sq: { m: "s.json", w: 720, h: 720 } };
  const pick = () => (innerHeight > innerWidth && innerWidth <= 900 ? "sq" : "wide");

  const stage  = document.getElementById("filmStage");
  const canvas = document.getElementById("filmCanvas");
  const skip   = document.getElementById("filmSkip");
  const ctx = canvas && canvas.getContext ? canvas.getContext("2d", { alpha: false }) : null;

  const off = () => {
    film.classList.remove("film-loading", "film-ready");
    film.classList.add("film-off");
    document.body.classList.remove("in-film");
  };

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !stage || !ctx || typeof Blob === "undefined") { off(); return; }

  /* Überspringen: direkt zur Seite, ohne den Film im Schnelldurchlauf */
  if (skip) skip.addEventListener("click", () => scrollTo({ top: film.offsetTop + film.offsetHeight, behavior: "instant" }));

  /* ---------- Bilder laden ---------- */
  let variant = null, ready = false, gen = 0, gotBytes = false;
  let blobs = [];          /* blobs[f] = WebP-Daten von Bild f (1..N) */
  const cache = new Map(); /* entpackte Bilder rund um die aktuelle Stelle */
  const pending = new Set();
  const MAXC = 28;

  const bitmapOK = typeof createImageBitmap === "function";
  function decode(blob) {
    if (bitmapOK) return createImageBitmap(blob);
    return new Promise((res, rej) => {
      const img = new Image(), u = URL.createObjectURL(blob);
      img.onload = () => { URL.revokeObjectURL(u); res(img); };
      img.onerror = () => { URL.revokeObjectURL(u); rej(new Error("bild")); };
      img.src = u;
    });
  }
  const drop = bm => { if (bm && bm.close) try { bm.close(); } catch (e) {} };

  async function load(kind) {
    const my = ++gen;
    const res = await fetch(BASE + SRC[kind].m, { cache: "force-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const man = await res.json();
    if (my !== gen) return;
    gotBytes = true;
    variant = kind; N = man.n;
    blobs = new Array(N + 1);
    for (const bm of cache.values()) drop(bm);
    cache.clear(); pending.clear();
    canvas.width = SRC[kind].w; canvas.height = SRC[kind].h;
    drawn = -1;
    for (let i = 0; i < man.packs.length; i++) {
      const p = man.packs[i];
      const r = await fetch(BASE + p.file, { cache: "force-cache" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const buf = await r.blob();
      if (my !== gen) return;
      for (const [f, o, l] of p.frames) blobs[f] = buf.slice(o, o + l, "image/webp");
      if (i === 0) {
        /* erstes und letztes Bild sofort bereithalten */
        await want(Math.round(posAt(cur)));
        if (my !== gen) return;
        onFirst();
      }
      prefetch(); kick();
    }
  }

  /* Bild f entpacken (falls nötig) und im Zwischenspeicher halten */
  function want(f) {
    if (!blobs[f] || cache.has(f) || pending.has(f)) return Promise.resolve();
    pending.add(f);
    const my = gen;
    return decode(blobs[f]).then(bm => {
      pending.delete(f);
      if (my !== gen) { drop(bm); return; }
      cache.set(f, bm);
      trim();
      drawn = -1; kick();
    }).catch(() => pending.delete(f));
  }
  /* Nur die Bilder rund um die aktuelle Stelle behalten (Speicher) */
  function trim() {
    if (cache.size <= MAXC) return;
    const c = posAt(cur);
    const far = [...cache.keys()].sort((a, b) => Math.abs(b - c) - Math.abs(a - c));
    while (cache.size > MAXC) { const f = far.shift(); drop(cache.get(f)); cache.delete(f); }
  }
  /* Vorausladen in Scrollrichtung, ein paar Bilder auch zurück */
  let dir = 1;
  function prefetch() {
    if (!blobs.length) return;
    const c = Math.round(posAt(cur));
    for (let k = 0; k <= 12; k++) {
      const f = c + dir * k;
      if (f >= 1 && f <= N) want(f);
    }
    for (let k = 1; k <= 4; k++) {
      const f = c - dir * k;
      if (f >= 1 && f <= N) want(f);
    }
  }

  /* nächstes entpacktes Bild unter-/oberhalb einer Stelle */
  function near(f, step) {
    for (let g = f; g >= 1 && g <= N; g += step) if (cache.has(g)) return g;
    return 0;
  }

  /* ---------- Zeichnen: zwei Nachbarbilder weich überblendet ---------- */
  let drawn = -1;
  function draw(pos) {
    if (!ready) return;
    const a = Math.floor(pos);
    let la = near(a, -1), lb = near(a + 1, 1);
    if (!la && !lb) return;
    if (!la) la = lb;
    if (!lb) lb = la;
    /* Nur direkte Nachbarn überblenden. Fehlt ein Bild dazwischen (lädt
       noch), steht das nähere scharf da – sonst gäbe es Doppelbilder. */
    if (lb - la > 1) { if (pos - la < lb - pos) lb = la; else la = lb; }
    const t = lb === la ? 0 : (pos - la) / (lb - la);
    const key = la * 1e4 + lb + Math.round(t * 255) / 256;
    if (key === drawn) return;
    drawn = key;
    const W = canvas.width, H = canvas.height;
    ctx.globalAlpha = 1;
    ctx.drawImage(cache.get(la), 0, 0, W, H);
    if (lb !== la && t > 0.004) {
      ctx.globalAlpha = t;
      ctx.drawImage(cache.get(lb), 0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }

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
    if (ui.hint) css(ui.hint, "opacity", String(r3(1 - clamp(s / .03))));
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
    if (ready) draw(posAt(s));
    if (s === lastS) return;
    lastS = s;
    paintUI(s);
  }

  /* ---------- Scroll-Kopplung mit weichem Nachlauf ---------- */
  const still = /filmshot/.test(location.search); /* nur für Testbilder */
  let target = 0, cur = 0, raf = 0, need = true, last = performance.now();
  /* Lage des Abschnitts nur bei Größenänderung messen. Beim Scrollen
     reicht scrollY – so muss der Browser nie mitten im Bild das Layout
     neu berechnen. */
  let fTop = 0, fH = 1;
  const measure = () => { const r = film.getBoundingClientRect(); fTop = r.top + scrollY; fH = r.height; };
  const progress = () => { const span = fH - innerHeight; return span > 0 ? clamp((scrollY - fTop) / span) : 0; };
  const inView = () => { const y = scrollY; return y + innerHeight > fTop && y < fTop + fH; };
  if ("ResizeObserver" in window) new ResizeObserver(() => { measure(); kick(); }).observe(document.body);

  function tick(now) {
    raf = 0;
    const dt = Math.min(.1, (now - last) / 1000); last = now;
    const d = target - cur;
    if (Math.abs(d) > 1e-5) dir = d > 0 ? 1 : -1;
    cur = (Math.abs(d) < .0002 || still) ? target : cur + d * (1 - Math.exp(-dt * 4));
    if (!inView() || document.hidden) { setInFilm(false); return; }
    if (need) { lastS = -1; drawn = -1; need = false; }
    paint(cur);
    prefetch();
    if (Math.abs(target - cur) > .0001 || pending.size) raf = requestAnimationFrame(tick);
  }
  function kick() {
    target = progress();
    const vis = inView();
    /* Springt man genau an den Rand des Abschnitts, läuft keine Schleife
       mehr – die Seite muss trotzdem wieder normal werden. */
    if (!vis) setInFilm(false);
    if (!raf && vis && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }

  /* Drehen des Geräts: passende Fassung nachladen, Bildstand behalten */
  let rzT = 0;
  function swap() {
    const k = pick();
    if (!ready || k === variant) return;
    load(k).catch(() => {});
  }
  addEventListener("scroll", kick, { passive: true });
  addEventListener("resize", () => { measure(); need = true; kick(); clearTimeout(rzT); rzT = setTimeout(swap, 500); });
  addEventListener("orientationchange", () => { need = true; clearTimeout(rzT); rzT = setTimeout(swap, 500); });
  document.addEventListener("visibilitychange", kick);

  /* ---------- Start: Logo steht, im Hintergrund lädt der Film ---------- */
  film.classList.add("film-loading");
  measure();
  cur = target = progress();
  paintUI(cur);
  kick();

  /* Lädt nichts, bleibt das Logo stehen und man scrollt normal weiter.
     Kommt gar nichts an, wird der Film ganz übersprungen. */
  let waited = 0;
  const watch = setInterval(() => {
    if (ready) { clearInterval(watch); return; }
    waited += 1000;
    if (waited >= 20000 && !gotBytes) { clearInterval(watch); bail(); }
  }, 1000);

  function bail() {
    if (film.classList.contains("film-off") || ready) return;
    const r = film.getBoundingClientRect();
    const inside = r.top <= 0 && r.bottom > innerHeight * .5;
    off();
    if (inside) scrollTo({ top: film.offsetTop + film.offsetHeight, behavior: "instant" });
  }

  function onFirst() {
    if (ready) { need = true; kick(); return; }
    clearInterval(watch);
    ready = true;
    film.classList.remove("film-loading");
    film.classList.add("film-ready");
    need = true; lastS = -1;
    paint(cur);
    kick();
  }

  load(pick()).catch(() => { clearInterval(watch); bail(); });
}
