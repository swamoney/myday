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
  var ALLOWED = { B:1, STRONG:1, I:1, EM:1, U:1, H3:1, UL:1, OL:1, LI:1,
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
    '.nk-b{min-width:32px;height:32px;padding:0 8px;border:none;background:transparent;border-radius:7px;color:#3a4560;cursor:pointer;font-size:15px;display:inline-flex;align-items:center;justify-content:center;font-family:inherit}',
    '.nk-b:hover{background:#e3e9f2}',
    '.nk-b.on{background:#0F2D5C;color:#fff}',
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
    '.nk-err.hidden{display:none}',
    '.nk-actions{display:flex;align-items:center;gap:8px;margin-top:16px}',
    '.nk-btn{font-family:inherit;font-size:13px;font-weight:600;border-radius:9px;padding:9px 16px;cursor:pointer;border:1px solid #dce3ee;background:#fff;color:#3a4560}',
    '.nk-btn.pri{background:#0F2D5C;border-color:#0F2D5C;color:#fff}',
    '.nk-btn.del{border-color:#e8c9c4;color:#8A1F1A;background:#fff}',
    '.nk-btn.hidden{display:none}',
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
          '<div class="nk-fld"><label>Image URL</label><input data-nk-f="imgUrl" placeholder="https://…/photo.jpg" inputmode="url"></div>' +
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
      var url = normUrl(dlg.imgUrl.value);
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
  }

  function normUrl(u) {
    u = String(u || '').trim();
    if (u && !/^https?:\/\//i.test(u) && /^[\w-]+(\.[\w-]+)+/.test(u)) u = 'https://' + u;
    return u;
  }

  /* ---------- toolbar definition ---------- */
  var SVG = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  var ICONS = {
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
    if (reader) reader.classList.add('nk-content');
    toolbar.classList.add('nk-toolbar');

    /* toolbar DOM */
    toolbar.innerHTML =
      btn('cmd', 'bold', '', 'Bold', ICONS.bold) +
      btn('cmd', 'italic', '', 'Italic', ICONS.italic) +
      btn('cmd', 'underline', '', 'Underline', ICONS.under) +
      '<span class="nk-sep"></span>' +
      btn('pop', 'text', '', 'Text colour', ICONS.tcol) +
      btn('pop', 'high', '', 'Highlight', ICONS.hcol) +
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
      '<div class="nk-pop hidden" data-nk-pop="text"></div>' +
      '<div class="nk-pop hidden" data-nk-pop="high"></div>';
    function btn(kind, name, val, title, icon) {
      return '<button type="button" class="nk-b" data-nk-' + kind + '="' + name + '"' +
             (val ? ' data-nk-val="' + val + '"' : '') + ' title="' + title + '">' + icon + '</button>';
    }
    var popText = toolbar.querySelector('[data-nk-pop="text"]');
    var popHigh = toolbar.querySelector('[data-nk-pop="high"]');
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
      if (!sw || !sw.css) stripColourClasses(kind === 'text' ? 'tc-' : 'hl-');
      else {
        exec('styleWithCSS', true);
        exec(kind === 'text' ? 'foreColor' : 'hiliteColor', sw.css);
        normalizeColours();
      }
      closePops(); onChange();
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
      if (act === 'hr') { editor.focus(); restoreRange(); exec('insertHTML', '<hr><p><br></p>'); onChange(); return; }
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
      refresh(); onChange();
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
      exec('insertHTML', '<ul class="fr-check"><li><span class="fr-cb" contenteditable="false"></span>&nbsp;</li></ul><p><br></p>');
      onChange();
    }
    editor.addEventListener('click', function (e) {
      var cb = e.target.closest('.fr-cb'); if (!cb) return;
      e.preventDefault(); e.stopPropagation();
      var li = cb.closest('li'); if (li) { li.classList.toggle('done'); onChange(); }
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
      exec('insertHTML', out);
      onChange();
    });

    editor.addEventListener('input', onChange);
    editor.addEventListener('keyup', refresh);
    editor.addEventListener('mouseup', refresh);
    editor.addEventListener('blur', saveRange);

    var inst = {
      refresh: refresh,
      focusEnd: function () {
        editor.focus();
        var r = document.createRange(); r.selectNodeContents(editor); r.collapse(false);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      },
      insertHTML: function (html) { editor.focus(); restoreRange(); exec('insertHTML', html); onChange(); },
      applyLink: function (url) {
        editor.focus(); restoreRange();
        var sel = window.getSelection();
        if (sel && sel.isCollapsed) exec('insertHTML', '<a href="' + url.replace(/"/g, '&quot;') + '">' + esc(url) + '</a>');
        else exec('createLink', url);
        onChange();
      },
      removeLink: function () { editor.focus(); restoreRange(); exec('unlink'); onChange(); },
      closePopovers: closePops
    };
    return inst;
  }

  window.NoteEditor = {
    version: '1.0',
    sanitize: sanitize,
    toHtml: toHtml,
    toPlain: toPlain,
    toMarkdown: toMarkdown,
    contentCSS: contentCSS,
    injectStyles: injectStyles,
    mount: mount
  };
})();
