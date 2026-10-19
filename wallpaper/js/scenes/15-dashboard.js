// Scene 15: Dashboard: HUD command-centre background; its widgets (reactor, system...) are movable and resizable
'use strict';

// 15. Dashboard: HUD command-centre background; its widgets (reactor, system...) are movable and resizable
SCENES.push({
  name: 'Dashboard', accent: '#4fe3ff', hud: true, swatch: 'linear-gradient(135deg,#02131a,#0b5a70)',
  preset: { on: ['reactor', 'system', 'claude', 'calendar', 'progress'], layout: {
    reactor: { x: .302, y: .15, s: 1.15 }, system: { x: .035, y: .12, s: 1 }, claude: { x: .035, y: .68, s: 1 }, calendar: { x: .79, y: .12, s: 1 }, progress: { x: .70, y: .58, s: 1 } } },
  mount(seed){
    const r = rng(seed), C = '#4fe3ff', cx = 800, cy = 450;
    let s = `<defs><radialGradient id="jbg" cx=".5" cy=".5" r=".8"><stop offset="0" stop-color="#05283a"/><stop offset=".55" stop-color="#021019"/><stop offset="1" stop-color="#010508"/></radialGradient>
      <pattern id="jgr" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="${C}" stroke-opacity=".05"/></pattern>
      <linearGradient id="jsc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C}" stop-opacity="0"/><stop offset=".5" stop-color="${C}" stop-opacity=".07"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></linearGradient>
      <style>.hs{animation:hscan 9s linear infinite}@keyframes hscan{from{transform:translateY(-140px)}to{transform:translateY(${H}px)}}.hb{animation:hb 1.6s steps(2) infinite}@keyframes hb{50%{opacity:.15}}.hf{animation:hf 3.4s ease-in-out infinite}@keyframes hf{0%,100%{opacity:.2}50%{opacity:.7}}</style></defs>
      <rect width="${W}" height="${H}" fill="url(#jbg)"/><rect width="${W}" height="${H}" fill="url(#jgr)"/>
      <g fill="none" stroke="${C}" stroke-opacity=".12"><circle cx="${cx}" cy="${cy}" r="345" stroke-dasharray="2 14"/><circle cx="${cx}" cy="${cy}" r="395" stroke-dasharray="1 9"/><path d="M0 ${cy}H${W}M${cx} 0V${H}"/></g>
      <g fill="none" stroke="${C}" stroke-width="3" stroke-opacity=".85"><path d="M30 130V30H130M${W - 30} 130V30H${W - 130}M30 ${H - 130}V${H - 30}H130M${W - 30} ${H - 130}V${H - 30}H${W - 130}"/></g>
      <g stroke="${C}" stroke-opacity=".35"><path d="M150 62H${W - 150}"/>`;
    for (let x = 150; x <= W - 150; x += 20) s += `<path d="M${x} 62v${x % 100 === 50 ? 12 : 6}"/>`;
    s += `<path d="M150 838H${W - 150}"/>`;
    for (let x = 150; x <= W - 150; x += 20) s += `<path d="M${x} 838v${x % 100 === 50 ? -12 : -6}"/>`;
    for (let y = 170; y <= H - 170; y += 20){ const L = (y - 170) % 100 === 0 ? 14 : 7; s += `<path d="M30 ${y}h${L}M${W - 30} ${y}h${-L}"/>`; }
    s += `</g><g font-family="monospace" fill="${C}"><text x="150" y="46" font-size="13" letter-spacing="6" fill-opacity=".85">SCP · COMMAND CENTER</text>
      <text x="${W - 150}" y="46" font-size="12" letter-spacing="5" text-anchor="end" fill-opacity=".75">SYS ONLINE</text><circle class="hb" cx="${W - 138}" cy="41" r="4"/>`;
    for (let i = 0; i < 6; i++) s += `<text class="hf" x="${520 + i * 112}" y="46" font-size="11" fill-opacity=".8" style="animation-delay:-${f1(r() * 3.4)}s">0x${Math.floor(r() * 65536).toString(16).toUpperCase().padStart(4, '0')}</text>`;
    for (let x = 250; x <= W - 250; x += 200) s += `<text x="${x}" y="${H - 12}" font-size="10" fill-opacity=".4" text-anchor="middle">${String(Math.round((x - 150) / 20)).padStart(3, '0')}</text>`;
    s += `</g><rect class="hs" width="${W}" height="140" fill="url(#jsc)"/>`;
    return svg(s);
  }
});
