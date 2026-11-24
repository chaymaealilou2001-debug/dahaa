'use strict';
// Moteur de proximité pour « Le Mot Secret », en français, anglais et arabe.
// Pas d'IA : chaque mot secret a une liste de mots proches avec un taux de proximité (0–100)
// (fichiers words-fr.js, words-en.js, words-ar.js).
// Pour un mot absent de la liste, on estime la proximité en passant par un mot commun
// (ex. « surf » est proche de « plage », et « plage » est proche de « mer »).

const WORDS = (() => {
  const RAWS = { fr: RAW_FR, en: RAW_EN, ar: RAW_AR };

  // Nettoyage de l'écriture, propre à chaque langue, pour comparer les mots.
  const stripPlural = (s) => s.split(' ').map((w) => (w.length > 3 && /[sx]$/.test(w) ? w.slice(0, -1) : w)).join(' ');
  const NORM = {
    fr(s) {
      s = String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/œ/g, 'oe').replace(/æ/g, 'ae')
        .replace(/[’'\-]/g, ' ').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
      return stripPlural(s.replace(/^(le|la|les|un|une|des|l|du|de|d) /, ''));
    },
    en(s) {
      s = String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[’'\-]/g, ' ').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
      // pluriels anglais : beaches → beach, stories → story, cats → cat
      return s.replace(/^(the|a|an) /, '').split(' ').map((w) => {
        if (w.length > 4 && /ies$/.test(w)) return w.slice(0, -3) + 'y';
        if (w.length > 4 && /(ch|sh|x|ss|z)es$/.test(w)) return w.slice(0, -2);
        return w.length > 3 && /s$/.test(w) && !/ss$/.test(w) ? w.slice(0, -1) : w;
      }).join(' ');
    },
    ar(s) {
      s = String(s || '').replace(/[ً-ْٰـ]/g, '') // voyelles courtes et tatweel
        .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/ء/g, '')
        .replace(/[^ء-ي0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
      // « ال » au début de chaque mot (si le mot reste assez long)
      return s.split(' ').map((w) => (w.length > 3 && w.startsWith('ال') ? w.slice(2) : w)).join(' ');
    },
  };

  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  const parse = (line) => line.split('|').map((e) => { const m = e.trim().match(/^(.*\S)\s+(\d+)$/); return m ? [m[1], +m[2]] : null; }).filter(Boolean);

  function build(lang) {
    const RAW = RAWS[lang], norm = NORM[lang];
    const T = {};
    for (const k in RAW) {
      const nk = norm(k);
      T[nk] = {};
      parse(RAW[k]).forEach(([w, s]) => { const nw = norm(w); T[nk][nw] = Math.max(T[nk][nw] || 0, s); });
    }

    // Proximité entre le mot secret et un indice, de 0 à 100.
    function similarity(secret, word) {
      const a = norm(secret), b = norm(word);
      if (!a || !b) return 0;
      if (a === b) return 100;
      let s = null;
      const d1 = T[a] && T[a][b], d2 = T[b] && T[b][a];
      if (d1 != null || d2 != null) s = Math.max(d1 || 0, d2 || 0);
      if (s == null) {
        // passage par un mot commun
        let best = 0;
        for (const x in T) {
          const xa = x === a ? null : T[x][a] != null ? T[x][a] : (T[a] && T[a][x]);
          const xb = x === b ? null : T[x][b];
          if (xa != null && xb != null) best = Math.max(best, Math.round((xa * xb) / 100 * 0.62));
        }
        if (T[a]) for (const n in T[a]) { if (T[b] && T[b][n] != null) best = Math.max(best, Math.round(Math.min(T[a][n], T[b][n]) * 0.55)); }
        if (best) s = Math.min(best, 58);
      }
      if (s == null) s = 3 + (hash(a + '|' + b) % 20);
      return Math.max(0, Math.min(99, s));
    }

    // Mots proches d'un mot secret (pour les joueurs virtuels) : [[mot, %], …]
    function neighbors(secret) {
      const k = Object.keys(RAW).find((x) => norm(x) === norm(secret));
      return k ? parse(RAW[k]) : [];
    }

    return { lang, secrets: Object.keys(RAW), neighbors, norm, similarity, same: (x, y) => norm(x) === norm(y) };
  }

  const cache = {};
  const forLang = (l) => (cache[RAWS[l] ? l : 'fr'] = cache[RAWS[l] ? l : 'fr'] || build(RAWS[l] ? l : 'fr'));
  return { forLang };
})();
