// Topo: breathing contour lines (canvas; was 36 SVG paths rewritten every frame)
import { W, H } from '../core/config.ts';
import { rng } from '../core/util.ts';
import { cvInit, cvSlice } from '../core/draw.ts';
import type { Scene } from './types.ts';

export default {
  id: 'topo', name: 'Topo', swatch: 'linear-gradient(135deg,#101512,#2a3a31)',
  mount({ el, seed }){
    const r = rng(seed), cx = 560 + r() * 480, cy = 380 + r() * 140;
    const ph = [0, 1, 2, 3].map(() => r() * 6.28), w = [0, 1, 2, 3].map(() => (r() - .5) * .22);
    const warm = r() < .5, col = warm ? '233,225,207' : '207,230,220', acc = warm ? '232,130,106' : '143,211,199', bg = warm ? '#11110f' : '#0d1311';
    el.innerHTML = '<canvas id="cv"></canvas>';
    const cv = cvInit(el, .9), g = cv.g;
    cvSlice(cv);
    return {
      soft: cv.soft,
      tick(t){
        g.fillStyle = bg; g.fillRect(-W, -H, W * 3, H * 3);
        for (let k = 1; k <= 36; k++){
          const strong = k % 6 === 0, R = k * 17;
          g.beginPath();
          for (let a = 0; a <= 96; a++){
            const th = a / 96 * Math.PI * 2;
            const n = Math.sin(th + ph[0] + t * w[0] + k * .11) * .5 + Math.sin(2 * th + ph[1] + t * w[1] - k * .08) * .3 + Math.sin(3 * th + ph[2] + t * w[2] + k * .14) * .2;
            const rr = R + k * 3.4 * n, x = cx + rr * 1.55 * Math.cos(th), y = cy + rr * Math.sin(th);
            a ? g.lineTo(x, y) : g.moveTo(x, y);
          }
          g.closePath();
          g.strokeStyle = `rgba(${strong ? acc : col},${strong ? .75 : Math.max(.08, .5 - k * .012).toFixed(2)})`; g.lineWidth = strong ? 1.8 : 1; g.stroke();
        }
      },
    };
  },
} satisfies Scene;
