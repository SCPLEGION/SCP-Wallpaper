// Scene 13: Globe: rotating wireframe with links
'use strict';

// 13. Globe: rotating wireframe with links
SCENES.push({
  name: 'Glob', accent: '#58b8ff', swatch: 'radial-gradient(circle at 60% 50%,#1a5fa0 0 30%,#06101e 31%)',
  mount(seed){ this.seed = seed; return '<canvas id="cv"></canvas>'; },
  after(){
    cvInit(this, .9); const r = rng(this.seed);
    this.pts = Array.from({ length: 170 }, () => ({ la: Math.asin(r() * 2 - 1), lo: r() * 6.283, s: .7 + r() * 1.6 }));
    this.links = Array.from({ length: 12 }, () => [Math.floor(r() * 170), Math.floor(r() * 170)]);
    this.tilt = .35 + r() * .25;
  },
  tick(t){
    const g = this.g, w = this.w, h = this.h, cx = w * .62, cy = h * .5, R = h * .36, rot = t * .18, ti = this.tilt, B = '88,184,255';
    g.fillStyle = '#030811'; g.fillRect(0, 0, w, h);
    const grd = g.createRadialGradient(cx, cy, R * .6, cx, cy, R * 1.5); grd.addColorStop(0, `rgba(${B},.16)`); grd.addColorStop(1, `rgba(${B},0)`); g.fillStyle = grd; g.fillRect(0, 0, w, h);
    const P = (la, lo) => { // lat/lon -> screen, z = depth
      const x = Math.cos(la) * Math.sin(lo + rot), y = Math.sin(la), z = Math.cos(la) * Math.cos(lo + rot);
      return [cx + R * x, cy + R * (y * Math.cos(ti) - z * Math.sin(ti)), y * Math.sin(ti) + z * Math.cos(ti)];
    };
    g.lineWidth = 1;
    const line = (fn, n) => { let prev = fn(0); for (let i = 1; i <= n; i++){ const p = fn(i / n); g.strokeStyle = `rgba(${B},${p[2] > 0 ? .5 : .14})`; g.beginPath(); g.moveTo(prev[0], prev[1]); g.lineTo(p[0], p[1]); g.stroke(); prev = p; } };
    for (let lo = 0; lo < 360; lo += 20) line(u => P(-1.5708 + u * 3.1416, rad(lo)), 40);
    for (let la = -60; la <= 60; la += 20) line(u => P(rad(la), u * 6.2832), 72);
    g.strokeStyle = `rgba(${B},.35)`; g.beginPath(); g.arc(cx, cy, R, 0, 6.2832); g.stroke();
    for (let i = 0; i < 3; i++){ g.strokeStyle = `rgba(${B},${.22 - i * .05})`; g.setLineDash([2, 10]); g.beginPath(); g.ellipse(cx, cy, R * (1.18 + i * .16), R * (1.18 + i * .16) * .32, rad(-18 + i * 9) + t * .02, 0, 6.2832); g.stroke(); g.setLineDash([]); }
    for (const [a, b] of this.links){
      const A = this.pts[a], Bp = this.pts[b], p = P(A.la, A.lo), q = P(Bp.la, Bp.lo); if (p[2] < 0 || q[2] < 0) continue;
      const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2 - R * .28;
      g.strokeStyle = `rgba(${B},.55)`; g.beginPath(); g.moveTo(p[0], p[1]); g.quadraticCurveTo(mx, my, q[0], q[1]); g.stroke();
      const u = (t * .25 + a * .13) % 1, ix = (1 - u) * (1 - u) * p[0] + 2 * (1 - u) * u * mx + u * u * q[0], iy = (1 - u) * (1 - u) * p[1] + 2 * (1 - u) * u * my + u * u * q[1];
      g.fillStyle = '#e8f6ff'; g.beginPath(); g.arc(ix, iy, 2.4, 0, 6.2832); g.fill();
    }
    for (const q of this.pts){ const p = P(q.la, q.lo); g.fillStyle = `rgba(${p[2] > 0 ? '220,240,255' : B},${p[2] > 0 ? .9 : .25})`; g.beginPath(); g.arc(p[0], p[1], q.s * (p[2] > 0 ? 1 : .7), 0, 6.2832); g.fill(); }
  }
});
