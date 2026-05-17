// ─── SOURCES ──────────────────────────────────────────────────────────

const SOURCES = [
  // Global
  {id:'bbc',          name:'BBC News',          color:'#e05252', cat:'global',        on:true,  rss:'https://feeds.bbci.co.uk/news/rss.xml'},
  {id:'reuters',      name:'Reuters',           color:'#e05252', cat:'global',        on:true,  rss:'https://feeds.reuters.com/reuters/topNews'},
  {id:'guardian',     name:'The Guardian',      color:'#3daa6e', cat:'global',        on:true,  rss:'https://www.theguardian.com/world/rss'},
  {id:'aljazeera',    name:'Al Jazeera',        color:'#4d8ff5', cat:'global',        on:true,  rss:'https://www.aljazeera.com/xml/rss/all.xml'},
  {id:'dw',           name:'DW News',           color:'#4d8ff5', cat:'global',        on:false, rss:'https://rss.dw.com/rdf/rss-en-all'},
  // India
  {id:'hindu',        name:'The Hindu',         color:'#e07832', cat:'india',         on:true,  rss:'https://www.thehindu.com/feeder/default.rss'},
  {id:'toi',          name:'Times of India',    color:'#e05252', cat:'india',         on:true,  rss:'https://timesofindia.indiatimes.com/rssfeedstopstories.cms'},
  {id:'ndtv',         name:'NDTV',              color:'#e05252', cat:'india',         on:true,  rss:'https://feeds.feedburner.com/ndtvnews-top-stories'},
  {id:'ht',           name:'Hindustan Times',   color:'#e07832', cat:'india',         on:true,  rss:'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml'},
  {id:'ie',           name:'Indian Express',    color:'#4d8ff5', cat:'india',         on:false, rss:'https://indianexpress.com/feed/'},
  {id:'mint',         name:'Mint',              color:'#d4a853', cat:'india',         on:false, rss:'https://www.livemint.com/rss/news'},
  // Cricket
  {id:'cricinfo',     name:'ESPNcricinfo',      color:'#3daa6e', cat:'cricket',       on:true,  rss:'https://www.espncricinfo.com/rss/content/story/feeds/0.xml'},
  {id:'cricbuzz',     name:'Cricbuzz',          color:'#3daa6e', cat:'cricket',       on:true,  rss:'https://www.cricbuzz.com/cricket-news/rss-feeds/all'},
  // Sports
  {id:'espn',         name:'ESPN',              color:'#e07832', cat:'sports',        on:true,  rss:'https://www.espn.com/espn/rss/news'},
  {id:'skysports',    name:'Sky Sports',        color:'#4d8ff5', cat:'sports',        on:true,  rss:'https://www.skysports.com/rss/12040'},
  {id:'bbcsport',     name:'BBC Sport',         color:'#e07832', cat:'sports',        on:false, rss:'https://feeds.bbci.co.uk/sport/rss.xml'},
  // Tech
  {id:'techcrunch',   name:'TechCrunch',        color:'#8b6ee8', cat:'tech',          on:true,  rss:'https://techcrunch.com/feed/'},
  {id:'verge',        name:'The Verge',         color:'#8b6ee8', cat:'tech',          on:true,  rss:'https://www.theverge.com/rss/index.xml'},
  {id:'wired',        name:'Wired',             color:'#3dc4c4', cat:'tech',          on:true,  rss:'https://www.wired.com/feed/rss'},
  {id:'ars',          name:'Ars Technica',      color:'#8b6ee8', cat:'tech',          on:false, rss:'https://feeds.arstechnica.com/arstechnica/index'},
  // Business
  {id:'bloomberg',    name:'Bloomberg',         color:'#d4a853', cat:'business',      on:true,  rss:'https://feeds.bloomberg.com/markets/news.rss'},
  {id:'ft',           name:'Financial Times',   color:'#d4a853', cat:'business',      on:false, rss:'https://www.ft.com/rss/home/uk'},
  {id:'et',           name:'Economic Times',    color:'#e07832', cat:'business',      on:true,  rss:'https://economictimes.indiatimes.com/rssfeedstopstories.cms'},
  // Science
  {id:'sciencedaily', name:'Science Daily',     color:'#3dc4c4', cat:'science',       on:true,  rss:'https://www.sciencedaily.com/rss/all.xml'},
  {id:'nasa',         name:'NASA News',         color:'#4d8ff5', cat:'science',       on:true,  rss:'https://www.nasa.gov/rss/dyn/breaking_news.rss'},
  // Entertainment
  {id:'variety',      name:'Variety',           color:'#e066a8', cat:'entertainment', on:true,  rss:'https://variety.com/feed/'},
  {id:'bollywood',    name:'Bollywood Hungama', color:'#e066a8', cat:'entertainment', on:true,  rss:'https://www.bollywoodhungama.com/rss/news.xml'},
];

