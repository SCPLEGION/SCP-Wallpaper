// What `scp-wallpaper <cmd>` does inside the page (delivered by data/control.ts).
import type { Cmd } from '../data/control.ts';
import { state } from './state.ts';
import { goId, go, step, reseed } from './stage.ts';
import { setDash, setEdit, editing, loadSlot, setWidget, isOn, setTheme } from './dashboard.ts';
import { THEMES, type Theme } from './model.ts';
import { setAuto, toggleMenu } from './menu.ts';

const onOff = (arg: string | null, cur: boolean) => arg === 'on' ? true : arg === 'off' ? false : !cur;

export function runCommand({ cmd, arg }: Cmd){
  switch (cmd){
    case 'scene': if (arg && /^\d+$/.test(arg)) go(+arg); else if (arg) goId(arg); break;
    case 'next': step(1); break;
    case 'prev': step(-1); break;
    case 'reseed': reseed(); break;
    case 'dash': setDash(onOff(arg, state.dash)); break;
    case 'edit': setEdit(onOff(arg, editing())); break;
    case 'menu': toggleMenu(onOff(arg, document.body.classList.contains('menu-open'))); break;
    case 'layout': if (arg) loadSlot(+arg - 1); break;
    case 'auto': setAuto(Math.max(0, +(arg || 0) || 0)); break;
    case 'widget': { const [id, v] = (arg || '').split(/\s+/); if (id) setWidget(id, onOff(v ?? null, isOn(id))); break; }
    case 'theme': if (arg && (THEMES as string[]).includes(arg)) setTheme(arg as Theme); break;
    case 'reload': location.reload(); break;
    default: console.warn('scp-wallpaper: unknown command', cmd);
  }
}
