// Days of the week, today highlighted
import { DAYS } from './helpers.ts';
import type { Widget } from './types.ts';

export default { id: 'week', name: 'Dni tygodnia', x: .06, y: .63, on: true, every: 60000,
  html: () => '<div class="wk">' + DAYS.map(d => `<div>${d}</div>`).join('') + '</div>',
  update(el, n){ const wd = (n.getDay() + 6) % 7; [...el.querySelector('.wk')!.children].forEach((c, i) => c.classList.toggle('today', i === wd)); } } satisfies Widget;
