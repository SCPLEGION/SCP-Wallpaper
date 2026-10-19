// Scene 9: Radar: sweep and fading blips
'use strict';

// 9. Radar: sweep and fading blips
SCENES.push({
  name: 'Radar', accent: '#5dff9d', swatch: 'radial-gradient(circle,#0a3a22 0 20%,#03100a 21% 40%,#020a07 41%)',
  mount(seed){ this.seed = seed; return '<canvas id="cv"></canvas>'; },
  after(){
    cvInit(this, .8); const r = rng(this.seed);
    this.blips = Array.from({ length: 16 }, () => ({ a: r() * 6.283, d: .15 + r() * .8, v: (r() - .5) * .05, s: 2 + r() * 3 }));
  },
  tick(t){
    const g = this.g, w = this.w, h = this.h, cx = w * .6, cy = h * .5, R = h * .42, G = '93,255,157';
    g.fillStyle = '#020a07'; g.fillRect(0, 0, w, h);
    g.strokeStyle = `rgba(${G},.22)`; g.lineWidth = 1;
    for (let i = 1; i <= 4; i++){ g.beginPath(); g.arc(cx, cy, R * i / 4, 0, 6.2832); g.stroke(); }
    g.beginPath(); g.moveTo(cx - R, cy); g.lineTo(cx + R, cy); g.moveTo(cx, cy - R); g.lineTo(cx, cy + R); g.stroke();
    for (let a = 0; a < 360; a += 5){ const c = Math.cos(rad(a)), s = Math.sin(rad(a)), L = a % 30 ? 6 : 14; g.beginPath(); g.moveTo(cx + R * c, cy + R * s); g.lineTo(cx + (R + L) * c, cy + (R + L) * s); g.stroke(); }
    const a = (t * .9) % 6.2832, wedge = .9 / 6.2832;
    const cg = g.createConicGradient(a - .9, cx, cy);
    cg.addColorStop(0, `rgba(${G},0)`); cg.addColorStop(wedge, `rgba(${G},.42)`); cg.addColorStop(wedge + .002, `rgba(${G},0)`); cg.addColorStop(1, `rgba(${G},0)`);
    g.fillStyle = cg; g.beginPath(); g.arc(cx, cy, R, 0, 6.2832); g.fill();
    g.strokeStyle = `rgba(${G},.9)`; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a)); g.stroke();
    for (const b of this.blips){
      b.a += b.v * .02;
      const since = ((a - b.a) % 6.2832 + 6.2832) % 6.2832, al = Math.exp(-since * 1.1);
      const x = cx + R * b.d * Math.cos(b.a), y = cy + R * b.d * Math.sin(b.a);
      g.fillStyle = `rgba(${G},${f1(al)})`; g.beginPath(); g.arc(x, y, b.s, 0, 6.2832); g.fill();
      g.strokeStyle = `rgba(${G},${f1(al * .6)})`; g.lineWidth = 1; g.beginPath(); g.arc(x, y, b.s + 5 + (1 - al) * 6, 0, 6.2832); g.stroke();
    }
    g.fillStyle = `rgba(${G},.7)`; g.beginPath(); g.arc(cx, cy, 4, 0, 6.2832); g.fill();
    g.font = '11px monospace'; g.fillStyle = `rgba(${G},.55)`;
    g.fillText('RNG ' + (R | 0) + ' · SWEEP ' + ((a * 57.2958) | 0).toString().padStart(3, '0') + '°', cx - R, cy + R + 30);
  }
});
