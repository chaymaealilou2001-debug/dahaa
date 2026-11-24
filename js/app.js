'use strict';
// Dahaa : salles multijoueur en pair-à-pair (PeerJS).
// Le téléphone qui crée la salle est l'« hôte » : il garde l'état du jeu
// et envoie à chaque joueur uniquement ce qu'il a le droit de voir.
// Les textes sont traduits sur chaque téléphone (chacun choisit sa langue).

const PREFIX = 'dahaa-v1-';
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const MAX_PLAYERS = 10;

const me = { pid: LS.get('dahaa.pid', null), name: LS.get('dahaa.name', '') };
if (!me.pid) { me.pid = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); LS.set('dahaa.pid', me.pid); }

let peer = null;
let role = null;          // 'host' | 'client' | null
let hostConn = null;      // client -> hôte
const conns = new Map();  // hôte : pid -> connexion
let H = null;             // hôte : état de la salle
let timers = [];
let lastView = null;
let joinTimeout = null;
let screenFn = null;      // pour redessiner l'écran courant après un changement de langue

const randCode = () => Array.from({ length: 4 }, () => ALPHA[Math.floor(Math.random() * ALPHA.length)]).join('');
const cleanName = (n) => String(n || '').replace(/\s+/g, ' ').trim().slice(0, 16) || t('player');

// ---------- Messages ----------
function toast(msg, ms = 2600) {
  const el = $('#toast');
  el.textContent = msg; el.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => { el.hidden = true; }, ms);
}
function modal(html, btn = true) {
  const m = $('#modal');
  m.innerHTML = `<div class="sheet">${html}${btn ? `<div class="footer"><button class="primary block" data-close>${t('ok')}</button></div>` : ''}</div>`;
  m.hidden = false;
  m.onclick = (e) => { if (e.target === m || e.target.closest('[data-close]')) m.hidden = true; };
}

// ---------- Choix de la langue ----------
const langBtn = () => `<button class="ghost small langbtn" data-langmenu aria-label="${t('lang.title')}">🌐 ${I18N.lang.toUpperCase()}</button>`;
document.addEventListener('click', (e) => {
  if (!e.target.closest('[data-langmenu]')) return;
  modal(`<h2>🌐 ${t('lang.title')}</h2><div class="stack">${Object.entries(LANGS).map(([k, n]) =>
    `<button class="block ${k === I18N.lang ? 'gold' : ''}" data-setlang="${k}" ${k === 'ar' ? 'dir="rtl"' : ''}>${n}</button>`).join('')}</div>`, false);
  $('#modal').querySelectorAll('[data-setlang]').forEach((b) => {
    b.onclick = () => { setLang(b.dataset.setlang); $('#modal').hidden = true; redraw(); };
  });
});
function redraw() {
  const app = $('#app');
  // En jeu, on garde la zone de jeu (et ce qui y est en cours) : seul le texte est redessiné
  if (!(lastView && lastView.screen === 'game')) app.dataset.screen = '';
  if (lastView) render(lastView); else if (screenFn) screenFn();
}

// ---------- Joueurs virtuels (robots) ----------
const BOT_NAMES = ['Lina', 'Omar', 'Yasmine', 'Karim', 'Salma', 'Adam', 'Nora', 'Ilyas', 'Rania'];
let botLoop = null;
const botMem = {};

function addBot() {
  if (!H || H.screen !== 'lobby' || H.players.length >= MAX_PLAYERS) return;
  const used = new Set(H.players.map((p) => p.name));
  const name = '🤖 ' + (BOT_NAMES.find((n) => !used.has('🤖 ' + n)) || 'Bot');
  H.players.push({ pid: 'bot-' + Math.random().toString(36).slice(2, 8), name, online: true, bot: true });
  broadcast();
}
function removeBot(pid) {
  if (!H || H.screen !== 'lobby') return;
  H.players = H.players.filter((p) => !(p.bot && p.pid === pid));
  broadcast();
}
const isBot = (pid) => !!(H && H.players.find((p) => p.pid === pid && p.bot));

