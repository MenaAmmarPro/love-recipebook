# Recipes for You — Love for Mena

A little cookbook for the two of us: the things we'd actually make together,
with a button for the nights we can't decide. Part of the **Love for Mena**
collection.

**Live:** https://menaammarpro.github.io/love-recipebook/

## What it does

- Five **starter recipes** (pizza first, always — plus chai, cacio e pepe,
  brownies and shakshuka)
- **Pick for us** chooses a recipe and never repeats the last one
- Open a card for **ingredients** and **method**
- Add your own recipes (one ingredient/step per line)
- Mark "we made this" so it counts how often it's cooked
- Remove a recipe, or return to the starter book
- Everything stays on the device — no tracking, no network calls
- Installable PWA with offline support

## How it works

Recipes are stored in localStorage under `mena-recipes`. The starter set is in
the `STARTER` array at the top of `js/app.js` and comes back on reset.

## Files

- `index.html` — the page
- `css/theme.css` — shared love-theme (copied from `_love-theme/`)
- `css/app.css` — page-specific styles (cards + form)
- `js/theme-main.js`, `js/effects.js` — shared behaviour/effects
- `js/app.js` — recipe book logic
- `manifest.webmanifest`, `sw.js` — PWA
- `assets/` — favicon and icons

## Run locally

```powershell
py -m http.server 8000
```

Then visit http://localhost:8000.

## Deploy

Static site, deployed with GitHub Pages from `main`.

## License

Creative Commons BY-NC-ND 4.0 — see [`LICENSE`](LICENSE).
© 2026 Ammar (MenaAmmarPro). Made with care for Mena.
