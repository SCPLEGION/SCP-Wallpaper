// Widget: pomo
'use strict';

const POMO = { focus: 25 * 60000, break: 5 * 60000 };

WIDGETS.push({ id: 'pomo', name: 'Pomodoro', x: .42, y: .66, on: false, cls: 'pomow',
  html: () => `<div class="pm"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" class="pr0"/><circle cx="50" cy="50" r="42" class="pr1" stroke-dasharray="263.9" stroke-dashoffset="0" transform="rotate(-90 50 50)"/></svg><div class="pt"><b>25:00</b><small>fokus</small></div></div><div class="pbtns"><button class="btn pgo">Start</button><button class="btn prs">Reset</button><button class="btn pmd">Tryb</button></div>`,
  init(el){
    if (!state.pomo) state.pomo = { mode: 'focus', run: false, endAt: 0, left: POMO.focus };
    const p = state.pomo, rst = () => { p.run = false; p.left = POMO[p.mode]; save(); this.update(new Date(), el); };
    el.querySelector('.pgo').addEventListener('click', () => { if (p.run){ p.left = Math.max(0, p.endAt - Date.now()); p.run = false; } else { p.endAt = Date.now() + p.left; p.run = true; } save(); this.update(new Date(), el); });
    el.querySelector('.prs').addEventListener('click', rst);
    el.querySelector('.pmd').addEventListener('click', () => { p.mode = p.mode === 'focus' ? 'break' : 'focus'; rst(); });
  },
  update(n, el){
    const p = state.pomo; if (!p) return;
    if (p.run && Date.now() >= p.endAt){ p.run = false; p.mode = p.mode === 'focus' ? 'break' : 'focus'; p.left = POMO[p.mode]; save(); beep(); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 3200); }
    const rem = p.run ? Math.max(0, p.endAt - Date.now()) : p.left, s = Math.ceil(rem / 1000);
    el.querySelector('.pt b').textContent = `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
    el.querySelector('.pt small').textContent = p.mode === 'focus' ? 'fokus' : 'przerwa';
    el.querySelector('.pr1').style.strokeDashoffset = (263.9 * (1 - rem / POMO[p.mode])).toFixed(1);
    el.querySelector('.pgo').textContent = p.run ? 'Pauza' : 'Start';
  } });