const CAT = {
  global:        {label:'World',  cls:'tg-global',        color:'#4d8ff5'},
  india:         {label:'India',  cls:'tg-india',         color:'#e05252'},
  cricket:       {label:'Cricket',cls:'tg-cricket',       color:'#3daa6e'},
  sports:        {label:'Sports', cls:'tg-sports',        color:'#e07832'},
  tech:          {label:'Tech',   cls:'tg-tech',          color:'#8b6ee8'},
  business:      {label:'Biz',    cls:'tg-business',      color:'#d4a853'},
  science:       {label:'Science',cls:'tg-science',       color:'#3dc4c4'},
  entertainment: {label:'Film',   cls:'tg-entertainment', color:'#e066a8'},
};

const CACHE_KEY = 'np2_v1';
const CACHE_TTL = 30 * 60 * 1000;

// ─── STATE ────────────────────────────────────────────────────────────

let srcState = {};
SOURCES.forEach(s => srcState[s.id] = s.on);
let allArticles = [];
let activeCat = 'all';

// ─── BOOT ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  loadPrefs();
  setupNav();
  setupCats();
  document.getElementById('rbtn').addEventListener('click', refresh);
  buildSources();
  loadCache();
});

function loadPrefs() {
  try { const s = JSON.parse(localStorage.getItem('np2_src')||'null'); if(s) srcState=s; } catch(e){}
}
function savePrefs() {
  try { localStorage.setItem('np2_src', JSON.stringify(srcState)); } catch(e){}
}

// ─── NAV ──────────────────────────────────────────────────────────────

function setupNav() {
  document.querySelectorAll('.bni').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.bni').forEach(x => x.classList.remove('on'));
      document.querySelectorAll('.panel').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      document.getElementById('panel-' + b.dataset.p).classList.add('on');
      document.getElementById('rbtn').style.display = b.dataset.p === 'news' ? 'flex' : 'none';
    });
  });
}

function setupCats() {
  document.getElementById('cat-row').addEventListener('click', e => {
    const pill = e.target.closest('.cpill');
    if (!pill) return;
    document.querySelectorAll('.cpill').forEach(p => p.classList.remove('on'));
    pill.classList.add('on');
    activeCat = pill.dataset.cat;
    renderFeed();
  });
}

// ─── FETCH & PARSE ────────────────────────────────────────────────────

async function fetchFeed(feed) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(feed.rss, {
      signal: ctrl.signal,
      headers: {'Accept':'application/rss+xml,application/xml,text/xml,*/*'}
    });
    clearTimeout(t);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return parseXML(await r.text(), feed);
  } catch(e) { clearTimeout(t); throw e; }
}

