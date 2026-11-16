// Tunnel: flying through a wireframe tube that bends and twists, rings rushing past
import { cvInit } from '../core/draw.ts';
import type { Scene } from './types.ts';

export default {
  id: 'tunnel', pack: 'tech', name: 'Tunel', accent: '#4fffe0', swatch: 'radial-gradient(circle,#000 0 10%,#0d4b52 30%,#4fffe0 34%,#06141a 40%,#020608 70%)',
  mount({ el, seed }){
    el.innerHTML = '<canvas></canvas>';
    const cv = cvInit(el, .8), { g, w, h } = cv, S = (seed % 1000) / 100, rings = 34, seg = 28, depth = 26;
    cv.c.style.background = 'radial-gradient(circle at 50% 50%,#062027 0,#02080b 55%,#000 100%)';
    // centre of the tube at depth z: slow sinuous path
    const path = (z: number, t: number) => [Math.sin(z * .11 + t * .4 + S) * 1.6 + Math.sin(z * .05 + S) * 1.2, Math.cos(z * .09 + t * .3 + S) * 1.1];
    return {
      soft: cv.soft,
      tick(t){
        g.clearRect(0, 0, w, h);
        const speed = 5, travel = t * speed, f = h * .9, [ox, oy] = path(travel, t);
        const proj = (x: number, y: number, z: number) => [w / 2 + (x - ox) / z * f, h / 2 + (y - oy) / z * f];
        let prev: number[][] | null = null;
        for (let i = rings; i >= 1; i--){
          const zr = i - (travel % 1), zw = travel + zr, [cxr, cyr] = path(zw, t), tw = zw * .08 + t * .2, pts: number[][] = [];
          for (let k = 0; k <= seg; k++){ const a = k / seg * Math.PI * 2 + tw; pts.push(proj(cxr + Math.cos(a) * 2.2, cyr + Math.sin(a) * 2.2, Math.max(.2, zr))); }
          const a = Math.min(1, (1 - zr / depth) * 1.2) * Math.min(1, zr * .8);
          if (a <= 0){ prev = pts; continue; }
          const hot = Math.floor(zw) % 6 === 0;
          g.strokeStyle = hot ? `rgba(255,120,220,${(a * .9).toFixed(3)})` : `rgba(79,255,224,${(a * .55).toFixed(3)})`; g.lineWidth = hot ? 1.8 : 1;
          g.beginPath(); pts.forEach((p, k) => k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke();
          if (prev){ g.strokeStyle = `rgba(79,255,224,${(a * .22).toFixed(3)})`; g.lineWidth = 1; g.beginPath(); for (let k = 0; k < seg; k += 2){ g.moveTo(pts[k][0], pts[k][1]); g.lineTo(prev[k][0], prev[k][1]); } g.stroke(); }
          prev = pts;
        }
      },
    };
  },
} satisfies Scene;
