// Ridges: a landscape made of the music. Every few frames the current spectrum becomes a new ridge line at the
// front and the older ones recede into the distance.
import { cvInit } from '../core/draw.ts';
import { audio } from '../data/sources.ts';
import type { Scene } from './types.ts';

export default {
  id: 'ridges', pack: 'audio', name: 'Grzbiety', accent: '#ffd36e', swatch: 'repeating-linear-gradient(#0b0a10 0 10px,#ffd36e55 10px 11px),linear-gradient(#0b0a10,#0b0a10)',
  mount({ el, seed }){
    el.innerHTML = '<canvas></canvas>';
    const cv = cvInit(el, .8), { g, w, h } = cv, n = 72, rows = 40, S = seed % 1000;
    cv.c.style.background = 'linear-gradient(#060509 0,#0b0a10 60%,#141019 100%)';
    const cur = new Float32Array(n), hist: Float32Array[] = Array.from({ length: rows }, () => new Float32Array(n));
    let live = false, acc = 0;
    const off = audio.on(d => {
      live = !!(d && d.b && d.b.length === n && Date.now() - d.t < 1500);
      if (live) cur.set(d!.b);
    }, 33);
    return {
      soft: cv.soft,
      destroy: off,
      tick(t, dt){
        acc += dt;
        if (acc > .09){
          acc = 0;
          const row = hist.pop()!;
          // spectrum mirrored around the centre (bass in the middle); idle = gentle hills
          for (let i = 0; i < n; i++){ const k = Math.abs(i - n / 2) * 2 | 0, v = live ? cur[Math.min(n - 1, k)] : 0; row[i] = v * .9 + .05 + .04 * Math.sin(i * .3 + t * .7 + S); }
          hist.unshift(row);
        }
        g.clearRect(0, 0, w, h);
        const horizon = h * .3, base = h * .95;
        for (let j = rows - 1; j >= 0; j--){
          const z = j / rows, y0 = horizon + (base - horizon) * Math.pow(1 - z, 1.8), sc = .35 + .65 * (1 - z), amp = h * .28 * sc, xw = w * (.5 + .55 * sc), x0 = (w - xw) / 2;
          g.beginPath(); g.moveTo(x0, y0);
          for (let i = 0; i < n; i++){ const edge = Math.sin(i / (n - 1) * Math.PI); g.lineTo(x0 + xw * i / (n - 1), y0 - hist[j][i] * amp * edge); }
          g.lineTo(x0 + xw, y0);
          g.fillStyle = '#0b0a10'; g.fill();     // hide what's behind, like a real ridge
          const a = (1 - z) * .95;
          g.strokeStyle = j === 0 ? 'rgba(255,240,200,.95)' : `rgba(255,211,110,${a.toFixed(3)})`; g.lineWidth = j === 0 ? 1.8 : 1.1; g.stroke();
        }
        if (!live){ g.font = '12px monospace'; g.fillStyle = 'rgba(255,220,160,.35)'; g.textAlign = 'center'; g.fillText('brak sygnału audio · scp-wallpaperd', w / 2, h * .2); g.textAlign = 'start'; }
      },
    };
  },
} satisfies Scene;
