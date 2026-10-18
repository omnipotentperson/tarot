#!/usr/bin/env bash
set -euo pipefail

outdir=assets/cards
mkdir -p "$outdir" data
tmpmap="$(mktemp)"
echo "{" > "$tmpmap"
counter=0

# Majors (explicit)
read -r -d '' MAJ <<'MAJ' || true
The Fool|Pictorial Key to the Tarot 00 The Fool.jpg
The Magician|Pictorial Key to the Tarot 01 The Magician.jpg
The High Priestess|Pictorial Key to the Tarot 02 The High Priestess.jpg
The Empress|Pictorial Key to the Tarot 03 The Empress.jpg
The Emperor|Pictorial Key to the Tarot 04 The Emperor.jpg
The Hierophant|Pictorial Key to the Tarot 05 The Hierophant.jpg
The Lovers|Pictorial Key to the Tarot 06 The Lovers.jpg
The Chariot|Pictorial Key to the Tarot 07 The Chariot.jpg
Strength|Pictorial Key to the Tarot 08 Strength.jpg
The Hermit|Pictorial Key to the Tarot 09 The Hermit.jpg
Wheel of Fortune|Pictorial Key to the Tarot 10 Wheel of Fortune.jpg
Justice|Pictorial Key to the Tarot 11 Justice.jpg
The Hanged Man|Pictorial Key to the Tarot 12 The Hanged Man.jpg
Death|Pictorial Key to the Tarot 13 Death.jpg
Temperance|Pictorial Key to the Tarot 14 Temperance.jpg
The Devil|Pictorial Key to the Tarot 15 The Devil.jpg
The Tower|Pictorial Key to the Tarot 16 The Tower.jpg
The Star|Pictorial Key to the Tarot 17 The Star.jpg
The Moon|Pictorial Key to the Tarot 18 The Moon.jpg
The Sun|Pictorial Key to the Tarot 19 The Sun.jpg
Judgement|Pictorial Key to the Tarot 20 Judgement.jpg
Judgment|Pictorial Key to the Tarot 20 Judgement.jpg
The World|Pictorial Key to the Tarot 21 The World.jpg
MAJ

ranks=(Ace Two Three Four Five Six Seven Eight Nine Ten Page Knight Queen King)
ranknum=(01 02 03 04 05 06 07 08 09 10 11 12 13 14)
suits=(Wands Cups Swords Pentacles)

slugify() {
  printf '%s' "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g' | sed -E 's/^-|-$//g'
}

# download helper: fail fast and return non-zero on HTTP errors
download_file() {
  local url="$1" outpath="$2"
  # connect timeout 10s, max time 30s, follow redirects, show errors on failure
  curl -S -L --connect-timeout 10 --max-time 30 --retry 2 --retry-delay 2 --fail -o "$outpath" "$url"
  return $?
}

log_and_append() {
  local card="$1" path="$2"
  local esc_card
  esc_card=$(printf '%s' "$card" | sed 's/"/\\"/g')
  printf '  "%s": "%s",\n' "$esc_card" "$path" >> "$tmpmap"
}

# iterate majors
while IFS='|' read -r card file; do
  if [ -z "$card" ]; then continue; fi
  counter=$((counter+1))
  slug=$(slugify "$card")
  outName=$(printf "%02d-%s.jpg" "$counter" "$slug")
  enc=$(python3 -c "import sys,urllib.parse; print(urllib.parse.quote(sys.argv[1], safe=''))" "$file")
  url="https://commons.wikimedia.org/wiki/Special:FilePath/${enc}?width=360"
  echo "Downloading: $card -> $url"
  if download_file "$url" "${outdir}/${outName}"; then
    echo "  saved ${outName}"
    log_and_append "$card" "${outdir}/${outName}"
  else
    echo "  failed for $card (skipping after timeout/error)"
  fi
  sleep 0.12
done <<< "$MAJ"

# iterate minors
for i in "${!ranks[@]}"; do
  rank="${ranks[$i]}"
  num="${ranknum[$i]}"
  for suit in "${suits[@]}"; do
    card="${rank} of ${suit}"
    file="Pictorial Key to the Tarot ${suit} ${num}.jpg"
    counter=$((counter+1))
    slug=$(slugify "$card")
    outName=$(printf "%02d-%s.jpg" "$counter" "$slug")
    enc=$(python3 -c "import sys,urllib.parse; print(urllib.parse.quote(sys.argv[1], safe=''))" "$file")
    url="https://commons.wikimedia.org/wiki/Special:FilePath/${enc}?width=360"
    echo "Downloading: $card -> $url"
    if download_file "$url" "${outdir}/${outName}"; then
      echo "  saved ${outName}"
      log_and_append "$card" "${outdir}/${outName}"
    else
      echo "  failed for $card (skipping after timeout/error)"
    fi
    sleep 0.12
  done
done

# finish json - remove trailing comma safely and write
sed -e '$ s/,$//' "$tmpmap" > "$tmpmap.tmp"
echo "}" >> "$tmpmap.tmp"
mv "$tmpmap.tmp" data/card-images.json
rm -f "$tmpmap"
echo "Wrote data/card-images.json ($(wc -l < data/card-images.json) lines)."
