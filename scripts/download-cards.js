// node scripts/download-cards.js
// Requires Node 18+ (fetch available) or 'node --experimental-fetch' / node-fetch.
// It will create assets/cards/ and data/card-images.json (mapping card name -> local path).
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const outDir = path.resolve('assets','cards');
await fs.mkdir(outDir, { recursive: true });

// map for majors (keeps same filenames used in app's fallback)
const major = {
  "The Fool":"Pictorial Key to the Tarot 00 The Fool.jpg",
  "The Magician":"Pictorial Key to the Tarot 01 The Magician.jpg",
  "The High Priestess":"Pictorial Key to the Tarot 02 The High Priestess.jpg",
  "The Empress":"Pictorial Key to the Tarot 03 The Empress.jpg",
  "The Emperor":"Pictorial Key to the Tarot 04 The Emperor.jpg",
  "The Hierophant":"Pictorial Key to the Tarot 05 The Hierophant.jpg",
  "The Lovers":"Pictorial Key to the Tarot 06 The Lovers.jpg",
  "The Chariot":"Pictorial Key to the Tarot 07 The Chariot.jpg",
  "Strength":"Pictorial Key to the Tarot 08 Strength.jpg",
  "The Hermit":"Pictorial Key to the Tarot 09 The Hermit.jpg",
  "Wheel of Fortune":"Pictorial Key to the Tarot 10 Wheel of Fortune.jpg",
  "Justice":"Pictorial Key to the Tarot 11 Justice.jpg",
  "The Hanged Man":"Pictorial Key to the Tarot 12 The Hanged Man.jpg",
  "Death":"Pictorial Key to the Tarot 13 Death.jpg",
  "Temperance":"Pictorial Key to the Tarot 14 Temperance.jpg",
  "The Devil":"Pictorial Key to the Tarot 15 The Devil.jpg",
  "The Tower":"Pictorial Key to the Tarot 16 The Tower.jpg",
  "The Star":"Pictorial Key to the Tarot 17 The Star.jpg",
  "The Moon":"Pictorial Key to the Tarot 18 The Moon.jpg",
  "The Sun":"Pictorial Key to the Tarot 19 The Sun.jpg",
  "Judgement":"Pictorial Key to the Tarot 20 Judgement.jpg",
  "Judgment":"Pictorial Key to the Tarot 20 Judgement.jpg",
  "The World":"Pictorial Key to the Tarot 21 The World.jpg"
};

const rankMap = {Ace:'01',Two:'02',Three:'03',Four:'04',Five:'05',Six:'06',Seven:'07',Eight:'08',Nine:'09',Ten:'10',Page:'11',Knight:'12',Queen:'13',King:'14'};
const suits = ['Wands','Cups','Swords','Pentacles'];

const map = {...major};
for(const rank of Object.keys(rankMap)){
  for(const suit of suits){
    map[`${rank} of ${suit}`] = `Pictorial Key to the Tarot ${suit} ${rankMap[rank]}.jpg`;
  }
}

const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

const outMap = {};
let counter = 0;
for(const [cardName, fileName] of Object.entries(map)){
  const slug = slugify(cardName);
  const outName = `${String(counter + 1).padStart(2,'0')}-${slug}.jpg`;
  const outPath = path.join(outDir, outName);
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=720`;
  console.log('Downloading', cardName, '→', outPath);
  try {
    const res = await fetch(url);
    if(!res.ok){
      console.warn('Failed to download', cardName, res.status);
      counter++;
      continue;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(outPath, buffer);
    outMap[cardName] = `assets/cards/${outName}`;
    // be polite
    await new Promise(r => setTimeout(r, 150));
  } catch(err){
    console.warn('Error', err && err.message);
  }
  counter++;
}

await fs.mkdir(path.resolve('data'), { recursive: true });
await fs.writeFile(path.resolve('data','card-images.json'), JSON.stringify(outMap, null, 2));
console.log('Wrote data/card-images.json with', Object.keys(outMap).length, 'entries');