// Toutes les 300 ms, chaque robot regarde ce qu'il voit (comme un vrai joueur) et décide.
function startBotLoop() {
  clearInterval(botLoop);
  botLoop = setInterval(() => {
    if (!H || H.screen !== 'game' || !H.g) return;
    const G = GAMES[H.gameId];
    if (!G.bot) return;
    for (const p of H.players) {
      if (!p.bot) continue;
      const mem = (botMem[p.pid + ':' + H.gameId] = botMem[p.pid + ':' + H.gameId] || {});
      let a = null;
      try { a = G.bot(G.view(H.g, p.pid), mem, p.pid); } catch (e) { console.warn('bot', e); }
      if (a) {
        mem.at = Date.now() + 900; // évite de répéter une action refusée en boucle
        doAction(p.pid, a);
        if (!H || H.screen !== 'game') return;
      }
    }
  }, 300);
}

// Partie solo : pas de réseau, l'hôte joue avec des robots.
function soloCreate() {
  teardown();
  role = 'host';
  H = { code: 'SOLO', solo: true, hostPid: me.pid, players: [{ pid: me.pid, name: me.name, online: true }], screen: 'lobby', gameId: null, g: null };
  addBot(); addBot();
  startBotLoop();
}

// ---------- Réseau : hôte ----------
function hostCreate() {
  teardown();
  role = 'host';
  startBotLoop();
  showLoading('loading.create');
  const code = randCode();
  peer = new Peer(PREFIX + code);
  peer.on('open', () => {
    H = { code, hostPid: me.pid, players: [{ pid: me.pid, name: me.name, online: true }], screen: 'lobby', gameId: null, g: null };
    history.replaceState(null, '', location.pathname);
    broadcast();
  });
  peer.on('connection', (conn) => {
    conn.on('data', (msg) => hostHandle(conn, msg));
    conn.on('close', () => {
      if (!conn.pid || conns.get(conn.pid) !== conn) return;
      conns.delete(conn.pid);
      const p = H && H.players.find((x) => x.pid === conn.pid);
      if (p) { p.online = false; if (H.screen === 'lobby') H.players = H.players.filter((x) => x !== p); }
      broadcast();
    });
  });
  peer.on('error', (e) => {
    if (e.type === 'unavailable-id' && !H) return hostCreate();
    netError(e);
  });
  peer.on('disconnected', () => { try { peer.reconnect(); } catch { /* ignore */ } });
}

function hostHandle(conn, msg) {
  if (!H || !msg || typeof msg !== 'object') return;
  if (msg.t === 'join') {
    const pid = String(msg.pid || '').slice(0, 40);
    if (!pid) return;
    let p = H.players.find((x) => x.pid === pid);
    if (!p) {
      if (H.screen !== 'lobby') { conn.send({ t: 'err', key: 'err.inGame' }); return; }
      if (H.players.length >= MAX_PLAYERS) { conn.send({ t: 'err', key: 'err.full' }); return; }
      p = { pid, name: cleanName(msg.name), online: true };
      H.players.push(p);
    } else {
      p.online = true;
      if (H.screen === 'lobby') p.name = cleanName(msg.name);
    }
    const old = conns.get(pid);
    if (old && old !== conn) { try { old.close(); } catch { /* ignore */ } }
    conns.set(pid, conn);
    conn.pid = pid;
    broadcast();
    return;
  }
  if (msg.t === 'act' && conn.pid) doAction(conn.pid, msg.a);
}

function gameCtx() {
  return {
    now: () => Date.now(),
    after(ms, fn) { const id = setTimeout(() => { timers = timers.filter((x) => x !== id); if (H && H.g) { fn(H.g); broadcast(); } }, ms); timers.push(id); return id; },
    every(ms, fn) { const id = setInterval(() => { if (H && H.g) { if (fn(H.g)) broadcast(); } }, ms); timers.push(id); return id; },
    cancel(id) { clearTimeout(id); clearInterval(id); timers = timers.filter((x) => x !== id); },
    online: (pid) => { const p = H.players.find((x) => x.pid === pid); return !!(p && p.online); },
  };
}
function clearTimers() { timers.forEach((id) => { clearTimeout(id); clearInterval(id); }); timers = []; }

