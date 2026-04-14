const STORAGE_KEYS = {
  readings: 'veil.readings',
  favorites: 'veil.favorites',
  theme: 'veil.theme',
  sharedReading: 'veil.sharedReading',
  printMode: 'veil.printMode'
};
const SPREAD_CONFIGS = {
  single: { icon:'🌙', title:'Daily Card', n:1, positions:['Your card for today'], desc:'1 card · Daily guidance' },
  three: { icon:'⚖️', title:'Three Card', n:3, positions:['Past','Present','Future'], desc:'3 cards · Past · Present · Future' },
  celtic: { icon:'✙', title:'Celtic Cross', n:10, positions:['The Present','The Challenge','The Foundation','The Past','Possible Outcome','Near Future','Your Attitude','External Influences','Hopes and Fears','Final Outcome'], desc:'10 cards · Full reading' },
  horseshoe: { icon:'🌟', title:'Horseshoe', n:7, positions:['Past Influences','Present Situation','Hidden Influences','Obstacles','External Influences','Best Course','Most Likely Outcome'], desc:'7 cards · Life overview' },
  relationship: { icon:'🔮', title:'Relationship', n:6, positions:['You','Your Partner','The Connection','Strengths','Challenges','Potential'], desc:'6 cards · Partnership' },
  yesno: { icon:'⚡', title:'Yes / No', n:5, positions:['The Situation','What Helps','What Hinders','Hidden Factor','Answer'], desc:'5 cards · Quick answer' }
};
const APP = {
  data: null,
  tarotDeck: [],
  currentSpread: 'single',
  libFilter: 'all',
  refTab: 'candles',
  horoTab: 'daily',
  currentReading: null,
  currentChart: null,
  currentRefItems: [],
  favorites: loadJSON(STORAGE_KEYS.favorites, {cards:{}, reference:{}}),
  readings: loadJSON(STORAGE_KEYS.readings, []),
  deferredPrompt: null
};

