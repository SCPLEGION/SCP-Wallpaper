// Scene 3: Waves: layered sine bands
'use strict';

// 3. Waves: layered sine bands
SCENES.push({
  name: 'Fale', swatch: 'linear-gradient(#06222b,#14707a)',
  mount(seed){
    const r = rng(seed), hue = 170 + Math.floor(r() * 50);
    this.layers = []; this.hue = hue;
    let s = `<defs><linearGradient id="bgw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue},55%,8%)"/><stop offset="1" stop-color="hsl(${hue},50%,16%)"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#bgw)"/>`;
    for (let i = 0; i < 9; i++){
      this.layers.push({ base: 330 + i * 62, amp: 22 + i * 4, k: .0036 + i * .0006 + r() * .0008, sp: .22 + i * .035 + r() * .1, ph: r() * 6.28, ph2: r() * 6.28 });
      s += `<path class="wv" fill="hsl(${hue},${45 + i * 3}%,${16 + i * 3.4}%)" fill-opacity=".9"/>`;
    }
    return svg(s);
  },
  after(){ this.els = [...stage.querySelectorAll('.wv')]; this.tick(0, 0); },
  tick(t){
    this.layers.forEach((L, i) => {
      let d = `M-20 ${H + 20}`;
      for (let x = -20; x <= W + 20; x += 20){
        const y = L.base + L.amp * Math.sin(x * L.k + t * L.sp + L.ph) + L.amp * .45 * Math.sin(x * L.k * 2.3 - t * L.sp * .7 + L.ph2);
        d += ` L${x} ${f1(y)}`;
      }
      this.els[i].setAttribute('d', d + ` L${W + 20} ${H + 20} Z`);
    });
  }
});
