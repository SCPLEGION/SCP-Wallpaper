// Clock and date
import { state } from '../app/state.ts';
import { pad, isoWeek } from './helpers.ts';
import type { Widget } from './types.ts';

export default { id: 'clock', name: 'Zegar i data', x: .06, y: .08, on: true, every: 1000,
  html: () => '<div class="clk"><span class="hm"></span><small class="sec"></small></div><div class="dt"></div>',
  update(el, n){
    let h = n.getHours(), suf = '';
    if (!state.h24){ suf = h >= 12 ? ' PM' : ' AM'; h = h % 12 || 12; }
    el.querySelector('.hm')!.textContent = `${state.h24 ? pad(h) : h}:${pad(n.getMinutes())}`;
    el.querySelector('.sec')!.textContent = (state.secs ? pad(n.getSeconds()) : '') + suf;
    el.querySelector('.dt')!.innerHTML = n.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' }) + `<b>tydz. ${isoWeek(n)}</b>`;
  } } satisfies Widget;
