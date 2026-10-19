// Scene 6: Dots: wave through a grid
'use strict';

// 6. Dots: wave through a grid
SCENES.push({
  name: 'Siatka', swatch: 'radial-gradient(circle,#cfd8dc 1.5px,transparent 2px) 0 0/12px 12px,#0e0f12',
  mount(seed){
    const r = rng(seed); this.cols = 40; this.rows = 23; this.sp = 40; this.o = [r() * 6.28, r() * 6.28];
    this.hue = r() < .5 ? '#cfd8dc' : '#f1d6b8';
    let s = `<rect width="${W}" height="${H}" fill="#0d0e12"/>`;
    for (let y = 0; y < this.rows; y++) for (let x = 0; x < this.cols; x++) s += `<circle class="dt" cx="${x * this.sp + 20}" cy="${y * this.sp + 10}" r="2" fill="${this.hue}"/>`;
    return svg(s);
  },
  after(){ this.els = [...stage.querySelectorAll('.dt')]; this.tick(0, 0); },
  tick(t){
    const px = 800 + 520 * Math.sin(t * .27 + this.o[0]), py = 450 + 280 * Math.sin(t * .21 + this.o[1]);
    this.els.forEach((e, i) => {
      const x = (i % this.cols) * this.sp + 20, y = Math.floor(i / this.cols) * this.sp + 10;
      const d = Math.hypot(x - px, y - py), k = Math.max(0, Math.sin(d * .018 - t * 1.3)) * Math.exp(-d / 900);
      e.setAttribute('r', f1(1.6 + k * 7)); e.setAttribute('fill-opacity', f1(.18 + k * 1.1 > 1 ? 1 : .18 + k * 1.1));
    });
  }
});
