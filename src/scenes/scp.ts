// Shared bits of the SCP-themed scenes: a pre-rendered layer, the Foundation emblem, in-world text.
import { W } from '../core/config.ts';
import { svg } from '../core/util.ts';
import { cvInit } from '../core/draw.ts';
import type { Cv } from '../core/draw.ts';

export const TAU = Math.PI * 2;

/** An offscreen canvas the size of `cv`, drawn once in CSS pixels; blit with g.drawImage(c, 0, 0, w, h). */
export function layer(cv: Cv, draw: (g: CanvasRenderingContext2D) => void){
  const c = document.createElement('canvas'); c.width = cv.c.width; c.height = cv.c.height;
  const g = c.getContext('2d')!, dpr = cv.c.width / cv.w; g.setTransform(dpr, 0, 0, dpr, 0, 0); draw(g);
  return c;
}

/** The emblem: outer ring, inner ring, three arrows pointing in. `bg` cuts the gaps around the arrows. */
export function emblem(g: CanvasRenderingContext2D, cx: number, cy: number, R: number, col: string, bg: string){
  g.save(); g.translate(cx, cy);
  g.strokeStyle = col; g.lineWidth = R * .16; g.beginPath(); g.arc(0, 0, R * .86, 0, TAU); g.stroke();
  g.lineWidth = R * .07; g.beginPath(); g.arc(0, 0, R * .42, 0, TAU); g.stroke();
  for (let i = 0; i < 3; i++){
    g.save(); g.rotate(-Math.PI / 2 + i * TAU / 3);
    const arrow = () => { g.beginPath(); g.moveTo(R * .5, 0); g.lineTo(R * .78, -R * .19); g.lineTo(R * .78, -R * .065); g.lineTo(R * 1.14, -R * .065); g.lineTo(R * 1.14, R * .065); g.lineTo(R * .78, R * .065); g.lineTo(R * .78, R * .19); g.closePath(); };
    arrow(); g.strokeStyle = bg; g.lineWidth = R * .09; g.lineJoin = 'miter'; g.stroke();
    arrow(); g.fillStyle = col; g.fill();
    g.restore();
  }
  g.restore();
}

export const MONO = 'ui-monospace, "JetBrains Mono", "DejaVu Sans Mono", monospace';
export const pad2 = (n: number) => String(n).padStart(2, '0');
export const clock = (d = new Date()) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
export const SITES = ['SITE-19', 'SITE-17', 'SITE-11', 'AREA-12', 'SITE-06', 'SITE-64'];
export const CLASSES = ['SAFE', 'EUCLID', 'KETER', 'THAUMIEL'];

// ---- the console kit: what makes a scene sit beside Dashboard (backdrop, header, centred stage, rails) ----

/** Dashboard's widget set: two columns beside the stage, the clock under it. */
export const PRESET = { on: ['clock', 'system', 'claude', 'calendar', 'progress'], layout: {
  clock: { x: .455, y: .925, s: .3 }, system: { x: .04, y: .30, s: .8 }, claude: { x: .04, y: .70, s: .8 }, calendar: { x: .78, y: .20, s: .8 }, progress: { x: .78, y: .60, s: .8 } } };

export interface Deck { cv: Cv; g: CanvasRenderingContext2D; w: number; h: number; cx: number; cy: number; R: number; A: string; dpr: number }

/** Canvas + SVG header in Dashboard's style. The backdrop is a CSS gradient (no full-screen fill per frame);
 *  R is the globe's radius, so a stage of ~1.5 R leaves the widget columns clear. */
export function deck(el: HTMLElement, o: { rgb: string; left: string; right: string; bg: [string, string, string] }): Deck {
  const C = `rgb(${o.rgb})`;
  el.innerHTML = '<canvas></canvas>' + svg(`<g font-family="monospace" fill="${C}"><text x="60" y="64" font-size="12" letter-spacing="7" fill-opacity=".7">${o.left}</text>
    <text x="${W - 60}" y="64" font-size="11" letter-spacing="5" text-anchor="end" fill-opacity=".55">${o.right}</text><circle class="hb" cx="${W - 75 - o.right.length * 11.6}" cy="60" r="3" fill="${C}"/></g>
    <style>.hb{animation:hb 1.6s steps(2) infinite}@keyframes hb{50%{opacity:.15}}</style>`);
  const cv = cvInit(el, 1), { g, w, h } = cv;
  cv.c.style.background = `radial-gradient(circle ${Math.max(w, h) * .75}px at 50% 53%, ${o.bg[0]} 0, ${o.bg[1]} 45%, ${o.bg[2]} 100%)`;
  return { cv, g, w, h, cx: w * .5, cy: h * .53, R: Math.min(h * .31, w * .19), A: o.rgb, dpr: cv.c.width / w };
}

