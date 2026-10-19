// Widget: week
'use strict';

WIDGETS.push({ id: 'week', name: 'Dni tygodnia', x: .06, y: .63, on: true,
  html: () => '<div class="wk">' + DAYS.map(d => `<div>${d}</div>`).join('') + '</div>',
  update(n, el){ const wd = (n.getDay() + 6) % 7; [...el.querySelector('.wk').children].forEach((c, i) => c.classList.toggle('today', i === wd)); } });
