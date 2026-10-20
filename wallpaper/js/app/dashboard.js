// Dashboard engine: per-scene layouts, placement, edit mode (drag/resize), saved layouts, initDash().
'use strict';

const dash = $('dash');

/* Each scene may own its widget layout (state.sc[name]); otherwise the global one in `state` is used. */
const clone = v => JSON.parse(JSON.stringify(v));
const cfg = () => (cur && state.sc[cur.name]) || state;
const isOn = id => cfg().widgets[id] ?? WIDGETS.find(w => w.id === id).on;
const getPos = w => { const L = cfg().layout; return L[w.id] || (L[w.id] = { x: w.x, y: w.y, s: 1 }); };
function place(w){
  const p = getPos(w);
  w.box.style.left = (p.x * 100).toFixed(2) + '%'; w.box.style.top = (p.y * 100).toFixed(2) + '%';
  w.box.style.transform = `scale(${(p.s * state.dscale / 100).toFixed(3)})`;
}
function makeCfg(scene, fromPreset){
  if (fromPreset && scene.preset){
    const widgets = {}; WIDGETS.forEach(w => widgets[w.id] = scene.preset.on.includes(w.id));
    return { layout: clone(scene.preset.layout || {}), widgets };
  }
  const c = cfg(); return { layout: clone(c.layout), widgets: clone(c.widgets) };
}
function resetCfg(){
  if (cur && state.sc[cur.name]) state.sc[cur.name] = cur.preset ? makeCfg(cur, true) : { layout: {}, widgets: clone(state.sc[cur.name].widgets) };
  else state.layout = {};
}
function setOwn(on){
  if (!cur) return;
  if (on) state.sc[cur.name] = makeCfg(cur, false); else delete state.sc[cur.name];
  save(); onSceneChange();
}
function onSceneChange(){
  document.body.classList.toggle('hud', !!(cur && cur.hud));
  document.body.classList.toggle('curved', !!(cur && cur.curved));
  if (!(cur && cur.curved)) uncurveWidgets();
  if (cur && cur.preset && !state.scSeen[cur.name]){ state.sc[cur.name] = makeCfg(cur, true); state.scSeen[cur.name] = true; save(); }
  const t = $('tOwn'); if (t) t.classList.toggle('on', !!(cur && state.sc[cur.name]));
  if (WIDGETS[0].box){ refreshWidgetToggles(); applyLook(); updateAll(); }
}
function updateAll(){
  const n = new Date();
  WIDGETS.forEach(w => { if (w.el && w.update && isOn(w.id)) w.update(n, w.el); });
}
function refreshWidgetToggles(){
  document.querySelectorAll('#wlist [data-w]').forEach(b => b.classList.toggle('on', isOn(b.dataset.w)));
  WIDGETS.forEach(w => w.box && w.box.classList.toggle('off', !isOn(w.id)));
}
function setWidget(id, on){ cfg().widgets[id] = on; refreshWidgetToggles(); updateAll(); save(); }
function setDash(on){ state.dash = on; dash.classList.toggle('hidden', !on); $('tDash').classList.toggle('on', on); save(); }
function setEdit(on){
  document.body.classList.toggle('editing', on); $('tEdit').classList.toggle('on', on);
  if (on){ document.body.classList.remove('menu-open'); if (!state.dash) setDash(true); }
}
function applyLook(){
  document.body.classList.remove('wbg-none', 'wbg-scrim', 'wbg-glass'); document.body.classList.add('wbg-' + state.wbg);
  WIDGETS.forEach(w => w.box && place(w));
}

