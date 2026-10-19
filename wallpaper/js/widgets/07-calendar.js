// Widget: calendar
'use strict';

WIDGETS.push({ id: 'calendar', name: 'Kalendarz', x: .78, y: .52, on: true, cls: 'cal',
  html: () => '', update(n, el){
    const key = n.getFullYear() + '-' + n.getMonth() + '-' + n.getDate(); if (el._k === key) return; el._k = key;
    const y = n.getFullYear(), m = n.getMonth(), first = (new Date(y, m, 1).getDay() + 6) % 7, dim = new Date(y, m + 1, 0).getDate();
    let h = `<div class="cal-h">${MONTHS[m]} ${y}</div><div class="cal-g">` + DAYS.map(d => `<b>${d}</b>`).join('');
    for (let i = 0; i < first; i++) h += '<i></i>';
    for (let d = 1; d <= dim; d++) h += `<span class="${d === n.getDate() ? 'today' : ''}">${d}</span>`;
    el.innerHTML = h + '</div>';
  } });
