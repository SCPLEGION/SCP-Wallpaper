// Scene 2: Moon: stars and ridges
'use strict';

// 2. Moon: stars and ridges
SCENES.push({
  name: 'Księżyc', swatch: 'linear-gradient(#050914,#142447)',
  mount(seed){
    const r = rng(seed), mx = 760 + r() * 360, my = 190 + r() * 150;
    let s = `<defs><radialGradient id="bgm" cx=".7" cy=".25" r="1"><stop offset="0" stop-color="#1c2b55"/><stop offset=".6" stop-color="#0b1330"/><stop offset="1" stop-color="#04060f"/></radialGradient>
      <radialGradient id="mg"><stop offset="0" stop-color="#cfd9ff" stop-opacity=".35"/><stop offset="1" stop-color="#cfd9ff" stop-opacity="0"/></radialGradient>
      <mask id="cres"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="${f1(mx + 46)}" cy="${f1(my - 26)}" r="104" fill="#000"/></mask></defs>
      <rect width="${W}" height="${H}" fill="url(#bgm)"/>`;
    for (let i = 0; i < 150; i++){ const sz = .6 + r() * 1.7; s += `<circle class="tw" cx="${f1(r() * W)}" cy="${f1(r() * H * .8)}" r="${f1(sz)}" fill="#fff" style="animation-duration:${f1(2.5 + r() * 5)}s;animation-delay:-${f1(r() * 6)}s"/>`; }
    s += `<circle cx="${f1(mx)}" cy="${f1(my)}" r="300" fill="url(#mg)"/><circle cx="${f1(mx)}" cy="${f1(my)}" r="108" fill="#efe9d6" mask="url(#cres)"/>`;
    s += ridge(760, 140, .0019, seed + 3, '#0d1630') + ridge(840, 100, .0028, seed + 9, '#070b1a');
    return svg(s);
  }
});