function doAction(pid, a) {
  if (!H || !a || typeof a !== 'object') return;
  const isHost = pid === H.hostPid;
  if (a.k === 'lobby:start') {
    if (!isHost) return;
    const G = GAMES[a.game];
    if (!G) return;
    const ps = H.players.filter((p) => p.online);
    if (ps.length < G.min) return toastFor(pid, 'err.min', { n: G.min });
    if (ps.length > G.max) return toastFor(pid, 'err.max', { n: G.max });
    clearTimers();
    H.players = ps;
    H.gameId = G.id;
    H.g = G.init(ps.map((p) => ({ pid: p.pid, name: p.name })), gameCtx());
    // Affiche d'explication avant la partie (sauf pour « Rejouer »)
    H.screen = a.skipIntro ? 'game' : 'intro';
    H.ready = {};
    H.players.forEach((p) => { if (p.bot) H.ready[p.pid] = true; });
    Object.keys(botMem).forEach((k) => delete botMem[k]);
    return broadcast();
  }
  if (a.k === 'intro:ready' && H.screen === 'intro') {
    H.ready[pid] = !H.ready[pid];
    if (H.players.filter((p) => p.online).every((p) => p.bot || H.ready[p.pid])) H.screen = 'game';
    return broadcast();
  }
  if (a.k === 'bot:add' && isHost) return addBot();
  if (a.k === 'bot:remove' && isHost) return removeBot(a.pid);
  if (a.k === 'intro:go' && H.screen === 'intro') {
    if (!isHost) return;
    H.screen = 'game';
    return broadcast();
  }
  if (a.k === 'lobby:back') {
    if (!isHost) return;
    clearTimers();
    H.screen = 'lobby'; H.gameId = null; H.g = null;
    H.players = H.players.filter((p) => p.online);
    return broadcast();
  }
  if (a.k === 'lobby:again') {
    if (!isHost || !H.gameId) return;
    return doAction(pid, { k: 'lobby:start', game: H.gameId, skipIntro: true });
  }
  if (H.screen === 'game' && H.g) {
    const G = GAMES[H.gameId];
    const err = G.act(H.g, pid, a, gameCtx(), isHost);
    // Une erreur est une clé de traduction (ou {key, p})
    if (typeof err === 'string') return toastFor(pid, err);
    if (err && err.key) return toastFor(pid, err.key, err.p);
    broadcast();
  }
}

function toastFor(pid, key, p) {
  if (pid === me.pid) return toast(t(key, p));
  const c = conns.get(pid);
  if (c && c.open) c.send({ t: 'toast', key, p });
}

function viewFor(pid) {
  const G = H.gameId && GAMES[H.gameId];
  return {
    code: H.code, solo: !!H.solo, me: pid, hostPid: H.hostPid, screen: H.screen, gameId: H.gameId,
    players: H.players.map((p) => ({ pid: p.pid, name: p.name, online: p.online, bot: !!p.bot })),
    ready: H.screen === 'intro' ? Object.keys(H.ready || {}).filter((p) => H.ready[p]) : null,
    gv: G && H.g && H.screen === 'game' ? G.view(H.g, pid) : null,
  };
}

function broadcast() {
  if (!H) return;
  for (const [pid, c] of conns) if (c.open) { try { c.send({ t: 'view', v: viewFor(pid) }); } catch { /* ignore */ } }
  render(viewFor(me.pid));
}

// ---------- Réseau : invité ----------
function clientJoin(code) {
  code = String(code || '').toUpperCase().replace(/[^A-Z]/g, '');
  if (code.length !== 4) return toast(t('err.code4'));
  teardown();
  role = 'client';
  showLoading('loading.join', { code });
  LS.set('dahaa.lastCode', code);
  peer = new Peer();
  joinTimeout = setTimeout(() => { if (!lastView) { toast(t('err.timeout')); leave(); } }, 15000);
  peer.on('open', () => {
    hostConn = peer.connect(PREFIX + code, { reliable: true });
    hostConn.on('open', () => hostConn.send({ t: 'join', pid: me.pid, name: me.name }));
    hostConn.on('data', (msg) => {
      if (!msg || typeof msg !== 'object') return;
      if (msg.t === 'view') { clearTimeout(joinTimeout); render(msg.v); }
      else if (msg.t === 'toast') toast(t(msg.key, msg.p));
      else if (msg.t === 'err') { toast(t(msg.key), 4000); leave(); }
    });
    hostConn.on('close', () => {
      if (role !== 'client') return;
      toast(t('err.lost'), 4000);
      leave();
    });
  });
  peer.on('error', (e) => {
    if (e.type === 'peer-unavailable') { toast(t('err.notFound'), 4000); return leave(); }
    netError(e);
  });
}

