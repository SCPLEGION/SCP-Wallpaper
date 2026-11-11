// System: CPU, RAM, GPU, network, disks
import { sys, hist } from '../data/sources.ts';
import { esc, gb, rate, upt, sbar, spark, patchHtml } from './helpers.ts';
import type { Widget } from './types.ts';

function sysHtml(){
  const s = sys.value;
  if (!s) return '<div class="sys-empty">brak danych · uruchom scp-wallpaperd</div>';
  const m = s.mem_total ? s.mem_used / s.mem_total * 100 : 0;
  let h = `<div class="srow"><span>CPU</span><em>${s.cpu.toFixed(0)}%${s.cpu_temp != null ? ' · ' + s.cpu_temp.toFixed(0) + '°' : ''}</em></div>${sbar(s.cpu, s.cpu > 85)}${spark(hist.cpu, 100)}`;
  h += `<div class="srow"><span>RAM</span><em>${gb(s.mem_used)} / ${gb(s.mem_total)} GB</em></div>${sbar(m, m > 90)}`;
  if (s.gpu != null){
    h += `<div class="srow"><span>GPU</span><em>${s.gpu}%${s.gpu_temp != null ? ' · ' + s.gpu_temp.toFixed(0) + '°' : ''}</em></div>${sbar(s.gpu, s.gpu > 90)}`;
    if (s.vram_total) h += `<div class="srow sm"><span>VRAM</span><em>${gb(s.vram_used!)} / ${gb(s.vram_total)} GB</em></div>${sbar(s.vram_used! / s.vram_total * 100, false)}`;
  }
  if (s.net) h += `<div class="srow"><span>NET ${esc(s.net.iface)}</span><em>↓ ${rate(s.net.rx)} · ↑ ${rate(s.net.tx)}</em></div>${spark(hist.rx, Math.max(1048576, ...hist.rx))}`;
  (s.disks || []).forEach(d => { const p = d.used / d.total * 100; h += `<div class="srow sm"><span>${esc(d.mount)}</span><em>${(d.used / 1e9).toFixed(0)} / ${(d.total / 1e9).toFixed(0)} GB</em></div>${sbar(p, p > 92)}`; });
  return h + `<div class="srow sm"><span>load ${s.load.map(v => v.toFixed(1)).join(' ')}</span><em>up ${upt(s.uptime)}</em></div>`;
}

export default { id: 'system', name: 'System', x: .76, y: .08, on: true, cls: 'sysw', sources: [sys], every: 5000,
  html: () => '<div class="sys-empty">brak danych</div>',
  update(el){ patchHtml(el, sysHtml()); el.classList.toggle('stale', !sys.value || Date.now() - sys.value.t > 15000); } } satisfies Widget;