function parseXML(xml, feed) {
  const items = [];
  try {
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    if (doc.querySelector('parsererror')) return items;
    const nodes = [...doc.querySelectorAll('item'), ...doc.querySelectorAll('entry')];
    for (const n of nodes.slice(0, 7)) {
      const title = txt(n, ['title']);
      if (!title || title.length < 5) continue;
      const raw   = txt(n, ['description','summary','content\\:encoded','content']);
      const dateS = txt(n, ['pubDate','published','updated','dc\\:date']);
      const ts    = dateS ? new Date(dateS).getTime() : Date.now() - 3600000;
      items.push({
        title:   strip(title),
        summary: strip(raw).slice(0, 200),
        url:     link(n),
        ts, date: ago(ts),
        source:  feed.name,
        color:   feed.color,
        cat:     feed.cat,
        score:   0,
      });
    }
  } catch(e) {}
  return items;
}

function txt(node, tags) {
  for (const t of tags) {
    try { const e=node.querySelector(t); if(e&&e.textContent) return e.textContent.trim(); } catch(e){}
  }
  return '';
}

function link(node) {
  for (const l of node.querySelectorAll('link')) {
    const h=l.getAttribute('href'); if(h&&h.startsWith('http')) return h;
    const t=(l.textContent||'').trim(); if(t.startsWith('http')) return t;
  }
  const g=node.querySelector('guid');
  if(g){const v=(g.textContent||'').trim();if(v.startsWith('http'))return v;}
  return '#';
}

function strip(h) {
  return (h||'')
    .replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<script[\s\S]*?<\/script>/gi,'')
    .replace(/<!\[CDATA\[|\]\]>/g,'').replace(/<[^>]+>/g,' ')
    .replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<')
    .replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'")
    .replace(/\s+/g,' ').trim();
}

function ago(ts) {
  if (!ts) return '';
  const d = Date.now() - ts;
  if (d < 0) return 'just now';
  const m = Math.floor(d/60000);
  if (m < 1)  return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m/60);
  if (h < 24) return h + 'h ago';
  const dy = Math.floor(h/24);
  return dy < 7 ? dy + 'd ago' : Math.floor(dy/7) + 'w ago';
}

// ─── IMPORTANCE SCORING ───────────────────────────────────────────────

function score(a) {
  let s = 0;
  const tl = a.title.toLowerCase();
  const ageH = (Date.now() - a.ts) / 3600000;

  // Recency score — exponential decay
  if (ageH < 1)       s += 120;
  else if (ageH < 3)  s += 80;
  else if (ageH < 6)  s += 50;
  else if (ageH < 12) s += 25;
  else if (ageH < 24) s += 10;

  // Breaking / urgent
  ['breaking','urgent','alert','live','just in','exclusive','first','war','attack',
   'killed','dead','disaster','explosion','earthquake','flood','crisis','emergency',
   'historic','record','victory','wins','defeats','protests','arrested','convicted',
   'launches','announces','resigns','fired','dies','death','crash','blast']
    .forEach(w => { if (tl.includes(w)) s += 20; });

  // India relevance
  ['india','indian','modi','delhi','mumbai','bangalore','hyderabad','chennai','kolkata',
   'ipl','bcci','rupee','sensex','nifty','bjp','congress','supreme court','parliament',
   'pakistan','china border','kashmir','lok sabha','rajya sabha']
    .forEach(w => { if (tl.includes(w)) s += 15; });

  // Cricket relevance
  ['cricket','test','odi','t20','world cup','ipl','wicket','century','innings','runs',
   'rohit','virat','kohli','bumrah','stumps','match','series','trophy']
    .forEach(w => { if (tl.includes(w)) s += 18; });

  // Trusted sources get a boost
  ['bbc','reuters','the hindu','ndtv','espncricinfo','bloomberg']
    .forEach(src => { if (a.source.toLowerCase().includes(src)) s += 15; });

  // Has a good summary = higher quality article
  if (a.summary && a.summary.length > 80) s += 5;

  return s;
}

// ─── REFRESH ──────────────────────────────────────────────────────────

