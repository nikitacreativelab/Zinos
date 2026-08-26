# zino's Website

Astro-Website für zino's – Deutschlands erste Spritzbar. Struktur und ruhige Scroll-Animationen sind an [klimtwine.com](https://klimtwine.com/en) angelehnt; die Produkt-Sektion greift die "Flasche wechseln"-Idee von [ciaoenergy.com](https://www.ciaoenergy.com) auf (Klick auf eine Sorte springt zur passenden Produkt-Sektion mit eigener WebGL-Flaschen-Animation).

## Entwicklung

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deployment

Automatisch via GitHub Actions (`.github/workflows/deploy.yml`) auf GitHub Pages bei jedem Push auf `main`.

## Hinweis zum Shop

Die "In den Warenkorb"-Buttons verlinken direkt auf die jeweiligen Produktseiten im bestehenden Shopify-Shop (zinos.de), da Zahlungsabwicklung/Lagerbestand dort bereits laufen. Ein vollständig eigener Checkout wäre ein separates, deutlich größeres Projekt (Zahlungsanbieter, Rechtliches, Lagerverwaltung).

## 3D-Hinweis

Die Flaschen-Rotation nutzt echtes WebGL (Three.js): die vorhandenen Frontalfotos werden als texturierte Ebene in einer 3D-Szene mit Licht und sanfter Drehung dargestellt. Ein vollständiges volumetrisches 3D-Modell der Flaschen stand nicht zur Verfügung.