function loadJSON(key, fallback){ try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function saveJSON(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
function $(sel, root=document){ return root.querySelector(sel); }
function $$(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
function escapeHtml(str=''){ return str.replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s])); }
function slugify(s=''){ return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
function sample(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function shuffle(arr){ const copy=[...arr]; for(let i=copy.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [copy[i],copy[j]]=[copy[j],copy[i]]; } return copy; }
function sectionEl(id){ return document.getElementById(id); }
function createReadingId(){
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2,6).toUpperCase();
  return `VEIL-${stamp}-${rand}`;
}
function readingIdentifier(reading){
  if(!reading) return '';
  if(reading.publicId) return reading.publicId;
  return `VEIL-${String(reading.id || '').replace(/[^a-z0-9]/gi,'').slice(0,8).toUpperCase()}`;
}
function normalizeReadingId(id=''){ return id.trim().toUpperCase(); }
function findReadingByIdentifier(id){
  const normalized = normalizeReadingId(id);
  if(!normalized) return null;
  return APP.readings.find(reading => normalizeReadingId(readingIdentifier(reading)) === normalized || normalizeReadingId(reading.id || '') === normalized);
}

async function init(){
  await loadReferenceData();
  bindEvents();
  renderSpreadCards();
  renderLibrary();
  renderReference();
  renderFavorites();
  renderHistory();
  initSeasonTheme();
  initTodayEnergy();
  initMoonWidget();
  maybeHandleSharedReading();
  registerServiceWorker();
  buildInitialFan();
}

async function loadReferenceData(){
  const refRes = await fetch('./data/reference.json');
  APP.data = await refRes.json();
  try {
    const tarotRes = await fetch('https://tarotapi.dev/api/v1/cards');
    const tarotJson = await tarotRes.json();
    const cards = tarotJson.cards || tarotJson.data || [];
    APP.tarotDeck = cards.map(normalizeCard);
  } catch (e) {
    APP.tarotDeck = buildFullFallbackDeck().map(normalizeCard);
  }
}
function normalizeCard(card){
  const name = card.name;
  return {
    name,
    suit: (card.suit || card.arcana || 'major').toLowerCase(),
    arcana: card.arcana || (card.suit ? 'Minor' : 'Major'),
    meaning_up: card.meaning_up || card.upright || card.meaningUp || card.meaning || 'Insight unfolds through attention.',
    meaning_rev: card.meaning_rev || card.reversed || card.meaningRev || 'A blocked or inverted form of the upright meaning.',
    desc: card.desc || card.description || 'A tarot archetype.',
    image: publicDomainRwsImage(name) || card.image || card.img || ''
  };
}

function publicDomainRwsImage(cardName=''){
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
function commonsImage(fileName){
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=360`;
}


function buildFullFallbackDeck(){
  const major = (APP.data?.fallbackDeck || []).map(c => ({...c, arcana:'Major'}));
  const suits = ['wands','cups','swords','pentacles'];
  const ranks = ['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King'];
  const minors = [];
  suits.forEach(suit => {
    ranks.forEach(rank => {
      const titleSuit = suit.charAt(0).toUpperCase()+suit.slice(1);
      minors.push({
        name: `${rank} of ${titleSuit}`,
        suit,
        arcana: 'Minor',
        meaning_up: `${rank} of ${titleSuit} upright meaning.`,
        meaning_rev: `${rank} of ${titleSuit} reversed meaning.`,
        desc: `A ${suit} card representing ${rank.toLowerCase()} energy.`,
        image: ''
      });
    });
  });
  return major.concat(minors);
}

function bindEvents(){
  $('#mainNav').addEventListener('click', e => {
    const btn = e.target.closest('[data-section]');
    if(!btn) return;
    showSection(btn.dataset.section, btn);
  });
  $('#drawBtn').addEventListener('click', drawSpread);
  $('#fanShuffleBtn').addEventListener('click', buildInitialFan);
  $('#libSearch').addEventListener('input', renderLibrary);
  $$('.lib-filter-btn').forEach(btn => btn.addEventListener('click', () => {
    APP.libFilter = btn.dataset.libFilter;
    $$('.lib-filter-btn').forEach(b => b.classList.toggle('active', b===btn));
    renderLibrary();
  }));
  $('#loadHoroscopeBtn').addEventListener('click', loadHoroscope);
  $$('.horoscope-tabs .tab-btn').forEach(btn => btn.addEventListener('click', () => {
    APP.horoTab = btn.dataset.horoTab;
    $$('.horoscope-tabs .tab-btn').forEach(b=>b.classList.toggle('active', b===btn));
    loadHoroscope();
  }));
  $('#generateChartBtn').addEventListener('click', generateBirthChart);
  $$('.chart-tabs .tab-btn').forEach(btn => btn.addEventListener('click', () => {
    $$('.chart-tabs .tab-btn').forEach(b=>b.classList.toggle('active', b===btn));
    $('#bcChartView').classList.toggle('hidden', btn.dataset.bcTab !== 'chart');
    $('#bcPlanetsView').classList.toggle('hidden', btn.dataset.bcTab !== 'planets');
  }));
  $$('.ref-tab').forEach(btn => btn.addEventListener('click', () => {
    APP.refTab = btn.dataset.refTab;
    $$('.ref-tab').forEach(b=>b.classList.toggle('active', b===btn));
    $('#refSearch').value = '';
    renderReference();
  }));
  $('#refSearch').addEventListener('input', renderReference);
  $('#forgeSigilBtn').addEventListener('click', forgeSigil);
  $('#downloadSigilBtn').addEventListener('click', downloadSigil);
  $('#printSigilBtn').addEventListener('click', () => printSection('sigilResult', 'Sigil'));
  $('#printReadingBtn').addEventListener('click', () => printSection('draws', 'Tarot Reading'));
  $('#shareReadingBtn').addEventListener('click', shareReading);
  $('#printLibraryBtn').addEventListener('click', () => printSection('library', 'Card Library'));
  $('#printReferenceBtn').addEventListener('click', () => printSection('reference', 'Reference Guide'));
  $('#printAstroBtn').addEventListener('click', () => printSection('astrology', 'Astrology Result'));
  $('#printChartBtn').addEventListener('click', () => printSection('birthchart', 'Birth Chart'));
  $('#printFavoritesBtn').addEventListener('click', () => printSection('favorites', 'Favorites'));
  $('#printFanBtn').addEventListener('click', () => printSection('fan', 'Fan Draw'));
  $('#themeMode').addEventListener('change', e => applySeasonTheme(e.target.value));
  $$('#cardModal [data-close-modal], #refModal [data-close-modal]').forEach(btn => btn.addEventListener('click', closeModals));
  $('#cardModal').addEventListener('click', e => { if(e.target.id==='cardModal') closeModals(); });
  $('#refModal').addEventListener('click', e => { if(e.target.id==='refModal') closeModals(); });
  $('#installBtn').addEventListener('click', installApp);
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); APP.deferredPrompt = e; $('#installBtn').classList.remove('hidden');
  });
}

function showSection(id, btn){
  $$('.section').forEach(s => s.classList.toggle('visible', s.id===id));
  $$('.nav-btn').forEach(b => b.classList.toggle('active', b===btn || b.dataset.section===id));
  sectionEl(id).scrollIntoView({behavior:'smooth', block:'start'});
}

function renderSpreadCards(){
  $('#spreadGrid').innerHTML = Object.entries(SPREAD_CONFIGS).map(([key, cfg]) => `
    <button class="spread-card ${key===APP.currentSpread?'selected':''}" type="button" data-spread="${key}">
      <span class="spread-icon">${cfg.icon}</span>
      <span class="spread-name">${cfg.title}</span>
      <span class="spread-count">${cfg.desc}</span>
    </button>`).join('');
  $$('#spreadGrid .spread-card').forEach(btn => btn.addEventListener('click', ()=>{
    APP.currentSpread = btn.dataset.spread;
    $$('#spreadGrid .spread-card').forEach(b=>b.classList.toggle('selected', b===btn));
    updateRelationshipTools();
  }));
  updateRelationshipTools();
}
function updateRelationshipTools(){
  $('#relationshipTools')?.classList.toggle('hidden', APP.currentSpread !== 'relationship');
}

function buildCardMarkup(draw, position=''){
  return `<div class="tarot-card-wrap">
    ${position ? `<div class="meta-copy" style="margin-bottom:6px;font-family:Cinzel,serif;letter-spacing:.15em;text-transform:uppercase">${escapeHtml(position)}</div>`:''}
    <div class="tarot-card-inner ${draw.reversed ? 'reversed' : ''}" role="button" tabindex="0" aria-label="${escapeHtml(draw.card.name)}" data-card-name="${escapeHtml(draw.card.name)}">
      <div class="card-img-wrap">${draw.card.image ? `<img src="${draw.card.image}" alt="${escapeHtml(draw.card.name)}" loading="lazy" />` : `<span class="card-no-img">✦</span>`}</div>
      <div class="card-name-tag">${escapeHtml(draw.card.name)}${draw.reversed ? `<span class="reversed-tag">Reversed</span>`:''}</div>
    </div>
  </div>`;
}

async function drawSpread(){
  const cfg = SPREAD_CONFIGS[APP.currentSpread];
  const deck = shuffle(APP.tarotDeck).slice(0, cfg.n).map(card => ({ card, reversed: Math.random() < 0.33 }));
  const intention = $('#intentionInput').value.trim();
  const relationshipContext = APP.currentSpread === 'relationship' ? collectRelationshipContext() : null;
  $('#cardsArea').innerHTML = deck.map((draw, i) => buildCardMarkup(draw, cfg.positions[i])).join('');
  bindRenderedCards($('#cardsArea'), deck);
  const publicId = createReadingId();
  const interpretation = createTarotReading(APP.currentSpread, deck, cfg.positions, intention, relationshipContext, publicId);
  $('#readingText').innerHTML = interpretation;
  $('#readingPanel').classList.remove('hidden');
  $('#printReadingBtn').classList.remove('hidden');
  $('#shareReadingBtn').classList.remove('hidden');
  APP.currentReading = { id: crypto.randomUUID(), publicId, createdAt: new Date().toISOString(), spreadType: APP.currentSpread, positions: cfg.positions, draws: deck, intention, relationshipContext, interpretation };
  APP.readings.unshift(APP.currentReading);
  APP.readings = APP.readings.slice(0, 25);
  saveJSON(STORAGE_KEYS.readings, APP.readings);
  renderHistory();
  enhanceTarotReading(APP.currentReading);
}

function collectRelationshipContext(){
  const first = findReadingByIdentifier($('#relationshipIdA')?.value || '');
  const second = findReadingByIdentifier($('#relationshipIdB')?.value || '');
  if(!first && !second) return null;
  return { first, second };
}

function createTarotReading(spreadType, draws, positions, intention, relationshipContext=null, publicId=''){
  const idLine = publicId ? `<p><strong>Reading ID:</strong> ${escapeHtml(publicId)}</p>` : '';
  const opener = intention ? `<p><strong>Intention:</strong> ${escapeHtml(intention)}</p>` : '';
  const relationshipLine = relationshipContext ? relationshipContextSummary(relationshipContext) : '';
  const parts = draws.map((d, i) => {
    const pos = positions[i] || `Card ${i+1}`;
    const meaning = d.reversed ? d.card.meaning_rev : d.card.meaning_up;
    return `<p><strong>${escapeHtml(pos)} — ${escapeHtml(d.card.name)}${d.reversed ? ' (Reversed)' : ''}:</strong> ${escapeHtml(meaning)}</p>`;
  }).join('');
  const synthesis = tarotSynthesis(spreadType, draws, intention, relationshipContext);
  return `${idLine}${opener}${relationshipLine}${parts}<p><strong>Synthesis:</strong> ${escapeHtml(synthesis)}</p>`;
}
function relationshipContextSummary(context){
  const found = [context.first, context.second].filter(Boolean);
  return `<p><strong>Linked readings:</strong> ${found.map(reading => escapeHtml(readingIdentifier(reading))).join(' · ')}</p>`;
}
function tarotSynthesis(spreadType, draws, intention, relationshipContext=null){
  const names = draws.map(d=>d.card.name).join(', ');
  const revs = draws.filter(d=>d.reversed).length;
  const tone = revs > draws.length/2 ? 'The reading leans toward clearing blockages before pushing forward.' : 'The reading favors movement, clarity, and deliberate action.';
  const spreadMap = {
    single:'Let this card be a lantern, not a verdict. Read its image, suit, and orientation as one focused instruction for the next step.',
    three:'Read the spread as a thread: the first card names the root, the second names the living moment, and the third names the gate opening ahead.',
    celtic:'Treat the Celtic Cross as a layered map. Give each position its own dignity before weaving the cross, staff, hopes, and outcome into one counsel.',
    horseshoe:'The Horseshoe is a pattern-reading spread. Let the past, hidden influence, obstacle, and course of action show where the current is carrying the querent.',
    relationship:'Read both people as whole souls, then read the space between them. Do not blame one card or one person; name the pattern, the gift, and the work.',
    yesno: revs >= 3 ? 'The answer leans no or not yet. Name the condition that would need to change before the gate opens.' : 'The answer leans yes. Name the action that keeps the path clean and honest.'
  };
  const linked = relationshipContext ? ' The linked reading IDs are part of the relationship field and should be treated as background weather, not as proof or fate.' : '';
  return `${spreadMap[spreadType] || tone} ${tone}${linked} Cards present: ${names}. ${intention ? 'Keep the stated intention in the center and choose the most embodied next step.' : 'Let the reading end with one grounded practice or choice.'}`;
}

async function enhanceTarotReading(reading){
  $('#readingText').insertAdjacentHTML('beforeend', '<p class="meta-copy" id="aiReadingStatus">Consulting the deeper thread...</p>');
  const text = await requestAIText(buildTarotPrompt(reading));
  $('#aiReadingStatus')?.remove();
  if(!text) return;
  reading.interpretation = `${reading.interpretation}<div class="ai-reading"><p><strong>Expanded reading:</strong></p>${paragraphsToHtml(text)}</div>`;
  $('#readingText').innerHTML = reading.interpretation;
  saveJSON(STORAGE_KEYS.readings, APP.readings);
  renderHistory();
}

function buildTarotPrompt(reading){
  const cfg = SPREAD_CONFIGS[reading.spreadType] || {};
  const drawLines = reading.draws.map((d,i) => {
    const position = reading.positions[i] || `Card ${i+1}`;
    const meaning = d.reversed ? d.card.meaning_rev : d.card.meaning_up;
    return `${position}: ${d.card.name}${d.reversed ? ' reversed' : ' upright'} - source meaning: ${meaning}`;
  }).join('\n');
  const linked = reading.relationshipContext ? [reading.relationshipContext.first, reading.relationshipContext.second].filter(Boolean).map(item => {
    return `${readingIdentifier(item)} (${SPREAD_CONFIGS[item.spreadType]?.title || item.spreadType}): ${item.draws.map(d => `${d.card.name}${d.reversed ? ' reversed' : ''}`).join(', ')}`;
  }).join('\n') : 'None';
  const spreadInstructions = {
    single:'One card only. Do not rank cards or say "the most important card." Give a focused daily oracle: image, upright/reversed meaning, shadow, counsel, and one practice.',
    three:'Use Past, Present, Future as a sequence. Explain how the first card feeds the second and how the third becomes a threshold, not a fixed prediction.',
    celtic:'Use the Celtic Cross positions carefully. Respect Present, Challenge, Foundation, Past, Outcome, Near Future, Attitude, External Influences, Hopes/Fears, and Final Outcome.',
    horseshoe:'Read the seven cards as an arc of circumstance, hidden influence, obstacle, advice, and likely outcome. Keep the advice practical and spiritually literate.',
    relationship:'Read the relationship as a field between two people. Include each person, the connection, strengths, challenges, and potential. If linked reading IDs are present, use them as context for temperament, needs, and repeated themes.',
    yesno:'Answer as a conditional yes/no reading. Avoid absolute fate. Weigh upright/reversed cards and position meanings, then give the condition that changes the answer.'
  };
  return `You are a tarot reader grounded in Rider-Waite-Smith practice, elemental/suit logic, numerology, court-card dignity, major/minor arcana, and traditional upright/reversed interpretation.

Write in the mystical voice of The Veil, but be specific and useful. Do not invent unsupported meanings. Do not use generic "space filler." Do not claim certainty, medical/legal/financial outcomes, or fixed fate.

Spread: ${cfg.title || reading.spreadType}
Reading ID: ${readingIdentifier(reading)}
Intention: ${reading.intention || 'No stated intention.'}
Spread-specific rule: ${spreadInstructions[reading.spreadType] || 'Use each position in order and synthesize the pattern.'}

Cards:
${drawLines}

Linked relationship readings:
${linked}

Return 4 to 8 concise paragraphs. End with "Practice:" and one grounded ritual or reflection step.`;
}

async function requestAIText(prompt){
  try {
    const res = await fetch('/api/ai-reading', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        max_tokens: 900,
        messages: [
          {role:'system', content:'You write grounded tarot and astrology interpretations for The Veil. You are poetic, careful, and specific.'},
          {role:'user', content: prompt}
        ]
      })
    });
    if(!res.ok) throw new Error('AI request failed');
    const data = await res.json();
    return data.content?.[0]?.text || '';
  } catch(e) {
    console.warn('AI reading unavailable', e);
    return '';
  }
}

function paragraphsToHtml(text){
  return text.split(/\n{2,}/).map(p => `<p>${escapeHtml(p.trim())}</p>`).join('');
}

function bindRenderedCards(root, deck){
  $$('.tarot-card-inner', root).forEach((el, idx) => {
    const open = () => openCardModal(deck[idx].card);
    el.addEventListener('click', open);
    el.addEventListener('keydown', e => { if(e.key==='Enter' || e.key===' ') { e.preventDefault(); open(); } });
  });
}

function buildInitialFan(){
  const deck = shuffle(APP.tarotDeck).slice(0, Math.min(APP.tarotDeck.length || 78, 78));
  const wrap = $('#fanWrapper');
  wrap.innerHTML = '';
  const isMobile = window.matchMedia('(max-width: 720px)').matches;
  const cardWidth = isMobile ? 54 : 70;
  const angleSpan = isMobile ? 118 : 96;
  const radius = isMobile ? 160 : 520;
  deck.forEach((card, i) => {
    const angle = -angleSpan/2 + (i * (angleSpan / Math.max(deck.length - 1, 1)));
    const angleRad = angle * Math.PI / 180;
    const x = isMobile ? Math.sin(angleRad) * radius : i * 17;
    const y = isMobile ? (Math.cos(angleRad) * radius) - 80 : 0;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fan-card';
    btn.style.left = isMobile ? `calc(50% - ${cardWidth/2}px + ${x}px)` : `calc(50% - 35px + ${x - ((deck.length-1)*8.5)}px)`;
    btn.style.bottom = isMobile ? `${Math.max(10, y)}px` : '0';
    btn.style.transform = `rotate(${angle}deg)`;
    btn.setAttribute('aria-label', `Fan card ${i+1}`);
    btn.addEventListener('click', () => revealFanCard(card));
    wrap.appendChild(btn);
  });
  $('#fanRevealArea').innerHTML = '';
  $('#fanReadingPanel').classList.add('hidden');
  $('#printFanBtn').classList.add('hidden');
}
function revealFanCard(card){
  const draw = { card, reversed: Math.random() < 0.33 };
  $('#fanRevealArea').innerHTML = buildCardMarkup(draw, 'Chosen Card');
  bindRenderedCards($('#fanRevealArea'), [draw]);
  const publicId = createReadingId();
  APP.currentReading = { id: crypto.randomUUID(), publicId, createdAt: new Date().toISOString(), spreadType: 'fan', positions: ['Chosen Card'], draws: [draw], intention: 'Intuitive fan draw', interpretation: '' };
  APP.currentReading.interpretation = `<p><strong>Reading ID:</strong> ${escapeHtml(publicId)}</p><p><strong>${escapeHtml(card.name)}${draw.reversed?' (Reversed)':''}:</strong> ${escapeHtml(draw.reversed ? card.meaning_rev : card.meaning_up)}</p><p>${escapeHtml(tarotSynthesis('single', [draw], 'Intuitive fan draw'))}</p>`;
  $('#fanReadingText').innerHTML = APP.currentReading.interpretation;
  APP.readings.unshift(APP.currentReading);
  APP.readings = APP.readings.slice(0, 25);
  saveJSON(STORAGE_KEYS.readings, APP.readings);
  renderHistory();
  enhanceFanReading(APP.currentReading);
  $('#fanReadingPanel').classList.remove('hidden');
  $('#printFanBtn').classList.remove('hidden');
}

async function enhanceFanReading(reading){
  const text = await requestAIText(buildTarotPrompt({...reading, spreadType:'single'}));
  if(!text) return;
  reading.interpretation = `${reading.interpretation}<div class="ai-reading"><p><strong>Expanded fan message:</strong></p>${paragraphsToHtml(text)}</div>`;
  $('#fanReadingText').innerHTML = reading.interpretation;
  saveJSON(STORAGE_KEYS.readings, APP.readings);
}

function renderLibrary(){
  const q = $('#libSearch').value.trim().toLowerCase();
  let cards = APP.tarotDeck.filter(card => {
    if(APP.libFilter === 'major') return (card.arcana || '').toLowerCase().includes('major') || card.suit === 'major';
    if(APP.libFilter !== 'all') return card.suit.includes(APP.libFilter);
    return true;
  });
  if(q){ cards = cards.filter(c => [c.name,c.suit,c.meaning_up,c.meaning_rev].join(' ').toLowerCase().includes(q)); }
  $('#libGrid').innerHTML = cards.map(card => {
    const fav = isFavorite('cards', card.name);
    return `<article class="lib-card" data-card="${escapeHtml(card.name)}">
      <button class="favorite-toggle ${fav?'active':''}" type="button" data-favorite-kind="cards" data-favorite-id="${escapeHtml(card.name)}" aria-label="Toggle favorite">★</button>
      <div class="lc-img">${card.image ? `<img src="${card.image}" alt="${escapeHtml(card.name)}" loading="lazy" />` : '<span>✦</span>'}</div>
      <div class="lc-name">${escapeHtml(card.name)}</div>
      <div class="lc-suit">${escapeHtml(card.arcana || card.suit)}</div>
    </article>`;
  }).join('') || `<div class="center meta-copy" style="grid-column:1/-1;padding:30px">No cards match this search.</div>`;
  $$('#libGrid [data-card]').forEach(cardEl => cardEl.addEventListener('click', e => {
    if(e.target.closest('.favorite-toggle')) return;
    openCardModal(APP.tarotDeck.find(c => c.name === cardEl.dataset.card));
  }));
  bindFavoriteButtons($('#libGrid'));
}

function openCardModal(card){
  $('#modalName').textContent = card.name;
  $('#modalBadges').innerHTML = `<span class="badge">${escapeHtml(card.arcana || card.suit)}</span>`;
  $('#modalDesc').textContent = card.desc || 'A tarot archetype.';
  $('#modalUpright').textContent = card.meaning_up;
  $('#modalReversed').textContent = card.meaning_rev;
  $('#modalImg').innerHTML = card.image ? `<img src="${card.image}" alt="${escapeHtml(card.name)}" />` : `<span class="card-no-img">✦</span>`;
  $('#cardModal').classList.add('open');
}
function closeModals(){ $('#cardModal').classList.remove('open'); $('#refModal').classList.remove('open'); }

function zodiacRange(sign){
  const ranges = {Aries:'March 21 – April 19',Taurus:'April 20 – May 20',Gemini:'May 21 – June 20',Cancer:'June 21 – July 22',Leo:'July 23 – August 22',Virgo:'August 23 – September 22',Libra:'September 23 – October 22',Scorpio:'October 23 – November 21',Sagittarius:'November 22 – December 21',Capricorn:'December 22 – January 19',Aquarius:'January 20 – February 18',Pisces:'February 19 – March 20'};
  return ranges[sign];
}
function loadHoroscope(){
  const birth = $('#birthdayInput').value;
  if(!birth) return;
  const sign = AstrologyEngine.zodiacFromDate(birth.slice(5));
  const signInfo = AstrologyEngine.signOf(signToLongitude(sign));
  $('#astroResult').classList.remove('hidden');
  $('#zodiacSymbol').textContent = signInfo.symbol;
  $('#zodiacName').textContent = sign;
  $('#zodiacDates').textContent = zodiacRange(sign);
  $('#horoscopeText').innerHTML = horoscopeText(sign, APP.horoTab);
}
function signToLongitude(sign){
  const order = AstrologyEngine.SIGNS.indexOf(sign); return order*30 + 15;
}
function horoscopeText(sign, tab){
  const moods = {
    daily:`<p><strong>${sign}</strong>, today favors one clean decision over scattered motion. Follow the signal that makes your body feel steadier, not noisier.</p><p>Watch for a useful coincidence, a direct message, or a timing window that opens briefly and asks for a response.</p>`,
    weekly:`<p><strong>${sign}</strong>, this week is about pattern recognition. What repeats is the real message. What drains you repeatedly needs a boundary.</p><p>Leave room for one brave act and one practical act; the best progress uses both.</p>`,
    monthly:`<p><strong>${sign}</strong>, the month asks for alignment between values and habits. Big ideas only matter if your calendar and energy support them.</p><p>Choose the commitment that keeps paying you back in clarity, time, or peace.</p>`
  };
  return moods[tab];
}

async function generateBirthChart(){
  $('#bcError').textContent = '';
  try {
    const result = await AstrologyEngine.generateChart({ dateStr: $('#bcDate').value, timeStr: $('#bcTime').value, city: $('#bcCity').value.trim() });
    result.publicId = createReadingId();
    APP.currentChart = result;
    $('#bcResult').classList.remove('hidden');
    $('#bcTimeNote').textContent = result.location ? `Chart ID ${result.publicId}. Location matched: ${result.location.displayName}. Timezone estimated from longitude for a browser-only chart.` : `Chart ID ${result.publicId}. No city match found. The chart used your entered date and time with a neutral location fallback.`;
    $('#bcWheel').innerHTML = result.wheelSvg;
    $('#bcAiText').innerHTML = result.interpretation;
    $('#bcTransitText').innerHTML = `<p><strong>Transit note:</strong> ${escapeHtml(result.transitSummary)}</p><p><strong>Today's energy:</strong> ${escapeHtml(result.today.text)}</p>${transitAspectList(result.aspects)}`;
    const sun = result.natal.find(p=>p.name==='Sun');
    const moon = result.natal.find(p=>p.name==='Moon');
    const rising = AstrologyEngine.signOf(result.ascLon).name;
    $('#bcDominants').innerHTML = `<span class="dominant-pill">Sun ${escapeHtml(sun.sign)}</span><span class="dominant-pill">Moon ${escapeHtml(moon.sign)}</span><span class="dominant-pill">Rising ${escapeHtml(rising)}</span>`;
    renderPlanetTable(result);
    enhanceChartReading(result);
  } catch (e) {
    console.error(e);
    $('#bcError').textContent = e.message || 'Could not generate chart. Please try again.';
  }
}
function transitAspectList(aspects=[]){
  if(!aspects.length) return '';
  return `<div class="aspect-list"><strong>Active transit aspects:</strong>${aspects.slice(0,5).map(a => `<p>Transiting ${escapeHtml(a.transit)} ${escapeHtml(a.aspect.toLowerCase())} natal ${escapeHtml(a.natal)} · orb ${a.orb.toFixed(1)}° · ${escapeHtml(a.tone)}</p>`).join('')}</div>`;
}
function renderPlanetTable(result){
  const rows = result.natal.map(natal => {
    const transit = result.transits.find(t => t.name === natal.name);
    return `<tr><td><span class="planet-symbol">${natal.symbol}</span>${natal.name}</td><td>${natal.sign} ${natal.degree.toFixed(1)}°</td><td>${transit.sign} ${transit.degree.toFixed(1)}°</td></tr>`;
  }).join('');
  $('#bcPlanetTable').innerHTML = `<thead><tr><th>Planet</th><th>Natal</th><th>Transit</th></tr></thead><tbody>${rows}</tbody>`;
}

async function enhanceChartReading(result){
  const prompt = buildChartPrompt(result);
  const text = await requestAIText(prompt);
  if(!text) return;
  $('#bcAiText').innerHTML = `${result.interpretation}<div class="ai-reading"><p><strong>Unique chart reading:</strong></p>${paragraphsToHtml(text)}</div>`;
}

function buildChartPrompt(result){
  const natal = result.natal.map(p => `${p.name}: ${p.sign} ${p.degree.toFixed(1)}°`).join('\n');
  const transits = result.transits.map(p => `${p.name}: ${p.sign} ${p.degree.toFixed(1)}°`).join('\n');
  const aspects = (result.aspects || []).slice(0,8).map(a => `Transiting ${a.transit} ${a.aspect} natal ${a.natal}, orb ${a.orb.toFixed(1)}°, ${a.tone}`).join('\n') || 'No major transit aspects within the selected orbs.';
  return `You are an astrologer writing for The Veil. Interpret this natal chart and current transits using traditional astrology language: signs, planets, luminaries, angles, elements, modalities, and aspects. Be clear that this is symbolic interpretation, not fate.

Chart ID: ${result.publicId}
Ascendant: ${AstrologyEngine.signOf(result.ascLon).name}
Midheaven: ${AstrologyEngine.signOf(result.mcLon).name}

Natal placements:
${natal}

Current transits:
${transits}

Transit-to-natal aspects:
${aspects}

Write 5 to 8 concise paragraphs. Include Sun, Moon, Rising, dominant element, the strongest transit aspect, and one tarot-adjacent reflection that uses real tarot structure such as Major Arcana archetype, suit/element correspondence, or court-card energy. Do not make up unsupported claims. End with "Practice:" and one simple journaling or ritual step.`;
}

function renderReference(){
  const content = $('#refContent');
  const q = $('#refSearch').value.trim().toLowerCase();
  APP.currentRefItems = [];
  if(APP.refTab === 'deities'){
    const groups = APP.data.reference.deities;
    const sections = Object.entries(groups).map(([group, entries]) => {
      const filtered = entries.filter(entry => [entry.name, entry.domain, group].join(' ').toLowerCase().includes(q));
      APP.currentRefItems.push(...filtered.map(item => ({...item, __group: group, __kind: 'deities'})));
      if(!filtered.length) return '';
      return `<section class="card-panel"><h3 class="section-title" style="text-align:left;font-size:1rem">${escapeHtml(group)}</h3><div class="deity-grid">${filtered.map(item => referenceCard(item, 'deities')).join('')}</div></section>`;
    }).join('');
    content.innerHTML = sections || emptyMessage();
  } else if(APP.refTab === 'candles'){
    const candles = APP.data.reference.candles.filter(item => JSON.stringify(item).toLowerCase().includes(q));
    APP.currentRefItems = candles.map(item => ({...item, __kind: 'candles'}));
    content.innerHTML = candles.length ? `<div class="candle-grid">${candles.map(item => candleCard(item)).join('')}</div>` : emptyMessage();
  } else {
    const items = APP.data.reference[APP.refTab].filter(item => JSON.stringify(item).toLowerCase().includes(q));
    APP.currentRefItems = items.map(item => ({...item, __kind: APP.refTab}));
    content.innerHTML = items.length ? `<div class="ref-grid">${items.map(item => referenceCard(item, APP.refTab)).join('')}</div>` : emptyMessage();
  }
  bindFavoriteButtons(content);
  $$('[data-ref-open]', content).forEach(el => el.addEventListener('click', ()=>openReferenceModal(el.dataset.refKind, el.dataset.refId)));
}
function emptyMessage(){ return `<div class="center meta-copy" style="padding:30px">No entries match this search.</div>`; }
function candleCard(item){
  const id = item.color;
  return `<article class="candle-card" data-ref-open data-ref-kind="candles" data-ref-id="${escapeHtml(id)}">
    <button class="favorite-toggle ${isFavorite('reference','candles:'+id)?'active':''}" type="button" data-favorite-kind="reference" data-favorite-id="candles:${escapeHtml(id)}">★</button>
    <div class="candle-swatch" style="width:36px;height:36px;border-radius:50%;margin:0 auto 10px;background:${APP.data.candleHex[item.color] || '#c9a84c'}"></div>
    <div class="candle-name">${escapeHtml(item.color)}</div>
    <div class="candle-props">${escapeHtml(item.properties)}</div>
  </article>`;
}
function referenceCard(item, kind){
  const id = item.name;
  const subtitle = kind === 'deities' ? item.domain : (item.zodiac || kind.slice(0,1).toUpperCase()+kind.slice(1,-1));
  return `<article class="ref-card" data-ref-open data-ref-kind="${escapeHtml(kind)}" data-ref-id="${escapeHtml(id)}">
    <button class="favorite-toggle ${isFavorite('reference',kind+':'+id)?'active':''}" type="button" data-favorite-kind="reference" data-favorite-id="${escapeHtml(kind+':'+id)}">★</button>
    <div class="ref-card-name">${escapeHtml(item.name)}</div>
    <div class="ref-card-cat">${escapeHtml(subtitle || '')}</div>
    <div class="ref-card-props">${escapeHtml(item.properties || item.domain || '')}</div>
    <div class="ref-card-meta">
      ${item.zodiac ? `<span class="ref-meta-pill">${escapeHtml(item.zodiac)}</span>`:''}
      ${item.planet ? `<span class="ref-meta-pill">${escapeHtml(item.planet)}</span>`:''}
      ${item.element ? `<span class="ref-meta-pill">${escapeHtml(item.element)}</span>`:''}
    </div>
  </article>`;
}
function openReferenceModal(kind, id){
  let item;
  if(kind === 'candles') item = APP.data.reference.candles.find(i => i.color === id);
  else if(kind === 'deities') {
    const groups = Object.values(APP.data.reference.deities).flat();
    item = groups.find(i => i.name === id);
  } else item = APP.data.reference[kind].find(i => i.name === id);
  if(!item) return;
  $('#refModalBody').innerHTML = `
    <h2 id="refModalTitle" class="section-title" style="text-align:left;font-size:1.15rem">${escapeHtml(item.name || item.color)}</h2>
    <p class="meta-copy" style="margin-bottom:14px">${escapeHtml(kind)}</p>
    <div class="reading-text"><p>${escapeHtml(item.properties || item.domain || '')}</p></div>
    <div class="ref-card-meta" style="margin-top:18px">
      ${item.zodiac ? `<span class="ref-meta-pill">Zodiac: ${escapeHtml(item.zodiac)}</span>`:''}
      ${item.planet ? `<span class="ref-meta-pill">Planet: ${escapeHtml(item.planet)}</span>`:''}
      ${item.element ? `<span class="ref-meta-pill">Element: ${escapeHtml(item.element)}</span>`:''}
    </div>`;
  $('#refModal').classList.add('open');
}

function isFavorite(kind, id){ return Boolean(APP.favorites[kind]?.[id]); }
function bindFavoriteButtons(root=document){
  $$('[data-favorite-id]', root).forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const kind = btn.dataset.favoriteKind;
      const id = btn.dataset.favoriteId;
      APP.favorites[kind] = APP.favorites[kind] || {};
      if(APP.favorites[kind][id]) delete APP.favorites[kind][id]; else APP.favorites[kind][id] = { id, kind, savedAt: new Date().toISOString() };
      saveJSON(STORAGE_KEYS.favorites, APP.favorites);
      renderFavorites();
      renderLibrary();
      renderReference();
    }, {once:true});
  });
}
function renderFavorites(){
  const cards = Object.keys(APP.favorites.cards || {});
  const refs = Object.keys(APP.favorites.reference || {});
  const out = [];
  if(cards.length){
    out.push(`<section class="card-panel"><h3 class="section-title" style="text-align:left;font-size:1rem">Cards</h3><div class="favorite-grid">${cards.map(id => {
      const card = APP.tarotDeck.find(c=>c.name===id); if(!card) return '';
      return `<article class="favorite-card" data-card="${escapeHtml(card.name)}"><div class="ref-card-name">${escapeHtml(card.name)}</div><div class="meta-copy">${escapeHtml(card.arcana || card.suit)}</div></article>`;
    }).join('')}</div></section>`);
  }
  if(refs.length){
    out.push(`<section class="card-panel"><h3 class="section-title" style="text-align:left;font-size:1rem">Reference</h3><div class="favorite-grid">${refs.map(id => {
      const [kind, rawId] = id.split(':');
      return `<article class="favorite-card"><div class="ref-card-name">${escapeHtml(rawId)}</div><div class="meta-copy">${escapeHtml(kind)}</div></article>`;
    }).join('')}</div></section>`);
  }
  $('#favoritesContent').innerHTML = out.join('') || `<div class="reading-panel"><div class="reading-text"><p>You have not saved any favorites yet.</p></div></div>`;
}

