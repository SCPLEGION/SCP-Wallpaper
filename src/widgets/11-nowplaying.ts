// Now playing (MPRIS track from scp-wallpaperd)
import { clamp } from '../core/util.ts';
import { np, type NowPlaying } from '../data/sources.ts';
import { pad, esc, sbar } from './helpers.ts';
import type { Widget } from './types.ts';

const npTime = (s: number) => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;

// The feed refreshes once a second; between writes the position is extrapolated so the bar moves smoothly.
const npPos = (n: NowPlaying) => n.status === 'playing' ? n.position + (Date.now() - n.t) / 1000 : n.position;

function npHtml(){
  const n = np.value;
  if (!n || n.status === 'none' || Date.now() - n.t > 15000) return '<div class="sys-empty">nic nie gra</div>';
  const pos = clamp(npPos(n), 0, n.length || Infinity);
  return `<div class="np-main">${n.art ? `<img class="np-art" src="${esc(n.art)}" onerror="this.remove()">` : ''}
    <div class="np-txt"><b>${esc(n.title)}</b><span>${esc(n.artist)}</span><span class="dim">${esc(n.album)}</span></div></div>
    ${sbar(n.length ? pos / n.length * 100 : 0, false)}
    <div class="srow sm"><span>${n.status === 'playing' ? '▶' : '❚❚'} ${esc(n.player)}</span><em>${npTime(pos)}${n.length ? ' / ' + npTime(n.length) : ''}</em></div>`;
}

export default { id: 'nowplaying', name: 'Teraz gra', x: .76, y: .62, on: false, cls: 'npw', every: 1000, sources: [np],
  html: npHtml,
  update(el){
    // Rebuild only when the track changes (keeps the cover from reloading); otherwise just move the bar and clock.
    const n = np.value, live = !!n && n.status !== 'none' && Date.now() - n.t <= 15000, key = live ? n.status + n.title + n.artist : '';
    if (el.dataset.k !== key){ el.dataset.k = key; el.innerHTML = npHtml(); return; }
    const bar = el.querySelector<HTMLElement>('.sb i'), tm = el.querySelector('.srow em');
    if (live && bar && tm && n.length){ const p = clamp(npPos(n), 0, n.length); bar.style.width = (p / n.length * 100).toFixed(1) + '%'; tm.textContent = npTime(p) + ' / ' + npTime(n.length); }
  } } satisfies Widget;
