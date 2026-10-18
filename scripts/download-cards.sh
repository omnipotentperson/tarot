#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="assets/cards"
MAP_FILE="data/card-images.json"
USER_AGENT="TheVeilTarotBot/1.0 (https://github.com/omnipotentperson/tarot; tarot-app@erizzel.dev)"

mkdir -p "$TARGET_DIR"
mkdir -p "$(dirname "$MAP_FILE")"

# Complete 78-card list: "Card Name|Filename in Wikimedia Commons|Local Slug"
CARDS=(
  # Major Arcana (22)
  "The Fool|Pictorial Key to the Tarot 00 The Fool.jpg|00-the-fool.jpg"
  "The Magician|Pictorial Key to the Tarot 01 The Magician.jpg|01-the-magician.jpg"
  "The High Priestess|Pictorial Key to the Tarot 02 The High Priestess.jpg|02-the-high-priestess.jpg"
  "The Empress|Pictorial Key to the Tarot 03 The Empress.jpg|03-the-empress.jpg"
  "The Emperor|Pictorial Key to the Tarot 04 The Emperor.jpg|04-the-emperor.jpg"
  "The Hierophant|Pictorial Key to the Tarot 05 The Hierophant.jpg|05-the-hierophant.jpg"
  "The Lovers|Pictorial Key to the Tarot 06 The Lovers.jpg|06-the-lovers.jpg"
  "The Chariot|Pictorial Key to the Tarot 07 The Chariot.jpg|07-the-chariot.jpg"
  "Strength|Pictorial Key to the Tarot 08 Strength.jpg|08-strength.jpg"
  "The Hermit|Pictorial Key to the Tarot 09 The Hermit.jpg|09-the-hermit.jpg"
  "Wheel of Fortune|Pictorial Key to the Tarot 10 Wheel of Fortune.jpg|10-wheel-of-fortune.jpg"
  "Justice|Pictorial Key to the Tarot 11 Justice.jpg|11-justice.jpg"
  "The Hanged Man|Pictorial Key to the Tarot 12 The Hanged Man.jpg|12-the-hanged-man.jpg"
  "Death|Pictorial Key to the Tarot 13 Death.jpg|13-death.jpg"
  "Temperance|Pictorial Key to the Tarot 14 Temperance.jpg|14-temperance.jpg"
  "The Devil|Pictorial Key to the Tarot 15 The Devil.jpg|15-the-devil.jpg"
  "The Tower|Pictorial Key to the Tarot 16 The Tower.jpg|16-the-tower.jpg"
  "The Star|Pictorial Key to the Tarot 17 The Star.jpg|17-the-star.jpg"
  "The Moon|Pictorial Key to the Tarot 18 The Moon.jpg|18-the-moon.jpg"
  "The Sun|Pictorial Key to the Tarot 19 The Sun.jpg|19-the-sun.jpg"
  "Judgement|Pictorial Key to the Tarot 20 Judgement.jpg|20-judgement.jpg"
  "The World|Pictorial Key to the Tarot 21 The World.jpg|21-the-world.jpg"

  # Wands (14)
  "Ace of Wands|Pictorial Key to the Tarot Wands 01.jpg|ace-of-wands.jpg"
  "Two of Wands|Pictorial Key to the Tarot Wands 02.jpg|two-of-wands.jpg"
  "Three of Wands|Pictorial Key to the Tarot Wands 03.jpg|three-of-wands.jpg"
  "Four of Wands|Pictorial Key to the Tarot Wands 04.jpg|four-of-wands.jpg"
  "Five of Wands|Pictorial Key to the Tarot Wands 05.jpg|five-of-wands.jpg"
  "Six of Wands|Pictorial Key to the Tarot Wands 06.jpg|six-of-wands.jpg"
  "Seven of Wands|Pictorial Key to the Tarot Wands 07.jpg|seven-of-wands.jpg"
  "Eight of Wands|Pictorial Key to the Tarot Wands 08.jpg|eight-of-wands.jpg"
  "Nine of Wands|Pictorial Key to the Tarot Wands 09.jpg|nine-of-wands.jpg"
  "Ten of Wands|Pictorial Key to the Tarot Wands 10.jpg|ten-of-wands.jpg"
  "Page of Wands|Pictorial Key to the Tarot Wands 11.jpg|page-of-wands.jpg"
  "Knight of Wands|Pictorial Key to the Tarot Wands 12.jpg|knight-of-wands.jpg"
  "Queen of Wands|Pictorial Key to the Tarot Wands 13.jpg|queen-of-wands.jpg"
  "King of Wands|Pictorial Key to the Tarot Wands 14.jpg|king-of-wands.jpg"

  # Cups (14)
  "Ace of Cups|Pictorial Key to the Tarot Cups 01.jpg|ace-of-cups.jpg"
  "Two of Cups|Pictorial Key to the Tarot Cups 02.jpg|two-of-cups.jpg"
  "Three of Cups|Pictorial Key to the Tarot Cups 03.jpg|three-of-cups.jpg"
  "Four of Cups|Pictorial Key to the Tarot Cups 04.jpg|four-of-cups.jpg"
  "Five of Cups|Pictorial Key to the Tarot Cups 05.jpg|five-of-cups.jpg"
  "Six of Cups|Pictorial Key to the Tarot Cups 06.jpg|six-of-cups.jpg"
  "Seven of Cups|Pictorial Key to the Tarot Cups 07.jpg|seven-of-cups.jpg"
  "Eight of Cups|Pictorial Key to the Tarot Cups 08.jpg|eight-of-cups.jpg"
  "Nine of Cups|Pictorial Key to the Tarot Cups 09.jpg|nine-of-cups.jpg"
  "Ten of Cups|Pictorial Key to the Tarot Cups 10.jpg|ten-of-cups.jpg"
  "Page of Cups|Pictorial Key to the Tarot Cups 11.jpg|page-of-cups.jpg"
  "Knight of Cups|Pictorial Key to the Tarot Cups 12.jpg|knight-of-cups.jpg"
  "Queen of Cups|Pictorial Key to the Tarot Cups 13.jpg|queen-of-cups.jpg"
  "King of Cups|Pictorial Key to the Tarot Cups 14.jpg|king-of-cups.jpg"

  # Swords (14)
  "Ace of Swords|Pictorial Key to the Tarot Swords 01.jpg|ace-of-swords.jpg"
  "Two of Swords|Pictorial Key to the Tarot Swords 02.jpg|two-of-swords.jpg"
  "Three of Swords|Pictorial Key to the Tarot Swords 03.jpg|three-of-swords.jpg"
  "Four of Swords|Pictorial Key to the Tarot Swords 04.jpg|four-of-swords.jpg"
  "Five of Swords|Pictorial Key to the Tarot Swords 05.jpg|five-of-swords.jpg"
  "Six of Swords|Pictorial Key to the Tarot Swords 06.jpg|six-of-swords.jpg"
  "Seven of Swords|Pictorial Key to the Tarot Swords 07.jpg|seven-of-swords.jpg"
  "Eight of Swords|Pictorial Key to the Tarot Swords 08.jpg|eight-of-swords.jpg"
  "Nine of Swords|Pictorial Key to the Tarot Swords 09.jpg|nine-of-swords.jpg"
  "Ten of Swords|Pictorial Key to the Tarot Swords 10.jpg|ten-of-swords.jpg"
  "Page of Swords|Pictorial Key to the Tarot Swords 11.jpg|page-of-swords.jpg"
  "Knight of Swords|Pictorial Key to the Tarot Swords 12.jpg|knight-of-swords.jpg"
  "Queen of Swords|Pictorial Key to the Tarot Swords 13.jpg|queen-of-swords.jpg"
  "King of Swords|Pictorial Key to the Tarot Swords 14.jpg|king-of-swords.jpg"

  # Pentacles (14)
  "Ace of Pentacles|Pictorial Key to the Tarot Pentacles 01.jpg|ace-of-pentacles.jpg"
  "Two of Pentacles|Pictorial Key to the Tarot Pentacles 02.jpg|two-of-pentacles.jpg"
  "Three of Pentacles|Pictorial Key to the Tarot Pentacles 03.jpg|three-of-pentacles.jpg"
  "Four of Pentacles|Pictorial Key to the Tarot Pentacles 04.jpg|four-of-pentacles.jpg"
  "Five of Pentacles|Pictorial Key to the Tarot Pentacles 05.jpg|five-of-pentacles.jpg"
  "Six of Pentacles|Pictorial Key to the Tarot Pentacles 06.jpg|six-of-pentacles.jpg"
  "Seven of Pentacles|Pictorial Key to the Tarot Pentacles 07.jpg|seven-of-pentacles.jpg"
  "Eight of Pentacles|Pictorial Key to the Tarot Pentacles 08.jpg|eight-of-pentacles.jpg"
  "Nine of Pentacles|Pictorial Key to the Tarot Pentacles 09.jpg|nine-of-pentacles.jpg"
  "Ten of Pentacles|Pictorial Key to the Tarot Pentacles 10.jpg|ten-of-pentacles.jpg"
  "Page of Pentacles|Pictorial Key to the Tarot Pentacles 11.jpg|page-of-pentacles.jpg"
  "Knight of Pentacles|Pictorial Key to the Tarot Pentacles 12.jpg|knight-of-pentacles.jpg"
  "Queen of Pentacles|Pictorial Key to the Tarot Pentacles 13.jpg|queen-of-pentacles.jpg"
  "King of Pentacles|Pictorial Key to the Tarot Pentacles 14.jpg|king-of-pentacles.jpg"
)

