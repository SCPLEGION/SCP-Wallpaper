// Scene 11: Data stream: falling glyph columns
'use strict';

// 11. Data stream: falling glyph columns
SCENES.push({
  name: 'Strumień', accent: '#5dffc8', swatch: 'linear-gradient(#010806,#0b5c3f)',
  mount(seed){ this.seed = seed; return '<canvas id="cv"></canvas>'; },
  after(){
    cvInit(this, 1); const r = rng(this.seed); this.fs = 16; this.n = Math.ceil(this.w / this.fs);
    this.y = Array.from({ length: this.n }, () => r() * -60); this.v = Array.from({ length: this.n }, () => .25 + r() * .6);
    this.g.fillStyle = '#010806'; this.g.fillRect(0, 0, this.w, this.h); this.acc = 0;
  },
  tick(t, dt){
    const g = this.g, fs = this.fs, CH = '01ABCDEF<>/|=+*#:;';
    this.acc += dt; if (this.acc < .04) return; this.acc = 0;
    g.fillStyle = 'rgba(1,8,6,.13)'; g.fillRect(0, 0, this.w, this.h);
    g.font = fs + 'px monospace';
    for (let i = 0; i < this.n; i++){
      const y = this.y[i], ch = CH[(Math.random() * CH.length) | 0];
      g.fillStyle = 'rgba(93,255,200,.55)'; g.fillText(ch, i * fs, (y - 1) * fs);
      g.fillStyle = '#e4fff6'; g.fillText(CH[(Math.random() * CH.length) | 0], i * fs, y * fs);
      this.y[i] += this.v[i] * 1.6; if (this.y[i] * fs > this.h + 40 && Math.random() > .97) this.y[i] = -Math.random() * 30;
    }
  }
});
