// Countdown to a date
import { state, save } from '../app/state.ts';
import type { Widget } from './types.ts';

function update(el: HTMLElement, n = new Date()){
  const ms = Date.parse(state.cd.date + 'T00:00:00'), days = Math.ceil((ms - +n) / 86400000);
  el.querySelector('.cd-n')!.textContent = isNaN(ms) ? '–' : String(Math.max(0, days));
  el.querySelector('.cd-l')!.textContent = isNaN(ms) ? 'podaj datę' : (days > 0 ? 'dni do · ' : days === 0 ? 'dziś · ' : 'minęło · ') + state.cd.label;
}

export default { id: 'countdown', name: 'Odliczanie', x: .62, y: .66, on: false, cls: 'cdw', every: 60000,
  html: () => '<div class="cd-n">–</div><div class="cd-l"></div><div class="cd-e"><input class="cd-t" maxlength="30" placeholder="Wydarzenie" spellcheck="false"><input class="cd-d" maxlength="10" placeholder="RRRR-MM-DD" spellcheck="false"></div>',
  init(el){
    const t = el.querySelector<HTMLInputElement>('.cd-t')!, d = el.querySelector<HTMLInputElement>('.cd-d')!; t.value = state.cd.label; d.value = state.cd.date;
    [t, d].forEach(i => i.addEventListener('keydown', e => e.stopPropagation()));
    t.addEventListener('input', () => { state.cd.label = t.value; save(); update(el); });
    d.addEventListener('input', () => { state.cd.date = d.value; save(); update(el); });
  },
  update } satisfies Widget;
