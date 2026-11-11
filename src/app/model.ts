// Shape of the saved page state (localStorage "scp-wallpaper", see docs/STATE.md). Pure types, no DOM.
export interface Pos { x: number; y: number; s: number }
export type Layout = Record<string, Pos>;
export interface Cfg { layout: Layout; widgets: Record<string, boolean> }
export type Wbg = 'none' | 'scrim' | 'glass';
/** Widget/menu look. 'scene' = whatever the scene asks for (HUD on the Dashboard scene, minimal elsewhere). */
export type Theme = 'scene' | 'minimal' | 'console' | 'dossier' | 'scipnet' | 'breach' | 'o5';
export const THEMES: Theme[] = ['scene', 'minimal', 'console', 'dossier', 'scipnet', 'breach', 'o5'];
/** Skins that draw widgets as cards (no curved layout around a globe). */
export const CARD_THEMES: Theme[] = ['dossier', 'scipnet', 'breach', 'o5'];
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
  dscale: number; wbg: Wbg; theme: Theme;
  tab: 'p1' | 'p2';
  todo: { t: string; done: boolean }[];
  pomo: Pomo | null;
  cd: { label: string; date: string };
  rates: Record<string, number>; // per-widget refresh period in ms (missing = the widget's default)
}

/** Refresh periods offered in each widget's settings, ms. */
export const RATES = [250, 500, 1000, 2000, 5000, 10000, 30000, 60000];

export const STATE_KEY = 'scp-wallpaper';
export const LEGACY_KEY = 'minwall';
