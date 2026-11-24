'use strict';
// NI TROP NI PEU : approche-toi de la limite sans la dépasser. La limite change à chaque main (dé 5–12),
// et on mise des jetons entre les tours de cartes. Le dernier joueur avec des jetons gagne.

(() => {
  const START = 30;
  const DECK = [[7, 1], [6, 2], [5, 3], [4, 4], [3, 5], [2, 6], [1, 7], [-1, 7]];
  const MAX_RAISE = 3;

  const newDeck = () => shuffle(DECK.flatMap(([v, n]) => Array(n).fill(v)));
  const sum = (a) => a.reduce((s, x) => s + x, 0);

  addStrings({
    fr: {
      'nt.banner': 'Main <b>{h}</b> · Limite <b style="color:var(--gold);font-size:1.15rem">{l}</b> · Pot <b>{p}</b> 🪙',
      'nt.hand': 'Ta main', 'nt.folded': '(couché)', 'nt.total': 'Total :', 'nt.over': 'dépassé !', 'nt.chips': 'Tes jetons :', 'nt.broke': 'Tu n’as plus de jetons : tu regardes la partie.',
      'nt.showHelp': 'Touche la carte que tu veux <b>montrer à tout le monde</b>.', 'nt.wait': 'En attente des autres…',
      'nt.you': '👉 <b>À toi</b>', 'nt.turn': 'Tour de <b>{n}</b>', 'nt.bet': 'Mise {r}/2', 'nt.cards': 'Cartes',
      'nt.call': 'Suivre (+{n})', 'nt.check': 'Parole (0)', 'nt.raise': 'Relancer +{n}', 'nt.fold': 'Se coucher', 'nt.hit': 'Carte !', 'nt.stay': 'Je reste',
      'nt.win': '🏅 <b>{n}</b> remporte {p} 🪙', 'nt.and': ' et ', 'nt.noWin': 'Personne ne gagne.', 'nt.next': 'Main suivante', 'nt.stop': 'Terminer',
      'nt.table': 'Table', 'nt.isFolded': 'couché', 'nt.bet2': 'misé {n}',
      'nt.r.fold': 'les autres se sont couchés', 'nt.r.cards': 'plus de cartes', 'nt.r.allOver': 'tout le monde a dépassé : le moins loin gagne',
      'nt.cFold': 'Se coucher et abandonner cette main ?', 'nt.cStop': 'Terminer la partie maintenant ? Le plus riche gagne.',
      'nt.e.raise': 'Relance trop haute.', 'nt.e.deck': 'Plus de cartes.',
    },
    en: {
      'nt.banner': 'Hand <b>{h}</b> · Limit <b style="color:var(--gold);font-size:1.15rem">{l}</b> · Pot <b>{p}</b> 🪙',
      'nt.hand': 'Your hand', 'nt.folded': '(folded)', 'nt.total': 'Total:', 'nt.over': 'over!', 'nt.chips': 'Your tokens:', 'nt.broke': 'You have no tokens left: you are watching.',
      'nt.showHelp': 'Tap the card you want to <b>show to everyone</b>.', 'nt.wait': 'Waiting for the others…',
      'nt.you': '👉 <b>Your turn</b>', 'nt.turn': '<b>{n}</b>’s turn', 'nt.bet': 'Bet {r}/2', 'nt.cards': 'Cards',
      'nt.call': 'Call (+{n})', 'nt.check': 'Check (0)', 'nt.raise': 'Raise +{n}', 'nt.fold': 'Fold', 'nt.hit': 'Card!', 'nt.stay': 'Stay',
      'nt.win': '🏅 <b>{n}</b> wins {p} 🪙', 'nt.and': ' and ', 'nt.noWin': 'Nobody wins.', 'nt.next': 'Next hand', 'nt.stop': 'End game',
      'nt.table': 'Table', 'nt.isFolded': 'folded', 'nt.bet2': 'bet {n}',
      'nt.r.fold': 'everyone else folded', 'nt.r.cards': 'more cards', 'nt.r.allOver': 'everyone went over: the closest wins',
      'nt.cFold': 'Fold and give up this hand?', 'nt.cStop': 'End the game now? The richest player wins.',
      'nt.e.raise': 'Raise too high.', 'nt.e.deck': 'No cards left.',
    },
    ar: {
      'nt.banner': 'اليد <b>{h}</b> · الحدّ <b style="color:var(--gold);font-size:1.15rem">{l}</b> · المجموع <b>{p}</b> 🪙',
      'nt.hand': 'يدك', 'nt.folded': '(انسحبت)', 'nt.total': 'المجموع:', 'nt.over': 'تجاوزت!', 'nt.chips': 'قطعك:', 'nt.broke': 'نفدت قطعك: أنت تشاهد اللعبة.',
      'nt.showHelp': 'المس البطاقة التي تريد <b>إظهارها للجميع</b>.', 'nt.wait': 'في انتظار الآخرين…',
      'nt.you': '👉 <b>دورك</b>', 'nt.turn': 'دور <b>{n}</b>', 'nt.bet': 'الرهان {r}/2', 'nt.cards': 'البطاقات',
      'nt.call': 'تابِع (+{n})', 'nt.check': 'مرّر (0)', 'nt.raise': 'زِد +{n}', 'nt.fold': 'انسحب', 'nt.hit': 'بطاقة!', 'nt.stay': 'أتوقف',
      'nt.win': '🏅 <b>{n}</b> يربح {p} 🪙', 'nt.and': ' و', 'nt.noWin': 'لا أحد يربح.', 'nt.next': 'اليد التالية', 'nt.stop': 'إنهاء',
      'nt.table': 'الطاولة', 'nt.isFolded': 'انسحب', 'nt.bet2': 'راهن بـ{n}',
      'nt.r.fold': 'الآخرون انسحبوا', 'nt.r.cards': 'بطاقات أكثر', 'nt.r.allOver': 'الجميع تجاوز: الأقرب يربح',
      'nt.cFold': 'الانسحاب والتخلي عن هذه اليد؟', 'nt.cStop': 'إنهاء اللعبة الآن؟ الأغنى يفوز.',
      'nt.e.raise': 'الزيادة كبيرة جدًا.', 'nt.e.deck': 'لم تبقَ بطاقات.',
    },
  });

  registerGame({
    id: 'nitrop',
    emoji: '🎯',
    min: 2,
    max: 7,

    init(players) {
      const chips = {};
      players.forEach((p) => { chips[p.pid] = START; });
      const g = { players, chips, order: shuffle(players.map((p) => p.pid)), handNo: 0, dealer: -1, out: [] };
      startHand(g);
      return g;
    },

    act(g, pid, a, ctx, isHost) {
      if (a.k === 'show' && g.phase === 'show' && g.inHand.includes(pid) && g.shown[pid] == null) {
        const i = +a.i;
        if (!(i >= 0 && i < 3)) return;
        g.shown[pid] = i;
        if (g.inHand.every((p) => g.shown[p] != null)) startBetting(g, 1);
        return;
      }
      if (g.phase === 'bet' && pid === g.bet.queue[0]) {
        const B = g.bet;
        const need = B.cur - B.contrib[pid];
        if (a.k === 'fold') {
          g.folded[pid] = true;
          B.queue.shift();
        } else if (a.k === 'call') {
          if (need > g.chips[pid]) return;
          g.chips[pid] -= need; B.contrib[pid] += need; g.pot += need;
          B.queue.shift();
        } else if (a.k === 'raise') {
          const n = Math.floor(+a.n);
          if (!(n >= 1 && n <= MAX_RAISE) || B.cur + n > betCap(g)) return 'nt.e.raise';
          const pay = need + n;
          if (pay > g.chips[pid]) return;
          g.chips[pid] -= pay; B.contrib[pid] += pay; g.pot += pay; B.cur += n;
          // tous les autres doivent reparler, en partant du joueur après le relanceur
          const ord = activeOrder(g, g.lead);
          const k = ord.indexOf(pid);
          B.queue = [...ord.slice(k + 1), ...ord.slice(0, k)];
        } else return;
        afterBetAction(g);
        return;
      }
      if (g.phase === 'draw' && pid === g.drawQueue[0]) {
        if (a.k === 'hit') {
          if (!g.deck.length) return 'nt.e.deck';
          g.hits[pid].push(g.deck.pop());
          g.drawQueue.push(g.drawQueue.shift());
        } else if (a.k === 'stay') {
          g.drawQueue.shift();
        } else return;
        if (!g.drawQueue.length || !g.deck.length) startBetting(g, 2);
        return;
      }
      if (a.k === 'next' && g.phase === 'result' && isHost) {
        const alive = g.order.filter((p) => g.chips[p] > 0);
        if (alive.length <= 1) { g.phase = 'end'; return; }
        startHand(g);
        return;
      }
      if (a.k === 'stop' && isHost && g.phase === 'result') { g.phase = 'end'; }
    },

    view(g, pid) {
      const total = (p) => sum(g.cards[p] || []) + sum(g.hits[p] || []);
      const showAll = g.phase === 'result' || g.phase === 'end';
      const pub = {};
      g.order.forEach((p) => {
        if (!g.inHand.includes(p)) return;
        const own = p === pid || (showAll && g.last && g.last.revealed.includes(p));
        pub[p] = {
          cards: (g.cards[p] || []).map((c, i) => (own || g.shown[p] === i ? c : null)),
          shownIdx: g.shown[p],
          hits: g.hits[p] || [],
          folded: !!g.folded[p],
          contrib: g.bet ? g.bet.contrib[p] || 0 : 0,
          total: own ? total(p) : null,
        };
      });
      return {
        phase: g.phase, handNo: g.handNo, limit: g.limit, ante: g.ante, pot: g.pot,
        chips: g.chips, order: g.order, inHand: g.inHand, pub,
        betRound: g.bet ? g.bet.round : null, cur: g.bet ? g.bet.cur : 0, cap: g.bet ? betCap(g) : 0,
        toAct: g.phase === 'bet' ? g.bet.queue[0] : g.phase === 'draw' ? g.drawQueue[0] : null,
        myShown: g.shown[pid], myIn: g.inHand.includes(pid), deckLeft: g.deck.length,
        last: showAll ? g.last : null, out: g.out,
      };
    },

    render(el, v, ui) {
      const st = (el._st = el._st || { raise: 1 });
      const me = ui.me, mine = v.pub[me];
      let h = `<div class="banner">${t('nt.banner', { h: v.handNo, l: v.limit, p: v.pot })}</div>`;

      if (mine && v.phase !== 'end') {
        h += `<div class="card"><h3>${t('nt.hand')} ${mine.folded ? `<span class="muted">${t('nt.folded')}</span>` : ''}</h3>
          <div class="cards" dir="ltr">${mine.cards.map((c, i) => `<button class="ncard ${mine.shownIdx === i ? 'sel' : ''}" ${v.phase === 'show' && v.myShown == null ? `data-show="${i}"` : 'disabled style="opacity:1"'}>${c}</button>`).join('')}
          ${mine.hits.map((c) => `<button class="ncard" disabled style="opacity:1;background:#e7dcff">${c}</button>`).join('')}</div>
          <p class="center">${t('nt.total')} <b style="font-size:1.3rem;color:${mine.total > v.limit ? 'var(--red)' : 'var(--gold)'}">${mine.total}</b> / ${v.limit}${mine.total > v.limit ? ` — <b style="color:var(--red)">${t('nt.over')}</b>` : ''}</p>
          <p class="muted center">${t('nt.chips')} <b style="color:var(--text)">${v.chips[me]}</b></p></div>`;
      } else if (v.phase !== 'end' && !v.myIn) {
        h += `<div class="card"><p class="muted">${t('nt.broke')}</p></div>`;
      }

      if (v.phase === 'show') {
        h += v.myShown == null && v.myIn
          ? `<div class="banner gold">${t('nt.showHelp')}</div>`
          : `<p class="muted center">${t('nt.wait')}</p>`;
      }

      if (v.phase === 'bet' || v.phase === 'draw') {
        const turnName = v.toAct === me ? t('nt.you') : t('nt.turn', { n: esc(ui.name(v.toAct)) });
        h += `<div class="banner">${v.phase === 'bet' ? t('nt.bet', { r: v.betRound }) : t('nt.cards')} · ${turnName}</div>`;
        if (v.toAct === me && v.phase === 'bet') {
          const need = v.cur - mine.contrib;
          const maxR = Math.min(MAX_RAISE, v.cap - v.cur, v.chips[me] - need);
          if (st.raise > maxR) st.raise = Math.max(1, maxR);
          h += `<div class="card stack">
            <button class="primary block" id="call">${need > 0 ? t('nt.call', { n: need }) : t('nt.check')}</button>
            ${maxR >= 1 ? `<div class="row" dir="ltr"><button class="small" data-r="-1">−</button><button class="gold grow" id="raise">${t('nt.raise', { n: st.raise })}</button><button class="small" data-r="1">+</button></div>` : ''}
            <button class="ghost block" id="fold">${t('nt.fold')}</button></div>`;
        }
        if (v.toAct === me && v.phase === 'draw') {
          h += `<div class="card row"><button class="primary grow" id="hit">${t('nt.hit')}</button><button class="gold grow" id="stay">${t('nt.stay')}</button></div>`;
        }
      }

      if (v.last && (v.phase === 'result' || v.phase === 'end')) {
        const L = v.last;
        h += L.winners.length
          ? `<div class="banner good">${t('nt.win', { n: L.winners.map((p) => esc(ui.name(p))).join(t('nt.and')), p: L.pot })}${L.reason ? ` (${t('nt.r.' + L.reason)})` : ''}.</div>`
          : `<div class="banner bad">${t('nt.noWin')}</div>`;
        if (v.phase === 'result') h += ui.isHost ? `<div class="row" style="margin-bottom:12px"><button class="primary grow" id="next">${t('nt.next')}</button><button class="small ghost" id="stop">${t('nt.stop')}</button></div>` : waitHostP();
      }

      if (v.phase === 'end') {
        const rows = ranking(v.chips, v.order.map((p) => ({ pid: p, name: ui.name(p) })));
        h += winnerCard(rows[0].name);
      }

      // Table : ce que montre chaque joueur
      h += `<div class="card"><h3>${t('nt.table')}</h3><table class="plays">${v.order.map((p) => {
        const P = v.pub[p];
        if (!P) return `<tr><td>${esc(ui.name(p))}</td><td class="muted">${t('eliminated')}</td></tr>`;
        const cards = P.cards.map((c) => `<span class="ncard mini" style="display:inline-grid;${c == null ? 'background:#3a2b4d;color:#3a2b4d' : ''}">${c == null ? '?' : c}</span>`).join('')
          + P.hits.map((c) => `<span class="ncard mini" style="display:inline-grid;background:#e7dcff">${c}</span>`).join('');
        return `<tr><td>${esc(ui.name(p))}${p === me ? ' ' + t('you') : ''}<br><span class="muted">${v.chips[p]} 🪙${P.folded ? ' · ' + t('nt.isFolded') : ''}${P.contrib ? ' · ' + t('nt.bet2', { n: P.contrib }) : ''}</span></td><td dir="ltr">${cards}${P.total != null && p !== me ? ` <b>= ${P.total}</b>` : ''}</td></tr>`;
      }).join('')}</table></div>`;

      el.innerHTML = h;
      el.querySelectorAll('[data-show]').forEach((b) => { b.onclick = () => ui.send({ k: 'show', i: +b.dataset.show }); });
      el.querySelectorAll('[data-r]').forEach((b) => { b.onclick = () => { st.raise = Math.max(1, Math.min(MAX_RAISE, st.raise + +b.dataset.r)); this.render(el, v, ui); }; });
      const on = (id, fn) => { const b = el.querySelector('#' + id); if (b) b.onclick = fn; };
      on('call', () => ui.send({ k: 'call' }));
      on('raise', () => ui.send({ k: 'raise', n: st.raise }));
      on('fold', () => { if (confirm(t('nt.cFold'))) ui.send({ k: 'fold' }); });
      on('hit', () => ui.send({ k: 'hit' }));
      on('stay', () => ui.send({ k: 'stay' }));
      on('next', () => ui.send({ k: 'next' }));
      on('stop', () => { if (confirm(t('nt.cStop'))) ui.send({ k: 'stop' }); });
    },
  });

  // ---------- logique de la main ----------
  function startHand(g) {
    g.handNo += 1;
    const alive = g.order.filter((p) => g.chips[p] > 0);
    g.dealer = (g.dealer + 1) % g.order.length;
    while (g.chips[g.order[g.dealer]] <= 0) g.dealer = (g.dealer + 1) % g.order.length;
    g.lead = g.order[g.dealer];
    g.ante = 1 + Math.floor((g.handNo - 1) / 10);
    g.pot = 0;
    alive.forEach((p) => { const a = Math.min(g.ante, g.chips[p]); g.chips[p] -= a; g.pot += a; });
    g.limit = 5 + Math.floor(Math.random() * 8);
    g.deck = newDeck();
    g.inHand = alive;
    g.cards = {}; g.hits = {}; g.shown = {}; g.folded = {};
    alive.forEach((p) => { g.cards[p] = [g.deck.pop(), g.deck.pop(), g.deck.pop()]; g.hits[p] = []; });
    g.bet = null; g.last = null;
    g.phase = 'show';
  }

  function activeOrder(g, from) {
    const i = g.order.indexOf(from);
    const ord = [...g.order.slice(i), ...g.order.slice(0, i)];
    return ord.filter((p) => g.inHand.includes(p) && !g.folded[p]);
  }

  function betCap(g) {
    const live = activeOrder(g, g.lead);
    return Math.min(...live.map((p) => g.chips[p] + (g.bet ? g.bet.contrib[p] : 0)));
  }

  function startBetting(g, round) {
    const live = activeOrder(g, g.lead);
    const contrib = {};
    live.forEach((p) => { contrib[p] = 0; });
    g.bet = { round, cur: 0, contrib, queue: live.slice() };
    g.phase = 'bet';
    afterBetAction(g);
  }

  function afterBetAction(g) {
    const live = activeOrder(g, g.lead);
    if (live.length <= 1) return showdown(g);
    g.bet.queue = g.bet.queue.filter((p) => live.includes(p));
    if (g.bet.queue.length) return;
    if (g.bet.round === 1) {
      g.phase = 'draw';
      g.drawQueue = live.slice();
      if (!g.deck.length) startBetting(g, 2);
    } else showdown(g);
  }

  function showdown(g) {
    const live = activeOrder(g, g.lead);
    const total = (p) => sum(g.cards[p]) + sum(g.hits[p]);
    const ncards = (p) => g.cards[p].length + g.hits[p].length;
    let winners = [], reason = '';
    if (live.length === 1) { winners = live; reason = 'fold'; }
    else {
      const ok = live.filter((p) => total(p) <= g.limit);
      const pool = ok.length ? ok : live;
      const dist = (p) => Math.abs(g.limit - total(p));
      const best = Math.min(...pool.map(dist));
      winners = pool.filter((p) => dist(p) === best);
      if (winners.length > 1) {
        const most = Math.max(...winners.map(ncards));
        const w2 = winners.filter((p) => ncards(p) === most);
        if (w2.length < winners.length) reason = 'cards';
        winners = w2;
      }
      if (!ok.length) reason = 'allOver';
    }
    const share = Math.floor(g.pot / winners.length);
    let rest = g.pot - share * winners.length;
    winners.forEach((p) => { g.chips[p] += share + (rest-- > 0 ? 1 : 0); });
    g.last = { winners, pot: g.pot, reason, revealed: live };
    g.pot = 0;
    g.order.forEach((p) => { if (g.chips[p] <= 0 && !g.out.includes(p)) g.out.unshift(p); });
    g.phase = 'result';
  }
})();
