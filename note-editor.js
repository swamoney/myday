/* ============================================================================
   note-editor.js — MyDay shared rich-note editor ("NoteKit")
   ----------------------------------------------------------------------------
   ONE implementation of the notes editor, used by every room (Favourites,
   My Why roadmap, Circle pages, My Inner Life…). Fix things HERE, once.

   Include after config.js:   <script src="note-editor.js"></script>

   API (window.NoteEditor):
     .sanitize(html)      -> safe HTML (whitelist tags/classes; https-only media)
     .toHtml(value)       -> display HTML (legacy plain text auto-converted)
     .toPlain(value)      -> plain text (for previews & search)
     .toMarkdown(value)   -> Markdown (for exports; checklists/dividers included)
     .contentCSS()        -> CSS string for note content (for print windows)
     .mount(opts)         -> attach an editor. opts:
          toolbar   : element to build the toolbar into        (required)
          editor    : contenteditable element (the write view) (required)
          reader    : read-view element, checklist ticks live  (optional)
          onChange  : fn() called on any edit (debounce saves) (optional)
          onReaderChange: fn(cleanHtml) when a checkbox is
                          ticked in the READ view              (optional)
        returns { refresh(), focusEnd(), destroyPopovers() }

   STORED-CONTENT CLASS NAMES (do not rename — they live inside saved notes):
     tc-rose/sage/plum/gold/blue/grey · hl-yellow/green/pink/blue/grey
     fr-check · fr-cb · done
   Colours are CLASSES, not inline hex, so a palette change here restyles
   every note ever written.

   NOTE (2032 self): formatting runs on document.execCommand — deprecated but
   universally supported. If it ever breaks, replace ONLY the exec() calls
   below; the storage format and everything else stands.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- palettes (single source of truth) ---------- */
  var TEXT_SW = [
    { key: 'none', css: '' },
    { key: 'rose', css: '#c2415c' }, { key: 'sage', css: '#5a7050' },
    { key: 'plum', css: '#6d5474' }, { key: 'gold', css: '#8a6f43' },
    { key: 'blue', css: '#3a5b9c' }, { key: 'grey', css: '#8a94a8' }
  ];
  var HIGH_SW = [
    { key: 'none', css: '' },
    { key: 'yellow', css: '#fdf3c9' }, { key: 'green', css: '#e2efe7' },
    { key: 'pink', css: '#fbe4ea' },   { key: 'blue', css: '#e3e9f5' },
    { key: 'grey', css: '#ecebe5' }
  ];
  var CLASS_OK = /^(tc-(rose|sage|plum|gold|blue|grey)|hl-(yellow|green|pink|blue|grey)|fr-check|fr-cb|done)$/;
  var ALLOWED = { B:1, STRONG:1, I:1, EM:1, U:1, S:1, STRIKE:1, DEL:1, H3:1, UL:1, OL:1, LI:1,
                  BLOCKQUOTE:1, P:1, BR:1, IMG:1, A:1, DIV:1, SPAN:1, HR:1 };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function looksHtml(s) {
    return /<(p|br|b|i|u|h3|ul|ol|li|blockquote|strong|em|img|div|hr|a|span)\b/i.test(s || '');
  }

  /* ---------- format conversions ---------- */
  function toHtml(v) {
    v = String(v || '');
    if (!v.trim()) return '';
    if (looksHtml(v)) return v;
    return '<p>' + esc(v).replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
  }

  function sanitize(html) {
    var box = document.createElement('div');
    box.innerHTML = String(html || '');
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 8) { node.removeChild(ch); return; }          // comments
        if (ch.nodeType !== 1) return;                                    // text ok
        if (!ALLOWED[ch.tagName]) {                                       // unwrap
          while (ch.firstChild) node.insertBefore(ch.firstChild, ch);
          node.removeChild(ch); return;
        }
        /* Chrome writes strikethrough as an inline STYLE, not a tag; convert it
           to a real <s> before the style attribute is stripped below. */
        var deco = (ch.getAttribute('style') || '').toLowerCase();
        if (deco.indexOf('line-through') !== -1 && ch.tagName !== 'S' && ch.tagName !== 'STRIKE' && ch.tagName !== 'DEL') {
          var sWrap = document.createElement('s');
          while (ch.firstChild) sWrap.appendChild(ch.firstChild);
          ch.appendChild(sWrap);
        }
        Array.prototype.slice.call(ch.attributes).forEach(function (a) {
          var n = a.name.toLowerCase();
          var okImg = ch.tagName === 'IMG' && (n === 'src' || n === 'alt');
          var okA   = ch.tagName === 'A' && n === 'href';
          var okCls = n === 'class';
          var okCe  = n === 'contenteditable' && ch.classList.contains('fr-cb');
          if (!okImg && !okA && !okCls && !okCe) ch.removeAttribute(a.name);
        });
        if (ch.hasAttribute('class')) {
          var keep = (ch.getAttribute('class') || '').split(/\s+/).filter(function (c) { return CLASS_OK.test(c); });
          if (keep.length) ch.setAttribute('class', keep.join(' '));
          else ch.removeAttribute('class');
        }
        if (ch.tagName === 'IMG') {
          if (!/^https?:\/\//i.test(ch.getAttribute('src') || '')) { node.removeChild(ch); return; }
        }
        if (ch.tagName === 'A') {
          var hr = ch.getAttribute('href') || '';
          if (!/^https?:\/\//i.test(hr)) ch.removeAttribute('href');
          else { ch.setAttribute('target', '_blank'); ch.setAttribute('rel', 'noopener noreferrer'); }
        }
        if (ch.classList.contains('fr-cb')) ch.setAttribute('contenteditable', 'false');
        walk(ch);
      });
    })(box);
    return box.innerHTML;
  }

  function toPlain(v) {
    var s = String(v || '');
    if (!looksHtml(s)) return s;
    var box = document.createElement('div');
    box.innerHTML = s;
    return (box.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function toMarkdown(v) {
    var s = String(v || '');
    if (!s.trim()) return '';
    if (!looksHtml(s)) return s;
    var box = document.createElement('div');
    box.innerHTML = sanitize(s);
    var lines = [];
    function inline(node) {
      var out = '';
      node.childNodes.forEach(function (ch) {
        if (ch.nodeType === 3) { out += ch.textContent; return; }
        if (ch.nodeType !== 1) return;
        var t = ch.tagName, inner = inline(ch);
        if (t === 'B' || t === 'STRONG') out += '**' + inner + '**';
        else if (t === 'S' || t === 'STRIKE' || t === 'DEL') out += '~~' + inner + '~~';
        else if (t === 'I' || t === 'EM') out += '*' + inner + '*';
        else if (t === 'A') out += '[' + inner + '](' + (ch.getAttribute('href') || '') + ')';
        else if (t === 'IMG') out += '![' + (ch.getAttribute('alt') || '') + '](' + (ch.getAttribute('src') || '') + ')';
        else if (t === 'BR') out += '  \n';
        else out += inner;                                   // U + colour spans: text survives
      });
      return out;
    }
    box.childNodes.forEach(function (node) {
      if (node.nodeType === 3) { var t0 = node.textContent.trim(); if (t0) lines.push(t0); return; }
      if (node.nodeType !== 1) return;
      var t = node.tagName;
      if (t === 'H3') lines.push('## ' + inline(node));
      else if (t === 'BLOCKQUOTE') lines.push('> ' + inline(node).replace(/\n/g, '\n> '));
      else if (t === 'HR') lines.push('---');
      else if (t === 'UL' && node.classList.contains('fr-check')) {
        node.querySelectorAll(':scope > li').forEach(function (li) {
          var done = li.classList.contains('done');
          var clone = li.cloneNode(true);
          clone.querySelectorAll('.fr-cb').forEach(function (c) { c.remove(); });
          lines.push('- [' + (done ? 'x' : ' ') + '] ' + inline(clone).trim());
        });
      }
      else if (t === 'UL') node.querySelectorAll(':scope > li').forEach(function (li) { lines.push('- ' + inline(li)); });
      else if (t === 'OL') { var i = 1; node.querySelectorAll(':scope > li').forEach(function (li) { lines.push((i++) + '. ' + inline(li)); }); }
      else if (t === 'IMG') lines.push('![' + (node.getAttribute('alt') || '') + '](' + (node.getAttribute('src') || '') + ')');
      else lines.push(inline(node));
      lines.push('');
    });
    return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  /* ---------- content CSS (also used by print windows) ---------- */
  function contentCSS(scope) {
    var S = scope || '.nk-content';
    return [
      S + ' h3{font-size:1.17em;font-weight:600;margin:18px 0 6px;line-height:1.3}',
      S + ' blockquote{margin:12px 0;padding:4px 0 4px 16px;border-left:3px solid #e0c98a;color:#5a6478;font-style:italic}',
      S + ' ul{margin:10px 0;padding-left:24px}',
      S + ' ol{margin:10px 0;padding-left:26px}',
      S + ' li{margin:4px 0}',
      S + ' b,' + S + ' strong{font-weight:700}',
      S + ' a{color:#3a5b9c;text-decoration:underline}',
      S + ' img{max-width:100%;height:auto;border-radius:10px;margin:12px 0;display:block}',
      S + ' hr{border:none;border-top:1px solid #e2e8f0;margin:22px 0}',
      S + ' .tc-rose{color:#c2415c}' , S + ' .tc-sage{color:#5a7050}',
      S + ' .tc-plum{color:#6d5474}' , S + ' .tc-gold{color:#8a6f43}',
      S + ' .tc-blue{color:#3a5b9c}' , S + ' .tc-grey{color:#8a94a8}',
      S + ' .hl-yellow{background:#fdf3c9;padding:1px 3px;border-radius:3px}',
      S + ' .hl-green{background:#e2efe7;padding:1px 3px;border-radius:3px}',
      S + ' .hl-pink{background:#fbe4ea;padding:1px 3px;border-radius:3px}',
      S + ' .hl-blue{background:#e3e9f5;padding:1px 3px;border-radius:3px}',
      S + ' .hl-grey{background:#ecebe5;padding:1px 3px;border-radius:3px}',
      S + ' ul.fr-check{list-style:none;padding-left:2px;margin:10px 0}',
      S + ' ul.fr-check>li{display:flex;align-items:flex-start;gap:9px;margin:6px 0}',
      S + ' .fr-cb{flex-shrink:0;width:19px;height:19px;margin-top:4px;border:1.7px solid #cdd6e3;border-radius:5px;display:inline-block;cursor:pointer;position:relative;background:#fff}',
      S + ' .fr-cb:hover{border-color:#3d7a5c}',
      S + ' li.done>.fr-cb{background:#3d7a5c;border-color:#3d7a5c}',
      S + " li.done>.fr-cb:after{content:'';position:absolute;left:5px;top:1px;width:5px;height:10px;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg)}",
      S + ' li.done{color:#9aa4ba;text-decoration:line-through}'
    ].join('\n');
  }

  /* ---------- UI CSS (toolbar / popovers / dialogs), injected once ---------- */
  var UI_CSS = [
    '.nk-toolbar{position:relative;display:flex;gap:2px;align-items:center;flex-wrap:wrap;padding:5px;background:#f4f7fb;border:1px solid #e6ecf5;border-radius:10px}',
    '.nk-b.nk-on{background:#e8ecf3;color:#182233}',
    '.nk-b{min-width:32px;height:32px;padding:0 8px;border:none;background:transparent;border-radius:7px;color:#3a4560;cursor:pointer;font-size:15px;display:inline-flex;align-items:center;justify-content:center;font-family:inherit}',
    '.nk-b:hover{background:#e3e9f2}',
    '.nk-b.on{background:#0F2D5C;color:#fff}',
    '.nk-b.can{background:#fdf3d3;color:#9a7b1a}',
    '.nk-b.off{color:#c3ccdb;cursor:default}',
    '.nk-b.off:hover{background:transparent}',
    '.nk-b svg{width:17px;height:17px}',
    '.nk-sep{width:1px;height:20px;background:#dce3ee;margin:0 4px}',
    '.nk-pop{position:absolute;top:44px;left:6px;background:#fff;border:1px solid #dce3ee;border-radius:11px;box-shadow:0 12px 28px rgba(20,30,60,.16);padding:9px;display:flex;gap:6px;flex-wrap:wrap;width:186px;z-index:30}',
    '.nk-pop.hidden{display:none}',
    '.nk-sw{width:26px;height:26px;border-radius:7px;border:1px solid rgba(0,0,0,.10);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;font-family:inherit}',
    '.nk-sw.none{background:#fff;color:#8a94a8;font-size:14px}',
    '.nk-sw:hover{transform:scale(1.08)}',
    '.nk-content[contenteditable]:empty:before{content:attr(data-placeholder);color:#c3ccdb;font-style:italic}',
    '.nk-content[contenteditable]{outline:none}',
    /* dialogs — self-contained, above any full-screen reader */
    '.nk-overlay{position:fixed;inset:0;background:rgba(10,19,37,.45);backdrop-filter:blur(4px);z-index:900;display:flex;align-items:flex-start;justify-content:center;padding:60px 14px;overflow-y:auto}',
    '.nk-overlay.hidden{display:none}',
    '.nk-modal{width:100%;max-width:420px;background:#fff;border-radius:16px;padding:22px 20px;box-shadow:0 30px 70px rgba(10,20,40,.35);font-family:inherit}',
    '.nk-mt{font-size:18px;font-weight:600;color:#182233;margin-bottom:2px}',
    '.nk-ms{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#8189a0;margin-bottom:14px}',
    '.nk-fld{margin-bottom:12px}',
    '.nk-fld label{display:block;font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#8189a0;margin-bottom:5px}',
    '.nk-fld input{width:100%;background:#f4f7fb;border:1px solid #dce3ee;border-radius:9px;padding:10px 12px;font-size:14px;color:#182233;font-family:inherit;box-sizing:border-box}',
    '.nk-fld input:focus{outline:none;border-color:#c9a94a;background:#fff}',
    '.nk-err{font-size:12px;color:#8A1F1A;background:#FCE9E2;border-radius:6px;padding:6px 10px;margin-bottom:10px}',
    '.nk-find{font-size:11.5px;color:#8a94a8;margin:-4px 0 12px}',
    '.nk-find a{color:#3a5b9c;font-weight:600;text-decoration:none}',
    '.nk-find a:hover{text-decoration:underline}',
    '.nk-find-tip{display:block;margin-top:3px;font-size:10.5px;color:#b0b8c8}',
    '.nk-content img.nk-img-sel{outline:3px solid #c9a94a;outline-offset:2px}',
    '.nk-imgdel{position:fixed;z-index:950;display:none;align-items:center;gap:6px;font-family:inherit;font-size:12px;font-weight:600;color:#8A1F1A;background:#fff;border:1px solid #e8c9c4;border-radius:8px;padding:6px 11px;cursor:pointer;box-shadow:0 6px 18px rgba(20,30,60,.18)}',
    '.nk-imgdel.show{display:inline-flex}',
    '.nk-err.hidden{display:none}',
    '.nk-actions{display:flex;align-items:center;gap:8px;margin-top:16px}',
    '.nk-btn{font-family:inherit;font-size:13px;font-weight:600;border-radius:9px;padding:9px 16px;cursor:pointer;border:1px solid #dce3ee;background:#fff;color:#3a4560}',
    '.nk-btn.pri{background:#0F2D5C;border-color:#0F2D5C;color:#fff}',
    '.nk-btn.del{border-color:#e8c9c4;color:#8A1F1A;background:#fff}',
    '.nk-btn.hidden{display:none}',
    '.nk-hist{max-width:560px}',
    '.nk-vlist{max-height:56vh;overflow-y:auto;border:1px solid #e6ecf5;border-radius:11px}',
    '.nk-vempty{padding:18px 14px;font-size:12.5px;color:#8a94a8}',
    '.nk-vrow{border-top:1px solid #f0f3f8}',
    '.nk-vrow:first-child{border-top:none}',
    '.nk-vhead{display:flex;align-items:center;gap:10px;padding:10px 12px;font-size:12.5px;flex-wrap:wrap}',
    '.nk-vwhen{font-weight:600;color:#28324B;min-width:150px}',
    '.nk-vmeta{flex:1;color:#8a94a8;font-size:11px}',
    '.nk-vact{font-family:inherit;font-size:11.5px;font-weight:600;color:#3a5b9c;background:none;border:none;cursor:pointer;padding:4px 6px}',
    '.nk-vact.pri{color:#9a7b1a;background:#fdf3d3;border-radius:7px;padding:5px 10px}',
    '.nk-vact:disabled{opacity:.6;cursor:default}',
    '.nk-vprev{padding:4px 14px 14px;font-family:Georgia,serif;font-size:14px;line-height:1.65;color:#3a4560;background:#fbfcfe;border-top:1px dashed #e6ecf5}',
    contentCSS('.nk-content')
  ].join('\n');

  var cssInjected = false;
  function injectStyles() {
    if (cssInjected) return;
    cssInjected = true;
    var st = document.createElement('style');
    st.setAttribute('data-note-editor', '1');
    st.textContent = UI_CSS;
    document.head.appendChild(st);
  }

  /* ---------- shared dialogs (built once, serve every instance) ---------- */
  var dlg = null;           // { imgOverlay, linkOverlay, … }
  var activeInst = null;    // which editor instance opened the dialog

  function buildDialogs() {
    if (dlg) return;
    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<div class="nk-overlay hidden" data-nk="img">' +
        '<div class="nk-modal">' +
          '<div class="nk-mt">Insert image</div><div class="nk-ms">paste an image link</div>' +
          '<div class="nk-fld"><label>Image URL</label><input data-nk-f="imgUrl" placeholder="paste photo link (Unsplash, Pexels…)" inputmode="url"></div>' +
          '<div class="nk-find">find images on ' +
            '<a href="https://www.pexels.com/search/" target="_blank" rel="noopener noreferrer">Pexels</a> · ' +
            '<a href="https://commons.wikimedia.org/" target="_blank" rel="noopener noreferrer">Wikimedia</a>' +
            '<span class="nk-find-tip">just copy the photo\u2019s page link and paste it above \u2014 the image is fetched automatically</span></div>' +
          '<div class="nk-fld"><label>Caption (optional)</label><input data-nk-f="imgAlt" placeholder="What this shows"></div>' +
          '<div class="nk-err hidden" data-nk-f="imgErr"></div>' +
          '<div class="nk-actions"><span style="flex:1"></span>' +
            '<button type="button" class="nk-btn" data-nk-f="imgCancel">Cancel</button>' +
            '<button type="button" class="nk-btn pri" data-nk-f="imgOk">Insert</button></div>' +
        '</div></div>' +
      '<div class="nk-overlay hidden" data-nk="link">' +
        '<div class="nk-modal">' +
          '<div class="nk-mt">Add link</div><div class="nk-ms">attach a URL to the selected text</div>' +
          '<div class="nk-fld"><label>URL</label><input data-nk-f="linkUrl" placeholder="https://…" inputmode="url"></div>' +
          '<div class="nk-err hidden" data-nk-f="linkErr"></div>' +
          '<div class="nk-actions">' +
            '<button type="button" class="nk-btn del hidden" data-nk-f="linkRemove">Remove link</button>' +
            '<span style="flex:1"></span>' +
            '<button type="button" class="nk-btn" data-nk-f="linkCancel">Cancel</button>' +
            '<button type="button" class="nk-btn pri" data-nk-f="linkOk">Add</button></div>' +
        '</div></div>';
    document.body.appendChild(wrap);
    var f = function (k) { return wrap.querySelector('[data-nk-f="' + k + '"]'); };
    dlg = {
      root: wrap,
      img: wrap.querySelector('[data-nk="img"]'),
      link: wrap.querySelector('[data-nk="link"]'),
      imgUrl: f('imgUrl'), imgAlt: f('imgAlt'), imgErr: f('imgErr'),
      linkUrl: f('linkUrl'), linkErr: f('linkErr'), linkRemove: f('linkRemove'),
      linkOk: f('linkOk')
    };
    f('imgCancel').addEventListener('click', function () { dlg.img.classList.add('hidden'); });
    f('linkCancel').addEventListener('click', function () { dlg.link.classList.add('hidden'); });
    dlg.img.addEventListener('click', function (e) { if (e.target === dlg.img) dlg.img.classList.add('hidden'); });
    dlg.link.addEventListener('click', function (e) { if (e.target === dlg.link) dlg.link.classList.add('hidden'); });

    f('imgOk').addEventListener('click', function () {
      if (!activeInst) return;
      var url = resolveImageUrl(dlg.imgUrl.value);
      if (!/^https?:\/\//i.test(url)) { dlg.imgErr.textContent = 'Enter a valid image link (https://…)'; dlg.imgErr.classList.remove('hidden'); return; }
      var alt = (dlg.imgAlt.value || '').trim();
      dlg.img.classList.add('hidden');
      activeInst.insertHTML('<img src="' + url.replace(/"/g, '&quot;') + '" alt="' + esc(alt) + '"><p><br></p>');
    });
    f('linkOk').addEventListener('click', function () {
      if (!activeInst) return;
      var url = normUrl(dlg.linkUrl.value);
      if (!/^https?:\/\//i.test(url)) { dlg.linkErr.textContent = 'Enter a valid link (https://…)'; dlg.linkErr.classList.remove('hidden'); return; }
      dlg.link.classList.add('hidden');
      activeInst.applyLink(url);
    });
    f('linkRemove').addEventListener('click', function () {
      if (!activeInst) return;
      dlg.link.classList.add('hidden');
      activeInst.removeLink();
    });

    /* floating "Remove image" button — appears when an image is tapped */
    var del = document.createElement('button');
    del.type = 'button';
    del.className = 'nk-imgdel';
    del.innerHTML = '\u2715 Remove image';
    document.body.appendChild(del);
    dlg.imgDel = del;
    del.addEventListener('mousedown', function (e) { e.preventDefault(); });
    del.addEventListener('click', function () {
      if (dlg._selImg && dlg._selImg.parentNode) {
        var img = dlg._selImg;
        var owner = dlg._selOwner;
        if (owner && owner.recordNow) owner.recordNow();
        img.parentNode.removeChild(img);
        hideImgDel();
        if (owner && owner.onImgRemoved) owner.onImgRemoved();
      }
    });
    function hideImgDel() {
      if (dlg._selImg) dlg._selImg.classList.remove('nk-img-sel');
      dlg._selImg = null; dlg._selOwner = null;
      del.classList.remove('show');
    }
    dlg.hideImgDel = hideImgDel;
    window.addEventListener('scroll', hideImgDel, true);
    window.addEventListener('resize', hideImgDel);
    document.addEventListener('click', function (e) {
      if (e.target === del || e.target.closest('.nk-imgdel')) return;
      if (e.target.tagName === 'IMG') return;             // image taps handled per-instance
      hideImgDel();
    });
  }


  /* Accept the photo PAGE link (what you naturally copy, esp. on a phone) and
     convert it to the direct image. Known stable patterns:
       unsplash.com/photos/<slug>            -> <same>/download   (302 to image)
       pexels.com/photo/...-<id>/            -> images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg
       commons.wikimedia.org/wiki/File:<n>   -> Special:FilePath/<n> (302 to file)
     If a pattern ever changes, pasting the raw image address still works. */
  function resolveImageUrl(u) {
    u = String(u || '').trim();
    // Share-sheets often copy "Photo title … https://…" — keep only the link.
    var found = u.match(/https?:\/\/\S+/i);
    if (found) u = found[0];
    u = normUrl(u);
    var m;
    // already a direct image host — leave untouched
    if (/^https?:\/\/(images\.pexels\.com|upload\.wikimedia\.org)\//i.test(u)) return u;
    // pexels photo page (id is the trailing number in the slug)
    m = u.match(/^https?:\/\/(?:www\.)?pexels\.com\/photo\/[^?#]*?(\d+)\/?(?:[?#].*)?$/i);
    if (m) return 'https://images.pexels.com/photos/' + m[1] + '/pexels-photo-' + m[1] + '.jpeg';
    // wikimedia commons File: page
    m = u.match(/^https?:\/\/commons\.wikimedia\.org\/wiki\/File:([^?#]+)/i);
    if (m) return 'https://commons.wikimedia.org/wiki/Special:FilePath/' + m[1];
    return u;
  }

  function normUrl(u) {
    u = String(u || '').trim();
    if (u && !/^https?:\/\//i.test(u) && /^[\w-]+(\.[\w-]+)+/.test(u)) u = 'https://' + u;
    return u;
  }


  /* ---------- version history (Option B, decided Jul 2026) ----------
     One shared note_versions table serves every room. The page connects a
     provider once; the module records pre-session snapshots, prunes to the
     newest 20 per note, and renders the History panel. Restore always saves
     the current text as a fresh version first, so nothing can be lost. */
  var V = { provider: null, MAX: 20 };
  function vCtx() { return V.provider ? V.provider() : null; }
  var versions = {
    connect: function (fn) { V.provider = fn; },
    record: function (source, sourceId, content) {
      var c = vCtx(); if (!c || !c.supa || !c.userId || content == null) return Promise.resolve();
      return c.supa.from('note_versions')
        .insert({ user_id: c.userId, source: source, source_id: String(sourceId), content: String(content) })
        .then(function () {
          return c.supa.from('note_versions').select('id')
            .eq('user_id', c.userId).eq('source', source).eq('source_id', String(sourceId))
            .order('saved_at', { ascending: false }).range(V.MAX, V.MAX + 60);
        })
        .then(function (q) {
          var ids = (q && q.data || []).map(function (r) { return r.id; });
          if (!ids.length) return null;
          return c.supa.from('note_versions').delete().in('id', ids).eq('user_id', c.userId);
        })
        .then(function () {}, function () {});
    },
    list: function (source, sourceId) {
      var c = vCtx(); if (!c || !c.supa || !c.userId) return Promise.resolve([]);
      return c.supa.from('note_versions').select('id,content,saved_at')
        .eq('user_id', c.userId).eq('source', source).eq('source_id', String(sourceId))
        .order('saved_at', { ascending: false }).limit(V.MAX)
        .then(function (q) { return (q && q.data) || []; }, function () { return []; });
    }
  };

  var histDlg = null;
  function buildHistory() {
    if (histDlg) return;
    injectStyles();
    var wrap = document.createElement('div');
    wrap.className = 'nk-overlay hidden';
    wrap.innerHTML =
      '<div class="nk-modal nk-hist">' +
        '<div class="nk-mt">History</div>' +
        '<div class="nk-ms" data-h="sub">newest first &middot; last ' + V.MAX + ' kept</div>' +
        '<div class="nk-vlist" data-h="list"></div>' +
        '<div class="nk-actions"><span style="flex:1"></span>' +
          '<button type="button" class="nk-btn" data-h="close">Close</button></div>' +
      '</div>';
    document.body.appendChild(wrap);
    histDlg = { root: wrap,
      list: wrap.querySelector('[data-h="list"]'),
      close: wrap.querySelector('[data-h="close"]') };
    histDlg.close.addEventListener('click', function () { wrap.classList.add('hidden'); });
    wrap.addEventListener('click', function (e) { if (e.target === wrap) wrap.classList.add('hidden'); });
  }
  function fmtWhen(iso) {
    try {
      return new Date(iso).toLocaleString(undefined,
        { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) { return String(iso || ''); }
  }
  function openHistory(opts) {
    buildHistory();
    var box = histDlg.list;
    box.innerHTML = '<div class="nk-vempty">Loading&hellip;</div>';
    histDlg.root.classList.remove('hidden');
    versions.list(opts.source, opts.sourceId).then(function (rows) {
      if (!rows.length) {
        box.innerHTML = '<div class="nk-vempty">No versions yet. One is kept each time an editing session changes this note.</div>';
        return;
      }
      box.innerHTML = rows.map(function (r, i) {
        var words = toPlain(r.content).split(/\s+/).filter(Boolean).length;
        return '<div class="nk-vrow" data-i="' + i + '">' +
          '<div class="nk-vhead">' +
            '<span class="nk-vwhen">' + esc(fmtWhen(r.saved_at)) + '</span>' +
            '<span class="nk-vmeta">' + words + ' words</span>' +
            '<button type="button" class="nk-vact" data-view="' + i + '">View</button>' +
            '<button type="button" class="nk-vact pri" data-restore="' + i + '">Restore</button>' +
          '</div>' +
          '<div class="nk-vprev hidden nk-content" data-prev="' + i + '"></div>' +
        '</div>';
      }).join('');
      box.querySelectorAll('[data-view]').forEach(function (b) {
        b.addEventListener('click', function () {
          var i = b.dataset.view;
          var p = box.querySelector('[data-prev="' + i + '"]');
          var showing = !p.classList.contains('hidden');
          box.querySelectorAll('.nk-vprev').forEach(function (x) { x.classList.add('hidden'); });
          box.querySelectorAll('[data-view]').forEach(function (x) { x.textContent = 'View'; });
          if (!showing) { p.innerHTML = toHtml(rows[i].content) || '<i>(empty)</i>'; p.classList.remove('hidden'); b.textContent = 'Hide'; }
        });
      });
      box.querySelectorAll('[data-restore]').forEach(function (b) {
        b.addEventListener('click', function () {
          var r = rows[b.dataset.restore];
          b.textContent = 'Restoring\u2026'; b.disabled = true;
          var cur = opts.getCurrent ? opts.getCurrent() : null;
          var pre = (cur != null && cur !== r.content)
            ? versions.record(opts.source, opts.sourceId, cur)   // current is preserved first
            : Promise.resolve();
          pre.then(function () {
            if (opts.applyRestore) opts.applyRestore(r.content);
            histDlg.root.classList.add('hidden');
          });
        });
      });
    });
  }


  /* ---------- print/PDF opener ----------
     Mobile browsers often show a BLANK tab for window.open('')+document.write.
     A Blob URL is a real document, so it renders everywhere. The page keeps its
     own auto-print script; if a mobile browser ignores scripted print, the
     content is still fully visible for Share -> Print / Save as PDF. */
  function openPrint(fullHtml) {
    try {
      var blob = new Blob([String(fullHtml)], { type: 'text/html' });
      var url = URL.createObjectURL(blob);
      var w = window.open(url, '_blank');
      if (!w) { URL.revokeObjectURL(url); alert('Allow pop-ups to print / save as PDF.'); return; }
      setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
    } catch (e) { alert('Could not open the print view.'); }
  }


  /* ---------- close-save protection ----------
     Pages register a dirty-probe (unsaved changes?) and a flush (save now).
     Leaving the tab: pending saves are flushed best-effort, and if anything is
     still unsaved or a save is mid-flight, the browser shows its own
     "leave site?" warning. Backgrounding the tab (visibilitychange -> hidden,
     the reliable event on mobile) flushes immediately. */
  var G = { probes: [], flushes: [], inflight: 0 };
  var guard = {
    register: function (probe, flush) {
      if (probe) G.probes.push(probe);
      if (flush) G.flushes.push(flush);
    },
    begin: function () { G.inflight++; },
    end: function () { G.inflight = Math.max(0, G.inflight - 1); },
    isDirty: function () {
      if (G.inflight > 0) return true;
      for (var i = 0; i < G.probes.length; i++) {
        try { if (G.probes[i]()) return true; } catch (e) {}
      }
      return false;
    }
  };
  function flushAll() { G.flushes.forEach(function (f) { try { f(); } catch (e) {} }); }
  window.addEventListener('beforeunload', function (e) {
    if (!guard.isDirty()) return;      // everything saved: leave silently
    flushAll();                        // genuinely unsaved: start best-effort saves
    e.preventDefault(); e.returnValue = ''; return '';
  });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flushAll();
  });


  /* ---------- cross-device conflict protection ----------
     Optimistic locking: every save carries the updated_at stamp the note was
     LOADED with. If the row's stamp changed meanwhile (another device wrote),
     the update matches nothing, we fetch theirs, save BOTH texts to version
     history, and ask which to keep. Nothing can be silently overwritten. */
  function casSave(o) {
    var upd = {}; upd[o.field] = o.content; upd.updated_at = new Date().toISOString();
    var q = o.supa.from(o.table).update(upd).eq('id', o.id).eq('user_id', o.userId);
    if (o.loaded) q = q.eq('updated_at', o.loaded);
    return q.select().then(function (res) {
      if (res.error) throw res.error;
      if (res.data && res.data.length) return { ok: true, stamp: res.data[0].updated_at };
      return o.supa.from(o.table).select('*').eq('id', o.id).eq('user_id', o.userId).single()
        .then(function (r2) {
          if (r2.error || !r2.data) throw (r2.error || new Error('row gone'));
          return { conflict: true, theirs: r2.data };
        });
    });
  }
  function resolveConflict(o) {
    // Both versions are preserved BEFORE either wins — a conflict can never lose text.
    return versions.record(o.source, o.id, o.mine)
      .then(function () { return versions.record(o.source, o.id, o.theirs); })
      .then(function () {
        var keepMine = window.confirm(
          'This note was changed on another device since you opened it.\n\n' +
          'OK \u2014 keep THIS device\u2019s text (the other version stays in History)\n' +
          'Cancel \u2014 load the OTHER device\u2019s text (this text stays in History)');
        return keepMine ? Promise.resolve(o.onKeepMine()).then(function(){ return 'mine'; })
                        : Promise.resolve(o.onTakeTheirs()).then(function(){ return 'theirs'; });
      });
  }

  /* ---------- whole-library export ----------
     One Markdown file of every note in every room (Favourites, Inner Life,
     Roadmaps, Circle). My Wisdom is excluded: it archives third-party HTML
     pages, which belong in their own export, not a notes file. */
  function _grab(c, table, order) {
    var q = c.supa.from(table).select('*').eq('user_id', c.userId);
    if (order) q = q.order(order, { ascending: true });
    return q.then(function (r) { return (r && r.data) || []; }, function () { return []; });
  }
  var EXPORT_TABLES = ['entries','user_prefs','bookmarks','iw_entries','wip_notes',
                       'why_pillars','why_mantras','why_circle','wisdom','note_versions'];
  function _dl(name, text, type) {
    var blob = new Blob([text], { type: type });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }
  function _readme(day, jsonName, mdName) {
    return [
'=====================================================',
'  MYDAY \u2014 BACKUP FOLDER',
'  Created: ' + day,
'  READ THIS FIRST',
'=====================================================',
'',
'WHAT THIS IS',
'------------',
"A complete backup of the MyDay app: every note, journal",
'entry, favourite, plan \u2014 all rooms, all data.',
'',
'This backup is 3 files:',
'  1. ' + jsonName + '   <- THE IMPORTANT ONE (all data)',
'  2. ' + mdName + '     <- notes in human-readable form',
'  3. READ-ME-FIRST.txt        <- this note',
'',
'JUST WANT TO READ THE NOTES?',
'-----------------------------',
'Open the .md file. Any computer or phone can open it.',
'No app, no account, no internet needed.',
'(Daily logs and Wisdom pages live in the .json only.)',
'',
'THE 5 RULES  (DO / DON\u2019T)',
'-------------------------',
'DO   keep these files in a private, backed-up place',
'     (Google Drive or iCloud \u2014 never a public place).',
'DO   make a fresh export on the 1st of every month.',
'     Old ones can be deleted; keep the latest 2-3.',
'DO   test once a year: open the .md, check it reads fine.',
'DON\u2019T upload the .json ANYWHERE public (not GitHub,',
'     not email to strangers). It is your entire life',
'     in one file.',
'DON\u2019T edit or rename these files. Read: yes. Change: no.',
'',
'IF THE APP IS LOST \u2014 HOW TO BRING IT BACK',
'-----------------------------------------',
'You need three things. All free.',
'  A. These files (you have them \u2014 the hard part is done)',
'  B. The app\u2019s code:    github.com/swamoney/myday',
'  C. A database at:     supabase.com',
'',
'Steps, in plain words:',
'  1. Make a new free project at supabase.com',
'  2. In its "SQL Editor", open the file  sql/myday_setup.sql',
'     from the GitHub code (step B), paste it in, press RUN.',
'     This rebuilds the empty app \u2014 like new shelves.',
'  3. Put the new project\u2019s web address and key into the',
'     code file  config.js  (two lines \u2014 instructions are',
'     written inside that file).',
'  4. Open the app, create your login, sign in.',
'  5. Open the app\u2019s page  restore.html  and upload the',
'     .json file. This refills the shelves \u2014 every note,',
'     with its dates and colours.',
'',
'Not confident doing this alone? That is fine.',
'Show THIS NOTE and the .json file to any software',
'developer \u2014 or any AI assistant of your time \u2014 and say:',
'"Please restore this backup." This note plus that file',
'is everything they need. Expect it to take under an hour.',
'',
'FOR FAMILY',
'----------',
'If you are reading this on the owner\u2019s behalf: the .md',
'file is his writing \u2014 journals, notes, plans \u2014 readable',
'as-is. Nothing here needs a password to READ.',
'Treat it with care.',
'',
'=====================================================',
'  Three files. Everything safe.',
'====================================================='
    ].join('\n');
  }
  function exportLibrary() {
    var c = vCtx(); if (!c || !c.supa || !c.userId) { alert('Not signed in.'); return; }
    Promise.all(EXPORT_TABLES.map(function (t) {
      return c.supa.from(t).select('*').eq('user_id', c.userId)
        .then(function (r) { return { table: t, rows: (r && r.data) || [], error: r && r.error ? String(r.error.message || r.error) : null }; },
              function (e) { return { table: t, rows: [], error: String(e && e.message || e) }; });
    })).then(function (results) {
      var day = new Date().toISOString().slice(0, 10);
      var jsonName = 'myday-' + day + '.json';
      var mdName = 'myday-' + day + '.md';

      /* ---- 1) the machine file: every table, every row, verbatim ---- */
      var pack = { app: 'MyDay', format: 1, exported: new Date().toISOString(), tables: {} };
      var problems = [];
      results.forEach(function (r) {
        pack.tables[r.table] = r.rows;
        if (r.error) problems.push(r.table + ': ' + r.error);
      });
      if (problems.length) pack.export_warnings = problems;
      _dl(jsonName, JSON.stringify(pack, null, 1), 'application/json;charset=utf-8');

      /* ---- 2) the human file: the notes system as a readable book ---- */
      var by = {}; results.forEach(function (r) { by[r.table] = r.rows; });
      var bms = by.bookmarks || [], iw = by.iw_entries || [], pillars = by.why_pillars || [],
          circle = by.why_circle || [], mantras = by.why_mantras || [];
      var d = function (iso) { try { return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; } };
      var srt = function (arr) { return arr.slice().sort(function (a, b) { return String(a.created_at || '').localeCompare(String(b.created_at || '')); }); };
      var md = '# MyDay \u2014 all notes\n\n_Exported ' + d(new Date().toISOString()) +
        '. This file is the readable notes book; the matching .json holds the FULL app (daily logs, wisdom, settings, history) losslessly._\n\n';

      md += '\n---\n\n# My Favourites\n';
      ['all-time','books','podcasts','marathi','movies','music'].forEach(function (s) {
        var list = srt(bms.filter(function (b) { return (b.section || 'all-time') === s; }));
        if (!list.length) return;
        md += '\n## ' + s + '\n';
        list.forEach(function (b) {
          md += '\n### ' + (b.title || '(untitled)') + '\n';
          var meta = [];
          if (b.created_at) meta.push('saved ' + d(b.created_at));
          if (b.type) meta.push(b.type);
          if (b.tags && b.tags.length) meta.push('tags: ' + [].concat(b.tags).join(', '));
          if (b.url) meta.push(b.url);
          if (b.source_url) meta.push('source: ' + b.source_url);
          if (meta.length) md += '_' + meta.join(' \u00b7 ') + '_\n';
          var body = toMarkdown(b.note);
          if (body) md += '\n' + body + '\n';
        });
      });

      md += '\n---\n\n# My Inner Life\n';
      srt(iw).forEach(function (e) {
        md += '\n## ' + (e.title || '(untitled)') + '\n';
        var meta = [];
        if (e.kind) meta.push(e.kind);
        if (e.created_at) meta.push('written ' + d(e.created_at));
        if (e.tags && e.tags.length) meta.push('tags: ' + [].concat(e.tags).join(', '));
        if (meta.length) md += '_' + meta.join(' \u00b7 ') + '_\n';
        if (e.essence) md += '\n> ' + e.essence + '\n';
        var body = toMarkdown(e.body);
        if (body) md += '\n' + body + '\n';
      });

      md += '\n---\n\n# My Why \u2014 mantras\n';
      srt(mantras).forEach(function (m) {
        md += '\n> **' + (m.text || '') + '**' + (m.favourite ? ' \u2605' : '') + '\n';
        if (m.meaning) md += '>\n> ' + m.meaning + '\n';
        if (m.source) md += '>\n> _' + m.source + '_\n';
      });

      md += '\n---\n\n# My Why \u2014 roadmaps\n';
      pillars.forEach(function (p) {
        var rd = null; try { rd = JSON.parse(p.roadmap || 'null'); } catch (e) {}
        if (!rd || (!String(rd.essay || '').trim() && !(rd.milestones || []).length)) return;
        md += '\n## ' + (p.label || '(why)') + '\n';
        var body = toMarkdown(rd.essay);
        if (body) md += '\n' + body + '\n';
        (rd.milestones || []).forEach(function (m) {
          md += '- ' + (m.y ? m.y + ' \u2014 ' : '') + (m.t || '') + '\n';
        });
      });

      md += '\n---\n\n# My Circle\n';
      circle.forEach(function (p) {
        var pg = null; try { pg = JSON.parse(p.page || 'null'); } catch (e) {}
        var hasPage = pg && (String(pg.essay || '').trim() || (pg.moments || []).length);
        if (!hasPage && !(p.note || '').trim()) return;
        md += '\n## ' + (p.name || '(person)') + '\n';
        if (p.note) md += '_' + p.note + '_\n';
        if (hasPage) {
          var body = toMarkdown(pg.essay);
          if (body) md += '\n' + body + '\n';
          (pg.moments || []).forEach(function (m) {
            md += '- ' + (m.y ? m.y + ' \u2014 ' : '') + (m.t || '') + '\n';
          });
        }
      });
      _dl(mdName, md, 'text/markdown;charset=utf-8');

      /* ---- 3) the note for the worst day ---- */
      _dl('READ-ME-FIRST.txt', _readme(d(new Date().toISOString()), jsonName, mdName), 'text/plain;charset=utf-8');

      if (problems.length) alert('Export finished, but some tables had problems:\n' + problems.join('\n') + '\nThe .json lists these under export_warnings.');
    });
  }
  /* ---------- toolbar definition ---------- */
  var SVG = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  var ICONS = {
    strike: '<svg viewBox="0 0 24 24" ' + SVG + '><path d="M17 6.5c-.8-1.5-2.6-2.5-5-2.5-2.9 0-5 1.5-5 3.7 0 1.5 1 2.6 3 3.3"/><path d="M7 17.5c.8 1.5 2.6 2.5 5 2.5 2.9 0 5-1.5 5-3.7 0-1.5-1-2.6-3-3.3"/><path d="M4 12h16"/></svg>',
    spell: '<svg viewBox="0 0 24 24" ' + SVG + '><path d="M4 16c0-4 2-7 4.5-7s4.5 3 4.5 7"/><path d="M4.8 13.5h7.4"/><path d="m14.5 15.5 2.5 2.5 4.5-5"/></svg>',
    clearfmt: '<svg viewBox="0 0 24 24" ' + SVG + '><path d="M4 6V4h12v2"/><path d="M10 4v14"/><path d="M7 18h6"/><path d="m16.5 13.5 5 5"/><path d="m21.5 13.5-5 5"/></svg>',
    undo: '<svg viewBox="0 0 24 24" ' + SVG + '><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg>',
    redo: '<svg viewBox="0 0 24 24" ' + SVG + '><path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/></svg>',
    bold: '<b style="font-weight:800">B</b>',
    italic: '<i style="font-family:Georgia,serif">I</i>',
    under: '<span style="text-decoration:underline">U</span>',
    tcol: '<span style="font-weight:800;border-bottom:3px solid #c2415c;line-height:1">A</span>',
    hcol: '<span style="font-weight:800;background:#fdf3c9;padding:0 3px;border-radius:3px">A</span>',
    head: '<span style="font-weight:700">H</span>',
    quote: '<svg viewBox="0 0 24 24" ' + SVG + '><path d="M6 17h3l2-4V7H5v6h3zM14 17h3l2-4V7h-6v6h3z"/></svg>',
    ul: '<svg viewBox="0 0 24 24" ' + SVG + '><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4.5" cy="6" r="1.2" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="4.5" cy="18" r="1.2" fill="currentColor" stroke="none"/></svg>',
    ol: '<svg viewBox="0 0 24 24" ' + SVG + '><line x1="10" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="10" y1="18" x2="20" y2="18"/><text x="2" y="8" font-size="7" fill="currentColor" stroke="none" font-family="monospace">1</text><text x="2" y="14.5" font-size="7" fill="currentColor" stroke="none" font-family="monospace">2</text><text x="2" y="21" font-size="7" fill="currentColor" stroke="none" font-family="monospace">3</text></svg>',
    check: '<svg viewBox="0 0 24 24" ' + SVG + '><rect x="3" y="4" width="7" height="7" rx="1.5"/><path d="M4.5 7.5l1.5 1.5 2.5-3"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><line x1="13" y1="7.5" x2="21" y2="7.5"/><line x1="13" y1="17.5" x2="21" y2="17.5"/></svg>',
    link: '<svg viewBox="0 0 24 24" ' + SVG + '><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>',
    img: '<svg viewBox="0 0 24 24" ' + SVG + '><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="M21 16l-5-5L5 21"/></svg>',
    hr: '<svg viewBox="0 0 24 24" ' + SVG + '><line x1="3" y1="12" x2="21" y2="12"/><circle cx="12" cy="7" r="0.9" fill="currentColor" stroke="none"/><circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none"/></svg>'
  };

  /* ---------- mount ---------- */
  function mount(opts) {
    injectStyles();
    buildDialogs();
    var editor = opts.editor, reader = opts.reader || null, toolbar = opts.toolbar;
    var onChange = opts.onChange || function () {};
    var savedRange = null;

    editor.classList.add('nk-content');
    editor.setAttribute('spellcheck', 'false');   // opt-in via the toolbar toggle
    if (reader) reader.classList.add('nk-content');
    toolbar.classList.add('nk-toolbar');

    /* toolbar DOM */
    toolbar.innerHTML =
      btn('act', 'undo', '', 'Undo', ICONS.undo) +
      btn('act', 'redo', '', 'Redo', ICONS.redo) +
      '<span class="nk-sep"></span>' +
      btn('cmd', 'bold', '', 'Bold', ICONS.bold) +
      btn('cmd', 'italic', '', 'Italic', ICONS.italic) +
      btn('cmd', 'underline', '', 'Underline', ICONS.under) +
      btn('cmd', 'strikeThrough', '', 'Strikethrough', ICONS.strike) +
      '<span class="nk-sep"></span>' +
      btn('pop', 'text', '', 'Text colour', ICONS.tcol) +
      btn('pop', 'high', '', 'Highlight', ICONS.hcol) +
      btn('act', 'clearfmt', '', 'Clear formatting (keeps the words)', ICONS.clearfmt) +
      btn('act', 'spell', '', 'Spell-check (browser); off by default so \u092e\u0930\u093e\u0920\u0940 stays unmarked', ICONS.spell) +
      '<span class="nk-sep"></span>' +
      btn('cmd', 'formatBlock', 'h3', 'Heading', ICONS.head) +
      btn('cmd', 'formatBlock', 'blockquote', 'Quote', ICONS.quote) +
      btn('cmd', 'insertUnorderedList', '', 'Bullet list', ICONS.ul) +
      btn('cmd', 'insertOrderedList', '', 'Numbered list', ICONS.ol) +
      btn('act', 'check', '', 'Checklist', ICONS.check) +
      '<span class="nk-sep"></span>' +
      btn('act', 'link', '', 'Link', ICONS.link) +
      btn('act', 'img', '', 'Insert image by link', ICONS.img) +
      btn('act', 'hr', '', 'Divider', ICONS.hr) +
      '<div class="nk-pop hidden" data-nk-swpop="text"></div>' +
      '<div class="nk-pop hidden" data-nk-swpop="high"></div>';
    function btn(kind, name, val, title, icon) {
      return '<button type="button" class="nk-b" data-nk-' + kind + '="' + name + '"' +
             (val ? ' data-nk-val="' + val + '"' : '') + ' title="' + title + '">' + icon + '</button>';
    }
    var popText = toolbar.querySelector('[data-nk-swpop="text"]');
    var popHigh = toolbar.querySelector('[data-nk-swpop="high"]');
    function swatches(list, kind, node) {
      node.innerHTML = list.map(function (s) {
        return '<button type="button" class="nk-sw' + (s.css ? '' : ' none') + '" data-k="' + s.key + '"' +
          (s.css ? ' style="background:' + s.css + (kind === 'text' ? ';color:#fff' : ';color:#3a4560') + '"' : '') +
          '>' + (s.css ? (kind === 'text' ? 'A' : '') : '\u2715') + '</button>';
      }).join('');
    }
    swatches(TEXT_SW, 'text', popText);
    swatches(HIGH_SW, 'high', popHigh);
    function closePops() { popText.classList.add('hidden'); popHigh.classList.add('hidden'); }


    /* ---- snapshot undo/redo (Option B, decided Jul 2026) ----
       The browser's native undo (execCommand('undo')) is corrupted by our own
       DOM rewrites (colour classes, sanitised paste, checklists), so the module
       keeps its OWN history: a snapshot per ~800ms pause, capped at 50, plus
       one immediately before every programmatic change. Reliable regardless of
       how the content changed. Per-open only — survival across closes is the
       job of version history, not undo. */
    var undoStack = [], redoStack = [], lastVal = null, snapTimer = null;
    var HIST_MAX = 50;
    function curHtml() { return editor.innerHTML.replace(/ ?nk-img-sel/g, ''); }
    function recordNow() {
      clearTimeout(snapTimer); snapTimer = null;
      var cur = curHtml();
      if (lastVal === null) { lastVal = cur; histBtns(); return; }
      if (cur === lastVal) return;
      undoStack.push(lastVal);
      if (undoStack.length > HIST_MAX) undoStack.shift();
      redoStack.length = 0;
      lastVal = cur;
      histBtns();
    }
    function noteChanged() {
      clearTimeout(snapTimer);
      snapTimer = setTimeout(recordNow, 800);
      onChange();
    }
    function restore(html) {
      editor.innerHTML = html;
      var r = document.createRange(); r.selectNodeContents(editor); r.collapse(false);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      onChange(); histBtns();
    }
    function doUndo() {
      recordNow();
      if (!undoStack.length) return;
      redoStack.push(lastVal);
      lastVal = undoStack.pop();
      restore(lastVal);
    }
    function doRedo() {
      recordNow();
      if (!redoStack.length) return;
      undoStack.push(lastVal);
      lastVal = redoStack.pop();
      restore(lastVal);
    }
    function histBtns() {
      var u = toolbar.querySelector('[data-nk-act="undo"]');
      var r2 = toolbar.querySelector('[data-nk-act="redo"]');
      if (u) { u.classList.toggle('can', undoStack.length > 0); u.classList.toggle('off', !undoStack.length); }
      if (r2) { r2.classList.toggle('can', redoStack.length > 0); r2.classList.toggle('off', !redoStack.length); }
    }
    /* Content is swapped in by the page while the editor is unfocused (opening a
       different note). Detect that on focus and start a fresh history. */
    editor.addEventListener('focus', function () {
      var cur = curHtml();
      if (lastVal === null || cur !== lastVal) {
        undoStack = []; redoStack = []; lastVal = cur; histBtns();
      }
    });
    editor.addEventListener('keydown', function (e) {
      var mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      var k = (e.key || '').toLowerCase();
      if (k === 'z' && !e.shiftKey) { e.preventDefault(); doUndo(); }
      else if (k === 'z' || k === 'y') { e.preventDefault(); doRedo(); }
    });

    /* selection keeping */
    function saveRange() {
      var s = window.getSelection();
      if (s && s.rangeCount && editor.contains(s.anchorNode)) savedRange = s.getRangeAt(0).cloneRange();
    }
    function restoreRange() {
      var s = window.getSelection();
      if (s && s.rangeCount && editor.contains(s.getRangeAt(0).commonAncestorContainer)) return; // live selection wins
      if (savedRange && editor.contains(savedRange.commonAncestorContainer)) {
        s.removeAllRanges(); s.addRange(savedRange); return;
      }
      var r = document.createRange();                       // fall back to end
      r.selectNodeContents(editor); r.collapse(false);
      s.removeAllRanges(); s.addRange(r);
    }
    function exec(cmd, val) { try { document.execCommand(cmd, false, val == null ? null : val); } catch (e) {} }

    /* colour normalisation: inline styles -> class names */
    function rgbToHex(v) {
      var m = String(v || '').match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
      if (!m) return String(v || '').toLowerCase();
      return '#' + [1, 2, 3].map(function (i) { return (+m[i]).toString(16).padStart(2, '0'); }).join('');
    }
    function normalizeColours() {
      var map = {};
      TEXT_SW.forEach(function (s) { if (s.css) map['c' + s.css] = 'tc-' + s.key; });
      HIGH_SW.forEach(function (s) { if (s.css) map['b' + s.css] = 'hl-' + s.key; });
      editor.querySelectorAll('font[color], [style*="color"]').forEach(function (node) {
        var fc = rgbToHex(node.style && node.style.color ? node.style.color : (node.getAttribute('color') || ''));
        var bc = rgbToHex(node.style && node.style.backgroundColor ? node.style.backgroundColor : '');
        var tcCls = map['c' + fc], hlCls = map['b' + bc];
        var classes = (node.getAttribute('class') || '').split(/\s+/).filter(function (c) { return CLASS_OK.test(c); });
        if (tcCls) { classes = classes.filter(function (c) { return c.indexOf('tc-') !== 0; }); classes.push(tcCls); }
        if (hlCls) { classes = classes.filter(function (c) { return c.indexOf('hl-') !== 0; }); classes.push(hlCls); }
        var span = document.createElement('span');
        while (node.firstChild) span.appendChild(node.firstChild);
        if (classes.length) { span.setAttribute('class', classes.join(' ')); node.parentNode.replaceChild(span, node); }
        else {
          var frag = document.createDocumentFragment();
          while (span.firstChild) frag.appendChild(span.firstChild);
          node.parentNode.replaceChild(frag, node);
        }
      });
    }
    function stripColourClasses(prefix) {
      var sel = window.getSelection(); if (!sel || !sel.rangeCount) return;
      editor.querySelectorAll('span[class]').forEach(function (sp) {
        if (!sel.containsNode(sp, true)) return;
        var keep = (sp.getAttribute('class') || '').split(/\s+/).filter(function (c) { return c && c.indexOf(prefix) !== 0; });
        if (keep.length) sp.setAttribute('class', keep.join(' '));
        else {
          var frag = document.createDocumentFragment();
          while (sp.firstChild) frag.appendChild(sp.firstChild);
          sp.parentNode.replaceChild(frag, sp);
        }
      });
    }
    function applySwatch(kind, key) {
      editor.focus(); restoreRange();
      var list = kind === 'text' ? TEXT_SW : HIGH_SW;
      var sw = null;
      list.forEach(function (s) { if (s.key === key) sw = s; });
      recordNow();
      if (!sw || !sw.css) stripColourClasses(kind === 'text' ? 'tc-' : 'hl-');
      else {
        exec('styleWithCSS', true);
        exec(kind === 'text' ? 'foreColor' : 'hiliteColor', sw.css);
        normalizeColours();
      }
      closePops(); noteChanged();
    }
    [[popText, 'text'], [popHigh, 'high']].forEach(function (pair) {
      pair[0].addEventListener('mousedown', function (e) { e.preventDefault(); });
      pair[0].addEventListener('click', function (e) {
        var b = e.target.closest('.nk-sw'); if (b) applySwatch(pair[1], b.dataset.k);
      });
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('[data-nk-pop]') && !e.target.closest('.nk-pop')) closePops();
    });

    /* toolbar state */
    function refresh() {
      toolbar.querySelectorAll('.nk-b[data-nk-cmd]').forEach(function (b) {
        var active = false;
        try {
          if (b.dataset.nkCmd === 'formatBlock') {
            active = (document.queryCommandValue('formatBlock') || '').toLowerCase() === (b.dataset.nkVal || '').toLowerCase();
          } else active = document.queryCommandState(b.dataset.nkCmd);
        } catch (e) {}
        b.classList.toggle('on', active);
      });
    }

    /* toolbar clicks */
    toolbar.addEventListener('mousedown', function (e) { if (e.target.closest('.nk-b')) e.preventDefault(); });
    toolbar.addEventListener('click', function (e) {
      var b = e.target.closest('.nk-b'); if (!b) return;
      var act = b.dataset.nkAct, pop = b.dataset.nkPop, cmd = b.dataset.nkCmd;
      if (act === 'img') { activeInst = inst; saveRange(); openImg(); return; }
      if (act === 'link') { activeInst = inst; saveRange(); openLink(); return; }
      if (act === 'check') { insertChecklist(); return; }
      if (act === 'clearfmt') {
        editor.focus(); restoreRange();
        var s = window.getSelection();
        if (!s || !s.rangeCount || s.isCollapsed) return;   // needs a selection; no surprises
        recordNow();                                        // one Undo brings it all back
        exec('removeFormat');                               // bold/italic/underline etc.
        stripColourClasses('tc-');                          // our text colours
        stripColourClasses('hl-');                          // our highlights
        noteChanged();
        return;
      }
      if (act === 'spell') {
        var spellOn = editor.getAttribute('spellcheck') === 'true';
        editor.setAttribute('spellcheck', spellOn ? 'false' : 'true');
        b.classList.toggle('nk-on', !spellOn);
        editor.blur(); editor.focus();            // squiggles repaint on a focus cycle
        return;
      }
      if (act === 'undo') { doUndo(); return; }
      if (act === 'redo') { doRedo(); return; }
      if (act === 'hr') { editor.focus(); restoreRange(); recordNow(); exec('insertHTML', '<hr><p><br></p>'); noteChanged(); return; }
      if (pop) {
        saveRange();
        var want = pop === 'text' ? popText : popHigh;
        var other = pop === 'text' ? popHigh : popText;
        other.classList.add('hidden'); want.classList.toggle('hidden');
        return;
      }
      if (!cmd) return;
      editor.focus(); restoreRange();
      if (cmd === 'formatBlock') {
        var cur = '';
        try { cur = (document.queryCommandValue('formatBlock') || '').toLowerCase(); } catch (e2) {}
        exec('formatBlock', cur === (b.dataset.nkVal || '').toLowerCase() ? 'p' : b.dataset.nkVal);
      } else exec(cmd);
      refresh(); noteChanged();
    });

    /* dialogs (per-instance open + insert) */
    function openImg() {
      dlg.imgUrl.value = ''; dlg.imgAlt.value = '';
      dlg.imgErr.classList.add('hidden');
      dlg.img.classList.remove('hidden');
      setTimeout(function () { dlg.imgUrl.focus(); }, 30);
    }
    function openLink() {
      var sel = window.getSelection();
      var a = sel && sel.anchorNode && sel.anchorNode.parentElement ? sel.anchorNode.parentElement.closest('a') : null;
      dlg.linkUrl.value = a ? (a.getAttribute('href') || '') : '';
      dlg.linkRemove.classList.toggle('hidden', !a);
      dlg.linkOk.textContent = a ? 'Update' : 'Add';
      dlg.linkErr.classList.add('hidden');
      dlg.link.classList.remove('hidden');
      setTimeout(function () { dlg.linkUrl.focus(); }, 30);
    }

    /* checklist */
    function insertChecklist() {
      editor.focus(); restoreRange();
      recordNow();
      exec('insertHTML', '<ul class="fr-check"><li><span class="fr-cb" contenteditable="false"></span>&nbsp;</li></ul><p><br></p>');
      noteChanged();
    }
    /* tap-to-select images: shows a Remove button; Backspace also works because
       the image becomes the actual selection */
    editor.addEventListener('click', function (e) {
      var img = e.target.closest('img');
      if (img && editor.contains(img)) {
        e.preventDefault();
        dlg.hideImgDel();
        img.classList.add('nk-img-sel');
        dlg._selImg = img;
        dlg._selOwner = inst;
        var r = document.createRange();
        r.selectNode(img);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        var rect = img.getBoundingClientRect();
        dlg.imgDel.style.top = Math.max(8, rect.top + 8) + 'px';
        dlg.imgDel.style.left = Math.max(8, rect.right - 130) + 'px';
        dlg.imgDel.classList.add('show');
        return;
      }
      dlg.hideImgDel();
    });
    editor.addEventListener('input', function () { dlg.hideImgDel(); });

    editor.addEventListener('click', function (e) {
      var cb = e.target.closest('.fr-cb'); if (!cb) return;
      e.preventDefault(); e.stopPropagation();
      var li = cb.closest('li'); if (li) { recordNow(); li.classList.toggle('done'); noteChanged(); }
    });
    if (reader) reader.addEventListener('click', function (e) {
      var cb = e.target.closest('.fr-cb'); if (!cb) return;
      e.preventDefault(); e.stopPropagation();
      var li = cb.closest('li'); if (!li) return;
      li.classList.toggle('done');
      if (opts.onReaderChange) opts.onReaderChange(sanitize(reader.innerHTML));
    });

    /* paste: arrives sanitised */
    editor.addEventListener('paste', function (e) {
      var cb = e.clipboardData || window.clipboardData; if (!cb) return;
      e.preventDefault();
      var html = cb.getData('text/html');
      var text = cb.getData('text/plain');
      var out = html ? sanitize(html)
                     : esc(text || '').replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>');
      recordNow();
      exec('insertHTML', out);
      noteChanged();
    });

    editor.addEventListener('input', noteChanged);
    editor.addEventListener('keyup', refresh);
    editor.addEventListener('mouseup', refresh);
    editor.addEventListener('blur', saveRange);

    var inst = {
      onImgRemoved: function () { noteChanged(); },
      recordNow: recordNow,
      refresh: refresh,
      focusEnd: function () {
        editor.focus();
        var r = document.createRange(); r.selectNodeContents(editor); r.collapse(false);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      },
      insertHTML: function (html) { editor.focus(); restoreRange(); recordNow(); exec('insertHTML', html); noteChanged(); },
      applyLink: function (url) {
        editor.focus(); restoreRange();
        var sel = window.getSelection();
        recordNow();
        if (sel && sel.isCollapsed) exec('insertHTML', '<a href="' + url.replace(/"/g, '&quot;') + '">' + esc(url) + '</a>');
        else exec('createLink', url);
        noteChanged();
      },
      removeLink: function () { editor.focus(); restoreRange(); recordNow(); exec('unlink'); noteChanged(); },
      closePopovers: closePops
    };
    return inst;
  }

  window.NoteEditor = {
    version: '2.1',
    versions: versions,
    openHistory: openHistory,
    openPrint: openPrint,
    guard: guard,
    casSave: casSave,
    resolveConflict: resolveConflict,
    exportLibrary: exportLibrary,
    sanitize: sanitize,
    toHtml: toHtml,
    toPlain: toPlain,
    toMarkdown: toMarkdown,
    contentCSS: contentCSS,
    injectStyles: injectStyles,
    mount: mount
  };
})();
