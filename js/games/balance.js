'use strict';
// BALANCE 13 : 3 balances. Chacun pose en secret un poids sur une balance.
// Une balance qui atteint 13 casse : tous ceux qui y ont posé un poids à ce tour prennent une pénalité.

(() => {
  const HAND = [0, 1, 2, 3, 4, 5];
  const ROUNDS = 12, BREAK = 13;
  const NAMES = ['A', 'B', 'C'];
  const meterColor = (x) => (x >= 10 ? 'var(--red)' : x >= 7 ? 'var(--gold)' : 'var(--green)');

  addStrings({
    fr: {
      'bl.turn': 'Tour <b>{a}</b>/{b} · casse à <b>{n}</b>', 'bl.scale': 'Balance {n}', 'bl.placed': 'Tu poses <b>{w}</b> sur la balance <b>{s}</b>.',
      'bl.choose': 'Choisis un poids, puis une balance', 'bl.put': 'Poser {w} sur {s}', 'bl.pick': 'Choisis un poids et une balance',
      'bl.pen': '💥 Pénalités : {l}', 'bl.noBreak': 'Aucune balance n’a cassé.', 'bl.weights': 'Poids posés', 'bl.on': '{w} sur <b>{s}</b>',
      'bl.nextTurn': 'Tour suivant', 'bl.yours': 'Tes poids', 'bl.pens': 'Pénalités',
    },
    en: {
      'bl.turn': 'Turn <b>{a}</b>/{b} · breaks at <b>{n}</b>', 'bl.scale': 'Scale {n}', 'bl.placed': 'You put <b>{w}</b> on scale <b>{s}</b>.',
      'bl.choose': 'Choose a weight, then a scale', 'bl.put': 'Put {w} on {s}', 'bl.pick': 'Choose a weight and a scale',
      'bl.pen': '💥 Penalties: {l}', 'bl.noBreak': 'No scale broke.', 'bl.weights': 'Weights placed', 'bl.on': '{w} on <b>{s}</b>',
      'bl.nextTurn': 'Next turn', 'bl.yours': 'Your weights', 'bl.pens': 'Penalties',
    },
    ar: {
      'bl.turn': 'الدور <b>{a}</b>/{b} · ينكسر عند <b>{n}</b>', 'bl.scale': 'الميزان {n}', 'bl.placed': 'تضع <b>{w}</b> على الميزان <b>{s}</b>.',
      'bl.choose': 'اختر وزنًا ثم ميزانًا', 'bl.put': 'ضع {w} على {s}', 'bl.pick': 'اختر وزنًا وميزانًا',
      'bl.pen': '💥 العقوبات: {l}', 'bl.noBreak': 'لم ينكسر أي ميزان.', 'bl.weights': 'الأوزان الموضوعة', 'bl.on': '{w} على <b>{s}</b>',
      'bl.nextTurn': 'الدور التالي', 'bl.yours': 'أوزانك', 'bl.pens': 'العقوبات',
    },
  });

  registerGame({
    id: 'balance',
    emoji: '⚖️',
    min: 2,
    max: 8,

    init(players) {
      const hands = {}, pen = {};
      players.forEach((p) => { hands[p.pid] = HAND.slice(); pen[p.pid] = 0; });
      return { players, hands, pen, scales: [0, 0, 0], round: 1, phase: 'choose', choices: {}, last: null };
    },

    act(g, pid, a, ctx, isHost) {
      const ids = g.players.map((p) => p.pid);
      const resolve = () => {
        const add = [0, 0, 0], on = [[], [], []];
        ids.forEach((p) => { const c = g.choices[p]; add[c.s] += c.w; on[c.s].push(p); g.hands[p] = g.hands[p].filter((x, i, arr) => i !== arr.indexOf(c.w)); if (!g.hands[p].length) g.hands[p] = HAND.slice(); });
        const before = g.scales.slice();
        const broke = [];
        const penalties = {};
        g.scales = g.scales.map((x, s) => {
          const nx = x + add[s];
          if (nx < BREAK) return nx;
          broke.push(s);
          const heavy = Math.max(...on[s].map((p) => g.choices[p].w));
          const heavies = on[s].filter((p) => g.choices[p].w === heavy);
          on[s].forEach((p) => { g.pen[p] += 1; penalties[p] = (penalties[p] || 0) + 1; });
          if (heavies.length === 1) { g.pen[heavies[0]] += 1; penalties[heavies[0]] += 1; }
          return 0;
        });
        g.last = { before, add, broke, choices: { ...g.choices }, penalties, after: g.scales.slice() };
        g.phase = 'result';
      };

      if (a.k === 'choose' && g.phase === 'choose' && !g.choices[pid]) {
        const w = +a.w, s = +a.s;
        if (!g.hands[pid].includes(w) || !(s >= 0 && s < 3)) return;
        g.choices[pid] = { w, s };
        if (ids.every((p) => g.choices[p])) resolve();
        return;
      }
      if (a.k === 'force' && g.phase === 'choose' && isHost) {
        ids.forEach((p) => { if (!g.choices[p]) g.choices[p] = { w: pick(g.hands[p]), s: Math.floor(Math.random() * 3) }; });
        resolve();
        return;
      }
      if (a.k === 'next' && g.phase === 'result' && isHost) {
        if (g.round >= ROUNDS) { g.phase = 'end'; return; }
        g.round += 1; g.choices = {}; g.phase = 'choose';
      }
    },

    view(g, pid) {
      const ids = g.players.map((p) => p.pid);
      return {
        phase: g.phase, round: g.round, rounds: ROUNDS, scales: g.scales,
        hand: g.hands[pid], myChoice: g.choices[pid] || null,
        done: ids.filter((p) => g.choices[p]).length, total: ids.length,
        last: g.phase !== 'choose' ? g.last : null, pen: g.pen, players: g.players,
      };
    },

    // Joueur virtuel : vise la balance la plus légère, pose lourd seulement si c'est sans risque.
    bot(v, mem) {
      if (v.phase !== 'choose' || v.myChoice) return null;
      if (!think(mem, 'c' + v.round, 1000, 2500)) return null;
      const safe = v.scales.map((x, s) => ({ x, s })).sort((a, b) => a.x - b.x)[0];
      const others = ((v.players.length - 1) * 2.5) / 3;
      const h = v.hand.slice().sort((a, b) => a - b);
      const w = safe.x + others + h[h.length - 1] < BREAK ? h[h.length - 1] : h[0];
      return { k: 'choose', w, s: chance(0.8) ? safe.s : Math.floor(Math.random() * 3) };
    },

    render(el, v, ui) {
      const key = v.round + v.phase;
      if (!el._st || el._st.key !== key) el._st = { key, w: null, s: null };
      const st = el._st;
      const L = v.last;
      const scaleBox = (x, s, extra = '') => `<div class="scale ${extra}" ${v.phase === 'choose' && !v.myChoice ? `data-s="${s}" role="button"` : ''}>
        <div class="muted">${t('bl.scale', { n: NAMES[s] })}</div><div class="sv" style="color:${meterColor(x)}">${x}</div>
        <div class="meter"><i style="width:${Math.min(100, (x / BREAK) * 100)}%;background:${meterColor(x)}"></i></div></div>`;

      let h = `<div class="banner">${t('bl.turn', { a: v.round, b: v.rounds, n: BREAK })}</div>`;

      if (v.phase === 'choose') {
        h += `<div class="scales" dir="ltr">${v.scales.map((x, s) => scaleBox(x, s, st.s === s || (v.myChoice && v.myChoice.s === s) ? 'sel' : '')).join('')}</div>`;
        if (v.myChoice) h += `<div class="card center"><p>${t('bl.placed', { w: v.myChoice.w, s: NAMES[v.myChoice.s] })}</p><p class="muted">${t('waitOthers', { a: v.done, b: v.total })}</p></div>`;
        else h += `<div class="card center"><h3>${t('bl.choose')}</h3>
          <div class="cards" dir="ltr">${v.hand.map((w, i) => `<button class="ncard ${st.w === w ? 'sel' : ''}" data-w="${w}" data-i="${i}">${w}</button>`).join('')}</div>
          <button class="primary block" id="ok" ${st.w != null && st.s != null ? '' : 'disabled'}>${st.w != null && st.s != null ? t('bl.put', { w: st.w, s: NAMES[st.s] }) : t('bl.pick')}</button></div>`;
        if (ui.isHost && v.done < v.total) h += `<button class="small ghost block" id="force" style="margin-top:8px">${t('forceRandom')}</button>`;
      }

      if (L && v.phase !== 'choose') {
        h += `<div class="scales" dir="ltr">${[0, 1, 2].map((s) => `<div class="scale ${L.broke.includes(s) ? 'broke' : ''}"><div class="muted">${t('bl.scale', { n: NAMES[s] })}</div>
          <div>${L.before[s]} + ${L.add[s]}</div><div class="sv">${L.broke.includes(s) ? '💥' : L.after[s]}</div></div>`).join('')}</div>`;
        const pens = Object.entries(L.penalties);
        h += pens.length
          ? `<div class="banner bad">${t('bl.pen', { l: pens.map(([p, n]) => `<b>${esc(ui.name(p))}</b> +${n}`).join(', ') })}</div>`
          : `<div class="banner good">${t('bl.noBreak')}</div>`;
        h += `<div class="card"><h3>${t('bl.weights')}</h3><table class="plays">${Object.entries(L.choices).sort((a, b) => a[1].s - b[1].s || b[1].w - a[1].w).map(([p, c]) => `<tr><td>${esc(ui.name(p))}</td><td>${t('bl.on', { w: c.w, s: NAMES[c.s] })}${L.broke.includes(c.s) ? ' 💥' : ''}</td></tr>`).join('')}</table></div>`;
        if (v.phase === 'result') h += ui.isHost ? `<button class="primary block" id="next" style="margin-top:12px">${v.round >= v.rounds ? t('finalResult') : t('bl.nextTurn')}</button>` : waitHostP();
      }

      // moins de pénalités = meilleur : on trie à l'envers
      const rows = v.players.map((p) => ({ pid: p.pid, name: p.name, score: v.pen[p.pid] })).sort((a, b) => a.score - b.score);
      if (v.phase === 'end') h += winnerCard(rows[0].name);
      if (v.phase !== 'choose') h += `<div class="card"><h3>${t('bl.yours')}</h3><div class="cards" dir="ltr">${v.hand.map((w) => `<span class="ncard mini" style="display:inline-grid">${w}</span>`).join('')}</div></div>`;
      h += `<div class="card"><h3>${t('bl.pens')}</h3><ul class="scores">${rows.map((r, i) => `<li class="${r.pid === ui.me ? 'me' : ''} ${i === 0 ? 'first' : ''}"><span>${esc(r.name)}</span><span class="pts">${r.score} 💥</span></li>`).join('')}</ul></div>`;
      el.innerHTML = h;

      el.querySelectorAll('[data-w]').forEach((b) => { b.onclick = () => { st.w = +b.dataset.w; this.render(el, v, ui); }; });
      el.querySelectorAll('[data-s]').forEach((b) => { b.onclick = () => { st.s = +b.dataset.s; this.render(el, v, ui); }; });
      const on = (id, fn) => { const b = el.querySelector('#' + id); if (b) b.onclick = fn; };
      on('ok', () => ui.send({ k: 'choose', w: st.w, s: st.s }));
      on('force', () => ui.send({ k: 'force' }));
      on('next', () => ui.send({ k: 'next' }));
    },
  });
})();
