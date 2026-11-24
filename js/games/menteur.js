'use strict';
// LE MENTEUR : chacun a des cartes de couleur cachées. On annonce « il y a au moins N cartes de telle couleur »
// en tout. Le suivant surenchérit… ou crie « Menteur ! ».

(() => {
  const COLORS = { r: { c: '#e5384f' }, b: { c: '#5aa9ff' }, v: { c: '#3ccf8e' }, j: { c: '#f2c14e' } };
  // Noms des couleurs [singulier, pluriel]
  const CN = {
    fr: { r: ['rouge', 'rouges'], b: ['bleue', 'bleues'], v: ['verte', 'vertes'], j: ['jaune', 'jaunes'] },
    en: { r: ['red', 'red'], b: ['blue', 'blue'], v: ['green', 'green'], j: ['yellow', 'yellow'] },
    ar: { r: ['حمراء', 'حمراء'], b: ['زرقاء', 'زرقاء'], v: ['خضراء', 'خضراء'], j: ['صفراء', 'صفراء'] },
  };
  const cname = (c, n = 1) => CN[I18N.lang][c][n > 1 ? 1 : 0];

  addStrings({
    fr: {
      'men.bid': (p) => `au moins <b>${p.n}</b> carte${p.n > 1 ? 's' : ''} ${p.c}`,
      'men.myTurn': '👉 <b>À toi de jouer</b>', 'men.turn': 'Tour de <b>{n}</b>', 'men.inPlay': '{n} cartes en jeu',
      'men.current': 'Annonce actuelle', 'men.first': 'Aucune — première annonce', 'men.yourBid': 'Ton annonce', 'men.bidBtn': 'Annoncer : au moins {n} {c}', 'men.liar': 'Menteur !',
      'men.called': '<b>{n}</b> a crié « Menteur » sur {b}.', 'men.there': 'Il y en avait <b>{r}</b> : ', 'men.true': 'l’annonce était <b>vraie</b> !', 'men.lie': 'c’était <b>un mensonge</b> !',
      'men.loses': '<b>{n}</b> perd une carte.', 'men.all': 'Toutes les cartes', 'men.yours': 'Tes cartes', 'men.history': 'Annonces de la manche', 'men.left': 'Cartes restantes',
      'men.e.total': 'Il n’y a que {n} cartes en jeu.', 'men.e.higher': 'Annonce un nombre plus grand que {n}.',
    },
    en: {
      'men.bid': (p) => `at least <b>${p.n}</b> ${p.c} card${p.n > 1 ? 's' : ''}`,
      'men.myTurn': '👉 <b>Your turn</b>', 'men.turn': '<b>{n}</b>’s turn', 'men.inPlay': '{n} cards in play',
      'men.current': 'Current bid', 'men.first': 'None — first bid', 'men.yourBid': 'Your bid', 'men.bidBtn': 'Bid: at least {n} {c}', 'men.liar': 'Liar!',
      'men.called': '<b>{n}</b> called “Liar” on {b}.', 'men.there': 'There were <b>{r}</b>: ', 'men.true': 'the bid was <b>true</b>!', 'men.lie': 'it was <b>a lie</b>!',
      'men.loses': '<b>{n}</b> loses a card.', 'men.all': 'All the cards', 'men.yours': 'Your cards', 'men.history': 'Bids this round', 'men.left': 'Cards left',
      'men.e.total': 'There are only {n} cards in play.', 'men.e.higher': 'Bid a number higher than {n}.',
    },
    ar: {
      'men.bid': (p) => `على الأقل <b>${p.n}</b> بطاقات ${p.c}`,
      'men.myTurn': '👉 <b>دورك</b>', 'men.turn': 'دور <b>{n}</b>', 'men.inPlay': '{n} بطاقة في اللعب',
      'men.current': 'الإعلان الحالي', 'men.first': 'لا شيء — أول إعلان', 'men.yourBid': 'إعلانك', 'men.bidBtn': 'أعلن: على الأقل {n} {c}', 'men.liar': 'كذّاب!',
      'men.called': '<b>{n}</b> صرخ «كذّاب» على: {b}.', 'men.there': 'كان هناك <b>{r}</b>: ', 'men.true': 'الإعلان كان <b>صحيحًا</b>!', 'men.lie': 'كان <b>كذبًا</b>!',
      'men.loses': '<b>{n}</b> يخسر بطاقة.', 'men.all': 'كل البطاقات', 'men.yours': 'بطاقاتك', 'men.history': 'إعلانات الجولة', 'men.left': 'البطاقات المتبقية',
      'men.e.total': 'هناك {n} بطاقة فقط في اللعب.', 'men.e.higher': 'أعلن رقمًا أكبر من {n}.',
    },
  });
  const KEYS = Object.keys(COLORS);
  const START = 5;

  function deck() {
    const d = [];
    KEYS.forEach((k) => { for (let i = 0; i < 10; i++) d.push(k); });
    for (let i = 0; i < 4; i++) d.push('*');
    return shuffle(d);
  }
  const cardHtml = (k, mini) => k === '*'
    ? `<span class="ccard ${mini ? 'mini' : ''}" style="background:conic-gradient(#e5384f 0 25%,#5aa9ff 0 50%,#3ccf8e 0 75%,#f2c14e 0)">★</span>`
    : `<span class="ccard ${mini ? 'mini' : ''}" style="background:${COLORS[k].c}"></span>`;
  const bidText = (b) => t('men.bid', { n: b.n, c: `<b style="color:${COLORS[b.c].c}">${cname(b.c, b.n)}</b>` });

  registerGame({
    id: 'menteur',
    emoji: '🎭',
    min: 2,
    max: 8,

    init(players) {
      const count = {};
      players.forEach((p) => { count[p.pid] = START; });
      const g = { players, count, order: shuffle(players.map((p) => p.pid)), turn: 0, phase: 'bid', hands: {}, bid: null, history: [], last: null, out: [] };
      deal(g);
      return g;
    },

    act(g, pid, a, ctx, isHost) {
      const alive = g.order.filter((p) => g.count[p] > 0);
      const cur = alive[g.turn % alive.length];
      if (a.k === 'bid' && g.phase === 'bid' && pid === cur) {
        const n = Math.floor(+a.n), c = String(a.c);
        if (!COLORS[c] || !(n >= 1)) return;
        const total = alive.reduce((s, p) => s + g.count[p], 0);
        if (n > total) return { key: 'men.e.total', p: { n: total } };
        if (g.bid && n <= g.bid.n) return { key: 'men.e.higher', p: { n: g.bid.n } };
        g.bid = { n, c, by: pid };
        g.history.push(g.bid);
        g.turn = (g.turn + 1) % alive.length;
        return;
      }
      if (a.k === 'liar' && g.phase === 'bid' && pid === cur && g.bid) {
        const real = alive.reduce((s, p) => s + g.hands[p].filter((k) => k === g.bid.c || k === '*').length, 0);
        const truth = real >= g.bid.n;
        const loser = truth ? pid : g.bid.by;
        g.count[loser] -= 1;
        g.last = { bid: g.bid, caller: pid, real, truth, loser, hands: { ...g.hands } };
        if (g.count[loser] === 0) g.out.unshift(loser);
        g.phase = 'reveal';
        g.nextStarter = loser;
        return;
      }
      if (a.k === 'next' && g.phase === 'reveal' && isHost) {
        const still = g.order.filter((p) => g.count[p] > 0);
        if (still.length <= 1) { g.phase = 'end'; g.winner = still[0]; return; }
        let s = still.indexOf(g.nextStarter);
        if (s < 0) { // le perdant est éliminé : on commence par le joueur suivant
          const i = g.order.indexOf(g.nextStarter);
          for (let k = 1; k <= g.order.length; k++) { const p = g.order[(i + k) % g.order.length]; if (g.count[p] > 0) { s = still.indexOf(p); break; } }
        }
        g.turn = s; g.bid = null; g.history = []; g.last = null; g.phase = 'bid';
        deal(g);
      }
    },

    view(g, pid) {
      const alive = g.order.filter((p) => g.count[p] > 0);
      return {
        phase: g.phase,
        cur: g.phase === 'bid' ? alive[g.turn % alive.length] : null,
        myHand: g.hands[pid] || [],
        counts: g.count, order: g.order,
        total: alive.reduce((s, p) => s + g.count[p], 0),
        bid: g.bid, history: g.history,
        last: g.phase === 'reveal' || g.phase === 'end' ? g.last : null,
        winner: g.winner || null, out: g.out,
      };
    },

    // Joueur virtuel : estime le nombre probable de cartes d'une couleur à partir de sa main.
    bot(v, mem, me) {
      if (v.phase !== 'bid' || v.cur !== me) return null;
      if (!think(mem, 'b' + JSON.stringify(v.bid) + v.total, 1300, 3000)) return null;
      const unknown = v.total - v.myHand.length;
      const exp = (c) => v.myHand.filter((k) => k === c || k === '*').length + unknown * (14 / 44);
      if (v.bid && v.bid.n > exp(v.bid.c) + rand(0.6, 1.5)) return { k: 'liar' };
      const best = KEYS.map((c) => ({ c, e: exp(c) })).sort((a, b) => b.e - a.e)[0];
      const minN = v.bid ? v.bid.n + 1 : 1;
      let n = Math.max(minN, Math.floor(best.e - rand(0.3, 1.5)));
      if (n > best.e + 0.6 || n > v.total) { if (v.bid) return { k: 'liar' }; n = minN; }
      return { k: 'bid', n, c: best.c };
    },

    render(el, v, ui) {
      const st = (el._st = el._st || { n: null, c: 'r' });
      const minN = v.bid ? v.bid.n + 1 : 1;
      if (st.n == null || st.n < minN) st.n = minN;
      if (st.n > v.total) st.n = v.total;
      let h = '';

      if (v.phase === 'bid') {
        const mine = v.cur === ui.me;
        h += `<div class="banner">${mine ? t('men.myTurn') : t('men.turn', { n: esc(ui.name(v.cur)) })} · ${t('men.inPlay', { n: v.total })}</div>`;
        h += `<div class="card center"><div class="muted">${t('men.current')}</div><div style="font-size:1.25rem;margin:4px 0">${v.bid ? `${esc(ui.name(v.bid.by))} : ${bidText(v.bid)}` : `<span class="muted">${t('men.first')}</span>`}</div></div>`;
        if (mine) {
          h += `<div class="card"><h3>${t('men.yourBid')}</h3>
            <div class="row" style="justify-content:center;margin:8px 0" dir="ltr">
              <button class="small" data-d="-1">−</button><span style="font-size:2rem;font-weight:800;min-width:56px;text-align:center">${st.n}</span><button class="small" data-d="1">+</button></div>
            <div class="choices" style="justify-content:center">${KEYS.map((k) => `<button class="chip ${st.c === k ? 'sel' : ''}" data-c="${k}"><span class="dot" style="background:${COLORS[k].c}"></span> ${cname(k)}</button>`).join('')}</div>
            <button class="primary block" id="bid" style="margin-top:12px" ${st.n < minN ? 'disabled' : ''}>${t('men.bidBtn', { n: st.n, c: cname(st.c, st.n) })}</button>
            ${v.bid ? `<button class="gold block" id="liar" style="margin-top:8px">${t('men.liar')}</button>` : ''}</div>`;
        }
      }

      if (v.last) {
        const L = v.last;
        h += `<div class="banner ${L.truth ? 'good' : 'bad'}">${t('men.called', { n: esc(ui.name(L.caller)), b: bidText(L.bid) })}<br>
          ${t('men.there', { r: L.real })}${L.truth ? t('men.true') : t('men.lie')} ${t('men.loses', { n: esc(ui.name(L.loser)) })}</div>`;
        h += `<div class="card"><h3>${t('men.all')}</h3><table class="plays">${Object.entries(L.hands).map(([p, hand]) => `<tr><td>${esc(ui.name(p))}</td><td>${hand.map((k) => cardHtml(k, true)).join('')}</td></tr>`).join('')}</table></div>`;
        if (v.phase === 'reveal') h += ui.isHost ? `<button class="primary block" id="next" style="margin-top:12px">${t('nextRound')}</button>` : waitHostP();
      }

      if (v.phase === 'end') h += winnerCard(ui.name(v.winner));

      if (v.phase === 'bid' && v.myHand.length) h += `<div class="card"><h3>${t('men.yours')}</h3><div class="cards">${v.myHand.map((k) => cardHtml(k)).join('')}</div></div>`;
      if (v.phase === 'bid' && v.history.length > 1) h += `<div class="card"><h3>${t('men.history')}</h3><table class="plays">${v.history.slice().reverse().map((b) => `<tr><td>${esc(ui.name(b.by))}</td><td>${bidText(b)}</td></tr>`).join('')}</table></div>`;

      h += `<div class="card"><h3>${t('men.left')}</h3><ul class="scores">${v.order.map((p) => `<li class="${p === ui.me ? 'me' : ''}"><span>${esc(ui.name(p))}${v.counts[p] === 0 ? ` <span class="muted">${t('eliminated')}</span>` : ''}</span><span class="pts">${'🂠'.repeat(v.counts[p]) || '—'}</span></li>`).join('')}</ul></div>`;
      el.innerHTML = h;

      el.querySelectorAll('[data-d]').forEach((b) => { b.onclick = () => { st.n = Math.max(minN, Math.min(v.total, st.n + +b.dataset.d)); this.render(el, v, ui); }; });
      el.querySelectorAll('[data-c]').forEach((b) => { b.onclick = () => { st.c = b.dataset.c; this.render(el, v, ui); }; });
      const bd = el.querySelector('#bid'); if (bd) bd.onclick = () => ui.send({ k: 'bid', n: st.n, c: st.c });
      const li = el.querySelector('#liar'); if (li) li.onclick = () => ui.send({ k: 'liar' });
      const nx = el.querySelector('#next'); if (nx) nx.onclick = () => ui.send({ k: 'next' });
    },
  });

  function deal(g) {
    const d = deck();
    g.hands = {};
    g.order.forEach((p) => { g.hands[p] = g.count[p] > 0 ? d.splice(0, g.count[p]) : []; });
  }
})();