async function refresh() {
  const active = SOURCES.filter(s => srcState[s.id]);
  if (!active.length) { alert('Enable at least one source in Sources.'); return; }

  document.getElementById('spin').style.display = 'block';
  document.getElementById('rlbl').textContent = '…';
  document.getElementById('rbtn').disabled = true;
  showShimmer();

  const results = await Promise.allSettled(active.map(f => fetchFeed(f)));
  const articles = [];
  const failed = [];

  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value.length) {
      r.value.forEach(a => { a.score = score(a); articles.push(a); });
    } else {
      failed.push(active[i].name);
    }
  });

  document.getElementById('spin').style.display = 'none';
  document.getElementById('rbtn').disabled = false;

  if (articles.length > 0) {
    // Sort by score descending — most important first
    articles.sort((a, b) => b.score - a.score);

    // Deduplicate similar titles
    const seen = new Set();
    allArticles = articles.filter(a => {
      const key = a.title.toLowerCase().slice(0, 40);
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });

    try { localStorage.setItem(CACHE_KEY, JSON.stringify({articles: allArticles, ts: Date.now()})); } catch(e){}
    renderFeed();
    setTicker();
    document.getElementById('rlbl').textContent = '↺ ' + allArticles.length;
    if (failed.length) showNote(failed.length + ' source' + (failed.length > 1 ? 's' : '') + ' unavailable on this network');
  } else {
    showError('Could not load any feeds. Errors: ' + failed.slice(0, 3).join(', ') + '.\n\nMake sure you\'re on personal WiFi, not a work/org network.');
    document.getElementById('rlbl').textContent = '↺ Retry';
  }
}

// ─── CACHE ────────────────────────────────────────────────────────────

function loadCache() {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (c && c.articles && Date.now() - c.ts < CACHE_TTL) {
      allArticles = c.articles;
      renderFeed();
      setTicker();
      const mins = Math.round((CACHE_TTL - (Date.now() - c.ts)) / 60000);
      document.getElementById('rlbl').textContent = '↺ ' + mins + 'm';
    }
  } catch(e) {}
}

// ─── RENDER ───────────────────────────────────────────────────────────

function renderFeed() {
  const el = document.getElementById('feed');
  let list = activeCat === 'all'
    ? allArticles
    : allArticles.filter(a => a.cat === activeCat);

  if (!list.length) {
    el.innerHTML = `<div class="statebox"><div class="state-ico">📭</div>
      <div class="state-txt">No stories in this category. Tap ↺ Refresh or try another tab.</div></div>`;
    return;
  }

  el.innerHTML = '';

  // ── HERO CARD (top story) ──
  const top = list[0];
  const topMeta = CAT[top.cat] || CAT.global;
  const hero = document.createElement('a');
  hero.className = 'hero';
  hero.href = top.url || '#';
  hero.target = '_blank';
  hero.rel = 'noreferrer';
  hero.innerHTML = `
    <div class="hero-top">
      <div class="hero-eyebrow">
        <span class="ctag ${topMeta.cls}">${topMeta.label}</span>
        <span class="hero-label">Top story</span>
      </div>
    </div>
    <div class="hero-body">
      <div class="hero-title">${top.title}</div>
      ${top.summary ? `<div class="hero-summary">${top.summary}</div>` : ''}
      <div class="hero-footer">
        <span class="hero-src">${top.source}</span>
        ${top.date ? `<span style="color:var(--dim);font-size:11px">·</span><span class="hero-time">${top.date}</span>` : ''}
        <span class="hero-score">Score ${top.score}</span>
      </div>
    </div>`;
  el.appendChild(hero);

  // ── DIVIDER ──
  const div = document.createElement('div');
  div.className = 'feed-divider';
  div.innerHTML = `<span class="feed-divider-label">More stories</span><div class="feed-divider-line"></div>`;
  el.appendChild(div);

  // ── REST OF FEED ──
  list.slice(1).forEach((a, i) => {
    const meta = CAT[a.cat] || CAT.global;
    const item = document.createElement('a');
    item.className = 'nitem';
    item.href = a.url || '#';
    item.target = '_blank';
    item.rel = 'noreferrer';
    item.innerHTML = `
      <div class="nitem-num">${String(i + 2).padStart(2, '0')}</div>
      <div class="nitem-body">
        <div class="nitem-meta">
          <span class="ctag ${meta.cls}">${meta.label}</span>
          <span class="nsrc">${a.source}</span>
          ${a.date ? `<span class="ntime">${a.date}</span>` : ''}
        </div>
        <div class="ntitle">${a.title}</div>
        ${a.summary ? `<div class="nsummary">${a.summary}</div>` : ''}
      </div>`;
    el.appendChild(item);
  });
}

