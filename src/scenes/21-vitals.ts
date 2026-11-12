// Vitals: a circular patient monitor for a D-class test subject. The ECG trace runs around the ring with a sweep head,
// SpO2 and respiration fill inner arcs, the heart rate sits in the middle and every beat throws a ring outward.
import { rng } from '../core/util.ts';
import { deck, halo, rails, PRESET, TAU, MONO } from './scp.ts';
import type { Scene, SceneRun } from './types.ts';

/** One heartbeat on u in [0,1): P wave, QRS spike, T wave. */
const bump = (u: number, c: number, s: number) => Math.exp(-(((u - c) / s) ** 2));
const ecg = (u: number) => .12 * bump(u, .18, .03) - .15 * bump(u, .30, .008) + 1 * bump(u, .32, .01) - .3 * bump(u, .345, .01) + .25 * bump(u, .55, .05);

export default {
  id: 'vitals', name: 'Biomonitor', accent: '#4dffa0', hud: true, curved: true, preset: PRESET,
  swatch: 'radial-gradient(circle,#4dffa0 0 6%,#0b2b1c 7% 36%,#030806 66%)',
  mount({ el, seed }){
    const { g, w, h, cx, cy, R, A } = deck(el, { rgb: '77,255,160', left: 'SITE-19 · TEST 87 · OBIEKT D-9756', right: 'NADZÓR MEDYCZNY', bg: ['#0b2419', '#06110c', '#020504'] });
    const r = rng(seed), N = 720, trace = new Float32Array(N);
    let bpm = 68 + r() * 10, ph = 0, head = 0, beat = -9, spo2 = 97, resp = 16;
    const run: SceneRun = { soft: false, geo: null, tick };
    function tick(t: number, dt: number){
      g.clearRect(0, 0, w, h);
      bpm += (70 + Math.sin(t * .05) * 8 + (r() - .5) * 2 - bpm) * dt * .3;
      // the sweep writes the trace; a gap ahead of the head erases the old one
      const step = dt * N / 6;
      for (let s = 0; s < step; s++){
        ph += bpm / 60 * 6 / N; if (ph >= 1){ ph -= 1; beat = t; }
        trace[Math.floor(head) % N] = ecg(ph) + (r() - .5) * .02; head = (head + 1) % N;
      }
      const flash = Math.max(0, 1 - (t - beat) * 3);
      halo(g, cx, cy, R * .2, R * 1.2, A, .14 + flash * .18);
      // beat ring travelling outward
      const k = (t - beat) * 1.2; if (k < 1){ g.strokeStyle = `rgba(${A},${(1 - k) * .5})`; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, R * (.45 + k * .5), 0, TAU); g.stroke(); g.lineWidth = 1; }
      // ECG ring: baseline + trace, brighter near the head
      const R0 = R * .98, amp = R * .2;
      g.strokeStyle = `rgba(${A},.12)`; g.beginPath(); g.arc(cx, cy, R0, 0, TAU); g.stroke();
      for (let i = 0; i < 60; i++){ const a = i * TAU / 60, L = i % 5 ? 4 : 9; g.strokeStyle = `rgba(${A},${i % 5 ? .15 : .35})`; g.beginPath(); g.moveTo(cx + Math.cos(a) * (R0 + amp + 6), cy + Math.sin(a) * (R0 + amp + 6)); g.lineTo(cx + Math.cos(a) * (R0 + amp + 6 + L), cy + Math.sin(a) * (R0 + amp + 6 + L)); g.stroke(); }
      g.lineWidth = 2;
      for (let seg = 0; seg < 12; seg++){
        g.beginPath(); let first = true;
        for (let j = 0; j <= N / 12; j++){
          const i = seg * N / 12 + j; if (i >= N) break;
          const age = (head - i + N) % N; if (age < 12){ first = true; continue; }
          const a = -Math.PI / 2 + i / N * TAU, rr = R0 + trace[i % N] * amp, x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
          first ? g.moveTo(x, y) : g.lineTo(x, y); first = false;
        }
        const age = ((head - seg * N / 12 - N / 24) + N) % N; g.strokeStyle = `rgba(${A},${.25 + .75 * (1 - age / N)})`; g.stroke();
      }
      g.lineWidth = 1;
      const ha = -Math.PI / 2 + head / N * TAU, hr = R0 + trace[(Math.floor(head) - 1 + N) % N] * amp;
      halo(g, cx + Math.cos(ha) * hr, cy + Math.sin(ha) * hr, 0, 14, '220,255,235', .9);
      // inner arcs: SpO2 and respiration
      spo2 += ((96 + Math.sin(t * .03) * 2) - spo2) * dt * .2; resp = 15 + Math.sin(t * .4) * 3;
      const arc = (rad: number, f: number, col: string, label: string, a0: number) => {
        g.lineWidth = 6; g.strokeStyle = 'rgba(255,255,255,.06)'; g.beginPath(); g.arc(cx, cy, rad, a0, a0 + Math.PI * .8); g.stroke();
        g.strokeStyle = col; g.beginPath(); g.arc(cx, cy, rad, a0, a0 + Math.PI * .8 * f); g.stroke(); g.lineWidth = 1;
        g.font = `10px ${MONO}`; g.fillStyle = col; g.fillText(label, cx + Math.cos(a0) * rad + 8, cy + Math.sin(a0) * rad + 4);
      };
      arc(R * .72, (spo2 - 85) / 15, 'rgba(110,200,255,.9)', `SpO₂ ${spo2.toFixed(0)}%`, Math.PI * .1);
      arc(R * .62, .5 + Math.sin(t * resp / 60 * TAU) * .45, 'rgba(255,214,110,.85)', `RESP ${resp.toFixed(0)}/min`, Math.PI * 1.1);
      g.textAlign = 'center'; g.fillStyle = `rgba(${A},${.85 + flash * .15})`; g.font = `300 ${Math.round(R * .38)}px ${MONO}`; g.fillText(bpm.toFixed(0), cx, cy + R * .1);
      g.font = `12px ${MONO}`; g.fillStyle = `rgba(${A},.6)`; g.fillText('HR · bpm', cx, cy + R * .24);
      g.fillStyle = `rgba(${A},.75)`; g.fillText(flash > .5 ? '♥' : '♡', cx, cy - R * .26);
      g.fillStyle = `rgba(${A},.55)`; g.font = `11px ${MONO}`; g.fillText('STATUS: STABILNY · EKSPOZYCJA 00:14:32 · ODCZYT CIĄGŁY', cx, cy - R * 1.4); g.textAlign = 'left';
      run.geo = rails(g, cx, cy, R * 1.5, A);
    }
    return run;
  },
} satisfies Scene;
