// Scene 8: Reactor: rotating rings around a core
'use strict';

// 8. Reactor: rotating rings around a core
SCENES.push({
  name: 'Reaktor', accent: '#4fe3ff', swatch: 'radial-gradient(circle,#4fe3ff 0 6%,#0b3a4a 7% 30%,#02090e 60%)',
  mount(seed){
    const r = rng(seed), C = '#4fe3ff', cx = 800, cy = 450;
    let s = `<defs><radialGradient id="rbg" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#073040"/><stop offset=".6" stop-color="#020d14"/><stop offset="1" stop-color="#010508"/></radialGradient>
      <radialGradient id="core"><stop offset="0" stop-color="#d8fbff"/><stop offset=".25" stop-color="${C}" stop-opacity=".9"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></radialGradient>
      <pattern id="gr" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="${C}" stroke-opacity=".055"/></pattern>
      <style>.sp{transform-origin:${cx}px ${cy}px;animation:spin linear infinite}.fl{animation:fl 3s ease-in-out infinite}@keyframes spin{to{transform:rotate(360deg)}}@keyframes fl{0%,100%{opacity:.25}50%{opacity:.7}}</style></defs>
      <rect width="${W}" height="${H}" fill="url(#rbg)"/><rect width="${W}" height="${H}" fill="url(#gr)"/>
      <g fill="none" stroke="${C}" stroke-width="2" stroke-opacity=".8"><path d="M40 130V40H130M${W - 40} 130V40H${W - 130}M40 ${H - 130}V${H - 40}H130M${W - 40} ${H - 130}V${H - 40}H${W - 130}"/></g>
      <circle cx="${cx}" cy="${cy}" r="260" fill="url(#core)" opacity=".28"/>
      <circle class="sp" style="animation-duration:120s" cx="${cx}" cy="${cy}" r="410" fill="none" stroke="${C}" stroke-opacity=".5" stroke-width="2" stroke-dasharray="1 13"/>
      <g class="sp" style="animation-duration:${f1(70 + r() * 30)}s;animation-direction:reverse" stroke="${C}" stroke-opacity=".6">`;
    for (let a = 0; a < 360; a += 4){ const L = a % 20 === 0 ? 20 : 9, co = Math.cos(rad(a)), si = Math.sin(rad(a)); s += `<line x1="${f1(cx + 345 * co)}" y1="${f1(cy + 345 * si)}" x2="${f1(cx + (345 + L) * co)}" y2="${f1(cy + (345 + L) * si)}"/>`; }
    s += `</g><g class="sp" style="animation-duration:${f1(34 + r() * 20)}s" fill="none" stroke="${C}" stroke-linecap="butt">`;
    for (let i = 0, a = r() * 60; i < 4; i++){ const len = 40 + r() * 38; s += `<path d="${arcPath(cx, cy, 290, a, a + len)}" stroke-width="9" stroke-opacity=".85"/>`; a += len + 14 + r() * 30; }
    s += `</g><g class="sp" style="animation-duration:${f1(22 + r() * 10)}s;animation-direction:reverse" fill="none" stroke="${C}">`;
    for (let i = 0, a = r() * 90; i < 6; i++){ const len = 22 + r() * 34; s += `<path d="${arcPath(cx, cy, 232, a, a + len)}" stroke-width="3" stroke-opacity=".8"/>`; a += len + 16 + r() * 26; }
    s += `</g><circle cx="${cx}" cy="${cy}" r="180" fill="none" stroke="${C}" stroke-opacity=".35"/>
      <polygon class="sp" style="animation-duration:46s" fill="none" stroke="${C}" stroke-width="2" stroke-opacity=".7" points="${[0, 1, 2, 3, 4, 5].map(k => f1(cx + 128 * Math.cos(rad(k * 60))) + ',' + f1(cy + 128 * Math.sin(rad(k * 60)))).join(' ')}"/>
      <circle cx="${cx}" cy="${cy}" r="70" fill="url(#core)"/><circle cx="${cx}" cy="${cy}" r="46" fill="none" stroke="#d8fbff" stroke-opacity=".8" stroke-width="2"/>
      <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-family="monospace" font-size="15" letter-spacing="5" fill="#02131a" font-weight="700">ONLINE</text>
      <text x="${cx}" y="${cy + 60}" text-anchor="middle" font-family="monospace" font-size="12" letter-spacing="7" fill="${C}" fill-opacity=".8">SCP · CORE</text>`;
    for (let i = 0; i < 9; i++){
      s += `<text class="fl" x="64" y="${H - 220 + i * 18}" font-family="monospace" font-size="11" fill="${C}" style="animation-delay:-${f1(r() * 3)}s">SYS ${hexs(r, 3)}</text>`;
      s += `<text class="fl" x="${W - 64}" text-anchor="end" y="${H - 220 + i * 18}" font-family="monospace" font-size="11" fill="${C}" style="animation-delay:-${f1(r() * 3)}s">${hexs(r, 3)} NET</text>`;
    }
    return svg(s);
  }
});
