// Redacted file: a Foundation document scrolling slowly on paper, black redaction bars, a red stamp
import { rng } from '../core/util.ts';
import { cvInit } from '../core/draw.ts';
import { MONO, CLASSES } from './scp.ts';
import type { Scene } from './types.ts';

const WORDS = ('the object is to be kept in a standard containment locker at site personnel with level clearance may access ' +
  'testing requires written approval from the director all incidents must be logged and reported subject was observed exhibiting ' +
  'anomalous properties when exposed to direct light recovered from an abandoned facility near interviews with witnesses ' +
  'indicate further research is ongoing class reassessment pending under no circumstances should').split(' ');

export default {
  id: 'redacted', name: 'Akta', accent: '#b3261e', swatch: 'linear-gradient(#e9e3d5 0 30%,#17140f 30% 38%,#e9e3d5 38% 60%,#17140f 60% 66%,#e9e3d5 66%)',
  mount({ el, seed }){
    el.innerHTML = '<canvas></canvas>';
    const cv = cvInit(el, .8), { g, w, h } = cv, r = rng(seed);
    const fs = Math.max(12, Math.round(h * .019)), lh = fs * 1.75, colW = Math.min(w * .5, fs * 46), x0 = (w - colW) / 2;
    // one long document, laid out once into a tall canvas
    const lines: { text: string; bold?: boolean; bars: [number, number][] }[] = [];
    const doc = () => {
      const n = 1000 + Math.floor(r() * 7000);
      lines.push({ text: `Item #: SCP-${n}`, bold: true, bars: [] }, { text: `Object Class: ${CLASSES[Math.floor(r() * 3)]}`, bold: true, bars: [] }, { text: '', bars: [] });
      for (const head of ['Special Containment Procedures:', 'Description:', 'Addendum:']){
        lines.push({ text: head, bold: true, bars: [] });
        for (let k = 0; k < 5 + Math.floor(r() * 6); k++){
          let s = ''; while (s.length < 58) s += WORDS[Math.floor(r() * WORDS.length)] + ' ';
          const bars: [number, number][] = []; if (r() < .45){ const a = Math.floor(r() * 40); bars.push([a, a + 4 + Math.floor(r() * 14)]); }
          lines.push({ text: s.trim(), bars });
        }
        lines.push({ text: '', bars: [] });
      }
      lines.push({ text: '— — —', bars: [] }, { text: '', bars: [] });
    };
    while (lines.length * lh < h * 2.2) doc();
    const dpr = cv.c.width / w, docH = lines.length * lh;
    const page = document.createElement('canvas'); page.width = cv.c.width; page.height = Math.ceil(docH * dpr);
    const p = page.getContext('2d')!; p.setTransform(dpr, 0, 0, dpr, 0, 0);
    p.fillStyle = '#e9e3d5'; p.fillRect(0, 0, w, docH); p.textBaseline = 'alphabetic';
    const cw = (() => { p.font = `${fs}px ${MONO}`; return p.measureText('m').width; })();
    lines.forEach((l, i) => {
      const y = (i + 1) * lh; p.font = `${l.bold ? '700 ' : ''}${fs}px ${MONO}`; p.fillStyle = '#211d16'; p.fillText(l.text, x0, y);
      p.fillStyle = '#121110'; for (const [a, b] of l.bars) p.fillRect(x0 + a * cw, y - fs * .85, (b - a) * cw, fs * 1.05);
    });
    return {
      soft: cv.soft,
      tick(t){
        const off = (t * 9) % docH;
        g.drawImage(page, 0, off * dpr, page.width, Math.min(page.height - off * dpr, h * dpr), 0, 0, w, Math.min(docH - off, h));
        if (docH - off < h) g.drawImage(page, 0, 0, page.width, (h - (docH - off)) * dpr, 0, docH - off, w, h - (docH - off));
        const vg = g.createLinearGradient(0, 0, 0, h); vg.addColorStop(0, 'rgba(233,227,213,1)'); vg.addColorStop(.12, 'rgba(233,227,213,0)'); vg.addColorStop(.88, 'rgba(233,227,213,0)'); vg.addColorStop(1, 'rgba(233,227,213,1)');
        g.fillStyle = vg; g.fillRect(0, 0, w, h);
        g.fillStyle = 'rgba(23,20,15,.07)'; g.fillRect(x0 - fs * 2, 0, 1, h); g.fillRect(x0 + colW + fs * 2, 0, 1, h);
        g.save(); g.translate(x0 + colW + fs * 4, h * .2); g.rotate(-.12); g.globalAlpha = .75;
        const sf = Math.round(fs * 2.1); g.font = `800 ${sf}px ${MONO}`; g.letterSpacing = `${Math.round(sf * .15)}px`;
        const tw = g.measureText('CLASSIFIED').width; g.strokeStyle = '#b3261e'; g.lineWidth = 3; g.strokeRect(-sf * .4, -sf * 1.1, tw + sf * .8, sf * 1.5);
        g.fillStyle = '#b3261e'; g.fillText('CLASSIFIED', 0, 0); g.letterSpacing = '0px'; g.restore(); g.globalAlpha = 1;
      },
    };
  },
} satisfies Scene;
