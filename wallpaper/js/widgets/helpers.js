// Formatting and data helpers used by widgets (no widget logic here).
'use strict';

/* ---------------- dashboard widgets ---------------- */
const pad = v => String(v).padStart(2, '0');
const esc = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const DAYS = ['pn', 'wt', 'śr', 'cz', 'pt', 'sb', 'nd'];
const MONTHS = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];
function isoWeek(d){
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), n = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - n);
  return Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7);
}
const gb = b => (b / 1073741824).toFixed(b >= 1.07e10 ? 0 : 1);
const rate = b => b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB/s' : (b / 1024).toFixed(0) + ' KB/s';
const upt = sec => { const d = Math.floor(sec / 86400), h = Math.floor(sec % 86400 / 3600), m = Math.floor(sec % 3600 / 60); return d ? `${d}d ${h}h` : `${h}h ${m}m`; };
const sbar = (p, hot) => `<div class="sb"><i class="${hot ? 'hot' : ''}" style="width:${clamp(p, 0, 100).toFixed(1)}%"></i></div>`;
function spark(v, max){
  if (v.length < 2) return '';
  const w = 120, h = 20, n = v.length;
  const pts = v.map((y, i) => `${(i / (n - 1) * w).toFixed(1)},${(h - clamp(y / max, 0, 1) * h).toFixed(1)}`).join(' ');
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="1.3" vector-effect="non-scaling-stroke"/></svg>`;
}
function beep(){
  try { const a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator(), g = a.createGain();
    o.frequency.value = 880; g.gain.value = .08; o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + .35); } catch (e) {}
}

/* Update `el` to match `html` without recreating nodes. Replacing innerHTML every refresh dropped the per-row transforms of the
   curved layout (rows jumped back until the next curveWidgets pass) and restarted the bar transitions from 0. Only text, class,
   bar width and attributes are synced; style.transform is left alone. Falls back to a full replace when the structure changed. */
function patchHtml(el, html){
  const t = document.createElement('div'); t.innerHTML = html;
  const sync = (a, b) => {
    if (a.childNodes.length !== b.childNodes.length) return false;
    for (let i = 0; i < a.childNodes.length; i++){
      const x = a.childNodes[i], y = b.childNodes[i];
      if (x.nodeType !== y.nodeType || x.nodeName !== y.nodeName) return false;
      if (x.nodeType === 3){ if (x.nodeValue !== y.nodeValue) x.nodeValue = y.nodeValue; continue; }
      if (x.nodeType !== 1) continue;
      for (const at of y.attributes) if (at.name !== 'style' && x.getAttribute(at.name) !== at.value) x.setAttribute(at.name, at.value);
      if (y.style.width && x.style.width !== y.style.width) x.style.width = y.style.width;
      if (!sync(x, y)) return false;
    }
    return true;
  };
  if (!sync(el, t)) el.innerHTML = html;
}
