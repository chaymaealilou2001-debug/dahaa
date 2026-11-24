'use strict';
// TIENS BON : enchère avec ton temps. Garde le doigt appuyé : le dernier à tenir gagne la manche,
// mais tout le monde paie le temps qu'il a tenu.

(() => {
  const BANK = 60000;     // 60 s de réserve par joueur
  const ROUNDS = 7;
  const COUNTDOWN = 3000;

  const fmt = (ms) => (Math.max(0, ms) / 1000).toFixed(1) + ' s';

  // État local du doigt (côté téléphone), indépendant des redessins d'écran.
  const local = { holding: false, send: null, liveSeenAt: 0 };
  const release = () => { if (local.holding) { local.holding = false; if (local.send) local.send({ k: 'release' }); updateBtn(); } };
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  window.addEventListener('blur', release);
  document.addEventListener('visibilitychange', () => { if (document.hidden) release(); });
  function updateBtn() { const b = document.querySelector('.holdbtn'); if (b) b.classList.toggle('on', local.holding); }

  addStrings({
    fr: {
      'tiens.bank': 'Ta réserve :', 'tiens.tokens': 'Jetons :', 'tiens.tokensT': 'Jetons', 'tiens.press': 'APPUIE<br>ET TIENS', 'tiens.hold': 'TIENS<br>BON !',
      'tiens.empty': 'Ta réserve est vide : tu regardes cette manche.', 'tiens.allPress': 'Tout le monde doit appuyer pour lancer ({a}/{b}).',
      'tiens.letGo': 'Lâche maintenant si tu ne veux pas jouer cette manche !', 'tiens.pass': 'Tu passes', 'tiens.notIn': 'Tu ne joues pas', 'tiens.running': 'La manche est en cours…',
      'tiens.released': 'Lâché', 'tiens.releasedTxt': 'Tu as lâché. On attend le dernier…', 'tiens.clock': 'Le chrono tourne…', 'tiens.start': 'Lancer sans attendre les autres',
      'tiens.win': '⏱️ <b>{n}</b> a tenu le plus longtemps et gagne 1 jeton !', 'tiens.noWin': 'Personne ne gagne cette manche.',
      'tiens.spent': 'Tu as dépensé <b>{s}</b> cette manche.', 'tiens.notPlayed': 'Tu n’as pas participé à cette manche.', 'tiens.left': '{s} restants',
      'tiens.e.nobody': 'Personne n’appuie sur le bouton.',
    },
    en: {
      'tiens.bank': 'Your reserve:', 'tiens.tokens': 'Tokens:', 'tiens.tokensT': 'Tokens', 'tiens.press': 'PRESS<br>AND HOLD', 'tiens.hold': 'HOLD<br>ON!',
      'tiens.empty': 'Your reserve is empty: you watch this round.', 'tiens.allPress': 'Everyone must press to start ({a}/{b}).',
      'tiens.letGo': 'Let go now if you don’t want to play this round!', 'tiens.pass': 'You pass', 'tiens.notIn': 'Not playing', 'tiens.running': 'The round is on…',
      'tiens.released': 'Released', 'tiens.releasedTxt': 'You let go. Waiting for the last one…', 'tiens.clock': 'The clock is running…', 'tiens.start': 'Start without waiting',
      'tiens.win': '⏱️ <b>{n}</b> held on the longest and wins 1 token!', 'tiens.noWin': 'Nobody wins this round.',
      'tiens.spent': 'You spent <b>{s}</b> this round.', 'tiens.notPlayed': 'You didn’t play this round.', 'tiens.left': '{s} left',
      'tiens.e.nobody': 'Nobody is pressing the button.',
    },
    ar: {
      'tiens.bank': 'وقتك المتبقي:', 'tiens.tokens': 'القطع:', 'tiens.tokensT': 'القطع', 'tiens.press': 'اضغط<br>واصمد', 'tiens.hold': 'اصمد!',
      'tiens.empty': 'نفد وقتك: أنت تشاهد هذه الجولة.', 'tiens.allPress': 'على الجميع الضغط للبدء ({a}/{b}).',
      'tiens.letGo': 'اترك الزر الآن إذا لم ترد اللعب في هذه الجولة!', 'tiens.pass': 'تخطّيت', 'tiens.notIn': 'لا تلعب', 'tiens.running': 'الجولة جارية…',
      'tiens.released': 'تركت الزر', 'tiens.releasedTxt': 'تركت الزر. ننتظر آخر لاعب…', 'tiens.clock': 'الوقت يمر…', 'tiens.start': 'ابدأ دون انتظار الآخرين',
      'tiens.win': '⏱️ <b>{n}</b> صمد أطول مدة ويربح قطعة!', 'tiens.noWin': 'لا أحد يربح هذه الجولة.',
      'tiens.spent': 'صرفت <b>{s}</b> في هذه الجولة.', 'tiens.notPlayed': 'لم تشارك في هذه الجولة.', 'tiens.left': 'بقي {s}',
      'tiens.e.nobody': 'لا أحد يضغط على الزر.',
    },
  });

  registerGame({
    id: 'tiens',
    emoji: '⏱️',
    min: 2,
    max: 10,

    init(players) {
      const bank = {}, tokens = {};
      players.forEach((p) => { bank[p.pid] = BANK; tokens[p.pid] = 0; });
      return { players, bank, tokens, round: 1, phase: 'ready', holding: {}, out: {}, live: null, cdTimer: null, tick: null, result: null };
    },

    act(g, pid, a, ctx, isHost) {
      const ids = g.players.map((p) => p.pid);
      const eligible = () => ids.filter((p) => g.bank[p] > 0 && ctx.online(p));

      const endRound = (now) => {
        const L = g.live;
        const active = Object.keys(L.active).filter((p) => L.active[p]);
        const winner = active.length === 1 ? active[0] : null;
        const spent = {};
        Object.keys(L.active).forEach((p) => {
          const t = Math.min(g.bank[p], (L.end[p] != null ? L.end[p] : now) - L.start);
          spent[p] = t;
          g.bank[p] = Math.max(0, g.bank[p] - t);
        });
        if (winner) g.tokens[winner] += 1;
        ctx.cancel(g.tick); g.tick = null;
        g.result = { winner, spent, participants: Object.keys(L.active).length };
        g.live = null;
        g.phase = 'result';
      };

      const checkEnd = (now) => {
        const L = g.live;
        Object.keys(L.active).forEach((p) => {
          if (L.active[p] && now - L.start >= g.bank[p]) { L.active[p] = false; L.end[p] = L.start + g.bank[p]; }
        });
        const left = Object.keys(L.active).filter((p) => L.active[p]).length;
        if (left <= 1) { endRound(now); return true; }
        return false;
      };

      const startLive = (gg) => {
        if (gg.phase !== 'countdown') return;
        const now = Date.now();
        const parts = ids.filter((p) => gg.holding[p] && !gg.out[p] && gg.bank[p] > 0);
        gg.live = { start: now, active: {}, end: {} };
        parts.forEach((p) => { gg.live.active[p] = true; });
        gg.phase = 'live';
        if (parts.length <= 1) { endRound(now); return; }
        gg.tick = ctx.every(100, (g3) => g3.phase === 'live' && checkEnd(Date.now()));
      };

      const startCountdown = () => {
        g.phase = 'countdown';
        g.cdEnd = Date.now() + COUNTDOWN;
        g.cdTimer = ctx.after(COUNTDOWN, startLive);
      };

      if (a.k === 'press') {
        if (g.bank[pid] <= 0) return;
        if (g.phase === 'ready') {
          g.holding[pid] = true;
          const el = eligible();
          if (el.length >= 2 && el.every((p) => g.holding[p])) startCountdown();
        } else if (g.phase === 'countdown' && !g.out[pid]) {
          g.holding[pid] = true;
        }
        return;
      }
      if (a.k === 'release') {
        if (g.phase === 'ready') { g.holding[pid] = false; return; }
        if (g.phase === 'countdown') { if (g.holding[pid]) { g.holding[pid] = false; g.out[pid] = true; } return; }
        if (g.phase === 'live' && g.live && g.live.active[pid]) {
          const now = Date.now();
          g.live.active[pid] = false;
          g.live.end[pid] = now;
          checkEnd(now);
        }
        return;
      }
      if (a.k === 'start' && isHost && g.phase === 'ready') {
        if (!ids.some((p) => g.holding[p])) return 'tiens.e.nobody';
        startCountdown();
        return;
      }
      if (a.k === 'next' && isHost && g.phase === 'result') {
        const stillIn = ids.filter((p) => g.bank[p] > 0).length;
        if (g.round >= ROUNDS || stillIn < 2) { g.phase = 'end'; return; }
        g.round += 1; g.holding = {}; g.out = {}; g.result = null; g.phase = 'ready';
      }
    },

    view(g, pid) {
      const ids = g.players.map((p) => p.pid);
      return {
        phase: g.phase, round: g.round, rounds: ROUNDS, bankMax: BANK,
        myBank: g.bank[pid], myTokens: g.tokens[pid],
        tokens: g.tokens,
        holdingCount: g.phase === 'ready' ? ids.filter((p) => g.holding[p]).length : null,
        readyTotal: ids.filter((p) => g.bank[p] > 0).length,
        cdLeft: g.phase === 'countdown' ? Math.max(0, g.cdEnd - Date.now()) : null,
        iAmIn: g.phase === 'live' ? !!(g.live && g.live.active[pid]) : g.phase === 'countdown' ? !!(g.holding[pid] && !g.out[pid]) : null,
        iWasIn: g.phase === 'live' ? !!(g.live && pid in g.live.active) : null,
        myOut: !!g.out[pid],
        result: g.result ? { winner: g.result.winner, mySpent: g.result.spent[pid], participated: pid in g.result.spent, participants: g.result.participants } : null,
        finalBanks: g.phase === 'end' ? g.bank : null,
        players: g.players,
      };
    },

    // Joueur virtuel : appuie, puis tient un temps choisi selon sa réserve et les manches restantes.
    bot(v, mem) {
      if (v.myBank <= 0) return null;
      if (v.phase === 'ready') {
        mem.abstain = null;
        if (mem.pressed !== v.round && think(mem, 'r' + v.round, 600, 1800)) { mem.pressed = v.round; return { k: 'press' }; }
        return null;
      }
      if (v.phase === 'countdown' && v.iAmIn) {
        if (mem.abstain == null) mem.abstain = chance(0.15);
        if (mem.abstain && mem.left !== v.round) { mem.left = v.round; return { k: 'release' }; }
        return null;
      }
      if (v.phase === 'live' && v.iAmIn) {
        if (mem.liveRound !== v.round) {
          mem.liveRound = v.round;
          mem.t0 = Date.now();
          const budget = v.myBank / (v.rounds - v.round + 1);
          mem.target = Math.min(v.myBank, rand(0.3, 1.8) * budget + rand(0, 1500));
        }
        if (Date.now() - mem.t0 >= mem.target) return { k: 'release' };
      }
      return null;
    },

    render(el, v, ui) {
      local.send = ui.send;
      const rows = ranking(v.tokens, v.players, v.finalBanks || null);
      const key = v.phase + ':' + v.round;
      const samePhase = el.dataset.key === key;
      el.dataset.key = key;

      // Nouvelle manche alors que le doigt est encore posé : on le signale.
      if (v.phase === 'ready' && local.holding && !samePhase) ui.send({ k: 'press' });
      if (v.phase === 'result' || v.phase === 'end') local.holding = false;
      if (v.phase === 'live' && !samePhase) local.liveSeenAt = Date.now();

      const bankBar = `<div class="muted">${t('tiens.bank')} <b style="color:var(--text)">${fmt(v.myBank)}</b> · ${t('tiens.tokens')} <b style="color:var(--gold)">${v.myTokens}</b></div>
        <div class="bankbar"><i style="width:${(v.myBank / v.bankMax) * 100}%"></i></div>`;
      let h = `<div class="banner">${t('round', { a: `<b>${v.round}</b>`, b: v.rounds })}</div><div class="card">${bankBar}</div>`;

      if (v.phase === 'ready' || v.phase === 'countdown' || v.phase === 'live') {
        let label = t('tiens.press'), status = '';
        let off = v.myBank <= 0;
        if (v.phase === 'ready') status = off ? t('tiens.empty') : t('tiens.allPress', { a: v.holdingCount, b: v.readyTotal });
        if (v.phase === 'countdown') { status = t('tiens.letGo'); if (v.myOut) { off = true; label = t('tiens.pass'); } }
        if (v.phase === 'live') {
          if (!v.iWasIn) { off = true; label = t('tiens.notIn'); status = t('tiens.running'); }
          else if (!v.iAmIn) { off = true; label = t('tiens.released'); status = t('tiens.releasedTxt'); }
          else { label = t('tiens.hold'); status = t('tiens.clock'); }
        }
        h += `<div class="card center"><p id="status">${status}</p>
          ${v.phase === 'countdown' ? '<div class="timer" id="cd">3</div>' : ''}
          ${v.phase === 'live' && v.iAmIn ? '<div class="timer" id="run">0.0 s</div>' : ''}
          <div class="holdwrap"><button class="holdbtn ${off ? 'off' : ''} ${local.holding && !off ? 'on' : ''}" id="hold" ${off ? 'disabled' : ''}>${label}</button></div>
          ${v.phase === 'ready' && ui.isHost && v.holdingCount > 0 && v.holdingCount < v.readyTotal ? `<button class="small ghost" id="start">${t('tiens.start')}</button>` : ''}</div>`;
      }

      if (v.phase === 'result' || v.phase === 'end') {
        const r = v.result;
        if (r) {
          h += r.winner
            ? `<div class="banner ${r.winner === ui.me ? 'good' : 'gold'}">${t('tiens.win', { n: esc(ui.name(r.winner)) })}</div>`
            : `<div class="banner bad">${t('tiens.noWin')}</div>`;
          if (r.participated) h += `<p class="muted center">${t('tiens.spent', { s: fmt(r.mySpent) })}</p>`;
          else h += `<p class="muted center">${t('tiens.notPlayed')}</p>`;
        }
        if (v.phase === 'result') h += ui.isHost ? `<button class="primary block" id="next" style="margin-top:12px">${t('nextRound')}</button>` : waitHostP();
      }

      if (v.phase === 'end') h += winnerCard(rows[0].name);
      h += `<div class="card"><h3>${t('tiens.tokensT')}</h3>${scoreList(rows, ui.me, '🪙', v.finalBanks ? (r) => `(${t('tiens.left', { s: fmt(v.finalBanks[r.pid]) })})` : null)}</div>`;

      el.innerHTML = h;

      const btn = el.querySelector('#hold');
      if (btn && !btn.disabled) {
        btn.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          try { btn.setPointerCapture(e.pointerId); } catch { /* ignore */ }
          if (!local.holding) { local.holding = true; updateBtn(); ui.send({ k: 'press' }); }
        });
        btn.addEventListener('contextmenu', (e) => e.preventDefault());
      }
      const st = el.querySelector('#start'); if (st) st.onclick = () => ui.send({ k: 'start' });
      const nx = el.querySelector('#next'); if (nx) nx.onclick = () => ui.send({ k: 'next' });

      // Petits chronos d'affichage (locaux)
      clearInterval(el._iv);
      if (v.phase === 'countdown') {
        const endAt = Date.now() + v.cdLeft;
        el._iv = setInterval(() => { const c = el.querySelector('#cd'); if (c) c.textContent = Math.max(0, Math.ceil((endAt - Date.now()) / 1000)); }, 100);
      }
      if (v.phase === 'live' && v.iAmIn) {
        const t0 = local.liveSeenAt;
        el._iv = setInterval(() => {
          const r = el.querySelector('#run');
          const dt = Date.now() - t0;
          if (r) r.textContent = fmt(Math.min(dt, v.myBank));
        }, 100);
      }
    },
  });
})();
