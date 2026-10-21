# KB Bedachungen

Website für KB Bedachungen, Dachdecker in Ichenhausen. Statische Single-Page aus HTML, CSS und Vanilla JS, ohne Frameworks und ohne Build-Schritt.

## Dateien
- `index.html` – Seite mit allen Abschnitten (Hero, Referenzen, Bewertungen, Über uns, Leistungen, Öffnungszeiten, Termin, FAQ, Footer, Impressum, Datenschutz)
- `styles.css` – Design und Animationen
- `film.js` – Scroll-Intro: spielt den vorgerenderten Film (Blender Cycles) beim Scrollen als Bildfolge auf einem Canvas ab, mit weicher Überblendung zwischen den Bildern. Gezeigt wird ein modernes Gebäude am Ortsrand im Abendlicht, auf dem Flachdach, Garagen-Foliendach und Dachterrasse fachgerecht entstehen.
- `script.js` – Logo im Intro, Scroll-Effekte, Öffnungszeiten-Status, Formular (öffnet eine vorbereitete E-Mail an Info@kb-bedachungen.de), FAQ, SVG-Illustrationen
- `assets/logo.svg` – Logo als SVG
- `assets/img/` – Projektfotos
- `assets/film/` – der Film als 200 WebP-Bilder in je vier Paketen (grob nach fein): `w-*.bin` und `w.json` für Desktop und Querformat (1280×720), `s-*.bin` und `s.json` (quadratischer Ausschnitt, 720×720) für Handys im Hochformat
- `assets/fonts/` – Schriften lokal (keine Verbindung zu Google Fonts, DSGVO)
- `ki-bild-prompts.md` – 6 Prompts für KI-Bilder

## Lokal ansehen
`index.html` im Browser öffnen oder z. B. `python3 -m http.server` im Ordner starten.

## Vor dem Livegang noch ergänzen
- Impressum: Name des Inhabers, Handwerkskammer und Handwerksrollen-Nr., ggf. USt-IdNr. (in `index.html` im Bereich `sheet-impressum`)
- Optional: E-Mail-Adresse und Instagram-Link, sobald vorhanden
