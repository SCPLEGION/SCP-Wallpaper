// Shared bits of the SCP-themed scenes: a pre-rendered layer, the Foundation emblem, in-world text.
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
