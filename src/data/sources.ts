// Live data the scenes and widgets read. Each is a Source fed by polling a JSON file under ~/.cache/scp-center/
// (or pushed by scp-wallpaperd, see data/push.ts).
import { PATHS } from '../core/config.ts';
import { Source } from '../core/source.ts';
import { xhr } from '../core/xhr.ts';

export interface SysStats {
  t: number; cpu: number; cpu_temp?: number | null; mem_used: number; mem_total: number;
  gpu?: number | null; gpu_temp?: number | null; vram_used?: number; vram_total?: number;
  load: number[]; uptime: number; net?: { iface: string; rx: number; tx: number } | null;
  disks?: { mount: string; used: number; total: number }[];
}
export interface UsageWindow { used_percentage?: number; resets_at?: string }
export interface Usage { updated_at: string; five_hour?: UsageWindow; seven_day?: UsageWindow }
export interface NowPlaying { t: number; status: 'playing' | 'paused' | 'none'; player: string; title: string; artist: string; album: string; art?: string; position: number; length: number }
export interface AudioFrame { t: number; b: number[] }
export interface NiriOutput { workspaces: { idx: number; name: string | null; active: boolean; windows: number }[]; title: string; app: string }
export interface Niri { t: number; outputs: Record<string, NiriOutput> }

export const sys = new Source<SysStats>();
export const usage = new Source<Usage>();
export const np = new Source<NowPlaying>();
export const audio = new Source<AudioFrame>();
export const niri = new Source<Niri>();

/** The last 60 CPU % and download-rate samples, for the sparklines. */
export const hist = { cpu: [] as number[], rx: [] as number[] };
sys.on(d => {
  if (!d) return;
  hist.cpu.push(d.cpu); if (d.net) hist.rx.push(d.net.rx);
  hist.cpu = hist.cpu.slice(-60); hist.rx = hist.rx.slice(-60);
});

/** Poll `url` into `src` every min(base, fastest subscriber) ms; stops while that is Infinity. */
export function poll<T>(src: Source<T>, url: string, base = Infinity){
  let timer = 0, busy = false, paused = false;
  const period = () => paused ? Infinity : Math.min(base, src.rate);
  const run = () => {
    timer = 0; if (!isFinite(period())) return;
    busy = true; xhr<T>(url, d => { busy = false; src.set(d); schedule(); });
  };
  const schedule = () => { if (timer || busy) return; const p = period(); if (isFinite(p)) timer = window.setTimeout(run, p); };
  src.onDemand = () => { if (!timer && !busy) run(); };
  return {
    start: run,
    /** Pushed data replaces polling while a push connection is up. */
    pause(on: boolean){ paused = on; if (!on) src.onDemand!(); else if (timer){ clearTimeout(timer); timer = 0; } },
  };
}

export const pollers = {
  sys: poll(sys, PATHS.sys, 2000),
  usage: poll(usage, PATHS.usage, 20000),
  np: poll(np, PATHS.nowplaying, 1000),
  audio: poll(audio, PATHS.audio),        // only while a scene subscribes
  niri: poll(niri, PATHS.niri, 1000),
};
export const startSources = () => { pollers.sys.start(); pollers.usage.start(); pollers.np.start(); pollers.niri.start(); };
