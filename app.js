/* Full app.js replacement */
const APP = APP || {};

function $(sel){ return document.querySelector(sel); }
function $$(sel){ return Array.from(document.querySelectorAll(sel)); }
function escapeHtml(s=''){ return String(s).replace(/[&<>\"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'})[m]; }); }

async function loadReferenceData(){
  const refRes = await fetch('./data/reference.json');
  APP.data = await refRes.json();

  try {
    const imgRes = await fetch('./data/card-images.json');
    APP.cardImageMap = imgRes.ok ? await imgRes.json() : {};
  } catch(e) {
    APP.cardImageMap = {};
  }

  APP.tarotDeck = (APP.data.fullDeck || APP.data.fallbackDeck || []).map(normalizeCard);
}

function normalizeCard(c){
  return {
    name: c.name || c.title || '',
    suit: c.suit || '',
    rank: c.rank || ''
  };
}

function commonsImage(fileName){
  if(!fileName) return '';
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=720`;
}

function publicDomainRwsImage(cardName=''){
  if (APP && APP.cardImageMap && APP.cardImageMap[cardName]) {
    return APP.cardImageMap[cardName];
  }

  const major = {
    'The Fool':'Pictorial Key to the Tarot 00 The Fool.jpg',
    'The Magician':'Pictorial Key to the Tarot 01 The Magician.jpg',
    'The High Priestess':'Pictorial Key to the Tarot 02 The High Priestess.jpg',
    'The Empress':'Pictorial Key to the Tarot 03 The Empress.jpg',
    'The Emperor':'Pictorial Key to the Tarot 04 The Emperor.jpg',
    'The Hierophant':'Pictorial Key to the Tarot 05 The Hierophant.jpg',
    'The Lovers':'Pictorial Key to the Tarot 06 The Lovers.jpg',
    'The Chariot':'Pictorial Key to the Tarot 07 The Chariot.jpg',
    'Strength':'Pictorial Key to the Tarot 08 Strength.jpg',
    'The Hermit':'Pictorial Key to the Tarot 09 The Hermit.jpg',
    'Wheel of Fortune':'Pictorial Key to the Tarot 10 Wheel of Fortune.jpg',
    'Justice':'Pictorial Key to the Tarot 11 Justice.jpg',
    'The Hanged Man':'Pictorial Key to the Tarot 12 The Hanged Man.jpg',
    'Death':'Pictorial Key to the Tarot 13 Death.jpg',
    'Temperance':'Pictorial Key to the Tarot 14 Temperance.jpg',
    'The Devil':'Pictorial Key to the Tarot 15 The Devil.jpg',
    'The Tower':'Pictorial Key to the Tarot 16 The Tower.jpg',
    'The Star':'Pictorial Key to the Tarot 17 The Star.jpg',
    'The Moon':'Pictorial Key to the Tarot 18 The Moon.jpg',
    'The Sun':'Pictorial Key to the Tarot 19 The Sun.jpg',
    'Judgement':'Pictorial Key to the Tarot 20 Judgement.jpg',
    'Judgment':'Pictorial Key to the Tarot 20 Judgement.jpg',
    'The World':'Pictorial Key to the Tarot 21 The World.jpg'
  };
  if(major[cardName]) return commonsImage(major[cardName]);

  const match = cardName.match(/^(Ace|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Page|Knight|Queen|King) of (Wands|Cups|Swords|Pentacles)$/i);
  if(!match) return '';

  const rankMap = {Ace:'01',Two:'02',Three:'03',Four:'04',Five:'05',Six:'06',Seven:'07',Eight:'08',Nine:'09',Ten:'10',Page:'11',Knight:'12',Queen:'13',King:'14'};
  const suitMap = {Wands:'Wands',Cups:'Cups',Swords:'Swords',Pentacles:'Pentacles'};
  const rank = match[1].charAt(0).toUpperCase()+match[1].slice(1).toLowerCase();
  const suit = match[2].charAt(0).toUpperCase()+match[2].slice(1).toLowerCase();
  return commonsImage(`Pictorial Key to the Tarot ${suitMap[suit]} ${rankMap[rank]}.jpg`);
}

function renderCardElement(card){
  const imgSrc = publicDomainRwsImage(card.name || '');
  return `<div class="tarot-card" role="img" aria-label="${escapeHtml(card.name || '')}">
    <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(card.name || '')}" loading="lazy">
    <div class="card-name">${escapeHtml(card.name || '')}</div>
  </div>`;
}

async function generateBirthChart(){
  const date = $('#bcDate').value || '';
  const city = $('#bcPlace').value || '';
  const time = $('#bcTime').value || '';

  const result = await computeChartFromInputs({date, city, time});

  if (!time) {
    $('#bcRisingRows').innerHTML = result.rising.rows.map((r, idx) => {
      const midpointHour = String((idx * 2 + 1)).padStart(2, '0') + ':00';
      return `<tr>
        <td><a href="#" class="rising-link" role="button" aria-label="Set birth time to ${midpointHour}" data-time="${midpointHour}">${escapeHtml(r.window)}</a></td>
        <td><span class="planet-symbol">${escapeHtml(r.symbol || '')}</span>${escapeHtml(r.sign || '')}</td>
      </tr>`;
    }).join('');
    $('#bcRisingWrap').classList.remove('hidden');

    $$('.rising-link').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        window.__risingSelected = true;
        const timeVal = a.dataset.time || '';
        $('#bcTime').value = timeVal;
        generateBirthChart();
        setTimeout(() => { window.__risingSelected = false; }, 100);
      });
    });
  } else {
    $('#bcRisingWrap').classList.add('hidden');
  }

  $('#bcWheel').innerHTML = result.chartHtml || '';

  if (window.__risingSelected) {
    $('#bcTimeNote').textContent = ( $('#bcTimeNote').textContent || '' ) + ' (approximate — chart uses the midpoint of the selected 2-hour window)';
  }
}

async function computeChartFromInputs(inputs){
  const rows = [];
  for(let i=0;i<12;i++){
    rows.push({
      window: `${String(i*2).padStart(2,'0')}:00 - ${String(i*2+1).padStart(2,'0')}:59`,
      sign: ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][i%12],
      symbol: ['☉','☾','☿','♀','♂','♃','♄','♅','♆','♇','⚷','⚸'][i%12]
    });
  }
  return { rising: { rows }, chartHtml: '<div class=\"chart-placeholder\">[Chart would render here]</div>' };
}

async function init(){
  await loadReferenceData();
  if($('#bcSubmit')) $('#bcSubmit').addEventListener('click', (e)=>{ e.preventDefault(); generateBirthChart(); });
}

document.addEventListener('DOMContentLoaded', init);
