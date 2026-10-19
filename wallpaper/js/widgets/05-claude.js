// Widget: claude
'use strict';

WIDGETS.push({ id: 'claude', name: 'Użycie Claude', x: .06, y: .74, on: true,
  html: () => '<div class="bars"><div class="bar"><span><em>claude · 5h</em><em class="ct">–</em></span><i><b></b></i></div><div class="bar"><span><em>claude · 7d</em><em class="ct">–</em></span><i><b></b></i></div></div>',
  update(n, el){
    const stale = !usage || !(Date.now() - Date.parse(usage.updated_at) < 15 * 60000);
    el.classList.toggle('stale', stale);
    [...el.querySelectorAll('.bar')].forEach((b, i) => {
      const w = usage && (i ? usage.seven_day : usage.five_hour), pct = w && typeof w.used_percentage === 'number' ? w.used_percentage : null;
      const bb = b.querySelector('b'); bb.style.width = (pct === null ? 0 : pct) + '%'; bb.classList.toggle('hot', pct !== null && pct >= 80);
      let left = ''; if (w && w.resets_at){ const m = Math.round((Date.parse(w.resets_at) - Date.now()) / 60000), d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60); left = m <= 0 ? 'reset' : d ? `${d}d ${h}h` : h ? `${h}h ${m % 60}m` : `${m}m`; }
      b.querySelector('.ct').textContent = pct === null ? '–' : Math.round(pct) + '%' + (left ? ' · ' + left : '');
    });
  } });
