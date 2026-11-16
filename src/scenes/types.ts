// The scene contract. A scene is a static description plus mount(); mount() fills `el` and returns the running
// instance, which owns all per-mount state (scene objects themselves are never mutated).
import type { Layout } from '../app/model.ts';

export type Pack = 'klimat' | 'tech' | 'audio' | 'scp';
export interface Geo { cx: number; cy: number; Rc: number }
export interface SceneCtx { el: HTMLElement; seed: number }
export interface SceneRun {
  tick?(t: number, dt: number): void;
  destroy?(): void;
  /** Curved scenes publish the globe each frame; widgets beside it follow the circle. */
  geo?: Geo | null;
  /** Set by canvas scenes: whether this mount uses a CPU canvas (the VRAM guard remounts on a mismatch). */
  soft?: boolean;
}
export interface Scene {
  /** Stable key used in saved state and the CLI; never rename. */
  id: string;
  name: string;
  swatch: string;
  /** Pack (bundle) the scene belongs to: a key of PACKS in scenes/index.ts; groups the menus. */
  pack: Pack;
  accent?: string;
  /** HUD skin for the widgets (body.hud). */
  hud?: boolean;
  /** Widgets left/right of the globe bend along it (needs run.geo). */
  curved?: boolean;
  /** Default widget set and layout, applied the first time the scene is shown. */
  preset?: { on: string[]; layout: Layout };
  mount(ctx: SceneCtx): SceneRun;
}
