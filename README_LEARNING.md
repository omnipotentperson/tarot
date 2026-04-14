# The Veil — Learning Notes

## Architecture
- `index.html` holds semantic structure and SEO metadata.
- `styles.css` preserves the visual language of the live site.
- `app.js` manages UI state, readings, favorites, print flow, PWA install flow, and section rendering.
- `astrology.js` handles chart math, moon phase, zodiac helpers, and wheel generation.
- `data/reference.json` stores the cleaned reference library and fallback tarot deck.
- `sw.js` makes the app installable and caches core files for offline use.

## Why this rebuild is safer
- No inline `onclick` handlers.
- No dependency on `/api/geocode` or `/api/ai-reading`.
- Broken data rows are cleaned before use.
- The app stores private data locally and can be extended later.

## Future upgrade path
To add user accounts and cloud sync later, replace the storage wrappers in `app.js` with API calls or a cloud SDK. The UI can stay mostly the same.