/** A square offscreen sprite `size` CSS px wide, drawn around its centre (0,0). Blit with g.drawImage(s, x - size/2, y - size/2, size, size). */
export function sprite(size: number, dpr: number, draw: (g: CanvasRenderingContext2D) => void){
  const c = document.createElement('canvas'); c.width = c.height = Math.ceil(size * dpr);
  const g = c.getContext('2d')!; g.setTransform(dpr, 0, 0, dpr, size * dpr / 2, size * dpr / 2); draw(g);
  return c;
}

/** Yaw about the vertical axis, then tilt toward the viewer; y points down. Returns [x, y, depth] (depth > 0 faces the viewer). */
export function view(cx: number, cy: number, R: number, yaw: number, tilt: number){
  const cyw = Math.cos(yaw), syw = Math.sin(yaw), ct = Math.cos(tilt), st = Math.sin(tilt);
  return (x: number, y: number, z: number, k = 1): [number, number, number] => { const X = x * cyw + z * syw, Z = -x * syw + z * cyw; return [cx + R * k * X, cy + R * k * (y * ct - Z * st), y * st + Z * ct]; };
}

/** Soft radial light: alpha `a` at r0 fading to 0 at r1. */
export function halo(g: CanvasRenderingContext2D, x: number, y: number, r0: number, r1: number, A: string, a: number){
  const gr = g.createRadialGradient(x, y, r0, x, y, r1); gr.addColorStop(0, `rgba(${A},${a})`); gr.addColorStop(.4, `rgba(${A},${a * .3})`); gr.addColorStop(1, `rgba(${A},0)`);
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r1, 0, TAU); g.fill();
}

/** Dashboard's two tick rails the curved widgets hug. Returns the geo for run.geo. */
export function rails(g: CanvasRenderingContext2D, cx: number, cy: number, Rc: number, A: string){
  for (const side of [-1, 1]){
    const mid = side < 0 ? Math.PI : 0, span = .62;
    g.strokeStyle = `rgba(${A},.55)`; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, Rc, mid - span, mid + span); g.stroke(); g.lineWidth = 1;
    g.strokeStyle = `rgba(${A},.25)`; g.beginPath(); g.arc(cx, cy, Rc + 9, mid - span - .05, mid + span + .05); g.stroke();
    for (let i = -24; i <= 24; i++){ const a = mid + i * span / 24, L = i % 6 ? 4 : 9, c = Math.cos(a), s = Math.sin(a); g.strokeStyle = `rgba(${A},${i % 6 ? .25 : .5})`; g.beginPath(); g.moveTo(cx + (Rc + 9) * c, cy + (Rc + 9) * s); g.lineTo(cx + (Rc + 9 + L) * c, cy + (Rc + 9 + L) * s); g.stroke(); }
  }
  return { cx, cy, Rc };
}

/** A leader line from a point to a label, Dashboard's callout. */
export function callout(g: CanvasRenderingContext2D, x: number, y: number, ex: number, ey: number, text: string, A: string, box = true){
  g.strokeStyle = `rgba(${A},.8)`; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (ex > x ? 24 : -24), ey); g.lineTo(ex, ey); g.stroke();
  if (box) g.strokeRect(x - 8, y - 8, 16, 16);
  g.font = `13px ${MONO}`; g.fillStyle = `rgba(${A},.9)`; g.textAlign = ex > x ? 'left' : 'right'; g.fillText(text, ex + (ex > x ? 8 : -8), ey - 7); g.textAlign = 'left';
}

/** Copy only the rect (x, y, w, h) of a full-screen layer: blitting the whole screen per frame costs as much as drawing it. */
export function blit(g: CanvasRenderingContext2D, c: HTMLCanvasElement, dpr: number, x: number, y: number, w: number, h: number){
  x = Math.max(0, Math.floor(x)); y = Math.max(0, Math.floor(y)); w = Math.min(c.width / dpr - x, Math.ceil(w)); h = Math.min(c.height / dpr - y, Math.ceil(h));
  g.drawImage(c, x * dpr, y * dpr, w * dpr, h * dpr, x, y, w, h);
}
