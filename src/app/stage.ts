// Mounts scenes into #stage, switches between them with a fade, and keeps the canvas mode in step with VRAM.
import { $ } from '../core/util.ts';
import { canvasMode } from '../core/draw.ts';
import { sys } from '../data/sources.ts';
import { SCENES } from '../scenes/index.ts';
import type { Scene, SceneRun } from '../scenes/types.ts';
import { state, save, params } from './state.ts';

const stage = $('stage');
export const app: { scene: Scene | null; run: SceneRun | null; busy: boolean; paused: boolean } = { scene: null, run: null, busy: false, paused: false };

const changed: (() => void)[] = [];
/** Run `f` after every scene mount (the dashboard re-applies layout and skin). */
export const onSceneChange = (f: () => void) => { changed.push(f); };

export const sceneIndex = (id = state.scene) => Math.max(0, SCENES.findIndex(s => s.id === id));
const wrap = (i: number) => ((i % SCENES.length) + SCENES.length) % SCENES.length;

export function show(i: number, seed?: number){
  app.run?.destroy?.();
  i = wrap(i);
  const sc = SCENES[i];
  state.scene = sc.id;
  if (seed !== undefined) state.seed = seed;
  document.documentElement.style.setProperty('--accent', sc.accent || '#ff8a65');
  stage.innerHTML = '';
  app.scene = sc; app.run = sc.mount({ el: stage, seed: state.seed + i * 977 });
  changed.forEach(f => f());
  save();
}
export function go(i: number, seed?: number){
  if (app.busy) return; app.busy = true; stage.classList.add('out');
  setTimeout(() => { show(i, seed); requestAnimationFrame(() => stage.classList.remove('out')); setTimeout(() => app.busy = false, 120); }, 350);
}
export const step = (d: number) => go(sceneIndex() + d);
export const goId = (id: string, seed?: number) => { const i = SCENES.findIndex(s => s.id === id); if (i >= 0) go(i, seed); return i >= 0; };
export const reseed = () => go(sceneIndex(), (Math.random() * 1e9) | 0);

// VRAM guard: above 75% VRAM the canvas scenes switch to a CPU canvas, below 60% back to GPU. #cv=cpu|gpu forces a mode.
if (params.has('cv')) canvasMode.soft = params.get('cv') === 'cpu';
else sys.on(d => {
  if (d && d.vram_total){ const f = d.vram_used! / d.vram_total; canvasMode.soft = canvasMode.soft ? f > .60 : f > .75; }
  if (app.run && app.run.soft !== undefined && app.run.soft !== canvasMode.soft && !app.busy) go(sceneIndex());
});

/* ---------------- main loop (30 fps, only scenes that animate; stops while paused) ---------------- */
let last = 0, tPrev = 0;
const frameHooks: ((n: number) => void)[] = [];
export const onFrame = (f: (n: number) => void) => { frameHooks.push(f); };
let nFrame = 0, raf = 0;
function frame(now: number){
  // While paused no frame is requested at all: an idle rAF loop still keeps Chromium and the Qt host producing frames.
  raf = app.paused ? 0 : requestAnimationFrame(frame);
  if (app.paused || now - last < 1000 / 30 - 1) return;
  const t = now / 1000, dt = Math.min(.2, t - tPrev); tPrev = t; last = now;
  if (app.run?.tick && !app.busy) app.run.tick(t, dt);
  nFrame++; frameHooks.forEach(f => f(nFrame));
}
export const startLoop = () => { if (!raf) raf = requestAnimationFrame(frame); };
/** Freeze animation (occluded by a fullscreen window, or hidden); widgets keep their own timers. */
export function setPaused(on: boolean){ app.paused = on; document.body.classList.toggle('paused', on); if (!on) startLoop(); }
document.addEventListener('visibilitychange', () => { if (document.hidden) setPaused(true); else if (!pauseLock) setPaused(false); });
let pauseLock = false;
/** Pause requested from outside (scp-wallpaperd); survives visibility changes until released. */
export function lockPause(on: boolean){ if (on === pauseLock) return; pauseLock = on; setPaused(on || document.hidden); }
