// Shape of the saved page state (localStorage "scp-wallpaper", see docs/STATE.md). Pure types, no DOM.
export interface Pos { x: number; y: number; s: number }
export type Layout = Record<string, Pos>;
export interface Cfg { layout: Layout; widgets: Record<string, boolean> }
export type Wbg = 'none' | 'scrim' | 'glass';
export interface Slot extends Cfg { dscale: number; wbg: Wbg; h24: boolean; secs: boolean }
export interface Pomo { mode: 'focus' | 'break'; run: boolean; endAt: number; left: number }

export interface State extends Cfg {
  v: 2;
  scene: string;            // scene id
  seed: number;
  dash: boolean;
  auto: number;             // auto-rotate minutes, 0 = off
  sc: Record<string, Cfg>;  // per-scene overrides, keyed by scene id
  scSeen: Record<string, boolean>;
  slots: Record<number, Slot>;
  slot: number;
  h24: boolean; secs: boolean;
  dscale: number; wbg: Wbg;
  tab: 'p1' | 'p2';
  todo: { t: string; done: boolean }[];
  pomo: Pomo | null;
  cd: { label: string; date: string };
}

export const STATE_KEY = 'scp-wallpaper';
export const LEGACY_KEY = 'minwall';
