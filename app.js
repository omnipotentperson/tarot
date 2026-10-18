/* app.js - full replacement
   - Loads reference data and optional local card image map (data/card-images.json)
   - Prefers local images (assets/cards/*) when present
   - Provides generateBirthChart() stub (replace computeChartFromInputs with your real logic)
   - Converts rising rows (#bcRisingRows) into clickable links and observes future changes
   - Uses event delegation so clicks always work
*/

const APP = window.APP || {};

function $(sel){ return document.querySelector(sel); }
function $$(sel){ return Array.from(document.querySelectorAll(sel)); }
function escapeHtml(s=''){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]); }

async function loadReferenceData(){
  try {
    const refRes = await fetch('./data/reference.json');
    if(refRes.ok) APP.data = await refRes.json();
    else APP.data = {};
  } catch(e){
    APP.data = {};
  }

  // load local card image map if present
  try {
    const imgRes = await fetch('./data/card-images.json');
    APP.cardImageMap = imgRes.ok ? await imgRes.json() : {};
  } catch(e) {
    APP.cardImageMap = {};
  }

  APP.tarotDeck = (APP.data.fullDeck || APP.data.fallbackDeck || []).map(normalizeCard);
}

function normalizeCard(c){
  return { name: c.name || c.title || '', suit: c.suit || '', rank: c.rank || '' };
}

function commonsImage(fileName){
  if(!fileName) return '';
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=720`;
}

function publicDomainRwsImage(cardName=''){
  if (APP && APP.cardImageMap && APP.cardImageMap[cardName]) {
    return APP.cardImageMap[cardName]; // use local path like assets/cards/01-the-fool.jpg
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
  const rank = match[1].charAt(0).toUpperCase()+match[1].slice(1).toLowerCase();
  const suit = match[2].charAt(0).toUpperCase()+match[2].slice(1).toLowerCase();
  return commonsImage(`Pictorial Key to the Tarot ${suit} ${rankMap[rank]}.jpg`);
}

/* Render a card element (example usage) */
function renderCardElement(card){
  const imgSrc = publicDomainRwsImage(card.name || '');
  return `<div class="tarot-card" role="img" aria-label="${escapeHtml(card.name || '')}">
    <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(card.name || '')}" loading="lazy">
    <div class="card-name">${escapeHtml(card.name || '')}</div>
  </div>`;
}

/* MUTATION + CLICK HANDLING for rising links
   - Converts the first TD in each rising row into an <a.data-time>
   - Uses event delegation so it works even if rows are added later
*/
(function risingLinkInstaller(){
  function convertRowCell(td){
    if(!td || td._risingConverted) return;
    var text = td.textContent || td.innerText || '';
    var m = text.match(/\b(\d{1,2}:\d{2})\b/);
    var time = m ? m[1].padStart(5,'0') : null;
    if(!time) return;
    var a = document.createElement('a');
    a.href = '#';
    a.className = 'rising-link';
    a.setAttribute('data-time', time);
    a.setAttribute('role', 'button');
    a.setAttribute('aria-label', 'Set birth time to ' + time);
    a.innerHTML = td.innerHTML;
    td.innerHTML = '';
    td.appendChild(a);
    td._risingConverted = true;
  }

  function scanAll(){
    var rows = document.querySelectorAll('#bcRisingRows td:first-child');
    rows.forEach(convertRowCell);
  }

  // event delegation for clicks on rising links
  document.addEventListener('click', function(e){
    var el = e.target;
    while(el && el !== document){
      if(el.classList && el.classList.contains('rising-link')) break;
      el = el.parentNode;
    }
    if(!el || el === document) return;
    e.preventDefault();
    var time = el.getAttribute('data-time') || (el.textContent.match(/\d{1,2}:\d{2}/)||[])[0] || '';
    if(!time) return;
    var timeInput = document.querySelector('#bcTime');
    if(timeInput) timeInput.value = time;
    var submit = document.querySelector('#bcSubmit');
    if(submit) submit.click();
    else if(typeof generateBirthChart === 'function') generateBirthChart();
  }, false);

  // observe #bcRisingRows for changes (rows inserted later)
  function observeRoot(){
    var root = document.querySelector('#bcRisingRows');
    if(!root) return;
    scanAll();
    var mo = new MutationObserver(function(muts){
      muts.forEach(function(m){
        Array.from((m.addedNodes||[])).forEach(function(n){
          if(n.nodeType !== 1) return;
          if(n.matches && n.matches('tr')) {
            var td = n.querySelector('td:first-child');
            convertRowCell(td);
          } else {
            scanAll();
          }
        });
      });
    });
    mo.observe(root, { childList: true, subtree: true });
  }

  // try to observe now; if not present, try again after short delay
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', observeRoot);
  } else {
    observeRoot();
  }
})();

/* generateBirthChart - replaces previous UI behavior.
   This function should call your existing astrology computation.
   computeChartFromInputs() is a placeholder you should replace with your real call.
*/
async function generateBirthChart(){
  const date = $('#bcDate') ? $('#bcDate').value || '' : '';
  const place = $('#bcPlace') ? $('#bcPlace').value || '' : '';
  const time = $('#bcTime') ? $('#bcTime').value || '' : '';

  const result = await computeChartFromInputs({ date, place, time });

  // If no time provided, show rising rows (the code that populates #bcRisingRows must exist)
  if(!time){
    if(result && result.rising && result.rising.rows){
      var html = result.rising.rows.map(r=>{
        const window = escapeHtml(r.window || '');
        const sign = escapeHtml(r.sign || '');
        const symbol = escapeHtml(r.symbol || '');
        return `<tr><td>${window}</td><td><span class="planet-symbol">${symbol}</span>${sign}</td></tr>`;
      }).join('');
      var wrap = $('#bcRisingRows');
      if(wrap) wrap.innerHTML = html;
      $('#bcRisingWrap') && $('#bcRisingWrap').classList.remove('hidden');
    }
  } else {
    $('#bcRisingWrap') && $('#bcRisingWrap').classList.add('hidden');
  }

  // render the wheel area
  $('#bcWheel') && ($('#bcWheel').innerHTML = result.chartHtml || '');
  // add approximate note handling if needed
  if(window.__risingSelected){
    $('#bcTimeNote') && ($('#bcTimeNote').textContent = ($('#bcTimeNote').textContent || '') + ' (approximate — midpoint of selected window)');
  }
}

/* Placeholder — replace with your real astrological computation or API call */
async function computeChartFromInputs(inputs){
  // return shape: { rising: { rows: [{window:'00:00 - 02:00', sign:'Aries', symbol:'☉'}, ...] }, chartHtml: '<svg>..</svg>' }
  const rows = [];
  for(let i=0;i<12;i++){
    rows.push({
      window: `${String(i*2).padStart(2,'0')}:00 - ${String(i*2+1).padStart(2,'0')}:59`,
      sign: ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][i%12],
      symbol: ['☉','☾','☿','♀','♂','♃','♄','♅','♆','♇','⚷','⚸'][i%12]
    });
  }
  return { rising: { rows }, chartHtml: '<div class="chart-placeholder">[Chart renders here]</div>' };
}

/* init wiring */
async function init(){
  await loadReferenceData();
  if($('#bcSubmit')) $('#bcSubmit').addEventListener('click', (e)=>{ e.preventDefault(); generateBirthChart(); });
}

document.addEventListener('DOMContentLoaded', init);
