// Network: live map of the home servers (scp-wallpaperd probes them into servers.json). Hover a node for its
// details, click to pin the card; a ping wave sweeps out from the gateway on every scan.
import { cvInit } from '../core/draw.ts';
import { servers, type ServerNode } from '../data/sources.ts';
import type { Scene } from './types.ts';

const UP = '77,255,184', DOWN = '255,77,94', DIM = '140,170,160';
type P = { n: ServerNode; x: number; y: number; r: number; hist: number[] };

const ago = (s: number) => { const d = Math.max(0, Date.now() / 1000 - s); return d < 90 ? `${Math.round(d)} s` : d < 5400 ? `${Math.round(d / 60)} min` : d < 172800 ? `${Math.round(d / 3600)} h` : `${Math.round(d / 86400)} d`; };

export default {
  id: 'infra', pack: 'scp', name: 'Sieć ośrodka', accent: '#4dffb8',
  swatch: 'radial-gradient(circle at 50% 45%,#4dffb8 0 3%,transparent 4%),radial-gradient(circle at 28% 55%,#4dffb8aa 0 2%,transparent 3%),radial-gradient(circle at 72% 55%,#4dffb8aa 0 2%,transparent 3%),linear-gradient(#030a08,#06140f)',
  mount({ el }){
    el.innerHTML = '<canvas></canvas>';
    const cv = cvInit(el, .9), { g, w, h } = cv, M = Math.min(w, h);
    cv.c.style.background = 'radial-gradient(ellipse at 50% 45%,#08201a 0,#040d0a 55%,#020605 100%)';
    let nodes: P[] = [], byId = new Map<string, P>(), stamp = 0, wave = -1, hover: P | null = null, pin: P | null = null;

    // gateway(s) in the middle, other net nodes above it, hosts in a row, containers on an arc under their host
    const layout = (list: ServerNode[]) => {
      const old = byId; byId = new Map(); nodes = [];
      const roots = list.filter(n => !n.parent || !list.some(m => m.id === n.parent));
      const hosts = list.filter(n => n.kind === 'host' && !roots.includes(n));
      const nets = list.filter(n => n.kind !== 'host' && !roots.includes(n) && roots.some(r => r.id === n.parent));
      const put = (n: ServerNode, x: number, y: number, r: number) => {
        const p: P = { n, x, y, r, hist: old.get(n.id)?.hist ?? [] }; nodes.push(p); byId.set(n.id, p);
      };
      roots.forEach((n, i) => put(n, w * (.5 + (i - (roots.length - 1) / 2) * .08), h * .4, M * .028));
      nets.forEach((n, i) => put(n, w * (.5 + (i - (nets.length - 1) / 2) * .12), h * .17, M * .016));
      hosts.forEach((n, i) => put(n, w * (.5 + (i - (hosts.length - 1) / 2) * Math.min(.34, .9 / hosts.length)), h * .52, M * .024));
      for (const n of list) if (!byId.has(n.id)){
        const par = byId.get(n.parent!) ?? nodes[0];
        const sib = list.filter(m => m.parent === n.parent && !roots.includes(m) && !hosts.includes(m) && !nets.includes(m));
        const k = sib.indexOf(n), cnt = sib.length, R = M * .22, a = Math.PI * (.12 + .76 * (cnt > 1 ? k / (cnt - 1) : .5));
        put(n, (par?.x ?? w / 2) + Math.cos(a) * R * 1.15, (par?.y ?? h / 2) + Math.sin(a) * R, M * .012);
      }
      if (pin) pin = byId.get(pin.n.id) ?? null;
    };
    const off = servers.on(d => {
      if (!d || !d.nodes || d.t === stamp) return;
      const ids = d.nodes.map(n => n.id + n.parent).join();
      if (ids !== nodes.map(p => p.n.id + p.n.parent).join()) layout(d.nodes);
      for (const n of d.nodes){ const p = byId.get(n.id); if (!p) continue; p.n = n; p.hist.push(n.up ? n.ms ?? 0 : -1); if (p.hist.length > 40) p.hist.shift(); }
      stamp = d.t; wave = 0;
    }, 5000);

    const hit = (x: number, y: number) => nodes.find(p => Math.hypot(p.x - x, p.y - y) < Math.max(p.r * 1.8, 14)) ?? null;
    const ignore = (e: Event) => document.body.classList.contains('menu-open') || document.body.classList.contains('editing') || !!(e.target as HTMLElement).closest?.('.w,#menu,#menubtn');
    const move = (e: MouseEvent) => {
      hover = ignore(e) ? null : hit(e.clientX, e.clientY); el.style.cursor = hover ? 'pointer' : '';
    };
    // capture on window runs before the page's "click = next scene" handler, so a node click stays here
    const click = (e: MouseEvent) => {
      if (ignore(e)) return;
      const p = hit(e.clientX, e.clientY);
      if (p){ pin = pin === p ? null : p; e.stopPropagation(); }
      else if (pin){ pin = null; e.stopPropagation(); }
    };
    addEventListener('mousemove', move, true); addEventListener('click', click, true);

    const link = (a: P, b: P, t: number, sel: boolean) => {
      const ok = a.n.up && b.n.up, col = ok ? UP : DOWN;
      g.strokeStyle = `rgba(${col},${sel ? .7 : ok ? .22 : .35})`; g.lineWidth = sel ? 2 : 1;
      g.setLineDash(ok ? [] : [4, 6]); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); g.setLineDash([]);
      if (!ok) return;
      // packets: faster on low latency, one each way
      const sp = .25 + 1.2 / (1 + (b.n.ms ?? 5) / 8), L = Math.hypot(b.x - a.x, b.y - a.y);
      for (const [o, dir] of [[0, 1], [.5, -1]] as const){
        let u = ((t * sp * 220 / L) + o + (b.x + b.y) * .001) % 1; if (dir < 0) u = 1 - u;
        g.fillStyle = `rgba(${UP},.9)`; g.beginPath(); g.arc(a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u, sel ? 2.6 : 1.8, 0, Math.PI * 2); g.fill();
      }
    };

    const card = (p: P, pinned: boolean) => {
      const n = p.n, lines = [
        n.role || n.kind,
        `${n.host}${n.port ? ':' + n.port : ' · ping'}`,
        n.up ? `online · ${n.ms ?? '?'} ms · od ${ago(n.since)}` : `OFFLINE · od ${ago(n.since)}`,
      ];
      const cw = 230, ch = 112, x = Math.min(w - cw - 16, p.x + p.r + 18), y = Math.max(16, Math.min(h - ch - 16, p.y - ch / 2));
      g.fillStyle = 'rgba(3,14,11,.88)'; g.fillRect(x, y, cw, ch);
      g.strokeStyle = `rgba(${n.up ? UP : DOWN},${pinned ? .9 : .5})`; g.lineWidth = 1; g.strokeRect(x + .5, y + .5, cw - 1, ch - 1);
      g.fillStyle = `rgba(${n.up ? UP : DOWN},1)`; g.font = 'bold 14px monospace'; g.fillText(n.name.toUpperCase(), x + 12, y + 22);
      g.font = '10px monospace'; g.fillStyle = `rgba(${DIM},.8)`; g.fillText(pinned ? '◆ PRZYPIĘTE' : n.kind.toUpperCase(), x + cw - 82, y + 22);
      g.font = '12px monospace'; g.fillStyle = 'rgba(220,255,240,.85)';
      lines.forEach((l, i) => g.fillText(l, x + 12, y + 42 + i * 16));
      // latency history: bars, red where the probe failed
      const hs = p.hist, mxv = Math.max(4, ...hs), bw = (cw - 24) / 40;
      hs.forEach((v, i) => {
        const bh = v < 0 ? 14 : 2 + v / mxv * 12;
        g.fillStyle = v < 0 ? `rgba(${DOWN},.8)` : `rgba(${UP},.55)`; g.fillRect(x + 12 + i * bw, y + ch - 8 - bh, bw - 1, bh);
      });
    };

    return {
      soft: cv.soft,
      destroy(){ off(); removeEventListener('mousemove', move, true); removeEventListener('click', click, true); el.style.cursor = ''; },
      tick(t, dt){
        g.clearRect(0, 0, w, h);
        // faint grid
        g.strokeStyle = `rgba(${UP},.035)`; g.lineWidth = 1; g.beginPath();
        for (let x = (w / 2) % 48; x < w; x += 48){ g.moveTo(x, 0); g.lineTo(x, h); }
        for (let y = (h * .4) % 48; y < h; y += 48){ g.moveTo(0, y); g.lineTo(w, y); }
        g.stroke();

        const live = stamp && Date.now() / 1000 - stamp < 60;
        g.font = '11px monospace'; g.fillStyle = `rgba(${UP},.55)`;
        g.fillText('SCiPNET // MAPA SIECI OŚRODKA', 28, 34);
        if (!nodes.length || !live){
          g.fillStyle = `rgba(${DOWN},.7)`; g.textAlign = 'center';
          g.fillText(nodes.length ? 'dane nieaktualne · scp-wallpaperd (servers)' : 'brak danych · scp-wallpaperd (servers)', w / 2, h * .4);
          g.textAlign = 'start'; if (!nodes.length) return;
        } else {
          const on = nodes.filter(p => p.n.up).length;
          g.fillStyle = on === nodes.length ? `rgba(${UP},.8)` : `rgba(${DOWN},.9)`;
          g.fillText(`${on}/${nodes.length} ONLINE · skan ${ago(stamp)} temu`, 28, 52);
        }

        // ping wave from the gateway after each scan
        if (wave >= 0){
          wave += dt; const R = wave * M * .9, root = nodes[0];
          g.strokeStyle = `rgba(${UP},${Math.max(0, .25 - wave * .15).toFixed(3)})`; g.lineWidth = 1.5;
          g.beginPath(); g.arc(root.x, root.y, R, 0, Math.PI * 2); g.stroke();
          if (wave > 1.7) wave = -1;
        }

        const focus = pin ?? hover, chain = new Set<string>();
        for (let p = focus; p; p = p.n.parent ? byId.get(p.n.parent) ?? null : null){ if (chain.has(p.n.id)) break; chain.add(p.n.id); }
        for (const p of nodes){ const par = p.n.parent ? byId.get(p.n.parent) : null; if (par) link(par, p, t, chain.has(p.n.id)); }

        for (const p of nodes){
          const { n } = p, col = n.up ? UP : DOWN, f = chain.has(n.id), blink = n.up ? 1 : .5 + .5 * Math.sin(t * 5);
          const R = p.r * (f ? 1.25 : 1);
          const gl = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, R * 3.2);
          gl.addColorStop(0, `rgba(${col},${(.25 * blink).toFixed(3)})`); gl.addColorStop(1, `rgba(${col},0)`);
          g.fillStyle = gl; g.fillRect(p.x - R * 3.2, p.y - R * 3.2, R * 6.4, R * 6.4);
          g.fillStyle = 'rgba(3,14,11,.95)'; g.beginPath(); g.arc(p.x, p.y, R, 0, Math.PI * 2); g.fill();
          g.strokeStyle = `rgba(${col},${(.9 * blink).toFixed(3)})`; g.lineWidth = n.kind === 'ct' ? 1.2 : 2; g.stroke();
          if (n.kind !== 'ct'){
            // slow rotating tick ring on hosts and gateways
            g.setLineDash([2, 5]); g.beginPath(); g.arc(p.x, p.y, R * 1.5, t * .3, t * .3 + Math.PI * 2); g.strokeStyle = `rgba(${col},.35)`; g.stroke(); g.setLineDash([]);
          }
          g.fillStyle = `rgba(${col},${blink.toFixed(3)})`; g.beginPath(); g.arc(p.x, p.y, R * .35, 0, Math.PI * 2); g.fill();
          g.textAlign = 'center'; g.font = `${n.kind === 'ct' ? 10 : 12}px monospace`;
          g.fillStyle = f ? 'rgba(230,255,245,.95)' : `rgba(${n.up ? DIM : DOWN},.8)`;
          const ly = p.y + R * (n.kind === 'ct' ? 1 : 1.5) + 14;
          g.fillText(n.name, p.x, ly);
          if (!n.up){ g.fillStyle = `rgba(${DOWN},${blink.toFixed(3)})`; g.font = 'bold 9px monospace'; g.fillText('OFFLINE', p.x, ly + 12); }
          g.textAlign = 'start';
        }
        if (hover && hover !== pin) card(hover, false);
        if (pin) card(pin, true);
      },
    };
  },
} satisfies Scene;
