// Claude Code: 5 h / 7 d usage (usage-saver's snapshot), live sessions and the saver tier (scp-wallpaperd's desk feed)
import { desk, type UsageWindow } from '../data/sources.ts';
import { patchHtml } from './helpers.ts';
import type { Widget } from './types.ts';

const STALE = 15 * 60000;

function left(w: UsageWindow){
  if (!w.resets_at) return '';
  const m = Math.round((Date.parse(w.resets_at) - Date.now()) / 60000), d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60);
  return m <= 0 ? 'reset' : d ? `${d}d ${h}h` : h ? `${h}h ${m % 60}m` : `${m}m`;
}

function bar(label: string, w: UsageWindow | null | undefined, reset: boolean){
  // A window whose reset time has passed since the snapshot is back at 0 %.
  const pct = w && typeof w.used_percentage === 'number' ? (reset && w.resets_at && Date.parse(w.resets_at) < Date.now() ? 0 : w.used_percentage) : null;
  const ct = pct === null ? '–' : Math.round(pct) + '%' + (w && left(w) ? ' · ' + left(w) : '');
  return `<div class="bar"><span><em>${label}</em><em class="ct">${ct}</em></span><i><b class="${pct !== null && pct >= 80 ? 'hot' : ''}" style="width:${pct ?? 0}%"></b></i></div>`;
}

function ago(ms: number){
  const m = Math.round(ms / 60000);
  return m < 60 ? `${m} min` : m < 2880 ? `${Math.round(m / 60)} h` : `${Math.round(m / 1440)} d`;
}

function foot(){
  const c = desk.value?.claude, u = c?.usage, ss = c?.sessions || [];
  const work = ss.filter(s => s.state === 'working').length, wait = ss.filter(s => s.state === 'waiting').length;
  const parts: string[] = [];
  if (!ss.length) parts.push('<span>brak sesji</span>');
  else {
    if (work) parts.push(`<span class="cl-work">● pracuje${work > 1 ? ' ×' + work : ''}</span>`);
    if (wait) parts.push(`<span class="cl-wait">● czeka${wait > 1 ? ' ×' + wait : ''}</span>`);
    if (ss.length > work + wait) parts.push(`<span>${ss.length - work - wait} bezczynn${ss.length - work - wait > 1 ? 'e' : 'a'}</span>`);
  }
  if (u?.tier) parts.push(`<span class="cl-tier ${u.tier}">saver ${u.tier}</span>`);
  if (u && Date.now() - Date.parse(u.updated_at) > STALE) parts.push(`<span>dane sprzed ${ago(Date.now() - Date.parse(u.updated_at))}</span>`);
  return `<div class="cl-foot">${parts.join('')}</div>`;
}

function html(){
  const u = desk.value?.claude.usage;
  return `<div class="bars">${bar('claude · 5h', u?.five_hour, true)}${bar('claude · 7d', u?.seven_day, true)}</div>${foot()}`;
}

export default { id: 'claude', name: 'Użycie Claude', x: .06, y: .74, on: true, every: 30000, sources: [desk],
  html,
  update(el){
    const u = desk.value?.claude.usage;
    el.classList.toggle('stale', !u || !(Date.now() - Date.parse(u.updated_at) < STALE));
    patchHtml(el, html());
  } } satisfies Widget;
