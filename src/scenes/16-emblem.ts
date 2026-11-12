// Emblem: the Foundation emblem as a slowly turning metal coin at the centre of the Overwatch console; a graduated
// ring carries the motto, the O5 council circles on a tilted orbit, and a light sweep runs across the face.
import { emblem, deck, sprite, view, halo, rails, PRESET, TAU, MONO } from './scp.ts';
import type { Scene, SceneRun } from './types.ts';

export default {
  id: 'emblem', name: 'Emblemat', accent: '#cfd6df', hud: true, curved: true, preset: PRESET,
  swatch: 'radial-gradient(circle,#e8ecf0 0 12%,#2a2f37 13% 40%,#07080a 70%)',
  mount({ el }){
    const { g, w, h, cx, cy, R, A, dpr } = deck(el, { rgb: '207,214,223', left: 'SCP FOUNDATION · OVERWATCH COMMAND', right: 'SECURE · CONTAIN · PROTECT', bg: ['#1f242c', '#0c0e12', '#050607'] });
    const K = R * .8, S = K * 2.3;   // coin radius K
    // The coin's two sides: brushed disc + raised emblem (front), darker engraved emblem (back).
    const side = (front: boolean) => sprite(S, dpr, b => {
      const disc = b.createRadialGradient(-K * .35, -K * .4, K * .05, 0, 0, K); disc.addColorStop(0, front ? '#4a515c' : '#2a2e35'); disc.addColorStop(.7, front ? '#1d2127' : '#121418'); disc.addColorStop(1, '#0a0b0e');
      b.fillStyle = disc; b.beginPath(); b.arc(0, 0, K, 0, TAU); b.fill();
      b.strokeStyle = 'rgba(255,255,255,.05)'; for (let r = K * .2; r < R; r += 3){ b.beginPath(); b.arc(0, 0, r, 0, TAU); b.stroke(); }
      b.lineWidth = K * .035; b.strokeStyle = front ? '#aeb6c1' : '#6c737d'; b.beginPath(); b.arc(0, 0, K * .985, 0, TAU); b.stroke();
      b.shadowColor = front ? 'rgba(230,236,242,.55)' : 'rgba(0,0,0,0)'; b.shadowBlur = K * .12;
      emblem(b, 0, 0, K * .62, front ? '#eef1f4' : '#7d848e', front ? '#1a1d22' : '#121418');
      b.shadowBlur = 0; b.font = `600 ${Math.round(K * .055)}px ${MONO}`; b.textAlign = 'center'; b.fillStyle = front ? 'rgba(230,235,240,.55)' : 'rgba(150,158,168,.6)';
      b.fillText(front ? 'THE FOUNDATION' : 'O5 COUNCIL · CLEARANCE 5', 0, K * .9);
    });
    const faceF = side(true), faceB = side(false);
    // Graduated ring with the motto set around it, turned as one sprite.
    const RS = R * 2.6;
    const ring = sprite(RS, dpr, b => {
      for (let i = 0; i < 180; i++){ const a = i * TAU / 180, L = i % 15 ? 5 : 14, c = Math.cos(a), s = Math.sin(a); b.strokeStyle = `rgba(${A},${i % 15 ? .22 : .55})`; b.beginPath(); b.moveTo(c * R * 1.05, s * R * 1.05); b.lineTo(c * (R * 1.05 + L), s * (R * 1.05 + L)); b.stroke(); }
      b.strokeStyle = `rgba(${A},.18)`; b.beginPath(); b.arc(0, 0, R * 1.02, 0, TAU); b.stroke();
      b.font = `${Math.round(R * .06)}px ${MONO}`; b.fillStyle = `rgba(${A},.6)`; b.textAlign = 'center';
      const txt = 'SECURE · CONTAIN · PROTECT · '.repeat(3), step = TAU / txt.length;
      for (let i = 0; i < txt.length; i++){ b.save(); b.rotate(i * step); b.fillText(txt[i], 0, -R * 1.18); b.restore(); }
    });
    const nodes = ['O5-1', 'O5-4', 'O5-7', 'O5-9', 'O5-11'];
    const run: SceneRun = { soft: false, geo: null, tick };
    function tick(t: number){
      g.clearRect(0, 0, w, h);
      halo(g, cx, cy, K * .9, R * 1.4, A, .22 + .06 * Math.sin(t * .8));
      g.save(); g.translate(cx, cy); g.rotate(t * .03); g.drawImage(ring, -RS / 2, -RS / 2, RS, RS); g.restore();
      g.strokeStyle = `rgba(${A},.35)`; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, R * .95, -t * .25, -t * .25 + .7); g.stroke();
      g.beginPath(); g.arc(cx, cy, R * .95, -t * .25 + Math.PI, -t * .25 + Math.PI + .7); g.stroke(); g.lineWidth = 1;
      g.setLineDash([2, 10]); g.strokeStyle = `rgba(${A},.25)`; g.beginPath(); g.arc(cx, cy, R * .91, 0, TAU); g.stroke(); g.setLineDash([]);
      // council orbit: back half, coin, front half
      const P = view(cx, cy, R * 1.3, t * .15, -1.2), orbit = (front: boolean) => {
        let prev = P(1, 0, 0);
        for (let i = 1; i <= 96; i++){ const a = i / 96 * TAU, p = P(Math.cos(a), 0, Math.sin(a)); if ((p[2] >= 0) === front){ g.strokeStyle = `rgba(${A},${front ? .35 : .1})`; g.beginPath(); g.moveTo(prev[0], prev[1]); g.lineTo(p[0], p[1]); g.stroke(); } prev = p; }
        nodes.forEach((n, i) => {
          const a = i * TAU / nodes.length, p = P(Math.cos(a), 0, Math.sin(a)); if ((p[2] >= 0) !== front) return;
          g.fillStyle = front ? '#f2f5f8' : `rgba(${A},.4)`; g.fillRect(p[0] - 2.5, p[1] - 2.5, 5, 5);
          if (front){ g.strokeStyle = `rgba(${A},.7)`; g.strokeRect(p[0] - 6, p[1] - 6, 12, 12); g.font = `10px ${MONO}`; g.fillStyle = `rgba(${A},.8)`; g.fillText(n, p[0] + 10, p[1] + 3); }
        });
      };
      orbit(false);
      // the coin turns about its vertical axis; edge-on it shows the rim
      const ang = t * .22, k = Math.cos(ang), face = k >= 0 ? faceF : faceB;
      g.save(); g.translate(cx, cy);
      g.fillStyle = '#3b4048'; g.beginPath(); g.ellipse(Math.sin(ang) * K * .05, 0, Math.max(1, Math.abs(k) * K), K, 0, 0, TAU); g.fill();
      g.scale(Math.max(.02, Math.abs(k)), 1); g.drawImage(face, -S / 2, -S / 2, S, S);
      // light sweep across the face
      const sx = ((t * .18) % 1.6 - .3) * K * 2.4 - K * 1.2, sw = g.createLinearGradient(sx - K * .3, -K, sx + K * .3, K);
      sw.addColorStop(0, 'rgba(255,255,255,0)'); sw.addColorStop(.5, 'rgba(255,255,255,.13)'); sw.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = sw; g.beginPath(); g.arc(0, 0, K, 0, TAU); g.fill();
      g.restore();
      orbit(true);
      run.geo = rails(g, cx, cy, R * 1.5, A);
      g.font = `11px ${MONO}`; g.textAlign = 'center'; g.fillStyle = `rgba(${A},.5)`;
      g.fillText(`ROTACJA ${((ang * 57.3) % 360).toFixed(1).padStart(5, '0')}° · RADA O5 · ${nodes.length}/13 OBECNYCH`, cx, cy - R * 1.42); g.textAlign = 'left';
    }
    return run;
  },
} satisfies Scene;