# Load existing JSON map if present so we keep what was already downloaded
if [[ -f "$MAP_FILE" ]]; then
  echo "Found existing $MAP_FILE, updating..."
else
  echo "{}" > "$MAP_FILE"
fi

echo "Starting Tarot Card download (${#CARDS[@]} total)..."

for entry in "${CARDS[@]}"; do
  IFS="|" read -r card_name wiki_file local_slug <<< "$entry"
  dest_path="${TARGET_DIR}/${local_slug}"

  # Download if file is missing or empty
  if [[ ! -s "$dest_path" ]]; then
    encoded_file=$(python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1]))" "$wiki_file")
    url="https://commons.wikimedia.org/wiki/Special:FilePath/${encoded_file}?width=360"

    echo "Fetching: ${card_name} -> ${dest_path}"
    
    # Retry loop with backoff (up to 3 tries per card)
    success=0
    for attempt in {1..3}; do
      status=$(curl -s -L -w "%{http_code}" -A "$USER_AGENT" -o "$dest_path" "$url" || true)
      if [[ "$status" == "200" ]] && [[ -s "$dest_path" ]]; then
        success=1
        break
      elif [[ "$status" == "429" ]]; then
        echo "  [HTTP 429 Rate Limit] Backing off 4s (attempt $attempt/3)..."
        sleep 4
      else
        echo "  [HTTP $status] Retrying in 2s..."
        sleep 2
      fi
    done

    if [[ "$success" -eq 1 ]]; then
      echo "  Saved ${local_slug}"
    else
      echo "  WARNING: Failed to fetch ${card_name} (will fallback to Wikimedia at runtime)"
      rm -f "$dest_path"
    fi

    # Respectful pause to keep Wikimedia happy
    sleep 0.8
  else
    echo "Exists: ${local_slug}"
  fi

  # If image exists on disk, update the mapping
  if [[ -s "$dest_path" ]]; then
    python3 -c '
import json, sys
map_file = sys.argv[1]
name = sys.argv[2]
path = sys.argv[3]
try:
    with open(map_file, "r") as f:
        data = json.load(f)
except Exception:
    data = {}
data[name] = path
with open(map_file, "w") as f:
    json.dump(data, f, indent=2, sort_keys=True)
' "$MAP_FILE" "$card_name" "$dest_path"
  fi
done

echo "Done! Local cards in ${TARGET_DIR}/"
echo "Mapping verified at ${MAP_FILE}"
