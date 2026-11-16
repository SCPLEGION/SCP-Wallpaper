// Aurora: northern lights rippling over a snowy ridge and a lake that mirrors them
import { cvInit } from '../core/draw.ts';
import { rng, fbm1 } from '../core/util.ts';
import type { Scene } from './types.ts';

export default {
  id: 'aurora', pack: 'klimat', name: 'Zorza', accent: '#5dffb0', swatch: 'linear-gradient(#020812,#0d3a3a 45%,#3dff9a 60%,#05101c 62%)',
  mount({ el, seed }){
    el.innerHTML = '<canvas></canvas>';
    const cv = cvInit(el, .7), { g, w, h } = cv, r = rng(seed), S = seed % 997, horizon = h * .7;
    cv.c.style.background = 'linear-gradient(#01040b 0%,#04111f 55%,#071a24 70%,#02070d 70.2%,#04101a 100%)';
    const stars = Array.from({ length: 260 }, () => [r() * w, r() * horizon, r() * 1.3, r() * 6]);
    // the ridge: one fixed silhouette per seed
    const ridge: number[] = []; for (let x = 0; x <= w; x += 8) ridge.push(horizon - 40 - fbm1(x * .004, S) * h * .17);
    const curtain = (t: number, k: number, hue: [number, number, number], base: number) => {
      const step = 6;
      for (let x = 0; x <= w; x += step){
        const n = fbm1(x * .0025 + t * .05 * (k + 1), S + k * 31), y0 = base + Math.sin(x * .004 + t * .25 + k) * h * .05 + n * h * .12;
        const len = h * (.12 + .22 * fbm1(x * .006 - t * .1, S + 9 + k)), a = .08 + .5 * Math.pow(fbm1(x * .01 + t * .3, S + 17 + k), 2);
        const gr = g.createLinearGradient(0, y0 - len, 0, y0);
        gr.addColorStop(0, `rgba(${hue[0]},${hue[1]},${hue[2]},0)`); gr.addColorStop(.75, `rgba(${hue[0]},${hue[1]},${hue[2]},${(a * .6).toFixed(3)})`); gr.addColorStop(1, `rgba(140,255,200,${a.toFixed(3)})`);
        g.fillStyle = gr; g.fillRect(x, y0 - len, step + 1, len);
      }
    };
    return {
      soft: cv.soft,
      tick(t){
        g.clearRect(0, 0, w, h);
        for (const [x, y, s, p] of stars){ g.fillStyle = `rgba(230,240,255,${(.35 + .35 * Math.sin(t * 1.3 + p)).toFixed(2)})`; g.fillRect(x, y, s + .4, s + .4); }
        g.globalCompositeOperation = 'lighter';
        curtain(t, 0, [60, 255, 160], h * .42);
        curtain(t, 1, [120, 90, 255], h * .3);
        curtain(t, 2, [40, 220, 255], h * .5);
        g.globalCompositeOperation = 'source-over';
        // lake: mirror of the sky, squashed and dimmed
        g.save(); g.globalAlpha = .35; g.translate(0, horizon * 2); g.scale(1, -1);
        g.drawImage(cv.c, 0, 0, cv.c.width, horizon * cv.c.width / w, 0, 0, w, horizon); g.restore();
        g.fillStyle = 'rgba(2,8,14,.45)'; g.fillRect(0, horizon, w, h - horizon);
        for (let i = 0; i < 14; i++){ const y = horizon + 6 + i * i * 1.6; g.fillStyle = `rgba(160,255,210,${(.05 - i * .003).toFixed(3)})`; g.fillRect(0, y + Math.sin(t + i) * 1.5, w, 1); }
        // ridge on top
        g.fillStyle = '#03080e'; g.beginPath(); g.moveTo(0, horizon);
        ridge.forEach((y, i) => g.lineTo(i * 8, y)); g.lineTo(w, horizon); g.closePath(); g.fill();
        g.strokeStyle = 'rgba(200,240,255,.12)'; g.beginPath(); ridge.forEach((y, i) => i ? g.lineTo(i * 8, y) : g.moveTo(0, y)); g.stroke();
      },
    };
  },
} satisfies Scene;
