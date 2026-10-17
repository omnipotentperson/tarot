(function(){
  const DEG = Math.PI / 180;
  const RAD = 180 / Math.PI;
  const PLANETS = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune'];
  const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
  const ELEMENT_BY_SIGN = {Aries:'Fire',Taurus:'Earth',Gemini:'Air',Cancer:'Water',Leo:'Fire',Virgo:'Earth',Libra:'Air',Scorpio:'Water',Sagittarius:'Fire',Capricorn:'Earth',Aquarius:'Air',Pisces:'Water'};

  function fixAngle(v){ v%=360; return v<0 ? v+360 : v; }
  function sin(v){ return Math.sin(v*DEG); }
  function cos(v){ return Math.cos(v*DEG); }
  function atan2(y,x){ return Math.atan2(y,x)*RAD; }
  function asin(v){ return Math.asin(v)*RAD; }

  function daysSinceJ2000(date){ return (date.getTime()/86400000) - 10956; } // d = days since 2000 Jan 0.0 (the epoch these orbital elements use)
  function julianDay(date){ return date.getTime()/86400000 + 2440587.5; }
  function kepler(M,e){
    let E = M + e*RAD*sin(M)*(1 + e*cos(M));
    for(let i=0;i<8;i++){
      const delta = (E - e*RAD*sin(E) - M) / (1 - e*cos(E));
      E -= delta;
      if(Math.abs(delta) < 1e-5) break;
    }
    return E;
  }
  function planetElements(name,d){
    const e = {
      Mercury:{N:48.3313 + 3.24587e-5*d, i:7.0047 + 5.00e-8*d, w:29.1241 + 1.01444e-5*d, a:0.387098, e:0.205635 + 5.59e-10*d, M:168.6562 + 4.0923344368*d},
      Venus:{N:76.6799 + 2.46590e-5*d, i:3.3946 + 2.75e-8*d, w:54.8910 + 1.38374e-5*d, a:0.723330, e:0.006773 - 1.302e-9*d, M:48.0052 + 1.6021302244*d},
      Earth:{N:0, i:0, w:282.9404 + 4.70935e-5*d, a:1.000000, e:0.016709 - 1.151e-9*d, M:356.0470 + 0.9856002585*d},
      Mars:{N:49.5574 + 2.11081e-5*d, i:1.8497 - 1.78e-8*d, w:286.5016 + 2.92961e-5*d, a:1.523688, e:0.093405 + 2.516e-9*d, M:18.6021 + 0.5240207766*d},
      Jupiter:{N:100.4542 + 2.76854e-5*d, i:1.3030 - 1.557e-7*d, w:273.8777 + 1.64505e-5*d, a:5.20256, e:0.048498 + 4.469e-9*d, M:19.8950 + 0.0830853001*d},
      Saturn:{N:113.6634 + 2.38980e-5*d, i:2.4886 - 1.081e-7*d, w:339.3939 + 2.97661e-5*d, a:9.55475, e:0.055546 - 9.499e-9*d, M:316.9670 + 0.0334442282*d},
      Uranus:{N:74.0005 + 1.3978e-5*d, i:0.7733 + 1.9e-8*d, w:96.6612 + 3.0565e-5*d, a:19.18171 - 1.55e-8*d, e:0.047318 + 7.45e-9*d, M:142.5905 + 0.011725806*d},
      Neptune:{N:131.7806 + 3.0173e-5*d, i:1.7700 - 2.55e-7*d, w:272.8461 - 6.027e-6*d, a:30.05826 + 3.313e-8*d, e:0.008606 + 2.15e-9*d, M:260.2471 + 0.005995147*d},
      Moon:{N:125.1228 - 0.0529538083*d, i:5.1454, w:318.0634 + 0.1643573223*d, a:60.2666, e:0.054900, M:115.3654 + 13.0649929509*d}
    };
    return e[name];
  }
  function heliocentric(name,d){
    const p = planetElements(name,d);
    const E = kepler(fixAngle(p.M), p.e);
    const xv = p.a * (cos(E) - p.e);
    const yv = p.a * (Math.sqrt(1 - p.e*p.e) * sin(E));
    const v = atan2(yv, xv);
    const r = Math.sqrt(xv*xv + yv*yv);
    const xh = r * (cos(p.N)*cos(v+p.w) - sin(p.N)*sin(v+p.w)*cos(p.i));
    const yh = r * (sin(p.N)*cos(v+p.w) + cos(p.N)*sin(v+p.w)*cos(p.i));
    const zh = r * (sin(v+p.w)*sin(p.i));
    return {x:xh,y:yh,z:zh,r};
  }
  function sunPosition(d){
    const earth = heliocentric('Earth', d);
    const lon = fixAngle(atan2(earth.y, earth.x)); // Earth's w includes the 180° flip; no extra rotation
    return {lon, symbol:'☉'};
  }
  function moonPosition(d){
    const p = planetElements('Moon', d);
    const E = kepler(fixAngle(p.M), p.e);
    const xv = p.a * (cos(E) - p.e);
    const yv = p.a * (Math.sqrt(1 - p.e*p.e) * sin(E));
    const v = atan2(yv, xv);
    const r = Math.sqrt(xv*xv + yv*yv);
    let lon = fixAngle(atan2(
      r * (sin(p.N)*cos(v+p.w) + cos(p.N)*sin(v+p.w)*cos(p.i)),
      r * (cos(p.N)*cos(v+p.w) - sin(p.N)*sin(v+p.w)*cos(p.i))
    ));
    const Ms = fixAngle(planetElements('Earth', d).M + planetElements('Earth', d).w);
    const Mm = fixAngle(p.M + p.w + p.N);
    const D = fixAngle(lon - Ms);
    const F = fixAngle(lon - p.N);
    lon += -1.274 * sin(fixAngle(Mm - 2*D))
         + 0.658 * sin(2*D)
         - 0.186 * sin(Ms)
         - 0.059 * sin(fixAngle(2*Mm - 2*D))
         - 0.057 * sin(fixAngle(Mm - 2*D + Ms))
         + 0.053 * sin(fixAngle(Mm + 2*D))
         + 0.046 * sin(fixAngle(2*D - Ms))
         + 0.041 * sin(fixAngle(Mm - Ms))
         - 0.035 * sin(D)
         - 0.031 * sin(fixAngle(Mm + Ms))
         - 0.015 * sin(fixAngle(2*F - 2*D))
         + 0.011 * sin(fixAngle(Mm - 4*D));
    return {lon:fixAngle(lon), symbol:'☽'};
  }
  function planetLongitude(name,d){
    if(name==='Sun') return sunPosition(d).lon;
    if(name==='Moon') return moonPosition(d).lon;
    const earth = heliocentric('Earth', d);
    const p = heliocentric(name, d);
    const xg = p.x + earth.x; // earth vector points sunward in this convention
    const yg = p.y + earth.y;
    return fixAngle(atan2(yg, xg));
  }
  function signOf(lon){
    const index = Math.floor(fixAngle(lon)/30);
    return {name:SIGNS[index], symbol:SIGN_SYMBOLS[index], degree:fixAngle(lon)%30, index};
  }
  function localSidereal(dateUTC, lon){
    const jd = dateUTC.getTime()/86400000 + 2440587.5;
    const T = (jd - 2451545.0)/36525;
    let GMST = 280.46061837 + 360.98564736629*(jd-2451545) + 0.000387933*T*T - T*T*T/38710000;
    return fixAngle(GMST + lon);
  }
  function ascendant(dateUTC, lat, lon){
    const eps = 23.4393 - 3.563E-7 * daysSinceJ2000(dateUTC);
    const LST = localSidereal(dateUTC, lon);
    const y = cos(LST);
    const x = -(sin(LST)*cos(eps) + Math.tan(lat*DEG)*sin(eps));
    return fixAngle(atan2(y, x));
  }
  function mc(dateUTC, lon){
    const eps = 23.4393 - 3.563E-7 * daysSinceJ2000(dateUTC);
    const LST = localSidereal(dateUTC, lon);
    return fixAngle(atan2(sin(LST), cos(LST)*cos(eps))); // full-quadrant MC
  }
  async function geocodeCity(query){
    if(!query || !query.trim()) return null;
    try {
      const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=' + encodeURIComponent(query.trim());
      const res = await fetch(url, {headers:{'Accept':'application/json'}});
      const data = await res.json();
      if(!data || !data[0]) return null;
      return {
        lat: Number(data[0].lat),
        lon: Number(data[0].lon),
        displayName: data[0].display_name
      };
    } catch(e){ return null; }
  }
  async function timezoneNameFor(lat, lon){
    // Real IANA timezone for the coordinates (handles political boundaries & DST).
    try {
      const res = await fetch(`https://timeapi.io/api/timezone/coordinate?latitude=${lat}&longitude=${lon}`);
      const data = await res.json();
      if(data && data.timeZone) return data.timeZone;
    } catch(e){}
    return null;
  }
  const __dtfCache = {};
  function zoneOffsetMinutes(iana, dateUTC){
    // UTC offset (minutes) of an IANA zone at a specific instant — DST-aware.
    let dtf = __dtfCache[iana];
    if(!dtf){
      dtf = new Intl.DateTimeFormat('en-US', { timeZone: iana, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false });
      __dtfCache[iana] = dtf;
    }
    const parts = {};
    dtf.formatToParts(dateUTC).forEach(p => { parts[p.type] = p.value; });
    const asUTC = Date.UTC(+parts.year, +parts.month - 1, +parts.day, (+parts.hour) % 24, +parts.minute, +parts.second);
    return Math.round((asUTC - dateUTC.getTime()) / 60000);
  }
  function zonedLocalToUTC(dateStr, timeStr, iana){
    // Convert a wall-clock time in an IANA zone to a UTC Date (iterated for DST transitions).
    const [y,m,d] = dateStr.split('-').map(Number);
    const [hh,mm] = (timeStr || '12:00').split(':').map(Number);
    let guess = Date.UTC(y, m-1, d, hh, mm || 0, 0);
    for(let i=0;i<3;i++){
      const off = zoneOffsetMinutes(iana, new Date(guess));
      guess = Date.UTC(y, m-1, d, hh, mm || 0, 0) - off*60000;
    }
    return new Date(guess);
  }
  function viewerTimezone(){
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || null; }
    catch(e){ return null; }
  }
  function getPlanetSet(dateUTC){
    const d = daysSinceJ2000(dateUTC);
    const symbols = {Sun:'☉',Moon:'☽',Mercury:'☿',Venus:'♀',Mars:'♂',Jupiter:'♃',Saturn:'♄',Uranus:'♅',Neptune:'♆'};
    return PLANETS.map(name => {
      const lon = planetLongitude(name,d);
      const sign = signOf(lon);
      return {name, lon, sign: sign.name, signSymbol: sign.symbol, degree: sign.degree, symbol: symbols[name]};
    });
  }
  function moonPhase(date){
    const localNoon = new Date(date);
    localNoon.setHours(12, 0, 0, 0);
    const synodicMonth = 29.530588853;
    const knownNewMoonJD = 2451550.25972;
    const age = ((julianDay(localNoon) - knownNewMoonJD) % synodicMonth + synodicMonth) % synodicMonth;
    const diff = age / synodicMonth * 360;
    const phases = [
      {name:'New Moon', symbol:'🌑'},
      {name:'Waxing Crescent', symbol:'🌒'},
      {name:'First Quarter', symbol:'🌓'},
      {name:'Waxing Gibbous', symbol:'🌔'},
      {name:'Full Moon', symbol:'🌕'},
      {name:'Waning Gibbous', symbol:'🌖'},
      {name:'Last Quarter', symbol:'🌗'},
      {name:'Waning Crescent', symbol:'🌘'}
    ];
    const idx = Math.round(diff / 45) % 8;
    return {...phases[idx], angle: diff, age, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time'};
  }
  function dominantElement(planets){
    const counts = {Fire:0,Earth:0,Air:0,Water:0};
    planets.forEach(p => counts[ELEMENT_BY_SIGN[p.sign]]++);
    return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0];
  }
  function buildInterpretation(natal, ascLon){
    const sun = natal.find(p=>p.name==='Sun');
    const moon = natal.find(p=>p.name==='Moon');
    const rising = signOf(ascLon).name;
    const element = dominantElement(natal);
    return `<p><strong>Sun in ${sun.sign}</strong> shows your core style: ${descriptor(sun.sign)}.</p>
    <p><strong>Moon in ${moon.sign}</strong> colors your emotional rhythm with ${descriptor(moon.sign, true)}.</p>
    <p><strong>Rising in ${rising}</strong> shapes how other people meet you first: ${risingDescriptor(rising)}.</p>
    <p>Your chart leans toward <strong>${element}</strong> energy, which usually means ${elementMeaning(element)}.</p>`;
  }
  function descriptor(sign, emotional){
    const map = {
      Aries:'direct, brave, and motivated by movement', Taurus:'steady, sensual, and devoted to what lasts', Gemini:'curious, adaptable, and mentally alive', Cancer:'protective, intuitive, and feeling-led', Leo:'expressive, warm, and radiant', Virgo:'observant, skillful, and improvement-minded', Libra:'relational, aesthetic, and balance-seeking', Scorpio:'intense, perceptive, and transformative', Sagittarius:'visionary, candid, and freedom-seeking', Capricorn:'disciplined, strategic, and durable', Aquarius:'independent, inventive, and future-facing', Pisces:'imaginative, empathic, and fluid'
    };
    return emotional ? map[sign].replace('and', 'while also being') : map[sign];
  }
  function risingDescriptor(sign){ return descriptor(sign).replace('your core style',''); }
  function elementMeaning(el){ return ({Fire:'initiative, passion, and visible momentum',Earth:'practicality, embodiment, and consistency',Air:'ideas, conversation, and pattern-making',Water:'intuition, sensitivity, and emotional depth'})[el]; }
  function todayEnergy(transits){
    const moon = transits.find(p=>p.name==='Moon');
    const mars = transits.find(p=>p.name==='Mars');
    const phase = moonPhase(new Date());
    return {
      title:`${phase.name} with Mars in ${mars.sign}`,
      text:`Today's mood is shaped by a ${phase.name.toLowerCase()} pulse and a Mars emphasis in ${mars.sign}. Lead with ${ELEMENT_BY_SIGN[mars.sign].toLowerCase()}-style action: ${elementMeaning(ELEMENT_BY_SIGN[mars.sign]).toLowerCase()}.`,
      phase
    };
  }
  function angularSeparation(a,b){
    const diff = Math.abs(fixAngle(a - b));
    return Math.min(diff, 360 - diff);
  }
  function transitAspects(natal, transits){
    const aspectDefs = [
      {name:'Conjunction', angle:0, orb:7, tone:'fusion and emphasis'},
      {name:'Sextile', angle:60, orb:4, tone:'cooperation and opportunity'},
      {name:'Square', angle:90, orb:6, tone:'friction that asks for action'},
      {name:'Trine', angle:120, orb:6, tone:'ease, flow, and natural support'},
      {name:'Opposition', angle:180, orb:7, tone:'polarity, mirroring, and integration'}
    ];
    const hits = [];
    transits.forEach(transit => {
      natal.forEach(birth => {
        aspectDefs.forEach(def => {
          const sep = angularSeparation(transit.lon, birth.lon);
          const orb = Math.abs(sep - def.angle);
          if(orb <= def.orb){
            hits.push({ transit: transit.name, natal: birth.name, aspect: def.name, orb, tone: def.tone, separation: sep });
          }
        });
      });
    });
    return hits.sort((a,b) => a.orb - b.orb).slice(0, 10);
  }
  function aspectSummary(natal, transits){
    const aspects = transitAspects(natal, transits);
    if(!aspects.length) return 'Transits today emphasize gradual adjustment more than dramatic disruption.';
    const strongest = aspects[0];
    return `The strongest current aspect is transiting ${strongest.transit} ${strongest.aspect.toLowerCase()} natal ${strongest.natal}, a pattern of ${strongest.tone} with a ${strongest.orb.toFixed(1)}° orb.`;
  }
  function themeGold(){
    try {
      const v = getComputedStyle(document.body).getPropertyValue('--gold').trim();
      return v || '#c9a84c';
    } catch(e){ return '#c9a84c'; }
  }
  function wheelSvg(natal, transits, ascLon){
    const gold = themeGold();
    const size = 420, c = size/2, rOuter = 190, rInner = 120;
    const zodiac = Array.from({length:12}).map((_,i)=>{
      const angle = -90 + i*30;
      const x = c + Math.cos((angle+15)*DEG) * 155;
      const y = c + Math.sin((angle+15)*DEG) * 155;
      return `<g><line x1="${c}" y1="${c}" x2="${c + Math.cos(angle*DEG)*rOuter}" y2="${c + Math.sin(angle*DEG)*rOuter}" stroke="${gold}" stroke-opacity="0.16" stroke-width="1"/><text x="${x}" y="${y}" fill="${gold}" fill-opacity="0.9" font-size="22" text-anchor="middle" dominant-baseline="middle">${SIGN_SYMBOLS[i]}</text></g>`;
    }).join('');
    const houses = Array.from({length:12}).map((_,i)=>{
      const angle = ascLon + i*30 - 90;
      return `<line x1="${c}" y1="${c}" x2="${c + Math.cos(angle*DEG)*rInner}" y2="${c + Math.sin(angle*DEG)*rInner}" stroke="rgba(245,237,224,0.11)" stroke-width="1"/>`;
    }).join('');
    function plot(set, radius, color){
      return set.map(p=>{
        const angle = fixAngle(p.lon) - 90;
        const x = c + Math.cos(angle*DEG)*radius;
        const y = c + Math.sin(angle*DEG)*radius;
        return `<g><circle cx="${x}" cy="${y}" r="11" fill="${color}" opacity="0.95"/><text x="${x}" y="${y+1}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#0d0a12">${p.symbol}</text></g>`;
      }).join('');
    }
    return `<svg viewBox="0 0 ${size} ${size}" aria-label="Birth chart wheel"><circle cx="${c}" cy="${c}" r="${rOuter}" fill="#130d1e" stroke="${gold}" stroke-opacity="0.35" stroke-width="2"/><circle cx="${c}" cy="${c}" r="${rInner}" fill="none" stroke="${gold}" stroke-opacity="0.2" stroke-width="1.5"/>${zodiac}${houses}${plot(transits, 112, 'rgba(78,190,200,0.95)')}${plot(natal, 72, gold)}<text x="${c}" y="${c}" text-anchor="middle" fill="rgba(245,237,224,0.7)" font-size="12">ASC ${signOf(ascLon).symbol}</text></svg>`;
  }
  function windowLabel(h){
    const fmt = (x) => { const hh = ((x%24)+24)%24; const ap = hh < 12 ? 'AM' : 'PM'; const h12 = hh % 12 === 0 ? 12 : hh % 12; return `${h12} ${ap}`; };
    return `${fmt(h)} – ${fmt(h+2)}`;
  }
  async function risingByTime({dateStr, city}){
    // For unknown birth times: possible rising signs in 2-hour windows across the birth date.
    if(!dateStr) throw new Error('Please enter a birth date.');
    const location = await geocodeCity(city);
    const lat = location?.lat ?? 0;
    const lon = location?.lon ?? 0;
    const iana = (lat || lon) ? await timezoneNameFor(lat, lon) : viewerTimezone();
    const rows = [];
    for(let h=0; h<24; h+=2){
      const mid = `${String(h+1).padStart(2,'0')}:00`;
      let utc;
      if(iana){ utc = zonedLocalToUTC(dateStr, mid, iana); }
      else { utc = new Date(Date.UTC(+dateStr.slice(0,4), +dateStr.slice(5,7)-1, +dateStr.slice(8,10), h+1, 0, 0)); }
      const sign = signOf(ascendant(utc, lat, lon));
      rows.push({ window: windowLabel(h), sign: sign.name, symbol: sign.symbol });
    }
    return { location, iana, rows };
  }
  async function generateChart({dateStr,timeStr,city}){
    if(!dateStr) throw new Error('Please enter a birth date.');
    const location = await geocodeCity(city);
    const lat = location?.lat ?? 0;
    const lon = location?.lon ?? 0;
    const iana = (lat || lon) ? await timezoneNameFor(lat, lon) : viewerTimezone();
    const hasTime = Boolean(timeStr && timeStr.trim());
    const birthUTC = iana
      ? zonedLocalToUTC(dateStr, hasTime ? timeStr : '12:00', iana)
      : new Date(Date.UTC(+dateStr.slice(0,4), +dateStr.slice(5,7)-1, +dateStr.slice(8,10), 12, 0, 0));
    const natal = getPlanetSet(birthUTC);
    const transits = getPlanetSet(new Date());
    const aspects = transitAspects(natal, transits);
    const ascLon = hasTime ? ascendant(birthUTC, lat, lon) : null;
    const mcLon = hasTime ? mc(birthUTC, lon) : null;
    return {
      location,
      iana,
      hasTime,
      birthUTC,
      natal,
      transits,
      aspects,
      ascLon,
      mcLon,
      wheelSvg: hasTime ? wheelSvg(natal, transits, ascLon) : null,
      interpretation: hasTime ? buildInterpretation(natal, ascLon) : null,
      today: todayEnergy(transits),
      transitSummary: aspectSummary(natal, transits)
    };
  }
  function zodiacFromDate(mmdd){
    const [m,d] = mmdd.split('-').map(Number);
    const ranges = [
      ['Capricorn',[1,1],[1,19]],['Aquarius',[1,20],[2,18]],['Pisces',[2,19],[3,20]],['Aries',[3,21],[4,19]],['Taurus',[4,20],[5,20]],['Gemini',[5,21],[6,20]],['Cancer',[6,21],[7,22]],['Leo',[7,23],[8,22]],['Virgo',[8,23],[9,22]],['Libra',[9,23],[10,22]],['Scorpio',[10,23],[11,21]],['Sagittarius',[11,22],[12,21]],['Capricorn',[12,22],[12,31]]
    ];
    return ranges.find(([,s,e]) => (m>s[0] || (m===s[0] && d>=s[1])) && (m<e[0] || (m===e[0] && d<=e[1])))[0];
  }
  window.AstrologyEngine = { generateChart, risingByTime, zodiacFromDate, moonPhase, signOf, PLANETS, SIGNS, todayEnergy, getPlanetSet, transitAspects, angularSeparation, julianDay };
})();
