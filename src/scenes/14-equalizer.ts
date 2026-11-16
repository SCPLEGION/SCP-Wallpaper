// Equalizer: real spectrum of whatever is playing (scp-wallpaperd's audio feed)
import { cvInit } from '../core/draw.ts';
import { audio } from '../data/sources.ts';
import type { Scene } from './types.ts';

export default {
  id: 'equalizer', pack: 'audio', name: 'Equalizer', accent: '#7aa8ff', swatch: 'linear-gradient(90deg,#4fe3ff,#8a5cff,#ff4fa8)',
  mount({ el, seed }){
    el.innerHTML = '<canvas id="cv"></canvas>';
    const cv = cvInit(el, .9), { g, w, h } = cv, S = seed % 1000, n = 72;
    const lv = new Float32Array(n), tg = new Float32Array(n), pk = new Float32Array(n), pv = new Float32Array(n);
    let live = false, level = 0, bass = 0;
    const off = audio.on(d => {
      live = !!(d && d.b && d.b.length === n && Date.now() - d.t < 1500);
      if (live) tg.set(d!.b); else tg.fill(0);
    }, 33);
    return {
      soft: cv.soft,
      destroy: off,
      tick(t, dt){
        const bw = w * .8 / n, x0 = w * .1, cy = h * .74, maxH = h * .36;
        let sum = 0, lo = 0;
        for (let i = 0; i < n; i++){
          const T = tg[i], v = lv[i];
          lv[i] = T > v ? v + (T - v) * .7 : v + (T - v) * .22;             // quick rise, softer fall
          if (lv[i] >= pk[i]){ pk[i] = lv[i]; pv[i] = 0; }                  // peak caps fall with gravity
          else { pv[i] += dt * 1.4; pk[i] = Math.max(lv[i], pk[i] - pv[i] * dt); }
          sum += lv[i]; if (i < 9) lo += lv[i];
        }
        level += (sum / n - level) * .3; bass += (lo / 9 - bass) * .35;

        g.fillStyle = '#04050c'; g.fillRect(0, 0, w, h);
        const glow = g.createRadialGradient(w / 2, cy, 0, w / 2, cy, w * (.3 + bass * .35));
        glow.addColorStop(0, `rgba(122,168,255,${(.05 + bass * .4).toFixed(3)})`); glow.addColorStop(1, 'rgba(122,168,255,0)');
        g.fillStyle = glow; g.fillRect(0, 0, w, h);

        const grad = g.createLinearGradient(x0, 0, x0 + w * .8, 0); grad.addColorStop(0, '#4fe3ff'); grad.addColorStop(.55, '#8a5cff'); grad.addColorStop(1, '#ff4fa8');
        for (let i = 0; i < n; i++){
          const bh = 3 + Math.pow(lv[i], 1.15) * maxH, ph = 3 + Math.pow(pk[i], 1.15) * maxH, x = x0 + i * bw, bwid = bw * .66;
          g.fillStyle = grad; g.globalAlpha = .92; g.fillRect(x, cy - bh, bwid, bh);
          g.globalAlpha = .24; g.fillRect(x, cy + 4, bwid, bh * .55);
          g.globalAlpha = 1; g.fillStyle = '#eaf3ff'; g.fillRect(x, cy - ph - 6, bwid, 2);
        }
        g.lineWidth = 1.5;
        const amp = 6 + level * 70;
        for (let k = 0; k < 3; k++){
          g.strokeStyle = ['rgba(79,227,255,.5)', 'rgba(138,92,255,.4)', 'rgba(255,79,168,.35)'][k]; g.beginPath();
          for (let x = 0; x <= w; x += 16){ const y = h * .93 + Math.sin(x * (.006 + k * .002) + t * (.8 + k * .3) + S) * amp * (.5 + k * .25) + Math.sin(x * .017 - t) * 3; x ? g.lineTo(x, y) : g.moveTo(x, y); }
          g.stroke();
        }
        if (!live){ g.font = '12px monospace'; g.fillStyle = 'rgba(234,243,255,.35)'; g.textAlign = 'center'; g.fillText('brak sygnału audio · scp-wallpaperd', w / 2, h * .5); g.textAlign = 'start'; }
      },
    };
  },
} satisfies Scene;
