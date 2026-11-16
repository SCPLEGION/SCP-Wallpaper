// Flow: a few thousand particles following a slowly turning noise field, leaving fading trails
import { cvInit } from '../core/draw.ts';
import { rng, vnoise } from '../core/util.ts';
import type { Scene } from './types.ts';

// pink on the left blending to cyan on the right
const BANDS = Array.from({ length: 8 }, (_, k) => { const u = .15 + k / 7 * .7; return `rgba(${Math.round(255 * (1 - u) + 47 * u)},${Math.round(122 * (1 - u) + 214 * u)},${Math.round(217 * (1 - u) + 255 * u)},.7)`; });

export default {
  id: 'flow', pack: 'tech', name: 'Przepływ', accent: '#ff7ad9', swatch: 'linear-gradient(120deg,#0b0716,#3a1450 40%,#ff7ad9 70%,#2fd6ff)',
  mount({ el, seed }){
    el.innerHTML = '<canvas></canvas>';
    const cv = cvInit(el, .6), { g, w, h } = cv, r = rng(seed), S = seed % 991, n = 1600;
    const px = new Float32Array(n), py = new Float32Array(n), life = new Float32Array(n);
    const reset = (i: number) => { px[i] = r() * w; py[i] = r() * h; life[i] = 2 + r() * 6; };
    for (let i = 0; i < n; i++) reset(i);
    g.fillStyle = '#07050d'; g.fillRect(0, 0, w, h);
    const field = (x: number, y: number, t: number) => {
      const s = .0022;
      return (vnoise(x * s + t * .03, S) + vnoise(y * s * 1.3 - t * .02, S + 5) + vnoise((x + y) * s * .7, S + 11)) * Math.PI * 1.4;
    };
    return {
      soft: cv.soft,
      tick(t, dt){
        g.fillStyle = 'rgba(7,5,13,.06)'; g.fillRect(0, 0, w, h);   // fade = trails
        g.globalCompositeOperation = 'lighter';
        const paths = BANDS.map(() => new Path2D());   // one stroke per colour band, not per particle
        for (let i = 0; i < n; i++){
          const a = field(px[i], py[i], t), x = px[i], y = py[i];
          px[i] += Math.cos(a) * 55 * dt; py[i] += Math.sin(a) * 55 * dt; life[i] -= dt;
          const p = paths[Math.min(BANDS.length - 1, Math.max(0, Math.floor(x / w * BANDS.length)))];
          p.moveTo(x, y); p.lineTo(px[i], py[i]);
          if (life[i] < 0 || px[i] < 0 || px[i] > w || py[i] < 0 || py[i] > h) reset(i);
        }
        g.lineWidth = 1.3; paths.forEach((p, k) => { g.strokeStyle = BANDS[k]; g.stroke(p); }); g.lineWidth = 1;
        g.globalCompositeOperation = 'source-over';
      },
    };
  },
} satisfies Scene;
