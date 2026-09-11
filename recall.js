// recall.js - the daily three (LD-13, Sep 2026)
// One law, shared by the front door and the Learning Diary shelf:
//   - seeded by the date, so the same three hold all day on every device
//   - three DIFFERENT categories, drawn with weight by size
//   - within a category, the learning least recently recalled (never-recalled first),
//     then fewest recalls, ties broken by a seeded shuffle - nothing repeats while
//     anything still waits
//   - retired learnings (recall_off) leave the rotation
// Today's picks are kept on the device (localStorage) so marking one Recalled
// does not swap it out mid-day; Shuffle draws three more, excluding all shown today.
(function (global) {
  'use strict';
  const KEY = 'myday_recall_today';

  function hash32(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }
  function rng(seed) { let a = hash32(seed) || 1; return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function cats(r) { return String(r.category || '').split(',').map(s => s.trim()).filter(Boolean); }
  function today() { return new Date().toISOString().slice(0, 10); }

  // rows: [{ id, title, category, learned_on, recall_count, recalled_on, recall_off }]
  // exclude: ids not to draw (shown earlier today). Returns up to three rows, each tagged with the category it was drawn for.
  function draw(rows, seed, exclude) {
    const ex = new Set((exclude || []).map(String));
    const eligible = rows.filter(r => !r.recall_off && !ex.has(String(r.id)));
    const byCat = {};
    eligible.forEach(r => cats(r).forEach(c => { (byCat[c] = byCat[c] || []).push(r); }));
    const names = Object.keys(byCat);
    if (names.length < 3) return [];
    const rand = rng(seed);
    const picked = [], usedIds = new Set(), usedCats = new Set();
    for (let k = 0; k < 3; k++) {
      // weighted by size among categories not yet used that still have a candidate
      const pool = names.filter(c => !usedCats.has(c) && byCat[c].some(r => !usedIds.has(String(r.id))));
      if (!pool.length) break;
      const total = pool.reduce((s, c) => s + byCat[c].length, 0);
      let x = rand() * total, cat = pool[pool.length - 1];
      for (const c of pool) { x -= byCat[c].length; if (x <= 0) { cat = c; break; } }
      const cand = byCat[cat].filter(r => !usedIds.has(String(r.id)));
      cand.sort((a, b) => {
        const la = a.recalled_on || '', lb = b.recalled_on || '';
        if (la !== lb) return la < lb ? -1 : 1;                                   // never / longest ago first
        const na = Number(a.recall_count) || 0, nb = Number(b.recall_count) || 0;
        if (na !== nb) return na - nb;
        return hash32(seed + '|' + a.id) - hash32(seed + '|' + b.id);            // seeded tie-break
      });
      const r = cand[0];
      picked.push(Object.assign({}, r, { forCat: cat }));
      usedIds.add(String(r.id)); usedCats.add(cat);
    }
    return picked;
  }

  // Where today's picks are kept: the ACCOUNT (user_prefs.prefs.recall_today) so phone and
  // desktop show the same three; the device keeps a copy for the moment before prefs load.
  let store = null;   // { load: async () => obj|null, save: async (obj) => {} } - set by the page
  function setStore(s) { store = s; }
  function readCache() { try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); return s && s.date === today() ? s : null; } catch (e) { return null; } }
  function writeCache(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  async function readToday() {
    let s = null;
    if (store) { try { s = await store.load(); } catch (e) { s = null; } }
    if (!(s && s.date === today())) s = readCache();
    return s && s.date === today() ? s : null;
  }
  async function writeToday(s) { writeCache(s); if (store) { try { await store.save(s); } catch (e) {} } }
  function fromState(rows, s) {
    const byId = {}; rows.forEach(r => { byId[String(r.id)] = r; });
    if (!(s && s.ids && s.ids.length === 3 && s.ids.every(id => byId[id] && !byId[id].recall_off))) return null;
    return s.ids.map((id, i) => Object.assign({}, byId[id], { forCat: (s.cats || [])[i] || cats(byId[id])[0] || '' }));
  }
  // The day's three: kept once drawn; re-drawn only when a pick vanished (deleted / retired).
  async function todays(rows) {
    let s = await readToday();
    const held = fromState(rows, s);
    if (held) return held;
    const shown = s && s.shown ? s.shown : [];
    const picked = draw(rows, today() + '#' + (s ? (s.n || 0) : 0), shown);
    if (picked.length < 3) return [];
    s = { date: today(), n: s ? (s.n || 0) : 0, ids: picked.map(r => String(r.id)), cats: picked.map(r => r.forCat), shown: shown.concat(picked.map(r => String(r.id))) };
    await writeToday(s);
    return picked;
  }
  // Shuffle: three more, none shown today; wraps to a fresh sweep when everything eligible was shown.
  async function shuffle(rows) {
    const s = (await readToday()) || { date: today(), n: 0, ids: [], cats: [], shown: [] };
    let picked = draw(rows, today() + '#' + (s.n + 1), s.shown);
    let shown = s.shown;
    if (picked.length < 3) { shown = []; picked = draw(rows, today() + '#' + (s.n + 1), []); }
    if (picked.length < 3) return [];
    await writeToday({ date: today(), n: s.n + 1, ids: picked.map(r => String(r.id)), cats: picked.map(r => r.forCat), shown: shown.concat(picked.map(r => String(r.id))) });
    return picked;
  }
  // a prefs-backed store any page can hand over: reads prefs.recall_today, writes it back merged
  function prefsStore(supa, userId) {
    return {
      load: async () => { const q = await supa.from('user_prefs').select('prefs').eq('user_id', userId).maybeSingle(); return q && q.data && q.data.prefs ? (q.data.prefs.recall_today || null) : null; },
      save: async (obj) => {
        const q = await supa.from('user_prefs').select('prefs').eq('user_id', userId).maybeSingle();
        const prefs = Object.assign({}, (q && q.data && q.data.prefs) || {}, { recall_today: obj });
        await supa.from('user_prefs').upsert({ user_id: userId, prefs, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      }
    };
  }
  function ago(iso) {
    if (!iso) return '';
    const d = Math.round((Date.now() - new Date(String(iso).slice(0, 10) + 'T00:00:00').getTime()) / 86400000);
    if (d <= 0) return 'TODAY'; if (d === 1) return 'YESTERDAY'; if (d < 30) return d + ' DAYS AGO';
    const m = Math.round(d / 30.44); if (m < 12) return m + (m === 1 ? ' MONTH AGO' : ' MONTHS AGO');
    const y = Math.round(m / 12 * 10) / 10; return (y === 1 ? '1 YEAR AGO' : y + ' YEARS AGO');
  }
  function recalledLine(r) {
    const n = Number(r.recall_count) || 0;
    if (!n) return 'NEVER RECALLED';
    const last = r.recalled_on ? String(r.recalled_on).slice(0, 10) : '';
    const t = last ? new Date(last + 'T00:00:00') : null;
    const M = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    return (last === today() ? 'RECALLED TODAY' : 'RECALLED ' + (n === 1 ? 'ONCE' : n + ' TIMES') + (t && !isNaN(t) ? ' \u00B7 LAST ' + M[t.getMonth()] + ' ' + t.getFullYear() : ''));
  }
  global.MyRecall = { draw, todays, shuffle, ago, recalledLine, cats, today, KEY, setStore, prefsStore };
})(window);
