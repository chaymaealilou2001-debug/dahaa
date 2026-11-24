'use strict';
// Outils partagés par l'appli et les jeux.

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* stockage indisponible */ } },
};
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a) => a[Math.floor(Math.random() * a.length)];

// ---------- Langues (français par défaut, arabe, anglais) ----------
const LANGS = { fr: 'Français', ar: 'العربية', en: 'English' };
const I18N = { lang: LS.get('dahaa.lang', 'fr'), dict: { fr: {}, en: {}, ar: {} } };
if (!LANGS[I18N.lang]) I18N.lang = 'fr';

// Ajoute des textes : { fr: {clé: texte}, en: {...}, ar: {...} }
function addStrings(obj) { for (const l in obj) Object.assign(I18N.dict[l], obj[l]); }

// Traduit une clé. Les {param} sont remplacés (à échapper avant si ce sont des noms).
// Un texte peut aussi être une fonction (pour les pluriels).
function t(key, p = {}) {
  let s = I18N.dict[I18N.lang][key];
  if (s == null) s = I18N.dict.fr[key];
  if (s == null) return key;
  if (typeof s === 'function') return s(p);
  return s.replace(/\{(\w+)\}/g, (m, k) => (p[k] != null ? p[k] : m));
}

function setLang(l) {
  if (!LANGS[l]) return;
  I18N.lang = l;
  LS.set('dahaa.lang', l);
  applyLang();
}
function applyLang() {
  document.documentElement.lang = I18N.lang;
  document.documentElement.dir = I18N.lang === 'ar' ? 'rtl' : 'ltr';
}
applyLang();

// Nom et description d'un jeu dans la langue choisie
const gName = (id) => t(id + '.name');
const gShort = (id) => t(id + '.short');

// Registre des jeux. Chaque jeu fournit :
//  id, name, emoji, short, min, max, rules (HTML)
//  init(players, ctx) -> état   (côté hôte)
//  act(state, pid, action, ctx) (côté hôte)
//  view(state, pid) -> ce que voit ce joueur (côté hôte)
//  render(el, view, ui)         (côté de chaque téléphone)
const GAMES = {};
function registerGame(g) { GAMES[g.id] = g; }

// Classement générique à partir d'un objet {pid: score}
function ranking(scores, players, tiebreak) {
  return players
    .map((p) => ({ pid: p.pid, name: p.name, score: scores[p.pid] || 0, tb: tiebreak ? tiebreak[p.pid] || 0 : 0 }))
    .sort((a, b) => b.score - a.score || b.tb - a.tb);
}

const winnerCard = (name, sub) => `<div class="card center"><div class="muted">${sub || t('winner')}</div><div style="font-size:1.8rem;font-weight:800;color:var(--gold)">🏆 ${esc(name)}</div></div>`;
const waitHostP = () => `<p class="muted center" style="margin-top:12px">${t('waitHost')}</p>`;

function scoreList(rows, me, unit = t('pts'), extra) {
  const top = rows.length ? rows[0].score : 0;
  return `<ul class="scores">${rows.map((r) => `<li class="${r.pid === me ? 'me' : ''} ${r.score === top && top > 0 ? 'first' : ''}">
    <span>${esc(r.name)}${extra ? ` <span class="muted">${extra(r)}</span>` : ''}</span><span class="pts">${r.score} ${unit}</span></li>`).join('')}</ul>`;
}