function send(a) {
  if (role === 'host') doAction(me.pid, a);
  else if (hostConn && hostConn.open) hostConn.send({ t: 'act', a });
  else toast(t('err.notConnected'));
}

function netError(e) {
  console.warn('PeerJS', e);
  if (e && (e.type === 'network' || e.type === 'server-error' || e.type === 'socket-error')) toast(t('err.net'), 4000);
}

function teardown() {
  clearTimers();
  clearInterval(botLoop); botLoop = null;
  clearTimeout(joinTimeout);
  conns.clear();
  if (hostConn) { try { hostConn.close(); } catch { /* ignore */ } }
  if (peer) { try { peer.destroy(); } catch { /* ignore */ } }
  peer = null; hostConn = null; role = null; H = null; lastView = null;
}

function leave() { teardown(); showHome(); }

// ---------- Écrans ----------
const logo = () => `<div class="logo" dir="ltr">Dah<span>aa</span></div>`;

function showLoading(key, p) {
  screenFn = () => showLoading(key, p);
  $('#app').dataset.screen = 'loading';
  $('#app').innerHTML = `<div class="topbar"><span></span>${langBtn()}</div><div class="brand">${logo()}</div>
    <div class="card center"><div class="spinner"></div><p>${esc(t(key, p))}</p>
    <button class="ghost small" id="cancel">${t('cancel')}</button></div>`;
  $('#cancel').onclick = leave;
}

function showHome() {
  screenFn = showHome;
  const params = new URLSearchParams(location.search);
  const typed = $('#name') ? $('#name').value : null;
  const joinCode = ($('#code') && $('#code').value) || (params.get('join') || '').toUpperCase();
  $('#app').dataset.screen = 'home';
  $('#app').innerHTML = `
    <div class="topbar"><span></span>${langBtn()}</div>
    <div class="brand">
      ${logo()}
      <div class="ar">دهاء</div>
      <p>${t('app.tagline')}</p>
    </div>
    <div class="card stack">
      <label class="muted" for="name">${t('home.name')}</label>
      <input type="text" id="name" maxlength="16" autocomplete="nickname" placeholder="${esc(t('home.namePh'))}" value="${esc(typed != null ? typed : me.name)}">
    </div>
    <div class="card stack center">
      <button class="gold block" id="solo">${t('home.solo')}</button>
      <p class="muted" style="margin:0">${t('home.soloHelp')}</p>
    </div>
    <p class="muted center" style="margin:14px 0 8px">${t('home.or')}</p>
    <div class="card stack">
      <button class="primary block" id="create">${t('home.create')}</button>
      <div class="sep"></div>
      <div class="row">
        <input type="text" id="code" class="code grow" maxlength="4" placeholder="${esc(t('home.code'))}" value="${esc(joinCode || '')}" autocomplete="off" autocapitalize="characters">
        <button class="gold" id="join">${t('home.join')}</button>
      </div>
    </div>
    <p class="muted center" style="margin-top:16px">${t('home.tip')}</p>`;
  const getName = () => {
    const n = cleanName($('#name').value);
    if (!$('#name').value.trim()) { toast(t('home.needName')); $('#name').focus(); return null; }
    me.name = n; LS.set('dahaa.name', n); return n;
  };
  $('#create').onclick = () => { if (getName()) hostCreate(); };
  $('#solo').onclick = () => { if (getName()) soloCreate(); };
  $('#join').onclick = () => { if (getName()) clientJoin($('#code').value); };
  $('#code').onkeydown = (e) => { if (e.key === 'Enter') $('#join').click(); };
}

function render(v) {
  lastView = v;
  const app = $('#app');
  if (v.screen === 'lobby') return renderLobby(app, v);
  if (v.screen === 'intro') return renderIntro(app, v);
  renderGame(app, v);
}

