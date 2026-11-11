// Emblem: the Foundation emblem breathing in a dark hall, measuring rings and slow dust
import { rng } from '../core/util.ts';
import { cvInit } from '../core/draw.ts';
import { layer, emblem, TAU } from './scp.ts';
import type { Scene } from './types.ts';

export default {
  id: 'emblem', name: 'Emblemat', accent: '#d8dde3', swatch: 'radial-gradient(circle,#e8ecf0 0 12%,#1d2026 13% 40%,#07080a 70%)',
  mount({ el, seed }){
    el.innerHTML = '<canvas></canvas>';
    const cv = cvInit(el, .8), { g, w, h } = cv, r = rng(seed);
    const cx = w * .5, cy = h * .44, R = Math.min(w, h) * .19;
    const bg = layer(cv, b => {
      const gr = b.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * .75); gr.addColorStop(0, '#20232a'); gr.addColorStop(1, '#060709');
      b.fillStyle = gr; b.fillRect(0, 0, w, h);
      b.strokeStyle = 'rgba(255,255,255,.03)'; b.lineWidth = 1;
      for (let x = (cx % 48) - 48; x < w; x += 48){ b.beginPath(); b.moveTo(x + .5, 0); b.lineTo(x + .5, h); b.stroke(); }
      for (let y = (cy % 48) - 48; y < h; y += 48){ b.beginPath(); b.moveTo(0, y + .5); b.lineTo(w, y + .5); b.stroke(); }
      b.font = `600 ${Math.round(R * .15)}px sans-serif`; b.textAlign = 'center'; b.letterSpacing = `${Math.round(R * .08)}px`;
      b.fillStyle = 'rgba(232,236,240,.7)'; b.fillText('SECURE · CONTAIN · PROTECT', cx, cy + R * 2.25);
      b.font = `${Math.round(R * .09)}px sans-serif`; b.fillStyle = 'rgba(232,236,240,.35)'; b.fillText('THE FOUNDATION', cx, cy + R * 2.55);
    });
    const mark = layer(cv, b => { b.shadowColor = 'rgba(230,235,240,.4)'; b.shadowBlur = R * .25; emblem(b, cx, cy, R, '#e6eaee', '#1a1c22'); });
    const dust = Array.from({ length: 80 }, () => ({ x: r() * w, y: r() * h, v: 4 + r() * 10, s: .4 + r() * 1.3, a: .1 + r() * .35 }));
    return {
      soft: cv.soft,
      tick(t, dt){
        g.drawImage(bg, 0, 0, w, h);
        g.save(); g.translate(cx, cy); g.rotate(t * .04); g.strokeStyle = 'rgba(220,225,230,.16)'; g.lineWidth = 1;
        for (let i = 0; i < 120; i++){ const a = i * TAU / 120, L = i % 10 ? 6 : 16, c = Math.cos(a), s = Math.sin(a); g.beginPath(); g.moveTo(c * R * 1.42, s * R * 1.42); g.lineTo(c * (R * 1.42 + L), s * (R * 1.42 + L)); g.stroke(); }
        g.rotate(-t * .1); g.setLineDash([2, 12]); g.beginPath(); g.arc(0, 0, R * 1.72, 0, TAU); g.stroke(); g.setLineDash([]);
        g.strokeStyle = 'rgba(220,225,230,.3)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, R * 1.72, t * .3, t * .3 + .5); g.stroke();
        g.restore();
        g.globalAlpha = .82 + .18 * Math.sin(t * .7); g.drawImage(mark, 0, 0, w, h); g.globalAlpha = 1;
        g.fillStyle = '#e6eaee';
        for (const d of dust){ d.y -= d.v * dt; if (d.y < -4){ d.y = h + 4; d.x = r() * w; } g.globalAlpha = d.a; g.fillRect(d.x, d.y, d.s, d.s); }
        g.globalAlpha = 1;
      },
    };
  },
} satisfies Scene;
