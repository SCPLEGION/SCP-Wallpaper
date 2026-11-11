// Dots: wave through a grid (canvas; was 920 SVG circles with two attributes rewritten every frame)
import { W, H } from '../core/config.ts';
import { rng } from '../core/util.ts';
import { cvInit, cvSlice } from '../core/draw.ts';
import type { Scene } from './types.ts';

export default {
  id: 'dots', name: 'Siatka', swatch: 'radial-gradient(circle,#cfd8dc 1.5px,transparent 2px) 0 0/12px 12px,#0e0f12',
  mount({ el, seed }){
    const r = rng(seed), cols = 40, rows = 23, sp = 40, o = [r() * 6.28, r() * 6.28];
    const hue = r() < .5 ? '207,216,220' : '241,214,184';
    el.innerHTML = '<canvas id="cv"></canvas>';
    const cv = cvInit(el, 1), g = cv.g;
    cvSlice(cv);
    return {
      soft: cv.soft,
      tick(t){
        g.fillStyle = '#0d0e12'; g.fillRect(-W, -H, W * 3, H * 3);
        const px = 800 + 520 * Math.sin(t * .27 + o[0]), py = 450 + 280 * Math.sin(t * .21 + o[1]);
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++){
          const X = x * sp + 20, Y = y * sp + 10, d = Math.hypot(X - px, Y - py), k = Math.max(0, Math.sin(d * .018 - t * 1.3)) * Math.exp(-d / 900);
          g.fillStyle = `rgba(${hue},${Math.min(1, .18 + k * 1.1).toFixed(2)})`;
          g.beginPath(); g.arc(X, Y, 1.6 + k * 7, 0, 6.2832); g.fill();
        }
      },
    };
  },
} satisfies Scene;
