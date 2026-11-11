// Dashboard engine: per-scene layouts, placement, edit mode (drag/resize), saved layouts, widget update scheduling.
import { $, clamp, clone } from '../core/util.ts';
import { WIDGETS } from '../widgets/index.ts';
import type { Widget } from '../widgets/types.ts';
import { THEMES, type Cfg, type Slot, type Theme } from './model.ts';
import { state, save, params } from './state.ts';
import { app, onSceneChange, onFrame } from './stage.ts';
import { curve, uncurve } from './curve.ts';

const dash = $('dash');
const box = new Map<string, { box: HTMLElement; el: HTMLElement }>();
const W_BY_ID = new Map(WIDGETS.map(w => [w.id, w]));

/* Each scene may own its widget layout (state.sc[id]); otherwise the global one in `state` is used. */
export const cfg = (): Cfg => (app.scene && state.sc[app.scene.id]) || state;
export const isOn = (id: string) => cfg().widgets[id] ?? W_BY_ID.get(id)!.on;
const getPos = (w: Widget) => { const L = cfg().layout; return L[w.id] || (L[w.id] = { x: w.x, y: w.y, s: 1 }); };
export const editing = () => document.body.classList.contains('editing');

function place(w: Widget){
  const p = getPos(w), b = box.get(w.id)!.box;
  b.style.left = (p.x * 100).toFixed(2) + '%'; b.style.top = (p.y * 100).toFixed(2) + '%';
  b.style.transform = `scale(${(p.s * state.dscale / 100).toFixed(3)})`;
}
function makeCfg(fromPreset: boolean): Cfg {
  const sc = app.scene!;
  if (fromPreset && sc.preset){
    const widgets: Record<string, boolean> = {}; WIDGETS.forEach(w => widgets[w.id] = sc.preset!.on.includes(w.id));
    return { layout: clone(sc.preset.layout), widgets };
  }
  const c = cfg(); return { layout: clone(c.layout), widgets: clone(c.widgets) };
}
function resetCfg(){
  const sc = app.scene;
  if (sc && state.sc[sc.id]) state.sc[sc.id] = sc.preset ? makeCfg(true) : { layout: {}, widgets: clone(state.sc[sc.id].widgets) };
  else state.layout = {};
}
export const hasOwn = () => !!(app.scene && state.sc[app.scene.id]);
export function setOwn(on: boolean){
  if (!app.scene) return;
  if (on) state.sc[app.scene.id] = makeCfg(false); else delete state.sc[app.scene.id];
  save(); sceneChanged();
}
function sceneChanged(){
  const sc = app.scene;
  applyTheme();
  if (sc?.preset && !state.scSeen[sc.id]){ state.sc[sc.id] = makeCfg(true); state.scSeen[sc.id] = true; save(); }
  $('tOwn').classList.toggle('on', hasOwn());
  if (box.size){ refreshWidgetToggles(); applyLook(); updateAll(); }
}

/* Theme: body.hud (console skin), body.theme-<name>; the curved layout only fits the skins without cards. */
const curvedNow = () => !!app.scene?.curved && state.theme !== 'dossier';
export function applyTheme(){
  const t = state.theme, sc = app.scene, b = document.body.classList;
  b.toggle('hud', t === 'console' || (t === 'scene' && !!sc?.hud));
  for (const x of ['minimal', 'console', 'dossier']) b.toggle('theme-' + x, t === x);
  b.toggle('curved', curvedNow());
  if (!curvedNow()) uncurve([...box.values()].map(b => b.box));
  const sel = document.getElementById('theme') as HTMLSelectElement | null; if (sel) sel.value = t;
}
export function setTheme(t: Theme){ state.theme = t; save(); applyTheme(); }

const updateOne = (w: Widget, n = new Date()) => { const b = box.get(w.id); if (b && w.update && isOn(w.id)) w.update(b.el, n); };
export function updateAll(){ const n = new Date(); WIDGETS.forEach(w => updateOne(w, n)); }

