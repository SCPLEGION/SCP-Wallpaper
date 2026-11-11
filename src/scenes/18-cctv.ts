// CCTV: four security camera feeds with grain, scanlines, timestamps, and a feed that drops out now and then
import { rng, hash1 } from '../core/util.ts';
import { cvInit } from '../core/draw.ts';
import { layer, MONO, SITES, clock, pad2 } from './scp.ts';
import type { Scene } from './types.ts';

const NAMES = ['KORYTARZ B', 'KOMORA 03', 'ŚLUZA', 'KLATKA SCHODOWA', 'MAGAZYN', 'LABORATORIUM 2'];

export default {
  id: 'cctv', name: 'Monitoring', accent: '#c9d4c5', swatch: 'linear-gradient(90deg,#2b302b 0 49%,#000 49% 51%,#20251f 51%)',
  mount({ el, seed }){
    el.innerHTML = '<canvas></canvas>';
    const cv = cvInit(el, .6), { g, w, h } = cv, r = rng(seed), site = SITES[seed % SITES.length];
    const gap = 6, cw = (w - gap * 3) / 2, ch = (h - gap * 3) / 2;
    const cells = [0, 1, 2, 3].map(i => ({ x: gap + (i % 2) * (cw + gap), y: gap + (i >> 1) * (ch + gap), cam: 1 + ((seed + i * 7) % 12), name: NAMES[(seed + i) % NAMES.length], kind: i }));
    // each feed: a grey room in one-point perspective, drawn once
    const rooms = layer(cv, b => {
      b.fillStyle = '#000'; b.fillRect(0, 0, w, h);
      for (const c of cells){
        b.save(); b.beginPath(); b.rect(c.x, c.y, cw, ch); b.clip();
        const gr = b.createLinearGradient(0, c.y, 0, c.y + ch); gr.addColorStop(0, '#2a2e2a'); gr.addColorStop(1, '#121512'); b.fillStyle = gr; b.fillRect(c.x, c.y, cw, ch);
        const vx = c.x + cw * (.35 + r() * .3), vy = c.y + ch * (.38 + r() * .15), bw = cw * (.18 + r() * .12), bh = ch * (.22 + r() * .1);
        b.fillStyle = '#0d0f0d'; b.fillRect(vx - bw / 2, vy - bh / 2, bw, bh);
        b.strokeStyle = 'rgba(200,210,195,.22)'; b.lineWidth = 1.2; b.strokeRect(vx - bw / 2, vy - bh / 2, bw, bh);
        for (const [cx2, cy2, ex, ey] of [[-1, -1, c.x, c.y], [1, -1, c.x + cw, c.y], [-1, 1, c.x, c.y + ch], [1, 1, c.x + cw, c.y + ch]]){ b.beginPath(); b.moveTo(vx + cx2 * bw / 2, vy + cy2 * bh / 2); b.lineTo(ex, ey); b.stroke(); }
        b.strokeStyle = 'rgba(200,210,195,.08)';
        for (let k = 1; k < 7; k++){ const f = k / 7, x0 = vx - bw / 2 + (c.x - (vx - bw / 2)) * f, x1 = vx + bw / 2 + (c.x + cw - (vx + bw / 2)) * f, y1 = vy + bh / 2 + (c.y + ch - (vy + bh / 2)) * f; b.beginPath(); b.moveTo(x0, y1); b.lineTo(x1, y1); b.stroke(); }
        if (c.kind === 1){ b.fillStyle = 'rgba(150,160,150,.25)'; b.fillRect(vx - bw * .12, vy + bh * .05, bw * .24, bh * .45); }
        const lg = b.createRadialGradient(c.x + cw / 2, c.y + ch / 2, ch * .2, c.x + cw / 2, c.y + ch / 2, cw * .7); lg.addColorStop(0, 'rgba(0,0,0,0)'); lg.addColorStop(1, 'rgba(0,0,0,.65)'); b.fillStyle = lg; b.fillRect(c.x, c.y, cw, ch);
        b.restore();
      }
      b.fillStyle = 'rgba(0,0,0,.22)'; for (let y = 0; y < h; y += 3) b.fillRect(0, y, w, 1);
    });
    // grain: a few small noise tiles stretched over the feeds
    const grain = Array.from({ length: 4 }, () => { const c = document.createElement('canvas'); c.width = 240; c.height = 135; const x = c.getContext('2d')!, d = x.createImageData(240, 135);
      for (let i = 0; i < d.data.length; i += 4){ const v = r() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); return c; });
    const fs = Math.max(11, Math.round(h * .017));
    return {
      soft: cv.soft,
      tick(t){
        g.drawImage(rooms, 0, 0, w, h);
        g.globalAlpha = .07; g.drawImage(grain[Math.floor(t * 12) % 4], 0, 0, w, h); g.globalAlpha = 1;
        const now = new Date(), slot = Math.floor(t / 9);
        g.font = `${fs}px ${MONO}`; g.textAlign = 'left';
        cells.forEach((c, i) => {
          // one feed drops out for ~2 s every few slots
          if (hash1(slot, seed + i) < .12 && t % 9 < 2.2){ g.drawImage(grain[(Math.floor(t * 20) + i) % 4], c.x, c.y, cw, ch); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(c.x, c.y + ch / 2 - fs * 1.5, cw, fs * 3); g.fillStyle = '#e8eee6'; g.textAlign = 'center'; g.fillText('NO SIGNAL', c.x + cw / 2, c.y + ch / 2 + fs * .35); g.textAlign = 'left'; return; }
          const y0 = c.y + fs * 1.6; g.fillStyle = 'rgba(232,238,230,.85)';
          g.fillText(`CAM ${pad2(c.cam)} · ${c.name}`, c.x + fs, y0);
          g.fillText(`${site}  ${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())} ${clock(now)}`, c.x + fs, c.y + ch - fs);
          if (Math.floor(t * 1.2) % 2){ g.fillStyle = '#ff3a2e'; g.beginPath(); g.arc(c.x + cw - fs * 3.6, y0 - fs * .35, fs * .35, 0, 6.283); g.fill(); }
          g.fillStyle = 'rgba(232,238,230,.85)'; g.fillText('REC', c.x + cw - fs * 3, y0);
          g.strokeStyle = 'rgba(232,238,230,.4)'; g.lineWidth = 1; const m = fs * 1.4, L = fs * 1.5;
          for (const [px, py, sx, sy] of [[c.x + m, c.y + m * 2.2, 1, 1], [c.x + cw - m, c.y + m * 2.2, -1, 1], [c.x + m, c.y + ch - m * 2, 1, -1], [c.x + cw - m, c.y + ch - m * 2, -1, -1]]){ g.beginPath(); g.moveTo(px, py + sy * L); g.lineTo(px, py); g.lineTo(px + sx * L, py); g.stroke(); }
        });
        // rolling bar
        const ry = (t * 60) % (h + 120) - 60; g.fillStyle = 'rgba(255,255,255,.035)'; g.fillRect(0, ry, w, 60);
      },
    };
  },
} satisfies Scene;
