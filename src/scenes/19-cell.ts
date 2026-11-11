// Containment cell: blueprint of a containment chamber, an entity drifting inside, sensors tracking it
import { rng, vnoise } from '../core/util.ts';
import { cvInit } from '../core/draw.ts';
import { layer, TAU, MONO, CLASSES } from './scp.ts';
import type { Scene } from './types.ts';

export default {
  id: 'cell', name: 'Komora', accent: '#7fc8ff', swatch: 'linear-gradient(135deg,#0c2440,#081628)',
  mount({ el, seed }){
    el.innerHTML = '<canvas></canvas>';
    const cv = cvInit(el, .8), { g, w, h } = cv, r = rng(seed);
    const B = '127,200,255', S = Math.min(w, h), fs = Math.max(10, Math.round(S * .016));
    const room = { x: w * .5 - S * .3, y: h * .5 - S * .3, s: S * .6 };
    const item = `SCP-${String(1000 + Math.floor(r() * 7000))}`, cls = CLASSES[Math.floor(r() * 3)];
    const sensors = [[room.x, room.y], [room.x + room.s, room.y], [room.x, room.y + room.s], [room.x + room.s, room.y + room.s]];
    const bg = layer(cv, b => {
      b.fillStyle = '#081628'; b.fillRect(0, 0, w, h);
      b.lineWidth = 1;
      for (let x = 0; x < w; x += 20){ b.strokeStyle = `rgba(${B},${x % 100 ? .05 : .11})`; b.beginPath(); b.moveTo(x + .5, 0); b.lineTo(x + .5, h); b.stroke(); }
      for (let y = 0; y < h; y += 20){ b.strokeStyle = `rgba(${B},${y % 100 ? .05 : .11})`; b.beginPath(); b.moveTo(0, y + .5); b.lineTo(w, y + .5); b.stroke(); }
      b.strokeStyle = `rgba(${B},.8)`; b.lineWidth = 2; b.strokeRect(room.x, room.y, room.s, room.s);
      b.lineWidth = 1; b.strokeRect(room.x - 12, room.y - 12, room.s + 24, room.s + 24);
      // airlock + observation room
      const ax = room.x + room.s + 12; b.strokeRect(ax, room.y + room.s * .4, room.s * .2, room.s * .2);
      b.strokeRect(room.x - 12 - room.s * .32, room.y + room.s * .1, room.s * .32, room.s * .35);
      b.setLineDash([6, 6]); b.beginPath(); b.moveTo(room.x - 12, room.y + room.s * .18); b.lineTo(room.x - 12, room.y + room.s * .37); b.stroke(); b.setLineDash([]);
      // dimension line
      b.strokeStyle = `rgba(${B},.45)`; b.beginPath(); b.moveTo(room.x, room.y + room.s + 40); b.lineTo(room.x + room.s, room.y + room.s + 40); b.moveTo(room.x, room.y + room.s + 32); b.lineTo(room.x, room.y + room.s + 48); b.moveTo(room.x + room.s, room.y + room.s + 32); b.lineTo(room.x + room.s, room.y + room.s + 48); b.stroke();
      b.font = `${fs}px ${MONO}`; b.fillStyle = `rgba(${B},.75)`; b.textAlign = 'center';
      b.fillText('12.00 m', room.x + room.s / 2, room.y + room.s + 60);
      b.fillText('ŚLUZA', ax + room.s * .1, room.y + room.s * .4 - 8);
      b.fillText('OBSERWACJA', room.x - 12 - room.s * .16, room.y + room.s * .1 - 8);
      b.textAlign = 'left'; b.fillStyle = `rgba(${B},.9)`; b.font = `700 ${Math.round(fs * 1.6)}px ${MONO}`;
      b.fillText(item, room.x, room.y - 34);
      b.font = `${fs}px ${MONO}`; b.fillStyle = `rgba(${B},.6)`; b.fillText(`KLASA: ${cls} · KOMORA STANDARDOWA · ARK. 1/1`, room.x, room.y - 18);
      for (const [sx, sy] of sensors){ b.fillStyle = `rgba(${B},.9)`; b.fillRect(sx - 4, sy - 4, 8, 8); }
    });
    return {
      soft: cv.soft,
      tick(t){
        g.drawImage(bg, 0, 0, w, h);
        const ex = room.x + room.s * (.15 + .7 * vnoise(t * .12, seed)), ey = room.y + room.s * (.15 + .7 * vnoise(t * .12 + 50, seed + 3));
        // sensor sweeps: each locks on when the entity is within its cone
        sensors.forEach(([sx, sy], i) => {
          const base = Math.atan2(room.y + room.s / 2 - sy, room.x + room.s / 2 - sx), a = base + Math.sin(t * .6 + i * 1.7) * .7;
          const to = Math.atan2(ey - sy, ex - sx), lock = Math.abs(((to - a + 9.42) % TAU) - 3.14) < .25;
          g.fillStyle = `rgba(${B},${lock ? .16 : .06})`; g.beginPath(); g.moveTo(sx, sy); g.arc(sx, sy, room.s * .75, a - .25, a + .25); g.closePath(); g.fill();
          if (lock){ g.strokeStyle = `rgba(${B},.55)`; g.setLineDash([3, 5]); g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.stroke(); g.setLineDash([]); }
        });
        g.strokeStyle = `rgba(${B},.9)`; g.lineWidth = 1.5; const k = 14 + 4 * Math.sin(t * 3);
        g.beginPath(); g.arc(ex, ey, k, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(ex - k - 8, ey); g.lineTo(ex - k + 4, ey); g.moveTo(ex + k - 4, ey); g.lineTo(ex + k + 8, ey); g.moveTo(ex, ey - k - 8); g.lineTo(ex, ey - k + 4); g.moveTo(ex, ey + k - 4); g.lineTo(ex, ey + k + 8); g.stroke();
        g.fillStyle = 'rgba(255,90,80,.9)'; g.beginPath(); g.arc(ex, ey, 4, 0, TAU); g.fill();
        // airlock doors slide
        const open = Math.max(0, Math.sin(t * .25)) * room.s * .08, dx = room.x + room.s;
        g.fillStyle = '#081628'; g.fillRect(dx - 3, room.y + room.s * .42, 18, room.s * .16);
        g.strokeStyle = `rgba(${B},.85)`; g.lineWidth = 2; g.beginPath(); g.moveTo(dx, room.y + room.s * .42); g.lineTo(dx, room.y + room.s * .5 - open); g.moveTo(dx, room.y + room.s * .5 + open); g.lineTo(dx, room.y + room.s * .58); g.stroke();
        g.font = `${fs}px ${MONO}`; g.fillStyle = `rgba(${B},.75)`; g.textAlign = 'left';
        const px = ((ex - room.x) / room.s * 12).toFixed(2), py = ((ey - room.y) / room.s * 12).toFixed(2);
        g.fillText(`POZ ${px} / ${py} m`, room.x + room.s + 24, room.y + 14);
        g.fillText(`ŚLUZA ${open > 2 ? 'OTWARTA' : 'ZAMKNIĘTA'}`, room.x + room.s + 24, room.y + 14 + fs * 1.5);
        g.fillText(`CZUJNIKI 4/4`, room.x + room.s + 24, room.y + 14 + fs * 3);
      },
    };
  },
} satisfies Scene;
