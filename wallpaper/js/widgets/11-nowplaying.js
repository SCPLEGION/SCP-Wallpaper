// Widget: now playing (MPRIS track from helpers/scp-nowplaying)
'use strict';

const npTime = s => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;

// The feed refreshes once a second; between writes the position is extrapolated so the bar moves smoothly.
function npPos(){ return np.status === 'playing' ? np.position + (Date.now() - np.t) / 1000 : np.position; }

function npHtml(){
  if (!np || np.status === 'none' || Date.now() - np.t > 15000) return '<div class="sys-empty">nic nie gra</div>';
  const pos = clamp(npPos(), 0, np.length || Infinity);
  return `<div class="np-main">${np.art ? `<img class="np-art" src="${esc(np.art)}" onerror="this.remove()">` : ''}
    <div class="np-txt"><b>${esc(np.title)}</b><span>${esc(np.artist)}</span><span class="dim">${esc(np.album)}</span></div></div>
    ${sbar(np.length ? pos / np.length * 100 : 0, false)}
    <div class="srow sm"><span>${np.status === 'playing' ? '▶' : '❚❚'} ${esc(np.player)}</span><em>${npTime(pos)}${np.length ? ' / ' + npTime(np.length) : ''}</em></div>`;
}

WIDGETS.push({ id: 'nowplaying', name: 'Teraz gra', x: .76, y: .62, on: false, cls: 'npw',
  html: npHtml,
  update(n, el){
    // Rebuild only when the track changes (keeps the cover from reloading); otherwise just move the bar and clock.
    const key = np ? np.status + np.title + np.artist : '';
    if (el.dataset.k !== key){ el.dataset.k = key; el.innerHTML = npHtml(); return; }
    const bar = el.querySelector('.sb i'), tm = el.querySelector('.srow em');
    if (bar && np.length){ const p = clamp(npPos(), 0, np.length); bar.style.width = (p / np.length * 100).toFixed(1) + '%'; tm.textContent = npTime(p) + ' / ' + npTime(np.length); }
  } });
