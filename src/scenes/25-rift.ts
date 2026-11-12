// Rift: a spatial anomaly held under observation. A dark core ringed by a bright photon ring, an accretion disc of
// matter spiralling in (seen almost edge-on, its far side bent up over the core), containment arcs and a width readout.
import { rng } from '../core/util.ts';
import { deck, view, halo, rails, PRESET, TAU, MONO } from './scp.ts';
import type { Scene, SceneRun } from './types.ts';

export default {
  id: 'rift', name: 'Anomalia', accent: '#ff4fd8', hud: true, curved: true, preset: PRESET,
  swatch: 'radial-gradient(circle,#000 0 14%,#ff7be3 15% 18%,#3a0d44 19% 40%,#07030a 70%)',
  mount({ el, seed }){
    const { g, w, h, cx, cy, R, A } = deck(el, { rgb: '255,79,216', left: 'SITE-19 · ANOMALIA PRZESTRZENNA', right: 'OBSERWACJA CIĄGŁA', bg: ['#22092a', '#0d0412', '#040106'] });
    const r = rng(seed), N = 2400;
    // particles on circular orbits; inner ones are hotter (whiter) and faster
    const parts = Array.from({ length: N }, () => { const k = r(), rr = .4 + k * k * 1.15; return { rr, a: r() * TAU, sp: .55 / rr ** 1.5, y: (r() - .5) * .025 * rr, s: 1 + r() * 2 }; });
    const col = (rr: number) => { const k = Math.min(1, (rr - .4) / 1.1); return `${255},${Math.round(225 - k * 160)},${Math.round(245 - k * 30)}`; };
    const K = R * 1.0, core = R * .28;
    const run: SceneRun = { soft: false, geo: null, tick };
    function tick(t: number, dt: number){
      g.clearRect(0, 0, w, h);
      const P = view(cx, cy, K, 0, -.2), wob = Math.sin(t * .7) * .02;
      halo(g, cx, cy, core, R * 1.4, A, .28);
      // containment arcs: four field emitters, slowly sweeping
      for (let i = 0; i < 4; i++){ const a = i * TAU / 4 + t * .1; g.strokeStyle = `rgba(${A},.35)`; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, R * 1.22, a, a + .9); g.stroke(); g.lineWidth = 1;
        const ex = cx + Math.cos(a) * R * 1.22, ey = cy + Math.sin(a) * R * 1.22; g.fillStyle = '#ffe3f8'; g.fillRect(ex - 3, ey - 3, 6, 6); }
      const draw = (back: boolean) => {
        for (const p of parts){
          if (back) p.a += p.sp * dt;
          const q = P(Math.cos(p.a) * p.rr, p.y + wob * p.rr, Math.sin(p.a) * p.rr); if ((q[2] < 0) !== back) continue;
          if (!back && Math.hypot(q[0] - cx, q[1] - cy) < core && q[2] < .1) continue;
          g.fillStyle = `rgba(${col(p.rr)},${back ? .4 : .7})`; g.fillRect(q[0] - p.s / 2, q[1] - p.s / 2, p.s, p.s * .7);
        }
      };
      g.globalCompositeOperation = 'lighter'; draw(true); g.globalCompositeOperation = 'source-over';
      // the far side of the disc, lensed up and over the core: a bright arc above it and a faint one below
      for (const [top, al] of [[true, .7], [false, .25]] as const){
        const lg = g.createRadialGradient(cx, cy, core, cx, cy, core * 2); lg.addColorStop(0, `rgba(255,236,250,${al})`); lg.addColorStop(.25, `rgba(${A},${al * .55})`); lg.addColorStop(1, `rgba(${A},0)`);
        g.save(); g.beginPath(); g.rect(cx - core * 2, top ? cy - core * 2 : cy, core * 4, core * 2); g.clip(); g.scale(1, .92); g.fillStyle = lg;
        g.beginPath(); g.arc(cx, cy / .92, core * 2, 0, TAU); g.fill(); g.restore();
      }
      g.lineWidth = 1;
      const ph = g.createRadialGradient(cx, cy, core * .92, cx, cy, core * 1.2); ph.addColorStop(0, 'rgba(255,240,252,.95)'); ph.addColorStop(.3, `rgba(${A},.5)`); ph.addColorStop(1, `rgba(${A},0)`);
      g.fillStyle = ph; g.beginPath(); g.arc(cx, cy, core * 1.2, 0, TAU); g.fill();
      g.fillStyle = '#000'; g.beginPath(); g.arc(cx, cy, core * .95, 0, TAU); g.fill();
      g.globalCompositeOperation = 'lighter'; draw(false); g.globalCompositeOperation = 'source-over';
      const wid = 10.2 + Math.sin(t * .13) * .8;
      g.textAlign = 'center'; g.font = `600 ${Math.round(R * .085)}px ${MONO}`; g.fillStyle = `rgba(${A},.95)`; g.fillText(`SZEROKOŚĆ ${wid.toFixed(2)} m`, cx, cy - R * 1.32);
      g.font = `11px ${MONO}`; g.fillStyle = `rgba(${A},.55)`; g.fillText(`ANOMALIA ${(seed % 900) + 100}-Ω · EMITERY 4/4 · ZABEZPIECZANIE W TOKU`, cx, cy - R * 1.2); g.textAlign = 'left';
      run.geo = rails(g, cx, cy, R * 1.5, A);
    }
    return run;
  },
} satisfies Scene;
