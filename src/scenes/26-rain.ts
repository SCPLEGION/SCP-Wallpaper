// Rain: rain on a window at night, blurred city lights behind the glass, drops sliding down and merging
import { cvInit } from '../core/draw.ts';
import { rng } from '../core/util.ts';
import type { Scene } from './types.ts';

export default {
  id: 'rain', pack: 'klimat', name: 'Deszcz', accent: '#ffb86b', swatch: 'radial-gradient(circle at 30% 70%,#a8643055,#0b1018 60%),linear-gradient(#0b1018,#141c28)',
  mount({ el, seed }){
    el.innerHTML = '<canvas></canvas>';
    const cv = cvInit(el, .8), { g, w, h } = cv, r = rng(seed);
    // the city behind the glass: soft bokeh discs, drawn once into the canvas background
    const bg = document.createElement('canvas'); bg.width = cv.c.width; bg.height = cv.c.height;
    const b = bg.getContext('2d')!; b.setTransform(cv.c.width / w, 0, 0, cv.c.width / w, 0, 0);
    const sky = b.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#070a12'); sky.addColorStop(1, '#151b26'); b.fillStyle = sky; b.fillRect(0, 0, w, h);
    const hues = ['255,184,107', '255,214,150', '120,180,255', '255,110,90', '200,230,255'];
    for (let i = 0; i < 90; i++){
      const x = r() * w, y = h * (.35 + r() * .6), R = 8 + r() * r() * 60, c = hues[(r() * hues.length) | 0], a = .08 + r() * .22;
      const gr = b.createRadialGradient(x, y, 0, x, y, R); gr.addColorStop(0, `rgba(${c},${a})`); gr.addColorStop(.7, `rgba(${c},${a * .6})`); gr.addColorStop(1, `rgba(${c},0)`);
      b.fillStyle = gr; b.beginPath(); b.arc(x, y, R, 0, Math.PI * 2); b.fill();
    }
    cv.c.style.background = `url(${bg.toDataURL()}) center/cover`;

    // static beads (tiny drops stuck to the glass) and runners (drops that slide, leaving a trail)
    const beads = Array.from({ length: 420 }, () => ({ x: r() * w, y: r() * h, s: .6 + r() * 2.2 }));
    type Run = { x: number; y: number; s: number; v: number; trail: number[] };
    const spawn = (): Run => ({ x: r() * w, y: -10 - r() * h * .5, s: 2.5 + r() * 4, v: 0, trail: [] });
    const runs: Run[] = Array.from({ length: 34 }, () => { const d = spawn(); d.y = r() * h; return d; });
    const drop = (x: number, y: number, s: number, a: number) => {
      g.fillStyle = `rgba(210,225,255,${a * .4})`; g.beginPath(); g.ellipse(x, y, s, s * 1.15, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = `rgba(255,255,255,${a * .85})`; g.beginPath(); g.arc(x - s * .35, y - s * .4, s * .28, 0, Math.PI * 2); g.fill();
    };
    return {
      soft: cv.soft,
      tick(t, dt){
        g.clearRect(0, 0, w, h);
        for (const d of beads) drop(d.x, d.y, d.s, .7);
        for (const d of runs){
          // sticky glass: drops stall, then lurch down; bigger drops move faster
          d.v += (r() < .04 ? 220 : -d.v * 2.5) * dt * d.s * .25; d.v = Math.max(0, d.v);
          d.y += d.v * dt * 3; d.x += Math.sin(t * 2 + d.y * .03) * .15;
          if (d.trail.length === 0 || d.y - d.trail[d.trail.length - 1] > 6) d.trail.push(d.y);
          if (d.trail.length > 40) d.trail.shift();
          g.fillStyle = 'rgba(210,225,255,.14)';
          for (const ty of d.trail) g.fillRect(d.x - d.s * .25, ty, d.s * .5, 6);
          drop(d.x, d.y, d.s, 1);
          for (const bd of beads) if (Math.abs(bd.x - d.x) < d.s && Math.abs(bd.y - d.y) < d.s){ d.s = Math.min(8, d.s + bd.s * .15); bd.y = r() * h; bd.x = r() * w; }
          if (d.y > h + 20) Object.assign(d, spawn());
        }
      },
    };
  },
} satisfies Scene;
