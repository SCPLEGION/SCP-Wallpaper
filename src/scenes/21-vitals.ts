// Vitals: a biomonitor sweeping ECG, pleth and respiration traces for a test subject
import { rng, vnoise } from '../core/util.ts';
import { cvInit } from '../core/draw.ts';
import { layer, MONO } from './scp.ts';
import type { Scene } from './types.ts';

const bump = (p: number, at: number, wd: number) => Math.exp(-(((p - at) / wd) ** 2));
// one heartbeat, phase 0..1 → amplitude (P wave, QRS spike, T wave)
const ecg = (p: number) => .12 * bump(p, .16, .03) - .14 * bump(p, .36, .008) + 1 * bump(p, .39, .01)
  - .25 * bump(p, .42, .01) + .28 * bump(p, .65, .05);
const pleth = (p: number) => bump(p, .45, .12) * .9 + .3 * bump(p, .7, .06);

export default {
  id: 'vitals', name: 'Biomonitor', accent: '#3dff9a', hud: true, swatch: 'linear-gradient(#020604,#041a0e)',
  mount({ el, seed }){
    el.innerHTML = '<canvas></canvas>';
    const cv = cvInit(el, .8), { g, w, h } = cv, r = rng(seed);
    const subject = `D-${1000 + Math.floor(r() * 9000)}`, fs = Math.max(11, Math.round(h * .018));
    const left = w * .06, right = w * .72, tw = right - left;
    const traces = [
      { name: 'II', col: '61,255,154', y: h * .26, amp: h * .11, f: (t: number, hr: number) => ecg((t * hr / 60) % 1) },
      { name: 'PLETH', col: '90,200,255', y: h * .52, amp: h * .08, f: (t: number, hr: number) => pleth(((t - .2) * hr / 60) % 1) },
      { name: 'RESP', col: '255,214,90', y: h * .76, amp: h * .06, f: (t: number) => Math.sin(t * 1.7) * .5 + .5 },
    ];
    const bg = layer(cv, b => {
      b.fillStyle = '#020604'; b.fillRect(0, 0, w, h);
      b.strokeStyle = 'rgba(61,255,154,.05)'; b.lineWidth = 1;
      for (let x = left; x <= right; x += 25){ b.beginPath(); b.moveTo(x, h * .1); b.lineTo(x, h * .9); b.stroke(); }
      for (let y = h * .1; y <= h * .9; y += 25){ b.beginPath(); b.moveTo(left, y); b.lineTo(right, y); b.stroke(); }
      b.font = `${fs}px ${MONO}`; for (const tr of traces){ b.fillStyle = `rgba(${tr.col},.7)`; b.fillText(tr.name, left, tr.y - tr.amp - fs * .6); }
      b.fillStyle = 'rgba(200,255,220,.5)'; b.fillText(`OBIEKT ${subject} · TEST 07 · NADZÓR: DR ████`, left, h * .06);
    });
    const SPEED = tw / 6; // 6 s across the screen
    return {
      soft: cv.soft,
      tick(t){
        g.drawImage(bg, 0, 0, w, h);
        const hr = 68 + 22 * vnoise(t * .05, seed), spo2 = 96 + 3 * vnoise(t * .03, seed + 9), rr = 14 + 4 * vnoise(t * .04, seed + 4);
        const sweep = (t * SPEED) % tw;
        for (const tr of traces){
          g.strokeStyle = `rgba(${tr.col},.95)`; g.lineWidth = 2; g.beginPath(); let pen = false;
          for (let x = 0; x < tw; x += 2){
            const behind = (sweep - x + tw) % tw; if (behind < 14){ pen = false; continue; }
            const v = tr.f(t - behind / SPEED, hr), y = tr.y - v * tr.amp;
            if (!pen){ g.moveTo(left + x, y); pen = true; } else g.lineTo(left + x, y);
          }
          g.stroke();
          g.fillStyle = `rgba(${tr.col},1)`; g.beginPath(); g.arc(left + sweep, tr.y - tr.f(t, hr) * tr.amp, 3, 0, 6.283); g.fill();
        }
        const nx = w * .78; g.textAlign = 'left';
        const big = (label: string, val: string, unit: string, col: string, y: number) => {
          g.font = `${fs}px ${MONO}`; g.fillStyle = `rgba(${col},.7)`; g.fillText(label, nx, y - fs * 3.2);
          g.font = `600 ${fs * 3.6}px ${MONO}`; g.fillStyle = `rgba(${col},1)`; g.fillText(val, nx, y); const vw = g.measureText(val).width;
          g.font = `${fs}px ${MONO}`; g.fillStyle = `rgba(${col},.6)`; g.fillText(unit, nx + vw + 8, y);
        };
        big('HR', String(Math.round(hr)), 'bpm', '61,255,154', traces[0].y + fs);
        big('SpO₂', String(Math.round(spo2)), '%', '90,200,255', traces[1].y + fs);
        big('RESP', String(Math.round(rr)), '/min', '255,214,90', traces[2].y + fs);
        if (Math.abs((t * hr / 60) % 1 - .4) < .06){ g.fillStyle = 'rgba(61,255,154,.9)'; g.beginPath(); g.arc(nx - fs, traces[0].y - fs * .2, fs * .35, 0, 6.283); g.fill(); }
        g.font = `${fs}px ${MONO}`; g.fillStyle = 'rgba(61,255,154,.7)'; g.fillText('STATUS: STABILNY', nx, h * .9);
      },
    };
  },
} satisfies Scene;