function renderHistory(){
  $('#historyPanel').classList.toggle('hidden', !APP.readings.length);
  $('#historyList').innerHTML = APP.readings.map(item => `
    <article class="history-entry" data-reading-id="${item.id}">
      <div class="history-entry-spread">${SPREAD_CONFIGS[item.spreadType]?.title || 'Reading'}</div>
      <div class="reading-id-pill">${escapeHtml(readingIdentifier(item))}</div>
      <div class="meta-copy">${new Date(item.createdAt).toLocaleString()}</div>
      <div class="ref-card-props">${item.draws.map(d=>d.card.name).join(' · ')}</div>
      ${item.intention ? `<div class="meta-copy">${escapeHtml(item.intention)}</div>`:''}
    </article>`).join('');
  $$('#historyList [data-reading-id]').forEach(el => el.addEventListener('click', ()=>loadSavedReading(el.dataset.readingId)));
}
function loadSavedReading(id){
  const item = APP.readings.find(r => r.id === id); if(!item) return;
  APP.currentReading = item;
  APP.currentSpread = item.spreadType;
  renderSpreadCards();
  $('#intentionInput').value = item.intention || '';
  $('#cardsArea').innerHTML = item.draws.map((draw,i)=>buildCardMarkup(draw, item.positions[i])).join('');
  bindRenderedCards($('#cardsArea'), item.draws);
  $('#readingText').innerHTML = item.interpretation;
  $('#readingPanel').classList.remove('hidden');
  $('#printReadingBtn').classList.remove('hidden');
  $('#shareReadingBtn').classList.remove('hidden');
  showSection('draws', $('[data-section="draws"]'));
}