// ─── TICKER ───────────────────────────────────────────────────────────

function setTicker() {
  const wrap = document.getElementById('ticker');
  const inner = document.getElementById('ticker-inner');
  const top5 = allArticles.slice(0, 6).map(a => a.title);
  if (!top5.length) return;
  inner.innerHTML = top5.map(t => `<span>${t}</span>`).join('');
  wrap.classList.remove('hidden');
}

// ─── SOURCES ──────────────────────────────────────────────────────────

function buildSources() {
  const el = document.getElementById('src-list');
  el.innerHTML = '';

  // Group by category
  const groups = {};
  SOURCES.forEach(s => { if (!groups[s.cat]) groups[s.cat] = []; groups[s.cat].push(s); });

  Object.entries(groups).forEach(([cat, sources]) => {
    const meta = CAT[cat] || {label: cat};

    const lbl = document.createElement('div');
    lbl.className = 'sg-label';
    lbl.textContent = meta.label;
    el.appendChild(lbl);

    sources.forEach(s => {
      const row = document.createElement('div');
      row.className = 'stog';
      row.innerHTML = `
        <div class="stog-l">
          <div style="width:8px;height:8px;border-radius:50%;background:${s.color};flex-shrink:0"></div>
          <div>
            <div class="sname">${s.name}</div>
            <div class="ssub">${s.rss.replace('https://','').split('/')[0]}</div>
          </div>
        </div>
        <div class="tog ${srcState[s.id] ? 'on' : ''}" id="tog-${s.id}"></div>`;
      row.addEventListener('click', () => {
        srcState[s.id] = !srcState[s.id];
        document.getElementById('tog-' + s.id).classList.toggle('on', srcState[s.id]);
        savePrefs();
      });
      el.appendChild(row);
    });
  });
}

// ─── STATES ───────────────────────────────────────────────────────────

function showShimmer() {
  let h = '<div class="shimwrap">';
  h += `<div style="margin:12px 14px;background:var(--s1);border-radius:16px;padding:16px">
    <div class="sh" style="height:10px;width:65px;margin-bottom:12px"></div>
    <div class="sh" style="height:20px;width:95%;margin-bottom:7px"></div>
    <div class="sh" style="height:15px;width:85%;margin-bottom:7px"></div>
    <div class="sh" style="height:13px;width:70%;margin-bottom:12px"></div>
    <div class="sh" style="height:11px;width:45%"></div>
  </div>`;
  for (let i = 0; i < 7; i++) {
    h += `<div class="shrow">
      <div class="sh" style="height:22px;width:22px;border-radius:4px;flex-shrink:0"></div>
      <div class="shcol">
        <div class="sh" style="height:10px;width:55px"></div>
        <div class="sh" style="height:14px;width:90%"></div>
        <div class="sh" style="height:11px;width:72%"></div>
      </div>
    </div>`;
  }
  document.getElementById('feed').innerHTML = h + '</div>';
}

function showError(msg) {
  document.getElementById('feed').innerHTML = `
    <div class="statebox">
      <div class="state-ico" style="opacity:.5">⚠️</div>
      <div class="err-txt">${msg}</div>
      <div class="err-hint">Try on a personal WiFi connection — org/work networks often block RSS feeds.</div>
    </div>`;
}

function showNote(msg) {
  document.getElementById('notebar-wrap').innerHTML =
    `<div class="notebar">⚠ ${msg}</div>`;
}
