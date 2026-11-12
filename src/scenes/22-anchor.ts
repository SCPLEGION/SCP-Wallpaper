// Anchor: a Scranton reality anchor. A gyroscope of three rings turns around a bright core; the space around it is a
// warped field of lines that the anchor pulls flat, so the ripples die out toward the centre. Hume level on the rails.
import { deck, view, halo, rails, PRESET, TAU, MONO } from './scp.ts';
import type { Scene, SceneRun } from './types.ts';

export default {
  id: 'anchor', name: 'Kotwica', accent: '#b48cff', hud: true, curved: true, preset: PRESET,
  swatch: 'radial-gradient(circle,#e0d0ff 0 6%,#3a2366 7% 30%,#0b0714 64%)',
  mount({ el }){
    const { g, w, h, cx, cy, R, A } = deck(el, { rgb: '180,140,255', left: 'SITE-19 · KOTWICA RZECZYWISTOŚCI SRA-3', right: 'POLE STABILNE', bg: ['#1d1233', '#0c0717', '#040208'] });
    const run: SceneRun = { soft: false, geo: null, tick };
    function tick(t: number){
      g.clearRect(0, 0, w, h);
      // the field: a floor grid seen from above, displaced by travelling waves that the anchor damps near the core
      const F = view(cx, cy, R * 1.25, t * .05, -1.05), amp = .16 + .06 * Math.sin(t * .3);
      const pt = (x: number, z: number) => { const d = Math.hypot(x, z), damp = Math.min(1, Math.max(0, (d - .35) / .8)), y = Math.sin(d * 7 - t * 2.2) * amp * damp * damp + Math.sin(x * 3 + t) * .04 * damp; return F(x, y, z); };
      for (let i = -12; i <= 12; i++) for (const ax of [0, 1]){
        g.beginPath();
        for (let j = 0; j <= 48; j++){ const u = -1.2 + j / 48 * 2.4, v = i / 10, p = ax ? pt(u, v) : pt(v, u); j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }
        g.strokeStyle = `rgba(${A},${.32 * (1 - Math.abs(i) / 13)})`; g.stroke();
      }
      halo(g, cx, cy, 0, R * .9, A, .5 + .1 * Math.sin(t * 3));
      // three gimbal rings on different axes; back halves first, then the core, then the fronts
      const rings = [[1, t * .5, .3], [.84, -t * .35 + 1, 1.25], [.68, t * .8 + 2, -.6]].map(([k, yaw, tilt]) => ({ k, P: view(cx, cy, R * .62 * k, yaw, tilt) }));
      const ring = (P: ReturnType<typeof view>, front: boolean, a: number) => {
        g.lineWidth = 3; let prev = P(1, 0, 0);
        for (let i = 1; i <= 72; i++){ const u = i / 72 * TAU, p = P(Math.cos(u), 0, Math.sin(u)); if ((p[2] >= 0) === front){ g.strokeStyle = `rgba(${A},${front ? a : a * .3})`; g.beginPath(); g.moveTo(prev[0], prev[1]); g.lineTo(p[0], p[1]); g.stroke(); } prev = p; }
        g.lineWidth = 1;
        for (let i = 0; i < 4; i++){ const u = i * TAU / 4, p = P(Math.cos(u), 0, Math.sin(u)); if ((p[2] >= 0) === front){ g.fillStyle = front ? '#efe6ff' : `rgba(${A},.4)`; g.fillRect(p[0] - 3, p[1] - 3, 6, 6); } }
      };
      for (const r of rings) ring(r.P, false, .9);
      const core = g.createRadialGradient(cx - R * .05, cy - R * .06, 0, cx, cy, R * .2); core.addColorStop(0, '#ffffff'); core.addColorStop(.3, '#d9c8ff'); core.addColorStop(1, 'rgba(120,80,220,0)');
      g.fillStyle = core; g.beginPath(); g.arc(cx, cy, R * .2, 0, TAU); g.fill();
      for (const r of rings) ring(r.P, true, .9);
      // Hume readout
      const hume = .97 + .02 * Math.sin(t * .4);
      g.strokeStyle = `rgba(${A},.25)`; g.beginPath(); g.arc(cx, cy, R * 1.02, Math.PI * .75, Math.PI * 2.25); g.stroke();
      g.lineWidth = 4; g.strokeStyle = `rgba(${A},.85)`; g.beginPath(); g.arc(cx, cy, R * 1.02, Math.PI * .75, Math.PI * (.75 + 1.5 * hume)); g.stroke(); g.lineWidth = 1;
      g.textAlign = 'center'; g.font = `600 ${Math.round(R * .1)}px ${MONO}`; g.fillStyle = `rgba(${A},.95)`; g.fillText(`${hume.toFixed(3)} Hm`, cx, cy - R * 1.3);
      g.font = `11px ${MONO}`; g.fillStyle = `rgba(${A},.55)`; g.fillText(`POZIOM HUME · FLUKTUACJA ${(amp * 4).toFixed(2)} · ZASIĘG 40 m`, cx, cy - R * 1.19); g.textAlign = 'left';
      run.geo = rails(g, cx, cy, R * 1.5, A);
    }
    return run;
  },
} satisfies Scene;
