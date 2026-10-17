# The Veil — Learning Notes

## Architecture
- `index.html` holds semantic structure and SEO metadata.
- `styles.css` preserves the visual language; seasonal themes work through `--gold` / `--gold-rgb` CSS variables overridden per `body.season-*` class.
- `app.js` manages UI state, readings, favorites, print flow, PWA install flow, and section rendering.
- `astrology.js` handles chart math, moon phase, zodiac helpers, and wheel generation. All positions validated against the `astronomy-engine` reference library (≤0.1° for planets/Sun/ascendant/MC; Moon ≤0.9° from the truncated perturbation series).
- `data/reference.json` stores the reference library, candle colors, and the full 78-card `fullDeck` (real upright/reversed meanings for every card — no network needed).
- `sw.js` makes the app installable and caches core files for offline use. Bump `CACHE` version when shipping changes.
- `functions/api/ai-reading.js` is a Cloudflare Pages Function: POSTs interpretation prompts to OpenAI. Needs `OPENAI_API_KEY` env var; model via `OPENAI_MODEL` (default `gpt-4.1-nano`, cheapest — check current availability, it was slated for retirement 2026-10-23). The client degrades gracefully when the endpoint is absent (local dev) or unconfigured.

## Key math notes (astrology.js)
- Orbital elements use days since **2000 Jan 0.0** (`daysSinceJ2000` subtracts 10956), not J2000.
- Earth's `w` (282.9404) already encodes the 180° flip, so: Sun longitude = atan2(earth.y, earth.x) with NO +180, and geocentric planets ADD Earth's vector (`p + earth`), not subtract.
- Ascendant uses the full-quadrant form; the old sign-flipped version computed the descendant.
- Birth-chart timezones come from `timeapi.io` (IANA zone for the coordinates) with `Intl`-based DST-aware conversion. Falls back to the viewer's timezone, then UTC. No birth time → `risingByTime()` table instead of a wheel.

## Cost controls for AI readings
- Server-side `max_tokens: 550` cap (client's value is ignored), input length caps, per-IP rate limit (20/hour, in-memory).
- Rough cost: ~$0.0003 per reading → ~3,300 readings per $1 on gpt-4.1-nano.

## Why this rebuild is safer
- No inline `onclick` handlers (except the print popup, which is a separate document).
- No dependency on external card-data APIs — the deck is bundled.
- Card images hotlink to Wikimedia Commons (public-domain RWS scans).
- Birth data never leaves the device except: city name → Nominatim (geocoding), coordinates → timeapi.io (timezone), reading prompts → OpenAI (only when the Pages Function is configured).
- The app stores private data locally and can be extended later.

## Future upgrade path
- User accounts / cloud sync: replace the `loadJSON`/`saveJSON` storage wrappers in `app.js` with API calls. The UI stays the same.
- If AI spend grows: the rate limiter in `functions/api/ai-reading.js` is per-isolate; move to Cloudflare KV or put readings behind login.
