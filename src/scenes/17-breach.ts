// Breach: containment breach lockdown, rotating red beacons over a corridor, hazard stripes, scrolling alert
import { cvInit } from '../core/draw.ts';
import { layer, TAU, MONO, SITES } from './scp.ts';
import type { Scene } from './types.ts';

export default {
  id: 'breach', name: 'Naruszenie', accent: '#ff3b30', hud: true, swatch: 'repeating-linear-gradient(135deg,#2a0606 0 10px,#120202 10px 20px)',
  mount({ el, seed }){
    el.innerHTML = '<canvas></canvas>';
    const cv = cvInit(el, .7), { g, w, h } = cv, site = SITES[seed % SITES.length], vx = w * .5, vy = h * .48;
    const bg = layer(cv, b => {
      b.fillStyle = '#0b0606'; b.fillRect(0, 0, w, h);
      // corridor: floor and ceiling panels converging on the vanishing point
      b.strokeStyle = 'rgba(255,90,80,.10)'; b.lineWidth = 1;
      for (let i = -12; i <= 12; i++){ b.beginPath(); b.moveTo(vx, vy); b.lineTo(vx + i * w * .09, h); b.moveTo(vx, vy); b.lineTo(vx + i * w * .09, 0); b.stroke(); }
      for (let k = 1; k < 14; k++){ const f = Math.pow(k / 14, 2.2), y1 = vy + (h - vy) * f, y0 = vy - vy * f; b.beginPath(); b.moveTo(0, y1); b.lineTo(w, y1); b.moveTo(0, y0); b.lineTo(w, y0); b.stroke(); }
      const door = h * .16; b.fillStyle = '#030101'; b.fillRect(vx - door * .6, vy - door, door * 1.2, door * 1.6);
      b.strokeStyle = 'rgba(255,90,80,.35)'; b.strokeRect(vx - door * .6, vy - door, door * 1.2, door * 1.6);
      // hazard stripes
      const band = h * .055;
      for (const y of [0, h - band]){
        b.save(); b.beginPath(); b.rect(0, y, w, band); b.clip(); b.fillStyle = '#120a02'; b.fillRect(0, y, w, band);
        b.fillStyle = 'rgba(230,170,20,.55)'; for (let x = -band; x < w + band; x += band * 1.6){ b.beginPath(); b.moveTo(x, y + band); b.lineTo(x + band * .8, y + band); b.lineTo(x + band * 1.6, y); b.lineTo(x + band * .8, y); b.fill(); }
        b.restore();
      }
    });
    const ticker = `CONTAINMENT BREACH · ${site} · SECTOR 4 · LOCKDOWN IN EFFECT · ALL PERSONNEL REPORT TO DESIGNATED SHELTERS · MTF EN ROUTE · `;
    return {
      soft: cv.soft,
      tick(t){
        g.drawImage(bg, 0, 0, w, h);
        g.globalCompositeOperation = 'lighter';
        for (const [bx, dir] of [[w * .18, 1], [w * .82, -1]] as const){
          const a = t * 2.2 * dir, by = h * .085, gr = g.createConicGradient(a, bx, by);
          gr.addColorStop(0, 'rgba(255,40,30,.0)'); gr.addColorStop(.04, 'rgba(255,40,30,.32)'); gr.addColorStop(.1, 'rgba(255,40,30,0)');
          gr.addColorStop(.5, 'rgba(255,40,30,0)'); gr.addColorStop(.54, 'rgba(255,40,30,.32)'); gr.addColorStop(.6, 'rgba(255,40,30,0)'); gr.addColorStop(1, 'rgba(255,40,30,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, h);
          g.fillStyle = 'rgba(255,60,40,.9)'; g.beginPath(); g.arc(bx, by, 7, 0, TAU); g.fill();
        }
        const pulse = .5 + .5 * Math.sin(t * 3.1);
        const vg = g.createRadialGradient(vx, vy, h * .2, vx, vy, Math.max(w, h) * .7); vg.addColorStop(0, 'rgba(255,0,0,0)'); vg.addColorStop(1, `rgba(255,20,10,${(.12 + .12 * pulse).toFixed(3)})`);
        g.fillStyle = vg; g.fillRect(0, 0, w, h);
        g.globalCompositeOperation = 'source-over';
        const fs = Math.round(h * .05); g.font = `700 ${fs}px ${MONO}`; g.textAlign = 'center'; g.letterSpacing = `${Math.round(fs * .3)}px`;
        g.fillStyle = `rgba(255,70,55,${(.35 + .55 * (Math.sin(t * 3.1) > -.2 ? 1 : .2)).toFixed(2)})`; g.fillText('CONTAINMENT BREACH', vx, h * .3);
        g.letterSpacing = '0px'; g.textAlign = 'left'; g.font = `${Math.round(h * .022)}px ${MONO}`; g.fillStyle = 'rgba(255,120,100,.7)';
        const tw = g.measureText(ticker).width, off = (t * 70) % tw;
        for (let x = -off; x < w; x += tw) g.fillText(ticker, x, h * .91);
      },
    };
  },
} satisfies Scene;