function shareReading(){
  if(!APP.currentReading) return;
  const payload = btoa(unescape(encodeURIComponent(JSON.stringify(APP.currentReading))));
  const url = `${location.origin}${location.pathname}#reading=${payload}`;
  navigator.clipboard?.writeText(url).catch(()=>{});
  alert('Share link copied. Anyone opening it on this device or online will see the reading.');
}
function maybeHandleSharedReading(){
  if(!location.hash.startsWith('#reading=')) return;
  try {
    const payload = location.hash.replace('#reading=','');
    const reading = JSON.parse(decodeURIComponent(escape(atob(payload))));
    APP.currentReading = reading;
    $('#intentionInput').value = reading.intention || '';
    $('#cardsArea').innerHTML = reading.draws.map((draw,i)=>buildCardMarkup(draw, reading.positions[i])).join('');
    bindRenderedCards($('#cardsArea'), reading.draws);
    $('#readingText').innerHTML = reading.interpretation;
    $('#readingPanel').classList.remove('hidden');
    $('#printReadingBtn').classList.remove('hidden');
    $('#shareReadingBtn').classList.remove('hidden');
  } catch(e) { console.warn('Bad share hash', e); }
}

function initMoonWidget(){
  const phase = AstrologyEngine.moonPhase(new Date());
  $('#moonSymbol').textContent = phase.symbol;
  $('#moonName').textContent = phase.name;
  $('#moonDesc').textContent = `Lunar age: ${phase.age.toFixed(1)} days · ${phase.timezone}`;
}
function initTodayEnergy(){
  const energy = AstrologyEngine.todayEnergy(AstrologyEngine.getPlanetSet(new Date()));
  $('#todayEnergyText').innerHTML = `<p><strong>${escapeHtml(energy.title)}</strong></p><p>${escapeHtml(energy.text)}</p><p class="install-note">Save this app to your home screen for a more app-like experience and offline access to your saved readings and favorites.</p>`;
}

