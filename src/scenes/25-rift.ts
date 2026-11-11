// Rift: a tear in space drawing particles in, flickering edges, the picture glitching in horizontal slices
import { rng, vnoise, hash1 } from '../core/util.ts';
import { cvInit } from '../core/draw.ts';
import { TAU, MONO } from './scp.ts';
import type { Scene } from './types.ts';

export default {
  id: 'rift', name: 'Anomalia', accent: '#ff4fd8', swatch: 'linear-gradient(90deg,#07020c 0 46%,#ff4fd8 49% 51%,#07020c 54%)',
  mount({ el, seed }){
    el.innerHTML = '<canvas></canvas>';
    const cv = cvInit(el, .7), { c, g, w, h } = cv, r = rng(seed), dpr = c.width / w;
    const rx = w * .5, top = h * .12, bot = h * .88, fs = Math.max(11, Math.round(h * .016));
    const spawn = () => { const a = r() * TAU, d = Math.max(w, h) * (.3 + r() * .5); return { x: rx + Math.cos(a) * d, y: h / 2 + Math.sin(a) * d * .7, v: 20 + r() * 40, s: .6 + r() * 1.6 }; };
    const parts = Array.from({ length: 260 }, spawn);
    const edge = (t: number, side: number) => { const pts: [number, number][] = []; for (let i = 0; i <= 40; i++){ const f = i / 40, y = top + (bot - top) * f, open = Math.sin(f * Math.PI) ** .7 * w * .035 * (1 + .25 * Math.sin(t * .7));
      pts.push([rx + side * open + (vnoise(f * 9 + t * .6, seed + side) - .5) * w * .02, y]); } return pts; };
    return {
      soft: cv.soft,
      tick(t, dt){
        g.fillStyle = 'rgba(7,2,12,.35)'; g.fillRect(0, 0, w, h);
        g.globalCompositeOperation = 'lighter';
        for (const p of parts){
          const dx = rx - p.x, dy = h / 2 - p.y, d = Math.hypot(dx, dy) || 1;
          // spiral in: mostly tangential far out, radial close in
          const tx = -dy / d, ty = dx / d, k = Math.min(1, 160 / d);
          p.x += (dx / d * (.4 + k) + tx * .9) * p.v * dt * 2; p.y += (dy / d * (.4 + k) + ty * .9) * p.v * dt * 2 * .7;
          if (d < 12) Object.assign(p, spawn());
          g.fillStyle = `rgba(255,${(120 + 100 * k) | 0},230,${(.25 + .6 * k).toFixed(2)})`; g.fillRect(p.x, p.y, p.s, p.s);
        }
        const L = edge(t, -1), R = edge(t, 1);
        const glow = g.createLinearGradient(rx - w * .12, 0, rx + w * .12, 0); glow.addColorStop(0, 'rgba(255,79,216,0)'); glow.addColorStop(.5, 'rgba(255,79,216,.18)'); glow.addColorStop(1, 'rgba(255,79,216,0)');
        g.fillStyle = glow; g.fillRect(rx - w * .12, top - 40, w * .24, bot - top + 80);
        g.globalCompositeOperation = 'source-over';
        g.fillStyle = '#000'; g.beginPath(); L.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = R.length - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]); g.fill();
        g.strokeStyle = 'rgba(255,140,235,.95)'; g.lineWidth = 2; g.shadowColor = '#ff4fd8'; g.shadowBlur = 16;
        for (const s of [L, R]){ g.beginPath(); s.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); }
        g.shadowBlur = 0;
        // glitch: a few slices of the frame shifted sideways for a moment
        const slot = Math.floor(t * 4);
        if (hash1(slot, seed) < .18) for (let i = 0; i < 4; i++){ const y = hash1(slot * 7 + i, seed) * h, sh = 6 + hash1(slot * 3 + i, seed) * 40, off = (hash1(slot + i, seed + 2) - .5) * 60;
          g.drawImage(c, 0, y * dpr, c.width, sh * dpr, off, y, w, sh); }
        g.font = `${fs}px ${MONO}`; g.fillStyle = 'rgba(255,170,240,.7)'; g.textAlign = 'center';
        g.fillText(`ANOMALIA PRZESTRZENNA · SZEROKOŚĆ ${(w * .07 * (1 + .25 * Math.sin(t * .7)) / 10).toFixed(2)} m · ZABEZPIECZANIE W TOKU`, rx, h * .95); g.textAlign = 'left';
      },
    };
  },
} satisfies Scene;
