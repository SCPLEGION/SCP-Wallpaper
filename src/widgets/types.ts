// The widget contract. Definitions are static; the dashboard owns the DOM boxes.
import type { Source } from '../core/source.ts';

export interface Widget {
  /** Stable key used in saved layouts; never rename. */
  id: string;
  name: string;
  /** Default position (fractions of the viewport) and visibility. */
  x: number; y: number; on: boolean;
  cls?: string;
  html(): string;
  init?(el: HTMLElement): void;
  update?(el: HTMLElement, now: Date): void;
  /** Call update() on this period (ms), e.g. clocks. */
  every?: number;
  /** Call update() whenever one of these changes. */
  sources?: Source<any>[];
}