function initSeasonTheme(){
  const raw = localStorage.getItem(STORAGE_KEYS.theme);
  const saved = ['auto','imbolc','ostara','beltane','litha','lughnasadh','mabon','samhain','yule'].includes(raw) ? raw : 'auto';
  $('#themeMode').value = saved;
  applySeasonTheme(saved);
}
function seasonForDate(date){
  const m = date.getMonth()+1, d = date.getDate();
  const md = m*100 + d;
  if(md >= 121 && md < 320) return ['imbolc','Imbolc'];
  if(md >= 320 && md < 501) return ['ostara','Ostara'];
  if(md >= 501 && md < 621) return ['beltane','Beltane'];
  if(md >= 621 && md < 801) return ['litha','Litha'];
  if(md >= 801 && md < 923) return ['lughnasadh','Lughnasadh'];
  if(md >= 923 && md < 1031) return ['mabon','Mabon'];
  if(md >= 1031 && md < 1221) return ['samhain','Samhain'];
  return ['yule','Yule'];
}
function applySeasonTheme(value){
  localStorage.setItem(STORAGE_KEYS.theme, value || 'auto');
  document.body.className = document.body.className.replace(/season-[a-z]+/g, '').trim();
  const [season, label] = value === 'auto' ? seasonForDate(new Date()) : [value, value.charAt(0).toUpperCase()+value.slice(1)];
  document.body.classList.add(`season-${season}`);
  $('#seasonBanner').textContent = `✦ ${label} Season ✦`; $('#seasonBanner').classList.remove('hidden');
}

