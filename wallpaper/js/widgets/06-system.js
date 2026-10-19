// Widget: system
'use strict';

function sysHtml(){
  if (!sys) return '<div class="sys-empty">brak danych · uruchom scp-sysstats</div>';
  const m = sys.mem_total ? sys.mem_used / sys.mem_total * 100 : 0;
  let h = `<div class="srow"><span>CPU</span><em>${sys.cpu.toFixed(0)}%${sys.cpu_temp != null ? ' · ' + sys.cpu_temp.toFixed(0) + '°' : ''}</em></div>${sbar(sys.cpu, sys.cpu > 85)}${spark(hist.cpu, 100)}`;
  h += `<div class="srow"><span>RAM</span><em>${gb(sys.mem_used)} / ${gb(sys.mem_total)} GB</em></div>${sbar(m, m > 90)}`;
  if (sys.gpu != null){
    h += `<div class="srow"><span>GPU</span><em>${sys.gpu}%${sys.gpu_temp != null ? ' · ' + sys.gpu_temp.toFixed(0) + '°' : ''}</em></div>${sbar(sys.gpu, sys.gpu > 90)}`;
    if (sys.vram_total) h += `<div class="srow sm"><span>VRAM</span><em>${gb(sys.vram_used)} / ${gb(sys.vram_total)} GB</em></div>${sbar(sys.vram_used / sys.vram_total * 100, false)}`;
  }
  if (sys.net) h += `<div class="srow"><span>NET ${esc(sys.net.iface)}</span><em>↓ ${rate(sys.net.rx)} · ↑ ${rate(sys.net.tx)}</em></div>${spark(hist.rx, Math.max(1048576, ...hist.rx))}`;
  (sys.disks || []).forEach(d => { const p = d.used / d.total * 100; h += `<div class="srow sm"><span>${esc(d.mount)}</span><em>${(d.used / 1e9).toFixed(0)} / ${(d.total / 1e9).toFixed(0)} GB</em></div>${sbar(p, p > 92)}`; });
  return h + `<div class="srow sm"><span>load ${sys.load.map(v => v.toFixed(1)).join(' ')}</span><em>up ${upt(sys.uptime)}</em></div>`;
}

WIDGETS.push({ id: 'system', name: 'System', x: .76, y: .08, on: true, cls: 'sysw',
  html: () => '<div class="sys-empty">brak danych</div>',
  update(n, el){ el.classList.toggle('stale', !sys || Date.now() - sys.t > 15000); } });
