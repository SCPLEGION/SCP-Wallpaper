// Data stream: falling glyph columns
import { rng } from '../core/util.ts';
import { cvInit } from '../core/draw.ts';
import type { Scene } from './types.ts';

export default {
  id: 'datastream', name: 'Strumień', accent: '#5dffc8', swatch: 'linear-gradient(#010806,#0b5c3f)',
  mount({ el, seed }){
    el.innerHTML = '<canvas id="cv"></canvas>';
    const cv = cvInit(el, 1), { g, w, h } = cv, r = rng(seed), fs = 16, n = Math.ceil(w / fs), CH = '01ABCDEF<>/|=+*#:;';
    const y = Array.from({ length: n }, () => r() * -60), v = Array.from({ length: n }, () => .25 + r() * .6);
    g.fillStyle = '#010806'; g.fillRect(0, 0, w, h);
    let acc = 0;
    return {
      soft: cv.soft,
      tick(t, dt){
        acc += dt; if (acc < .04) return; acc = 0;
        g.fillStyle = 'rgba(1,8,6,.13)'; g.fillRect(0, 0, w, h);
        g.font = fs + 'px monospace';
        for (let i = 0; i < n; i++){
          g.fillStyle = 'rgba(93,255,200,.55)'; g.fillText(CH[(Math.random() * CH.length) | 0], i * fs, (y[i] - 1) * fs);
          g.fillStyle = '#e4fff6'; g.fillText(CH[(Math.random() * CH.length) | 0], i * fs, y[i] * fs);
          y[i] += v[i] * 1.6; if (y[i] * fs > h + 40 && Math.random() > .97) y[i] = -Math.random() * 30;
        }
      },
    };
  },
} satisfies Scene;