function renderIntro(app, v) {
  const G = GAMES[v.gameId];
  const isHost = v.me === v.hostPid;
  const ready = new Set(v.ready || []);
  const iAmReady = ready.has(v.me);
  const online = v.players.filter((p) => p.online);
  app.dataset.screen = 'intro';
  app.innerHTML = `
    <div class="topbar"><div class="title">${G.emoji} ${esc(gName(G.id))}</div><div class="row"><span class="pill">${t('room')} <b>${esc(v.code)}</b></span>${langBtn()}</div></div>
    <div class="card">${posterHtml(G.id)}</div>
    <div class="card center">
      <button class="${iAmReady ? 'gold' : 'primary'} block" id="ready" style="font-size:1.1rem">${iAmReady ? t('intro.isReady') : t('intro.ready')}</button>
      <p class="muted" style="margin-top:10px">${t('intro.count', { a: ready.size, b: online.length })}</p>
      <ul class="players" style="justify-content:center">${online.map((p) => `<li>${ready.has(p.pid) ? '✅' : '⏳'} ${esc(p.name)}</li>`).join('')}</ul>
    </div>
    <div class="footer">${isHost ? `<button class="small ghost" id="go">${t('intro.go')}</button><button class="small ghost" id="back">${t('backLobby')}</button>` : `<button class="ghost small" id="quit2">${t('quit')}</button>`}</div>`;
  $('#ready').onclick = () => send({ k: 'intro:ready' });
  if (isHost) {
    $('#go').onclick = () => send({ k: 'intro:go' });
    $('#back').onclick = () => send({ k: 'lobby:back' });
  } else $('#quit2').onclick = confirmQuit;
}

function renderLobby(app, v) {
  const isHost = v.me === v.hostPid;
  const online = v.players.filter((p) => p.online).length;
  app.dataset.screen = 'lobby';
  app.innerHTML = `
    <div class="topbar">${logo().replace('logo', 'title')}<div class="row">${langBtn()}<button class="ghost small" id="quit">${t('quit')}</button></div></div>
    ${v.solo
    ? `<div class="card center"><h2>🤖 ${t('lobby.solo')}</h2><p class="muted" style="margin:0">${t('lobby.soloHelp')}</p></div>`
    : `<div class="card center">
      <div class="muted">${t('lobby.code')}</div>
      <div class="bigcode">${esc(v.code)}</div>
      <button class="small" id="share">${t('lobby.invite')}</button>
    </div>`}
    <div class="card">
      <h3>${t('lobby.players', { n: online })}</h3>
      <ul class="players">${v.players.map((p) => `<li class="${p.online ? '' : 'off'} ${p.pid === v.hostPid ? 'host' : ''}">${esc(p.name)}${p.pid === v.me ? ' ' + t('you') : ''}${p.bot && isHost ? ` <button class="xbtn" data-rmbot="${p.pid}" aria-label="${t('lobby.removeBot')}">✕</button>` : ''}</li>`).join('')}</ul>
      ${isHost ? `<button class="small block" id="addbot" style="margin-top:10px">${t('lobby.addBot')}</button>` : ''}
    </div>
    <div class="card">
      <h3>${isHost ? t('lobby.choose') : t('lobby.games')}</h3>
      ${isHost ? '' : `<p class="muted">${t('lobby.wait')}</p>`}
      <div class="games">${Object.values(GAMES).map((g) => `
        <div class="row">
          <button class="game grow" data-game="${g.id}" ${isHost ? '' : 'disabled style="opacity:1"'}>
            <span class="emo">${g.emoji}</span>
            <span><div class="gname">${esc(gName(g.id))}</div><div class="gdesc">${esc(gShort(g.id))}</div>
            <div class="gmeta">${t('lobby.nplayers', { a: g.min, b: g.max })}</div></span>
          </button>
          <button class="small ghost" data-rules="${g.id}">?</button>
        </div>`).join('')}</div>
    </div>`;
  $('#quit').onclick = confirmQuit;
  if ($('#share')) $('#share').onclick = () => shareRoom(v.code);
  if ($('#addbot')) $('#addbot').onclick = () => send({ k: 'bot:add' });
  app.querySelectorAll('[data-rmbot]').forEach((b) => { b.onclick = () => send({ k: 'bot:remove', pid: b.dataset.rmbot }); });
  app.querySelectorAll('[data-rules]').forEach((b) => { b.onclick = () => showRules(b.dataset.rules); });
  if (isHost) app.querySelectorAll('[data-game]').forEach((b) => { b.onclick = () => send({ k: 'lobby:start', game: b.dataset.game }); });
}

