# The Veil — Tarot & Astrology

A self-hosted mystical web application for tarot readings, astrology, birth charts, sigil generation, and spiritual reference. Built with vanilla HTML/CSS/JavaScript on the frontend and a Node.js Express proxy server on the backend.

**Live site:** [tarot.homehosted.space](https://tarot.homehosted.space)

---

## Features

### Tarot Readings
- **6 spread types:** Daily Card, Three Card (Past/Present/Future), Celtic Cross (10 cards), Horseshoe (7 cards), Relationship (6 cards), Yes/No Oracle (5 cards)
- **Fan Draw:** 40 face-down cards spread in a fan — hover and intuitively select one
- **AI interpretations:** Each reading receives a tailored AI reading via OpenAI, specific to the spread type
- **Intention setting:** Type a question or focus before drawing; the AI includes it in the interpretation
- **Reversed cards:** 30% chance of reversal, with separate upright/reversed meanings
- **Card tooltips:** Hover over any drawn card to see its full meaning
- **Reading history:** Last 20 readings saved to localStorage; click any entry to reload
- **Shareable readings:** Generates a URL that encodes the spread for sharing
- **Grimoire export:** Save any reading as a styled dark-theme PDF

### Card Library
- Full 78-card Rider-Waite-Smith deck with images
- Filter by Major Arcana, Minor Arcana, or suit (Wands, Cups, Swords, Pentacles)
- Live search
- Click any card for full upright/reversed meanings in a modal
- **Print Reference Sheet:** Export current filtered view as a landscape PDF table

### Astrology
- Birthday input auto-detects zodiac sign
- Daily, weekly, and monthly horoscopes via freehoroscopeapi.com
- AI-expanded daily cosmic reading personalized to the sign
- **Current moon phase** widget with spiritual context

### Birth Chart
- Date, time (optional), and city of birth inputs
- City geocoded via Google Maps Geocoding API
- Calculates positions for Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
- Rising/Ascendant sign calculated when birth time is provided (uses Local Sidereal Time)
- **Transit overlay:** Today's planetary positions shown as a teal outer ring on the natal chart
- **Aspect lines:** Color-coded dashed lines between transit and natal planets (gold=conjunction, green=trine, red=square, orange=opposition)
- **Transit AI reading:** Separate reading analyzing how today's transits interact with the natal chart
- Planet table with sign and degree for each placement
- Dominant element and modality summary
- Grimoire export (includes chart wheel SVG + natal + transit readings)

### Sigil Forge
- Enter any intention and generate a unique sigil using three methods:
  - **Chaos Magic:** Letter reduction and connection-line method
  - **Geometric:** Polygon/star pattern based on letter count
  - **Runic:** Radial spoke and crossbar method
- Download sigil as SVG

### Reference Guide
- **Candle Colors:** 16 colors with visual swatches, properties, zodiac/planet/element correspondences
- **Crystals & Stones:** 78 stones with categories and full correspondences
- **Herbs:** 58 herbs with spiritual properties and correspondences
- **Essential Oils:** 33 oils with properties and correspondences
- **Deities:** 71 deities organized by pantheon (Greek/Roman, Egyptian, Norse, Celtic, Hindu, Yoruba/AfroCaribbean, Mesopotamian, Arthurian)
- Live search across all tabs
- Click any item for full detail modal

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML5, CSS3, JavaScript (ES6+) |
| Backend proxy | Node.js, Express |
| AI readings | OpenAI GPT-4.1-nano (via proxy) |
| Tarot data | [tarotapi.dev](https://tarotapi.dev) — free, no auth |
| Horoscopes | [freehoroscopeapi.com](https://freehoroscopeapi.com) — free, no auth |
| Geocoding | Google Maps Geocoding API (via proxy) |
| Card images | Sacred-texts.com (Rider-Waite, public domain) |
| Hosting | Self-hosted on DietPi (Intel) via Cloudflare Tunnel |
| Process manager | PM2 |

---

## Project Structure

```
civic-proxy/
├── server.js          # Express proxy server
├── .env               # API keys (not committed)
├── package.json
├── node_modules/
└── public/
    ├── index.html     # Full application (single file)
    ├── manifest.json  # PWA manifest
    ├── sw.js          # Service worker (offline support)
    ├── favicon.svg    # Gold star favicon
    └── card-back.png  # Custom card back design (optional)
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- PM2 (`npm install -g pm2`)
- A Cloudflare account with a tunnel configured (or any reverse proxy)

### 1. Clone the repo
```bash
git clone https://github.com/your-username/the-veil.git
cd the-veil/civic-proxy
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the `civic-proxy` directory:
```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
GOOGLE_API_KEY=your_google_maps_api_key
OPENSTATES_KEY=your_openstates_key_if_used
PORT=3005
```

The `OPENAI_API_KEY` is required for AI readings.
The `GOOGLE_API_KEY` is required for birth chart geocoding (city → lat/lng).

### 4. Start the server
```bash
pm2 start server.js --name civic-proxy
pm2 save
```

### 5. Access the site
```
http://localhost:3005
```

---

## API Routes

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/reps` | OpenStates legislative representatives by lat/lng |
| `GET` | `/api/geocode` | Google Maps geocoding (address → coordinates) |
| `POST` | `/api/ai-reading` | OpenAI proxy for all AI readings and interpretations |

All API keys are stored server-side in `.env` — never exposed to the browser.

---

## PWA Support

The Veil is installable as a Progressive Web App. On mobile:
- **Android (Chrome):** Tap the browser menu → "Add to Home Screen"
- **iOS (Safari):** Tap Share → "Add to Home Screen"

Once installed, the app launches in standalone mode with a dark status bar. Static assets are cached by the service worker for offline reference guide access.

---

## Seasonal Themes

The site automatically applies subtle color palette shifts based on the current date to align with the Wheel of the Year:

| Sabbat | Dates | Accent Color |
|---|---|---|
| Imbolc | Feb 1–28 | Silver/blue |
| Ostara | Mar 20 – Apr 30 | Soft green |
| Beltane | May 1–31 | Rose/pink |
| Litha | Jun 21 – Jul 31 | Bright gold |
| Lughnasadh | Aug 1–31 | Amber/wheat |
| Mabon | Sep 1–22 | Copper/rust |
| Samhain | Oct 23 – Nov 1 | Deep crimson |
| Yule | Dec 21 – Jan 31 | Ice blue/silver |

---

## Birth Chart Accuracy Notes

Planetary positions use simplified Jean Meeus algorithms accurate to ~1–2 degrees for most planets — suitable for general astrological readings. The ascendant/rising sign calculation uses Greenwich Mean Sidereal Time converted to Local Sidereal Time with a longitude-based timezone approximation.

For professional-grade precision, consider routing calculations through a dedicated ephemeris service such as AstroSeek or Swiss Ephemeris.

---

## Deployment via Cloudflare Tunnel

This project is deployed without opening any ports on the router. The Cloudflare tunnel (`cloudflared` running in Docker) routes `tarot.homehosted.space` directly to `localhost:3005`.

```yaml
# docker-compose.yaml
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    restart: unless-stopped
    command: tunnel --no-autoupdate run --token YOUR_TUNNEL_TOKEN
```

---

## Disclaimer

The Veil is intended for entertainment and personal reflection only. Tarot and astrology readings are not a substitute for professional advice.

---

## Support the Project

If you find The Veil useful or enjoyable, consider supporting its development:

- [CashApp](https://cash.app/$toyz4me)
- [Venmo](https://venmo.com/u/the_funko_deity)
- [PayPal](https://www.paypal.me/thefunkodeity)

---

## License

MIT License — feel free to fork and adapt for your own spiritual practice.
