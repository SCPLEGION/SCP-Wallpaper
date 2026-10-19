// Widget: progress
'use strict';

WIDGETS.push({ id: 'progress', name: 'Postęp czasu', x: .06, y: .38, on: true,
  html: () => '<div class="bars">' + ['dzień', 'tydzień', 'miesiąc', 'rok'].map(k => `<div class="bar"><span><em>${k}</em><em class="pv"></em></span><i><b></b></i></div>`).join('') + '</div>',
  update(n, el){
    const s = n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds(), wd = (n.getDay() + 6) % 7;
    const dim = new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate(), y0 = new Date(n.getFullYear(), 0, 1), y1 = new Date(n.getFullYear() + 1, 0, 1);
    const v = [s / 86400, (wd * 86400 + s) / 604800, ((n.getDate() - 1) * 86400 + s) / (dim * 86400), (n - y0) / (y1 - y0)];
    el.querySelectorAll('.bar').forEach((b, i) => { b.querySelector('b').style.width = (v[i] * 100).toFixed(2) + '%'; b.querySelector('.pv').textContent = Math.round(v[i] * 100) + '%'; });
  } });
