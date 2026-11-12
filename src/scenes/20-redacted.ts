// Redacted file: a Foundation dossier lying lit on the desk between the widgets. Header, photo, class badge and a
// stamp stay put; the body text scrolls under them with its redaction bars, and a scanner line reads down the page.
import { rng } from '../core/util.ts';
import { deck, layer, blit, emblem, PRESET, MONO, CLASSES } from './scp.ts';
import type { Scene, SceneRun } from './types.ts';

const WORDS = ('the object is to be kept in a standard containment locker at site personnel with level clearance may access ' +
  'testing requires written approval from the director all incidents must be logged and reported subject was observed exhibiting ' +
  'anomalous properties when exposed to direct light recovered from an abandoned facility near interviews with witnesses ' +
  'indicate further research is ongoing class reassessment pending under no circumstances should').split(' ');

export default {
  id: 'redacted', name: 'Akta', accent: '#d9cfb8', hud: true, preset: PRESET, swatch: 'linear-gradient(#e9e3d5 0 30%,#17140f 30% 38%,#e9e3d5 38% 60%,#17140f 60% 66%,#e9e3d5 66%)',
  mount({ el, seed }){
    const { cv, g, w, h, cx, R, A, dpr } = deck(el, { rgb: '217,207,184', left: 'SCP FOUNDATION · ARCHIWUM CENTRALNE', right: 'POZIOM 4 · ŚCIŚLE TAJNE', bg: ['#3a2f1f', '#15110b', '#050403'] });
    const r = rng(seed), n = 1000 + Math.floor(r() * 7000), cls = CLASSES[Math.floor(r() * 3)];
    const pw = R * 2.4, ph = h * .76, px = cx - pw / 2, py = h * .1, m = pw * .06;
    const fs = Math.max(11, Math.round(pw * .0155)), lh = fs * 1.7, colW = pw - m * 2, tTop = py + ph * .36, tBot = py + ph * .86;
    const INK = '#211d16', RED = '#b3261e';
    // the body text, laid out once into a tall canvas the width of the column
    const lines: { text: string; bold?: boolean; bars: [number, number][] }[] = [];
    const cw = (() => { g.font = `${fs}px ${MONO}`; return g.measureText('m').width; })(), cols = Math.floor(colW / cw);
    for (let d = 0; d < 2; d++) for (const head of ['Specjalne procedury przechowawcze:', 'Opis:', 'Dodatek ' + n + '-' + (d + 1) + ':']){
      lines.push({ text: head, bold: true, bars: [] });
      for (let k = 0; k < 4 + Math.floor(r() * 5); k++){
        let s = ''; while (s.length < cols - 8) s += WORDS[Math.floor(r() * WORDS.length)] + ' ';
        const bars: [number, number][] = []; if (r() < .5){ const a = Math.floor(r() * (cols - 20)); bars.push([a, a + 4 + Math.floor(r() * 14)]); }
        lines.push({ text: s.trim(), bars });
      }
      lines.push({ text: '', bars: [] });
    }
    const docH = lines.length * lh, text = document.createElement('canvas'); text.width = Math.ceil(colW * dpr); text.height = Math.ceil(docH * dpr);
    const tg = text.getContext('2d')!; tg.setTransform(dpr, 0, 0, dpr, 0, 0);
    lines.forEach((l, i) => { const y = (i + 1) * lh; tg.font = `${l.bold ? '700 ' : ''}${fs}px ${MONO}`; tg.fillStyle = INK; tg.fillText(l.text, 0, y); tg.fillStyle = '#121110'; for (const [a, b] of l.bars) tg.fillRect(a * cw, y - fs * .85, (b - a) * cw, fs * 1.05); });
    // the desk, the page under it, the page itself with everything that does not move
    const base = layer(cv, b => {
      b.save(); b.translate(cx, py + ph / 2); b.rotate(.035); b.shadowColor = 'rgba(0,0,0,.6)'; b.shadowBlur = 30; b.fillStyle = '#c9bfa6'; b.fillRect(-pw / 2 + 14, -ph / 2 + 8, pw, ph); b.restore();
      b.shadowColor = 'rgba(0,0,0,.7)'; b.shadowBlur = 40; b.shadowOffsetY = 10;
      const pg = b.createLinearGradient(px, py, px + pw, py + ph); pg.addColorStop(0, '#efe9db'); pg.addColorStop(1, '#ddd4bf'); b.fillStyle = pg; b.fillRect(px, py, pw, ph);
      b.shadowColor = 'transparent'; b.shadowBlur = 0; b.shadowOffsetY = 0;
      for (let i = 0; i < 2600; i++){ b.fillStyle = `rgba(80,60,30,${r() * .06})`; b.fillRect(px + r() * pw, py + r() * ph, 1 + r() * 2, 1); }
      emblem(b, px + m + fs * 1.6, py + m + fs * 1.4, fs * 1.6, INK, '#ece5d6');
      b.fillStyle = INK; b.font = `700 ${Math.round(fs * 1.25)}px ${MONO}`; b.fillText('SCP FOUNDATION', px + m + fs * 4, py + m + fs * 1.2);
      b.font = `${fs}px ${MONO}`; b.fillStyle = 'rgba(33,29,22,.6)'; b.fillText('SECURE · CONTAIN · PROTECT', px + m + fs * 4, py + m + fs * 2.6);
      b.textAlign = 'right'; b.fillText(`DOKUMENT ${n}/${(seed >>> 0).toString(16).slice(0, 4).toUpperCase()}`, px + pw - m, py + m + fs * 1.2); b.fillText('POZIOM DOSTĘPU 4/' + n, px + pw - m, py + m + fs * 2.6); b.textAlign = 'left';
      b.fillStyle = INK; b.fillRect(px + m, py + m + fs * 4, colW, 2);
      const iy = py + m + fs * 7.5; b.font = `800 ${Math.round(fs * 2.4)}px ${MONO}`; b.fillText(`SCP-${n}`, px + m, iy);
      b.font = `700 ${fs}px ${MONO}`; b.fillText('Klasa obiektu:', px + m, iy + fs * 2.4);
      const cc = cls === 'KETER' ? RED : cls === 'EUCLID' ? '#b07a12' : '#2f6b3a', bw = cw * (cls.length + 2);
      b.fillStyle = cc; b.fillRect(px + m + cw * 15, iy + fs * 1.3, bw, fs * 1.5); b.fillStyle = '#f3eee2'; b.fillText(cls, px + m + cw * 16, iy + fs * 2.4);
      b.fillStyle = INK; b.font = `${fs}px ${MONO}`; b.fillText(`Ośrodek przechowawczy: SITE-${10 + Math.floor(r() * 80)} · Komora ${Math.floor(r() * 40)}`, px + m, iy + fs * 4.2);
      // photo with a caption, paper-clipped
      const fw = pw * .26, fh = fw * .78, fx = px + pw - m - fw, fy = py + m + fs * 5;
      b.fillStyle = '#1a1814'; b.fillRect(fx, fy, fw, fh);
      for (let i = 0; i < 1800; i++){ const v = 30 + r() * 60; b.fillStyle = `rgba(${v},${v},${v * .9},.5)`; b.fillRect(fx + r() * fw, fy + r() * fh, 2, 2); }
      b.fillStyle = 'rgba(0,0,0,.75)'; b.beginPath(); b.ellipse(fx + fw * .55, fy + fh * .42, fw * .12, fh * .2, 0, 0, Math.PI * 2); b.fill(); b.fillRect(fx + fw * .4, fy + fh * .55, fw * .3, fh * .45);
      b.fillStyle = '#121110'; b.fillRect(fx + fw * .44, fy + fh * .36, fw * .24, fh * .09);
      b.strokeStyle = '#f3eee2'; b.lineWidth = 6; b.strokeRect(fx - 3, fy - 3, fw + 6, fh + 6); b.lineWidth = 1;
      b.strokeStyle = '#8a8f96'; b.lineWidth = 2; b.beginPath(); b.roundRect(fx + fw * .1, fy - fh * .1, fw * .06, fh * .3, fw * .03); b.stroke(); b.lineWidth = 1;
      b.font = `${Math.round(fs * .85)}px ${MONO}`; b.fillStyle = 'rgba(33,29,22,.7)'; b.fillText(`Ryc. 1: SCP-${n}, zdjęcie z ███.██.████`, fx, fy + fh + fs * 1.6);
      b.fillStyle = INK; b.fillRect(px + m, tTop - fs * 1.4, colW, 1);
      // footer: barcode + routing
      for (let x = px + m, i = 0; x < px + m + pw * .3; i++){ const bw2 = 1 + Math.floor(r() * 3); if (i % 2 === 0){ b.fillRect(x, py + ph - m - fs * 2.2, bw2, fs * 2); } x += bw2 + 1; }
      b.font = `${Math.round(fs * .85)}px ${MONO}`; b.fillStyle = 'rgba(33,29,22,.6)'; b.textAlign = 'right';
      b.fillText('NIEUPOWAŻNIONY DOSTĘP JEST ŚCIGANY · O5 COMMAND', px + pw - m, py + ph - m - fs * .4); b.textAlign = 'left';
      // the stamp, over the photo's corner
      b.save(); b.translate(fx - fw * .25, fy + fh * .95); b.rotate(-.16); b.globalAlpha = .78;
      const sf = Math.round(fs * 2.1); b.font = `800 ${sf}px ${MONO}`; b.letterSpacing = `${Math.round(sf * .15)}px`;
      const tw = b.measureText('CLASSIFIED').width; b.strokeStyle = RED; b.lineWidth = 3; b.strokeRect(-sf * .4, -sf * 1.1, tw + sf * .8, sf * 1.5);
      b.fillStyle = RED; b.fillText('CLASSIFIED', 0, 0); b.letterSpacing = '0px'; b.restore();
    });
    const run: SceneRun = { soft: false, tick };
    function tick(t: number){
      const bx0 = px - 60, by0 = py - 50, bw0 = pw + 120, bh0 = ph + 100;
      g.clearRect(bx0, by0, bw0, bh0);
      blit(g, base, dpr, bx0, by0, bw0, bh0);
      // body text: scrolls slowly inside its window, faded at both edges
      const vh = tBot - tTop, off = (t * 8) % docH;
      g.save(); g.beginPath(); g.rect(px + m, tTop, colW, vh); g.clip();
      for (const y0 of [-off, docH - off]) if (y0 < vh && y0 + docH > 0) g.drawImage(text, px + m, tTop + y0, colW, docH);
      const pf = g.createLinearGradient(0, tTop, 0, tBot); pf.addColorStop(0, '#e9e2d1'); pf.addColorStop(.1, 'rgba(233,226,209,0)'); pf.addColorStop(.9, 'rgba(228,220,203,0)'); pf.addColorStop(1, '#e4dccb');
      g.fillStyle = pf; g.fillRect(px + m, tTop, colW, vh);
      // scanner line reading the page
      const sy = tTop + ((t * .12) % 1) * vh, sg = g.createLinearGradient(0, sy - 30, 0, sy + 2); sg.addColorStop(0, 'rgba(179,38,30,0)'); sg.addColorStop(1, 'rgba(179,38,30,.16)');
      g.fillStyle = sg; g.fillRect(px + m, sy - 30, colW, 32); g.fillStyle = 'rgba(179,38,30,.6)'; g.fillRect(px + m, sy, colW, 1);
      g.restore();
      g.font = `11px ${MONO}`; g.fillStyle = `rgba(${A},.5)`; g.textAlign = 'center'; g.fillText(`SKANOWANIE ${String(Math.floor((t * .12) % 1 * 100)).padStart(2, '0')}% · FILTR MEMETYCZNY AKTYWNY`, cx, py + ph + 22); g.textAlign = 'left';
    }
    return run;
  },
} satisfies Scene;
