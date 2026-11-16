// Breach: containment breach console. A rotating warning beacon in the centre throws two light beams across the
// room, a hazard ring turns around it, the lockdown timer drains, and breached cells flash on the outer ring.
import { rng } from '../core/util.ts';
import { emblem, deck, sprite, halo, rails, callout, PRESET, TAU, MONO, pad2 } from './scp.ts';
import type { Scene, SceneRun } from './types.ts';

export default {
  id: 'breach', pack: 'scp', name: 'Naruszenie', accent: '#ff4630', hud: true, curved: true, preset: PRESET,
  swatch: 'radial-gradient(circle,#ff5a3c 0 14%,#4a0d08 15% 42%,#0c0303 70%)',
  mount({ el, seed }){
    const { g, w, h, cx, cy, R, A, dpr } = deck(el, { rgb: '255,70,48', left: 'SITE-19 · CONTAINMENT BREACH', right: 'LOCKDOWN · LEVEL 5', bg: ['#2c0b07', '#120504', '#060202'] });
    const r = rng(seed), K = R * .62;
    // hazard ring: yellow/black chevrons, pre-rendered and turned
    const HS = R * 2.1;
    const hazard = sprite(HS, dpr, b => {
      b.save(); b.beginPath(); b.arc(0, 0, R * .98, 0, TAU); b.arc(0, 0, R * .84, 0, TAU, true); b.clip();
      b.fillStyle = '#16100a'; b.fillRect(-R, -R, R * 2, R * 2);
      for (let i = 0; i < 48; i++){ b.save(); b.rotate(i * TAU / 48); b.fillStyle = 'rgba(255,178,40,.85)'; b.beginPath(); b.moveTo(R * .84, 0); b.lineTo(R, -R * .04); b.lineTo(R, R * .03); b.lineTo(R * .84, R * .07); b.fill(); b.restore(); }
      b.restore();
      b.strokeStyle = `rgba(${A},.7)`; b.lineWidth = 2; b.beginPath(); b.arc(0, 0, R, 0, TAU); b.stroke(); b.beginPath(); b.arc(0, 0, R * .82, 0, TAU); b.stroke();
    });
    // the beacon lens: red glass with the emblem cut in black
    const LS = K * 2.2;
    const lens = sprite(LS, dpr, b => {
      const gl = b.createRadialGradient(-K * .3, -K * .35, K * .05, 0, 0, K); gl.addColorStop(0, '#ffb39a'); gl.addColorStop(.35, '#ff3b22'); gl.addColorStop(.8, '#8a0e06'); gl.addColorStop(1, '#2a0402');
      b.fillStyle = gl; b.beginPath(); b.arc(0, 0, K, 0, TAU); b.fill();
      b.strokeStyle = 'rgba(0,0,0,.25)'; for (let i = -10; i <= 10; i++){ b.beginPath(); b.moveTo(i * K / 10, -K); b.lineTo(i * K / 10, K); b.stroke(); }
      emblem(b, 0, 0, K * .62, 'rgba(20,2,1,.82)', 'rgba(255,90,60,.5)');
      b.strokeStyle = '#3a0905'; b.lineWidth = K * .06; b.beginPath(); b.arc(0, 0, K, 0, TAU); b.stroke();
    });
    const cells = Array.from({ length: 5 }, (_, i) => ({ a: -2.4 + i * 1.2 + r() * .3, id: `SCP-${100 + Math.floor(r() * 7900)}`, st: ['ZBIEGŁ', 'NARUSZONA', 'NIEZNANE', 'ZBIEGŁ', 'ODCIĘTA'][i], ph: r() }));
    let T = 600 + Math.floor(r() * 1800);
    const run: SceneRun = { soft: false, geo: null, tick };
    function tick(t: number, dt: number){
      g.clearRect(0, 0, w, h);
      T -= dt; if (T < 0) T = 1800;
      // two opposite beams sweeping the room
      const ba = t * 1.6;
      g.globalCompositeOperation = 'lighter';
      for (const off of [0, Math.PI]){
        const a = ba + off, L = Math.hypot(w, h), gr = g.createRadialGradient(cx, cy, K * .5, cx, cy, L * .6);
        gr.addColorStop(0, 'rgba(255,60,30,.30)'); gr.addColorStop(.5, 'rgba(255,40,20,.07)'); gr.addColorStop(1, 'rgba(255,40,20,0)');
        g.fillStyle = gr; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, L, a - .26, a + .26); g.closePath(); g.fill();
      }
      g.globalCompositeOperation = 'source-over';
      const beat = Math.max(0, Math.cos(ba * 2));
      halo(g, cx, cy, K * .8, R * 1.45, A, .25 + beat * .2);
      g.save(); g.translate(cx, cy); g.rotate(-t * .08); g.drawImage(hazard, -HS / 2, -HS / 2, HS, HS); g.restore();
      // lockdown timer: segments drain around the inner ring
      const fr = T / 1800;
      for (let i = 0; i < 60; i++){ const a0 = -Math.PI / 2 + i * TAU / 60; g.strokeStyle = i / 60 < fr ? `rgba(${A},.85)` : `rgba(${A},.15)`; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, R * .74, a0 + .01, a0 + TAU / 60 - .02); g.stroke(); }
      g.lineWidth = 1;
      g.save(); g.translate(cx, cy); g.rotate(ba * .5); g.drawImage(lens, -LS / 2, -LS / 2, LS, LS); g.restore();
      // the lamp inside the lens: a hot spot turning with the beams
      const hx = cx + Math.cos(ba) * K * .25, hy = cy + Math.sin(ba) * K * .25, hot = g.createRadialGradient(hx, hy, 0, hx, hy, K * .7);
      hot.addColorStop(0, 'rgba(255,230,210,.55)'); hot.addColorStop(1, 'rgba(255,80,40,0)'); g.fillStyle = hot; g.beginPath(); g.arc(cx, cy, K, 0, TAU); g.fill();
      // breached cells on the outer ring
      for (const c of cells){
        const on = (t * .7 + c.ph) % 1 < .55, x = cx + Math.cos(c.a) * R * 1.12, y = cy + Math.sin(c.a) * R * 1.12;
        g.fillStyle = on ? '#ffd3c6' : `rgba(${A},.35)`; g.fillRect(x - 3, y - 3, 6, 6);
        g.strokeStyle = `rgba(${A},${on ? .9 : .3})`; g.strokeRect(x - 8, y - 8, 16, 16);
      }
      const c0 = cells[Math.floor(t / 6) % cells.length], x0 = cx + Math.cos(c0.a) * R * 1.12, y0 = cy + Math.sin(c0.a) * R * 1.12;
      callout(g, x0, y0, x0 + (x0 > cx ? R * .45 : -R * .45), y0 - R * .18, `${c0.id} · ${c0.st}`, A, false);
      run.geo = rails(g, cx, cy, R * 1.5, A);
      g.textAlign = 'center'; g.font = `600 ${Math.round(R * .085)}px ${MONO}`; g.fillStyle = `rgba(255,${120 + beat * 100},${90 + beat * 80},.95)`;
      g.letterSpacing = `${Math.round(R * .03)}px`; g.fillText('CONTAINMENT BREACH', cx, cy - R * 1.32); g.letterSpacing = '0px';
      g.font = `12px ${MONO}`; g.fillStyle = `rgba(${A},.7)`;
      g.fillText(`BLOKADA OŚRODKA · T-${pad2(Math.floor(T / 60))}:${pad2(Math.floor(T % 60))} · WSZYSCY NA STANOWISKA`, cx, cy - R * 1.2); g.textAlign = 'left';
    }
    return run;
  },
} satisfies Scene;
