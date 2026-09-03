/* MyDay - the album kit (PH-1, Sep 2026).
   One strip, one viewer, one uploader - mounted beside any editor.
   Photos: compressed on the phone (~1600px webp), stored in the private
   'myday-album' bucket under the user's folder, thumbnails carried
   separately so pages stay light. Video: YouTube links play inline
   (unlisted); Google Photos links stand as an album door. Free-plan law:
   nothing heavy is ever uploaded. */
(function () {
  'use strict';

  const BUCKET = 'myday-album';
  const MAX_EDGE = 1600;          // the kept copy
  const THUMB_EDGE = 320;         // what the strip shows
  const QUALITY = 0.78;
  const SIGN_TTL = 3600;          // signed links live an hour

  let supa = null, userId = null;
  const mounts = {};              // hostId -> state

  function el(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ---- links ----
  function youtubeId(url) {
    const m = String(url || '').match(
      /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,20})/);
    return m ? m[1] : null;
  }
  function isGPhotos(url) {
    return /photos\.app\.goo\.gl|photos\.google\.com/.test(String(url || ''));
  }

  // ---- the phone does the shrinking ----
  function shrink(file, edge, quality) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const done = (blob) => blob ? resolve(blob) : reject(new Error('compress failed'));
      img.onload = () => {
        try {
          const w = img.naturalWidth, h = img.naturalHeight;
          const s = Math.min(1, edge / Math.max(w, h));
          const cw = Math.max(1, Math.round(w * s)), ch = Math.max(1, Math.round(h * s));
          const c = document.createElement('canvas');
          c.width = cw; c.height = ch;
          c.getContext('2d').drawImage(img, 0, 0, cw, ch);
          c.toBlob(done, 'image/webp', quality);
        } catch (e) { reject(e); }
        finally { URL.revokeObjectURL(img.src); }
      };
      img.onerror = () => { URL.revokeObjectURL(img.src); reject(new Error('unreadable image')); };
      img.src = URL.createObjectURL(file);
    });
  }

  // ---- storage ----
  function newPath(st, ext) {
    const t = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    return userId + '/' + st.room + '/' + st.entryId + '/' + t + ext;
  }
  async function signAll(paths) {
    const need = paths.filter(Boolean);
    if (!need.length) return {};
    const { data, error } = await supa.storage.from(BUCKET).createSignedUrls(need, SIGN_TTL);
    const map = {};
    if (!error && data) data.forEach(d => { if (d && d.path && d.signedUrl) map[d.path] = d.signedUrl; });
    return map;
  }

  // ---- data ----
  async function fetchRows(st) {
    const { data, error } = await supa.from('attachments')
      .select('*').eq('user_id', userId).eq('room', st.room).eq('entry_id', st.entryId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    st.rows = (data || []).filter(r => (st.dayIndex == null ? r.day_index == null : r.day_index === st.dayIndex));
  }
  async function saveRow(st, id, patch) {
    const { error } = await supa.from('attachments').update(patch)
      .eq('id', id).eq('user_id', userId);
    if (error) throw error;
    Object.assign(st.rows.find(r => r.id === id) || {}, patch);
  }

  // ---- the strip ----
  function tileHtml(st, r, i, urls) {
    const u = urls[r.thumb_path || r.path] || '';
    const yt = r.kind === 'youtube' ? youtubeId(r.url) : null;
    const bg = r.kind === 'photo'
      ? (u ? 'background-image:url(\'' + u + '\');' : 'background:#dfe6ef;')
      : yt ? 'background-image:url(\'https://i.ytimg.com/vi/' + yt + '/hqdefault.jpg\');'
      : 'background:linear-gradient(160deg,#41586E,#182233);';
    const cls = 'at-ph' + (r.quiet ? ' quiet' : '') + (r.kind === 'youtube' ? ' vid' : '') + (r.kind === 'album' ? ' alb' : '');
    if (!st.editing) {
      if (r.kind === 'album') {
        return '<a class="at-alink" href="' + esc(r.url) + '" target="_blank" rel="noopener">' +
          '&#128247;&nbsp; ' + esc(r.caption || 'FULL ALBUM') + ' &rarr;</a>';
      }
      return '<div class="' + cls + '" data-at-open="' + i + '"><span class="at-fill" style="' + bg + '"></span>' +
        (r.kind === 'youtube' ? '<span class="at-vlen">YT</span>' : '') +
        (r.caption && !r.quiet ? '<span class="at-cap">' + esc(r.caption) + '</span>' : '') + '</div>';
    }
    return '<div class="' + cls + ' ed" data-at-id="' + esc(r.id) + '"><span class="at-fill" style="' + bg + '"></span>' +
      '<span class="at-rowtools">' +
        '<button type="button" class="at-mv" data-at-mv="' + i + ':-1">&#9664;</button>' +
        '<button type="button" class="at-mv" data-at-mv="' + i + ':1">&#9654;</button>' +
        '<button type="button" class="at-del" data-at-del="' + i + '">&#10005;</button></span>' +
      (r.kind === 'photo' ? '<button type="button" class="at-q' + (r.quiet ? ' on' : '') + '" data-at-q="' + i + '">QUIET</button>' : '') +
      '<input class="at-capin" data-at-cap="' + i + '" placeholder="caption\u2026" value="' + esc(r.caption || '') + '">' +
      '</div>';
  }

  function render(st) {
    const host = st.host;
    const rows = st.rows;
    // The page stays clean: with nothing kept and the boxes unsummoned,
    // the strip takes no room - the camera in the toolbar is the door.
    if (!rows.length && !(st.editing && st.showAdd)) { host.innerHTML = ''; host.classList.add('at-empty'); return; }
    host.classList.remove('at-empty');
    signAll(rows.map(r => r.thumb_path || r.path)).then(urls => {
      let h = '<div class="at-strip">';
      rows.forEach((r, i) => { h += tileHtml(st, r, i, urls); });
      if (st.editing && st.showAdd) {
        h += '<button type="button" class="at-add" data-at-add><b>\uFF0B</b>ADD</button>' +
             '<button type="button" class="at-add lk" data-at-link><b>&#128279;</b>LINK</button>';
      }
      h += '</div>';
      if (st.editing && st.showAdd) {
        h += '<input type="file" accept="image/*" multiple class="at-file" style="position:absolute; left:-9999px; top:0; width:1px; height:1px; opacity:0;">' +
             '<div class="at-meter"></div>';
      }
      host.innerHTML = h;
      wire(st);
      if (st.editing) meter(st);
    }).catch(() => { host.innerHTML = '<div class="at-err">The album could not load - pull to retry.</div>'; });
  }

  function wire(st) {
    const host = st.host;
    host.querySelectorAll('[data-at-open]').forEach(t => t.addEventListener('click', () => {
      openViewer(st, parseInt(t.dataset.atOpen, 10));
    }));
    const file = host.querySelector('.at-file');
    const add = host.querySelector('[data-at-add]');
    if (add) add.addEventListener('click', () => file.click());
    if (file) file.addEventListener('change', () => uploadFiles(st, [...file.files]));
    const lk = host.querySelector('[data-at-link]');
    if (lk) lk.addEventListener('click', () => addLink(st));
    host.querySelectorAll('[data-at-cap]').forEach(inp => inp.addEventListener('change', () => {
      const r = st.rows[parseInt(inp.dataset.atCap, 10)];
      saveRow(st, r.id, { caption: inp.value.trim() }).catch(() => toast(st, 'Could not save the caption'));
    }));
    host.querySelectorAll('[data-at-q]').forEach(btn => btn.addEventListener('click', () => {
      const r = st.rows[parseInt(btn.dataset.atQ, 10)];
      saveRow(st, r.id, { quiet: !r.quiet }).then(() => render(st))
        .catch(() => toast(st, 'Could not save'));
    }));
    host.querySelectorAll('[data-at-mv]').forEach(btn => btn.addEventListener('click', () => {
      const [i, d] = btn.dataset.atMv.split(':').map(Number);
      const j = i + d;
      if (j < 0 || j >= st.rows.length) return;
      const a = st.rows[i], b = st.rows[j];
      st.rows[i] = b; st.rows[j] = a;
      Promise.all(st.rows.map((r, k) => saveRow(st, r.id, { sort_order: k })))
        .then(() => render(st)).catch(() => toast(st, 'Could not save the order'));
    }));
    host.querySelectorAll('[data-at-del]').forEach(btn => btn.addEventListener('click', async () => {
      const r = st.rows[parseInt(btn.dataset.atDel, 10)];
      if (!confirm(r.kind === 'photo' ? 'Remove this photo from the page?' : 'Remove this link?')) return;
      try {
        const paths = [r.path, r.thumb_path].filter(Boolean);
        if (paths.length) await supa.storage.from(BUCKET).remove(paths);
        const { error } = await supa.from('attachments').delete().eq('id', r.id).eq('user_id', userId);
        if (error) throw error;
        st.rows = st.rows.filter(x => x.id !== r.id);
        render(st);
      } catch (e) { toast(st, 'Could not remove'); }
    }));
  }

  // ---- adding ----
  async function uploadFiles(st, files) {
    if (!files.length) return;
    toast(st, files.length === 1 ? 'Keeping the photo\u2026' : 'Keeping ' + files.length + ' photos\u2026');
    let order = st.rows.length ? Math.max(...st.rows.map(r => r.sort_order || 0)) + 1 : 0;
    for (const f of files) {
      try {
        const big = await shrink(f, MAX_EDGE, QUALITY);
        const th = await shrink(f, THUMB_EDGE, 0.7);
        const p = newPath(st, '.webp'), tp = p.replace('.webp', '_t.webp');
        let up = await supa.storage.from(BUCKET).upload(p, big, { contentType: 'image/webp' });
        if (up.error) throw up.error;
        up = await supa.storage.from(BUCKET).upload(tp, th, { contentType: 'image/webp' });
        if (up.error) throw up.error;
        const rec = { user_id: userId, room: st.room, entry_id: st.entryId, day_index: st.dayIndex,
          kind: 'photo', path: p, thumb_path: tp, caption: '', quiet: false,
          sort_order: order++, bytes: (big.size || 0) + (th.size || 0) };
        const { data, error } = await supa.from('attachments').insert(rec).select();
        if (error) throw error;
        st.rows.push(data[0]);
      } catch (e) { toast(st, 'One photo could not be kept'); }
    }
    render(st);
  }

  function addLink(st) {
    const url = prompt('Paste a link - YouTube (unlisted) plays on the page; Google Photos stands as the album door:');
    if (!url) return;
    let kind = null;
    if (youtubeId(url)) kind = 'youtube';
    else if (isGPhotos(url)) kind = 'album';
    else { toast(st, 'Only YouTube or Google Photos links are kept'); return; }
    const order = st.rows.length ? Math.max(...st.rows.map(r => r.sort_order || 0)) + 1 : 0;
    const rec = { user_id: userId, room: st.room, entry_id: st.entryId, day_index: st.dayIndex,
      kind: kind, url: url.trim(), caption: '', quiet: false, sort_order: order, bytes: 0 };
    supa.from('attachments').insert(rec).select().then(({ data, error }) => {
      if (error) { toast(st, 'Could not keep the link'); return; }
      st.rows.push(data[0]); render(st);
    });
  }

  // ---- the viewer ----
  function ensureViewer() {
    if (el('atViewer')) return;
    const v = document.createElement('div');
    v.id = 'atViewer'; v.className = 'at-viewer hidden';
    v.innerHTML = '<button type="button" class="at-vclose">&#10005;</button>' +
      '<button type="button" class="at-vprev">&#8249;</button>' +
      '<div class="at-vbody"></div>' +
      '<button type="button" class="at-vnext">&#8250;</button>' +
      '<div class="at-vcap"></div>';
    document.body.appendChild(v);
    v.querySelector('.at-vclose').addEventListener('click', () => v.classList.add('hidden'));
    v.addEventListener('click', ev => { if (ev.target === v) v.classList.add('hidden'); });
  }
  function openViewer(st, i) {
    ensureViewer();
    const v = el('atViewer');
    const items = st.rows.filter(r => r.kind !== 'album');
    let idx = items.indexOf(st.rows[i]); if (idx < 0) idx = 0;
    const show = async () => {
      const r = items[idx];
      const body = v.querySelector('.at-vbody');
      v.querySelector('.at-vcap').textContent =
        (r.caption || '') + (items.length > 1 ? '  \u00B7  ' + (idx + 1) + ' of ' + items.length : '');
      if (r.kind === 'youtube') {
        body.innerHTML = '<iframe class="at-vframe" src="https://www.youtube-nocookie.com/embed/' +
          youtubeId(r.url) + '" allow="fullscreen; encrypted-media" allowfullscreen></iframe>';
      } else {
        body.innerHTML = '<div class="at-vload">\u2026</div>';
        const urls = await signAll([r.path]);
        body.innerHTML = '<img class="at-vimg" src="' + (urls[r.path] || '') + '" alt="">';
      }
    };
    v.querySelector('.at-vprev').onclick = () => { idx = (idx - 1 + items.length) % items.length; show(); };
    v.querySelector('.at-vnext').onclick = () => { idx = (idx + 1) % items.length; show(); };
    v.classList.remove('hidden');
    show();
  }

  // ---- the whisper meter ----
  async function meter(st) {
    const m = st.host.querySelector('.at-meter'); if (!m) return;
    try {
      const { data, error } = await supa.from('attachments').select('bytes').eq('user_id', userId);
      if (error) throw error;
      const used = (data || []).reduce((s, r) => s + (r.bytes || 0), 0);
      const gb = 1024 * 1024 * 1024;
      const left = Math.max(0, Math.floor((gb - used) / 300000));
      const pct = used / gb;
      m.textContent = 'ALBUM \u00B7 ' + Math.round(used / 1048576) + 'MB OF 1GB \u00B7 \u223C' +
        left.toLocaleString('en-IN') + ' PHOTOS LEFT';
      m.classList.toggle('warn', pct > 0.7);
      m.classList.toggle('full', pct > 0.9);
    } catch (e) { m.textContent = ''; }
  }

  function toast(st, msg) {
    if (window.toast) window.toast(msg);
    else if (window.NoteEditor && NoteEditor.toast) NoteEditor.toast(msg);
    else alert(msg);
  }

  // The toolbar's camera: any page's editor can call the album.
  window.addEventListener('myday-photos', () => {
    const st = Object.values(mounts).find(s => s.editing);
    if (!st) {
      const anyMounted = Object.values(mounts)[0];
      toast(anyMounted, anyMounted
        ? 'Tap Edit on the page first \u2014 then the camera adds to its album'
        : 'Open a page and tap Edit \u2014 the camera adds photos to that page');
      return;
    }
    if (!st.showAdd) {
      st.showAdd = true;
      render(st);
      setTimeout(() => (st.host.scrollIntoView && st.host.scrollIntoView({ behavior: 'smooth', block: 'center' })), 60);
      return;
    }
    const f = st.host.querySelector('.at-file');
    if (f) f.click();
    else (st.host.scrollIntoView && st.host.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  });

  // ---- public ----
  window.MyAlbum = {
    init(client, uid) { supa = client; userId = uid; },
    async mount(opts) {
      // opts: host (element), room, entryId, dayIndex (null), editing (bool)
      const st = { host: opts.host, room: opts.room, entryId: String(opts.entryId),
        dayIndex: opts.dayIndex == null ? null : opts.dayIndex, editing: !!opts.editing, showAdd: false, rows: [] };
      mounts[opts.host.id || (opts.host.id = 'at' + Math.random().toString(36).slice(2, 8))] = st;
      try { await fetchRows(st); } catch (e) { st.rows = []; }
      render(st);
      return st;
    },
    setEditing(host, on) {
      const st = mounts[host.id]; if (!st) return;
      st.editing = !!on;
      if (!on) st.showAdd = false;   // Done folds the boxes away again
      render(st);
    },
    unmount(host) {
      const st = mounts[host.id]; if (!st) return;
      host.innerHTML = ''; delete mounts[host.id];
    },
    async deleteAll(room, entryId) {
      // The orphan law: a deleted page takes its files with it.
      try {
        const { data, error } = await supa.from('attachments').select('id, path, thumb_path')
          .eq('user_id', userId).eq('room', room).eq('entry_id', String(entryId));
        if (error) throw error;
        const paths = [];
        (data || []).forEach(r => { if (r.path) paths.push(r.path); if (r.thumb_path) paths.push(r.thumb_path); });
        if (paths.length) await supa.storage.from(BUCKET).remove(paths);
        await supa.from('attachments').delete().eq('user_id', userId)
          .eq('room', room).eq('entry_id', String(entryId));
      } catch (e) { /* quota ghosts are swept by the backup page later */ }
    },
    _youtubeId: youtubeId, _isGPhotos: isGPhotos,
  };
})();