function renderGame(app, v) {
  const G = GAMES[v.gameId];
  const isHost = v.me === v.hostPid;
  if (app.dataset.screen !== 'game:' + v.gameId) {
    app.dataset.screen = 'game:' + v.gameId;
    app.innerHTML = `<div id="gtop"></div><div id="game"></div><div class="footer" id="gfoot"></div>`;
  }
  $('#gtop').innerHTML = `
    <div class="topbar"><div class="title">${G.emoji} ${esc(gName(G.id))}</div>
      <div class="row"><span class="pill">${t('room')} <b>${esc(v.code)}</b></span>${langBtn()}
      <button class="ghost small" id="rules">?</button></div></div>`;
  $('#rules').onclick = () => showRules(G.id);
  const names = Object.fromEntries(v.players.map((p) => [p.pid, p.name]));
  const ui = {
    me: v.me, isHost, players: v.players,
    name: (pid) => names[pid] || '?',
    send,
    toast: (key, p) => toast(t(key, p)),
  };
  const el = $('#game');
  const keep = saveInputs(el);
  G.render(el, v.gv, ui);
  restoreInputs(el, keep);
  const foot = $('#gfoot');
  const ended = v.gv && v.gv.phase === 'end';
  foot.innerHTML = isHost
    ? `${ended ? `<button class="primary" id="again">${t('again')}</button>` : ''}<button class="small ${ended ? '' : 'ghost'}" id="back">${ended ? t('backLobby') : t('stopGame')}</button>`
    : `<button class="ghost small" id="quit2">${t('quit')}</button>`;
  if (isHost) {
    $('#back').onclick = () => { if (ended || confirm(t('confirmStop'))) send({ k: 'lobby:back' }); };
    if (ended) $('#again').onclick = () => send({ k: 'lobby:again' });
  } else $('#quit2').onclick = confirmQuit;
}

// Garde le texte tapé et le focus quand l'écran se redessine.
function saveInputs(el) {
  const vals = {};
  el.querySelectorAll('input[id]').forEach((i) => { vals[i.id] = i.value; });
  const f = document.activeElement;
  return { vals, focus: f && el.contains(f) && f.id ? f.id : null, sel: f && f.selectionStart };
}
function restoreInputs(el, k) {
  for (const id in k.vals) { const i = el.querySelector('#' + CSS.escape(id)); if (i && !i.value) i.value = k.vals[id]; }
  if (k.focus) { const i = el.querySelector('#' + CSS.escape(k.focus)); if (i) { i.focus(); try { i.setSelectionRange(k.sel, k.sel); } catch { /* ignore */ } } }
}

function confirmQuit() {
  if (confirm(role === 'host' ? t('confirmQuitHost') : t('confirmQuit'))) leave();
}

function showRules(id) {
  modal(posterHtml(id, true));
}

async function shareRoom(code) {
  const url = `${location.origin}${location.pathname}?join=${code}`;
  const text = t('share.text', { code });
  try {
    if (navigator.share) return await navigator.share({ title: 'Dahaa', text, url });
    await navigator.clipboard.writeText(`${text}\n${url}`);
    toast(t('share.copied'));
  } catch { /* partage annulé */ }
}

// Prévenir avant de fermer l'onglet en tant qu'hôte
window.addEventListener('beforeunload', (e) => { if (role === 'host' && H && H.players.filter((p) => !p.bot).length > 1) { e.preventDefault(); e.returnValue = ''; } });

// Service worker (appli installable / hors-ligne)
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

if (typeof Peer === 'undefined') {
  $('#app').innerHTML = `<div class="topbar"><span></span>${langBtn()}</div><div class="card center" style="margin-top:40px"><h2>${t('offline.title')}</h2><p class="muted">${t('offline.text')}</p><button class="primary" onclick="location.reload()">${t('reload')}</button></div>`;
} else {
  showHome();
}
