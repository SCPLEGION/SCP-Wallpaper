// Orbits: thin rings and moving dots
import { W, H } from '../core/config.ts';
import { rng, f1, svg } from '../core/util.ts';
import type { Scene } from './types.ts';

export default {
  id: 'orbits', name: 'Orbity', swatch: 'radial-gradient(circle at 60% 50%,#262a3a,#090a0f 70%)',
  mount({ el, seed }){
    const r = rng(seed), cx = 760 + r() * 240, cy = 420 + r() * 80, dots: { R: number; a: number; sp: number }[] = [];
    let s = `<rect width="${W}" height="${H}" fill="#0a0b10"/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="7" fill="#f3f0ea"/>`;
    const acc = Math.floor(2 + r() * 5);
    for (let i = 0; i < 9; i++){
      const R = 90 + i * 66;
      s += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${R}" fill="none" stroke="#fff" stroke-opacity="${f1(.2 - i * .016)}" stroke-width="1"/>`;
      dots.push({ R, a: r() * 6.28, sp: (i % 2 ? -1 : 1) * .5 / (1 + i * .55) });
      s += `<circle class="od" r="${i === acc ? 9 : 4.5}" fill="${i === acc ? '#ff6b4a' : '#f3f0ea'}" fill-opacity="${i === acc ? 1 : .8}"/>`;
    }
    el.innerHTML = svg(s);
    const els = [...el.querySelectorAll('.od')];
    const tick = (t: number) => dots.forEach((d, i) => { const a = d.a + t * d.sp; els[i].setAttribute('cx', f1(cx + d.R * Math.cos(a))); els[i].setAttribute('cy', f1(cy + d.R * Math.sin(a))); });
    tick(0);
    return { tick };
  },
} satisfies Scene;
