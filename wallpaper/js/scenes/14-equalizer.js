// Scene 14: Equalizer: real spectrum of whatever is playing (scp-audioviz writes audio.json)
'use strict';

// 14. Equalizer: real spectrum of whatever is playing (scp-audioviz writes audio.json)
SCENES.push({
  name: 'Equalizer', accent: '#7aa8ff', swatch: 'linear-gradient(90deg,#4fe3ff,#8a5cff,#ff4fa8)',
  mount(seed){ this.seed = seed % 1000; return '<canvas id="cv"></canvas>'; },
  after(){
    cvInit(this, .9);
    const n = 72; this.n = n; this.lv = new Float32Array(n); this.tg = new Float32Array(n); this.pk = new Float32Array(n); this.pv = new Float32Array(n);
    this.live = false; this.level = 0; this.bass = 0; this.run = true;
    const poll = () => {
      if (!this.run) return;
      xhr(PATHS.audio, d => {
        this.live = !!(d && d.b && d.b.length === n && Date.now() - d.t < 1500);
        if (this.live) this.tg.set(d.b); else this.tg.fill(0);
        if (this.run) this.timer = setTimeout(poll, 33);
      });
    };
    poll();
  },
  unmount(){ this.run = false; clearTimeout(this.timer); },
  tick(t, dt){
    const g = this.g, w = this.w, h = this.h, n = this.n, S = this.seed, bw = w * .8 / n, x0 = w * .1, cy = h * .74, maxH = h * .36;
    let sum = 0, bass = 0;
    for (let i = 0; i < n; i++){
      const tg = this.tg[i], v = this.lv[i];
      this.lv[i] = tg > v ? v + (tg - v) * .7 : v + (tg - v) * .22;                 // quick rise, softer fall
      if (this.lv[i] >= this.pk[i]){ this.pk[i] = this.lv[i]; this.pv[i] = 0; }     // peak caps fall with gravity
      else { this.pv[i] += dt * 1.4; this.pk[i] = Math.max(this.lv[i], this.pk[i] - this.pv[i] * dt); }
      sum += this.lv[i]; if (i < 9) bass += this.lv[i];
    }
    this.level += (sum / n - this.level) * .3; this.bass += (bass / 9 - this.bass) * .35;

    g.fillStyle = '#04050c'; g.fillRect(0, 0, w, h);
    const glow = g.createRadialGradient(w / 2, cy, 0, w / 2, cy, w * (.3 + this.bass * .35));
    glow.addColorStop(0, `rgba(122,168,255,${(.05 + this.bass * .4).toFixed(3)})`); glow.addColorStop(1, 'rgba(122,168,255,0)');
    g.fillStyle = glow; g.fillRect(0, 0, w, h);

    const grad = g.createLinearGradient(x0, 0, x0 + w * .8, 0); grad.addColorStop(0, '#4fe3ff'); grad.addColorStop(.55, '#8a5cff'); grad.addColorStop(1, '#ff4fa8');
    for (let i = 0; i < n; i++){
      const bh = 3 + Math.pow(this.lv[i], 1.15) * maxH, ph = 3 + Math.pow(this.pk[i], 1.15) * maxH, x = x0 + i * bw, bwid = bw * .66;
      g.fillStyle = grad; g.globalAlpha = .92; g.fillRect(x, cy - bh, bwid, bh);
      g.globalAlpha = .24; g.fillRect(x, cy + 4, bwid, bh * .55);
      g.globalAlpha = 1; g.fillStyle = '#eaf3ff'; g.fillRect(x, cy - ph - 6, bwid, 2);
    }
    g.lineWidth = 1.5;
    const amp = 6 + this.level * 70;
    for (let k = 0; k < 3; k++){
      g.strokeStyle = ['rgba(79,227,255,.5)', 'rgba(138,92,255,.4)', 'rgba(255,79,168,.35)'][k]; g.beginPath();
      for (let x = 0; x <= w; x += 16){ const y = h * .93 + Math.sin(x * (.006 + k * .002) + t * (.8 + k * .3) + S) * amp * (.5 + k * .25) + Math.sin(x * .017 - t) * 3; g[x ? 'lineTo' : 'moveTo'](x, y); }
      g.stroke();
    }
    if (!this.live){ g.font = '12px monospace'; g.fillStyle = 'rgba(234,243,255,.35)'; g.textAlign = 'center'; g.fillText('brak sygnału audio · scp-audioviz', w / 2, h * .5); g.textAlign = 'start'; }
  }
});