function forgeSigil(){
  const input = $('#sigilInput').value.trim();
  if(!input) return;
  const letters = [...new Set(input.toUpperCase().replace(/[^A-Z]/g,'').replace(/[AEIOU]/g,''))].join('') || 'SIGIL';
  $('#sigilLetters').textContent = letters;
  const canvas = $('#sigilCanvas');
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#130d1e';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  const gold = getComputedStyle(document.documentElement).getPropertyValue('--gold').trim() || '#c9a84c';
  ctx.strokeStyle = gold;
  ctx.fillStyle = gold;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.translate(canvas.width/2, canvas.height/2);
  const style = $('#sigilStyle').value;
  const chars = letters.split('');
  if(style === 'geometric'){
    const radius = 150;
    ctx.beginPath();
    chars.forEach((ch,i) => {
      const angle = (Math.PI*2/chars.length)*i - Math.PI/2;
      const r = radius - ((ch.charCodeAt(0)%5)*12);
      const x = Math.cos(angle)*r, y = Math.sin(angle)*r;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath(); ctx.arc(0,0,175,0,Math.PI*2); ctx.stroke();
  } else {
    ctx.beginPath();
    chars.forEach((ch,i)=>{
      const code = ch.charCodeAt(0);
      const angle = ((code*13)%360) * Math.PI / 180 - Math.PI/2;
      const r = 55 + (code % 110);
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      if(style === 'rune'){
        ctx.moveTo(x,y);
        ctx.lineTo(x*0.45, y*1.1);
      }
    });
    ctx.stroke();
    ctx.beginPath(); ctx.arc(0,0,175,0,Math.PI*2); ctx.stroke();
    if(style === 'chaos'){
      ctx.beginPath();
      for(let i=0;i<chars.length;i++){
        const a = (Math.PI*2/chars.length)*i;
        ctx.moveTo(0,0);
        ctx.lineTo(Math.cos(a)*190, Math.sin(a)*190);
      }
      ctx.globalAlpha = 0.35;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
  ctx.setTransform(1,0,0,1,0,0);
  $('#sigilResult').classList.remove('hidden');
}
function downloadSigil(){
  const link = document.createElement('a');
  link.href = $('#sigilCanvas').toDataURL('image/png');
  link.download = 'the-veil-sigil.png';
  link.click();
}

function grimoireShell(title, subtitle, bodyContent){
  const baseHref = location.href.split('#')[0];
  return `<!DOCTYPE html><html><head><title>${escapeHtml(title)}</title><base href="${escapeHtml(baseHref)}" /><meta name="viewport" content="width=device-width, initial-scale=1" /><link rel="icon" type="image/svg+xml" href="./assets/favicon.svg" /><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet"><style>
body{background:#f8f4ec;color:#1b1720;font-family:'EB Garamond',serif;padding:24px}
.no-print{margin:0 auto 18px;max-width:980px;display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.btn{padding:10px 16px;background:#fff;color:#1b1720;border:1px solid #7a6228;border-radius:6px;cursor:pointer}
.btn.active{background:#130d1e;color:#e8c97e;border-color:#c9a84c}
.wrap{max-width:980px;margin:0 auto;background:#fffdf8;border:1px solid #d4c39a;padding:26px;box-shadow:0 10px 30px rgba(20,12,8,.08)}
.grimoire-header{text-align:center;border-bottom:2px double #7a6228;padding-bottom:16px;margin-bottom:24px}
.g-title{font-family:'Cinzel Decorative',serif;font-size:24pt;color:#2a2031;letter-spacing:.1em}
.g-subtitle{font-family:'Cinzel',serif;font-size:9pt;letter-spacing:.3em;color:#7a6228;text-transform:uppercase;margin-top:4px}
.g-date{font-size:10pt;color:#5f5662;font-style:italic;margin-top:6px}
.grimoire-reading-title{font-family:'Cinzel',serif;font-size:9pt;letter-spacing:.2em;color:#7a6228;text-transform:uppercase;text-align:center;margin:18px 0 12px}
.grimoire-reading-text{font-size:11pt;line-height:1.8;color:#1b1720}.grimoire-reading-text p{margin-bottom:.8em}
.grimoire-cards{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-bottom:24px}.grimoire-card-item{text-align:center;width:110px}
.g-position{font-family:'Cinzel',serif;font-size:6.5pt;letter-spacing:.15em;color:#7a6228;text-transform:uppercase;margin-bottom:5px}
.g-card-box{border:1px solid #7a6228;background:#fff8e8;border-radius:6px;padding:8px 6px;margin-bottom:6px;min-height:54px}
.g-card-name{font-family:'Cinzel',serif;font-size:7pt;color:#2a2031;line-height:1.4}.g-card-orient{font-size:6pt;color:#7c2035;font-style:italic;margin-top:2px}
.grimoire-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}.grimoire-panel{border:1px solid #d4c39a;background:#fff8e8;padding:12px;border-radius:6px}
.grimoire-footer{text-align:center;margin-top:28px;padding-top:12px;border-top:1px solid #7a6228;font-family:'Cinzel',serif;font-size:7pt;letter-spacing:.2em;color:#7a6228;text-transform:uppercase}
.grimoire-wheel{display:flex;justify-content:center;margin:16px 0}.grimoire-wheel svg{width:min(340px,80vw)!important;height:min(340px,80vw)!important}
.legend{display:flex;justify-content:center;gap:20px;margin:10px 0 14px;font-family:'Cinzel',serif;font-size:8pt;color:#1b1720}.dot{width:10px;height:10px;border-radius:50%;display:inline-block;margin-right:6px;border:1px solid #555}.dot.natal{background:#c9a84c}.dot.transit{background:#4ebec8}
body.print-color{background:#0d0a12;color:#f5ede0}.print-color .wrap{background:#130d1e;border-color:#c9a84c}.print-color .g-title,.print-color .g-card-name{color:#e8c97e}.print-color .grimoire-reading-text,.print-color .legend{color:#f5ede0}.print-color .grimoire-panel,.print-color .g-card-box{background:#1a1226;border-color:#c9a84c}
@media print{.no-print{display:none}body{padding:0;background:#fff!important;color:#111!important}.wrap{box-shadow:none;border-color:#777}.print-color{background:#0d0a12!important;color:#f5ede0!important}.print-color .wrap{background:#130d1e!important;color:#f5ede0!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body class="print-ink"><div class="no-print"><button class="btn" onclick="window.print()">Print / Save PDF</button><button class="btn active" id="inkBtn" onclick="document.body.className='print-ink';this.classList.add('active');document.getElementById('colorBtn').classList.remove('active')">Ink-friendly</button><button class="btn" id="colorBtn" onclick="document.body.className='print-color';this.classList.add('active');document.getElementById('inkBtn').classList.remove('active')">Full color</button><button class="btn" onclick="window.close()">Close</button></div><div class="wrap"><div class="grimoire-header"><div class="g-title">The Veil</div><div class="g-subtitle">${escapeHtml(title)}</div><div class="g-date">${escapeHtml(subtitle)}</div></div>${bodyContent}<div class="grimoire-footer">The Veil · Tarot & Astrology · For personal reflection only</div></div></body></html>`;
}

function libraryPrintBody(){
  const cards = APP.tarotDeck.map(card => `<div class="grimoire-panel"><div class="ref-card-name" style="font-family:'Cinzel',serif;color:#e8c97e">${escapeHtml(card.name)}</div><div style="font-size:8pt;color:rgba(245,237,224,.55);font-style:italic;margin:4px 0 8px">${escapeHtml(card.arcana || card.suit)}</div><div style="font-size:9pt;line-height:1.55">${escapeHtml(card.meaning_up)}</div></div>`).join('');
  return `<div class="grimoire-reading-title">Card Library</div><div class="grimoire-grid">${cards}</div>`;
}
function astrologyPrintBody(){
  const sign = $('#zodiacName').textContent || 'Astrology Report';
  const dates = $('#zodiacDates').textContent || '';
  const symbol = $('#zodiacSymbol').textContent || '';
  const activeTab = document.querySelector('[data-horo-tab].active')?.dataset.horoTab || 'daily';
  return `
    <div class="grimoire-reading-title">Today's Energy</div>
    <div class="grimoire-panel"><div class="grimoire-reading-text">${$('#todayEnergyText').innerHTML || '<p>No energy report loaded.</p>'}</div></div>
    <div class="grimoire-reading-title">${escapeHtml(sign)} ${escapeHtml(symbol)}</div>
    <div class="grimoire-panel">
      <div style="font-family:'Cinzel',serif;color:#e8c97e;font-size:12pt;letter-spacing:.08em;margin-bottom:4px">${escapeHtml(sign)}</div>
      <div style="font-size:8.5pt;color:rgba(245,237,224,.55);font-style:italic;margin-bottom:10px">${escapeHtml(dates)} · ${escapeHtml(activeTab.charAt(0).toUpperCase()+activeTab.slice(1))} guidance</div>
      <div class="grimoire-reading-text">${$('#horoscopeText').innerHTML || '<p>No astrology report loaded.</p>'}</div>
    </div>`;
}
function readingPrintBody(){
  if(!APP.currentReading) return `<div class="grimoire-reading-text"><p>No reading loaded.</p></div>`;
  const cardsHtml = APP.currentReading.draws.map((d,i) => `<div class="grimoire-card-item"><div class="g-position">${escapeHtml(APP.currentReading.positions[i] || '')}</div><div class="g-card-box"><div class="g-card-name">${escapeHtml(d.card.name)}</div>${d.reversed?'<div class="g-card-orient">Reversed</div>':''}</div></div>`).join('');
  return `<div class="grimoire-reading-title">${escapeHtml(SPREAD_CONFIGS[APP.currentReading.spreadType]?.title || 'Reading')} · ${escapeHtml(readingIdentifier(APP.currentReading))}</div><div class="grimoire-cards">${cardsHtml}</div><div class="grimoire-reading-title">The Reading</div><div class="grimoire-reading-text">${$('#readingText').innerHTML || ''}</div>`;
}
function fanPrintBody(){
  return `<div class="grimoire-reading-title">Fan Draw</div><div class="grimoire-reading-text">${$('#fanRevealArea').innerHTML || ''}${$('#fanReadingText').innerHTML || ''}</div>`;
}
function chartPrintBody(){
  return `<div class="grimoire-reading-title">Birth Chart</div><div class="legend"><span><span class="dot natal"></span>Natal</span><span><span class="dot transit"></span>Today's Transits</span></div><div class="grimoire-wheel">${$('#bcWheel').innerHTML || ''}</div><div class="grimoire-reading-text">${$('#bcAiText').innerHTML || ''}${$('#bcTransitText').innerHTML || ''}</div><div style="margin-top:16px">${$('#bcPlanetsView').innerHTML || ''}</div>`;
}
function referencePrintBody(){
  const title = APP.refTab.charAt(0).toUpperCase()+APP.refTab.slice(1);
  if(!APP.currentRefItems?.length) return `<div class="grimoire-reading-title">${escapeHtml(title)}</div><div class="grimoire-reading-text"><p>No entries available to print.</p></div>`;
  return `<div class="grimoire-reading-title">${escapeHtml(title)}</div><div class="grimoire-grid">${APP.currentRefItems.map(item => {
    const itemTitle = item.name || item.color || '';
    const meta = item.__group || item.zodiac || item.planet || item.element || item.intent || item.category || item.pantheon || '';
    const body = item.properties || item.description || item.domain || item.uses || '';
    return `<div class="grimoire-panel"><div style="font-family:'Cinzel',serif;color:#e8c97e">${escapeHtml(itemTitle)}</div><div style="font-size:8pt;color:rgba(245,237,224,.55);font-style:italic;margin:4px 0 8px">${escapeHtml(meta)}</div><div style="font-size:9pt;line-height:1.55">${escapeHtml(body)}</div></div>`;
  }).join('')}</div>`;
}
function sigilPrintBody(){
  return `<div class="grimoire-reading-title">Sigil Forge</div><div class="grimoire-reading-text" style="text-align:center"><div style="margin-bottom:16px">${escapeHtml($('#sigilLetters').textContent || '')}</div><img src="${$('#sigilCanvas').toDataURL('image/png')}" style="max-width:420px;width:100%;background:#130d1e;border:1px solid rgba(201,168,76,.25)" /></div>`;
}
function favoritesPrintBody(){
  const cards = Object.keys(APP.favorites.cards || {});
  const refs = Object.keys(APP.favorites.reference || {});
  if(!cards.length && !refs.length){
    return `<div class="grimoire-reading-title">Favorites</div><div class="grimoire-reading-text"><p>You have not saved any favorites yet.</p></div>`;
  }
  const cardPanels = cards.map(id => {
    const card = APP.tarotDeck.find(c => c.name === id);
    if(!card) return '';
    return `<div class="grimoire-panel"><div style="font-family:'Cinzel',serif;color:#e8c97e">${escapeHtml(card.name)}</div><div style="font-size:8pt;color:rgba(245,237,224,.55);font-style:italic;margin:4px 0 8px">${escapeHtml(card.arcana || card.suit || 'Tarot')}</div><div style="font-size:9pt;line-height:1.55">${escapeHtml(card.meaning_up || '')}</div></div>`;
  }).join('');
  const refPanels = refs.map(id => {
    const [kind, rawId] = id.split(':');
    let item = null, meta = kind;
    if(kind === 'candles') item = APP.data.reference.candles.find(i => i.color === rawId);
    else if(kind === 'deities') {
      for(const [group, entries] of Object.entries(APP.data.reference.deities)){
        const match = entries.find(i => i.name === rawId);
        if(match){ item = match; meta = group; break; }
      }
    } else if(APP.data.reference[kind]) item = APP.data.reference[kind].find(i => i.name === rawId);
    return `<div class="grimoire-panel"><div style="font-family:'Cinzel',serif;color:#e8c97e">${escapeHtml(item?.name || item?.color || rawId)}</div><div style="font-size:8pt;color:rgba(245,237,224,.55);font-style:italic;margin:4px 0 8px">${escapeHtml(meta)}</div><div style="font-size:9pt;line-height:1.55">${escapeHtml(item?.properties || item?.domain || '')}</div></div>`;
  }).join('');
  return `
    <div class="grimoire-reading-title">Favorite Cards</div>
    <div class="grimoire-grid">${cardPanels || '<div class="grimoire-panel">No favorite cards saved.</div>'}</div>
    <div class="grimoire-reading-title">Favorite References</div>
    <div class="grimoire-grid">${refPanels || '<div class="grimoire-panel">No favorite references saved.</div>'}</div>`;
}
function printSection(sectionId, title){
  const dateStr = new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  let body = '';
  if(sectionId === 'draws') body = readingPrintBody();
  else if(sectionId === 'library') body = libraryPrintBody();
  else if(sectionId === 'astrology') body = astrologyPrintBody();
  else if(sectionId === 'birthchart') body = chartPrintBody();
  else if(sectionId === 'reference') body = referencePrintBody();
  else if(sectionId === 'sigilResult') body = sigilPrintBody();
  else if(sectionId === 'favorites') body = favoritesPrintBody();
  else if(sectionId === 'fan') body = fanPrintBody();
  else body = `<div class="grimoire-reading-text">${document.getElementById(sectionId)?.innerHTML || ''}</div>`;
  const w = window.open('', '_blank');
  w.document.write(grimoireShell(title, dateStr, body));
  w.document.close();
}

function installApp(){ if(APP.deferredPrompt){ APP.deferredPrompt.prompt(); APP.deferredPrompt = null; $('#installBtn').classList.add('hidden'); } }
function registerServiceWorker(){ if('serviceWorker' in navigator){ navigator.serviceWorker.register('./sw.js').catch(()=>{}); } }

document.addEventListener('DOMContentLoaded', init);
