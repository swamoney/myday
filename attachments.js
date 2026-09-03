/* MyDay - the album kit v2 (IN-1, Sep 2026).
   The body is the album: photos and videos live IN the writing, at the
   cursor, as blog-style figures. The body stores only a token -
   <figure data-at="id"> - never a URL; the bytes, caption and quiet flag
   live in the attachments table + private storage, dressed freshly at
   render. Meter, monthly backup, orphan law: unchanged from v1. */
(function () {
  'use strict';

  const BUCKET = 'myday-album';
  const MAX_EDGE = 1600;
  const THUMB_EDGE = 320;
  const QUALITY = 0.78;
  const SIGN_TTL = 3600;

  let supa = null, userId = null;
  const mounts = {};

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function toast(msg) {
    if (window.toast) window.toast(msg);
    else if (window.NoteEditor && NoteEditor.toast) NoteEditor.toast(msg);
    else alert(msg);
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

  function newPath(st, ext) {
    const t = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    return userId + '/' + st.room + '/' + st.entryId + '/' + t + ext;
  }

  // Signed links live an hour; the cellar re-signs when they near it.
  async function urls(st) {
    const now = Date.now();
    if (st._urls && now - st._urlsAt < (SIGN_TTL - 300) * 1000) return st._urls;
    const paths = [];
    st.rows.forEach(r => { if (r.path) paths.push(r.path); if (r.thumb_path) paths.push(r.thumb_path); });
    const map = {};
    if (paths.length) {
      const { data, error } = await supa.storage.from(BUCKET).createSignedUrls(paths, SIGN_TTL);
      if (!error && data) data.forEach(d => { if (d && d.path && d.signedUrl) map[d.path] = d.signedUrl; });
    }
    st._urls = map; st._urlsAt = now;
    return map;
  }

  async function fetchRows(st) {
    const { data, error } = await supa.from('attachments')
      .select('*').eq('user_id', userId).eq('room', st.room).eq('entry_id', st.entryId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    st.rows = data || [];
  }
  async function saveRow(st, id, patch) {
    const { error } = await supa.from('attachments').update(patch)
      .eq('id', id).eq('user_id', userId);
    if (error) throw error;
    Object.assign(st.rows.find(r => r.id === id) || {}, patch);
  }
  async function removeRowAndFiles(st, r) {
    const paths = [r.path, r.thumb_path].filter(Boolean);
    if (paths.length) await supa.storage.from(BUCKET).remove(paths);
    const { error } = await supa.from('attachments').delete().eq('id', r.id).eq('user_id', userId);
    if (error) throw error;
    st.rows = st.rows.filter(x => x.id !== r.id);
  }

  // ---- the figures: dress each token in the flow ----
  // IN-2: the figure's width lives in its token (data-w, whole percent); missing = full.
  const SNAPS = [25, 33, 50, 66, 75, 100];
  const CHIP_STEPS = [100, 75, 50, 33];
  function figW_(fig) { const w = parseInt(fig.getAttribute('data-w') || '', 10); return (w >= 10 && w < 100) ? w : 100; }
  function wLabel_(w) { return w >= 100 ? 'FULL' : w === 75 ? '\u00BE' : w === 66 ? '\u2154' : w === 50 ? '\u00BD' : w === 33 ? '\u2153' : w === 25 ? '\u00BC' : w + '%'; }
  function applyW_(fig) {
    const w = figW_(fig);
    fig.style.width = w >= 100 ? '' : w + '%';
    const chip = fig.querySelector('[data-mdf-sz]'); if (chip) chip.textContent = wLabel_(w);
  }
  function setW_(st, fig, w) {
    w = Math.round(w);
    if (w >= 100) fig.removeAttribute('data-w'); else fig.setAttribute('data-w', String(Math.max(10, w)));
    applyW_(fig);
    const root = st.watch.find(x => x && x.contains(fig));
    if (root) root.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function figTools_(st, r) {
    return '<span class="mdf-tools" contenteditable="false">' +
      (r.kind === 'photo' ? '<button type="button" class="mdf-sz" data-mdf-sz title="Size - tap to cycle">FULL</button>' : '') +
      (r.kind === 'photo' ? '<button type="button" class="mdf-q' + (r.quiet ? ' on' : '') + '" data-mdf-q>QUIET</button>' : '') +
      '<button type="button" class="mdf-x" data-mdf-x title="Remove">&#10005;</button></span>';
  }
  function dressFig_(st, fig, r, u) {
    const editing = st.editing;
    fig.classList.add('md-fig');
    fig.setAttribute('contenteditable', 'false');
    if (r.kind === 'photo') {
      fig.classList.add('md-ph');
      fig.classList.toggle('quiet', !!r.quiet && !editing);
      const src = u[r.path] || u[r.thumb_path] || '';
      fig.innerHTML = (editing ? figTools_(st, r) : '') +
        '<img class="mdf-im" src="' + esc(src) + '" alt="" loading="lazy">' +
        (editing ? '<span class="mdf-handle" data-mdf-handle contenteditable="false" title="Drag to resize"></span>' : '') +
        (editing
          ? '<input class="mdf-capin" data-mdf-cap placeholder="caption\u2026" value="' + esc(r.caption || '') + '">'
          : (r.caption && !r.quiet ? '<figcaption>' + esc(r.caption) + '</figcaption>' : ''));
      applyW_(fig);
    } else if (r.kind === 'youtube') {
      fig.classList.add('md-yt');
      const id = youtubeId(r.url);
      fig.innerHTML = (editing ? figTools_(st, r) : '') +
        '<iframe class="mdf-frame" src="https://www.youtube-nocookie.com/embed/' + esc(id || '') +
        '" allow="fullscreen; encrypted-media" allowfullscreen loading="lazy"></iframe>' +
        (editing
          ? '<input class="mdf-capin" data-mdf-cap placeholder="caption\u2026" value="' + esc(r.caption || '') + '">'
          : (r.caption ? '<figcaption>' + esc(r.caption) + '</figcaption>' : ''));
    } else {
      fig.classList.add('md-alb');
      fig.innerHTML = (editing ? figTools_(st, r) : '') +
        '<a class="mdf-alink" href="' + esc(r.url || '') + '" target="_blank" rel="noopener">&#128247;&nbsp; ' +
        esc(r.caption || 'FULL ALBUM') + ' &rarr;</a>';
    }
    fig.dataset.mdfDressed = editing ? 'edit' : 'read';
    // read-mode manners: a quiet photo reveals on the first tap; a photo opens the viewer
    if (!editing && r.kind === 'photo') {
      fig.onclick = () => {
        if (fig.classList.contains('quiet')) { fig.classList.remove('quiet'); return; }
        openViewer(st, r.id);
      };
    } else fig.onclick = null;
    if (editing) {
      const cap = fig.querySelector('[data-mdf-cap]');
      if (cap) {
        cap.addEventListener('change', () => saveRow(st, r.id, { caption: cap.value.trim() })
          .catch(() => toast('Could not save the caption')));
        cap.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); cap.blur(); } ev.stopPropagation(); });
      }
      // IN-2: the chip cycles FULL -> 3/4 -> 1/2 -> 1/3; the handle drags with snapping
      const sz = fig.querySelector('[data-mdf-sz]');
      if (sz) sz.addEventListener('click', () => {
        const cur = figW_(fig);
        const i = CHIP_STEPS.indexOf(cur);
        const next = CHIP_STEPS[(i < 0 ? 0 : i + 1) % CHIP_STEPS.length];
        setW_(st, fig, next);
      });
      const hd = fig.querySelector('[data-mdf-handle]');
      if (hd) {
        let dragging = false, parentW = 0, leftX = 0;
        const onMove = (ev) => {
          if (!dragging) return;
          ev.preventDefault();
          const x = (ev.touches ? ev.touches[0].clientX : ev.clientX);
          // centred figure: the drag widens both sides, so width = 2 * distance from the centre
          const centre = leftX + parentW / 2;
          let pct = Math.max(10, Math.min(100, ((x - centre) * 2 / parentW) * 100));
          fig.style.width = pct >= 100 ? '' : pct + '%';
          fig.dataset.mdfDrag = String(Math.round(pct));
        };
        const onUp = () => {
          if (!dragging) return;
          dragging = false;
          document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp);
          document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onUp);
          const raw = parseInt(fig.dataset.mdfDrag || '100', 10); delete fig.dataset.mdfDrag;
          const snapped = SNAPS.reduce((b, s) => Math.abs(s - raw) < Math.abs(b - raw) ? s : b, 100);
          setW_(st, fig, snapped);
        };
        const onDown = (ev) => {
          const root = st.watch.find(x => x && x.contains(fig)) || fig.parentElement;
          const rect = root.getBoundingClientRect();
          parentW = rect.width || 1; leftX = rect.left;
          dragging = true; ev.preventDefault(); ev.stopPropagation();
          document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
          document.addEventListener('touchmove', onMove, { passive: false }); document.addEventListener('touchend', onUp);
        };
        hd.addEventListener('mousedown', onDown);
        hd.addEventListener('touchstart', onDown, { passive: false });
      }
      const q = fig.querySelector('[data-mdf-q]');
      if (q) q.addEventListener('click', () => saveRow(st, r.id, { quiet: !r.quiet })
        .then(() => { q.classList.toggle('on', r.quiet); }).catch(() => toast('Could not save')));
      const x = fig.querySelector('[data-mdf-x]');
      if (x) x.addEventListener('click', async () => {
        if (!confirm(r.kind === 'photo' ? 'Remove this photo from the page?' : 'Remove this from the page?')) return;
        try {
          await removeRowAndFiles(st, r);
          const root = st.watch.find(w => w && w.contains(fig));
          fig.remove();
          if (root) root.dispatchEvent(new Event('input', { bubbles: true }));
        } catch (e) { toast('Could not remove'); }
      });
    }
  }
  async function hydrate(st) {
    if (!st._loaded) return;               // never dress before the rows arrive
    if (st._hydrating) return; st._hydrating = true;
    try {
      const u = await urls(st);
      st.watch.forEach(root => {
        if (!root) return;
        root.querySelectorAll('figure[data-at]').forEach(fig => {
          const want = st.editing && root.isContentEditable !== false && root.getAttribute('contenteditable') === 'true' ? 'edit'
                     : (st.editing && st.watch.length === 1 ? 'edit' : 'read');
          const mode = st.editing ? 'edit' : 'read';
          if (fig.dataset.mdfDressed === mode) return;
          const r = st.rows.find(x => String(x.id) === String(fig.dataset.at));
          if (!r) { fig.classList.add('md-fig', 'md-gone'); fig.innerHTML = ''; delete fig.dataset.mdfDressed; return; }
          fig.classList.remove('md-gone');
          dressFig_(st, fig, r, u);
        });
      });
      renderLegacy_(st);
    } finally { st._hydrating = false; }
  }

  // Rows the body does not yet reference stand at the page top until placed.
  function placedIds_(st) {
    const s = new Set();
    st.watch.forEach(root => { if (root) root.querySelectorAll('figure[data-at]').forEach(f => s.add(String(f.dataset.at))); });
    return s;
  }
  function renderLegacy_(st) {
    const host = st.host; if (!host) return;
    const placed = placedIds_(st);
    const un = st.rows.filter(r => !placed.has(String(r.id)));
    if (!un.length) { host.innerHTML = ''; host.classList.add('at-empty'); return; }
    host.classList.remove('at-empty');
    urls(st).then(u => {
      host.innerHTML = '<div class="at-strip">' + un.map(r => {
        const src = u[r.thumb_path || r.path] || '';
        const yt = r.kind === 'youtube' ? youtubeId(r.url) : null;
        const bg = r.kind === 'photo' ? (src ? 'background-image:url(\'' + src + '\');' : 'background:#dfe6ef;')
          : yt ? 'background-image:url(\'https://i.ytimg.com/vi/' + yt + '/hqdefault.jpg\');'
          : 'background:linear-gradient(160deg,#41586E,#182233);';
        return '<div class="at-ph' + (r.quiet ? ' quiet' : '') + (r.kind === 'youtube' ? ' vid' : '') +
          '" data-at-open="' + esc(r.id) + '"><span class="at-fill" style="' + bg + '"></span>' +
          (st.editing ? '<span class="at-rowtools"><button type="button" class="at-del" data-at-del="' + esc(r.id) + '">&#10005;</button></span>' : '') +
          '</div>';
      }).join('') + '</div>';
      host.querySelectorAll('[data-at-open]').forEach(t => t.addEventListener('click', () => openViewer(st, t.dataset.atOpen)));
      host.querySelectorAll('[data-at-del]').forEach(b => b.addEventListener('click', async (ev) => {
        ev.stopPropagation();
        const r = st.rows.find(x => String(x.id) === String(b.dataset.atDel)); if (!r) return;
        if (!confirm('Remove this from the page?')) return;
        try { await removeRowAndFiles(st, r); renderLegacy_(st); } catch (e) { toast('Could not remove'); }
      }));
    });
  }

  // ---- the cursor decides ----
  function grabRange_(st) {
    const sel = window.getSelection ? window.getSelection() : null;
    if (sel && sel.rangeCount) {
      const rg = sel.getRangeAt(0);
      if (st.watch.some(root => root && root.getAttribute && root.getAttribute('contenteditable') === 'true' && root.contains(rg.startContainer))) {
        st._range = rg.cloneRange(); return;
      }
    }
    st._range = null;
  }
  function editableRoot_(st) {
    return st.watch.find(root => root && root.getAttribute && root.getAttribute('contenteditable') === 'true' && root.offsetParent !== null)
      || st.watch.find(root => root && root.getAttribute && root.getAttribute('contenteditable') === 'true');
  }
  function insertFigure_(st, id) {
    const fig = document.createElement('figure');
    fig.setAttribute('data-at', String(id));
    const after = document.createElement('p');
    after.innerHTML = '<br>';
    let root = null;
    if (st._range) {
      const rg = st._range;
      root = st.watch.find(w => w && w.contains(rg.startContainer)) || editableRoot_(st);
      // land as a block: climb to the direct child of the editor, insert after it
      let node = rg.startContainer;
      while (node && node.parentNode !== root) node = node.parentNode;
      if (node && node.parentNode === root) {
        root.insertBefore(fig, node.nextSibling);
        root.insertBefore(after, fig.nextSibling);
      } else { root.appendChild(fig); root.appendChild(after); }
    } else {
      root = editableRoot_(st);
      if (!root) { toast('Open the page for editing first'); return null; }
      root.appendChild(fig); root.appendChild(after);
    }
    st._range = null;
    if (root) root.dispatchEvent(new Event('input', { bubbles: true }));
    hydrate(st);
    return fig;
  }

  // ---- adding ----
  let fileInput_ = null;
  function ensureInput_() {
    if (fileInput_) return fileInput_;
    fileInput_ = document.createElement('input');
    fileInput_.type = 'file'; fileInput_.accept = 'image/*';
    fileInput_.style.cssText = 'position:absolute; left:-9999px; top:0; width:1px; height:1px; opacity:0;';
    document.body.appendChild(fileInput_);
    return fileInput_;
  }
  async function addPhoto_(st, file) {
    toast('Keeping the photo\u2026');
    try {
      const big = await shrink(file, MAX_EDGE, QUALITY);
      const th = await shrink(file, THUMB_EDGE, 0.7);
      const p = newPath(st, '.webp'), tp = p.replace('.webp', '_t.webp');
      let up = await supa.storage.from(BUCKET).upload(p, big, { contentType: 'image/webp' });
      if (up.error) throw up.error;
      up = await supa.storage.from(BUCKET).upload(tp, th, { contentType: 'image/webp' });
      if (up.error) throw up.error;
      const rec = { user_id: userId, room: st.room, entry_id: st.entryId, day_index: null,
        kind: 'photo', path: p, thumb_path: tp, caption: '', quiet: false,
        sort_order: st.rows.length, bytes: (big.size || 0) + (th.size || 0) };
      const { data, error } = await supa.from('attachments').insert(rec).select();
      if (error) throw error;
      st.rows.push(data[0]);
      st._urls = null;                       // the new file needs its signed dress
      insertFigure_(st, data[0].id);
    } catch (e) { toast('The photo could not be kept'); }
  }
  function addVideoLink_(st) {
    const url = prompt('Paste a link \u2014 YouTube (unlisted) plays on the page; Google Photos stands as the album door:');
    if (!url) return;
    let kind = null;
    if (youtubeId(url)) kind = 'youtube';
    else if (isGPhotos(url)) kind = 'album';
    else { toast('Only YouTube or Google Photos links are kept'); return; }
    const rec = { user_id: userId, room: st.room, entry_id: st.entryId, day_index: null,
      kind: kind, url: url.trim(), caption: '', quiet: false, sort_order: st.rows.length, bytes: 0 };
    supa.from('attachments').insert(rec).select().then(({ data, error }) => {
      if (error) { toast('Could not keep the link'); return; }
      st.rows.push(data[0]);
      insertFigure_(st, data[0].id);
    });
  }

  // ---- the viewer (photos only; video plays in the flow) ----
  function ensureViewer() {
    if (document.getElementById('atViewer')) return;
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
  function openViewer(st, id) {
    ensureViewer();
    const v = document.getElementById('atViewer');
    const items = st.rows.filter(r => r.kind === 'photo');
    let idx = Math.max(0, items.findIndex(r => String(r.id) === String(id)));
    const show = async () => {
      const r = items[idx];
      const u = await urls(st);
      v.querySelector('.at-vcap').textContent =
        (r.caption || '') + (items.length > 1 ? '  \u00B7  ' + (idx + 1) + ' of ' + items.length : '');
      v.querySelector('.at-vbody').innerHTML = '<img class="at-vimg" src="' + esc(u[r.path] || '') + '" alt="">';
    };
    v.querySelector('.at-vprev').onclick = () => { idx = (idx - 1 + items.length) % items.length; show(); };
    v.querySelector('.at-vnext').onclick = () => { idx = (idx + 1) % items.length; show(); };
    v.classList.remove('hidden');
    show();
  }

  // ---- the toolbar's two doors ----
  window.addEventListener('myday-photo', () => {
    const st = Object.values(mounts).find(s => s.editing);
    if (!st) { toast('Open a page and tap Edit \u2014 then the camera places a photo at your cursor'); return; }
    grabRange_(st);
    const inp = ensureInput_();
    inp.onchange = () => { if (inp.files && inp.files[0]) addPhoto_(st, inp.files[0]); inp.value = ''; };
    inp.click();
  });
  window.addEventListener('myday-video', () => {
    const st = Object.values(mounts).find(s => s.editing);
    if (!st) { toast('Open a page and tap Edit \u2014 then paste the video where your cursor stands'); return; }
    grabRange_(st);
    addVideoLink_(st);
  });

  // ---- the other output paths: print and .md dress the tokens too ----
  function cachedRow_(id) {
    for (const st of Object.values(mounts)) {
      const r = st.rows.find(x => String(x.id) === String(id)); if (r) return r;
    }
    return null;
  }
  async function rowsFor_(ids) {
    const out = {}; const missing = [];
    ids.forEach(id => { const r = cachedRow_(id); if (r) out[id] = r; else missing.push(id); });
    if (missing.length && supa && userId) {
      try {
        const { data } = await supa.from('attachments').select('*').eq('user_id', userId).in('id', missing);
        (data || []).forEach(r => { out[String(r.id)] = r; });
      } catch (e) { /* unknown tokens print as a quiet note */ }
    }
    return out;
  }
  function figText_(r) {
    if (!r) return '[photo]';
    if (r.kind === 'photo') return '[photo' + (r.caption ? ': ' + r.caption : '') + ']';
    if (r.kind === 'youtube') return '[video' + (r.caption ? ': ' + r.caption : '') + ' \u2014 ' + (r.url || '') + ']';
    return '[album' + (r.caption ? ': ' + r.caption : '') + ' \u2014 ' + (r.url || '') + ']';
  }
  // .md / zip: every toMarkdown call sees tokens as labelled lines (sync, from the cache).
  if (window.NoteEditor && NoteEditor.toMarkdown && !NoteEditor._atMdPatched) {
    const origMd = NoteEditor.toMarkdown;
    NoteEditor.toMarkdown = function (v) {
      const s = String(v || '');
      if (s.indexOf('data-at=') < 0) return origMd(v);
      const box = document.createElement('div'); box.innerHTML = s;
      box.querySelectorAll('figure[data-at]').forEach(f => {
        const p = document.createElement('p'); p.textContent = figText_(cachedRow_(f.dataset.at)); f.replaceWith(p);
      });
      return origMd(box.innerHTML);
    };
    NoteEditor._atMdPatched = true;
  }
  // print: the window opens on the tap (pop-up rules), the dressed page arrives a beat later.
  async function dressForPrint_(html) {
    const box = document.createElement('div'); box.innerHTML = html;
    const figs = [...box.querySelectorAll('figure[data-at]')];
    if (!figs.length) return html;
    const rows = await rowsFor_([...new Set(figs.map(f => String(f.dataset.at)))]);
    const paths = [];
    Object.values(rows).forEach(r => { if (r.kind === 'photo' && r.path) paths.push(r.path); });
    let u = {};
    try {
      if (paths.length) { const { data } = await supa.storage.from(BUCKET).createSignedUrls(paths, SIGN_TTL); (data || []).forEach(d => { if (d && d.path && d.signedUrl) u[d.path] = d.signedUrl; }); }
    } catch (e) {}
    figs.forEach(f => {
      const r = rows[String(f.dataset.at)];
      const w = document.createElement('div');
      if (r && r.kind === 'photo') {
        const pw = figW_(f);
        w.innerHTML = '<figure style="margin:14px auto; page-break-inside:avoid; break-inside:avoid;' + (pw < 100 ? ' width:' + pw + '%;' : '') + '">' +
          '<img src="' + esc(u[r.path] || '') + '" alt="" style="max-width:100%; border-radius:8px; display:block; margin:0 auto;">' +
          (r.caption ? '<figcaption style="font-style:italic; font-size:11px; color:#68789a; text-align:center; margin-top:5px;">' + esc(r.caption) + '</figcaption>' : '') + '</figure>';
      } else if (r) {
        w.innerHTML = '<div style="font-family:IBM Plex Mono,monospace; font-size:10px; letter-spacing:0.06em; color:#2F6B8A; border:1px dashed #b9cfe0; border-radius:8px; padding:8px 10px; margin:12px 0;">' +
          (r.kind === 'youtube' ? '&#9654; VIDEO' : '&#128247; ALBUM') + (r.caption ? ' \u00B7 ' + esc(r.caption) : '') + '<br>' + esc(r.url || '') + '</div>';
      } else {
        w.innerHTML = '<div style="font-size:11px; color:#8a97b3; font-style:italic;">[a photo that is no longer on this page]</div>';
      }
      f.replaceWith(w.firstChild);
    });
    return box.innerHTML;
  }
  if (window.NoteEditor && NoteEditor.openPrint && !NoteEditor._atPrintPatched) {
    const origPrint = NoteEditor.openPrint;
    NoteEditor.openPrint = function (fullHtml) {
      const s = String(fullHtml || '');
      if (s.indexOf('data-at=') < 0) return origPrint(fullHtml);
      let w = null;
      try { w = window.open('', '_blank'); } catch (e) {}
      if (!w) { alert('Allow pop-ups to print / save as PDF.'); return; }
      try { w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Preparing\u2026</title></head><body style="font-family:sans-serif; color:#68789a; padding:24px;">Dressing the photos\u2026</body></html>'); w.document.close(); } catch (e) {}
      dressForPrint_(s).then(dressed => {
        try { w.document.open(); w.document.write(dressed); w.document.close(); }
        catch (e) { origPrint(dressed); }
      }).catch(() => origPrint(s));
    };
    NoteEditor._atPrintPatched = true;
  }

  // ---- public ----
  window.MyAlbum = {
    init(client, uid) { supa = client; userId = uid; },
    async mount(opts) {
      const host = opts.host;
      const key = host && host.id ? host.id : (opts.room + ':' + opts.entryId);
      const st = mounts[key] = { host: host || null, room: opts.room, entryId: String(opts.entryId),
        editing: !!opts.editing, rows: [], watch: (opts.watch || []).filter(Boolean),
        _urls: null, _urlsAt: 0, _range: null };
      try { await fetchRows(st); } catch (e) { st.rows = []; }
      st._loaded = true;
      // the watcher: any repaint of the body re-dresses its figures
      if (st.watch.length && window.MutationObserver) {
        st._obs = new MutationObserver(() => {
          clearTimeout(st._obsT);
          st._obsT = setTimeout(() => hydrate(st), 60);
        });
        st.watch.forEach(root => st._obs.observe(root, { childList: true, subtree: true }));
      }
      hydrate(st);
      return st;
    },
    setEditing(host, on) {
      const key = host && host.id ? host.id : null;
      const st = key ? mounts[key] : null;
      if (!st) return;
      st.editing = !!on;
      st.watch.forEach(root => { if (root) root.querySelectorAll('figure[data-at]').forEach(f => delete f.dataset.mdfDressed); });
      hydrate(st);
    },
    unmount(host) {
      const key = host && host.id ? host.id : null;
      if (!key || !mounts[key]) return;
      const st = mounts[key];
      if (st._obs) st._obs.disconnect();
      if (st.host) st.host.innerHTML = '';
      delete mounts[key];
    },
    async deleteAll(room, entryId) {
      try {
        const { data, error } = await supa.from('attachments').select('id, path, thumb_path')
          .eq('user_id', userId).eq('room', room).eq('entry_id', String(entryId));
        if (error) throw error;
        const paths = [];
        (data || []).forEach(r => { if (r.path) paths.push(r.path); if (r.thumb_path) paths.push(r.thumb_path); });
        if (paths.length) await supa.storage.from(BUCKET).remove(paths);
        await supa.from('attachments').delete().eq('user_id', userId)
          .eq('room', room).eq('entry_id', String(entryId));
      } catch (e) { /* the sweep on the backup page catches strays */ }
    },
    _youtubeId: youtubeId, _isGPhotos: isGPhotos,
  };
})();
