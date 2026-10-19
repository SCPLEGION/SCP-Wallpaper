// Scene 5: Orbits: thin rings and moving dots
'use strict';

// 5. Orbits: thin rings and moving dots
SCENES.push({
  name: 'Orbity', swatch: 'radial-gradient(circle at 60% 50%,#262a3a,#090a0f 70%)',
  mount(seed){
    const r = rng(seed); this.cx = 760 + r() * 240; this.cy = 420 + r() * 80; this.dots = [];
    let s = `<rect width="${W}" height="${H}" fill="#0a0b10"/><circle cx="${f1(this.cx)}" cy="${f1(this.cy)}" r="7" fill="#f3f0ea"/>`;
    const acc = Math.floor(2 + r() * 5);
    for (let i = 0; i < 9; i++){
      const R = 90 + i * 66;
      s += `<circle cx="${f1(this.cx)}" cy="${f1(this.cy)}" r="${R}" fill="none" stroke="#fff" stroke-opacity="${f1(.2 - i * .016)}" stroke-width="1"/>`;
      this.dots.push({ R, a: r() * 6.28, sp: (i % 2 ? -1 : 1) * .5 / (1 + i * .55), n: i === acc });
      s += `<circle class="od" r="${i === acc ? 9 : 4.5}" fill="${i === acc ? '#ff6b4a' : '#f3f0ea'}" fill-opacity="${i === acc ? 1 : .8}"/>`;
    }
    return svg(s);
  },
  after(){ this.els = [...stage.querySelectorAll('.od')]; this.tick(0, 0); },
  tick(t){ this.dots.forEach((d, i) => { const a = d.a + t * d.sp; this.els[i].setAttribute('cx', f1(this.cx + d.R * Math.cos(a))); this.els[i].setAttribute('cy', f1(this.cy + d.R * Math.sin(a))); }); }
});
