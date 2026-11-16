// Pulse: the spectrum of whatever is playing bent into a ring around a core that swells on the kick
import { cvInit } from '../core/draw.ts';
import { audio } from '../data/sources.ts';
import type { Scene } from './types.ts';

export default {
  id: 'pulse', pack: 'audio', name: 'Puls', accent: '#ff5f8f', swatch: 'radial-gradient(circle,#ffd0dc 0 8%,#ff5f8f 9% 14%,#2a0a1a 15% 40%,#ff5f8f55 41% 44%,#0a0408 46%)',
  mount({ el, seed }){
    el.innerHTML = '<canvas></canvas>';
    const cv = cvInit(el, .9), { g, w, h } = cv, n = 72, rot0 = (seed % 360) * Math.PI / 180;
    cv.c.style.background = 'radial-gradient(circle at 50% 50%,#1c0812 0,#0a0408 50%,#040103 100%)';
    const lv = new Float32Array(n), tg = new Float32Array(n);
    let live = false, bass = 0, rot = rot0;
    const off = audio.on(d => {
      live = !!(d && d.b && d.b.length === n && Date.now() - d.t < 1500);
      if (live) tg.set(d!.b); else tg.fill(0);
    }, 33);
    return {
      soft: cv.soft,
      destroy: off,
      tick(_t, dt){
        let lo = 0;
        for (let i = 0; i < n; i++){ const T = tg[i]; lv[i] += (T - lv[i]) * (T > lv[i] ? .6 : .18); if (i < 8) lo += lv[i]; }
        bass += (lo / 8 - bass) * .4; rot += dt * (.05 + bass * .4);
        g.clearRect(0, 0, w, h);
        const cx = w / 2, cy = h / 2, R0 = Math.min(w, h) * (.16 + bass * .03), L = Math.min(w, h) * .2;
        const glow = g.createRadialGradient(cx, cy, 0, cx, cy, R0 * 3); glow.addColorStop(0, `rgba(255,95,143,${(.12 + bass * .5).toFixed(3)})`); glow.addColorStop(1, 'rgba(255,95,143,0)');
        g.fillStyle = glow; g.fillRect(0, 0, w, h);
        // mirrored ring: band i drawn at angle a and at -a so lows meet at the top
        g.lineCap = 'round';
        for (let i = 0; i < n; i++){
          const v = Math.pow(lv[i], 1.1), len = 4 + v * L, k = i / n;
          for (const s of [1, -1]){
            const a = rot - Math.PI / 2 + s * (k * Math.PI + .02), c = Math.cos(a), si = Math.sin(a);
            g.strokeStyle = `rgba(${Math.round(255 - k * 120)},${Math.round(95 + k * 110)},${Math.round(143 + k * 112)},${(.55 + v * .45).toFixed(2)})`;
            g.lineWidth = Math.max(2, R0 * Math.PI / n * .8);
            g.beginPath(); g.moveTo(cx + c * R0 * 1.08, cy + si * R0 * 1.08); g.lineTo(cx + c * (R0 * 1.08 + len), cy + si * (R0 * 1.08 + len)); g.stroke();
          }
        }
        g.lineCap = 'butt';
        const core = g.createRadialGradient(cx, cy, 0, cx, cy, R0); core.addColorStop(0, '#ffe3ea'); core.addColorStop(.4, '#ff5f8f'); core.addColorStop(1, 'rgba(60,10,30,.9)');
        g.fillStyle = core; g.beginPath(); g.arc(cx, cy, R0 * (.92 + bass * .12), 0, Math.PI * 2); g.fill();
        g.strokeStyle = 'rgba(255,200,215,.25)'; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, R0 * 1.02 + L * 1.15, 0, Math.PI * 2); g.stroke();
        if (!live){ g.font = '12px monospace'; g.fillStyle = 'rgba(255,220,230,.4)'; g.textAlign = 'center'; g.fillText('brak sygnału audio · scp-wallpaperd', cx, cy + R0 + L * 1.4); g.textAlign = 'start'; }
      },
    };
  },
} satisfies Scene;
