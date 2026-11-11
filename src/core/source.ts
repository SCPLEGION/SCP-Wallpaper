// A value that changes over time. Subscribers say how often they want it refreshed; the transport that feeds the
// source (data/sources.ts) polls at the fastest requested rate, or not at all when nobody asks.
export type Sub<T> = (v: T | null) => void;

export class Source<T> {
  value: T | null = null;
  readonly subs = new Map<Sub<T>, number>();
  onDemand: (() => void) | null = null;

  set(v: T | null){ this.value = v; for (const f of [...this.subs.keys()]) f(v); }
  /** Subscribe; `every` is the refresh period this subscriber needs in ms (Infinity = whatever others need). */
  on(f: Sub<T>, every = Infinity){
    this.subs.set(f, every); this.onDemand?.();
    return () => { this.subs.delete(f); };
  }
  /** Fastest period any subscriber asked for. */
  get rate(){ let m = Infinity; for (const v of this.subs.values()) m = Math.min(m, v); return m; }
}
