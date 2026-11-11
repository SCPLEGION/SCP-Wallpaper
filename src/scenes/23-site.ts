// Site map: a facility plan with zones, corridors, patrols moving between junctions, a sector going to alert
import { rng, hash1 } from '../core/util.ts';
import { cvInit } from '../core/draw.ts';
import { layer, TAU, MONO, SITES } from './scp.ts';
import type { Scene } from './types.ts';

export default {
  id: 'site', name: 'Ośrodek', accent: '#3fe0c5', swatch: 'linear-gradient(135deg,#06201c 0 50%,#0a2e28 50%)',
  mount({ el, seed }){
    el.innerHTML = '<canvas></canvas>';
    const cv = cvInit(el, .8), { g, w, h } = cv, r = rng(seed), T = '63,224,197', fs = Math.max(10, Math.round(h * .015));
    const C = 9, R = 5, mx = w * .1, my = h * .14, sx = (w - mx * 2) / (C - 1), sy = (h - my * 1.6) / (R - 1);
    const node = (i: number, j: number) => [mx + i * sx, my + j * sy];
    const zones = [{ name: 'STREFA LEKKIEGO PRZECHOWYWANIA', c0: 0, c1: 3 }, { name: 'STREFA CIĘŻKIEGO PRZECHOWYWANIA', c0: 3, c1: 6 }, { name: 'STREFA WEJŚCIOWA', c0: 6, c1: 8 }];
    // corridors: a random spanning set of grid edges plus a few loops
    const edges: [number, number, number, number][] = [];
    for (let i = 0; i < C; i++) for (let j = 0; j < R; j++){ if (i < C - 1 && r() < .75) edges.push([i, j, i + 1, j]); if (j < R - 1 && r() < .6) edges.push([i, j, i, j + 1]); }
    const adj = new Map<string, [number, number][]>(); const k = (i: number, j: number) => i + ',' + j;
    for (const [a, b, c, d] of edges){ (adj.get(k(a, b)) || adj.set(k(a, b), []).get(k(a, b))!).push([c, d]); (adj.get(k(c, d)) || adj.set(k(c, d), []).get(k(c, d))!).push([a, b]); }
    const rooms = Array.from({ length: 14 }, () => ({ i: Math.floor(r() * (C - 1)), j: Math.floor(r() * (R - 1)), id: 100 + Math.floor(r() * 900) }));
    const bg = layer(cv, b => {
      b.fillStyle = '#041512'; b.fillRect(0, 0, w, h);
      zones.forEach((z, n) => { const [x0] = node(z.c0, 0), [x1] = node(z.c1, 0); b.fillStyle = `rgba(${T},${.03 + n * .015})`; b.fillRect(x0 - sx * .45, my - sy * .45, x1 - x0 + sx * .9, sy * (R - 1) + sy * .9);
        b.font = `${fs}px ${MONO}`; b.fillStyle = `rgba(${T},.55)`; b.fillText(z.name, x0 - sx * .4, my - sy * .5 - 6); });
      b.strokeStyle = `rgba(${T},.35)`; b.lineWidth = 6; b.lineCap = 'square';
      for (const [a, c, d, e] of edges){ const [x0, y0] = node(a, c), [x1, y1] = node(d, e); b.beginPath(); b.moveTo(x0, y0); b.lineTo(x1, y1); b.stroke(); }
      b.strokeStyle = '#041512'; b.lineWidth = 3; for (const [a, c, d, e] of edges){ const [x0, y0] = node(a, c), [x1, y1] = node(d, e); b.beginPath(); b.moveTo(x0, y0); b.lineTo(x1, y1); b.stroke(); }
      for (const rm of rooms){ const [x, y] = node(rm.i, rm.j); b.strokeStyle = `rgba(${T},.6)`; b.lineWidth = 1.5; b.strokeRect(x + sx * .2, y + sy * .2, sx * .6, sy * .55); b.font = `${fs}px ${MONO}`; b.fillStyle = `rgba(${T},.6)`; b.fillText('C-' + rm.id, x + sx * .24, y + sy * .2 + fs * 1.3); }
      b.font = `700 ${fs * 1.5}px ${MONO}`; b.fillStyle = `rgba(${T},.85)`; b.fillText(`${SITES[seed % SITES.length]} · PLAN POZIOMU -2`, mx - sx * .45, h - my * .35);
    });
    const patrols = Array.from({ length: 7 }, () => { const i = Math.floor(r() * C), j = Math.floor(r() * R); return { a: [i, j], b: [i, j], p: 1, v: .25 + r() * .25 }; });
    return {
      soft: cv.soft,
      tick(t, dt){
        g.drawImage(bg, 0, 0, w, h);
        const al = Math.floor(t / 20), room = rooms[Math.floor(hash1(al, seed) * rooms.length)];
        if (t % 20 < 8){ const [x, y] = node(room.i, room.j); g.fillStyle = `rgba(255,170,40,${(.15 + .15 * Math.sin(t * 6)).toFixed(3)})`; g.fillRect(x + sx * .2, y + sy * .2, sx * .6, sy * .55);
          g.font = `${fs}px ${MONO}`; g.fillStyle = 'rgba(255,190,80,.95)'; g.fillText('ALARM C-' + room.id, x + sx * .24, y + sy * .75 - 4); }
        for (const p of patrols){
          p.p += p.v * dt;
          if (p.p >= 1){ p.a = p.b; const nb = adj.get(k(p.a[0], p.a[1])) || [[p.a[0], p.a[1]]]; p.b = nb[Math.floor(r() * nb.length)]; p.p = 0; }
          const [x0, y0] = node(p.a[0], p.a[1]), [x1, y1] = node(p.b[0], p.b[1]), x = x0 + (x1 - x0) * p.p, y = y0 + (y1 - y0) * p.p;
          g.fillStyle = `rgba(${T},.25)`; g.beginPath(); g.arc(x, y, 9, 0, TAU); g.fill(); g.fillStyle = `rgba(${T},1)`; g.beginPath(); g.arc(x, y, 3.5, 0, TAU); g.fill();
        }
        g.font = `${fs}px ${MONO}`; g.fillStyle = `rgba(${T},.6)`; g.textAlign = 'right'; g.fillText(`PATROLE ${patrols.length} · DRZWI ZABEZPIECZONE ${edges.length - 3}/${edges.length}`, w - mx * .5, h - my * .35); g.textAlign = 'left';
      },
    };
  },
} satisfies Scene;
