// CCTV: security desk. One large feed in the centre (a corridor in perspective, a figure that walks toward the camera
// and gets tracked), four live thumbnails under it; grain, scanlines and timestamps on every feed.
import { rng } from '../core/util.ts';
import { deck, layer, blit, PRESET, MONO, clock } from './scp.ts';
import type { Scene, SceneRun } from './types.ts';

const CAMS = ['KORYTARZ B · POZIOM -2', 'KOMORA 03 · ŚLUZA', 'MAGAZYN · DOK 4', 'LABORATORIUM 2', 'KORYTARZ D · POZIOM -4'];

export default {
  id: 'cctv', pack: 'scp', name: 'Monitoring', accent: '#a6e3b4', hud: true, preset: PRESET,
  swatch: 'linear-gradient(135deg,#1d2620 0 48%,#0a0d0b 48% 52%,#262f29 52%)',
  mount({ el, seed }){
    const { cv, g, w, h, cx, cy, R, A, dpr } = deck(el, { rgb: '166,227,180', left: 'SITE-19 · SECURITY CONTROL', right: 'REC · 24 KAMERY', bg: ['#141b17', '#0a0d0b', '#040505'] });
    const r = rng(seed);
    // main feed and the thumbnail strip, all inside the stage between the widget columns
    const mw = R * 2.75, mh = mw * .58, mx = cx - mw / 2, my = cy - R * 1.12;
    const tw = (mw - 18) / 4, th = tw * .58, ty = my + mh + 16;
    // a corridor in one-point perspective, drawn once per camera into a full-size layer at (x, y, cw, ch)
    const corridor = (b: CanvasRenderingContext2D, x: number, y: number, cw: number, ch: number, k: number) => {
      const vx = x + cw * (.42 + k * .16), vy = y + ch * .45, ix = cw * .07, iy = ch * .1;
      b.save(); b.beginPath(); b.rect(x, y, cw, ch); b.clip();
      const fl = b.createLinearGradient(0, vy, 0, y + ch); fl.addColorStop(0, '#1c221e'); fl.addColorStop(1, '#4a554d'); b.fillStyle = fl; b.fillRect(x, y, cw, ch);
      const ce = b.createLinearGradient(0, y, 0, vy); ce.addColorStop(0, '#2c342f'); ce.addColorStop(1, '#141916'); b.fillStyle = ce;
      b.beginPath(); b.moveTo(x, y); b.lineTo(x + cw, y); b.lineTo(vx + ix, vy - iy); b.lineTo(vx - ix, vy - iy); b.fill();
      for (const s of [-1, 1]){ b.fillStyle = s < 0 ? '#29302b' : '#202622'; b.beginPath(); b.moveTo(s < 0 ? x : x + cw, y); b.lineTo(vx + s * ix, vy - iy); b.lineTo(vx + s * ix, vy + iy); b.lineTo(s < 0 ? x : x + cw, y + ch); b.fill(); }
      b.fillStyle = '#060807'; b.fillRect(vx - ix, vy - iy, ix * 2, iy * 2);
      // ceiling lights, wall pillars and doors receding toward the far wall
      for (let d = 0; d < 7; d++){
        const f = 1 / (1 + d * .9), hx = ix + (cw * .5 - ix) * f, top = vy - iy - (vy - iy - y) * f, bot = vy + iy + (y + ch - vy - iy) * f;
        b.fillStyle = `rgba(225,245,230,${.15 + f * .6})`; b.fillRect(vx - hx * .12, top + 3 * f, hx * .24, 2 + 5 * f);
        const lg = b.createRadialGradient(vx, bot - (bot - vy) * .1, 0, vx, bot - (bot - vy) * .1, hx * .5); lg.addColorStop(0, `rgba(200,230,210,${.12 * f})`); lg.addColorStop(1, 'rgba(200,230,210,0)'); b.fillStyle = lg; b.fillRect(vx - hx, vy, hx * 2, bot - vy);
        for (const s of [-1, 1]){
          const px = vx + s * hx; b.strokeStyle = `rgba(0,0,0,${.25 + f * .3})`; b.lineWidth = 1 + 3 * f; b.beginPath(); b.moveTo(px, top); b.lineTo(px, bot); b.stroke();
          if ((d + (s > 0 ? 1 : 0) + Math.round(k * 3)) % 3 === 0 && d < 6){ const f2 = 1 / (1 + (d + .5) * .9), hx2 = ix + (cw * .5 - ix) * f2, t2 = vy - iy - (vy - iy - y) * f2 * .55, b2 = vy + iy + (y + ch - vy - iy) * f2;
            b.fillStyle = 'rgba(8,10,9,.55)'; b.beginPath(); b.moveTo(vx + s * hx * .97, top + (bot - top) * .3); b.lineTo(vx + s * hx2 * 1.02, t2 + (b2 - t2) * .3); b.lineTo(vx + s * hx2 * 1.02, b2); b.lineTo(vx + s * hx * .97, bot); b.fill(); }
        }
      }
      b.lineWidth = 1;
      b.restore();
    };
    const cams = [0, 1, 2, 3, 4].map(i => (i + Math.floor(r() * 5)) % 5);
    const feeds = layer(cv, b => {
      corridor(b, mx, my, mw, mh, .5);
      for (let i = 0; i < 4; i++) corridor(b, mx + i * (tw + 6), ty, tw, th, (i * .37) % 1);
    });
    // grain: a few noise tiles, picked at random each frame
    const tiles = Array.from({ length: 4 }, () => { const c = document.createElement('canvas'); c.width = 256; c.height = 256; const b = c.getContext('2d')!, d = b.createImageData(256, 256);
      for (let i = 0; i < d.data.length; i += 4){ const v = r() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 26; } b.putImageData(d, 0, 0); return g.createPattern(c, 'repeat')!; });
    const scan = layer(cv, b => { b.fillStyle = 'rgba(0,0,0,.22)'; for (let y = my; y < ty + th; y += 3) b.fillRect(mx, y, mw, 1);
      const v = b.createRadialGradient(cx, my + mh / 2, mh * .3, cx, my + mh / 2, mw * .65); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); b.fillStyle = v; b.fillRect(mx, my, mw, mh); });
    let walk = r() * 14, sel = 0;
    const run: SceneRun = { soft: false, tick };
    function tick(t: number, dt: number){
      const bx0 = mx - 12, by0 = my - 12, bw0 = mw + 24, bh0 = ty + th + 32 - by0;
      g.clearRect(bx0, by0, bw0, bh0);
      blit(g, feeds, dpr, bx0, by0, bw0, bh0);
      // the walker: a silhouette growing as it nears the camera, every ~14 s
      walk = (walk + dt) % 14; const u = walk / 9;
      if (u < 1){
        const z = .08 + u * u * .9, fx = cx + Math.sin(t * .9) * mw * .03 * z, fh = mh * .85 * z, fy = my + mh * .45 + mh * .55 * z;
        g.fillStyle = 'rgba(4,6,5,.92)'; g.beginPath(); g.ellipse(fx, fy - fh * .88, fh * .07, fh * .09, 0, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.moveTo(fx - fh * .12, fy - fh * .78); g.lineTo(fx + fh * .12, fy - fh * .78); g.lineTo(fx + fh * .09, fy); g.lineTo(fx - fh * .09, fy); g.fill();
        // tracking box
        const bx = fx - fh * .2, by = fy - fh, bw = fh * .4;
        g.strokeStyle = `rgba(${A},.9)`; g.lineWidth = 1.5; const c = bw * .25;
        for (const [px, py, sx, sy] of [[bx, by, 1, 1], [bx + bw, by, -1, 1], [bx, by + fh, 1, -1], [bx + bw, by + fh, -1, -1]]){ g.beginPath(); g.moveTo(px + sx * c, py); g.lineTo(px, py); g.lineTo(px, py + sy * c); g.stroke(); }
        g.lineWidth = 1; g.font = `11px ${MONO}`; g.fillStyle = `rgba(${A},.95)`; g.fillText(`RUCH · ID ${(seed % 900) + 100} · ${(1 - u).toFixed(2)} m/s`, bx, by - 6);
      }
      g.save(); g.beginPath(); g.rect(mx, my, mw, mh); g.rect(mx, ty, mw, th); g.clip();
      g.fillStyle = tiles[Math.floor(t * 24) % 4]; g.translate(Math.floor(t * 97) % 256, Math.floor(t * 61) % 256);
      g.fillRect(mx - 256, my - 256, mw + 256, ty + th - my + 256); g.restore();
      blit(g, scan, dpr, mx, my, mw, ty + th - my);
      // frames, labels, REC
      g.strokeStyle = `rgba(${A},.6)`; g.strokeRect(mx - .5, my - .5, mw + 1, mh + 1);
      g.strokeStyle = `rgba(${A},.2)`; g.strokeRect(mx - 8.5, my - 8.5, mw + 17, mh + 17);
      g.font = `12px ${MONO}`; g.fillStyle = `rgba(${A},.9)`; g.fillText(`CAM ${String(cams[0] * 7 + 1).padStart(2, '0')} · ${CAMS[cams[0]]}`, mx + 14, my + 22);
      g.textAlign = 'right'; g.fillText(`${new Date().toISOString().slice(0, 10)} ${clock()}`, mx + mw - 14, my + mh - 14);
      if (Math.floor(t * 1.5) % 2){ g.fillStyle = '#ff4a3a'; g.beginPath(); g.arc(mx + mw - 58, my + 18, 5, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = `rgba(${A},.9)`; g.fillText('REC', mx + mw - 14, my + 22); g.textAlign = 'left';
      sel = Math.floor(t / 5) % 4;
      for (let i = 0; i < 4; i++){
        const x = mx + i * (tw + 6), lost = (Math.floor(t / 3) + i * 5) % 17 === 0;
        if (lost){ g.fillStyle = '#0b0e0c'; g.fillRect(x, ty, tw, th); g.fillStyle = `rgba(${A},.7)`; g.textAlign = 'center'; g.fillText('BRAK SYGNAŁU', x + tw / 2, ty + th / 2 + 4); g.textAlign = 'left'; }
        g.strokeStyle = `rgba(${A},${i === sel ? .9 : .35})`; g.strokeRect(x + .5, ty + .5, tw - 1, th - 1);
        g.font = `10px ${MONO}`; g.fillStyle = `rgba(${A},.75)`; g.fillText(`CAM ${String(cams[i + 1] * 7 + 3).padStart(2, '0')}`, x + 6, ty + 14);
      }
      g.font = `11px ${MONO}`; g.textAlign = 'center'; g.fillStyle = `rgba(${A},.5)`; g.fillText('ROTACJA KAMER CO 5 s · NAGRYWANIE CIĄGŁE · ARCHIWUM 30 DNI', cx, ty + th + 22); g.textAlign = 'left';
    }
    return run;
  },
} satisfies Scene;