/* edit mode: drag to move, corner handle or wheel to scale */
let drag = null;
dash.addEventListener('pointerdown', e => {
  if (!editing()) return; const box = e.target.closest('.w'); if (!box) return;
  e.preventDefault(); const w = WIDGETS.find(x => x.id === box.dataset.id), p = getPos(w), r = box.getBoundingClientRect();
  drag = { w, box, sx: e.clientX, sy: e.clientY, ox: p.x, oy: p.y, resize: !!e.target.closest('.rz'), left0: r.left, w0: box.offsetWidth };
  box.setPointerCapture(e.pointerId); box.classList.add('drag');
});
dash.addEventListener('pointermove', e => {
  if (!drag) return; const p = getPos(drag.w);
  if (drag.resize){
    let sc = clamp((e.clientX - drag.left0) / (drag.w0 * state.dscale / 100), .4, 3.5);
    if (!e.shiftKey) sc = Math.round(sc * 20) / 20;
    p.s = sc; place(drag.w); return;
  }
  let x = clamp(drag.ox + (e.clientX - drag.sx) / innerWidth, -.02, .98), y = clamp(drag.oy + (e.clientY - drag.sy) / innerHeight, -.02, .98);
  if (!e.shiftKey){ x = Math.round(x * 200) / 200; y = Math.round(y * 200) / 200; }
  p.x = x; p.y = y; place(drag.w);
});
const endDrag = () => { if (!drag) return; drag.box.classList.remove('drag'); drag = null; save(); };
dash.addEventListener('pointerup', endDrag); dash.addEventListener('pointercancel', endDrag);
dash.addEventListener('wheel', e => {
  if (!editing()) return; const box = e.target.closest('.w'); if (!box) return; e.preventDefault();
  const w = WIDGETS.find(x => x.id === box.dataset.id), p = getPos(w); p.s = clamp(p.s * (e.deltaY < 0 ? 1.06 : 1 / 1.06), .4, 3.5); place(w); save();
}, { passive: false });
dash.addEventListener('click', e => e.stopPropagation());
dash.addEventListener('contextmenu', e => e.stopPropagation());

/* saved layouts: positions, sizes, visible widgets and look, three slots */
const SLOT_KEYS = ['layout', 'widgets', 'dscale', 'wbg', 'h24', 'secs'];
function syncOptionUI(){
  $('tH24').classList.toggle('on', state.h24); $('tSecs').classList.toggle('on', state.secs);
  $('dsize').value = state.dscale; $('wbg').value = state.wbg;
}
function drawSlots(){
  const box = $('slots'); box.innerHTML = '';
  for (let i = 0; i < 3; i++){
    const filled = !!state.slots[i], r = document.createElement('div'); r.className = 'row' + (state.slot === i ? ' cur' : '');
    r.innerHTML = `<span>Układ ${i + 1}${filled ? '' : ' · pusty'}</span><div class="slot-b"><button class="btn" data-l="${i}" ${filled ? '' : 'disabled'}>Wczytaj</button><button class="btn" data-s="${i}">Zapisz</button></div>`;
    box.appendChild(r);
  }
}
const slotGet = k => (k === 'layout' || k === 'widgets') ? cfg()[k] : state[k];
const slotSet = (k, v) => { if (k === 'layout' || k === 'widgets') cfg()[k] = v; else state[k] = v; };
function saveSlot(i){
  const snap = {}; SLOT_KEYS.forEach(k => snap[k] = clone(slotGet(k)));
  state.slots[i] = snap; state.slot = i; save(); drawSlots();
}
function loadSlot(i){
  const snap = state.slots[i]; if (!snap) return;
  SLOT_KEYS.forEach(k => slotSet(k, clone(snap[k])));
  state.slot = i; save(); syncOptionUI(); refreshWidgetToggles(); applyLook(); updateAll(); drawSlots();
}
$('slots').addEventListener('click', e => {
  e.stopPropagation(); const b = e.target.closest('button'); if (!b || b.disabled) return;
  if (b.dataset.s !== undefined) saveSlot(+b.dataset.s); else if (b.dataset.l !== undefined) loadSlot(+b.dataset.l);
});

