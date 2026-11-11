// Reality anchor: a field of lines bent by a local reality fluctuation, held flat by a stabiliser ring
import { vnoise } from '../core/util.ts';
import { cvInit } from '../core/draw.ts';
import { TAU, MONO } from './scp.ts';
import type { Scene } from './types.ts';

export default {
  id: 'anchor', name: 'Kotwica', accent: '#b98cff', swatch: 'radial-gradient(circle,#b98cff 0 6%,#2a1550 7% 30%,#0b0618 60%)',
  mount({ el, seed }){
    el.innerHTML = '<canvas></canvas>';
    const cv = cvInit(el, .7), { g, w, h } = cv, P = '185,140,255', fs = Math.max(11, Math.round(h * .017));
    const ax = w * .5, ay = h * .5, AR = Math.min(w, h) * .14;
    return {
      soft: cv.soft,
      tick(t){
        g.fillStyle = '#0b0618'; g.fillRect(0, 0, w, h);
        // the anomaly wanders; inside the anchor's ring the distortion is damped to zero
        const fx = w * (.25 + .5 * vnoise(t * .03, seed)), fy = h * (.25 + .5 * vnoise(t * .03 + 40, seed + 1)), amp = h * .05 * (.6 + .4 * Math.sin(t * .4));
        const disp = (x: number, y: number) => {
          const d = Math.hypot(x - fx, y - fy), da = Math.hypot(x - ax, y - ay);
          const damp = Math.min(1, Math.max(0, (da - AR * .9) / (AR * 1.6)));
          return amp * Math.exp(-d * d / (h * h * .06)) * Math.sin(d * .04 - t * 2) * damp;
        };
        g.lineWidth = 1;
        for (let y = -20; y <= h + 20; y += 22){
          g.strokeStyle = `rgba(${P},${(.14 + .1 * Math.sin(y * .02 + t)).toFixed(3)})`; g.beginPath();
          for (let x = 0; x <= w; x += 12){ const yy = y + disp(x, y); x ? g.lineTo(x, yy) : g.moveTo(x, yy); }
          g.stroke();
        }
        g.save(); g.translate(ax, ay);
        g.strokeStyle = `rgba(${P},.9)`; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, AR, 0, TAU); g.stroke();
        g.lineWidth = 1; g.strokeStyle = `rgba(${P},.5)`; g.beginPath(); g.arc(0, 0, AR * 1.12, 0, TAU); g.stroke();
        for (let k = 0; k < 3; k++){ g.rotate(t * (.3 + k * .15) * (k % 2 ? -1 : 1) % TAU); g.strokeStyle = `rgba(${P},${.7 - k * .2})`; g.lineWidth = 3 - k; g.beginPath(); g.arc(0, 0, AR * (.55 + k * .14), 0, 1.6); g.stroke(); g.beginPath(); g.arc(0, 0, AR * (.55 + k * .14), 3.14, 4.74); g.stroke(); }
        g.restore();
        const core = g.createRadialGradient(ax, ay, 0, ax, ay, AR * .4); core.addColorStop(0, `rgba(${P},.9)`); core.addColorStop(1, `rgba(${P},0)`); g.fillStyle = core; g.beginPath(); g.arc(ax, ay, AR * .4, 0, TAU); g.fill();
        // tracker on the anomaly
        g.strokeStyle = 'rgba(255,120,160,.7)'; g.setLineDash([4, 6]); g.beginPath(); g.arc(fx, fy, 26 + 6 * Math.sin(t * 2), 0, TAU); g.stroke(); g.setLineDash([]);
        const hume = 1 + .04 * Math.sin(t * .9) * vnoise(t * .2, seed + 5), local = 1 - amp / (h * .05) * .35;
        g.font = `${fs}px ${MONO}`; g.textAlign = 'center'; g.fillStyle = `rgba(${P},.85)`;
        g.fillText(`SKRANTON · KOTWICA RZECZYWISTOŚCI · HUME ${hume.toFixed(3)}`, ax, ay + AR * 1.5);
        g.fillStyle = 'rgba(255,140,170,.8)'; g.fillText(`FLUKTUACJA ${local.toFixed(2)} Hm`, fx, fy - 40);
      },
    };
  },
} satisfies Scene;
