// SCP Center: active profile, lighting effect and dial mode (scp-wallpaperd's desk feed)
import { desk } from '../data/sources.ts';
import { esc, patchHtml } from './helpers.ts';
import type { Widget } from './types.ts';

const DIAL: Record<string, string> = { lighting: 'efekty', profiles: 'profile', actions: 'własne akcje' };

function html(){
  const c = desk.value?.center;
  if (!c) return '<div class="sys-empty">brak danych · scp-wallpaperd</div>';
  const eff = c.effect ? esc(c.effect.replace(/_/g, ' ')) + (c.brightness != null && c.brightness < 100 ? ` · ${Math.round(c.brightness)}%` : '') : '—';
  return `<div class="srow"><span>profil</span><em>${esc(c.profile || '—')}</em></div>`
    + `<div class="srow"><span>efekt</span><em>${eff}</em></div>`
    + `<div class="srow"><span>pokrętło</span><em class="${c.shift ? 'cc-shift' : ''}">${esc(c.dial ? DIAL[c.dial] || c.dial : '—')}${c.shift ? ' ⇧' : ''}</em></div>`;
}

export default { id: 'center', name: 'SCP Center', x: .52, y: .78, on: true, cls: 'ccw', sources: [desk],
  html, update(el){ patchHtml(el, html()); } } satisfies Widget;