function initDash(){
  dash.innerHTML = '';
  WIDGETS.forEach(w => {
    const box = document.createElement('div'); box.className = 'w ' + (w.cls || ''); box.id = w.id + '-w'; box.dataset.id = w.id; box.dataset.name = w.name;
    const el = document.createElement('div'); el.className = 'wc'; el.innerHTML = w.html();
    const rz = document.createElement('i'); rz.className = 'rz'; rz.title = 'Rozmiar';
    box.append(el, rz); dash.appendChild(box); w.box = box; w.el = el; if (w.init) w.init(el);
  });
  const wl = $('wlist');
  WIDGETS.forEach(w => { const r = document.createElement('div'); r.className = 'row'; r.innerHTML = `<span>${w.name}</span><button class="sw-toggle" data-w="${w.id}" aria-label="${w.name}"></button>`; wl.appendChild(r); });
  wl.addEventListener('click', e => { const b = e.target.closest('[data-w]'); if (b) setWidget(b.dataset.w, !isOn(b.dataset.w)); });

  const bind = (id, get, set) => { const b = $(id); b.classList.toggle('on', get()); b.addEventListener('click', e => { e.stopPropagation(); set(!get()); b.classList.toggle('on', get()); }); };
  bind('tDash', () => state.dash, v => setDash(v));
  bind('tH24', () => state.h24, v => { state.h24 = v; save(); updateAll(); });
  bind('tSecs', () => state.secs, v => { state.secs = v; save(); updateAll(); });
  bind('tEdit', () => editing(), v => setEdit(v));
  bind('tOwn', () => !!(cur && state.sc[cur.name]), v => setOwn(v));
  $('dsize').value = state.dscale; $('dsize').addEventListener('input', e => { state.dscale = +e.target.value; save(); applyLook(); });
  $('dsize').addEventListener('click', e => e.stopPropagation());
  $('wbg').value = state.wbg; $('wbg').addEventListener('change', e => { state.wbg = e.target.value; save(); applyLook(); });
  $('wbg').addEventListener('click', e => e.stopPropagation());
  $('resetLayout').addEventListener('click', e => { e.stopPropagation(); resetCfg(); state.dscale = 100; $('dsize').value = 100; state.slot = -1; save(); refreshWidgetToggles(); applyLook(); drawSlots(); });
  $('editdone').addEventListener('click', () => setEdit(false));

  drawSlots(); setTab(state.tab); refreshWidgetToggles(); applyLook(); setDash(state.dash);
  if (params.has('edit')) setEdit(true);
  updateAll(); setInterval(updateAll, 1000);
  loadUsage(); loadSys(); setInterval(loadUsage, 20000); setInterval(loadSys, 2000);
  loadNp(); setInterval(loadNp, 1000);
}

/* Curved layout: a scene with `curved: true` publishes its globe as cur.geo = {cx, cy, Rc}. Rows of every widget on the left/right of it are
   shifted sideways so their inner edge follows the circle of radius Rc + CURVE_GAP; widgets near the centre are left alone. */
const CURVE_GAP = 44;
function curveRows(box){
  const rows = [];
  [...box.querySelector('.wc').children].forEach(c => { if (c.classList.contains('bars') || c.classList.contains('cal-g')) rows.push(...c.children); else rows.push(c); });
  return rows;
}
function uncurveWidgets(){
  WIDGETS.forEach(w => { if (!w.box) return; w.box.classList.remove('side-l', 'side-r'); curveRows(w.box).forEach(r => r.style.transform = ''); });
}
function curveWidgets(){
  const geo = cur && cur.geo; if (!geo) return;
  const R = geo.Rc + CURVE_GAP;
  WIDGETS.forEach(w => {
    if (!w.box || !isOn(w.id)) return;
    const b = w.box, r = b.getBoundingClientRect(), k = r.width / b.offsetWidth || 1, mid = r.left + r.width / 2;
    const side = Math.abs(mid - geo.cx) < innerWidth * .12 ? 0 : mid < geo.cx ? -1 : 1;
    b.classList.toggle('side-l', side < 0); b.classList.toggle('side-r', side > 0);
    curveRows(b).forEach(row => {
      if (!side){ row.style.transform = ''; return; }
      const dy = r.top + (row.offsetTop + row.offsetHeight / 2) * k - geo.cy, ax = Math.sqrt(Math.max(R * R - dy * dy, (R * .45) ** 2));
      row.style.transform = `translateX(${((side < 0 ? geo.cx - ax - r.right : geo.cx + ax - r.left) / k).toFixed(1)}px)`;
    });
  });
}
