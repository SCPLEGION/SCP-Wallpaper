// Canvas / geometry helpers shared by the canvas scenes.
import { W, H } from './config.ts';
import { f1 } from './util.ts';

// Chromium's GPU canvas allocates a screen-sized MSAA buffer (~250 MiB at 1440p) the moment a curved path is
// drawn. A CPU canvas (willReadFrequently) avoids it at the cost of CPU raster. canvasMode.soft picks the mode for
// the next mount; the VRAM guard (app/stage.ts) flips it when VRAM runs short and remounts the scene.
export const canvasMode = { soft: false };

export interface Cv { c: HTMLCanvasElement; g: CanvasRenderingContext2D; w: number; h: number; soft: boolean }

/** Size the scene's `<canvas>` to the viewport (DPR capped at 2, times `scale`) and return its 2D context. */
export function cvInit(el: HTMLElement, scale = 1): Cv {
  const c = el.querySelector('canvas')!, dpr = Math.min(devicePixelRatio || 1, 2) * scale;
  c.width = Math.max(1, Math.floor(innerWidth * dpr)); c.height = Math.max(1, Math.floor(innerHeight * dpr));
  const g = c.getContext('2d', { willReadFrequently: canvasMode.soft })!; g.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { c, g, w: innerWidth, h: innerHeight, soft: canvasMode.soft };
}

/** Map the 1600×900 logical space onto the canvas like SVG's `xMidYMid slice` (cover, centred). */
export function cvSlice(cv: Cv, scale = 1){
  const dpr = cv.c.width / cv.w, k = Math.max(cv.w / W, cv.h / H);
  cv.g.setTransform(dpr * k, 0, 0, dpr * k, dpr * (cv.w - W * k) / 2, dpr * (cv.h - H * k) / 2);
  return k * scale;
}

export const rad = (d: number) => d * Math.PI / 180;
export function arcPath(cx: number, cy: number, r: number, a0: number, a1: number){
  const p = (a: number) => `${f1(cx + r * Math.cos(rad(a)))} ${f1(cy + r * Math.sin(rad(a)))}`;
  return `M${p(a0)} A${r} ${r} 0 ${(a1 - a0) % 360 > 180 ? 1 : 0} 1 ${p(a1)}`;
}
export const hexs = (r: () => number, n = 4) => Array.from({ length: n }, () => Math.floor(r() * 65536).toString(16).toUpperCase().padStart(4, '0')).join(' ');
