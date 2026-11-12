// Site: the facility floor plan as a slowly turning 3D model. Rooms are low blocks on a grid, patrols walk the
// corridors, and one cell goes into alarm: its block glows red and throws a beacon column up.
import { rng } from '../core/util.ts';
import { deck, view, halo, rails, callout, PRESET, TAU, MONO } from './scp.ts';
import type { Scene, SceneRun } from './types.ts';

interface Room { x: number; z: number; w: number; d: number; id: string; h: number }

export default {
  id: 'site', name: 'Ośrodek', accent: '#36e0b8', hud: true, curved: true, preset: PRESET,
  swatch: 'linear-gradient(135deg,#0a2a24 0 30%,#36e0b8 30% 33%,#071512 33%)',
  mount({ el, seed }){
    const { g, w, h, cx, cy, R, A } = deck(el, { rgb: '54,224,184', left: 'SITE-64 · PLAN POZIOMU -2', right: 'PATROLE AKTYWNE', bg: ['#0a2520', '#05110e', '#020605'] });
    const r = rng(seed);
    // two rows of cells either side of a cross of corridors
    const rooms: Room[] = [];
    for (const qx of [-1, 1]) for (const qz of [-1, 1]) for (let i = 0; i < 3; i++){
      const ww = .18 + r() * .1, dd = .16 + r() * .12;
      rooms.push({ x: qx * (.16 + i * .29) + (qx < 0 ? -ww : 0), z: qz < 0 ? -.16 - dd - r() * .25 : .16 + r() * .25, w: ww, d: dd, id: `C-${100 + Math.floor(r() * 800)}`, h: .05 + r() * .07 });
    }
    rooms.push({ x: -.13, z: -.13, w: .26, d: .26, id: 'KONTROLA', h: .14 });
    const paths = [[[-1, 0], [1, 0]], [[0, -1], [0, 1]], [[-.9, -.8], [-.9, .8]], [[.9, -.8], [.9, .8]]];
    const guards = Array.from({ length: 6 }, (_, i) => ({ p: i % paths.length, u: r(), v: (.04 + r() * .05) * (r() < .5 ? -1 : 1) }));
    let alarm = Math.floor(r() * 12), since = 0;
    const run: SceneRun = { soft: false, geo: null, tick };
    function tick(t: number, dt: number){
      g.clearRect(0, 0, w, h);
      since += dt; if (since > 12){ since = 0; alarm = (alarm + 5) % 12; }
      const P = view(cx, cy + R * .08, R * .95, t * .06 + .4, -1.0);
      halo(g, cx, cy, R * .3, R * 1.3, A, .12);
      // base plate and grid
      g.fillStyle = 'rgba(54,224,184,.035)'; g.beginPath(); for (let i = 0; i <= 4; i++){ const [x, z] = [[-1.1, -1.1], [1.1, -1.1], [1.1, 1.1], [-1.1, 1.1], [-1.1, -1.1]][i], p = P(x, 0, z); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } g.fill();
      g.strokeStyle = `rgba(${A},.07)`;
      for (let i = -11; i <= 11; i++){ for (const ax of [0, 1]){ const a = ax ? P(i / 10, 0, -1.1) : P(-1.1, 0, i / 10), b = ax ? P(i / 10, 0, 1.1) : P(1.1, 0, i / 10); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); } }
      g.strokeStyle = `rgba(${A},.5)`; g.lineWidth = 2;
      for (const [[x0, z0], [x1, z1]] of paths){ const a = P(x0, 0, z0), b = P(x1, 0, z1); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
      g.lineWidth = 1;
      // rooms back to front
      const order = rooms.map((m, i) => ({ m, i, z: P(m.x + m.w / 2, 0, m.z + m.d / 2)[2] })).sort((a, b) => a.z - b.z);
      let hot: [number, number, Room] | null = null;
      for (const { m, i } of order){
        const on = i === alarm, pulse = on ? .5 + .5 * Math.sin(t * 6) : 0, H = -m.h * (on ? 1 + pulse * .3 : 1);
        const c = [[m.x, m.z], [m.x + m.w, m.z], [m.x + m.w, m.z + m.d], [m.x, m.z + m.d]], top = c.map(([x, z]) => P(x, H, z)), bot = c.map(([x, z]) => P(x, 0, z));
        const col = on ? '255,70,60' : A;
        for (let k = 0; k < 4; k++){ const a = k, b = (k + 1) % 4; g.fillStyle = `rgba(${col},${on ? .18 + pulse * .15 : .07})`; g.beginPath(); g.moveTo(bot[a][0], bot[a][1]); g.lineTo(bot[b][0], bot[b][1]); g.lineTo(top[b][0], top[b][1]); g.lineTo(top[a][0], top[a][1]); g.fill(); }
        g.fillStyle = `rgba(${col},${on ? .35 + pulse * .25 : .16})`; g.beginPath(); top.forEach((p, k) => k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
        g.strokeStyle = `rgba(${col},${on ? .95 : .6})`; g.stroke();
        for (let k = 0; k < 4; k++){ g.beginPath(); g.moveTo(bot[k][0], bot[k][1]); g.lineTo(top[k][0], top[k][1]); g.stroke(); }
        const mc = P(m.x + m.w / 2, H, m.z + m.d / 2);
        if (on){ const gr = g.createLinearGradient(0, mc[1], 0, mc[1] - R * .8); gr.addColorStop(0, 'rgba(255,70,60,.45)'); gr.addColorStop(1, 'rgba(255,70,60,0)'); g.fillStyle = gr; g.fillRect(mc[0] - 6, mc[1] - R * .8, 12, R * .8); hot = [mc[0], mc[1], m]; }
        else if (mc[2] > -.3){ g.font = `10px ${MONO}`; g.fillStyle = `rgba(${A},.75)`; g.textAlign = 'center'; g.fillText(m.id, mc[0], mc[1] + 3); g.textAlign = 'left'; }
      }
      // patrols
      for (const q of guards){
        q.u = (q.u + q.v * dt + 1) % 1; const [[x0, z0], [x1, z1]] = paths[q.p], p = P(x0 + (x1 - x0) * q.u, -.015, z0 + (z1 - z0) * q.u);
        halo(g, p[0], p[1], 0, 10, '200,255,240', .6); g.fillStyle = '#e6fff8'; g.fillRect(p[0] - 2, p[1] - 2, 4, 4);
      }
      if (hot){ const [x, y, m] = hot; callout(g, x, y, cx + R * 1.08, cy - R * .02, `ALARM · ${m.id} · ${Math.floor(since)} s`, '255,90,70'); }
      g.textAlign = 'center'; g.font = `11px ${MONO}`; g.fillStyle = `rgba(${A},.55)`;
      g.fillText(`STREFA LEKKA · STREFA CIĘŻKA · STREFA WEJŚCIOWA · PATROLE ${guards.length} · DRZWI ${40 + (seed % 9)}/48`, cx, cy - R * 1.3); g.textAlign = 'left';
      run.geo = rails(g, cx, cy, R * 1.5, A);
    }
    return run;
  },
} satisfies Scene;
