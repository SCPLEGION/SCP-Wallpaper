// Scene 12: Circuit: traces with travelling pulses
'use strict';

// 12. Circuit: traces with travelling pulses
SCENES.push({
  name: 'Obwód', accent: '#42f5b0', swatch: 'linear-gradient(135deg,#04120f,#0e6a56)',
  mount(seed){
    const r = rng(seed), C = '#42f5b0', G = 40;
    let s = `<defs><style>.pu{stroke-dasharray:4 96;animation:pu linear infinite}@keyframes pu{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}</style></defs><rect width="${W}" height="${H}" fill="#030e0c"/>`;
    for (let i = 0; i < 70; i++){
      let x = Math.floor(r() * 40) * G, y = Math.floor(r() * 23) * G, dir = Math.floor(r() * 4), d = `M${x} ${y}`; const sx = x, sy = y;
      for (let k = 0, n = 3 + Math.floor(r() * 5); k < n; k++){
        const len = (1 + Math.floor(r() * 4)) * G; x += [len, 0, -len, 0][dir]; y += [0, len, 0, -len][dir]; x = Math.max(0, Math.min(W, x)); y = Math.max(0, Math.min(H, y));
        d += `L${x} ${y}`; dir = (dir + (r() < .5 ? 1 : 3)) % 4;
      }
      s += `<path d="${d}" fill="none" stroke="${C}" stroke-opacity=".22" stroke-width="1.5" stroke-linejoin="round"/>`;
      s += `<path class="pu" pathLength="100" d="${d}" fill="none" stroke="#d6fff0" stroke-opacity=".9" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="animation-duration:${f1(3 + r() * 6)}s;animation-delay:-${f1(r() * 8)}s"/>`;
      s += `<circle cx="${sx}" cy="${sy}" r="4" fill="#030e0c" stroke="${C}" stroke-opacity=".7"/><circle cx="${x}" cy="${y}" r="3" fill="${C}" fill-opacity=".6"/>`;
    }
    s += `<rect x="${760 + Math.floor(r() * 3) * 40}" y="320" width="200" height="200" rx="10" fill="#041a16" stroke="${C}" stroke-opacity=".8" stroke-width="2"/><rect x="${790 + 0}" y="350" width="140" height="140" fill="none" stroke="${C}" stroke-opacity=".3"/>`;
    return svg(s);
  }
});
