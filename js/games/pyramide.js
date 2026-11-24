'use strict';
// PYRAMIDE : 10 tuiles (opération + chiffre). Trouve des combinaisons de 3 tuiles qui donnent la cible.

(() => {
  const LETTERS = 'ABCDEFGHIJ'.split('');
  const ROUNDS = 5;
  const OPS = ['+', '+', '−', '−', '×', '×', '÷'];

  function apply(v, op, n) {
    if (op === '+') return v + n;
    if (op === '−') return v - n;
    if (op === '×') return v * n;
    if (op === '÷') return v % n === 0 ? v / n : null;
    return null;
  }
  // Tuile 1 : on prend son chiffre. Tuiles 2 et 3 : on applique leur opération, de gauche à droite.
  function evalCombo(tiles, c) {
    let v = tiles[c[0]].n;
    for (let k = 1; k < 3; k++) { v = apply(v, tiles[c[k]].op, tiles[c[k]].n); if (v == null) return null; }
    return v;
  }
  function solutions(tiles, target) {
    const out = [];
    for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) for (let k = 0; k < 10; k++) {
      if (i === j || j === k || i === k) continue;
      if (evalCombo(tiles, [i, j, k]) === target) out.push(LETTERS[i] + LETTERS[j] + LETTERS[k]);
    }
    return out;
  }
  function newBoard() {
    for (let tries = 0; tries < 200; tries++) {
      const tiles = LETTERS.map(() => ({ op: pick(OPS), n: 1 + Math.floor(Math.random() * 9) }));
      const counts = {};
      for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) for (let k = 0; k < 10; k++) {
        if (i === j || j === k || i === k) continue;
        const v = evalCombo(tiles, [i, j, k]);
        if (v != null && v >= 1 && v <= 40) counts[v] = (counts[v] || 0) + 1;
      }
      const good = Object.keys(counts).filter((v) => counts[v] >= 2 && counts[v] <= 6);
      if (good.length) { const target = +pick(good); return { tiles, target, sols: solutions(tiles, target) }; }
    }
    return null;
  }
  const parse = (s) => String(s || '').toUpperCase().split('').map((ch) => LETTERS.indexOf(ch));

  addStrings({
    fr: {
      'py.found': '{n} trouvée(s)', 'py.target': 'Cible', 'py.help': 'Touche 3 tuiles dans l’ordre.', 'py.none': 'Plus rien !',
      'py.noneWin': '🎉 <b>{n}</b> a vu qu’il n’en restait plus : +3 !', 'py.all': 'Toutes les combinaisons', 'py.foundT': 'Trouvées', 'py.last': 'Dernières tentatives',
      'py.noneBad': '« Plus rien ! » ✗ −1', 'py.dup': '(déjà trouvée) ✗ −1', 'py.reveal': 'Terminer la manche et révéler', 'py.confirm': 'Tu es sûr qu’il n’y a plus de combinaison ? (+3 / −1)',
      'py.e.three': 'Choisis 3 tuiles différentes.',
    },
    en: {
      'py.found': '{n} found', 'py.target': 'Target', 'py.help': 'Tap 3 tiles in order.', 'py.none': 'None left!',
      'py.noneWin': '🎉 <b>{n}</b> saw there were none left: +3!', 'py.all': 'All combinations', 'py.foundT': 'Found', 'py.last': 'Latest tries',
      'py.noneBad': '“None left!” ✗ −1', 'py.dup': '(already found) ✗ −1', 'py.reveal': 'End the round and reveal', 'py.confirm': 'Are you sure there are no combinations left? (+3 / −1)',
      'py.e.three': 'Pick 3 different tiles.',
    },
    ar: {
      'py.found': 'وُجد {n}', 'py.target': 'الرقم المطلوب', 'py.help': 'المس 3 مربعات بالترتيب.', 'py.none': 'لا يوجد المزيد!',
      'py.noneWin': '🎉 <b>{n}</b> لاحظ أنه لم يبقَ أي حل: ‎+3!', 'py.all': 'كل التركيبات', 'py.foundT': 'التي وُجدت', 'py.last': 'آخر المحاولات',
      'py.noneBad': '«لا يوجد المزيد!» ✗ ‎−1', 'py.dup': '(وُجدت سابقًا) ✗ ‎−1', 'py.reveal': 'إنهاء الجولة وكشف الحلول', 'py.confirm': 'هل أنت متأكد أنه لم يبقَ أي حل؟ (‎+3 / ‎−1)',
      'py.e.three': 'اختر 3 مربعات مختلفة.',
    },
  });

  registerGame({
    id: 'pyramide',
    emoji: '🔺',
    min: 1,
    max: 10,

    init(players) {
      const scores = {};
      players.forEach((p) => { scores[p.pid] = 0; });
      const g = { players, scores, round: 1, phase: 'play', found: [], feed: [] };
      Object.assign(g, newBoard());
      return g;
    },

    act(g, pid, a, ctx, isHost) {
      if (a.k === 'claim' && g.phase === 'play') {
        const c = parse(a.c);
        if (c.length !== 3 || c.some((x) => x < 0) || new Set(c).size !== 3) return 'py.e.three';
        const code = c.map((x) => LETTERS[x]).join('');
        const v = evalCombo(g.tiles, c);
        const ok = v === g.target && !g.found.some((f) => f.code === code);
        g.scores[pid] += ok ? 1 : -1;
        if (ok) g.found.push({ code, by: pid });
        g.feed.unshift({ pid, code, ok, v, dup: v === g.target && !ok });
        g.feed = g.feed.slice(0, 8);
        return;
      }
      if (a.k === 'none' && g.phase === 'play') {
        const left = g.sols.filter((s) => !g.found.some((f) => f.code === s));
        if (!left.length) { g.scores[pid] += 3; g.endInfo = { by: pid, ok: true }; g.phase = 'roundEnd'; }
        else { g.scores[pid] -= 1; g.feed.unshift({ pid, none: true }); g.feed = g.feed.slice(0, 8); }
        return;
      }
      if (a.k === 'reveal' && g.phase === 'play' && isHost) { g.endInfo = { by: null }; g.phase = 'roundEnd'; return; }
      if (a.k === 'next' && g.phase === 'roundEnd' && isHost) {
        if (g.round >= ROUNDS) { g.phase = 'end'; return; }
        g.round += 1; g.found = []; g.feed = []; g.endInfo = null;
        Object.assign(g, newBoard());
        g.phase = 'play';
      }
    },

    view(g) {
      return {
        phase: g.phase, round: g.round, rounds: ROUNDS, tiles: g.tiles, target: g.target,
        found: g.found, feed: g.feed, scores: g.scores, players: g.players,
        endInfo: g.endInfo || null,
        allSols: g.phase !== 'play' ? g.sols : null,
      };
    },

    // Joueur virtuel : trouve une combinaison de temps en temps (et se trompe parfois).
    bot(v, mem) {
      if (v.phase !== 'play') return null;
      if (mem.round !== v.round) { mem.round = v.round; mem.next = Date.now() + rand(6000, 13000); }
      if (Date.now() < mem.next) return null;
      mem.next = Date.now() + rand(7000, 15000);
      const found = new Set(v.found.map((f) => f.code));
      const left = solutions(v.tiles, v.target).filter((s) => !found.has(s));
      if (!left.length) return chance(0.7) ? { k: 'none' } : null;
      if (chance(0.12)) return { k: 'claim', c: shuffle(LETTERS).slice(0, 3).join('') };
      return { k: 'claim', c: pick(left) };
    },

    render(el, v, ui) {
      const key = v.round + v.phase;
      if (!el._st || el._st.key !== key) el._st = { key, sel: [] };
      const st = el._st;
      const tile = (i) => {
        const tl = v.tiles[i], L = LETTERS[i];
        const pos = st.sel.indexOf(i);
        return `<button class="ptile ${pos >= 0 ? 'sel' : ''}" data-t="${i}" ${v.phase !== 'play' ? 'disabled' : ''}>
          <small>${L}</small><b>${tl.op}${tl.n}</b>${pos >= 0 ? `<i>${pos + 1}</i>` : ''}</button>`;
      };
      const rowsIdx = [[0], [1, 2], [3, 4, 5], [6, 7, 8, 9]];
      const preview = st.sel.length ? (() => {
        const [x, y, z] = st.sel.map((i) => v.tiles[i]);
        let s = `${x.n}`;
        if (y) s = `${s} ${y.op} ${y.n}`;
        if (z) s = `(${s}) ${z.op} ${z.n}`;
        const val = st.sel.length === 3 ? evalCombo(v.tiles, st.sel) : null;
        return `${st.sel.map((i) => LETTERS[i]).join(' ')} : ${s}${st.sel.length === 3 ? ` = <b>${val == null ? '✗' : val}</b>` : ''}`;
      })() : t('py.help');

      let h = `<div class="banner">${t('round', { a: `<b>${v.round}</b>`, b: v.rounds })} · ${t('py.found', { n: v.found.length })}</div>
        <div class="card center"><div class="muted">${t('py.target')}</div><div style="font-size:3rem;font-weight:900;color:var(--gold);line-height:1">${v.target}</div>
        <div class="pyr" dir="ltr">${rowsIdx.map((r) => `<div class="prow">${r.map(tile).join('')}</div>`).join('')}</div>`;
      if (v.phase === 'play') {
        h += `<p style="min-height:1.5em" dir="ltr">${preview}</p>
          <div class="row"><button class="ghost small" id="clr">${t('clear')}</button><button class="primary grow" id="ok" ${st.sel.length === 3 ? '' : 'disabled'}>${t('validate')}</button></div>
          <button class="gold block" id="none" style="margin-top:8px">${t('py.none')}</button>`;
      }
      h += '</div>';

      if (v.phase === 'roundEnd' || v.phase === 'end') {
        const E = v.endInfo;
        if (E && E.by) h += `<div class="banner good">${t('py.noneWin', { n: esc(ui.name(E.by)) })}</div>`;
        const foundCodes = v.found.map((f) => f.code);
        h += `<div class="card"><h3>${t('py.all')}</h3><div class="choices" dir="ltr">${v.allSols.map((s) => `<span class="chip ${foundCodes.includes(s) ? 'sel' : ''}">${s}</span>`).join('')}</div></div>`;
        if (v.phase === 'roundEnd') h += ui.isHost ? `<button class="primary block" id="next" style="margin-top:12px">${v.round >= v.rounds ? t('finalResult') : t('nextRound')}</button>` : waitHostP();
      }
      if (v.phase === 'play' && v.found.length) h += `<div class="card"><h3>${t('py.foundT')}</h3><div class="choices">${v.found.map((f) => `<span class="chip sel"><bdi>${f.code}</bdi> <span class="muted">${esc(ui.name(f.by))}</span></span>`).join('')}</div></div>`;
      if (v.phase === 'play' && v.feed.length) h += `<div class="card"><h3>${t('py.last')}</h3><table class="plays">${v.feed.map((f) => `<tr><td>${esc(ui.name(f.pid))}</td><td>${f.none ? t('py.noneBad') : `<bdi>${f.code}</bdi> ${f.ok ? '✅ +1' : f.dup ? t('py.dup') : `<bdi>= ${f.v == null ? '✗' : f.v}</bdi> ✗ −1`}`}</td></tr>`).join('')}</table></div>`;
      if (v.phase === 'play' && ui.isHost) h += `<button class="small ghost block" id="reveal" style="margin-top:8px">${t('py.reveal')}</button>`;

      const rows = ranking(v.scores, v.players);
      if (v.phase === 'end') h += winnerCard(rows[0].name);
      h += `<div class="card"><h3>${t('scores')}</h3>${scoreList(rows, ui.me)}</div>`;
      el.innerHTML = h;

      el.querySelectorAll('[data-t]').forEach((b) => {
        b.onclick = () => {
          const i = +b.dataset.t, p = st.sel.indexOf(i);
          if (p >= 0) st.sel.splice(p, 1); else if (st.sel.length < 3) st.sel.push(i);
          this.render(el, v, ui);
        };
      });
      const on = (id, fn) => { const b = el.querySelector('#' + id); if (b) b.onclick = fn; };
      on('clr', () => { st.sel = []; this.render(el, v, ui); });
      on('ok', () => { const c = st.sel.map((i) => LETTERS[i]).join(''); st.sel = []; ui.send({ k: 'claim', c }); this.render(el, v, ui); });
      on('none', () => { if (confirm(t('py.confirm'))) ui.send({ k: 'none' }); });
      on('reveal', () => ui.send({ k: 'reveal' }));
      on('next', () => ui.send({ k: 'next' }));
    },
  });
})();
