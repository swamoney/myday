/* MyDay - the thinking board (DC-S, Sep 2026).
   The Whiteboard's stickies as a small shared kit, mountable on any page.
   Notes live in wip_notes; 'scope' says which page owns them (null = the
   Whiteboard itself, 'decision:ID' = a checklist page, and so on). */
(function () {
  'use strict';

  const STICKY = [
    { bg: '#cfe0f7', head: '#2c477e' }, { bg: '#cfe9d8', head: '#2f6146' },
    { bg: '#f7e6c2', head: '#8a5e22' }, { bg: '#e6d3ee', head: '#6b4a7a' }, { bg: '#f7d6d2', head: '#8f3a34' },
  ];
  let supa = null, userId = null;
  const boards = {};        // hostId -> state
  const timers = {};        // noteId -> debounce timer

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function foldKey(scope) { return 'myday_board_fold:' + scope; }

  async function load(st) {
    const { data, error } = await supa.from('wip_notes').select('*')
      .eq('user_id', userId).eq('scope', st.scope)
      .order('sort_order', { ascending: true }).order('created_at', { ascending: true });
    if (error) throw error;
    st.notes = data || [];
  }

  function render(st) {
    const host = st.host;
    const folded = localStorage.getItem(foldKey(st.scope)) === '1';
    const empty = !st.notes.length;
    let h = '';
    if (!empty || !st.readOnly) {
      h += '<div class="tb-h">' + esc(st.title || 'THINKING BOARD') +
        (empty ? '' : '<button type="button" class="tb-fold" data-tb-fold>' + (folded ? '\u25B8 unfold' : '\u25BE fold') + '</button>') + '</div>';
    }
    h += '<div class="tb-board' + (folded && !empty ? ' folded' : '') + '">';
    st.notes.forEach((n, i) => {
      const c = STICKY[(n.color_index != null ? n.color_index : i) % STICKY.length];
      h += '<div class="tb-st" style="background:' + c.bg + ';">' +
        (st.readOnly
          ? '<div class="tb-hd" style="color:' + c.head + ';">' + esc(n.heading || '') + '</div><div class="tb-bd">' + esc(n.body || '') + '</div>'
          : '<input class="tb-hd" data-tb-h="' + esc(n.id) + '" style="color:' + c.head + ';" value="' + esc(n.heading || '') + '" placeholder="title\u2026">' +
            '<textarea class="tb-bd" data-tb-t="' + esc(n.id) + '" placeholder="think out loud\u2026">' + esc(n.body || '') + '</textarea>' +
            '<button type="button" class="tb-x" data-tb-x="' + esc(n.id) + '" title="Remove">\u00D7</button>') +
        '</div>';
    });
    if (!st.readOnly) {
      h += '<button type="button" class="tb-st add' + (empty ? ' wide' : '') + '" data-tb-add>\uFF0B ' +
        (empty ? 'PIN A NOTE TO THINK OUT LOUD' : 'PIN A NOTE') + '</button>';
    }
    h += '</div>';
    host.innerHTML = h;
    host.classList.toggle('tb-empty', empty && st.readOnly);
    wire(st);
  }

  function wire(st) {
    const host = st.host;
    const fold = host.querySelector('[data-tb-fold]');
    if (fold) fold.addEventListener('click', () => {
      const now = localStorage.getItem(foldKey(st.scope)) === '1';
      localStorage.setItem(foldKey(st.scope), now ? '0' : '1');
      render(st);
    });
    const add = host.querySelector('[data-tb-add]');
    if (add) add.addEventListener('click', async () => {
      const maxSort = st.notes.reduce((m, n) => Math.max(m, n.sort_order || 0), 0);
      const rec = { user_id: userId, scope: st.scope, heading: '', body: '',
        color_index: st.notes.length % STICKY.length, sort_order: maxSort + 1, updated_at: new Date().toISOString() };
      try {
        const { data, error } = await supa.from('wip_notes').insert(rec).select();
        if (error) throw error;
        st.notes.push(data[0]);
        localStorage.setItem(foldKey(st.scope), '0');
        render(st);
        const inp = host.querySelector('[data-tb-h="' + data[0].id + '"]'); if (inp) inp.focus();
      } catch (e) { toast('Could not pin the note'); }
    });
    host.querySelectorAll('[data-tb-h]').forEach(inp => inp.addEventListener('input', () => save(st, inp.dataset.tbH, { heading: inp.value })));
    host.querySelectorAll('[data-tb-t]').forEach(ta => ta.addEventListener('input', () => save(st, ta.dataset.tbT, { body: ta.value })));
    host.querySelectorAll('[data-tb-x]').forEach(b => b.addEventListener('click', async () => {
      const n = st.notes.find(x => String(x.id) === String(b.dataset.tbX));
      if (!n) return;
      if ((n.heading || n.body) && !confirm('Remove this note?')) return;
      try {
        const { error } = await supa.from('wip_notes').delete().eq('id', n.id).eq('user_id', userId);
        if (error) throw error;
        st.notes = st.notes.filter(x => x !== n); render(st);
      } catch (e) { toast('Could not remove'); }
    }));
  }

  function save(st, id, patch) {
    const n = st.notes.find(x => String(x.id) === String(id)); if (!n) return;
    Object.assign(n, patch);
    clearTimeout(timers[id]);
    timers[id] = setTimeout(async () => {
      try {
        const { error } = await supa.from('wip_notes').update(Object.assign({}, patch, { updated_at: new Date().toISOString() }))
          .eq('id', id).eq('user_id', userId);
        if (error) throw error;
      } catch (e) { toast('Could not save the note'); }
    }, 600);
  }

  function toast(msg) { if (window.toast) window.toast(msg); }

  window.MyBoard = {
    init(client, uid) { supa = client; userId = uid; },
    async mount(opts) {
      // opts: host, scope, title, readOnly
      const st = { host: opts.host, scope: String(opts.scope), title: opts.title, readOnly: !!opts.readOnly, notes: [] };
      boards[opts.host.id || (opts.host.id = 'tb' + Math.random().toString(36).slice(2, 8))] = st;
      try { await load(st); } catch (e) { st.notes = []; st.host.innerHTML = '<div class="tb-err">The board could not load \u2014 run migrate_board.sql once.</div>'; return st; }
      render(st);
      return st;
    },
    setReadOnly(host, ro) { const st = boards[host.id]; if (!st) return; st.readOnly = !!ro; render(st); },
    notesFor(scope) {
      const st = Object.values(boards).find(s => s.scope === String(scope));
      return st ? st.notes.slice() : [];
    },
    async deleteScope(scope) {
      try { await supa.from('wip_notes').delete().eq('user_id', userId).eq('scope', String(scope)); } catch (e) {}
    },
    unmount(host) { const st = boards[host.id]; if (st) { host.innerHTML = ''; delete boards[host.id]; } },
    _STICKY: STICKY,
  };
})();
