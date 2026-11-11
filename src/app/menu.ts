// Menu panel, global input handlers (click / keys) and auto-rotate.
import { $ } from '../core/util.ts';
import { SCENES } from '../scenes/index.ts';
import { state, save, params } from './state.ts';
import { go, step, reseed, onSceneChange } from './stage.ts';
import { setDash, setEdit, editing, loadSlot } from './dashboard.ts';

export function setTab(id: string){
  state.tab = id === 'p2' ? 'p2' : 'p1';
  document.querySelectorAll<HTMLElement>('.tab').forEach(t => t.classList.toggle('active', t.dataset.p === state.tab));
  document.querySelectorAll<HTMLElement>('.pane').forEach(p => p.hidden = p.id !== state.tab);
  save();
}
export const toggleMenu = (on?: boolean) => document.body.classList.toggle('menu-open', on);

let autoTimer = 0;
export function armAuto(){ clearInterval(autoTimer); if (state.auto > 0) autoTimer = window.setInterval(() => step(1), state.auto * 60000); }
export function setAuto(min: number){ state.auto = min; save(); armAuto(); $<HTMLSelectElement>('auto').value = String(min); }

export function initMenu(){
  SCENES.forEach((s, i) => {
    const b = document.createElement('button'); b.className = 'scene'; b.dataset.id = s.id;
    b.innerHTML = `<div class="sw" style="background:${s.swatch}"></div><span class="nm">${s.name}</span>`;
    b.addEventListener('click', e => { e.stopPropagation(); go(i); });
    $('scenes').appendChild(b);
  });
  onSceneChange(() => document.querySelectorAll<HTMLElement>('.scene').forEach(b => b.classList.toggle('active', b.dataset.id === state.scene)));
  document.querySelectorAll<HTMLElement>('.tab').forEach(t => t.addEventListener('click', e => { e.stopPropagation(); setTab(t.dataset.p!); }));

  const au = $<HTMLSelectElement>('auto');
  au.value = String(state.auto);
  au.addEventListener('change', () => setAuto(+au.value));
  au.addEventListener('click', e => e.stopPropagation());
  $('reseed').addEventListener('click', e => { e.stopPropagation(); reseed(); });
  $('menubtn').addEventListener('click', e => { e.stopPropagation(); toggleMenu(); });
  $('menu').addEventListener('click', e => e.stopPropagation());
  $('editbar').addEventListener('click', e => e.stopPropagation());
  if (params.has('menu')) toggleMenu(true);
  setTab(state.tab);

  /* click on the wallpaper = next scene, right click = previous (disabled while arranging widgets) */
  document.addEventListener('click', () => {
    if (editing()) return;
    if (document.body.classList.contains('menu-open')){ toggleMenu(false); return; }
    step(1);
  });
  document.addEventListener('contextmenu', e => { e.preventDefault(); if (!editing()) step(-1); });
  document.addEventListener('keydown', e => {
    if (/^(INPUT|SELECT|TEXTAREA)$/.test((e.target as HTMLElement).tagName)) return;
    const k = e.key.toLowerCase();
    if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (k === 'm') toggleMenu();
    else if (k === 'd') setDash(!state.dash);
    else if (k === 'e') setEdit(!editing());
    else if (/^[1-3]$/.test(e.key)) loadSlot(+e.key - 1);
    else if (e.key === ' '){ e.preventDefault(); reseed(); }
    else if (e.key === 'Escape'){ toggleMenu(false); setEdit(false); }
  });
}
