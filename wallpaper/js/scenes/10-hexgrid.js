// Scene 10: Hex grid: pulses travelling through cells
'use strict';

// 10. Hex grid: pulses travelling through cells
SCENES.push({
  name: 'Heksy', accent: '#4fe3ff', swatch: 'linear-gradient(135deg,#031018,#0a4a5c)',
  mount(seed){ this.seed = seed % 1000; return '<canvas id="cv"></canvas>'; },
  after(){ cvInit(this, .8); },
  tick(t){
    const g = this.g, w = this.w, h = this.h, s = 34, dx = 1.5 * s, dy = Math.sqrt(3) * s, S = this.seed;
    g.fillStyle = '#020a10'; g.fillRect(0, 0, w, h);
    const px = w * (.5 + .35 * Math.sin(t * .23 + S)), py = h * (.5 + .3 * Math.sin(t * .31 + S * 2));
    g.lineWidth = 1;
    for (let c = -1; c * dx < w + s; c++) for (let r = -1; r * dy < h + dy; r++){
      const x = c * dx, y = r * dy + (c & 1 ? dy / 2 : 0), d = Math.hypot(x - px, y - py);
      const k = Math.max(0, Math.sin(d * .018 - t * 1.6)) * Math.exp(-d / 650), fl = hash1(c * 131 + r, S) > .985 ? Math.max(0, Math.sin(t * 2 + c + r)) : 0, v = Math.min(1, k + fl * .8);
      g.beginPath();
      for (let i = 0; i < 6; i++){ const a = rad(60 * i); g[i ? 'lineTo' : 'moveTo'](x + (s - 2) * Math.cos(a), y + (s - 2) * Math.sin(a)); }
      g.closePath();
      if (v > .04){ g.fillStyle = `rgba(79,227,255,${f1(v * .22)})`; g.fill(); }
      g.strokeStyle = `rgba(79,227,255,${f1(.07 + v * .8)})`; g.stroke();
    }
  }
});
