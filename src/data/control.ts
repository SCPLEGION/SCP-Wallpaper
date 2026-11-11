// Commands and pause state from scp-wallpaperd (control.json, polled once a second). One-way: the page cannot answer.
import { PATHS } from '../core/config.ts';
import { Source } from '../core/source.ts';
import { poll } from './sources.ts';

export interface Cmd { seq: number; screen: string | null; cmd: string; arg: string | null }
export interface Control { t: number; pause: Record<string, boolean>; cmds: Cmd[] }

/** Output this page is on (patched iNiR host passes ?screen=NAME); '' when unknown, e.g. in previews. */
export const screen = new URLSearchParams(location.search).get('screen') || '';
export const control = new Source<Control>();

/**
 * Feed `run` every command addressed to this screen (or to all) that arrived after the page loaded,
 * and `pause` whether this screen's wallpaper is covered. A control file older than 30 s means the daemon is gone.
 */
export function startControl(run: (c: Cmd) => void, pause: (on: boolean) => void){
  let seen = -1;
  control.on(d => {
    const fresh = !!d && Date.now() - d.t < 30000;
    pause(fresh && !!screen && !!d!.pause?.[screen]);
    if (!d || !Array.isArray(d.cmds)) return;
    const top = Math.max(0, ...d.cmds.map(c => c.seq));
    if (seen < 0 || top < seen){ seen = top; return; }   // first read, or the daemon restarted with a new file
    for (const c of d.cmds) if (c.seq > seen && (!c.screen || c.screen === screen)) run(c);
    seen = top;
  });
  poll(control, PATHS.control, 1000).start();
}
