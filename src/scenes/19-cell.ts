// Cell: a containment chamber as a turning 3D wireframe; thick walls, a floor grid, the entity drifting inside as
// a glowing particle cloud, corner sensors locking onto it, and a readout hung off the nearest sensor.
import { rng } from '../core/util.ts';
import { deck, view, halo, rails, callout, PRESET, TAU, MONO, CLASSES } from './scp.ts';
import type { Scene, SceneRun } from './types.ts';

type V3 = [number, number, number];
const CUBE: V3[] = [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1], [-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1]];
const EDGES = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];

export default {
  id: 'cell', pack: 'scp', name: 'Komora', accent: '#5ec8ff', hud: true, curved: true, preset: PRESET,
  swatch: 'radial-gradient(circle,#8fdcff 0 8%,#0e2a3d 9% 40%,#03080c 70%)',
  mount({ el, seed }){
    const { g, w, h, cx, cy, R, A } = deck(el, { rgb: '94,200,255', left: 'SITE-19 · KOMORA 03 · STREFA KETER', right: 'IZOLACJA AKTYWNA', bg: ['#0c2231', '#06111a', '#020508'] });
    const r = rng(seed), id = `SCP-${1000 + Math.floor(r() * 7000)}`, cls = CLASSES[1 + Math.floor(r() * 2)];
    const cloud = Array.from({ length: 260 }, () => { const u = r() * TAU, v = Math.acos(2 * r() - 1), k = Math.cbrt(r()); return { x: Math.sin(v) * Math.cos(u) * k, y: Math.cos(v) * k, z: Math.sin(v) * Math.sin(u) * k, ph: r() * TAU }; });
    const run: SceneRun = { soft: false, geo: null, tick };
    function tick(t: number){
      g.clearRect(0, 0, w, h);
      const S = R * .46, P = view(cx, cy + R * .08, S, t * .12, -.42);
      // floor grid, fading out from the cell
      for (let i = -8; i <= 8; i++) for (const ax of [0, 1]){
        const a = ax ? P(i * .25, 1, -2) : P(-2, 1, i * .25), b = ax ? P(i * .25, 1, 2) : P(2, 1, i * .25), al = .14 * (1 - Math.abs(i) / 9);
        const gr = g.createLinearGradient(a[0], a[1], b[0], b[1]); gr.addColorStop(0, `rgba(${A},0)`); gr.addColorStop(.5, `rgba(${A},${al})`); gr.addColorStop(1, `rgba(${A},0)`);
        g.strokeStyle = gr; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      }
      // entity: drifts inside, pulses
      const ex = Math.sin(t * .37) * .35, ey = Math.sin(t * .23) * .2, ez = Math.cos(t * .29) * .35, E = P(ex, ey, ez), pr = .32 + .05 * Math.sin(t * 2.1);
      const box = (k: number, al: number, back: boolean) => {
        const pts = CUBE.map(v => P(v[0] * k, v[1] * k, v[2] * k));
        for (const [a, b] of EDGES){ const p = pts[a], q = pts[b], z = (p[2] + q[2]) / 2; if ((z < 0) !== back) continue; g.strokeStyle = `rgba(${A},${back ? al * .45 : al})`; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); }
        return pts;
      };
      box(1.18, .25, true); const inner = box(1, .7, true);
      halo(g, E[0], E[1], 0, S * 1.1, A, .35);
      g.fillStyle = '#e8f8ff';
      for (const c of cloud){
        const wob = Math.sin(t * 1.7 + c.ph) * .08, q = P(ex + (c.x + wob) * pr, ey + c.y * pr, ez + (c.z - wob) * pr);
        const s = 1.2 + (q[2] + 1) * 1.2; g.globalAlpha = .25 + (q[2] + 1) * .3; g.fillRect(q[0] - s / 2, q[1] - s / 2, s, s);
      }
      g.globalAlpha = 1;
      // sensor beams from the four top corners
      [4, 5, 6, 7].forEach((k, i) => { const p = inner[k], on = (t * .5 + i * .25) % 1 < .7; g.strokeStyle = `rgba(${A},${on ? .5 : .12})`; g.setLineDash([3, 5]); g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(E[0], E[1]); g.stroke(); g.setLineDash([]); g.fillStyle = on ? '#dff6ff' : `rgba(${A},.5)`; g.fillRect(p[0] - 3, p[1] - 3, 6, 6); });
      box(1, .85, false); box(1.18, .35, false);
      // reticle on the entity
      g.strokeStyle = `rgba(${A},.9)`; g.save(); g.translate(E[0], E[1]); g.rotate(t * .6);
      for (let i = 0; i < 4; i++){ g.rotate(TAU / 4); g.beginPath(); g.arc(0, 0, S * .42, -.3, .3); g.stroke(); }
      g.restore();
      const side = 1;   // always right: the left column is taller and would cover it
      callout(g, E[0], E[1], cx + side * R * 1.08, cy - R * .02, `${id} · ${cls}`, A);
      g.font = `11px ${MONO}`; g.fillStyle = `rgba(${A},.6)`; g.textAlign = side > 0 ? 'left' : 'right';
      const lx = cx + side * R * 1.08 + side * 8;
      [`POZ ${(ex * 3).toFixed(2)} / ${(ez * 3).toFixed(2)} m`, `TEMP ${(-12 + Math.sin(t * .2) * 3).toFixed(1)} °C`, `CZUJNIKI 4/4 · ŚLUZA ZAMKNIĘTA`].forEach((s, i) => g.fillText(s, lx, cy - R * .02 + 14 + i * 15));
      g.textAlign = 'left';
      run.geo = rails(g, cx, cy, R * 1.5, A);
    }
    return run;
  },
} satisfies Scene;
