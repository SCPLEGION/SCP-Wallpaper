// Persistent state (localStorage "minwall") and scene switching.
'use strict';

/* ---------------- state ---------------- */
const params = new URLSearchParams(location.hash.slice(1));
let state = { scene: 0, seed: (Math.random() * 1e9) | 0, dash: true, auto: 0, layout: {}, widgets: {}, slots: {}, slot: -1, sc: {}, scSeen: {}, h24: true, secs: true, dscale: 100, wbg: 'scrim', tab: 'p1', todo: [], pomo: null,
  cd: { label: 'Nowy Rok', date: (new Date().getFullYear() + 1) + '-01-01' } };
try { Object.assign(state, JSON.parse(localStorage.getItem('minwall') || '{}')); } catch (e) {}
if (params.has('scene')) state.scene = +params.get('scene');
if (params.has('seed')) state.seed = +params.get('seed');   // deterministic previews/tests
if (params.has('dash')) state.dash = params.get('dash') === '1';
if (params.has('menu')) document.body.classList.add('menu-open');
if (params.has('tab')) state.tab = params.get('tab');
state.scene = ((state.scene % SCENES.length) + SCENES.length) % SCENES.length;
const save = () => { try { localStorage.setItem('minwall', JSON.stringify(state)); } catch (e) {} };

let cur = null, busy = false;
function show(i, seed){
  if (cur && cur.unmount) cur.unmount();
  state.scene = ((i % SCENES.length) + SCENES.length) % SCENES.length;
  if (seed !== undefined) state.seed = seed;
  cur = SCENES[state.scene];
  document.documentElement.style.setProperty('--accent', cur.accent || '#ff8a65');
  stage.innerHTML = cur.mount(state.seed + state.scene * 977);
  if (cur.after) cur.after();
  onSceneChange();
  [...document.querySelectorAll('.scene')].forEach((b, k) => b.classList.toggle('active', k === state.scene));
  save();
}
function go(i, seed){
  if (busy) return; busy = true; stage.classList.add('out');
  setTimeout(() => { show(i, seed); requestAnimationFrame(() => stage.classList.remove('out')); setTimeout(() => busy = false, 120); }, 350);
}
