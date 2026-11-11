// Canvas / geometry helpers shared by the HUD scenes.
'use strict';

/* ---------------- HUD / Jarvis scenes ---------------- */
// Chromium's GPU canvas allocates a screen-sized MSAA buffer (~250 MiB at 1440p) the moment a curved path is
// drawn. A CPU canvas (willReadFrequently) avoids it at the cost of CPU raster. cvSoft picks the mode for the
// next mount; vramGuard() (app/state.js) flips it when VRAM runs short and remounts the scene.
let cvSoft = false;
function cvInit(scene, scale = 1){
  const c = $('cv'), dpr = Math.min(devicePixelRatio || 1, 2) * scale;
  c.width = Math.max(1, Math.floor(innerWidth * dpr)); c.height = Math.max(1, Math.floor(innerHeight * dpr));
  scene.c = c; scene.g = c.getContext('2d', { willReadFrequently: cvSoft }); scene.g.setTransform(dpr, 0, 0, dpr, 0, 0);
  scene.w = innerWidth; scene.h = innerHeight; scene.soft = cvSoft;
}
const rad = d => d * Math.PI / 180;
function arcPath(cx, cy, r, a0, a1){
  const p = a => `${f1(cx + r * Math.cos(rad(a)))} ${f1(cy + r * Math.sin(rad(a)))}`;
  return `M${p(a0)} A${r} ${r} 0 ${(a1 - a0) % 360 > 180 ? 1 : 0} 1 ${p(a1)}`;
}
const hexs = (r, n = 4) => Array.from({ length: n }, () => Math.floor(r() * 65536).toString(16).toUpperCase().padStart(4, '0')).join(' ');
