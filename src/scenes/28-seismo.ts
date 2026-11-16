// Seismo: anomaly activity monitor. Six channels scroll across the stage; now and then one of them bursts and the
// event is logged under the traces with a hex id and an object class.
import { deck, halo, PRESET, MONO, CLASSES, SITES, clock } from './scp.ts';
import { hexs } from '../core/draw.ts';
import { rng } from '../core/util.ts';
import type { Scene } from './types.ts';

export default {
  id: 'seismo', pack: 'scp', name: 'Sejsmograf', accent: '#ffcf4a', hud: true, preset: PRESET,
  swatch: 'linear-gradient(#140f02,#060402),repeating-linear-gradient(90deg,#ffcf4a33 0 2px,transparent 2px 12px)',
  mount({ el, seed }){
    const r = rng(seed), site = SITES[(r() * SITES.length) | 0];
    const { g, w, h, cx, cy, R, A } = deck(el, { rgb: '255,207,74', left: `${site} · MONITOR AKTYWNOŚCI ANOMALNEJ`, right: 'NASŁUCH CIĄGŁY', bg: ['#2a1f05', '#110c02', '#050301'] });
    const N = 6, cols = 220, ch = Array.from({ length: N }, () => new Float32Array(cols)), burst = new Float32Array(N);
    const names = Array.from({ length: N }, (_, i) => `CH-${i + 1} · ${['SEJSMO', 'EM', 'GRAW', 'HUME', 'AKUST', 'TERM'][i]}`);
    const log: string[] = [];
    let acc = 0;
    return {
      soft: false,
      tick(t, dt){
        g.clearRect(0, 0, w, h);
        const x0 = cx - R * 1.45, x1 = cx + R * 1.45, top = cy - R * 1.05, rowH = R * 1.55 / N;
        acc += dt;
        while (acc > 1 / 30){ // one sample per channel every 1/30 s
          acc -= 1 / 30;
          for (let i = 0; i < N; i++){
            if (burst[i] > 0) burst[i] -= 1 / 30;
            else if (r() < .0016){ burst[i] = .8 + r() * 1.6; log.unshift(`${clock()}  ${names[i].split(' · ')[1].padEnd(6)} 0x${hexs(r, 2).replace(' ', '')}  ${CLASSES[(r() * 3) | 0]}`); log.length = Math.min(log.length, 4); }
            const noise = (r() - .5) * .12 + Math.sin(t * (1.3 + i * .4) + i) * .05, spike = burst[i] > 0 ? (r() - .5) * 1.7 * Math.min(1, burst[i]) : 0;
            ch[i].copyWithin(0, 1); ch[i][cols - 1] = noise + spike;
          }
        }
        halo(g, cx, cy, 0, R * 1.6, A, .12);
        g.lineWidth = 1;
        for (let i = 0; i < N; i++){
          const y = top + rowH * (i + .5), hot = burst[i] > 0;
          g.strokeStyle = `rgba(${A},.12)`; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
          g.font = `10px ${MONO}`; g.fillStyle = `rgba(${A},${hot ? .95 : .5})`; g.fillText(names[i], x0, y - rowH * .32);
          if (hot){ g.fillStyle = 'rgba(255,80,60,.9)'; g.fillText('● ZDARZENIE', x1 - 80, y - rowH * .32); }
          g.strokeStyle = hot ? 'rgba(255,120,80,.95)' : `rgba(${A},.85)`; g.lineWidth = hot ? 1.6 : 1.1; g.beginPath();
          for (let k = 0; k < cols; k++){ const x = x0 + (x1 - x0) * k / (cols - 1), v = y - ch[i][k] * rowH * .42; k ? g.lineTo(x, v) : g.moveTo(x, v); }
          g.stroke(); g.lineWidth = 1;
        }
        // time ticks and the event log under the traces
        g.fillStyle = `rgba(${A},.35)`; for (let k = 0; k <= 10; k++) g.fillRect(x0 + (x1 - x0) * k / 10, top + rowH * N + 4, 1, 6);
        g.font = `11px ${MONO}`;
        log.forEach((l, i) => { g.fillStyle = `rgba(${A},${.85 - i * .18})`; g.fillText(l, x0, top + rowH * N + 30 + i * 16); });
        if (!log.length){ g.fillStyle = `rgba(${A},.45)`; g.fillText('BRAK ZDARZEŃ · WSZYSTKIE KANAŁY W NORMIE', x0, top + rowH * N + 30); }
      },
    };
  },
} satisfies Scene;
