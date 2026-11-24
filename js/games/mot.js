'use strict';
// LE MOT SECRET : fais deviner ton mot avec des indices… sans qu'on le trouve trop vite.
// Les mots restent en français (la table de proximité est en français).

(() => {
  const MAX_HINTS = 5;      // indices par tentative
  const STAGES = 3;         // tentatives par joueur
  const WORDS_EACH = 5;

  addStrings({
    fr: {
      'mot.banner': 'Manche <b>{r}</b>/2', 'mot.double': ' · <b>points ×2</b>', 'mot.turn': ' · Tour de <b>{n}</b> · tentative {s}/{t}',
      'mot.yourSecret': 'Ton mot secret :', 'mot.pickTitle': 'Choisis ton mot secret', 'mot.pickHelp': 'Les autres devront le deviner grâce à tes indices.',
      'mot.hintPh': 'Un indice (un nom)', 'mot.hintCount': '{a}/{b} indices pour cette tentative.', 'mot.toGuess': 'C’est bon, faites vos propositions !',
      'mot.giving': '<b>{n}</b> donne des indices…', 'mot.watch': 'Observe les % : plus c’est haut, plus l’indice est proche du mot secret.',
      'mot.hints': 'Indices', 'mot.noHint': 'Pas encore d’indice.', 'mot.attempt': 'tentative {n}',
      'mot.othersSearch': 'Les autres cherchent ton mot (<b>{w}</b>)…', 'mot.answered': '{a}/{b} ont répondu.', 'mot.yourGuess': 'Ta proposition :',
      'mot.guessTitle': 'Quel est le mot de {n} ?', 'mot.guessPh': 'Ta proposition', 'mot.guessHelp': 'Tout le monde révèle en même temps. Bonne réponse = {p} pt(s).',
      'mot.force': 'Révéler sans attendre les autres', 'mot.found': '🎯 Trouvé par <b>{n}</b> : +{p} pt(s) chacun.', 'mot.notFound': '😈 Personne n’a trouvé ! <b>{n}</b> gagne +{p} pt(s).',
      'mot.wasWord': 'Le mot secret était', 'mot.guesses': 'Propositions', 'mot.nextPlayer': 'Joueur suivant', 'mot.retry': 'Nouvelle tentative', 'mot.waitNext': 'En attente de la suite…',
      'mot.langNote': 'Les mots de cette partie sont en {l} (la langue de l’hôte).',
      'mot.e.one': 'Un seul mot, en lettres.', 'mot.e.secret': 'Tu ne peux pas donner ton mot secret !', 'mot.e.dup': 'Indice déjà donné.', 'mot.e.need': 'Donne au moins un indice.',
    },
    en: {
      'mot.banner': 'Round <b>{r}</b>/2', 'mot.double': ' · <b>points ×2</b>', 'mot.turn': ' · <b>{n}</b>’s turn · attempt {s}/{t}',
      'mot.yourSecret': 'Your secret word:', 'mot.pickTitle': 'Choose your secret word', 'mot.pickHelp': 'The others will have to guess it from your clues.',
      'mot.hintPh': 'A clue (one noun)', 'mot.hintCount': '{a}/{b} clues for this attempt.', 'mot.toGuess': 'Done, make your guesses!',
      'mot.giving': '<b>{n}</b> is giving clues…', 'mot.watch': 'Watch the %: the higher it is, the closer the clue is to the secret word.',
      'mot.hints': 'Clues', 'mot.noHint': 'No clue yet.', 'mot.attempt': 'attempt {n}',
      'mot.othersSearch': 'The others are looking for your word (<b>{w}</b>)…', 'mot.answered': '{a}/{b} have answered.', 'mot.yourGuess': 'Your guess:',
      'mot.guessTitle': 'What is {n}’s word?', 'mot.guessPh': 'Your guess', 'mot.guessHelp': 'Everyone reveals at the same time. Right answer = {p} pt(s).',
      'mot.force': 'Reveal without waiting', 'mot.found': '🎯 Found by <b>{n}</b>: +{p} pt(s) each.', 'mot.notFound': '😈 Nobody found it! <b>{n}</b> gets +{p} pt(s).',
      'mot.wasWord': 'The secret word was', 'mot.guesses': 'Guesses', 'mot.nextPlayer': 'Next player', 'mot.retry': 'New attempt', 'mot.waitNext': 'Waiting for what’s next…',
      'mot.langNote': 'The words in this game are in {l} (the host’s language).',
      'mot.e.one': 'A single word, letters only.', 'mot.e.secret': 'You can’t give your secret word!', 'mot.e.dup': 'Clue already given.', 'mot.e.need': 'Give at least one clue.',
    },
    ar: {
      'mot.banner': 'الجولة <b>{r}</b>/2', 'mot.double': ' · <b>النقاط ×2</b>', 'mot.turn': ' · دور <b>{n}</b> · المحاولة {s}/{t}',
      'mot.yourSecret': 'كلمتك السرية:', 'mot.pickTitle': 'اختر كلمتك السرية', 'mot.pickHelp': 'على الآخرين تخمينها من تلميحاتك.',
      'mot.hintPh': 'تلميح (اسم واحد)', 'mot.hintCount': '{a}/{b} تلميحات في هذه المحاولة.', 'mot.toGuess': 'انتهيت، قدّموا أجوبتكم!',
      'mot.giving': '<b>{n}</b> يعطي تلميحات…', 'mot.watch': 'راقب النسبة: كلما ارتفعت كان التلميح أقرب إلى الكلمة السرية.',
      'mot.hints': 'التلميحات', 'mot.noHint': 'لا يوجد تلميح بعد.', 'mot.attempt': 'المحاولة {n}',
      'mot.othersSearch': 'الآخرون يبحثون عن كلمتك (<b>{w}</b>)…', 'mot.answered': '{a}/{b} أجابوا.', 'mot.yourGuess': 'جوابك:',
      'mot.guessTitle': 'ما هي كلمة {n}؟', 'mot.guessPh': 'جوابك', 'mot.guessHelp': 'الجميع يكشف في نفس الوقت. الجواب الصحيح = {p} نقطة.',
      'mot.force': 'اكشف دون انتظار الآخرين', 'mot.found': '🎯 وجدها <b>{n}</b>: ‎+{p} نقطة لكل واحد.', 'mot.notFound': '😈 لم يجدها أحد! <b>{n}</b> يربح ‎+{p} نقطة.',
      'mot.wasWord': 'الكلمة السرية كانت', 'mot.guesses': 'الأجوبة', 'mot.nextPlayer': 'اللاعب التالي', 'mot.retry': 'محاولة جديدة', 'mot.waitNext': 'في انتظار المتابعة…',
      'mot.langNote': 'لغة كلمات هذه اللعبة: {l} (لغة المضيف).',
      'mot.e.one': 'كلمة واحدة، بالحروف فقط.', 'mot.e.secret': 'لا يمكنك إعطاء كلمتك السرية!', 'mot.e.dup': 'هذا التلميح أُعطي من قبل.', 'mot.e.need': 'أعطِ تلميحًا واحدًا على الأقل.',
    },
  });

  function barColor(p) { return p >= 80 ? 'var(--red)' : p >= 55 ? 'var(--gold)' : p >= 30 ? 'var(--blue)' : '#7b6c8c'; }

  registerGame({
    id: 'mot',
    emoji: '🔤',
    min: 2,
    max: 8,

    // La langue des mots est celle de l'hôte au début de la partie (la même pour tous les joueurs).
    init(players, ctx) {
      const lang = (ctx && ctx.lang) || 'fr';
      const W = WORDS.forLang(lang);
      const pool = shuffle(W.secrets);
      const words = {};
      players.forEach((p, i) => { words[p.pid] = pool.slice(i * WORDS_EACH, i * WORDS_EACH + WORDS_EACH); });
      const scores = {};
      players.forEach((p) => { scores[p.pid] = 0; });
      return {
        lang, players, order: shuffle(players.map((p) => p.pid)),
        round: 1, phase: 'pick', words, used: {}, secret: {},
        giverIdx: 0, stage: 1, hints: [], guesses: {}, result: null, scores,
      };
    },

    act(g, pid, a, ctx, isHost) {
      const W = WORDS.forLang(g.lang);
      const giver = g.order[g.giverIdx];
      const mult = g.round === 2 ? 2 : 1;
      const others = g.order.filter((p) => p !== giver);

      if (a.k === 'pick' && g.phase === 'pick') {
        if (!g.words[pid] || !g.words[pid].includes(a.w) || (g.used[pid] || []).includes(a.w)) return;
        g.secret[pid] = a.w;
        if (g.players.every((p) => g.secret[p.pid])) { g.phase = 'hint'; g.giverIdx = 0; g.stage = 1; g.hints = []; }
        return;
      }

      if (a.k === 'hint' && g.phase === 'hint' && pid === giver) {
        const w = String(a.w || '').trim().toLowerCase();
        if (!/^[\p{L}\p{M}'’ -]{2,30}$/u.test(w)) return 'mot.e.one';
        const sec = g.secret[giver];
        const nw = W.norm(w), ns = W.norm(sec);
        if (nw === ns || (ns.length >= 4 && nw.includes(ns)) || (nw.length >= 4 && ns.includes(nw))) return 'mot.e.secret';
        if (g.hints.some((h) => W.same(h.w, w))) return 'mot.e.dup';
        const s = W.similarity(sec, w);
        g.hints.push({ w, s, stage: g.stage });
        const n = g.hints.filter((h) => h.stage === g.stage).length;
        if (s >= 95 || n >= MAX_HINTS) { g.phase = 'guess'; g.guesses = {}; }
        return;
      }

      if (a.k === 'toGuess' && g.phase === 'hint' && pid === giver) {
        if (!g.hints.some((h) => h.stage === g.stage)) return 'mot.e.need';
        g.phase = 'guess'; g.guesses = {};
        return;
      }

      const resolve = () => {
        const sec = g.secret[giver];
        const correct = others.filter((p) => g.guesses[p] && W.same(g.guesses[p], sec));
        const pts = g.stage * mult;
        let done = false;
        if (correct.length) { correct.forEach((p) => { g.scores[p] += pts; }); done = true; }
        else { g.scores[giver] += pts; if (g.stage >= STAGES) done = true; }
        g.result = { correct, pts, guesses: { ...g.guesses }, done, secret: done ? sec : null, giver, stage: g.stage };
        g.phase = 'reveal';
      };

      if (a.k === 'guess' && g.phase === 'guess' && pid !== giver && others.includes(pid)) {
        if (g.guesses[pid] != null) return;
        g.guesses[pid] = String(a.w || '').trim().slice(0, 30);
        if (others.every((p) => g.guesses[p] != null)) resolve();
        return;
      }

      if (a.k === 'force' && g.phase === 'guess' && isHost) {
        others.forEach((p) => { if (g.guesses[p] == null) g.guesses[p] = ''; });
        resolve();
        return;
      }

      if (a.k === 'next' && g.phase === 'reveal' && (isHost || pid === giver)) {
        const r = g.result;
        g.result = null; g.guesses = {};
        if (!r.done) { g.stage += 1; g.phase = 'hint'; return; }
        g.giverIdx += 1; g.stage = 1; g.hints = [];
        if (g.giverIdx < g.order.length) { g.phase = 'hint'; return; }
        if (g.round === 1) {
          g.round = 2; g.giverIdx = 0;
          g.players.forEach((p) => { g.used[p.pid] = [...(g.used[p.pid] || []), g.secret[p.pid]]; });
          g.secret = {};
          g.phase = 'pick';
          return;
        }
        g.phase = 'end';
      }
    },

    view(g, pid) {
      const giver = g.order[g.giverIdx];
      const others = g.order.filter((p) => p !== giver);
      return {
        lang: g.lang, phase: g.phase, round: g.round, stage: g.stage, stages: STAGES, maxHints: MAX_HINTS,
        giver, isGiver: pid === giver,
        order: g.order,
        myWords: g.phase === 'pick' ? (g.words[pid] || []).map((w) => ({ w, used: (g.used[pid] || []).includes(w) })) : null,
        myPick: g.secret[pid] || null,
        picked: g.players.filter((p) => g.secret[p.pid]).length, total: g.players.length,
        hints: g.hints,
        stageHints: g.hints.filter((h) => h.stage === g.stage).length,
        mySecret: pid === giver && g.phase !== 'pick' ? g.secret[giver] : null,
        guessed: others.filter((p) => g.guesses[p] != null).length, guessTotal: others.length,
        myGuess: g.guesses[pid] != null ? g.guesses[pid] : null,
        result: g.result,
        scores: g.scores,
        players: g.players,
      };
    },

    // Joueur virtuel : donne des indices de plus en plus proches, et devine d'après les % affichés.
    bot(v, mem) {
      const W = WORDS.forLang(v.lang);
      if (v.phase === 'pick' && !v.myPick) {
        if (think(mem, 'pick' + v.round)) return { k: 'pick', w: pick(v.myWords.filter((w) => !w.used)).w };
        return null;
      }
      if (v.phase === 'hint' && v.isGiver) {
        if (!think(mem, `hint${v.round}${v.giver}${v.stage}-${v.hints.length}`, 1500, 3200)) return null;
        if (v.stageHints >= (v.stage === 1 ? 3 : 2)) return { k: 'toGuess' };
        const given = new Set(v.hints.map((h) => W.norm(h.w)));
        const lo = [30, 45, 60][v.stage - 1], hi = [62, 76, 88][v.stage - 1];
        const all = W.neighbors(v.mySecret).filter(([w]) => !given.has(W.norm(w)) && !w.includes(' '));
        let c = all.filter(([, s]) => s >= lo && s <= hi);
        if (!c.length) c = all.filter(([, s]) => s < 90);
        if (!c.length) return { k: 'toGuess' };
        return { k: 'hint', w: pick(c)[0] };
      }
      if (v.phase === 'guess' && !v.isGiver && v.myGuess == null) {
        if (!think(mem, `guess${v.round}${v.giver}${v.stage}`, 2200, 4800)) return null;
        const scored = W.secrets.filter((c) => c !== v.myPick)
          .map((c) => ({ c, err: v.hints.reduce((s, h) => s + Math.abs(W.similarity(c, h.w) - h.s), 0) }))
          .sort((a, b) => a.err - b.err);
        const i = chance(0.4 + 0.15 * v.stage) ? 0 : 1 + Math.floor(Math.random() * 3);
        return { k: 'guess', w: scored[Math.min(i, scored.length - 1)].c };
      }
      if (v.phase === 'reveal' && v.isGiver && think(mem, `next${v.round}${v.giver}${v.result.stage}`, 3000, 4500)) return { k: 'next' };
      return null;
    },

    render(el, v, ui) {
      const rows = ranking(v.scores, v.players);
      const giverName = esc(ui.name(v.giver));
      const word = (w) => `<bdi lang="${v.lang}">${esc(w)}</bdi>`;
      const langNote = v.lang !== I18N.lang ? `<p class="muted">${t('mot.langNote', { l: LANGS[v.lang] })}</p>` : '';
      const hintList = (list) => list.length ? `<ul class="hints">${list.map((h) => `
        <li class="hint"><span class="w">${word(h.w)}<span class="stg">${t('mot.attempt', { n: h.stage })}</span></span>
        <span class="pct" style="color:${barColor(h.s)}">${h.s}%</span>
        <span class="bar"><i style="width:${h.s}%;background:${barColor(h.s)}"></i></span></li>`).join('')}</ul>` : `<p class="muted">${t('mot.noHint')}</p>`;
      const sortedHints = v.hints.slice().reverse();
      let h = `<div class="banner">${t('mot.banner', { r: v.round })}${v.round === 2 ? t('mot.double') : ''}${v.phase !== 'pick' && v.phase !== 'end' ? t('mot.turn', { n: giverName, s: v.stage, t: v.stages }) : ''}</div>`;

      if (v.phase === 'pick') {
        if (v.myPick) h += `<div class="card"><p>${t('mot.yourSecret')} <b style="color:var(--gold)">${word(v.myPick)}</b></p><p class="muted">${t('waitOthers', { a: v.picked, b: v.total })}</p></div>`;
        else h += `<div class="card"><h2>${t('mot.pickTitle')}</h2><p class="muted">${t('mot.pickHelp')}</p>${langNote}
          <div class="choices" lang="${v.lang}">${v.myWords.map((w) => `<button class="chip" data-pick="${esc(w.w)}" ${w.used ? 'disabled' : ''}>${esc(w.w)}</button>`).join('')}</div></div>`;
      }

      if (v.phase === 'hint') {
        if (v.isGiver) {
          h += `<div class="card"><p>${t('mot.yourSecret')} <b style="color:var(--gold);font-size:1.2rem">${word(v.mySecret)}</b></p>
            <form id="hintForm" class="row"><input type="text" id="hintIn" class="grow" placeholder="${esc(t('mot.hintPh'))}" autocomplete="off" autocapitalize="off" maxlength="30" lang="${v.lang}" dir="auto">
            <button class="primary">${t('send')}</button></form>
            <p class="muted" style="margin-top:8px">${t('mot.hintCount', { a: v.stageHints, b: v.maxHints })}</p>
            ${v.stageHints ? `<button class="gold block" id="toGuess">${t('mot.toGuess')}</button>` : ''}</div>`;
        } else {
          h += `<div class="card"><p>${t('mot.giving', { n: giverName })}</p><p class="muted">${t('mot.watch')}</p></div>`;
        }
        h += `<div class="card"><h3>${t('mot.hints')}</h3>${hintList(sortedHints)}</div>`;
      }

      if (v.phase === 'guess') {
        if (v.isGiver) h += `<div class="card"><p>${t('mot.othersSearch', { w: word(v.mySecret) })}</p><p class="muted">${t('mot.answered', { a: v.guessed, b: v.guessTotal })}</p></div>`;
        else if (v.myGuess != null) h += `<div class="card"><p>${t('mot.yourGuess')} <b>${v.myGuess ? word(v.myGuess) : '—'}</b></p><p class="muted">${t('mot.answered', { a: v.guessed, b: v.guessTotal })}</p></div>`;
        else h += `<div class="card"><h2>${t('mot.guessTitle', { n: giverName })}</h2>
          <form id="guessForm" class="row"><input type="text" id="guessIn" class="grow" placeholder="${esc(t('mot.guessPh'))}" autocomplete="off" autocapitalize="off" maxlength="30" lang="${v.lang}" dir="auto">
          <button class="primary">${t('validate')}</button></form>
          <p class="muted" style="margin-top:8px">${t('mot.guessHelp', { p: v.stage * (v.round === 2 ? 2 : 1) })}</p></div>`;
        if (ui.isHost && v.guessed < v.guessTotal) h += `<button class="small ghost block" id="force" style="margin-top:8px">${t('mot.force')}</button>`;
        h += `<div class="card"><h3>${t('mot.hints')}</h3>${hintList(sortedHints)}</div>`;
      }

      if (v.phase === 'reveal') {
        const r = v.result;
        if (r.correct.length) h += `<div class="banner good">${t('mot.found', { n: r.correct.map((p) => esc(ui.name(p))).join(', '), p: r.pts })}</div>`;
        else h += `<div class="banner gold">${t('mot.notFound', { n: esc(ui.name(r.giver)), p: r.pts })}</div>`;
        if (r.secret) h += `<div class="card center"><div class="muted">${t('mot.wasWord')}</div><div style="font-size:1.8rem;font-weight:800;color:var(--gold)">${word(r.secret)}</div></div>`;
        h += `<div class="card"><h3>${t('mot.guesses')}</h3><table class="plays">${Object.entries(r.guesses).map(([p, w]) => `<tr><td>${esc(ui.name(p))}</td><td>${w ? word(w) : '<span class="muted">—</span>'} ${r.correct.includes(p) ? '✅' : ''}</td></tr>`).join('')}</table></div>`;
        if (ui.isHost || v.isGiver) h += `<button class="primary block" id="next" style="margin-top:12px">${r.done ? t('mot.nextPlayer') : t('mot.retry')}</button>`;
        else h += `<p class="muted center" style="margin-top:12px">${t('mot.waitNext')}</p>`;
      }

      if (v.phase === 'end') h += winnerCard(rows[0].name);
      h += `<div class="card"><h3>${t('scores')}</h3>${scoreList(rows, ui.me)}</div>`;
      el.innerHTML = h;

      el.querySelectorAll('[data-pick]').forEach((b) => { b.onclick = () => ui.send({ k: 'pick', w: b.dataset.pick }); });
      const hf = el.querySelector('#hintForm');
      if (hf) hf.onsubmit = (e) => { e.preventDefault(); const i = el.querySelector('#hintIn'); const w = i.value.trim(); i.value = ''; if (w) ui.send({ k: 'hint', w }); };
      const gf = el.querySelector('#guessForm');
      if (gf) gf.onsubmit = (e) => { e.preventDefault(); const i = el.querySelector('#guessIn'); const w = i.value.trim(); i.value = ''; ui.send({ k: 'guess', w }); };
      const tg = el.querySelector('#toGuess'); if (tg) tg.onclick = () => ui.send({ k: 'toGuess' });
      const fo = el.querySelector('#force'); if (fo) fo.onclick = () => ui.send({ k: 'force' });
      const nx = el.querySelector('#next'); if (nx) nx.onclick = () => ui.send({ k: 'next' });
    },
  });
})();
