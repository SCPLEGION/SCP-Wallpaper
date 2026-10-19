// Scene 4: Topo: breathing contour lines
'use strict';

// 4. Topo: breathing contour lines
SCENES.push({
  name: 'Topo', swatch: 'linear-gradient(135deg,#101512,#2a3a31)',
  mount(seed){
    const r = rng(seed);
    this.cx = 560 + r() * 480; this.cy = 380 + r() * 140;
    this.ph = [0, 1, 2, 3].map(() => r() * 6.28); this.w = [0, 1, 2, 3].map(() => (r() - .5) * .22);
    const warm = r() < .5; this.col = warm ? '#e9e1cf' : '#cfe6dc'; this.acc = warm ? '#e8826a' : '#8fd3c7';
    let s = `<rect width="${W}" height="${H}" fill="${warm ? '#11110f' : '#0d1311'}"/>`;
    for (let k = 1; k <= 36; k++){
      const strong = k % 6 === 0;
      s += `<path class="tp" fill="none" stroke="${strong ? this.acc : this.col}" stroke-width="${strong ? 1.8 : 1}" stroke-opacity="${strong ? .75 : f1(Math.max(.08, .5 - k * .012))}"/>`;
    }
    return svg(s);
  },
  after(){ this.els = [...stage.querySelectorAll('.tp')]; this.tick(0, 0); },
  tick(t){
    this.els.forEach((e, i) => {
      const k = i + 1, R = k * 17; let d = '';
      for (let a = 0; a <= 96; a++){
        const th = a / 96 * Math.PI * 2;
        const n = Math.sin(th + this.ph[0] + t * this.w[0] + k * .11) * .5 + Math.sin(2 * th + this.ph[1] + t * this.w[1] - k * .08) * .3 + Math.sin(3 * th + this.ph[2] + t * this.w[2] + k * .14) * .2;
        const rr = R + k * 3.4 * n;
        d += (a ? 'L' : 'M') + f1(this.cx + rr * 1.55 * Math.cos(th)) + ' ' + f1(this.cy + rr * Math.sin(th)) + ' ';
      }
      e.setAttribute('d', d + 'Z');
    });
  }
});
