# KB Bedachungen

Website für KB Bedachungen, Dachdecker in Ichenhausen. Statische Single-Page aus HTML, CSS und Vanilla JS, ohne Frameworks und ohne Build-Schritt.

## Dateien
- `index.html` – Seite mit allen Abschnitten (Hero, Referenzen, Bewertungen, Über uns, Leistungen, Öffnungszeiten, Termin, FAQ, Footer, Impressum, Datenschutz)
- `styles.css` – Design und Animationen
- `film.js` – Scroll-Intro: modernes Gebäude in einer Wiesenlandschaft bei Sonnenuntergang, auf dem beim Scrollen Flachdach, Garagen-Foliendach und Dachterrasse fachgerecht entstehen (three.js)
- `script.js` – Logo im Intro, Scroll-Effekte, Öffnungszeiten-Status, Formular (öffnet WhatsApp mit vorbereiteter Nachricht), FAQ, SVG-Illustrationen
- `assets/logo.svg` – Logo als SVG
- `assets/img/` – Projektfotos
- `assets/vendor/` – three.js r160 (MIT-Lizenz, lokal eingebunden)
- `assets/fonts/` – Schriften lokal (keine Verbindung zu Google Fonts, DSGVO)
- `ki-bild-prompts.md` – 6 Prompts für KI-Bilder

## Lokal ansehen
`index.html` im Browser öffnen oder z. B. `python3 -m http.server` im Ordner starten.

## Vor dem Livegang noch ergänzen
- Impressum: Name des Inhabers, Handwerkskammer und Handwerksrollen-Nr., ggf. USt-IdNr. (in `index.html` im Bereich `sheet-impressum`)
- Optional: E-Mail-Adresse und Instagram-Link, sobald vorhanden
