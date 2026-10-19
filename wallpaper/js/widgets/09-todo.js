// Widget: todo
'use strict';

WIDGETS.push({ id: 'todo', name: 'Zadania', x: .42, y: .08, on: false, cls: 'todow',
  html: () => '<ul class="td"></ul><input class="tin" maxlength="60" placeholder="+ nowe zadanie" spellcheck="false">',
  init(el){
    const ul = el.querySelector('.td'), inp = el.querySelector('.tin');
    const draw = () => { ul.innerHTML = state.todo.map((t, i) => `<li class="${t.done ? 'done' : ''}" data-i="${i}"><span>${esc(t.t)}</span><button class="x" data-x="${i}">×</button></li>`).join(''); };
    draw();
    ul.addEventListener('click', e => {
      const x = e.target.closest('[data-x]');
      if (x){ state.todo.splice(+x.dataset.x, 1); save(); draw(); return; }
      const li = e.target.closest('li'); if (li){ const t = state.todo[+li.dataset.i]; t.done = !t.done; save(); draw(); }
    });
    inp.addEventListener('keydown', e => {
      e.stopPropagation();
      if (e.key === 'Enter' && inp.value.trim() && state.todo.length < 10){ state.todo.push({ t: inp.value.trim(), done: false }); inp.value = ''; save(); draw(); }
    });
  } });
