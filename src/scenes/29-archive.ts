// Archive: a carousel of object files turning slowly; the one in front is pulled for review with its class and
// clearance, while a scan line sweeps it.
import { deck, view, halo, callout, PRESET, MONO, CLASSES, TAU } from './scp.ts';
import { rng } from '../core/util.ts';
import type { Scene } from './types.ts';

const CLS_RGB: Record<string, string> = { SAFE: '120,220,140', EUCLID: '255,200,80', KETER: '255,90,70', THAUMIEL: '190,150,255' };

export default {
  id: 'archive', pack: 'scp', name: 'Archiwum', accent: '#9fd0ff', hud: true, preset: PRESET,
  swatch: 'radial-gradient(circle,#9fd0ff44 0 20%,#0a1420 60%),linear-gradient(#0a1420,#03070c)',
  mount({ el, seed }){
    const r = rng(seed);
    const { g, w, h, cx, cy, R, A } = deck(el, { rgb: '159,208,255', left: 'ARCHIWUM CENTRALNE · REJESTR OBIEKTÓW', right: 'DOSTĘP: POZIOM 3', bg: ['#10223a', '#07101c', '#020509'] });
    const N = 14, files = Array.from({ length: N }, () => ({ no: String(100 + ((r() * 7800) | 0)).padStart(4, '0'), cls: CLASSES[(r() * 4) | 0], lvl: 1 + ((r() * 4) | 0) }));
    return {
      soft: false,
      tick(t){
        g.clearRect(0, 0, w, h);
        halo(g, cx, cy, 0, R * 1.3, A, .18);
        const yaw = t * .12, P = view(cx, cy + R * .1, R * 1.25, yaw, -.28);
        // back to front: sort by depth
        const items = files.map((f, i) => { const u = i / N * TAU, p = P(Math.cos(u), 0, Math.sin(u)); return { f, p }; }).sort((a, b) => a.p[2] - b.p[2]);
        g.strokeStyle = `rgba(${A},.18)`; g.beginPath();
        for (let i = 0; i <= 72; i++){ const u = i / 72 * TAU, p = P(Math.cos(u), .32, Math.sin(u)); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } g.stroke();
        let front = items[items.length - 1];
        for (const it of items){
          const [x, y, d] = it.p, k = .55 + .45 * (d + 1) / 2, fw = R * .34 * k, fh = R * .44 * k, c = CLS_RGB[it.f.cls], a = .25 + .7 * (d + 1) / 2;
          g.fillStyle = `rgba(8,16,28,${(.6 + .35 * a).toFixed(2)})`; g.fillRect(x - fw / 2, y - fh / 2, fw, fh);
          g.strokeStyle = `rgba(${A},${(a * .7).toFixed(2)})`; g.strokeRect(x - fw / 2, y - fh / 2, fw, fh);
          g.fillStyle = `rgba(${c},${a.toFixed(2)})`; g.fillRect(x - fw / 2, y - fh / 2 - fh * .08, fw * .45, fh * .08);   // folder tab in class colour
          g.font = `600 ${Math.round(11 * k)}px ${MONO}`; g.textAlign = 'center'; g.fillStyle = `rgba(230,240,255,${a.toFixed(2)})`;
          g.fillText(`SCP-${it.f.no}`, x, y - fh * .12);
          g.font = `${Math.round(9 * k)}px ${MONO}`; g.fillStyle = `rgba(${c},${a.toFixed(2)})`; g.fillText(it.f.cls, x, y + fh * .08);
          for (let l = 0; l < 3; l++){ g.fillStyle = `rgba(${A},${(a * .25).toFixed(2)})`; g.fillRect(x - fw * .35, y + fh * (.2 + l * .07), fw * (.7 - l * .15), 2); }
          g.textAlign = 'left';
        }
        // the pulled file: scan line + callout
        const [fx, fy] = front.p, fh = R * .44, sy = fy - fh / 2 + ((t * .6) % 1) * fh;
        g.fillStyle = `rgba(${A},.5)`; g.fillRect(fx - R * .2, sy, R * .4, 1.5);
        g.fillStyle = `rgba(${A},.08)`; g.fillRect(fx - R * .2, fy - fh / 2, R * .4, sy - fy + fh / 2);
        callout(g, fx + R * .18, fy - fh * .3, cx + R * 1.05, cy - R * .85, `SCP-${front.f.no} · ${front.f.cls} · POZIOM ${front.f.lvl}`, A);
        g.font = `10px ${MONO}`; g.fillStyle = `rgba(${A},.5)`; g.textAlign = 'center';
        g.fillText(`${N} TECZEK W OBIEGU · OSTATNIA ODPRAWA ${new Date().toLocaleDateString('pl-PL')}`, cx, cy + R * 1.05); g.textAlign = 'left';
      },
    };
  },
} satisfies Scene;
