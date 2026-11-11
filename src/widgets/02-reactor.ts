// Reactor: arc-reactor clock with CPU/RAM/GPU/VRAM gauges
import { clamp, f1 } from '../core/util.ts';
import { rad, arcPath } from '../core/draw.ts';
import { state } from '../app/state.ts';
import { sys } from '../data/sources.ts';
import { pad, gb } from './helpers.ts';
import type { Widget } from './types.ts';

function reactorSvg(){
  const cx = 300, cy = 300, R = [256, 238, 220, 202];
  let h = `<svg class="rx" viewBox="0 0 600 600"><defs><radialGradient id="rxg"><stop offset="0" stop-color="#e6fdff" stop-opacity=".85"/><stop offset=".3" stop-color="currentColor" stop-opacity=".3"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></radialGradient></defs>
    <circle class="rxglow" cx="${cx}" cy="${cy}" r="250" fill="url(#rxg)" opacity=".3"/>
    <circle class="rsp" style="animation-duration:140s" cx="${cx}" cy="${cy}" r="296" fill="none" stroke="currentColor" stroke-opacity=".45" stroke-width="2" stroke-dasharray="1 12"/>`;
  for (let a = 0; a < 60; a++){
    const an = rad(a * 6 - 90), L = a % 5 ? 8 : 16;
    h += `<line class="tk" x1="${f1(cx + 276 * Math.cos(an))}" y1="${f1(cy + 276 * Math.sin(an))}" x2="${f1(cx + (276 + L) * Math.cos(an))}" y2="${f1(cy + (276 + L) * Math.sin(an))}" stroke="currentColor" stroke-width="2" opacity=".3"/>`;
  }
  R.forEach(r => {
    const d = arcPath(cx, cy, r, 135, 405);
    h += `<path d="${d}" pathLength="100" fill="none" stroke="currentColor" stroke-opacity=".14" stroke-width="7"/><path class="gv" d="${d}" pathLength="100" fill="none" stroke="currentColor" stroke-width="7" stroke-dasharray="0 100"/>`;
  });
  h += `<g class="rsp" style="animation-duration:38s;animation-direction:reverse" fill="none" stroke="currentColor" stroke-opacity=".8" stroke-width="4"><path d="${arcPath(cx, cy, 182, 10, 70)}"/><path d="${arcPath(cx, cy, 182, 130, 190)}"/><path d="${arcPath(cx, cy, 182, 250, 310)}"/></g>
    <polygon class="rsp" style="animation-duration:70s" fill="none" stroke="currentColor" stroke-opacity=".5" stroke-width="1.5" points="${[0, 1, 2, 3, 4, 5].map(k => f1(cx + 150 * Math.cos(rad(k * 60))) + ',' + f1(cy + 150 * Math.sin(rad(k * 60)))).join(' ')}"/>
    <circle cx="${cx}" cy="${cy}" r="124" fill="none" stroke="currentColor" stroke-opacity=".3"/>
    <text x="${cx}" y="236" text-anchor="middle" font-family="monospace" font-size="13" letter-spacing="7" fill="currentColor">SCP · CORE</text>
    <text class="rt" x="${cx}" y="320" text-anchor="middle" font-size="86" font-weight="200" fill="#f3f0ea" style="font-variant-numeric:tabular-nums">--:--</text>
    <text class="rs" x="${cx}" y="352" text-anchor="middle" font-family="monospace" font-size="19" letter-spacing="4" fill="currentColor">--</text>
    <text class="rd" x="${cx}" y="380" text-anchor="middle" font-size="14" letter-spacing="1" fill="#f3f0ea" fill-opacity=".6"></text>`;
  for (let i = 0; i < 4; i++) h += `<text class="lg" x="${cx}" y="${cy + 214 + i * 19}" text-anchor="middle" font-family="monospace" font-size="13" letter-spacing="1" fill="#f3f0ea" fill-opacity=".8"></text>`;
  return h + '</svg>';
}

export default { id: 'reactor', name: 'Reaktor', x: .31, y: .15, on: false, cls: 'reactorw', every: 1000, sources: [sys],
  html: () => reactorSvg(),
  update(el, n){
    const s = sys.value;
    let hh = n.getHours(); if (!state.h24) hh = hh % 12 || 12;
    el.querySelector('.rt')!.textContent = `${state.h24 ? pad(hh) : hh}:${pad(n.getMinutes())}`;
    el.querySelector('.rs')!.textContent = pad(n.getSeconds());
    el.querySelector('.rd')!.textContent = n.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });
    const sec = n.getSeconds();
    el.querySelectorAll('.tk').forEach((t, i) => t.setAttribute('opacity', String(i === sec ? 1 : i < sec ? .7 : .22)));
    const vals = s ? [s.cpu, s.mem_total ? s.mem_used / s.mem_total * 100 : 0, s.gpu ?? 0, s.vram_total ? s.vram_used! / s.vram_total * 100 : 0] : [0, 0, 0, 0];
    el.querySelectorAll<SVGPathElement>('.gv').forEach((p, i) => p.style.strokeDasharray = clamp(vals[i], 0, 100).toFixed(1) + ' 100');
    const lg = el.querySelectorAll('.lg');
    lg[0].textContent = s ? `CPU  ${s.cpu.toFixed(0)}%${s.cpu_temp != null ? '  ' + s.cpu_temp.toFixed(0) + '°C' : ''}` : 'brak danych';
    lg[1].textContent = s ? `RAM  ${gb(s.mem_used)}/${gb(s.mem_total)} GB` : '';
    lg[2].textContent = s && s.gpu != null ? `GPU  ${s.gpu}%${s.gpu_temp != null ? '  ' + s.gpu_temp.toFixed(0) + '°C' : ''}` : '';
    lg[3].textContent = s && s.vram_total ? `VRAM ${gb(s.vram_used!)}/${gb(s.vram_total)} GB` : '';
    el.querySelector('.rxglow')!.setAttribute('opacity', (.22 + vals[0] / 100 * .5).toFixed(2));
  } } satisfies Widget;