function refreshWidgetToggles(){
  document.querySelectorAll<HTMLElement>('#wlist [data-w]').forEach(b => b.classList.toggle('on', isOn(b.dataset.w!)));
  WIDGETS.forEach(w => box.get(w.id)?.box.classList.toggle('off', !isOn(w.id)));
}
export function setWidget(id: string, on: boolean){ if (!W_BY_ID.has(id)) return false; cfg().widgets[id] = on; refreshWidgetToggles(); updateAll(); save(); return true; }
export function setDash(on: boolean){ state.dash = on; dash.classList.toggle('hidden', !on); $('tDash').classList.toggle('on', on); save(); }
export function setEdit(on: boolean){
  document.body.classList.toggle('editing', on); $('tEdit').classList.toggle('on', on);
  if (on){ document.body.classList.remove('menu-open'); if (!state.dash) setDash(true); }
}
function applyLook(){
  document.body.classList.remove('wbg-none', 'wbg-scrim', 'wbg-glass'); document.body.classList.add('wbg-' + state.wbg);
  WIDGETS.forEach(place);
}

/* edit mode: drag to move, corner handle or wheel to scale */
let drag: { w: Widget; box: HTMLElement; sx: number; sy: number; ox: number; oy: number; resize: boolean; left0: number; w0: number } | null = null;
const widgetAt = (e: Event) => { const b = (e.target as HTMLElement).closest<HTMLElement>('.w'); return b ? { b, w: W_BY_ID.get(b.dataset.id!)! } : null; };
dash.addEventListener('pointerdown', e => {
  if (!editing()) return; const hit = widgetAt(e); if (!hit) return;
  e.preventDefault(); const p = getPos(hit.w), r = hit.b.getBoundingClientRect();
  drag = { w: hit.w, box: hit.b, sx: e.clientX, sy: e.clientY, ox: p.x, oy: p.y, resize: !!(e.target as HTMLElement).closest('.rz'), left0: r.left, w0: hit.b.offsetWidth };
  hit.b.setPointerCapture(e.pointerId); hit.b.classList.add('drag');
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
  if (!editing()) return; const hit = widgetAt(e); if (!hit) return; e.preventDefault();
  const p = getPos(hit.w); p.s = clamp(p.s * (e.deltaY < 0 ? 1.06 : 1 / 1.06), .4, 3.5); place(hit.w); save();
}, { passive: false });
dash.addEventListener('click', e => e.stopPropagation());
dash.addEventListener('contextmenu', e => e.stopPropagation());

/* saved layouts: positions, sizes, visible widgets and look, three slots */
function syncOptionUI(){
  $('tH24').classList.toggle('on', state.h24); $('tSecs').classList.toggle('on', state.secs);
  $<HTMLInputElement>('dsize').value = String(state.dscale); $<HTMLSelectElement>('wbg').value = state.wbg;
}
function drawSlots(){
  const b = $('slots'); b.innerHTML = '';
  for (let i = 0; i < 3; i++){
    const filled = !!state.slots[i], r = document.createElement('div'); r.className = 'row' + (state.slot === i ? ' cur' : '');
    r.innerHTML = `<span>Układ ${i + 1}${filled ? '' : ' · pusty'}</span><div class="slot-b"><button class="btn" data-l="${i}" ${filled ? '' : 'disabled'}>Wczytaj</button><button class="btn" data-s="${i}">Zapisz</button></div>`;
    b.appendChild(r);
  }
}
function saveSlot(i: number){
  const c = cfg();
  state.slots[i] = clone<Slot>({ layout: c.layout, widgets: c.widgets, dscale: state.dscale, wbg: state.wbg, h24: state.h24, secs: state.secs });
  state.slot = i; save(); drawSlots();
}
export function loadSlot(i: number){
  const s = state.slots[i]; if (!s) return false;
  const c = cfg(); c.layout = clone(s.layout); c.widgets = clone(s.widgets);
  state.dscale = s.dscale ?? state.dscale; state.wbg = s.wbg ?? state.wbg; state.h24 = s.h24 ?? state.h24; state.secs = s.secs ?? state.secs;
  state.slot = i; save(); syncOptionUI(); refreshWidgetToggles(); applyLook(); updateAll(); drawSlots();
  return true;
}
$('slots').addEventListener('click', e => {
  e.stopPropagation(); const b = (e.target as HTMLElement).closest('button'); if (!b || b.disabled) return;
  if (b.dataset.s !== undefined) saveSlot(+b.dataset.s); else if (b.dataset.l !== undefined) loadSlot(+b.dataset.l);
});

