// Waves: layered sine bands (canvas; was SVG paths rewritten every frame)
import { W, H } from '../core/config.ts';
import { rng } from '../core/util.ts';
import { cvInit, cvSlice } from '../core/draw.ts';
import type { Scene } from './types.ts';

export default {
  id: 'waves', name: 'Fale', swatch: 'linear-gradient(#06222b,#14707a)',
  mount({ el, seed }){
    const r = rng(seed), hue = 170 + Math.floor(r() * 50);
    const layers = Array.from({ length: 9 }, (_, i) => ({ base: 330 + i * 62, amp: 22 + i * 4, k: .0036 + i * .0006 + r() * .0008, sp: .22 + i * .035 + r() * .1, ph: r() * 6.28, ph2: r() * 6.28,
      fill: `hsla(${hue},${45 + i * 3}%,${16 + i * 3.4}%,.9)` }));
    el.innerHTML = '<canvas id="cv"></canvas>';
    const cv = cvInit(el, .8), g = cv.g;
    cvSlice(cv);
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, `hsl(${hue},55%,8%)`); bg.addColorStop(1, `hsl(${hue},50%,16%)`);
    return {
      soft: cv.soft,
      tick(t){
        g.fillStyle = bg; g.fillRect(-W, -H, W * 3, H * 3);
        for (const L of layers){
          g.beginPath(); g.moveTo(-20, H + 20);
          for (let x = -20; x <= W + 20; x += 20) g.lineTo(x, L.base + L.amp * Math.sin(x * L.k + t * L.sp + L.ph) + L.amp * .45 * Math.sin(x * L.k * 2.3 - t * L.sp * .7 + L.ph2));
          g.lineTo(W + 20, H + 20); g.closePath(); g.fillStyle = L.fill; g.fill();
        }
      },
    };
  },
} satisfies Scene;
