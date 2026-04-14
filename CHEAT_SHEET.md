# The Veil — Foolproof Cheat Sheet

## 1) Safest files to edit
- `index.html` = structure and text labels
- `styles.css` = colors, spacing, typography
- `app.js` = UI logic
- `astrology.js` = chart math
- `data/reference.json` = oils, herbs, crystals, candles, deities, and fallback tarot cards

## 2) Change the title shown on the site
Open `index.html` and change:
```html
<div class="site-title">The Veil</div>
```

## 3) Change theme colors
Open `styles.css` and edit the variables at the top:
```css
:root {
  --ink: #0d0a12;
  --parchment: #f5ede0;
  --gold: #c9a84c;
}
```

## 4) Add a new oil
Open `data/reference.json`, find `reference -> oils`, then add a new object:
```json
{
  "name": "Lavender",
  "properties": "Calm - sleep - purification - gentle protection",
  "zodiac": "Virgo - Libra",
  "planet": "Mercury - Venus",
  "element": "Air"
}
```
Keep the commas correct. Every object except the last one needs a trailing comma.

## 5) Add a new card to the fallback tarot deck
In `data/reference.json`, find `fallbackDeck` and add:
```json
{
  "name": "Ace of Cups",
  "arcana": "Minor",
  "suit": "cups",
  "meaning_up": "New feelings, openness, emotional renewal.",
  "meaning_rev": "Blocked emotion, hesitation, a delayed opening.",
  "desc": "A fresh emotional current."
}
```

## 6) Change a section name in the nav
In `index.html`, find the nav button and edit its text.
Example:
```html
<button class="nav-btn" data-section="reference">Reference</button>
```

## 7) Print any section
`app.js` contains the reusable helper:
```js
printSection('reference', 'Reference Guide')
```
You can use the same pattern for any visible block.

## 8) How favorites work
Favorites are stored in the browser with `localStorage`.
Cards use:
```js
APP.favorites.cards
```
Reference items use:
```js
APP.favorites.reference
```

## 9) How saved readings work
Saved readings are stored in the browser with:
```js
STORAGE_KEYS.readings
```
That means they stay private to the device/browser unless you add cloud sync later.

## 10) How the birth chart works
The chart is generated in `astrology.js`.
Main entry point:
```js
AstrologyEngine.generateChart({ dateStr, timeStr, city })
```
This returns:
- natal planets
- transit planets
- ascendant
- wheel SVG
- interpretation text

## 11) Seasonal themes
The theme system lives in `app.js`.
Main functions:
- `initSeasonTheme()`
- `applySeasonTheme(value)`
- `seasonForDate(date)`

If you want to change the date windows, edit `seasonForDate(date)`.

## 12) Add cloud saving later
Keep these wrappers and replace their internals later:
```js
loadJSON(key, fallback)
saveJSON(key, value)
```
That is the easiest path for adding Firebase, Supabase, or your own API.

## 13) Turn this into an Android app later
Fastest future path:
- keep this PWA working cleanly
- wrap it later in Capacitor or another WebView-based shell
- reuse most of the same HTML/CSS/JS

## 14) When the site seems stuck on old code
Do these in order:
1. hard refresh
2. clear browser cache
3. bump the cache name in `sw.js`

Example:
```js
const CACHE = 'the-veil-v2';
```

## 15) The easiest safe editing workflow
1. copy the whole project folder
2. make one change at a time
3. refresh and test
4. only then make the next change

## 16) Do-not-break zones
Be careful when editing:
- `data-section` values in the nav
- `data-ref-tab` values for reference tabs
- the IDs used by buttons and inputs
- the JSON syntax in `data/reference.json`

## 17) If a section stops being clickable
Check the browser console first.
A single JS syntax error can stop all interactions.

## 18) If the chart fails again
Test with:
- date filled in
- optional time
- a simple city like `Brooklyn, NY`

If geocoding fails, the app now falls back instead of crashing.
