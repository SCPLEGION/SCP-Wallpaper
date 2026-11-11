// Workspaces: this monitor's niri workspaces and the window in focus (scp-wallpaperd's niri feed)
import { niri } from '../data/sources.ts';
import { screen } from '../data/control.ts';
import { esc, patchHtml } from './helpers.ts';
import type { Widget } from './types.ts';

function html(){
  const n = niri.value, outs = n?.outputs || {};
  // Previews have no ?screen=: show the first output so the widget is not empty.
  const o = outs[screen] || (!screen ? Object.values(outs)[0] : undefined);
  if (!o) return '<div class="sys-empty">brak danych · scp-wallpaperd</div>';
  return `<div class="ws">${o.workspaces.map(w => `<span class="${w.active ? 'on' : ''}${w.windows ? '' : ' empty'}"><b>${esc(w.name || w.idx)}</b><i>${w.windows || ''}</i></span>`).join('')}</div>`
    + `<div class="ws-t"><em>${esc(o.app || '—')}</em><span>${esc(o.title)}</span></div>`;
}

export default { id: 'workspaces', name: 'Obszary robocze', x: .42, y: .86, on: false, cls: 'wsw', sources: [niri],
  html, update(el){ patchHtml(el, html()); } } satisfies Widget;
