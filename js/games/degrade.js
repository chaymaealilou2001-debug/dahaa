'use strict';
// DÉGRADÉ : duels 1 contre 1. Range 7 chiffres en ordre croissant dans 7 boîtes colorées
// (noir aux bords, blanc au milieu). L'adversaire ne voit que la couleur de la boîte que tu joues.

(() => {
  const BINS = 7, MAX_SUM = 30;
  const TONE = ['noir', 'argent', 'gris', 'blanc', 'gris', 'argent', 'noir'];
  const CSS = { noir: '#0d0b10', argent: '#c4cad4', gris: '#7d828c', blanc: '#ffffff' };
  const INK = { noir: '#fff', argent: '#111', gris: '#fff', blanc: '#111' };
  const box = (i, content, cls = '', attrs = '') => `<button class="bin ${cls}" style="background:${CSS[TONE[i]]};color:${INK[TONE[i]]}" ${attrs}>${content}</button>`;

  addStrings({
    fr: {
      'dg.banner': 'Duel <b>{d}</b> : <b>{a}</b> contre <b>{b}</b>', 'dg.streak': ' · {n} a {s} victoire(s) d’affilée',
      'dg.setTitle': 'Range tes chiffres', 'dg.setHelp': 'Touche une boîte, puis un chiffre. Ordre croissant, total ≤ {m}.', 'dg.total': 'Total :',
      'dg.ready': 'Tes boîtes sont prêtes.', 'dg.setting': 'Les duellistes rangent leurs chiffres…', 'dg.yourBoxes': 'Tes boîtes',
      'dg.roundTurn': 'Manche {r}/{t} · ', 'dg.yourTurn': '👉 <b>À toi de poser une boîte</b>', 'dg.choosing': '<b>{n}</b> choisit une boîte…',
      'dg.placed': '{n} a posé une boîte <b>{c}</b>', 'dg.rounds': 'Manches', 'dg.tie': 'égalité', 'dg.vs': 'contre',
      'dg.tieDuel': 'Égalité ! Les deux joueurs rejouent un duel.', 'dg.winDuel': '🏅 <b>{n}</b> gagne le duel {s}.', 'dg.next': 'Duel suivant',
      'dg.champ': 'Vainqueur (2 duels d’affilée)', 'dg.wins': 'Duels gagnés', 'dg.queue': 'File d’attente : {q}',
      'dg.t.noir': 'noire', 'dg.t.argent': 'argentée', 'dg.t.gris': 'grise', 'dg.t.blanc': 'blanche',
      'dg.e.fill': 'Remplis les 7 boîtes.', 'dg.e.order': 'Les chiffres doivent aller en croissant de gauche à droite.', 'dg.e.twice': 'Le {x} ne peut être utilisé que 2 fois.', 'dg.e.sum': 'Le total doit être de {m} maximum.',
    },
    en: {
      'dg.banner': 'Duel <b>{d}</b>: <b>{a}</b> vs <b>{b}</b>', 'dg.streak': ' · {n} has {s} win(s) in a row',
      'dg.setTitle': 'Place your digits', 'dg.setHelp': 'Tap a box, then a digit. Increasing order, total ≤ {m}.', 'dg.total': 'Total:',
      'dg.ready': 'Your boxes are ready.', 'dg.setting': 'The duellists are placing their digits…', 'dg.yourBoxes': 'Your boxes',
      'dg.roundTurn': 'Round {r}/{t} · ', 'dg.yourTurn': '👉 <b>Your turn to play a box</b>', 'dg.choosing': '<b>{n}</b> is choosing a box…',
      'dg.placed': '{n} played a <b>{c}</b> box', 'dg.rounds': 'Rounds', 'dg.tie': 'tie', 'dg.vs': 'vs',
      'dg.tieDuel': 'Tie! Both players replay the duel.', 'dg.winDuel': '🏅 <b>{n}</b> wins the duel {s}.', 'dg.next': 'Next duel',
      'dg.champ': 'Winner (2 duels in a row)', 'dg.wins': 'Duels won', 'dg.queue': 'Waiting: {q}',
      'dg.t.noir': 'black', 'dg.t.argent': 'silver', 'dg.t.gris': 'grey', 'dg.t.blanc': 'white',
      'dg.e.fill': 'Fill all 7 boxes.', 'dg.e.order': 'Digits must increase from left to right.', 'dg.e.twice': 'The {x} can only be used twice.', 'dg.e.sum': 'The total must be {m} at most.',
    },
    ar: {
      'dg.banner': 'المبارزة <b>{d}</b>: <b>{a}</b> ضد <b>{b}</b>', 'dg.streak': ' · {n} فاز {s} مرة متتالية',
      'dg.setTitle': 'رتّب أرقامك', 'dg.setHelp': 'المس علبة ثم رقمًا. ترتيب تصاعدي من اليسار إلى اليمين، والمجموع ≤ {m}.', 'dg.total': 'المجموع:',
      'dg.ready': 'علبك جاهزة.', 'dg.setting': 'المتبارزان يرتّبان أرقامهما…', 'dg.yourBoxes': 'علبك',
      'dg.roundTurn': 'الجولة {r}/{t} · ', 'dg.yourTurn': '👉 <b>دورك لتضع علبة</b>', 'dg.choosing': '<b>{n}</b> يختار علبة…',
      'dg.placed': '{n} وضع علبة <b>{c}</b>', 'dg.rounds': 'الجولات', 'dg.tie': 'تعادل', 'dg.vs': 'ضد',
      'dg.tieDuel': 'تعادل! يعيد اللاعبان المبارزة.', 'dg.winDuel': '🏅 <b>{n}</b> يفوز بالمبارزة {s}.', 'dg.next': 'المبارزة التالية',
      'dg.champ': 'الفائز (مبارزتان متتاليتان)', 'dg.wins': 'المبارزات المربوحة', 'dg.queue': 'في الانتظار: {q}',
      'dg.t.noir': 'سوداء', 'dg.t.argent': 'فضية', 'dg.t.gris': 'رمادية', 'dg.t.blanc': 'بيضاء',
      'dg.e.fill': 'املأ العلب السبع.', 'dg.e.order': 'يجب أن تكون الأرقام تصاعدية من اليسار إلى اليمين.', 'dg.e.twice': 'الرقم {x} يُستعمل مرتين فقط.', 'dg.e.sum': 'يجب ألا يتجاوز المجموع {m}.',
    },
  });

  function validate(vals) {
    if (!Array.isArray(vals) || vals.length !== BINS) return { key: 'dg.e.fill' };
    if (vals.some((x) => !Number.isInteger(x) || x < 0 || x > 9)) return { key: 'dg.e.fill' };
    for (let i = 1; i < BINS; i++) if (vals[i] < vals[i - 1]) return { key: 'dg.e.order' };
    const c = {};
    for (const x of vals) { c[x] = (c[x] || 0) + 1; if (c[x] > 2) return { key: 'dg.e.twice', p: { x } }; }
    if (vals.reduce((s, x) => s + x, 0) > MAX_SUM) return { key: 'dg.e.sum', p: { m: MAX_SUM } };
    return null;
  }

  registerGame({
    id: 'degrade',
    emoji: '🌗',
    min: 2,
    max: 6,

    init(players) {
      const q = shuffle(players.map((p) => p.pid));
      const g = { players, a: q[0], b: q[1], waiting: q.slice(2), champ: null, streak: 0, duelNo: 1, wins: {}, firstLead: pick([q[0], q[1]]) };
      players.forEach((p) => { g.wins[p.pid] = 0; });
      newDuel(g);
      return g;
    },

    act(g, pid, a, ctx, isHost) {
      const duelists = [g.a, g.b];
      if (a.k === 'setup' && g.phase === 'setup' && duelists.includes(pid) && !g.setups[pid]) {
        const vals = (a.vals || []).map((x) => (x == null ? NaN : Number(x)));
        const err = validate(vals);
        if (err) return err;
        g.setups[pid] = vals;
        if (g.setups[g.a] && g.setups[g.b]) g.phase = 'play';
        return;
      }
      if (a.k === 'play' && g.phase === 'play' && duelists.includes(pid)) {
        const D = g.duel;
        const myTurn = D.sub[D.lead] == null ? pid === D.lead : pid !== D.lead && D.sub[pid] == null;
        if (!myTurn) return;
        const i = +a.i;
        if (!(i >= 0 && i < BINS) || D.used[pid].includes(i)) return;
        D.sub[pid] = i;
        if (D.sub[g.a] != null && D.sub[g.b] != null) {
          const ia = D.sub[g.a], ib = D.sub[g.b];
          const va = g.setups[g.a][ia], vb = g.setups[g.b][ib];
          const win = va > vb ? g.a : vb > va ? g.b : null;
          if (win) { D.pts[win] += 1; D.lead = win; }
          D.log.push({ r: D.round, ia, ib, va, vb, win });
          D.used[g.a].push(ia); D.used[g.b].push(ib);
          D.sub = {};
          D.round += 1;
          if (D.round > BINS) endDuel(g);
        }
        return;
      }
      if (a.k === 'next' && g.phase === 'duelEnd' && isHost) {
        const R = g.result;
        if (!R.tie) {
          g.waiting.push(R.loser);
          g.a = R.winner; g.b = g.waiting.shift();
          g.firstLead = R.winner;
        }
        g.duelNo += 1;
        newDuel(g);
      }
    },

    view(g, pid) {
      const D = g.duel;
      const isDuelist = pid === g.a || pid === g.b;
      const opp = pid === g.a ? g.b : pid === g.b ? g.a : null;
      const reveal = g.phase === 'duelEnd' || g.phase === 'end';
      return {
        phase: g.phase, duelNo: g.duelNo, a: g.a, b: g.b, isDuelist, opp,
        champ: g.champ, streak: g.streak, waiting: g.waiting, wins: g.wins,
        mySetup: isDuelist ? g.setups[pid] || null : null,
        setupDone: { [g.a]: !!g.setups[g.a], [g.b]: !!g.setups[g.b] },
        round: D ? Math.min(D.round, BINS) : 0, pts: D ? D.pts : {}, lead: D ? D.lead : null,
        used: D ? D.used : {},
        // Seul le joueur voit l'emplacement exact de sa boîte posée ; les autres ne voient que sa couleur.
        pending: D && D.sub[pid] != null ? { [pid]: D.sub[pid] } : {},
        pendTone: D ? Object.fromEntries(Object.entries(D.sub).map(([p, i]) => [p, TONE[i]])) : {},
        log: D ? D.log : [],
        setups: reveal ? { [g.a]: g.setups[g.a], [g.b]: g.setups[g.b] } : null,
        result: g.result || null, winner: g.winner || null,
      };
    },

    // Joueur virtuel : range des chiffres au hasard (en respectant les règles) et joue ses boîtes.
    bot(v, mem, me) {
      if (v.phase === 'setup' && v.isDuelist && !v.mySetup) {
        if (!think(mem, 's' + v.duelNo, 1500, 3200)) return null;
        for (let k = 0; k < 500; k++) {
          const vals = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, BINS).sort((x, y) => x - y);
          if (vals.reduce((s, x) => s + x, 0) <= MAX_SUM) return { k: 'setup', vals };
        }
        return { k: 'setup', vals: [0, 1, 2, 3, 4, 5, 6] };
      }
      if (v.phase === 'play' && v.isDuelist) {
        const leadPlayed = v.pendTone[v.lead] != null;
        const myTurn = leadPlayed ? me !== v.lead && v.pending[me] == null : me === v.lead;
        if (!myTurn || !think(mem, `p${v.duelNo}-${v.round}-${leadPlayed}`, 1000, 2300)) return null;
        const free = [0, 1, 2, 3, 4, 5, 6].filter((i) => !v.used[me].includes(i));
        return { k: 'play', i: pick(free) };
      }
      return null;
    },

    render(el, v, ui) {
      if (!el._st || el._st.duel !== v.duelNo) el._st = { duel: v.duelNo, vals: Array(BINS).fill(null), sel: 0 };
      const st = el._st;
      const nm = (p) => esc(ui.name(p));
      const me = ui.me;
      let h = `<div class="banner">${t('dg.banner', { d: v.duelNo, a: nm(v.a), b: nm(v.b) })}${v.champ ? t('dg.streak', { n: nm(v.champ), s: v.streak }) : ''}</div>`;

      if (v.phase === 'setup') {
        if (v.isDuelist && !v.mySetup) {
          const used = {};
          st.vals.forEach((x) => { if (x != null) used[x] = (used[x] || 0) + 1; });
          const total = st.vals.reduce((s, x) => s + (x || 0), 0);
          h += `<div class="card"><h3>${t('dg.setTitle')}</h3><p class="muted">${t('dg.setHelp', { m: MAX_SUM })}</p>
            <div class="bins">${st.vals.map((x, i) => box(i, x == null ? '' : x, st.sel === i ? 'sel' : '', `data-slot="${i}"`)).join('')}</div>
            <div class="keypad">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => `<button data-digit="${d}" ${(used[d] || 0) >= 2 ? 'disabled' : ''}>${d}<small>${2 - (used[d] || 0)}</small></button>`).join('')}</div>
            <p class="center">${t('dg.total')} <b style="color:${total > MAX_SUM ? 'var(--red)' : 'var(--gold)'}">${total}</b> / ${MAX_SUM}</p>
            <div class="row"><button class="ghost small" id="clear">${t('clear')}</button><button class="primary grow" id="ok">${t('validate')}</button></div></div>`;
        } else {
          h += `<div class="card"><p>${v.isDuelist ? t('dg.ready') : t('dg.setting')}</p>
            <p class="muted">${nm(v.a)} ${v.setupDone[v.a] ? '✅' : '⏳'} · ${nm(v.b)} ${v.setupDone[v.b] ? '✅' : '⏳'}</p></div>`;
          if (v.mySetup) h += `<div class="card"><h3>${t('dg.yourBoxes')}</h3><div class="bins">${v.mySetup.map((x, i) => box(i, x)).join('')}</div></div>`;
        }
      }

      if (v.phase === 'play' || v.phase === 'duelEnd' || v.phase === 'end') {
        const other = me === v.a ? v.b : v.a;
        const iAmLead = me === v.lead;
        const leadPlayed = v.pendTone[v.lead] != null;
        const myTurn = v.isDuelist && (leadPlayed ? !iAmLead && v.pending[me] == null : iAmLead);
        const side = (p) => {
          const own = p === me && v.mySetup;
          const vals = v.setups ? v.setups[p] : own ? v.mySetup : null;
          const played = Object.fromEntries(v.log.map((L) => (p === v.a ? [L.ia, L.va] : [L.ib, L.vb])));
          return `<div class="bins">${Array.from({ length: BINS }, (_, i) => {
            const u = v.used[p] && v.used[p].includes(i);
            const pend = v.pending[p] === i;
            const content = vals ? vals[i] : u ? played[i] : '';
            const canPlay = v.phase === 'play' && p === me && !u && myTurn;
            return box(i, content, `${u ? 'used' : ''} ${pend ? 'sel' : ''}`, canPlay ? `data-play="${i}"` : 'disabled');
          }).join('')}</div>`;
        };
        if (v.phase === 'play') {
          const who = leadPlayed ? (v.lead === v.a ? v.b : v.a) : v.lead;
          h += `<div class="banner ${myTurn ? 'gold' : ''}">${t('dg.roundTurn', { r: v.round, t: BINS })}${myTurn ? t('dg.yourTurn') : t('dg.choosing', { n: nm(who) })}</div>`;
          if (leadPlayed && !iAmLead) {
            const tone = v.pendTone[v.lead];
            h += `<p class="center">${t('dg.placed', { n: nm(v.lead), c: t('dg.t.' + tone) })} <span class="bin mini" style="display:inline-grid;place-items:center;background:${CSS[tone]};color:${INK[tone]}">?</span></p>`;
          }
        }
        const players = v.isDuelist ? [other, me] : [v.a, v.b];
        h += players.map((p) => `<div class="card"><div class="row" style="justify-content:space-between"><h3>${nm(p)}${p === me ? ' ' + t('you') : ''}</h3><span class="pts" style="color:var(--gold);font-weight:800">${v.pts[p] || 0} ${t('pts')}</span></div>${side(p)}</div>`).join('');
        if (v.log.length) h += `<div class="card"><h3>${t('dg.rounds')}</h3><table class="plays">${v.log.slice().reverse().map((L) => `<tr><td>${L.r}</td><td>${nm(v.a)} <span dir="ltr">${box(L.ia, L.va, 'mini', 'disabled')} – ${box(L.ib, L.vb, 'mini', 'disabled')}</span> ${nm(v.b)}</td><td>${L.win ? '→ ' + nm(L.win) : t('dg.tie')}</td></tr>`).join('')}</table></div>`;
      }

      if (v.phase === 'duelEnd' && v.result) {
        const R = v.result;
        h = (R.tie ? `<div class="banner">${t('dg.tieDuel')}</div>` : `<div class="banner good">${t('dg.winDuel', { n: nm(R.winner), s: `<span dir="ltr">${R.score}</span>` })}</div>`) + h;
        h += ui.isHost ? `<button class="primary block" id="next" style="margin-top:12px">${t('dg.next')}</button>` : waitHostP();
      }
      if (v.phase === 'end') h = winnerCard(ui.name(v.winner), t('dg.champ')) + h;

      const rows = ranking(v.wins, ui.players.filter((p) => p.pid in v.wins));
      h += `<div class="card"><h3>${t('dg.wins')}</h3>${scoreList(rows, me, '⚔️')}${v.waiting.length ? `<p class="muted" style="margin-top:8px">${t('dg.queue', { q: v.waiting.map(nm).join(', ') })}</p>` : ''}</div>`;
      el.innerHTML = h;

      el.querySelectorAll('[data-slot]').forEach((b) => { b.onclick = () => { st.sel = +b.dataset.slot; this.render(el, v, ui); }; });
      el.querySelectorAll('[data-digit]').forEach((b) => {
        b.onclick = () => {
          st.vals[st.sel] = +b.dataset.digit;
          const next = st.vals.findIndex((x, i) => i > st.sel && x == null);
          if (next >= 0) st.sel = next;
          this.render(el, v, ui);
        };
      });
      const on = (id, fn) => { const b = el.querySelector('#' + id); if (b) b.onclick = fn; };
      on('clear', () => { st.vals = Array(BINS).fill(null); st.sel = 0; this.render(el, v, ui); });
      on('ok', () => {
        const err = validate(st.vals.map((x) => (x == null ? NaN : x)));
        if (err) return ui.toast(err.key, err.p);
        ui.send({ k: 'setup', vals: st.vals });
      });
      el.querySelectorAll('[data-play]').forEach((b) => { b.onclick = () => ui.send({ k: 'play', i: +b.dataset.play }); });
      on('next', () => ui.send({ k: 'next' }));
    },
  });

  function newDuel(g) {
    g.setups = {};
    g.result = null;
    g.duel = { lead: g.firstLead, round: 1, used: { [g.a]: [], [g.b]: [] }, sub: {}, pts: { [g.a]: 0, [g.b]: 0 }, log: [] };
    g.phase = 'setup';
  }

  function endDuel(g) {
    const D = g.duel;
    const pa = D.pts[g.a], pb = D.pts[g.b];
    if (pa === pb) { g.result = { tie: true }; g.phase = 'duelEnd'; return; }
    const winner = pa > pb ? g.a : g.b, loser = winner === g.a ? g.b : g.a;
    g.wins[winner] += 1;
    if (g.champ === winner) g.streak += 1; else { g.champ = winner; g.streak = 1; }
    g.result = { winner, loser, score: `${Math.max(pa, pb)}–${Math.min(pa, pb)}` };
    if (g.streak >= 2) { g.winner = winner; g.phase = 'end'; return; }
    g.phase = 'duelEnd';
  }
})();
