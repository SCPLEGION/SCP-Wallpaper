// Menu panel, global input handlers (click / keys) and auto-rotate.
'use strict';

/* ---------------- menu ---------------- */
SCENES.forEach((s, i) => {
  const b = document.createElement('button'); b.className = 'scene';
  b.innerHTML = `<div class="sw" style="background:${s.swatch}"></div><span class="nm">${s.name}</span>`;
  b.addEventListener('click', e => { e.stopPropagation(); go(i); });
  $('scenes').appendChild(b);
});
const editing = () => document.body.classList.contains('editing');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
function setTab(id){
  state.tab = id === 'p2' ? 'p2' : 'p1';
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.p === state.tab));
  document.querySelectorAll('.pane').forEach(p => p.hidden = p.id !== state.tab);
  save();
}
document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', e => { e.stopPropagation(); setTab(t.dataset.p); }));

$('auto').value = String(state.auto);
$('auto').addEventListener('change', e => { state.auto = +e.target.value; save(); armAuto(); });
$('auto').addEventListener('click', e => e.stopPropagation());
$('reseed').addEventListener('click', e => { e.stopPropagation(); go(state.scene, (Math.random() * 1e9) | 0); });
const toggleMenu = () => document.body.classList.toggle('menu-open');
$('menubtn').addEventListener('click', e => { e.stopPropagation(); toggleMenu(); });
$('menu').addEventListener('click', e => e.stopPropagation());
$('editbar').addEventListener('click', e => e.stopPropagation());

let autoTimer = null;
function armAuto(){ clearInterval(autoTimer); if (state.auto > 0) autoTimer = setInterval(() => go(state.scene + 1), state.auto * 60000); }

/* click on the wallpaper = next scene, right click = previous (disabled while arranging widgets) */
document.addEventListener('click', () => {
  if (editing()) return;
  if (document.body.classList.contains('menu-open')) { document.body.classList.remove('menu-open'); return; }
  go(state.scene + 1);
});
document.addEventListener('contextmenu', e => { e.preventDefault(); if (!editing()) go(state.scene - 1); });
document.addEventListener('keydown', e => {
  if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
  if (e.key === 'ArrowRight') go(state.scene + 1);
  else if (e.key === 'ArrowLeft') go(state.scene - 1);
  else if (e.key === 'm' || e.key === 'M') toggleMenu();
  else if (e.key === 'd' || e.key === 'D') setDash(!state.dash);
  else if (e.key === 'e' || e.key === 'E') setEdit(!editing());
  else if (/^[1-3]$/.test(e.key)) loadSlot(+e.key - 1);
  else if (e.key === ' ') { e.preventDefault(); go(state.scene, (Math.random() * 1e9) | 0); }
  else if (e.key === 'Escape') { document.body.classList.remove('menu-open'); setEdit(false); }
});
