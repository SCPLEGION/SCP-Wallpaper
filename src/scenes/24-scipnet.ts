// SCiPNET: a phosphor terminal typing out a session on the Foundation network
import { rng } from '../core/util.ts';
import { cvInit, hexs } from '../core/draw.ts';
import { layer, emblem, MONO, SITES, CLASSES, clock } from './scp.ts';
import type { Scene } from './types.ts';

export default {
  id: 'scipnet', name: 'SCiPNET', accent: '#ffb347', hud: true, swatch: 'linear-gradient(#140c02,#050301)',
  mount({ el, seed }){
    el.innerHTML = '<canvas></canvas>';
    const cv = cvInit(el, .8), { g, w, h } = cv, r = rng(seed), A = '255,179,71';
    const fs = Math.max(13, Math.round(h * .021)), lh = fs * 1.5, x0 = w * .08, top = h * .2, rows = Math.floor((h * .72) / lh);
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
    const bg = layer(cv, b => {
      const gr = b.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * .7); gr.addColorStop(0, '#1a1003'); gr.addColorStop(1, '#040201'); b.fillStyle = gr; b.fillRect(0, 0, w, h);
      emblem(b, x0 + fs * 1.6, h * .1, fs * 1.6, `rgba(${A},.9)`, '#160d02');
      b.font = `700 ${Math.round(fs * 1.2)}px ${MONO}`; b.fillStyle = `rgba(${A},.95)`; b.fillText('SCiPNET', x0 + fs * 4.2, h * .1 - fs * .1);
      b.font = `${fs * .8}px ${MONO}`; b.fillStyle = `rgba(${A},.55)`; b.fillText('SECURE FOUNDATION NETWORK · TERMINAL 0x' + (seed >>> 0).toString(16).slice(0, 4).toUpperCase(), x0 + fs * 4.2, h * .1 + fs * 1.1);
      b.fillStyle = `rgba(${A},.25)`; b.fillRect(x0, h * .16, w - x0 * 2, 1);
    });
    const scan = layer(cv, b => { b.fillStyle = 'rgba(0,0,0,.25)'; for (let y = 0; y < h; y += 3) b.fillRect(0, y, w, 1); const v = b.createRadialGradient(w / 2, h / 2, h * .3, w / 2, h / 2, Math.max(w, h) * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.6)'); b.fillStyle = v; b.fillRect(0, 0, w, h); });
    return {
      soft: cv.soft,
      tick(t, dt){
        // type: commands ~25 chars/s, output lines appear whole after a short pause
        wait -= dt;
        if (wait <= 0) advance();
        g.drawImage(bg, 0, 0, w, h);
        g.font = `${fs}px ${MONO}`; g.shadowColor = `rgba(${A},.6)`; g.shadowBlur = 8;
        buf.forEach((l, i) => { g.fillStyle = l.startsWith('>') ? `rgba(${A},1)` : /ANOMALOUS|EXPUNGED/.test(l) ? 'rgba(255,90,60,.95)' : `rgba(${A},.75)`; g.fillText(l, x0, top + i * lh); });
        const y = top + buf.length * lh; g.fillStyle = `rgba(${A},1)`; g.fillText(cur, x0, y);
        if (Math.floor(t * 2) % 2) g.fillRect(x0 + g.measureText(cur).width + 4, y - fs * .8, fs * .55, fs);
        g.shadowBlur = 0;
        g.textAlign = 'right'; g.fillStyle = `rgba(${A},.6)`; g.fillText(clock(), w - x0, h * .1); g.textAlign = 'left';
        g.drawImage(scan, 0, 0, w, h);
      },
    };
  },
} satisfies Scene;
