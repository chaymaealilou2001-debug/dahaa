'use strict';
// DÉJÀ VU : des images défilent sur tous les téléphones. Appuie dès qu'une image revient.

(() => {
  const POOL = '🐪🦁🐘🦒🐢🐙🦋🐝🐬🦉🦊🐼🐸🦀🐌🌵🌴🍉🍋🍇🍓🥕🌶️🍄🥐🧀🍕🍩☕🫖⚽🏀🎸🥁🎲🧩🎈🎁🔑🔔💡📚✏️⏰🧲🚲🚀⛵🚂🏠🕌⛺🌙⭐☀️🌈❄️🔥💎👑🎩🧦👟🕶️🌹🌻'.match(/\p{Extended_Pictographic}️?/gu);
  const ROUNDS = [{ len: 26, ms: 1500 }, { len: 32, ms: 1150 }, { len: 38, ms: 850 }];
  const LEAD = 3500; // compte à rebours avant le premier dessin

  function makeSeq(len) {
    const fresh = shuffle(POOL);
    const seq = [], dup = [];
    let f = 0;
    for (let i = 0; i < len; i++) {
      const canRepeat = i >= 4 && Math.random() < 0.3 && !dup[i - 1];
      if (canRepeat) {
        const back = 2 + Math.floor(Math.random() * Math.min(7, i - 1));
        const src = seq[i - back];
        if (!seq.slice(i - 1, i).includes(src)) { seq.push(src); dup.push(true); continue; }
      }
      seq.push(fresh[f++ % fresh.length]); dup.push(false);
    }
    // marque correcte des répétitions (une image déjà vue plus tôt)
    const seen = new Set();
    return { seq, dup: seq.map((e) => { const d = seen.has(e); seen.add(e); return d; }) };
  }

  // état local du défilement sur ce téléphone
  const local = { iv: null };

  addStrings({
    fr: {
      'dv.ready': 'Préparez-vous…', 'dv.img': 'Image {a}/{b}', 'dv.endRound': 'Fin de la manche…', 'dv.btn': 'DÉJÀ<br>VU !',
      'dv.go': 'Prêts ?', 'dv.goHelp': 'Les images vont défiler sur tous les téléphones en même temps. Appuie quand une image revient.',
      'dv.start1': 'Lancer la manche 1', 'dv.hostStart': 'L’hôte va lancer la manche…', 'dv.over': 'Manche <b>{a}</b>/{b} terminée · {n} images répétées',
      'dv.you': 'Tu en as trouvé <b style="color:var(--green)">{ok}</b>/{n}, avec <b style="color:var(--red)">{bad}</b> erreur(s).',
      'dv.parade': 'Le défilé', 'dv.boxed': 'Encadrées : les images qui revenaient.',
    },
    en: {
      'dv.ready': 'Get ready…', 'dv.img': 'Picture {a}/{b}', 'dv.endRound': 'End of the round…', 'dv.btn': 'SEEN<br>IT!',
      'dv.go': 'Ready?', 'dv.goHelp': 'Pictures will scroll on every phone at the same time. Tap when a picture comes back.',
      'dv.start1': 'Start round 1', 'dv.hostStart': 'The host will start the round…', 'dv.over': 'Round <b>{a}</b>/{b} over · {n} repeated pictures',
      'dv.you': 'You found <b style="color:var(--green)">{ok}</b>/{n}, with <b style="color:var(--red)">{bad}</b> mistake(s).',
      'dv.parade': 'The parade', 'dv.boxed': 'Boxed: the pictures that came back.',
    },
    ar: {
      'dv.ready': 'استعدوا…', 'dv.img': 'الصورة {a}/{b}', 'dv.endRound': 'نهاية الجولة…', 'dv.btn': 'رأيتها!',
      'dv.go': 'مستعدون؟', 'dv.goHelp': 'ستمرّ الصور على كل الهواتف في نفس الوقت. اضغط عندما تعود صورة.',
      'dv.start1': 'ابدأ الجولة 1', 'dv.hostStart': 'المضيف سيبدأ الجولة…', 'dv.over': 'انتهت الجولة <b>{a}</b>/{b} · {n} صور مكررة',
      'dv.you': 'وجدت <b style="color:var(--green)">{ok}</b>/{n}، مع <b style="color:var(--red)">{bad}</b> خطأ.',
      'dv.parade': 'الصور التي مرّت', 'dv.boxed': 'المؤطّرة: الصور التي عادت.',
    },
  });

  registerGame({
    id: 'dejavu',
    emoji: '👀',
    min: 1,
    max: 10,

    init(players) {
      const scores = {};
      players.forEach((p) => { scores[p.pid] = 0; });
      return { players, scores, round: 0, phase: 'ready', hits: {}, stats: {} };
    },

    act(g, pid, a, ctx, isHost) {
      if (a.k === 'start' && isHost && (g.phase === 'ready' || g.phase === 'roundEnd')) {
        if (g.round >= ROUNDS.length) { g.phase = 'end'; return; }
        const R = ROUNDS[g.round];
        g.round += 1;
        Object.assign(g, makeSeq(R.len));
        g.ms = R.ms;
        g.startAt = Date.now() + LEAD;
        g.hits = {}; g.stats = {};
        g.players.forEach((p) => { g.hits[p.pid] = {}; g.stats[p.pid] = { ok: 0, bad: 0 }; });
        g.phase = 'run';
        ctx.after(LEAD + R.len * R.ms + 600, (gg) => { if (gg.phase === 'run') gg.phase = gg.round >= ROUNDS.length ? 'end' : 'roundEnd'; });
        return;
      }
      if (a.k === 'tap' && g.phase === 'run' && g.hits[pid]) {
        let i = Math.floor(+a.i);
        if (!(i >= 0 && i < g.seq.length)) return;
        // petite tolérance : un appui juste après le changement compte pour l'image précédente
        if (!g.dup[i] && i > 0 && g.dup[i - 1] && !g.hits[pid][i - 1] && +a.late) i -= 1;
        if (g.hits[pid][i]) return;
        g.hits[pid][i] = true;
        if (g.dup[i]) { g.scores[pid] += 1; g.stats[pid].ok += 1; } else { g.scores[pid] -= 1; g.stats[pid].bad += 1; }
      }
    },

    view(g, pid) {
      const run = g.phase === 'run';
      return {
        phase: g.phase, round: g.round, rounds: ROUNDS.length,
        seq: run || g.phase === 'roundEnd' || g.phase === 'end' ? g.seq : null,
        dup: g.phase !== 'run' ? g.dup : null,
        ms: g.ms, startIn: run ? g.startAt - Date.now() : null,
        myHits: g.hits[pid] ? Object.keys(g.hits[pid]).map(Number) : [],
        stats: g.stats, totalDup: g.dup ? g.dup.filter(Boolean).length : 0,
        scores: g.scores, players: g.players,
      };
    },

    // Joueur virtuel : repère environ 70 % des répétitions, avec un temps de réaction, et se trompe rarement.
    bot(v, mem) {
      if (v.phase !== 'run') return null;
      if (mem.round !== v.round) {
        mem.round = v.round; mem.t0 = Date.now() + v.startIn; mem.plan = {}; mem.done = {};
        const seen = new Set();
        v.seq.forEach((e, i) => {
          const d = seen.has(e); seen.add(e);
          if ((d && chance(0.7)) || (!d && chance(0.03))) mem.plan[i] = rand(350, v.ms * 0.85);
        });
      }
      const dt = Date.now() - mem.t0;
      if (dt < 0) return null;
      const i = Math.floor(dt / v.ms);
      if (i >= v.seq.length || mem.plan[i] == null || mem.done[i] || dt - i * v.ms < mem.plan[i]) return null;
      mem.done[i] = true;
      return { k: 'tap', i, late: 0 };
    },

    render(el, v, ui) {
      const rows = ranking(v.scores, v.players);
      const key = v.phase + v.round;
      const fresh = el.dataset.key !== key;
      el.dataset.key = key;
      if (fresh) { clearInterval(local.iv); local.iv = null; }

      if (v.phase === 'run') {
        if (fresh) {
          // L'heure de départ est mémorisée une seule fois par manche (même si l'écran est redessiné)
          if (local.runRound !== v.round) { local.runRound = v.round; local.t0 = Date.now() + v.startIn; local.tapped = new Set(); }
          el._run = { t0: local.t0, tapped: local.tapped };
          el.innerHTML = `<div class="banner">${t('round', { a: `<b>${v.round}</b>`, b: v.rounds })}</div>
            <div class="card center"><div class="muted" id="dvInfo">${t('dv.ready')}</div><div class="flash" id="dvImg"></div>
            <div class="bankbar"><i id="dvProg" style="width:0%"></i></div></div>
            <div class="holdwrap"><button class="holdbtn" id="dvTap">${t('dv.btn')}</button></div>
            <div class="card"><h3>${t('scores')}</h3><div id="dvScores">${scoreList(rows, ui.me)}</div></div>`;
          const R = el._run;
          const idxNow = () => Math.floor((Date.now() - R.t0) / v.ms);
          local.iv = setInterval(() => {
            const img = el.querySelector('#dvImg'); if (!img) return clearInterval(local.iv);
            const dt = Date.now() - R.t0;
            if (dt < 0) { img.textContent = Math.ceil(-dt / 1000); el.querySelector('#dvInfo').textContent = t('dv.ready'); return; }
            const i = idxNow();
            if (i >= v.seq.length) { img.textContent = '⏳'; el.querySelector('#dvInfo').textContent = t('dv.endRound'); return; }
            if (img.dataset.i !== String(i)) { img.dataset.i = i; img.textContent = v.seq[i]; el.querySelector('#dvInfo').textContent = t('dv.img', { a: i + 1, b: v.seq.length }); el.querySelector('#dvTap').classList.toggle('on', R.tapped.has(i)); }
            el.querySelector('#dvProg').style.width = `${((i + 1) / v.seq.length) * 100}%`;
          }, 50);
          const tap = (e) => {
            e.preventDefault();
            const dt = Date.now() - R.t0;
            if (dt < 0) return;
            const i = Math.floor(dt / v.ms);
            if (i >= v.seq.length || R.tapped.has(i)) return;
            R.tapped.add(i);
            const late = dt - i * v.ms < 250 ? 1 : 0;
            el.querySelector('#dvTap').classList.add('on');
            if (navigator.vibrate) { try { navigator.vibrate(30); } catch { /* ignore */ } }
            ui.send({ k: 'tap', i, late });
          };
          el.querySelector('#dvTap').addEventListener('pointerdown', tap);
        } else {
          const s = el.querySelector('#dvScores'); if (s) s.innerHTML = scoreList(rows, ui.me);
        }
        return;
      }

      let h = '';
      if (v.phase === 'ready') {
        h += `<div class="card center"><h2>${t('dv.go')}</h2><p class="muted">${t('dv.goHelp')}</p>
          ${ui.isHost ? `<button class="primary block" id="start">${t('dv.start1')}</button>` : `<p class="muted">${t('dv.hostStart')}</p>`}</div>`;
      }
      if (v.phase === 'roundEnd' || v.phase === 'end') {
        const me = v.stats[ui.me] || { ok: 0, bad: 0 };
        h += `<div class="banner">${t('dv.over', { a: v.round, b: v.rounds, n: v.totalDup })}</div>
          <div class="card center"><p>${t('dv.you', { ok: me.ok, n: v.totalDup, bad: me.bad })}</p></div>
          <div class="card"><h3>${t('dv.parade')}</h3><div style="font-size:1.6rem;line-height:1.5" dir="ltr">${v.seq.map((e, i) => `<span style="${v.dup[i] ? 'outline:2px solid var(--gold);border-radius:6px' : 'opacity:.55'}" title="${i + 1}">${e}</span>`).join(' ')}</div>
          <p class="muted">${t('dv.boxed')}</p></div>`;
        if (v.phase === 'roundEnd') h += ui.isHost ? `<button class="primary block" id="start" style="margin-top:12px">${t('nextRound')}</button>` : waitHostP();
        if (v.phase === 'end') h += winnerCard(rows[0].name);
      }
      h += `<div class="card"><h3>${t('scores')}</h3>${scoreList(rows, ui.me)}</div>`;
      el.innerHTML = h;
      const st = el.querySelector('#start'); if (st) st.onclick = () => ui.send({ k: 'start' });
    },
  });
})();
