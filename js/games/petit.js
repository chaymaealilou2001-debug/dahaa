'use strict';
// LE PLUS PETIT SEUL : montre 2 cartes, retires-en une. Le plus petit nombre que personne d'autre n'a joué gagne.

(() => {
  const HAND = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const ROUNDS = 7;

  addStrings({
    fr: {
      'petit.show': 'Tu montres :', 'petit.pick2': 'Choisis 2 cartes', 'petit.pick2Help': 'Tout le monde verra tes 2 cartes, puis tu en retireras une.', 'petit.showBtn': 'Montrer ces 2 cartes',
      'petit.dropped': 'Tu retires le <b>{a}</b> et tu joues le <b>{b}</b>.', 'petit.dropTitle': 'Quelle carte retires-tu ?', 'petit.dropHelp': 'L’autre sera jouée.',
      'petit.shown': 'Cartes montrées', 'petit.win': '🏅 <b>{n}</b> gagne avec le <b>{v}</b> : +{v} pt(s).', 'petit.none': 'Tous les nombres sont en double : personne ne marque.',
      'petit.played': 'Cartes jouées', 'petit.hand': 'Ta main',
    },
    en: {
      'petit.show': 'You show:', 'petit.pick2': 'Choose 2 cards', 'petit.pick2Help': 'Everyone will see your 2 cards, then you take one back.', 'petit.showBtn': 'Show these 2 cards',
      'petit.dropped': 'You take back the <b>{a}</b> and play the <b>{b}</b>.', 'petit.dropTitle': 'Which card do you take back?', 'petit.dropHelp': 'The other one will be played.',
      'petit.shown': 'Cards shown', 'petit.win': '🏅 <b>{n}</b> wins with the <b>{v}</b>: +{v} pt(s).', 'petit.none': 'Every number was doubled: nobody scores.',
      'petit.played': 'Cards played', 'petit.hand': 'Your hand',
    },
    ar: {
      'petit.show': 'أنت تعرض:', 'petit.pick2': 'اختر بطاقتين', 'petit.pick2Help': 'سيرى الجميع بطاقتيك، ثم تسحب واحدة منهما.', 'petit.showBtn': 'اعرض هاتين البطاقتين',
      'petit.dropped': 'تسحب <b>{a}</b> وتلعب <b>{b}</b>.', 'petit.dropTitle': 'أي بطاقة تسحب؟', 'petit.dropHelp': 'الأخرى ستُلعب.',
      'petit.shown': 'البطاقات المعروضة', 'petit.win': '🏅 <b>{n}</b> يفوز بالرقم <b>{v}</b>: ‎+{v} نقطة.', 'petit.none': 'كل الأرقام تكررت: لا أحد يربح نقاطًا.',
      'petit.played': 'البطاقات الملعوبة', 'petit.hand': 'يدك',
    },
  });

  registerGame({
    id: 'petit',
    emoji: '🃏',
    min: 3,
    max: 10,

    init(players) {
      const hands = {}, scores = {};
      players.forEach((p) => { hands[p.pid] = HAND.slice(); scores[p.pid] = 0; });
      return { players, hands, scores, round: 1, phase: 'pick2', picks: {}, drops: {}, last: null };
    },

    act(g, pid, a, ctx, isHost) {
      const ids = g.players.map((p) => p.pid);
      const resolve = () => {
        const played = {};
        ids.forEach((p) => { const [x, y] = g.picks[p]; played[p] = g.drops[p] === x ? y : x; });
        const count = {};
        Object.values(played).forEach((n) => { count[n] = (count[n] || 0) + 1; });
        const uniques = Object.keys(count).map(Number).filter((n) => count[n] === 1).sort((x, y) => x - y);
        let winner = null;
        if (uniques.length) { winner = ids.find((p) => played[p] === uniques[0]); g.scores[winner] += uniques[0]; }
        ids.forEach((p) => { g.hands[p] = g.hands[p].filter((n) => n !== played[p]); });
        g.last = { played, pairs: { ...g.picks }, winner, value: winner ? played[winner] : null };
        g.phase = 'result';
      };
      const randomFill = () => {
        ids.forEach((p) => {
          if (g.phase === 'pick2' && !g.picks[p]) g.picks[p] = shuffle(g.hands[p]).slice(0, 2).sort((x, y) => x - y);
          if (g.phase === 'drop' && g.drops[p] == null) g.drops[p] = pick(g.picks[p]);
        });
      };

      if (a.k === 'pick2' && g.phase === 'pick2') {
        const x = +a.a, y = +a.b;
        if (x === y || !g.hands[pid].includes(x) || !g.hands[pid].includes(y) || g.picks[pid]) return;
        g.picks[pid] = [x, y].sort((m, n) => m - n);
        if (ids.every((p) => g.picks[p])) g.phase = 'drop';
        return;
      }
      if (a.k === 'drop' && g.phase === 'drop') {
        const n = +a.n;
        if (!g.picks[pid] || !g.picks[pid].includes(n) || g.drops[pid] != null) return;
        g.drops[pid] = n;
        if (ids.every((p) => g.drops[p] != null)) resolve();
        return;
      }
      if (a.k === 'force' && isHost && (g.phase === 'pick2' || g.phase === 'drop')) {
        const wasPick = g.phase === 'pick2';
        randomFill();
        if (wasPick) g.phase = 'drop'; else resolve();
        return;
      }
      if (a.k === 'next' && isHost && g.phase === 'result') {
        if (g.round >= ROUNDS) { g.phase = 'end'; return; }
        g.round += 1; g.picks = {}; g.drops = {}; g.phase = 'pick2';
      }
    },

    view(g, pid) {
      const ids = g.players.map((p) => p.pid);
      return {
        phase: g.phase, round: g.round, rounds: ROUNDS,
        hand: g.hands[pid], myPair: g.picks[pid] || null, myDrop: g.drops[pid] != null ? g.drops[pid] : null,
        pairs: g.phase === 'drop' ? g.picks : null,
        done: g.phase === 'pick2' ? ids.filter((p) => g.picks[p]).length : ids.filter((p) => g.drops[p] != null).length,
        total: ids.length,
        last: g.phase === 'result' || g.phase === 'end' ? g.last : null,
        scores: g.scores, players: g.players,
      };
    },

    // Joueur virtuel : montre plutôt des petites cartes, puis joue celle que les autres montrent le moins.
    bot(v, mem, me) {
      if (v.phase === 'pick2' && !v.myPair) {
        if (!think(mem, 'p' + v.round)) return null;
        const h = v.hand.slice().sort((x, y) => x - y);
        const a = pick(h.slice(0, Math.max(2, Math.ceil(h.length * 0.6))));
        const b = pick(h.filter((n) => n !== a));
        return { k: 'pick2', a, b };
      }
      if (v.phase === 'drop' && v.myDrop == null) {
        if (!think(mem, 'd' + v.round, 1300, 2800)) return null;
        const cnt = {};
        Object.entries(v.pairs).forEach(([p, pr]) => { if (p !== me) pr.forEach((n) => { cnt[n] = (cnt[n] || 0) + 1; }); });
        const [x, y] = v.myPair;
        const cx = cnt[x] || 0, cy = cnt[y] || 0;
        const play = cx < cy ? x : cy < cx ? y : (chance(0.6) ? x : y);
        return { k: 'drop', n: play === x ? y : x };
      }
      return null;
    },

    render(el, v, ui) {
      const rows = ranking(v.scores, v.players);
      const sel = (el._sel = el._sel && el._phaseKey === v.phase + v.round ? el._sel : []);
      el._phaseKey = v.phase + v.round;
      const card = (n, cls = '', attrs = '') => `<button class="ncard ${cls}" ${attrs}>${n}</button>`;
      let h = `<div class="banner">${t('round', { a: `<b>${v.round}</b>`, b: v.rounds })}</div>`;

      if (v.phase === 'pick2') {
        if (v.myPair) h += `<div class="card center"><p>${t('petit.show')}</p><div class="cards">${v.myPair.map((n) => card(n, 'sel', 'disabled style="opacity:1"')).join('')}</div><p class="muted">${t('waitOthers', { a: v.done, b: v.total })}</p></div>`;
        else h += `<div class="card center"><h2>${t('petit.pick2')}</h2><p class="muted">${t('petit.pick2Help')}</p>
          <div class="cards">${v.hand.map((n) => card(n, sel.includes(n) ? 'sel' : '', `data-n="${n}"`)).join('')}</div>
          <button class="primary block" id="ok" ${sel.length === 2 ? '' : 'disabled'}>${t('petit.showBtn')}</button></div>`;
      }

      if (v.phase === 'drop') {
        if (v.myDrop != null) h += `<div class="card center"><p>${t('petit.dropped', { a: v.myDrop, b: v.myPair.find((n) => n !== v.myDrop) })}</p><p class="muted">${t('waitOthers', { a: v.done, b: v.total })}</p></div>`;
        else h += `<div class="card center"><h2>${t('petit.dropTitle')}</h2><p class="muted">${t('petit.dropHelp')}</p>
          <div class="cards">${v.myPair.map((n) => card(n, '', `data-drop="${n}"`)).join('')}</div></div>`;
        h += `<div class="card"><h3>${t('petit.shown')}</h3><table class="plays">${Object.entries(v.pairs).map(([p, pr]) => `<tr><td>${esc(ui.name(p))}${p === ui.me ? ' ' + t('you') : ''}</td><td>${pr.map((n) => card(n, 'mini', 'disabled style="opacity:1"')).join(' ')}</td></tr>`).join('')}</table></div>`;
      }

      if ((v.phase === 'pick2' || v.phase === 'drop') && ui.isHost && v.done < v.total) {
        h += `<button class="small ghost block" id="force" style="margin-top:8px">${t('forceRandom')}</button>`;
      }

      if (v.last && (v.phase === 'result' || v.phase === 'end')) {
        const L = v.last;
        const counts = {};
        Object.values(L.played).forEach((n) => { counts[n] = (counts[n] || 0) + 1; });
        h += L.winner
          ? `<div class="banner good">${t('petit.win', { n: esc(ui.name(L.winner)), v: L.value })}</div>`
          : `<div class="banner bad">${t('petit.none')}</div>`;
        h += `<div class="card"><h3>${t('petit.played')}</h3><table class="plays">${Object.entries(L.played).sort((a, b) => a[1] - b[1]).map(([p, n]) => `<tr><td>${esc(ui.name(p))}</td><td>${card(n, 'mini ' + (p === L.winner ? 'win' : counts[n] > 1 ? 'dup' : ''), 'disabled style="opacity:1"')}</td></tr>`).join('')}</table></div>`;
        if (v.phase === 'result') h += ui.isHost ? `<button class="primary block" id="next" style="margin-top:12px">${v.round >= v.rounds ? t('finalResult') : t('nextRound')}</button>` : waitHostP();
      }

      if (v.phase === 'end') h += winnerCard(rows[0].name);
      if (v.phase !== 'pick2' && v.phase !== 'drop') h += `<div class="card"><h3>${t('petit.hand')}</h3><div class="cards">${v.hand.map((n) => card(n, 'mini', 'disabled style="opacity:1"')).join('')}</div></div>`;
      h += `<div class="card"><h3>${t('scores')}</h3>${scoreList(rows, ui.me)}</div>`;
      el.innerHTML = h;

      el.querySelectorAll('[data-n]').forEach((b) => {
        b.onclick = () => {
          const n = +b.dataset.n;
          const i = sel.indexOf(n);
          if (i >= 0) sel.splice(i, 1); else { if (sel.length >= 2) sel.shift(); sel.push(n); }
          this.render(el, v, ui);
        };
      });
      const ok = el.querySelector('#ok'); if (ok) ok.onclick = () => ui.send({ k: 'pick2', a: sel[0], b: sel[1] });
      el.querySelectorAll('[data-drop]').forEach((b) => { b.onclick = () => ui.send({ k: 'drop', n: +b.dataset.drop }); });
      const fo = el.querySelector('#force'); if (fo) fo.onclick = () => ui.send({ k: 'force' });
      const nx = el.querySelector('#next'); if (nx) nx.onclick = () => ui.send({ k: 'next' });
    },
  });
})();
