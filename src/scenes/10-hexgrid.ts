// Hex grid: pulses travelling through cells
import { hash1, f1 } from '../core/util.ts';
import { cvInit, rad } from '../core/draw.ts';
import type { Scene } from './types.ts';

export default {
  id: 'hexgrid', pack: 'tech', name: 'Heksy', accent: '#4fe3ff', swatch: 'linear-gradient(135deg,#031018,#0a4a5c)',
  mount({ el, seed }){
    el.innerHTML = '<canvas id="cv"></canvas>';
    const cv = cvInit(el, .8), { g, w, h } = cv, S = seed % 1000;
    return {
      soft: cv.soft,
      tick(t){
        const s = 34, dx = 1.5 * s, dy = Math.sqrt(3) * s;
        g.fillStyle = '#020a10'; g.fillRect(0, 0, w, h);
        const px = w * (.5 + .35 * Math.sin(t * .23 + S)), py = h * (.5 + .3 * Math.sin(t * .31 + S * 2));
        g.lineWidth = 1;
        for (let c = -1; c * dx < w + s; c++) for (let r = -1; r * dy < h + dy; r++){
          const x = c * dx, y = r * dy + (c & 1 ? dy / 2 : 0), d = Math.hypot(x - px, y - py);
          const k = Math.max(0, Math.sin(d * .018 - t * 1.6)) * Math.exp(-d / 650), fl = hash1(c * 131 + r, S) > .985 ? Math.max(0, Math.sin(t * 2 + c + r)) : 0, v = Math.min(1, k + fl * .8);
          g.beginPath();
          for (let i = 0; i < 6; i++){ const a = rad(60 * i), X = x + (s - 2) * Math.cos(a), Y = y + (s - 2) * Math.sin(a); i ? g.lineTo(X, Y) : g.moveTo(X, Y); }
          g.closePath();
          if (v > .04){ g.fillStyle = `rgba(79,227,255,${f1(v * .22)})`; g.fill(); }
          g.strokeStyle = `rgba(79,227,255,${f1(.07 + v * .8)})`; g.stroke();
        }
      },
    };
  },
} satisfies Scene;
