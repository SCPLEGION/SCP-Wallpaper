// Scene 15: Dashboard: Jarvis command centre. A shaded 3D globe (procedural continents, scanner, data arcs, orbiting satellites) under an SVG HUD frame; widgets sit on top
'use strict';

// 15. Dashboard: Jarvis command centre
SCENES.push({
  name: 'Dashboard', accent: '#4fe3ff', hud: true, curved: true, swatch: 'radial-gradient(circle at 50% 50%,#2fb7d8 0 22%,#0b3a4a 23% 40%,#02090e 41%)',
  preset: { on: ['clock', 'system', 'claude', 'calendar', 'progress'], layout: {
    clock: { x: .455, y: .925, s: .3 }, system: { x: .04, y: .30, s: .8 }, claude: { x: .04, y: .70, s: .8 }, calendar: { x: .78, y: .20, s: .8 }, progress: { x: .78, y: .60, s: .8 } } },
  mount(seed){
    this.seed = seed;
    const C = '#4fe3ff';
    const s = `<g font-family="monospace" fill="${C}"><text x="60" y="64" font-size="12" letter-spacing="7" fill-opacity=".6">SCP</text>
      <text x="${W - 60}" y="64" font-size="11" letter-spacing="5" text-anchor="end" fill-opacity=".45">ONLINE</text><circle class="hb" cx="${W - 150}" cy="60" r="3" fill="${C}"/></g>
      <style>.hb{animation:hb 1.6s steps(2) infinite}@keyframes hb{50%{opacity:.15}}</style>`;
    return '<canvas id="cv"></canvas>' + svg(s);
  },
  after(){
    cvInit(this, 1);
    const r = rng(this.seed), N = 9000, off = r() * 100;
    // 3D value noise -> continents. Land = top 36% of the noise field, so the coverage is the same for every seed.
    const h3 = (x, y, z) => { const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + off) * 43758.5453; return n - Math.floor(n); };
    const sm = t => t * t * (3 - 2 * t), lr = (a, b, t) => a + (b - a) * t;
    const vn = (x, y, z) => {
      const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z), u = sm(x - ix), v = sm(y - iy), w = sm(z - iz);
      const c = (a, b, d) => h3(ix + a, iy + b, iz + d);
      return lr(lr(lr(c(0, 0, 0), c(1, 0, 0), u), lr(c(0, 1, 0), c(1, 1, 0), u), v), lr(lr(c(0, 0, 1), c(1, 0, 1), u), lr(c(0, 1, 1), c(1, 1, 1), u), v), w);
    };
    const fb = (x, y, z) => vn(x * 1.6, y * 1.6, z * 1.6) * .55 + vn(x * 3.4, y * 3.4, z * 3.4) * .3 + vn(x * 7.1, y * 7.1, z * 7.1) * .15;
    const all = [];
    for (let i = 0; i < N; i++){   // Fibonacci sphere: even dot spacing
      const y = 1 - 2 * (i + .5) / N, rr = Math.sqrt(1 - y * y), a = i * 2.399963;
      const x = rr * Math.cos(a), z = rr * Math.sin(a); all.push({ x, y, z, n: fb(x, y, z) });
    }
    const thr = all.map(p => p.n).sort((a, b) => a - b)[Math.floor(N * .58)];
    this.land = all.filter(p => p.n > thr);
    // cities: well separated land points; arcs link neighbours in the list
    this.cities = [];
    for (let tries = 0; tries < 500 && this.cities.length < 15; tries++){
      const p = this.land[Math.floor(r() * this.land.length)];
      if (this.cities.every(c => c.x * p.x + c.y * p.y + c.z * p.z < .82)) this.cities.push({ x: p.x, y: p.y, z: p.z, ph: r() * 6.28,
        code: 'N-' + String(this.cities.length + 1).padStart(2, '0') + ' ' + String.fromCharCode(65 + Math.floor(r() * 26)) + String.fromCharCode(65 + Math.floor(r() * 26)) });
    }
    const nc = this.cities.length, ARC = 26;
    this.arcs = [];
    for (let k = 0; k < 6; k++){
      const a = this.cities[k % nc], b = this.cities[(k * 5 + 3) % nc]; if (a === b) continue;
      const dot = Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z)), om = Math.acos(dot), so = Math.sin(om) || 1, pts = [];
      for (let i = 0; i <= ARC; i++){
        const u = i / ARC, ka = Math.sin((1 - u) * om) / so, kb = Math.sin(u * om) / so, lift = 1 + Math.sin(u * Math.PI) * om * .16;
        pts.push([(a.x * ka + b.x * kb) * lift, (a.y * ka + b.y * kb) * lift, (a.z * ka + b.z * kb) * lift]);
      }
      this.arcs.push({ pts, sp: .12 + r() * .12, ph: r() });
    }
    this.orbits = [[1.3, .9, 0, 28, 1]].map(([rr, inc, node, per, dir]) => ({ rr, inc, node, per, dir, sats: 1, ph: r() * 6.28 }));
    this.tilt = .38; this.lvl = 0; this.run = true; this.live = false;
    const poll = () => {
      if (!this.run) return;
      xhr(PATHS.audio, d => {
        this.live = !!(d && d.b && Date.now() - d.t < 1500);
        this.tg = this.live ? d.b.slice(0, 12).reduce((a, b) => a + b, 0) / 12 : 0;
        if (this.run) this.timer = setTimeout(poll, 100);
      });
    };
    poll();
  },
  unmount(){ this.run = false; clearTimeout(this.timer); },
  tick(t){
    const g = this.g, w = this.w, h = this.h, cx = w * .5, cy = h * .53, R = Math.min(h * .31, w * .19), ti = this.tilt, ct = Math.cos(ti), st = Math.sin(ti);
    const rot = t * .12, cr = Math.cos(rot), sr = Math.sin(rot), A = '79,227,255';
    this.lvl += ((this.tg || 0) - this.lvl) * .25;
    const pulse = this.lvl, Rg = R * (1 + pulse * .025);
    // globe-space -> screen; rotation about Y by the spin, then the tilt about X
    const V = (x, y, z, k = 1) => { const X = x * cr + z * sr, Z = -x * sr + z * cr; return [cx + Rg * k * X, cy + Rg * k * (y * ct - Z * st), y * st + Z * ct]; };
    const F = (x, y, z) => { const X = x * cr + z * sr, Z = -x * sr + z * cr; return [X, y * ct - Z * st, y * st + Z * ct]; };   // same, unit vector
    const Tilt = (x, y, z, k) => [cx + Rg * k * x, cy + Rg * k * (y * ct - z * st), y * st + z * ct];                              // orbit plane: no spin
    g.setTransform(1, 0, 0, 1, 0, 0);
    const bg = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * .75); bg.addColorStop(0, '#06303f'); bg.addColorStop(.45, '#021019'); bg.addColorStop(1, '#010508');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    // orbit rings (back halves first: the globe disc then hides them)
    const orbitPt = (o, a) => { const x0 = Math.cos(a), z0 = Math.sin(a), y1 = -z0 * Math.sin(o.inc), z1 = z0 * Math.cos(o.inc), co = Math.cos(o.node), so = Math.sin(o.node); return Tilt(x0 * co + z1 * so, y1, -x0 * so + z1 * co, o.rr); };
    const drawOrbits = front => {
      for (const o of this.orbits){
        let prev = orbitPt(o, 0);
        for (let i = 1; i <= 90; i++){ const p = orbitPt(o, i / 90 * 6.2832); if ((p[2] >= 0) === front){ g.strokeStyle = `rgba(${A},${front ? .32 : .12})`; g.beginPath(); g.moveTo(prev[0], prev[1]); g.lineTo(p[0], p[1]); g.stroke(); } prev = p; }
        for (let k = 0; k < o.sats; k++){
          const a = o.ph + o.dir * t * 6.2832 / o.per + k * 3.1, p = orbitPt(o, a); if ((p[2] >= 0) !== front) continue;
          const tail = orbitPt(o, a - o.dir * .22); const gr = g.createLinearGradient(tail[0], tail[1], p[0], p[1]); gr.addColorStop(0, `rgba(${A},0)`); gr.addColorStop(1, `rgba(${A},.9)`);
          g.strokeStyle = gr; g.lineWidth = 2; g.beginPath(); g.moveTo(tail[0], tail[1]); g.lineTo(p[0], p[1]); g.stroke(); g.lineWidth = 1;
          g.fillStyle = '#e8fdff'; g.fillRect(p[0] - 3, p[1] - 3, 6, 6); g.strokeStyle = `rgba(${A},.8)`; g.strokeRect(p[0] - 7, p[1] - 7, 14, 14);
          g.font = '10px monospace'; g.fillStyle = `rgba(${A},.85)`; g.fillText('SAT-' + (this.orbits.indexOf(o) * 3 + k + 1).toString().padStart(2, '0'), p[0] + 12, p[1] + 3);
        }
      }
    };
    drawOrbits(false);
    // atmosphere + ocean disc
    const atm = g.createRadialGradient(cx, cy, Rg * .92, cx, cy, Rg * 1.28); atm.addColorStop(0, `rgba(${A},${.30 + pulse * .25})`); atm.addColorStop(.35, `rgba(${A},.09)`); atm.addColorStop(1, `rgba(${A},0)`);
    g.fillStyle = atm; g.beginPath(); g.arc(cx, cy, Rg * 1.28, 0, 6.2832); g.fill();
    const ocean = g.createRadialGradient(cx - Rg * .35, cy - Rg * .4, Rg * .1, cx, cy, Rg); ocean.addColorStop(0, '#0e6a85'); ocean.addColorStop(.6, '#07364a'); ocean.addColorStop(1, '#020c14');
    g.fillStyle = ocean; g.beginPath(); g.arc(cx, cy, Rg, 0, 6.2832); g.fill();
    // graticule
    const line = (fn, n, a0, a1) => { let prev = fn(0); for (let i = 1; i <= n; i++){ const p = fn(i / n); if (p[2] > 0 && prev[2] > 0){ g.strokeStyle = `rgba(${A},${a1})`; g.beginPath(); g.moveTo(prev[0], prev[1]); g.lineTo(p[0], p[1]); g.stroke(); } prev = p; } };
    for (let lo = 0; lo < 360; lo += 15) line(u => { const la = -1.5708 + u * 3.1416, lo2 = rad(lo); return V(Math.cos(la) * Math.sin(lo2), Math.sin(la), Math.cos(la) * Math.cos(lo2)); }, 36, 0, .05);
    for (let la = -75; la <= 75; la += 15) line(u => { const l = rad(la), o = u * 6.2832; return V(Math.cos(l) * Math.sin(o), Math.sin(l), Math.cos(l) * Math.cos(o)); }, 72, 0, la === 0 ? .12 : .05);
    // continents: lit dots, scanner highlight (a latitude band sweeping the globe)
    const ys = Math.sin(t * .33) * .92;
    for (const p of this.land){
      const q = F(p.x, p.y, p.z); if (q[2] <= 0) continue;
      const lit = Math.max(0, q[0] * -.45 + q[1] * -.5 + q[2] * .75), d = Math.abs(p.y - ys), sc = d < .035 ? 1 - d / .035 : 0;
      g.fillStyle = sc > 0 ? `rgba(220,252,255,${.55 + sc * .45})` : `rgba(${A},${.3 + lit * .6 + pulse * .12})`;
      const sz = 1.6 + q[2] * 1.5 + sc * 1.8; g.fillRect(cx + Rg * q[0] - sz / 2, cy + Rg * q[1] - sz / 2, sz, sz);
    }
    const sl = Math.asin(ys); line(u => { const o = u * 6.2832; return V(Math.cos(sl) * Math.sin(o), Math.sin(sl), Math.cos(sl) * Math.cos(o)); }, 90, 0, .6);
    // data arcs with travelling packets
    for (const a of this.arcs){
      const P = a.pts.map(q => V(q[0], q[1], q[2]));
      g.strokeStyle = `rgba(${A},.4)`; let pen=false; g.beginPath(); pen = false;
      for (const p of P){ if (p[2] < -.05){ pen = false; continue; } pen ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); pen = true; } g.stroke();
      const u = (t * a.sp + a.ph) % 1, i = Math.floor(u * (P.length - 1)), p = P[i];
      if (p[2] > 0){ const gl = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], 9); gl.addColorStop(0, 'rgba(235,254,255,.95)'); gl.addColorStop(1, `rgba(${A},0)`); g.fillStyle = gl; g.beginPath(); g.arc(p[0], p[1], 9, 0, 6.2832); g.fill(); }
    }
    // city beacons; the one nearest the view centre gets a callout
    let best = null, bz = .35;
    for (const c of this.cities){
      const q = F(c.x, c.y, c.z); if (q[2] <= .02) continue;
      const x = cx + Rg * q[0], y = cy + Rg * q[1], k = (t * .6 + c.ph) % 1;
      g.fillStyle = '#eafdff'; g.beginPath(); g.arc(x, y, 2.6, 0, 6.2832); g.fill();
      g.strokeStyle = `rgba(${A},${(1 - k) * .8})`; g.beginPath(); g.arc(x, y, 3 + k * 16, 0, 6.2832); g.stroke();
      if (q[2] > bz){ bz = q[2]; best = [x, y, c]; }
    }
    if (best){
      const [x, y, c] = best, lat = Math.asin(c.y) * 57.3, lon = Math.atan2(c.x, c.z) * 57.3, ex = cx + Rg * 1.14, ey = y - Rg * .32;
      g.strokeStyle = `rgba(${A},.85)`; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 24, ey); g.lineTo(ex, ey); g.stroke(); g.strokeRect(x - 9, y - 9, 18, 18);
      g.fillStyle = `rgba(${A},.9)`; g.font = '13px monospace'; g.fillText(c.code, ex + 8, ey - 7);
    }
    // limb highlight + terminator shade
    const sh = g.createRadialGradient(cx - Rg * .45, cy - Rg * .5, Rg * .2, cx + Rg * .25, cy + Rg * .3, Rg * 1.15); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(1,6,10,.32)');
    g.fillStyle = sh; g.beginPath(); g.arc(cx, cy, Rg, 0, 6.2832); g.fill();
    g.strokeStyle = `rgba(${A},.75)`; g.lineWidth = 1.5; g.beginPath(); g.arc(cx, cy, Rg, 0, 6.2832); g.stroke(); g.lineWidth = 1;
    drawOrbits(true);
    // thin limb ring + the two rails the widgets hug (Rc), drawn as tick arcs
    g.strokeStyle = `rgba(${A},.22)`; g.beginPath(); g.arc(cx, cy, Rg * 1.07, 0, 6.2832); g.stroke();
    const Rc = Rg * 1.5; this.geo = { cx, cy, Rc };
    for (const side of [-1, 1]){
      const mid = side < 0 ? Math.PI : 0, span = .62;
      g.strokeStyle = `rgba(${A},.55)`; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, Rc, mid - span, mid + span); g.stroke(); g.lineWidth = 1;
      g.strokeStyle = `rgba(${A},.25)`; g.beginPath(); g.arc(cx, cy, Rc + 9, mid - span - .05, mid + span + .05); g.stroke();
      for (let i = -24; i <= 24; i++){ const a = mid + i * span / 24, L = i % 6 ? 4 : 9, c = Math.cos(a), sn = Math.sin(a); g.strokeStyle = `rgba(${A},${i % 6 ? .25 : .5})`; g.beginPath(); g.moveTo(cx + (Rc + 9) * c, cy + (Rc + 9) * sn); g.lineTo(cx + (Rc + 9 + L) * c, cy + (Rc + 9 + L) * sn); g.stroke(); }
    }
    g.textAlign = 'start';
  }
});
