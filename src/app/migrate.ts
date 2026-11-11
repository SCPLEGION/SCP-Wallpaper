// Turns whatever is in storage into a valid State. Pure (no DOM) so test/ can run it under node.
import type { State } from './model.ts';

export interface SceneRef { id: string; name: string }

export function defaults(scenes: SceneRef[], now = new Date()): State {
  return { v: 2, scene: scenes[0].id, seed: (Math.random() * 1e9) | 0, dash: true, auto: 0, layout: {}, widgets: {}, sc: {}, scSeen: {}, slots: {}, slot: -1,
    h24: true, secs: true, dscale: 100, wbg: 'scrim', tab: 'p1', todo: [], pomo: null, cd: { label: 'Nowy Rok', date: (now.getFullYear() + 1) + '-01-01' } };
}

/**
 * v1 ("minwall", before the TypeScript port): `scene` was the index in menu order and per-scene keys (`sc`, `scSeen`)
 * were the Polish display names. v2 keys everything by scene id. Unknown keys are dropped, missing ones defaulted.
 */
export function migrate(raw: unknown, scenes: SceneRef[]): State {
  const d = defaults(scenes);
  if (!raw || typeof raw !== 'object') return d;
  const o = { ...(raw as Record<string, any>) };
  if (o.v !== 2){
    const byName = new Map(scenes.map(s => [s.name, s.id]));
    const rekey = (m: unknown) => {
      const out: Record<string, any> = {};
      if (m && typeof m === 'object') for (const [k, v] of Object.entries(m)) out[byName.get(k) ?? k] = v;
      return out;
    };
    if (typeof o.scene === 'number') o.scene = scenes[((o.scene % scenes.length) + scenes.length) % scenes.length].id;
    o.sc = rekey(o.sc); o.scSeen = rekey(o.scSeen);
  }
  const s = { ...d } as Record<string, any>;
  for (const k of Object.keys(d)) if (o[k] !== undefined && typeof o[k] === typeof (d as any)[k] || (k === 'pomo' && o[k])) s[k] = o[k];
  if (!scenes.some(x => x.id === s.scene)) s.scene = d.scene;
  if (!['none', 'scrim', 'glass'].includes(s.wbg)) s.wbg = d.wbg;
  if (s.tab !== 'p2') s.tab = 'p1';
  if (!Array.isArray(s.todo)) s.todo = [];
  s.v = 2;
  return s as State;
}