export function initDash(){
  dash.innerHTML = '';
  WIDGETS.forEach(w => {
    const b = document.createElement('div'); b.className = 'w ' + (w.cls || ''); b.id = w.id + '-w'; b.dataset.id = w.id; b.dataset.name = w.name;
    const el = document.createElement('div'); el.className = 'wc'; el.innerHTML = w.html();
    const rz = document.createElement('i'); rz.className = 'rz'; rz.title = 'Rozmiar';
    b.append(el, rz); dash.appendChild(b); box.set(w.id, { box: b, el }); w.init?.(el);
    // Widgets refresh on their own period and when a source they read changes, only while visible.
    if (w.every) setInterval(() => updateOne(w), w.every);
    w.sources?.forEach(s => s.on(() => updateOne(w)));
  });
  const wl = $('wlist');
  WIDGETS.forEach(w => { const r = document.createElement('div'); r.className = 'row'; r.innerHTML = `<span>${w.name}</span><button class="sw-toggle" data-w="${w.id}" aria-label="${w.name}"></button>`; wl.appendChild(r); });
  wl.addEventListener('click', e => { const b = (e.target as HTMLElement).closest<HTMLElement>('[data-w]'); if (b) setWidget(b.dataset.w!, !isOn(b.dataset.w!)); });

  const bind = (id: string, get: () => boolean, set: (v: boolean) => void) => { const b = $(id); b.classList.toggle('on', get()); b.addEventListener('click', e => { e.stopPropagation(); set(!get()); b.classList.toggle('on', get()); }); };
  bind('tDash', () => state.dash, setDash);
  bind('tH24', () => state.h24, v => { state.h24 = v; save(); updateAll(); });
  bind('tSecs', () => state.secs, v => { state.secs = v; save(); updateAll(); });
  bind('tEdit', editing, setEdit);
  bind('tOwn', hasOwn, setOwn);
  const ds = $<HTMLInputElement>('dsize'), wb = $<HTMLSelectElement>('wbg');
  ds.value = String(state.dscale); ds.addEventListener('input', () => { state.dscale = +ds.value; save(); applyLook(); });
  ds.addEventListener('click', e => e.stopPropagation());
  wb.value = state.wbg; wb.addEventListener('change', () => { state.wbg = wb.value as Slot['wbg']; save(); applyLook(); });
  wb.addEventListener('click', e => e.stopPropagation());
  const th = $<HTMLSelectElement>('theme');
  th.value = state.theme; th.addEventListener('change', () => { if ((THEMES as string[]).includes(th.value)) setTheme(th.value as Theme); });
  th.addEventListener('click', e => e.stopPropagation());
  $('resetLayout').addEventListener('click', e => { e.stopPropagation(); resetCfg(); state.dscale = 100; ds.value = '100'; state.slot = -1; save(); refreshWidgetToggles(); applyLook(); drawSlots(); });
  $('editdone').addEventListener('click', () => setEdit(false));

  drawSlots(); refreshWidgetToggles(); applyLook(); setDash(state.dash);
  if (params.has('edit')) setEdit(true);
  updateAll();
}

onSceneChange(sceneChanged);
onFrame(n => {
  const geo = app.run?.geo;
  if (curvedNow() && geo && n % 2 === 0) curve(geo, WIDGETS.filter(w => isOn(w.id)).map(w => box.get(w.id)!.box));
});
