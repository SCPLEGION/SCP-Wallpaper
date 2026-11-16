// SCiPNET: an amber CRT terminal set into the console, typing out a session on the Foundation network. The screen
// curves (vignette + scanlines), glows onto the desk, and a link-activity strip runs along its bottom bezel.
import { rng } from '../core/util.ts';
import { hexs } from '../core/draw.ts';
import { deck, layer, blit, emblem, halo, PRESET, MONO, SITES, CLASSES, clock } from './scp.ts';
import type { Scene, SceneRun } from './types.ts';

export default {
  id: 'scipnet', pack: 'scp', name: 'SCiPNET', accent: '#ffb347', hud: true, preset: PRESET, swatch: 'linear-gradient(#140c02,#050301)',
  mount({ el, seed }){
    const { cv, g, w, h, cx, R, A, dpr } = deck(el, { rgb: '255,179,71', left: 'SCiPNET · SECURE FOUNDATION NETWORK', right: 'POŁĄCZENIE SZYFROWANE', bg: ['#22160a', '#0f0a04', '#050301'] });
    const r = rng(seed);
    const pw = R * 2.4, ph = h * .7, px = cx - pw / 2, py = h * .11, bz = 18, sx = px + bz, sy = py + bz, sw = pw - bz * 2, sh = ph - bz * 2 - 26;
    const fs = Math.max(12, Math.round(sw * .016)), lh = fs * 1.5, x0 = sx + fs * 2, top = sy + fs * 6.2, rows = Math.floor((sh - fs * 7.5) / lh);
    const script = (): string[] => {
      const n = 1000 + Math.floor(r() * 7000), site = SITES[Math.floor(r() * SITES.length)];
      return [
        `> login --user ${['jkowalski', 'agent.nowak', 'dr.wisniewska', 'o5-██'][Math.floor(r() * 4)]}`, 'password: ********', `ACCESS GRANTED · CLEARANCE LEVEL ${2 + Math.floor(r() * 3)}`, '',
        `> query SCP-${n} --summary`, `ITEM: SCP-${n}`, `CLASS: ${CLASSES[Math.floor(r() * 4)]}`, `LOCATION: ${site}, ARMED CONTAINMENT UNIT ${Math.floor(r() * 40)}`, 'DESCRIPTION: [DATA EXPUNGED]', '',
        `> ping ${site.toLowerCase()}.scip.net`, `reply from ${site.toLowerCase()}: time=${8 + Math.floor(r() * 30)} ms`, '',
        '> dump --memetic-filter=on', hexs(r, 8), hexs(r, 8), hexs(r, 8), '',
        `> status ${site.toLowerCase()} --sectors`, ...[1, 2, 3, 4].map(s => `SECTOR ${s} ......... ${r() < .85 ? 'NOMINAL' : 'ANOMALOUS ACTIVITY'}`), '',
        '> logout', 'SESSION CLOSED. REMEMBER: SECURE, CONTAIN, PROTECT.', '', '',
      ];
    };
    let queue = script(), buf: string[] = [], cur = '', ci = 0, wait = 0;
    const advance = () => {
      const line = queue[0] ?? '';
      if (line.startsWith('>') && ci < line.length){ cur = line.slice(0, ++ci); wait = .04 + r() * .06; }
      else { buf.push(line); queue.shift(); cur = ''; ci = 0; wait = line.startsWith('>') ? .5 : line ? .12 + r() * .25 : .6; if (!queue.length) queue = script(); }
      if (buf.length > rows - 1) buf = buf.slice(-(rows - 1));
    };
    // start mid-session, not on an empty screen
    for (let i = 0, n = 60 + Math.floor(r() * 200); i < n; i++) advance();
    const bezel = layer(cv, b => {
      halo(b, cx, py + ph * .5, pw * .3, pw * .6, A, .12);
      b.shadowColor = 'rgba(0,0,0,.8)'; b.shadowBlur = 40; b.shadowOffsetY = 12;
      const bg = b.createLinearGradient(px, py, px, py + ph); bg.addColorStop(0, '#2b241b'); bg.addColorStop(1, '#14100b'); b.fillStyle = bg; b.beginPath(); b.roundRect(px, py, pw, ph, 16); b.fill();
      b.shadowColor = 'transparent'; b.shadowBlur = 0; b.shadowOffsetY = 0;
      b.strokeStyle = 'rgba(255,220,170,.12)'; b.beginPath(); b.roundRect(px + .5, py + .5, pw - 1, ph - 1, 16); b.stroke();
      const sc = b.createRadialGradient(sx + sw / 2, sy + sh / 2, 0, sx + sw / 2, sy + sh / 2, sw * .7); sc.addColorStop(0, '#1f1405'); sc.addColorStop(1, '#070401');
      b.fillStyle = sc; b.beginPath(); b.roundRect(sx, sy, sw, sh, 22); b.fill();
      emblem(b, x0 + fs * 1.4, sy + fs * 2.6, fs * 1.4, `rgba(${A},.9)`, '#1a1104');
      b.font = `700 ${Math.round(fs * 1.2)}px ${MONO}`; b.fillStyle = `rgba(${A},.95)`; b.fillText('SCiPNET', x0 + fs * 3.6, sy + fs * 2.4);
      b.font = `${Math.round(fs * .8)}px ${MONO}`; b.fillStyle = `rgba(${A},.55)`; b.fillText('SECURE FOUNDATION NETWORK · TERMINAL 0x' + (seed >>> 0).toString(16).slice(0, 4).toUpperCase(), x0 + fs * 3.6, sy + fs * 3.6);
      b.fillStyle = `rgba(${A},.25)`; b.fillRect(x0, sy + fs * 4.6, sw - fs * 4, 1);
      b.font = `600 10px ${MONO}`; b.fillStyle = 'rgba(255,220,170,.35)'; b.fillText('FOUNDATION SYSTEMS · MODEL 7 · RT-4471', px + bz + 4, py + ph - 12);
      b.fillStyle = '#3a2f22'; for (let i = 0; i < 3; i++){ b.beginPath(); b.arc(px + pw - bz - 14 - i * 22, py + ph - 16, 6, 0, Math.PI * 2); b.fill(); }
    });
    const scan = layer(cv, b => {
      b.save(); b.beginPath(); b.roundRect(sx, sy, sw, sh, 22); b.clip();
      b.fillStyle = 'rgba(0,0,0,.28)'; for (let y = sy; y < sy + sh; y += 3) b.fillRect(sx, y, sw, 1);
      const v = b.createRadialGradient(sx + sw / 2, sy + sh / 2, sh * .35, sx + sw / 2, sy + sh / 2, sw * .62); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.65)'); b.fillStyle = v; b.fillRect(sx, sy, sw, sh);
      const gl = b.createLinearGradient(sx, sy, sx + sw * .4, sy + sh * .5); gl.addColorStop(0, 'rgba(255,240,220,.06)'); gl.addColorStop(1, 'rgba(255,240,220,0)'); b.fillStyle = gl; b.fillRect(sx, sy, sw, sh);
      b.restore();
    });
    const led = Array.from({ length: 48 }, () => r());
    const run: SceneRun = { soft: false, tick };
    function tick(t: number, dt: number){
      // type: commands ~25 chars/s, output lines appear whole after a short pause
      wait -= dt;
      if (wait <= 0) advance();
      const bx0 = cx - pw * .6, by0 = Math.max(0, py + ph / 2 - pw * .6), bw0 = pw * 1.2, bh0 = Math.min(h - by0, pw * 1.2);
      g.clearRect(bx0, by0, bw0, bh0);
      blit(g, bezel, dpr, bx0, by0, bw0, bh0);
      g.font = `${fs}px ${MONO}`; g.shadowColor = `rgba(${A},.6)`; g.shadowBlur = 8;
      buf.forEach((l, i) => { g.fillStyle = l.startsWith('>') ? `rgba(${A},1)` : /ANOMALOUS|EXPUNGED/.test(l) ? 'rgba(255,90,60,.95)' : `rgba(${A},.75)`; g.fillText(l, x0, top + i * lh); });
      const y = top + buf.length * lh; g.fillStyle = `rgba(${A},1)`; g.fillText(cur, x0, y);
      if (Math.floor(t * 2) % 2) g.fillRect(x0 + g.measureText(cur).width + 4, y - fs * .8, fs * .55, fs);
      g.shadowBlur = 0;
      g.textAlign = 'right'; g.fillStyle = `rgba(${A},.6)`; g.fillText(clock(), sx + sw - fs * 2, sy + fs * 2.4); g.textAlign = 'left';
      blit(g, scan, dpr, sx, sy, sw, sh);
      // link activity on the bezel
      const ly = py + ph - 30;
      led.forEach((v, i) => { const on = Math.sin(t * (2 + v * 9) + v * 40) > .3; g.fillStyle = on ? `rgba(${A},.9)` : 'rgba(255,179,71,.12)'; g.fillRect(sx + sw * .45 + i * (sw * .5 / 48), ly, sw * .5 / 48 - 2, 3); });
    }
    return run;
  },
} satisfies Scene;
