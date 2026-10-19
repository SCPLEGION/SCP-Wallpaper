// Scene 1: Dusk: sun and layered ridges
'use strict';

// 1. Dusk: sun and layered ridges
SCENES.push({
  name: 'Zmierzch', swatch: 'linear-gradient(#2a1f4d,#a24a6a 60%,#f2a27c)',
  mount(seed){
    const r = rng(seed), sunX = 380 + r() * 840, hue = r();
    const sky = hue < .5 ? ['#14122e', '#4a2a5e', '#d9667a', '#f6c28b'] : ['#0e1a33', '#2d4a7a', '#e58f7b', '#f8d9a0'];
    const cols = hue < .5 ? ['#7a3f70', '#55305f', '#34224a', '#1a1030'] : ['#4a5e8f', '#34457a', '#222f5c', '#111a38'];
    let s = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset=".45" stop-color="${sky[1]}"/><stop offset=".78" stop-color="${sky[2]}"/><stop offset="1" stop-color="${sky[3]}"/></linearGradient>
      <radialGradient id="glow"><stop offset="0" stop-color="#ffe2b0" stop-opacity=".55"/><stop offset="1" stop-color="#ffe2b0" stop-opacity="0"/></radialGradient>
      <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".16"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#sky)"/>
      <circle cx="${f1(sunX)}" cy="560" r="330" fill="url(#glow)"/>
      <circle cx="${f1(sunX)}" cy="560" r="92" fill="#fbdca8"/>
      <g id="clouds" fill="#fff" fill-opacity=".14">`;
    for (let i = 0; i < 4; i++){ const y = 150 + r() * 260, w = 160 + r() * 260; s += `<rect class="cl" data-sp="${f1(4 + r() * 8)}" x="${f1(r() * W)}" y="${f1(y)}" width="${f1(w)}" height="6" rx="3"/>`; }
    s += `</g>`;
    [[620, 120, .0016], [690, 130, .0021], [770, 120, .0027], [860, 110, .0034]].forEach(([b, a, fr], i) => {
      s += ridge(b, a, fr, seed + i * 31, cols[i]);
      if (i === 1) s += `<rect y="${b - 60}" width="${W}" height="120" fill="url(#mist)"/>`;
    });
    this.clouds = null; return svg(s);
  },
  after(){ this.clouds = [...stage.querySelectorAll('.cl')].map(e => ({ e, x: +e.getAttribute('x'), sp: +e.dataset.sp, w: +e.getAttribute('width') })); },
  tick(t, dt){ for (const c of this.clouds){ c.x += c.sp * dt; if (c.x > W + 20) c.x = -c.w - 20; c.e.setAttribute('x', f1(c.x)); } }
});
