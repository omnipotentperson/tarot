# The Veil — Tarot, Astrology & Esoteric Grimoire

The Veil is an offline-capable Progressive Web Application (PWA) designed for tarot divination, natal astrology calculations, planetary transit tracking, and personal reflection. Hosted on Cloudflare Pages and powered by local ephemeris mathematics and local Rider-Waite-Smith illustrations.

---

## Table of Contents
1. Architectural Overview
2. Directory Structure
3. Local Setup & Testing
4. Tarot Image Engine & Assets
5. Astrological Mathematics
6. PWA & Service Worker Lifecycle
7. Cloudflare Edge Routing
8. How to Add New Features
9. Troubleshooting & Recovery

---

## 1. Architectural Overview

* Frontend: Vanilla JavaScript (ES6+), semantic HTML5, and responsive CSS (EB Garamond and Cinzel typography).
* Local-First: Runs completely offline once loaded or installed on mobile devices.
* Client-Side Privacy: All readings, history, and preferences stay in browser localStorage.
* Hybrid Image Engine: Uses local assets from assets/cards/ mapped through data/card-images.json, with Wikimedia Commons hotlinks as an automatic runtime fallback.

---

## 2. Directory Structure

* .github/workflows/download-cards.yml: Automated runner that downloads missing cards and pushes to main.
* assets/cards/: Directory containing all 78 local card images plus card backs.
* assets/card-back.png: Default fallback card texture.
* assets/favicon.svg: Application icon and PWA maskable icon.
* data/card-images.json: Mapping file connecting card names to local file paths.
* data/reference.json: Esoteric database for candles, deities, herbs, and crystals.
* functions/_middleware.js: Edge routing that normalizes /index.html and routes 404s.
* functions/api/ai-reading.js: Edge proxy calling OpenAI securely with server-side secrets.
* scripts/download-cards.sh: Downloader script with rate-limit avoidance and backoff.
* _headers: Security headers and Content Security Policy (CSP).
* app.js: Core UI wiring, card rendering, and event delegation.
* astrology.js: Mathematical engine for celestial transits and Placidus houses.
* index.html: Primary single-page application markup.
* manifest.json: Web application manifest for PWA installation.
* styles.css: Styling rules, color variables, and responsive layout.
* sw.js: Service worker precaching and offline fallback.

---

## 3. Local Setup & Testing

Run any lightweight static server in the repository root:

Using Python:
```bash
python3 -m http.server 8080
```

Using Node.js:
```bash
npx serve . -p 8080
```

Open your browser to http://localhost:8080.

---

## 4. Tarot Image Engine & Assets

Images are referenced in app.js via data/card-images.json. If a card is not listed in the JSON file, the application falls back to Wikimedia Commons.

### Running the Image Downloader Locally
```bash
chmod +x scripts/download-cards.sh
./scripts/download-cards.sh
```

### Running via GitHub Actions
1. Go to the Actions tab on your repository.
2. Select "Download Tarot Card Images and Commit".
3. Click "Run workflow" against the main branch.

---

## 5. Astrological Mathematics

The astrology.js script calculates positions without external paid APIs:
* Ephemeris Calculations: Planetary longitudes and aspects for the Sun, Moon, and 8 planets.
* Placidus House System: Calculates Ascendant and Midheaven based on birth city coordinates and time.
* Estimated Rising Times: Generates twelve 2-hour windows if birth time is unknown. Clicking any window sets the time to the window's midpoint and recalculates the wheel.

---

## 6. PWA & Service Worker Lifecycle

Caching is handled by sw.js:
* Install Phase: Caches core HTML, CSS, JavaScript, manifest, and data files.
* Activate Phase: Deletes any old cache version that does not match the current cache name.
* Cache Busting: To force all users to fetch new updates, increment CACHE in sw.js (e.g. from the-veil-v5 to the-veil-v6).

---

## 7. Cloudflare Edge Routing

* Root URL: https://tarot.erizzel.workers.dev/
* Functions Middleware: Rewrites /index.html to / to prevent Android PWA launch crashes, and serves 404.html when an invalid URL is requested.
* AI Proxy: /api/ai-reading accepts requests and forwards them to OpenAI using encrypted secrets (api_key and ai_model) configured in Cloudflare.

---

## 8. How to Add New Features

### Adding a Navigation Item
In index.html, add a button inside the #mainNav container:
```html
<button class="nav-btn" type="button" data-section="journal">
  Journal
</button>
```

Add the matching section panel inside main:
```html
<section id="journal" class="section">
  <div class="card-panel">
    <h2 class="section-title">Personal Journal</h2>
    <div id="journalContent" class="reading-text"></div>
  </div>
</section>
```

Navigation tabs toggle automatically using the data-section attribute.

### Using Design Tokens
Use the CSS variables defined in styles.css:
* --bg: Deep background (#0d0a12)
* --card-bg: Card container background (#130d1e)
* --gold: Accent borders and active buttons (#c9a84c)
* --gold-light: Heading and highlight gold (#e8c97e)
* --text: Primary text color (#f5ede0)
* --muted: Secondary and date text

---

## 9. Troubleshooting & Recovery

* Android PWA shows ERR_FAILED on launch:
  Uninstall the app via Android Settings -> Apps -> The Veil -> Uninstall. Clear browser site data in Chrome, then reinstall.
* Only three cards display locally:
  Increment the cache version in sw.js and push to main. In Chrome, visit chrome://serviceworker-internals/, find the domain, tap Unregister, and reload.
* Custom 404 not loading:
  Ensure functions/_middleware.js intercepts 404 statuses and serves /404.html from context.env.ASSETS.
