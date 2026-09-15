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
    st.rows = (data || []).filter(r => !r.is_cover);   // the cover is the head's, not the body's
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
  function figAl_(fig) { const v = fig.getAttribute('data-al'); return (v === 'l' || v === 'r') && figW_(fig) < 100 ? v : ''; }
  function applyW_(fig) {
    const w = figW_(fig);
    fig.style.width = w >= 100 ? '' : w + '%';
    const chip = fig.querySelector('[data-mdf-sz]'); if (chip) chip.textContent = wLabel_(w);
    // IN-3: alignment rides with the size - a full-width photo has nothing to align to
    if (w >= 100) fig.removeAttribute('data-al');
    const al = figAl_(fig);
    fig.classList.toggle('al-l', al === 'l');
    fig.classList.toggle('al-r', al === 'r');
    const ac = fig.querySelector('[data-mdf-al]');
    if (ac) { ac.textContent = al === 'l' ? 'LEFT' : al === 'r' ? 'RIGHT' : 'CENTRE'; ac.style.display = w >= 100 ? 'none' : ''; }
  }
  function setAl_(st, fig, al) {
    if (al) fig.setAttribute('data-al', al); else fig.removeAttribute('data-al');
    applyW_(fig);
    const root = st.watch.find(x => x && x.contains(fig));
    if (root) root.dispatchEvent(new Event('input', { bubbles: true }));
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
      (r.kind === 'photo' ? '<button type="button" class="mdf-al" data-mdf-al title="Centre, left or right - tap to cycle">CENTRE</button>' : '') +
      (r.kind === 'photo' ? '<button type="button" class="mdf-q' + (r.quiet ? ' on' : '') + '" data-mdf-q>QUIET</button>' : '') +
      '<button type="button" class="mdf-x" data-mdf-x title="Remove">&#10005;</button></span>';
  }
  // ===== the print (Sep 2026): a photo between two paragraphs, dressed as a matted print =====
  // The token carries its own settings - data-fit (fill|fit), data-sz (m|l|xl), data-x / data-y (the
  // centre, whole percent). The picture is a background, not an <img>, so a repaint never flashes;
  // the tools swallow mousedown so the caret never jumps and a tap is never lost.
  function prCfg_(fig) {
    const fit = fig.getAttribute('data-fit') === 'fit' ? 'fit' : 'fill';
    const sz = ['m','l','xl'].includes(fig.getAttribute('data-sz')) ? fig.getAttribute('data-sz') : 'l';
    const x = parseInt(fig.getAttribute('data-x') || '50', 10), y = parseInt(fig.getAttribute('data-y') || '50', 10);
    return { fit, sz, x: isFinite(x) ? Math.min(100, Math.max(0, x)) : 50, y: isFinite(y) ? Math.min(100, Math.max(0, y)) : 50 };
  }
  function prApply_(fig) {
    const c = prCfg_(fig);
    fig.classList.toggle('pr-fit', c.fit === 'fit');
    fig.classList.remove('pr-m', 'pr-l', 'pr-xl'); fig.classList.add('pr-' + c.sz);
    const pic = fig.querySelector('.pr-pic'); if (pic) pic.style.backgroundPosition = c.fit === 'fill' ? c.x + '% ' + c.y + '%' : 'center';
    const f = fig.querySelector('[data-pr-fit]'); if (f) f.innerHTML = c.fit === 'fill' ? '&#9635; FILL' : '&#9634; FIT';
    const s = fig.querySelector('[data-pr-sz]'); if (s) s.innerHTML = '&#8597; SIZE ' + c.sz.toUpperCase();
    const h = fig.querySelector('.pr-hint'); if (h) h.style.display = c.fit === 'fill' ? '' : 'none';
  }
  function prSet_(st, fig, patch) {
    Object.keys(patch).forEach(k => { const v = patch[k]; if (v === null || v === undefined) fig.removeAttribute('data-' + k); else fig.setAttribute('data-' + k, String(v)); });
    prApply_(fig);
    const root = st.watch.find(x => x && x.contains(fig));
    if (root) root.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function prMove_(st, fig, dir) {
    const root = st.watch.find(x => x && x.contains(fig)); if (!root) return;
    let node = fig; while (node.parentElement && node.parentElement !== root) node = node.parentElement;   // the block that holds the print
    const sib = dir < 0 ? node.previousElementSibling : node.nextElementSibling;
    if (!sib) return;
    if (dir < 0) root.insertBefore(node, sib); else root.insertBefore(sib, node);
    root.dispatchEvent(new Event('input', { bubbles: true }));
    fig.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  let prCssDone_ = false;
  function prCss_() {
    if (prCssDone_) return; prCssDone_ = true;
    const s = document.createElement('style');
    s.textContent = [
      '.md-fig.md-print{position:relative;margin:18px 0 22px;background:#fff;border:1px solid #d9dfe8;padding:14px;box-shadow:0 12px 30px rgba(20,30,60,0.15);width:auto!important;float:none!important;border-radius:0}',
      '.md-fig.md-print.pr-hand{padding-bottom:40px}',
      '.md-fig.md-print .pr-pic{display:block;width:100%;height:300px;background-color:#fff;background-size:cover;background-position:center;background-repeat:no-repeat;cursor:zoom-in}',
      '.md-fig.md-print.pr-fit .pr-pic{background-size:contain}',
      '.md-fig.md-print.pr-m .pr-pic{height:220px}.md-fig.md-print.pr-xl .pr-pic{height:400px}',
      '.md-fig.md-print .pr-line{position:absolute;left:16px;bottom:12px;font-family:"Fraunces",Georgia,serif;font-style:italic;font-size:0.9375rem;color:#5a6478}',
      '.md-fig.md-print .pr-tools{position:absolute;left:12px;top:12px;display:flex;gap:5px;flex-wrap:wrap;z-index:2}',
      '.md-fig.md-print .pr-tools button{font-family:"IBM Plex Mono",monospace;font-size:0.4688rem;font-weight:700;letter-spacing:0.1em;border-radius:6px;padding:5px 8px;background:rgba(255,255,255,0.94);border:1px solid #cfd6e4;color:#3D4866;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.08)}',
      '.md-fig.md-print .pr-hint{position:absolute;right:14px;bottom:14px;font-family:"IBM Plex Mono",monospace;font-size:0.4375rem;letter-spacing:0.14em;color:rgba(255,255,255,0.92);text-shadow:0 1px 3px rgba(0,0,0,0.6);z-index:2;pointer-events:none}',
      '.md-fig.md-print.pr-hand .pr-hint{bottom:48px}',
      '.md-fig.md-print.pr-edit{outline:2px dashed #b9c3d4;outline-offset:4px}',
      '.md-fig.md-print.pr-edit .pr-pic{cursor:crosshair}',
      '.md-fig.md-print .pr-still{cursor:default;position:relative;display:flex;align-items:center;justify-content:center}',
      '.md-fig.md-print .pr-still .mdf-play{font-size:2rem;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,0.6)}',
      '.md-fig.md-print iframe.mdf-frame{display:block;width:100%;aspect-ratio:16/9;height:auto;border:none;background:#000}',
      '@media (max-width:560px){.md-fig.md-print{padding:10px}.md-fig.md-print.pr-hand{padding-bottom:36px}.md-fig.md-print .pr-pic{height:220px}.md-fig.md-print.pr-m .pr-pic{height:170px}.md-fig.md-print.pr-xl .pr-pic{height:300px}}'
    ].join('\n');
    document.head.appendChild(s);
  }
  function dressFig_(st, fig, r, u) {
    const editing = st.editing;
    fig.classList.add('md-fig');
    fig.setAttribute('contenteditable', 'false');
    if (r.kind === 'photo') {
      prCss_();
      fig.classList.add('md-print'); fig.classList.remove('md-ph', 'quiet', 'al-l', 'al-r'); fig.style.width = '';
      fig.classList.toggle('pr-edit', editing);
      fig.classList.toggle('pr-hand', !!(r.caption || '').trim());
      const src = u[r.path] || u[r.thumb_path] || '';
      fig.innerHTML =
        (editing ? '<span class="pr-tools" contenteditable="false">' +
          '<button type="button" data-pr-fit>&#9635; FILL</button>' +
          '<button type="button" data-pr-sz>&#8597; SIZE L</button>' +
          '<button type="button" data-pr-line>&#9998; LINE</button>' +
          '<button type="button" data-pr-up>&#8593; UP</button>' +
          '<button type="button" data-pr-down>&#8595; DOWN</button>' +
          '<button type="button" data-mdf-x title="Remove">&#10005; REMOVE</button></span>' : '') +
        '<span class="pr-pic" style="' + (src ? 'background-image:url(\'' + esc(src) + '\');' : '') + '"></span>' +
        (editing ? '<span class="pr-hint">TAP THE PICTURE TO SET WHERE IT CENTRES</span>' : '') +
        ((r.caption || '').trim() ? '<span class="pr-line">' + esc(r.caption) + '</span>' : '');
      prApply_(fig);
      if (editing) {
        fig.querySelectorAll('.pr-tools button').forEach(b => b.addEventListener('mousedown', ev => { ev.preventDefault(); ev.stopPropagation(); }));
        fig.querySelector('[data-pr-fit]').addEventListener('click', ev => { ev.stopPropagation(); prSet_(st, fig, { fit: prCfg_(fig).fit === 'fill' ? 'fit' : 'fill' }); });
        fig.querySelector('[data-pr-sz]').addEventListener('click', ev => { ev.stopPropagation(); const o = ['m','l','xl'], c = prCfg_(fig); prSet_(st, fig, { sz: o[(o.indexOf(c.sz) + 1) % o.length] }); });
        fig.querySelector('[data-pr-line]').addEventListener('click', async ev => { ev.stopPropagation();
          const t = prompt('A few words under the picture:', r.caption || ''); if (t === null) return;
          try { await saveRow(st, r.id, { caption: t.trim() }); r.caption = t.trim(); delete fig.dataset.mdfDressed; hydrate(st); } catch (e) { toast('Could not save the line'); } });
        fig.querySelector('[data-pr-up]').addEventListener('click', ev => { ev.stopPropagation(); prMove_(st, fig, -1); });
        fig.querySelector('[data-pr-down]').addEventListener('click', ev => { ev.stopPropagation(); prMove_(st, fig, 1); });
        fig.querySelector('.pr-pic').addEventListener('click', ev => {
          ev.stopPropagation(); if (prCfg_(fig).fit !== 'fill') return;
          const rect = ev.currentTarget.getBoundingClientRect();
          const x = Math.round(Math.min(100, Math.max(0, (ev.clientX - rect.left) / rect.width * 100)));
          const y = Math.round(Math.min(100, Math.max(0, (ev.clientY - rect.top) / rect.height * 100)));
          prSet_(st, fig, { x, y });
        });
      }
    } else if (r.kind === 'youtube') {
      // The video takes the print's discipline (Sep 2026): in Edit it is a sealed block with NO input
      // inside the editable (an input in a contenteditable fights the caret and flickers), a still that
      // is a background (never reloads), tools that swallow mousedown, the caption through LINE, and
      // UP / DOWN to move it. Read mode plays the real player.
      prCss_();
      fig.classList.add('md-yt', 'md-print'); fig.classList.remove('md-ph');
      fig.classList.toggle('pr-edit', editing);
      fig.classList.toggle('pr-hand', !!(r.caption || '').trim());
      const id = youtubeId(r.url);
      fig.innerHTML =
        (editing ? '<span class="pr-tools" contenteditable="false">' +
          '<button type="button" data-pr-line>&#9998; LINE</button>' +
          '<button type="button" data-pr-up>&#8593; UP</button>' +
          '<button type="button" data-pr-down>&#8595; DOWN</button>' +
          '<button type="button" data-mdf-x title="Remove">&#10005; REMOVE</button></span>' : '') +
        (editing
          ? '<span class="pr-pic pr-still" style="background-image:url(\'https://i.ytimg.com/vi/' + esc(id || '') + '/hqdefault.jpg\');"><span class="mdf-play">&#9654;</span></span>'
          : '<iframe class="mdf-frame" src="https://www.youtube-nocookie.com/embed/' + esc(id || '') +
            '" allow="fullscreen; encrypted-media" allowfullscreen loading="lazy"></iframe>') +
        ((r.caption || '').trim() ? '<span class="pr-line">' + esc(r.caption) + '</span>' : '');
      if (editing) {
        fig.querySelectorAll('.pr-tools button').forEach(b => b.addEventListener('mousedown', ev => { ev.preventDefault(); ev.stopPropagation(); }));
        fig.querySelector('[data-pr-line]').addEventListener('click', async ev => { ev.stopPropagation();
          const t = prompt('A few words under the video:', r.caption || ''); if (t === null) return;
          try { await saveRow(st, r.id, { caption: t.trim() }); r.caption = t.trim(); delete fig.dataset.mdfDressed; hydrate(st); } catch (e) { toast('Could not save the line'); } });
        fig.querySelector('[data-pr-up]').addEventListener('click', ev => { ev.stopPropagation(); prMove_(st, fig, -1); });
        fig.querySelector('[data-pr-down]').addEventListener('click', ev => { ev.stopPropagation(); prMove_(st, fig, 1); });
      }
    } else {
      fig.classList.add('md-alb');
      fig.innerHTML = (editing ? figTools_(st, r) : '') +
        '<a class="mdf-alink" href="' + esc(r.url || '') + '" target="_blank" rel="noopener">&#128247;&nbsp; ' +
        esc(r.caption || 'FULL ALBUM') + ' &rarr;</a>';
    }
    fig.dataset.mdfDressed = editing ? 'edit' : 'read';
    // read-mode manners: a quiet photo reveals on the first tap; a photo opens the viewer
    if (!editing && r.kind === 'photo') {
      fig.onclick = () => openViewer(st, r.id);
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
      const alc = fig.querySelector('[data-mdf-al]');
      if (alc) alc.addEventListener('click', () => {
        const cur = figAl_(fig);
        setAl_(st, fig, cur === '' ? 'l' : cur === 'l' ? 'r' : '');
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
      if (x) x.addEventListener('mousedown', ev => { ev.preventDefault(); ev.stopPropagation(); });
      if (x) x.addEventListener('click', async () => {
        if (!confirm(r.kind === 'photo' ? 'Remove this photo from the page?' : 'Remove this from the page?')) return;
        try {
          await removeRowAndFiles(st, r);
          const root = st.watch.find(w => w && w.contains(fig));
          st.watch.forEach(w => { if (w) w.querySelectorAll('figure[data-at="' + String(r.id).replace(/"/g, '') + '"]').forEach(f => f.remove()); });
          if (fig.isConnected) fig.remove();
          if (root) root.dispatchEvent(new Event('input', { bubbles: true }));
          toast('Removed');
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
    // Every keystroke re-hydrates (the body watcher); rebuild the strip only when its
    // contents actually changed - a rebuilt strip every keystroke is a flickering video.
    const sig = (st.editing ? 'e:' : 'r:') + un.map(r => r.id + '/' + (r.quiet ? 1 : 0) + '/' + (r.caption || '')).join(',');
    if (st._legacySig === sig) return;
    st._legacySig = sig;
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
      usage_().then(u => toast('Photo kept \u00B7 ' + usageLine_(u))).catch(() => {});   // GD-1: the whisper
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

  // ---- GD-1: the guardians - usage, the album zip, the sweep ----
  const GB = 1024 * 1024 * 1024;
  async function usage_() {
    const { data, error } = await supa.from('attachments').select('bytes').eq('user_id', userId);
    if (error) throw error;
    const used = (data || []).reduce((s, r) => s + (r.bytes || 0), 0);
    return { used, count: (data || []).length, pct: used / GB, left: Math.max(0, Math.floor((GB - used) / 300000)) };
  }
  function usageLine_(u) {
    const m = u.used / 1048576;
    return 'ALBUM \u00B7 ' + (m < 10 ? Math.round(m * 10) / 10 : Math.round(m)) + 'MB OF 1GB \u00B7 \u223C' + u.left.toLocaleString('en-IN') + ' LEFT';
  }
  async function fetchAllRows_() {
    const PAGE = 1000; let from = 0, out = [];
    for (let guard = 0; guard < 200; guard++) {
      const { data, error } = await supa.from('attachments').select('*').eq('user_id', userId)
        .order('created_at', { ascending: true }).range(from, from + PAGE - 1);
      if (error) throw error;
      out = out.concat(data || []);
      if (!data || data.length < PAGE) break;
      from += PAGE;
    }
    return out;
  }
  function safeName_(s) { return String(s || '').replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'x'; }
  // The album zip: every photo with a manifest that ties it back to its page token.
  async function exportAlbum_(onProgress) {
    if (!window.JSZip) throw new Error('JSZip not loaded');
    const rows = await fetchAllRows_();
    const zip = new JSZip();
    const day = new Date().toISOString().slice(0, 10);
    const manifest = { app: 'MyDay', kind: 'album', exported: new Date().toISOString(), count: rows.length, items: [] };
    let md = '# MyDay album \u2014 ' + day + '\n\nEvery photo and link kept in MyDay, tied to its page by token id.\n\n';
    md += '| id | room | page | kind | file | caption | date | size |\n|---|---|---|---|---|---|---|---|\n';
    const photos = rows.filter(r => r.kind === 'photo' && r.path);
    let done = 0, failed = 0;
    for (const r of rows) {
      let file = '';
      if (r.kind === 'photo' && r.path) {
        try {
          const { data, error } = await supa.storage.from(BUCKET).download(r.path);
          if (error || !data) throw error || new Error('no data');
          const ext = (r.path.split('.').pop() || 'webp').toLowerCase();
          file = safeName_(r.room) + '/' + safeName_(r.entry_id) + '/' + safeName_(r.id) + '.' + ext;
          zip.file(file, data);
        } catch (e) { failed++; file = '(could not download)'; }
        done++;
        if (onProgress) onProgress(done, photos.length);
      }
      manifest.items.push({ id: r.id, room: r.room, entry_id: r.entry_id, day_index: r.day_index, kind: r.kind,
        file: file, url: r.url || '', caption: r.caption || '', quiet: !!r.quiet, sort_order: r.sort_order,
        bytes: r.bytes || 0, created_at: r.created_at, path: r.path || '', thumb_path: r.thumb_path || '' });
      md += '| ' + r.id + ' | ' + r.room + ' | ' + r.entry_id + ' | ' + r.kind + ' | ' + (file || r.url || '') + ' | ' +
        String(r.caption || '').replace(/\|/g, '/') + ' | ' + String(r.created_at || '').slice(0, 10) + ' | ' + Math.round((r.bytes || 0) / 1024) + 'KB |\n';
    }
    if (failed) manifest.warnings = [failed + ' photo(s) could not be downloaded'];
    zip.file('manifest.json', JSON.stringify(manifest, null, 1));
    zip.file('manifest.md', md);
    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'myday-album-' + day + '.zip';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 20000);
    return { count: rows.length, photos: photos.length, failed };
  }
  // The sweep: rows no page token refers to. Reads the words-backup pack (every table's text).
  function sweepFrom_(pack, rows) {
    const tables = Object.assign({}, (pack && pack.tables) || {}); delete tables.attachments;
    const text = JSON.stringify(tables);
    const seen = new Set();
    const re = /data-at=\\?"([A-Za-z0-9-]+)\\?"/g; let m;
    while ((m = re.exec(text))) seen.add(m[1]);
    const ghosts = rows.filter(r => !seen.has(String(r.id)));
    return { ghosts, bytes: ghosts.reduce((s, r) => s + (r.bytes || 0), 0) };
  }
  async function clearGhosts_(ids) {
    const want = new Set(ids.map(String));
    const rows = (await fetchAllRows_()).filter(r => want.has(String(r.id)));
    const paths = [];
    rows.forEach(r => { if (r.path) paths.push(r.path); if (r.thumb_path) paths.push(r.thumb_path); });
    if (paths.length) await supa.storage.from(BUCKET).remove(paths);
    for (const r of rows) await supa.from('attachments').delete().eq('id', r.id).eq('user_id', userId);
    return rows.length;
  }

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
  // The print, on paper: the same white mat as on screen (border, not shadow - shadows and
  // backgrounds are off by default in print), the whole photo shown, the hand-written line beneath.
  function printMat_(url, caption) {
    const cap = String(caption || '').trim();
    return '<figure style="page-break-inside:avoid; break-inside:avoid; margin:18px 0 22px; padding:14px 14px ' + (cap ? '40px' : '14px') + '; background:#fff; border:1px solid #d9dfe8; position:relative; -webkit-print-color-adjust:exact; print-color-adjust:exact;">' +
      '<img src="' + esc(url || '') + '" alt="" style="width:100%; display:block;">' +
      (cap ? '<figcaption style="position:absolute; left:16px; bottom:12px; font-family:Fraunces,Georgia,serif; font-style:italic; font-size:12px; color:#5a6478;">' + esc(cap) + '</figcaption>' : '') + '</figure>';
  }
  // Wait for every picture before the print dialog opens (a PDF made at 500ms has blank frames).
  const PRINT_WAIT = '<scr' + 'ipt>(function(){window.onload=null;var go=function(){window.print();};' +
    'var imgs=Array.prototype.slice.call(document.images);' +
    'Promise.all(imgs.map(function(i){return i.complete?Promise.resolve():new Promise(function(r){i.onload=i.onerror=r;});}))' +
    '.then(function(){setTimeout(go,300);});setTimeout(go,8000);})();</scr' + 'ipt>';
  function printReady_(html) {
    // retire the page's own early print trigger, then add the one that waits for the pictures
    let s = String(html || '').replace(/<script>[^<]*window\.print\(\)[^<]*<\/script>/gi, '');
    return s.indexOf('</body>') > -1 ? s.replace('</body>', PRINT_WAIT + '</body>') : s + PRINT_WAIT;
  }
  async function dressForPrint_(html) {
    const box = document.createElement('div'); box.innerHTML = html;
    const figs = [...box.querySelectorAll('figure[data-at]')];
    if (!figs.length) return printReady_(html);
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
        w.innerHTML = printMat_(u[r.path] || '', r.caption);
      } else if (r) {
        w.innerHTML = '<div style="font-family:IBM Plex Mono,monospace; font-size:10px; letter-spacing:0.06em; color:#2F6B8A; border:1px dashed #b9cfe0; border-radius:8px; padding:8px 10px; margin:12px 0;">' +
          (r.kind === 'youtube' ? '&#9654; VIDEO' : '&#128247; ALBUM') + (r.caption ? ' \u00B7 ' + esc(r.caption) : '') + '<br>' + esc(r.url || '') + '</div>';
      } else {
        w.innerHTML = '<div style="font-size:11px; color:#8a97b3; font-style:italic;">[a photo that is no longer on this page]</div>';
      }
      f.replaceWith(w.firstChild);
    });
    return printReady_(box.innerHTML);
  }
  if (window.NoteEditor && NoteEditor.openPrint && !NoteEditor._atPrintPatched) {
    const origPrint = NoteEditor.openPrint;
    NoteEditor.openPrint = function (fullHtml) {
      const s = String(fullHtml || '');
      if (s.indexOf('data-at=') < 0 && s.indexOf('<img') < 0) return origPrint(fullHtml);
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
      { const k = host && host.id ? host.id : null; if (k && mounts[k]) mounts[k]._legacySig = null; }
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
    // ===== the cover (V2, Sep 2026): one photo that stands for the whole entry =====
    // Stored in the cellar like any other photo, flagged is_cover, kept out of the body's figures.
    async cover(room, entryId) {
      const { data, error } = await supa.from('attachments').select('*').eq('user_id', userId)
        .eq('room', room).eq('entry_id', String(entryId)).eq('is_cover', true).limit(1);
      if (error || !data || !data.length) return null;
      const r = data[0];
      const paths = [r.path, r.thumb_path].filter(Boolean);
      const { data: su } = await supa.storage.from(BUCKET).createSignedUrls(paths, SIGN_TTL);
      const map = {}; (su || []).forEach(d => { if (d && d.path && d.signedUrl) map[d.path] = d.signedUrl; });
      return { id: r.id, caption: r.caption || '', url: map[r.path] || '', thumb: map[r.thumb_path] || map[r.path] || '', cfg: (r.cover_cfg && typeof r.cover_cfg === 'object') ? r.cover_cfg : {} };
    },
    // fit / size / centre for a cover, kept on the cover's own row (cover_cfg)
    async setCoverCfg(room, entryId, patch) {
      const { data } = await supa.from('attachments').select('id, cover_cfg').eq('user_id', userId)
        .eq('room', room).eq('entry_id', String(entryId)).eq('is_cover', true).limit(1);
      if (!data || !data.length) return null;
      const cfg = Object.assign({}, (data[0].cover_cfg && typeof data[0].cover_cfg === 'object') ? data[0].cover_cfg : {}, patch);
      const { error } = await supa.from('attachments').update({ cover_cfg: cfg }).eq('id', data[0].id).eq('user_id', userId);
      return error ? null : cfg;
    },
    // Ask for a file, keep it, and make it the cover (replacing any earlier one).
    pickCover(room, entryId) {
      return new Promise(resolve => {
        const inp = ensureInput_();
        inp.onchange = async () => {
          const f = inp.files && inp.files[0]; inp.value = '';
          if (!f) { resolve(null); return; }
          try {
            toast('Keeping the picture\u2026');
            const big = await shrink(f, MAX_EDGE, QUALITY);
            const th = await shrink(f, THUMB_EDGE, 0.7);
            const st = { room, entryId: String(entryId), rows: [] };
            const p = newPath(st, '.webp'), tp = p.replace('.webp', '_t.webp');
            let up = await supa.storage.from(BUCKET).upload(p, big, { contentType: 'image/webp' });
            if (up.error) throw up.error;
            up = await supa.storage.from(BUCKET).upload(tp, th, { contentType: 'image/webp' });
            if (up.error) throw up.error;
            await window.MyAlbum.removeCover(room, entryId);
            const rec = { user_id: userId, room, entry_id: String(entryId), day_index: null, kind: 'photo',
              path: p, thumb_path: tp, caption: '', quiet: true, is_cover: true, sort_order: -1,
              bytes: (big.size || 0) + (th.size || 0) };
            const { error } = await supa.from('attachments').insert(rec);
            if (error) throw error;
            toast('Picture kept');
            resolve(await window.MyAlbum.cover(room, entryId));
          } catch (e) { toast('The picture could not be kept'); resolve(null); }
        };
        inp.click();
      });
    },
    async removeCover(room, entryId) {
      const { data } = await supa.from('attachments').select('id, path, thumb_path').eq('user_id', userId)
        .eq('room', room).eq('entry_id', String(entryId)).eq('is_cover', true);
      for (const r of (data || [])) { try { await removeRowAndFiles({ rows: [] }, r); } catch (e) {} }
    },
    async captionCover(room, entryId, text) {
      const { data } = await supa.from('attachments').select('id').eq('user_id', userId)
        .eq('room', room).eq('entry_id', String(entryId)).eq('is_cover', true).limit(1);
      if (!data || !data.length) return;
      await supa.from('attachments').update({ caption: text }).eq('id', data[0].id).eq('user_id', userId);
    },
    printMat: printMat_,
    usage: usage_, usageLine: usageLine_, exportAlbum: exportAlbum_,
    sweepFrom: sweepFrom_, clearGhosts: clearGhosts_, fetchAllRows: fetchAllRows_,
    _youtubeId: youtubeId, _isGPhotos: isGPhotos,
  };
})();
