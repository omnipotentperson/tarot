<div align="center">

# ✦ THE VEIL ✦
### *Tarot · Astrology · Divination · Ritual Intelligence*

[![Version](https://img.shields.io/badge/Version-1.3.0-gold?style=for-the-badge)](#)
[![Focus](https://img.shields.io/badge/Focus-Spiritual_Tooling-purple?style=for-the-badge)](#)

---
*“The lips of wisdom are closed, except to the ears of Understanding.”*
---

</div>

## 🌒 Overview
**The Veil** is a high-fidelity digital sanctuary for the modern practitioner. By bridging ancient hermetic wisdom with a refined "Gold-on-Ink" aesthetic, it provides an immersive environment for self-reflection and occult study.

---

## 🧭 Core Features

* **🎴 Sacred Readings:** A randomized engine designed to mimic the physical act of cutting the deck, mirroring your current energetic frequency.
* **📖 The Great Archives:** A searchable digital grimoire containing all 78 Tarot cards with deep-dive elemental associations.
* **🕯️ Mystical Reference:** Modular grids for Candles, Crystals, Herbs, and Deities to ensure ritual intent matches material frequency.

---

## 🗺️ Project Roadmap

| Phase | Title | Features | Status |
| :--- | :--- | :--- | :--- |
| **🌑 I** | **Waxing Moon** | Sigil Generator (Kamea), **Grimoire PDF Export** | 🚧 Completed! |
| **🌓 II** | **First Quarter** | Transit Overlays, Relationship Analysis, Aspect Grid | 📅 Planned |
| **🌕 III** | **Full Moon** | Ritual Journal, Reverse Card Logic | 🔮 Vision |

## Updates

### **Phase 3: The Digital Grimoire (Current Status)**
* **Model Migration:** Standardized on `gpt-4o` for high-reasoning mystical analysis (replacing previous Claude implementations).
* **Intention Logic:** Integrated a dedicated "Intention" field. The AI prompt now prepends: *"The querent's focus: [User Input]"* to tailor the reading.
* **Astro-Physics Overhaul:**
    * **Julian Day:** Now calculated in **UT (Universal Time)** to eliminate local timezone drift.
    * **Ascendant Calculation:** Implemented True Local Sidereal Time using the **GMST formula** and longitude-based offsets for precise Rising sign accuracy.
* **Reading Ledger:**
    * Saves the last **20 readings** to `localStorage`.
    * Collapsible history panel allows for instant reloading of cards and AI text.
    * "Clear Ledger" privacy toggle included.
* **Moon Phase Engine:** Zero-API local calculation displaying phase symbol, name, and spiritual context.

---

## ✨ Feature Spotlight: The Sigil Forge
The Sigil Forge is a modular vector generator designed to bridge intent with visual manifestation. It supports three distinct schools of sigilization:

### **1. Chaos Magic (Letter-Mapping)**
Based on traditional Austin Osman Spare techniques:
* **Logic:** Strips vowels and duplicate letters from your intention string.
* **Generation:** Remaining characters are mapped to connection points on a circular grid, creating a unique, abstract glyph.

### **2. Geometric (Sacred Geometry)**
* **Logic:** Uses polygon star patterns and algorithmic symmetry.
* **Generation:** Draws from a series of nested polygons to create high-order geometric sigils based on the mathematical "weight" of your intention.

### **3. Runic (Radial Script)**
* **Logic:** Inspired by Norse bindrunes and radial staves.
* **Generation:** Utilizes radial strokes and stroke-weight variations to generate a sigil that resembles ancient runic inscriptions.

**Technical Specs:**
* **Export:** All sigils are generated as **SVGs**, allowing for infinite scaling without pixelation.
* **Download:** Direct "Download SVG" button for use in digital journals or physical printing.

---

## ♿ Accessibility & Utility
* **Aria-Ready:** Full implementation of ARIA roles on navigation, modals, and main content blocks.
* **Keyboard Navigation:** Added a "Skip to Content" link and aria-labels for all interactive elements.
* **Shareable Insights:** "Share Reading" button encodes the spread and card IDs into a URL parameter. This allows anyone with the link to view the exact same draw and AI interpretation without a database.
* **Print to Grimoire:** Added a specialized CSS print media query for high-quality "Grimoire-style" physical printing of readings and charts.

---

## 🛠️ Technical Architecture
* **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3.
* **Typography:** [Cinzel](https://fonts.google.com/specimen/Cinzel) & [Spectral](https://fonts.google.com/specimen/Spectral).
* **Data:** Modular JSON Archives (`reference.json`, `tarot.json`).

---

<div align="center">

**As above, so below.**

**Blessed Be.**
</div>
